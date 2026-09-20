// Only dispatcher-authenticated identity headers are accepted; never request body identities.
async function identity(request){
 const email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 const id=request.headers.get('oai-authenticated-user-id')?.trim();
 if(!email&&!id)return null;
 const subject=email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'email:'+email:id?'id:'+id:null;
 if(!subject)return null;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(subject));
 const key='account:'+Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
 return {key,email:email||'',owner:email==='amirelshahbour@gmail.com'};
}
