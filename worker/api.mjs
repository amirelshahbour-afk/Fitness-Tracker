const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
export async function api(request,env){
 const account=await identity(request);
 let user=account?.key;
 if(!user)return json({error:'sign_in_required'},401);
 if(request.headers.get('x-fitness-account')!==user)return json({error:'account_changed'},401);
 const url=new URL(request.url);
 if(url.pathname==='/api/source-history'&&request.method!=='GET')return json({error:'method_not_allowed'},405);
 if(url.pathname==='/api/source-history')return account.owner?json({measurements:ownerHistory}):json({error:'forbidden'},403);
 if(url.pathname==='/api/food-photo'||url.pathname==='/api/inbody-photo')return foodPhoto(request,env,user);
 if(url.pathname==='/api/profiles'){
  if(request.method==='GET'){
   const rows=await env.DB.prepare('SELECT id,name FROM family_profiles WHERE owner_id = ? ORDER BY created_at').bind(user).all();
   return json({profiles:[{id:'default',name:'ملفي الشخصي'},...rows.results]});
  }
  if(!['POST','PATCH'].includes(request.method))return json({error:'method_not_allowed'},405);
  if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'forbidden_origin'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'json_required'},415);
  const text=await request.text();if(text.length>2000)return json({error:'too_large'},413);
  let body;try{body=JSON.parse(text)}catch{return json({error:'invalid_json'},400)}
  if(typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>60)return json({error:'invalid_name'},400);
  if(request.method==='PATCH'){
   const result=await env.DB.prepare('UPDATE family_profiles SET name = ? WHERE id = ? AND owner_id = ?').bind(body.name.trim(),body.id,user).run();
   return result.meta.changes?json({updated:true}):json({error:'not_found'},404);
  }
  const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM family_profiles WHERE owner_id = ?').bind(user).first();
  if(count.n>=30)return json({error:'profile_limit'},400);
  const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO family_profiles (id,owner_id,name,created_at) VALUES (?,?,?,?)').bind(id,user,body.name.trim(),new Date().toISOString()).run();
  return json({id,name:body.name.trim()},201);
 }
 const profile=url.searchParams.get('profile')||'default';
 if(profile!=='default'){
  const own=await env.DB.prepare('SELECT id FROM family_profiles WHERE id = ? AND owner_id = ?').bind(profile,user).first();
  if(!own)return json({error:'profile_not_found'},403);
  user=user+':profile:'+profile;
 }
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
