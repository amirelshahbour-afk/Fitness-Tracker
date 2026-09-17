const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
const sameOrigin=request=>{const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin};
const measurementSchema={type:'object',additionalProperties:false,required:['date','weight','bmi','bfr','fatMass','muscleWeight','water','bmr','visceralFat','leanWeight','confidence','warnings'],properties:{date:{type:['string','null']},weight:{type:['number','null']},bmi:{type:['number','null']},bfr:{type:['number','null']},fatMass:{type:['number','null']},muscleWeight:{type:['number','null']},water:{type:['number','null']},bmr:{type:['number','null']},visceralFat:{type:['number','null']},leanWeight:{type:['number','null']},confidence:{type:'string',enum:['high','medium','low']},warnings:{type:'array',items:{type:'string'}}}};
async function readInBody(request,env){
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!sameOrigin(request))return json({error:'forbidden_origin'},403);
 if(!env.OPENAI_API_KEY)return json({error:'openai_not_configured'},503);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'json_required'},415);
 const text=await request.text();if(text.length>18000000)return json({error:'image_too_large'},413);
 let body;try{body=JSON.parse(text)}catch{return json({error:'invalid_json'},400)}
 const image=body?.image;if(typeof image!=='string'||!/^data:image\/(jpeg|jpg|png|webp|heic|heif);base64,/i.test(image))return json({error:'invalid_image'},400);
 const prompt='Read this InBody/body-composition report carefully. Extract only values visibly present in the report. Never guess. Return date as YYYY-MM-DD when clearly readable, otherwise null. Map: weight=body weight kg; bmi=BMI; bfr=percent body fat/PBF; fatMass=body fat mass kg; muscleWeight=skeletal muscle mass/SMM kg (not total lean mass); water=total body water percentage only if explicitly shown as a percentage, otherwise null; bmr=basal metabolic rate kcal; visceralFat=visceral fat level/area number only when explicitly labeled; leanWeight=fat-free mass/lean body mass kg. If a field is absent or unclear use null. Warnings should briefly identify unclear or possibly mismatched fields. This is transcription, not medical diagnosis.';
 let response;
 try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'authorization':`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',store:false,input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:image,detail:'high'}]}],text:{format:{type:'json_schema',name:'inbody_measurement',strict:true,schema:measurementSchema}}})})}catch{return json({error:'vision_unavailable',message:'تعذر الاتصال بخدمة قراءة الصورة.'},502)}
 const raw=await response.json().catch(()=>({}));if(!response.ok)return json({error:'vision_failed',message:'تعذر تحليل الصورة حاليًا.',detail:raw?.error?.code||null},502);
 const outputText=(raw.output||[]).flatMap(item=>item.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
 let parsed;try{parsed=JSON.parse(outputText)}catch{return json({error:'invalid_model_output',message:'تمت قراءة الصورة لكن تعذر تحويل النتائج إلى حقول.'},502)}
 const measurement=Object.fromEntries(['date','weight','bmi','bfr','fatMass','muscleWeight','water','bmr','visceralFat','leanWeight'].map(k=>[k,parsed[k]??null]));
 return json({measurement,confidence:parsed.confidence||'low',warnings:Array.isArray(parsed.warnings)?parsed.warnings:[]});
}
export async function api(request,env){
 const user=request.headers.get('oai-authenticated-user-id');if(!user)return json({error:'sign_in_required'},401);
 const path=new URL(request.url).pathname;if(path==='/api/inbody-read')return readInBody(request,env);if(path!=='/api/fitness-state')return json({error:'not_found'},404);
 if(request.method==='GET'){const row=await env.DB.prepare('SELECT payload, revision FROM fitness_state WHERE user_id = ?').bind(user).first();return json({data:row?JSON.parse(row.payload):null,revision:row?.revision??0});}
 if(request.method!=='PUT')return json({error:'method_not_allowed'},405);
 if(!sameOrigin(request))return json({error:'forbidden_origin'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'json_required'},415);
 const text=await request.text();if(text.length>900000)return json({error:'data_too_large'},413);
 let body;try{body=JSON.parse(text)}catch{return json({error:'invalid_json'},400)}
 const {data,revision}=body;if(!Number.isSafeInteger(revision)||revision<0||!data||typeof data!=='object'||!['meals','water','walking','workouts','measurements'].every(k=>Array.isArray(data[k])&&data[k].every(r=>r&&typeof r.id==='string'&&typeof r.date==='string'))||!data.targets||!data.dayNotes)return json({error:'invalid_data'},400);
 const payload=JSON.stringify(data),now=new Date().toISOString();let result;if(revision===0){result=await env.DB.prepare('INSERT INTO fitness_state (user_id,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING').bind(user,payload,now).run()}else{result=await env.DB.prepare('UPDATE fitness_state SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(payload,now,user,revision).run()}if(result.meta.changes!==1)return json({error:'revision_conflict'},409);return json({revision:revision+1});
}
