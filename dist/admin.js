// Count authenticated accounts only; passive sync polling is not user activity.
let lastPresence=0,presenceBusy=false;
async function recordPresence(){
 if(document.hidden||presenceBusy||Date.now()-lastPresence<60000)return;
 presenceBusy=true;lastPresence=Date.now();
 try{await fetch('/api/presence',{method:'POST',credentials:'same-origin',headers:{'x-fitness-account':accountScope}})}catch{}finally{presenceBusy=false}
}
document.addEventListener('pointerdown',recordPresence,{passive:true});
document.addEventListener('keydown',recordPresence);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)recordPresence()});
const presenceReady=recordPresence();
let adminResult=null,adminError='',adminBusy=false,adminPage=1;
const adminDate=value=>new Intl.DateTimeFormat('ar-EG',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
function adminPanel(){
 if(!window.fitnessAccount?.owner)return '';
 const d=adminResult;
 return `<div class="card" id="users-admin"><div class="card-head"><div><h2>إدارة المستخدمين</h2><p class="sub">تظهر هذه اللوحة لمالك التطبيق فقط.</p></div><button class="button secondary" data-users-page="${adminPage}" ${adminBusy?'disabled':''}>${adminBusy?'جارٍ التحميل…':'تحديث القائمة'}</button></div><p class="notice">نعدّ الحسابات التي فتحت التطبيق فعليًا منذ تفعيل هذه الميزة. ملفات العائلة التابعة والدعوات غير المستخدمة لا تُحسب. الأوقات حسب توقيت جهازك؛ آخر نشاط يعني فتح التطبيق أو التفاعل معه، وليس دليلًا على الاتصال الآن.</p><div role="status" aria-live="polite">${adminError?`<p class="danger">${esc(adminError)}</p>`:''}${d?`<div class="mini-grid"><div class="mini"><small>إجمالي الحسابات، يشملك</small><strong>${fmt(d.stats.total)}</strong></div><div class="mini"><small>المستخدمون الآخرون</small><strong>${fmt(d.stats.total-d.stats.owners)}</strong></div><div class="mini"><small>نشط خلال ٧ أيام</small><strong>${fmt(d.stats.active)}</strong></div></div>${d.users.length?`<div class="table-wrap"><table><thead><tr><th>البريد الإلكتروني</th><th>أول دخول مسجل</th><th>آخر نشاط</th></tr></thead><tbody>${d.users.map(u=>`<tr><td><span dir="ltr" style="overflow-wrap:anywhere">${esc(u.email||'البريد غير متاح')}</span>${u.is_owner?' <span class="chip">المالك</span>':''}</td><td>${esc(adminDate(u.first_seen))}</td><td>${esc(adminDate(u.last_seen))}</td></tr>`).join('')}</tbody></table></div>`:'<p>لم يسجل أي حساب دخوله بعد.</p>'}<div class="quick-buttons"><button class="button secondary" data-users-page="${d.page-1}" ${d.page<=1||adminBusy?'disabled':''}>السابق</button><span>صفحة ${d.page} من ${Math.max(1,Math.ceil(d.stats.total/50))}</span><button class="button secondary" data-users-page="${d.page+1}" ${d.page*50>=d.stats.total||adminBusy?'disabled':''}>التالي</button></div>`:adminBusy?'<p>جارٍ جلب المستخدمين…</p>':'<p>اضغط تحديث القائمة لعرض المستخدمين.</p>'}</div></div>`;
}
const settingsBeforeAdmin=renderSettings;
renderSettings=()=>adminPanel()+settingsBeforeAdmin()+'<p class="sub">يرى مالك التطبيق بريد حسابك وتاريخ أول دخول مسجل وآخر نشاط لإدارة المستخدمين.</p>';
function updateAdminPanel(){const panel=document.querySelector('#users-admin');if(panel)panel.outerHTML=adminPanel()}
async function loadAdminUsers(page=1){
 if(!window.fitnessAccount?.owner||adminBusy)return;
 adminBusy=true;adminError='';updateAdminPanel();
 try{await presenceReady;const r=await fetch('/api/admin/users?page='+page,{credentials:'same-origin',cache:'no-store',headers:{'x-fitness-account':accountScope}});if(!r.ok)throw Error(r.status===401?'أعد فتح التطبيق لتجديد حساب الدخول.':r.status===403?'هذه اللوحة متاحة لمالك التطبيق فقط.':'تعذر تحميل المستخدمين. اضغط تحديث للمحاولة مجددًا.');adminResult=await r.json();adminPage=adminResult.page;}catch(e){adminError=e.message}finally{adminBusy=false;updateAdminPanel()}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-users-page]');if(b&&!b.disabled)loadAdminUsers(Number(b.dataset.usersPage))});
window.addEventListener('hashchange',()=>{if(location.hash==='#settings')loadAdminUsers()});
render();if(window.fitnessAccount?.owner)loadAdminUsers();
