const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
export async function api(request,env){
 const user=request.headers.get('oai-authenticated-user-id');
 if(!user)return json({error:'sign_in_required'},401);
 if(request.method==='GET'){
 const row=await env.DB.prepare('SELECT payload, revision FROM fitness_state WHERE user_id = ?').bind(user).first();
 return json({data:row?JSON.parse(row.payload):null,revision:row?.revision??0});
 }
 if(request.method!=='PUT')return json({error:'method_not_allowed'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'forbidden_origin'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'json_required'},415);
 const text=await request.text();if(text.length>900000)return json({error:'data_too_large'},413);
 let body;try{body=JSON.parse(text)}catch{return json({error:'invalid_json'},400)}
 const {data,revision}=body;
 if(!Number.isSafeInteger(revision)||revision<0||!data||typeof data!=='object'||!['meals','water','walking','workouts','measurements'].every(k=>Array.isArray(data[k])&&data[k].every(r=>r&&typeof r.id==='string'&&typeof r.date==='string'))||!data.targets||!data.dayNotes)return json({error:'invalid_data'},400);
 const payload=JSON.stringify(data),now=new Date().toISOString();let result;
 if(revision===0){result=await env.DB.prepare('INSERT INTO fitness_state (user_id,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING').bind(user,payload,now).run()}
 else{result=await env.DB.prepare('UPDATE fitness_state SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(payload,now,user,revision).run()}
 if(result.meta.changes!==1)return json({error:'revision_conflict'},409);
 return json({revision:revision+1});
}
