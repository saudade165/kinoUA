// KinoUA — адмін-панель. Доступ і права перевіряє сервер Supabase (функції admin_role/admin_whoami, RLS на таблицях).
// Цей файл лише показує інтерфейс: приховані кнопки не дають прав, а кожен запит без прав сервер відхиляє.
// Секретних ключів тут немає: працює звичайна сесія користувача + публічний ключ.
(function(){
"use strict";
var K=window.KUA,A=window.KUA_AUTH||{problem:"sdk"},sb=A.client,esc=K.esc,L=0;
var ALL=[],G=window.GENRES;
var ME={email:"",role:null,user:null},SEC="home",DAYS=30;
function $(s,r){return(r||document).querySelector(s)}function $$(s,r){return[].slice.call((r||document).querySelectorAll(s))}
var I={
home:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
films:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',cats:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
recs:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5"/>',stats:'<path d="M21 12a9 9 0 1 1-9-9v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
roles:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',star:'<path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor" stroke="none"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',hide:'<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6C3.9 9.3 2 12 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8"/>',
up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor" stroke="none"/>',shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
check:'<path d="m5 12 4.5 4.5L19 7"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'};
function ic(n,s){return'<svg width="'+(s||20)+'" height="'+(s||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[n]+'</svg>'}
var NAV=[["home","Головна","home"],["users","Користувачі","users"],["films","Фільми і серіали","films"],["cats","Жанри","cats"],["recs","Головна й підбірки","recs"],["stats","Статистика","stats"],["roles","Ролі та права","roles"],["set","Налаштування","set"]];
var TYN={films:"Фільм",series:"Серіал",cartoons:"Мультфільм"};
var LN={en:"англійська",es:"іспанська",ja:"японська",ko:"корейська",hi:"гінді",ta:"тамільська",ru:"російська",uk:"українська",fr:"французька",de:"німецька",it:"італійська",zh:"китайська"};
var RN={owner:"Головний адміністратор",admin:"Адміністратор"};
function nf(n){return Number(n||0).toLocaleString("uk-UA")}
function d2(s){if(!s)return"—";var d=new Date(s);return d.toLocaleDateString("uk-UA",{day:"2-digit",month:"2-digit",year:"numeric"})}
function rel(s){if(!s)return"—";var d=new Date(s),n=new Date(),t=d.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"}),day=function(x){return new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime()},k=(day(n)-day(d))/864e5;
  return k===0?"сьогодні, "+t:k===1?"вчора, "+t:d2(s)+", "+t}
function av(email,url){var c=(email||"?").charAt(0).toUpperCase();return'<span class="av" aria-hidden="true">'+esc(c)+(/^https:\/\//.test(url||"")?'<img src="'+esc(url)+'" alt="" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'</span>'}
function toast(m,bad){var t=$("#toast");t.textContent=m;t.className="toast"+(bad?" bad":"");t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(function(){t.hidden=true},3600)}
function fail(e){var m=String(e&&(e.message||e.details)||e||"");if(/forbidden|42501|row-level security|permission denied/i.test(m))m="Недостатньо прав для цієї дії (перевірено на сервері).";else if(/fetch|network/i.test(m))m="Немає зв’язку із сервером. Спробуйте ще раз.";toast(m,true)}
function q(p){return p.then(function(r){if(r.error)throw r.error;return r.data})}
var isOwner=function(){return ME.role==="owner"};
function badgeRole(r){return r==="owner"?'<span class="badge b-own">'+ic("crown",12)+' Головний адмін</span>':r==="admin"?'<span class="badge b-adm">'+ic("shield",12)+' Адміністратор</span>':'<span class="badge b-usr">Користувач</span>'}

/* ---------- Каркас ---------- */
function shell(){$("#snav").innerHTML=NAV.map(function(n){return'<button type="button" data-sec="'+n[0]+'">'+ic(n[2])+'<span>'+n[1]+'</span></button>'}).join("");
$$("#snav button").forEach(function(b){b.addEventListener("click",function(){menu(false);if(location.hash==="#"+b.dataset.sec&&SEC===b.dataset.sec)go(b.dataset.sec);else location.hash=b.dataset.sec})});
var u=ME.user||{},md=u.user_metadata||{};$("#who").innerHTML=av(ME.email,md.avatar_url||md.picture)+'<div><b>'+esc(ME.email)+'</b><small>'+(ME.role==="owner"?'<span style="color:var(--warn)">'+ic("crown",12)+'</span>':ic("shield",12))+esc(RN[ME.role])+'</small></div><button type="button" class="btn sec sm" id="lo">Вийти</button>';
$("#lo").addEventListener("click",function(){A.signOut().then(function(){location.href="profile.html"})});
$("#burger").addEventListener("click",function(){menu(!$("#side").classList.contains("open"))});$("#scrim").addEventListener("click",function(){menu(false)});
addEventListener("keydown",function(e){if(e.key==="Escape")menu(false)});
addEventListener("hashchange",function(){var s=location.hash.slice(1);if(s&&s!==SEC&&(NAV.some(function(n){return n[0]===s})||/^edit\//.test(s)))route(s)})}
// Перехід між розділами з перевіркою незбережених змін у редакторі
function route(s){var pr=CMS&&window.KUA_DIRTY?CMS.leave():Promise.resolve(true);pr.then(function(ok){if(!ok){try{history.replaceState(null,"","#"+SEC)}catch(e){}return}if(/^edit\//.test(s))edit(s.slice(5));else go(s,true)})}
function edit(id){SEC="edit/"+id;$$("#snav button").forEach(function(b){if(b.dataset.sec==="films")b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});document.title="Редактор — Адмін-панель KinoUA";var m=$("#adm");cms().editor(m,id);m.focus({preventScroll:true})}
function menu(o){$("#side").classList.toggle("open",o);$("#scrim").hidden=!o;$("#burger").setAttribute("aria-expanded",String(o))}
function go(s,fromHash){SEC=s;$$("#snav button").forEach(function(b){if(b.dataset.sec===s)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
if(!fromHash)try{history.replaceState(null,"","#"+s)}catch(e){}
var n=NAV.filter(function(x){return x[0]===s})[0];document.title=n[1]+" — Адмін-панель KinoUA";
var m=$("#adm");m.innerHTML='<div class="state"><span class="spin" aria-hidden="true"></span></div>';({home:home,users:users,films:films,cats:cats,recs:recs,stats:stats,roles:roles,set:settings})[s](m);m.focus({preventScroll:true})}
function head(t,p,right){return'<div class="ph"><div><h1>'+t+'</h1><p>'+p+'</p></div>'+(right||'')+'</div>'}
function period(){return'<label class="vh" for="per">Період</label><select class="sel" id="per">'+[[7,"Останні 7 днів"],[30,"Останні 30 днів"],[90,"Останні 90 днів"]].map(function(o){return'<option value="'+o[0]+'"'+(o[0]===DAYS?' selected':'')+'>'+o[1]+'</option>'}).join("")+'</select>'}
function bindPeriod(){var p=$("#per");if(p)p.addEventListener("change",function(){DAYS=+p.value;go(SEC)})}

/* ---------- Графік (SVG) ---------- */
function chart(series,keys){var W=720,H=260,pl=36,pr=12,pt=14,pb=28,n=series.length,max=1;
series.forEach(function(r){keys.forEach(function(k){max=Math.max(max,r[k[0]]||0)})});var nice=Math.max(4,Math.ceil(max/4)*4);
var x=function(i){return pl+(n<2?0:i*(W-pl-pr)/(n-1))},y=function(v){return pt+(H-pt-pb)*(1-v/nice)};
var g='';for(var j=0;j<=4;j++){var v=nice*j/4;g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#262B38"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+Math.round(v)+'</text>'}
var step=Math.max(1,Math.ceil(n/7));series.forEach(function(r,i){if(i%step===0||i===n-1){var d=new Date(r.day);g+='<text x="'+x(i)+'" y="'+(H-8)+'" text-anchor="middle">'+d.getDate()+'.'+String(d.getMonth()+1).padStart(2,"0")+'</text>'}});
var p='';keys.forEach(function(k,ki){var pts=series.map(function(r,i){return x(i).toFixed(1)+','+y(r[k[0]]||0).toFixed(1)});
p+='<defs><linearGradient id="cg'+ki+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+k[2]+'" stop-opacity=".35"/><stop offset="1" stop-color="'+k[2]+'" stop-opacity="0"/></linearGradient></defs>'
+'<path d="M'+x(0)+','+y(0)+' L'+pts.join(' L')+' L'+x(n-1)+','+y(0)+'Z" fill="url(#cg'+ki+')"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+k[2]+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
+series.map(function(r,i){return(r[k[0]]||0)?'<circle cx="'+x(i)+'" cy="'+y(r[k[0]])+'" r="3" fill="'+k[2]+'"><title>'+d2(r.day)+': '+r[k[0]]+' — '+k[1]+'</title></circle>':''}).join("")});
var sum=keys.map(function(k){return k[1]+': '+series.reduce(function(a,r){return a+(r[k[0]]||0)},0)}).join(", ");
return'<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Графік за '+n+' днів. '+esc(sum)+'">'+g+p+'</svg>'}
function legend(keys){return'<div class="legend">'+keys.map(function(k){return'<span><i style="background:'+k[2]+'"></i>'+k[1]+'</span>'}).join("")+'</div>'}
function bars(rows){var m=Math.max.apply(null,rows.map(function(r){return r[1]}).concat([1]));return rows.length?'<div class="bars">'+rows.map(function(r){return'<div class="bar"><span title="'+esc(r[0])+'">'+esc(r[0])+'</span><i style="width:'+Math.max(1,r[1]/m*100)+'%"></i><em>'+nf(r[1])+'</em></div>'}).join("")+'</div>':'<p class="empty">Даних ще немає.</p>'}

/* ---------- Головна ---------- */
function home(m){q(sb.rpc("admin_stats",{p_days:DAYS})).then(function(s){
var cat=s.catalog||{},films=cat.films||0,avg=cat.avg_imdb!=null?+cat.avg_imdb:null,dv=s.views_prev_period?Math.round((s.views_period-s.views_prev_period)/s.views_prev_period*100):null;
m.innerHTML=head("Адмін-панель","Ласкаво просимо до панелі управління KinoUA",period())
+'<div class="stats">'
+'<div class="card stat"><span class="ic">'+ic("users",26)+'</span><div><small>Всього користувачів</small><b>'+nf(s.users_total)+'</b><span class="delta'+(s.users_new_7d?'':' n')+'">'+(s.users_new_7d?'↑ +':'')+nf(s.users_new_7d)+' за тиждень</span></div></div>'
+'<div class="card stat"><span class="ic">'+ic("films",26)+'</span><div><small>Тайтлів на сайті</small><b>'+nf(cat.visible)+'</b><span class="delta n">усього в базі: '+nf(cat.total)+(cat.drafts?' · чернеток: '+cat.drafts:'')+'</span></div></div>'
+'<div class="card stat"><span class="ic">'+ic("eye",26)+'</span><div><small>Переглядів сторінок тайтлів</small><b>'+nf(s.views_period)+'</b><span class="delta'+(dv==null?' n':dv<0?' d':'')+'">'+(dv==null?(s.views_since?'облік з '+d2(s.views_since):'облік щойно запущено'):(dv>=0?'↑ +':'↓ ')+dv+'% до попер. періоду')+'</span></div></div>'
+'<div class="card stat"><span class="ic y">'+ic("star",26)+'</span><div><small>Середній рейтинг IMDb</small><b>'+(avg?avg.toFixed(1):"—")+'</b><span class="delta n">по опублікованих тайтлах</span></div></div></div>'
+'<div class="g2"><section class="card" aria-labelledby="ha"><div class="chead"><h2 id="ha">Активність користувачів</h2>'+legend(AK)+'</div>'+chart(s.series||[],AK)+'<p class="note">Реєстрації — з Supabase Auth. Входи — кожна нова сесія входу (облік з '+(s.logins_since?d2(s.logins_since):'моменту запуску')+'), а не лише останній вхід. Перегляди — сторінки тайтлів з дедуплікацією (облік з '+(s.views_since?d2(s.views_since):'моменту запуску')+'). Входили за період: '+nf(s.users_active_period)+' корист., '+nf(s.logins_period)+' входів.</p></section>'
+'<section class="card" aria-labelledby="hr"><h2 id="hr">Останні реєстрації</h2>'+(s.recent_users.length?'<ul class="recent">'+s.recent_users.map(function(u){return'<li>'+av(u.email,u.avatar)+'<span>'+esc(u.email)+'</span><time datetime="'+esc(u.created_at)+'">'+rel(u.created_at)+'</time></li>'}).join("")+'</ul>':'<p class="empty">Ще немає реєстрацій.</p>')+'</section></div>';
bindPeriod()}).catch(function(e){m.innerHTML=errBox(e)})}
var AK=[["new_users","Нові користувачі","#9B7BFF"],["signins","Входи (сесії)","#5B9BFF"],["views","Перегляди","#3DD68C"]];
function errBox(e){var t=String(e&&e.message||e);return'<div class="err" role="alert">Не вдалося завантажити дані: '+esc(/forbidden/.test(t)?"немає прав":t)+'</div>'}

/* ---------- Користувачі ---------- */
var UQ={s:"",p:"",r:"",page:0,size:10};
function users(m){m.innerHTML=head("Користувачі","Усі зареєстровані користувачі Supabase Auth")
+'<form class="tools" id="uf" role="search"><div class="grow"><label class="vh" for="us">Пошук</label><input class="in" id="us" type="search" placeholder="Пошук за email, ім’ям або ID…" value="'+esc(UQ.s)+'"></div>'
+'<label class="vh" for="ur">Роль</label><select class="sel" id="ur"><option value="">Усі користувачі</option><option value="owner">Головний адмін</option><option value="admin">Адміністратори</option><option value="user">Без ролі</option></select>'
+'<label class="vh" for="up">Спосіб входу</label><select class="sel" id="up"><option value="">Усі способи входу</option></select><button class="btn">Знайти</button></form><div id="ut"></div>';
$("#ur").value=UQ.r;$("#uf").addEventListener("submit",function(e){e.preventDefault();UQ.s=$("#us").value.trim();UQ.r=$("#ur").value;UQ.p=$("#up").value;UQ.page=0;loadUsers()});
["#ur","#up"].forEach(function(s){$(s).addEventListener("change",function(){UQ.r=$("#ur").value;UQ.p=$("#up").value;UQ.page=0;loadUsers()})});loadUsers()}
function loadUsers(){var box=$("#ut");box.innerHTML='<div class="state" style="min-height:160px"><span class="spin"></span></div>';
q(sb.rpc("admin_list_users",{p_search:UQ.s,p_provider:UQ.p,p_role:UQ.r,p_limit:UQ.size,p_offset:UQ.page*UQ.size})).then(function(d){
var up=$("#up");if(up&&up.options.length<2){(d.providers||[]).forEach(function(p){up.insertAdjacentHTML("beforeend",'<option value="'+esc(p)+'">'+esc(p==="google"?"Google":p)+'</option>')});up.value=UQ.p}
var rows=d.rows||[];box.innerHTML='<div class="tw"><table><thead><tr><th>№</th><th>Email</th><th>Ім’я</th><th>Спосіб входу</th><th>Дата реєстрації</th><th>Останній вхід</th><th>Статус</th><th class="vh">Дії</th></tr></thead><tbody>'
+(rows.length?rows.map(function(u,i){return'<tr><td>'+(UQ.page*UQ.size+i+1)+'</td><td><div class="tcell" style="min-width:200px">'+av(u.email,u.avatar)+'<span>'+esc(u.email)+'</span></div></td><td>'+esc(u.name||"—")+'</td><td>'+esc(u.provider==="google"?"Google":u.provider)+'</td><td class="nw">'+d2(u.created_at)+'</td><td class="nw">'+rel(u.last_sign_in_at)+'</td><td>'+badgeRole(u.role)+'</td><td class="acts">'+userAct(u)+'</td></tr>'}).join(""):'<tr><td colspan="8" class="empty">Нікого не знайдено.</td></tr>')+'</tbody></table></div>'+pager(d.total,UQ.page,UQ.size);
bindPager(loadUsers);$$("#ut [data-mk]").forEach(function(b){b.addEventListener("click",function(){addAdmin(b.dataset.mk,loadUsers)})});$$("#ut [data-rm]").forEach(function(b){b.addEventListener("click",function(){rmAdmin(b.dataset.rm,loadUsers)})})}).catch(function(e){box.innerHTML=errBox(e)})}
function userAct(u){if(!isOwner()||u.role==="owner")return'';return u.role==="admin"?'<button type="button" class="btn dng sm" data-rm="'+esc(u.email)+'">Зняти права</button>':'<button type="button" class="btn sec sm" data-mk="'+esc(u.email)+'">Зробити адміном</button>'}
function pager(total,cur,size){var pages=Math.max(1,Math.ceil(total/size)),b=[];for(var i=0;i<pages;i++)if(i<2||i>pages-3||Math.abs(i-cur)<=1)b.push(i);else if(b[b.length-1]!=="…")b.push("…");
return'<div class="pager"><span>Показано '+Math.min(total,cur*size+1)+'–'+Math.min(total,(cur+1)*size)+' з '+nf(total)+'</span><div class="pages"><button type="button" data-pg="'+(cur-1)+'" aria-label="Попередня"'+(cur<=0?' disabled':'')+'>‹</button>'+b.map(function(i){return i==="…"?'<span>…</span>':'<button type="button" data-pg="'+i+'"'+(i===cur?' aria-current="page"':'')+'>'+(i+1)+'</button>'}).join("")+'<button type="button" data-pg="'+(cur+1)+'" aria-label="Наступна"'+(cur>=pages-1?' disabled':'')+'>›</button></div></div>'}
function bindPager(fn){$$("#ut [data-pg]").forEach(function(b){b.addEventListener("click",function(){UQ.page=+b.dataset.pg;fn()})})}

/* ---------- Ролі ---------- */
function confirmDlg(title,text,ok,danger){return new Promise(function(res){var d=document.createElement("dialog"),done=false,fin=function(v){if(done)return;done=true;try{d.close()}catch(e){}d.remove();res(v)};d.innerHTML='<h2>'+esc(title)+'</h2><p style="color:var(--mu)">'+text+'</p><div class="dacts"><button type="button" class="btn sec" value="0">Скасувати</button><button type="button" class="btn'+(danger?' dng':'')+'" value="1">'+esc(ok)+'</button></div>';
document.body.appendChild(d);$$("button",d).forEach(function(b){b.addEventListener("click",function(){fin(b.value==="1")})});d.addEventListener("cancel",function(e){e.preventDefault();fin(false)});d.showModal()})}
// Закриття діалогу без залежності від події close (вона приходить асинхронно): прибирає елемент одразу
function shut(d){try{d.close()}catch(e){}d.remove()}
function addAdmin(email,after){email=String(email||"").trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){toast("Вкажіть коректний email.",true);return}
confirmDlg("Призначити адміністратора?",'<b>'+esc(email)+'</b> отримає обмежені права адміністратора: користувачі (перегляд), каталог, рекомендації, статистика, налаштування сайту. Керувати адміністраторами він не зможе.',"Призначити").then(function(y){if(!y)return;
q(sb.from("admin_users").insert({email:email,role:"admin"})).then(function(){toast("Адміністратора призначено.");after()}).catch(function(e){if(/duplicate|23505/.test(e&&e.code+" "+e.message))toast("Цей email уже має роль.",true);else fail(e)})})}
function rmAdmin(email,after){confirmDlg("Зняти права адміністратора?",'<b>'+esc(email)+'</b> більше не матиме доступу до адмін-панелі.',"Зняти права",true).then(function(y){if(!y)return;
q(sb.from("admin_users").delete().eq("email",email).eq("role","admin").select()).then(function(r){if(!r||!r.length)throw new Error("forbidden");toast("Права знято.");after()}).catch(fail)})}
var RIGHTS={owner:[["Перегляд користувачів",1],["Каталог: публікація й приховування",1],["Рекомендації редакції",1],["Налаштування сайту",1],["Уся статистика й журнал дій",1],["Призначення й зняття адміністраторів",1]],
admin:[["Перегляд користувачів",1],["Каталог: публікація й приховування",1],["Рекомендації редакції",1],["Налаштування сайту",1],["Уся статистика й журнал дій",1],["Призначення й зняття адміністраторів",0],["Зміна прав головного адміністратора",0]]};
function rightsList(r){return'<ul class="rights"><b>'+(r==="owner"?"Повні права доступу:":"Обмежені права доступу:")+'</b>'+RIGHTS[r].map(function(x){return'<li><span class="'+(x[1]?'yes':'no')+'">'+ic(x[1]?"check":"x",16)+'</span>'+x[0]+'</li>'}).join("")+'</ul>'}
function roles(m){q(sb.from("admin_users").select("email,role,added_by,added_at").order("role",{ascending:false}).order("added_at")).then(function(rows){
var own=rows.filter(function(r){return r.role==="owner"}),adm=rows.filter(function(r){return r.role==="admin"});
m.innerHTML=head("Ролі та права","Керування адміністраторами сайту. Права перевіряються на сервері (RLS).",isOwner()?'<button type="button" class="btn" id="ad">'+ic("plus",18)+'Додати адміністратора</button>':'')
+'<div class="roles">'+own.map(function(r){return'<section class="card role"><span class="ri">'+ic("crown",30)+'</span><div><h3>Головний адміністратор</h3><p class="em">'+esc(r.email)+'</p></div>'+rightsList("owner")+'<div class="ract"><span class="badge b-own">'+ic("lock",12)+' Захищено</span></div></section>'}).join("")
+(adm.length?adm.map(function(r){return'<section class="card role"><span class="ri adm">'+ic("shield",30)+'</span><div><h3>Адміністратор</h3><p class="em">'+esc(r.email)+'</p><p class="note">Призначив: '+esc(r.added_by||"—")+' · '+d2(r.added_at)+'</p></div>'+rightsList("admin")+'<div class="ract">'+(isOwner()?'<button type="button" class="btn dng sm" data-rm="'+esc(r.email)+'">Зняти права</button>':'')+'</div></section>'}).join(""):'<p class="empty card">Інших адміністраторів немає.</p>')+'</div>'
+'<p class="note">Головного адміністратора не можна змінити, зняти чи призначити через панель — це заборонено правилами бази даних, а не лише інтерфейсом. Новий адміністратор отримує доступ після входу через Google з цим email.</p>';
var ad=$("#ad");if(ad)ad.addEventListener("click",function(){var d=document.createElement("dialog");d.innerHTML='<form method="dialog" id="af"><h2>Додати адміністратора</h2><p style="color:var(--mu)">Обмежені права. Email має збігатися з Google-акаунтом, яким людина входить.</p><label for="ae" class="vh">Email</label><input class="in" id="ae" type="email" required placeholder="name@gmail.com" autocomplete="off"><div class="dacts"><button type="button" class="btn sec" id="ac">Скасувати</button><button class="btn">Далі</button></div></form>';
document.body.appendChild(d);$("#ac",d).onclick=function(){shut(d)};$("#af",d).addEventListener("submit",function(e){e.preventDefault();var v=$("#ae",d).value;shut(d);addAdmin(v,function(){go("roles")})});d.addEventListener("cancel",function(e){e.preventDefault();shut(d)});d.showModal()});
$$("[data-rm]",m).forEach(function(b){b.addEventListener("click",function(){rmAdmin(b.dataset.rm,function(){go("roles")})})})}).catch(function(e){m.innerHTML=errBox(e)})}

/* ---------- Каталог (CMS): фільми й серіали, жанри, головна й підбірки — js/admin-cms.js ---------- */
var CMS=null;function cms(){if(!CMS)CMS=window.KUA_CMS({sb:sb,$:$,$$:$$,ic:ic,esc:esc,toast:toast,fail:fail,q:q,confirmDlg:confirmDlg,shut:shut,go:go,head:head,sel:sel,pager:pager,errBox:errBox,nf:nf,ME:ME});return CMS}
function films(m){cms().list(m)}function cats(m){cms().genres(m)}function recs(m){cms().blocks(m)}
function sel(id,lab,opts,v){return'<label class="vh" for="'+id+'">'+lab+'</label><select class="sel" id="'+id+'">'+opts.map(function(o){return'<option value="'+esc(o[0])+'"'+(String(o[0])===String(v)?' selected':'')+'>'+esc(o[1])+'</option>'}).join("")+'</select>'}

/* ---------- Статистика ---------- */
function stats(m){q(sb.rpc("admin_stats",{p_days:DAYS})).then(function(s){
var tops=(s.top_titles||[]).map(function(t){return[t.title||t.title_id,t.views]}),cat=s.catalog||{};
var byType=[["Фільми",cat.films||0],["Мультфільми",cat.cartoons||0],["Серіали",cat.series||0]];
var lc={};ALL.forEach(function(x){if(x.ol)lc[x.ol]=(lc[x.ol]||0)+1});var byLang=Object.keys(lc).sort(function(a,b){return lc[b]-lc[a]}).map(function(k){return[LN[k]||k,lc[k]]});
var prov=Object.keys(s.providers||{}).map(function(k){return[k==="google"?"Google":k,s.providers[k]]});
m.innerHTML=head("Статистика","Лише реально зібрані дані: Supabase Auth, облік переглядів на сайті й каталог.",period())
+'<section class="card" style="margin-bottom:16px"><div class="chead"><h2>Активність за '+s.days+' дн.</h2>'+legend(AK)+'</div>'+chart(s.series||[],AK)+'</section>'
+'<div class="g2e"><section class="card"><h2>Найпопулярніші сторінки тайтлів</h2>'+bars(tops)+'<p class="note">Перегляди сторінок фільмів за період: '+nf(s.views_period)+' (усього: '+nf(s.views_total)+(s.views_since?', облік з '+d2(s.views_since):'')+'), унікальних відвідувачів: '+nf(s.visitors_period)+'. Повтор того самого відвідувача зараховується не частіше разу на 30 хв; з однієї IP — не більше 20 на тайтл і 200 загалом за годину.</p></section>'
+'<section class="card"><h2>Користувачі</h2><dl class="kv"><dt>Усього</dt><dd>'+nf(s.users_total)+'</dd><dt>Нових за 7 днів</dt><dd>'+nf(s.users_new_7d)+'</dd><dt>Входили за період</dt><dd>'+nf(s.users_active_period)+'</dd><dt>Входів (сесій) за період</dt><dd>'+nf(s.logins_period)+'</dd></dl><h3 style="margin-top:16px">Спосіб входу</h3>'+bars(prov)+'</section>'
+'<section class="card"><h2>Каталог за типом</h2>'+bars(byType)+'<p class="note">Без кошика. Опубліковано: '+nf(cat.visible)+', чернеток: '+nf(cat.drafts)+'.</p></section><section class="card"><h2>Мова оригіналу</h2>'+bars(byLang)+'</section></div>'
+'<section class="card" style="margin-top:16px"><h2>Журнал дій адміністраторів</h2>'+((s.last_audit||[]).length?'<div class="tw"><table><thead><tr><th>Коли</th><th>Хто</th><th>Дія</th><th>Об’єкт</th></tr></thead><tbody>'+s.last_audit.map(function(a){return'<tr><td class="nw">'+rel(a.at)+'</td><td>'+esc(a.actor_email||"—")+'</td><td>'+esc(AUD[a.action]||a.action)+'</td><td>'+esc(a.target||"")+'</td></tr>'}).join("")+'</tbody></table></div>':'<p class="empty">Дій ще не було.</p>')+'</section>';
bindPeriod()}).catch(function(e){m.innerHTML=errBox(e)})}
var AUD={"content.insert":"Створено тайтл","content.update":"Змінено тайтл","content.delete":"Видалено тайтл назавжди","genres.insert":"Створено жанр","genres.update":"Змінено жанр","genres.delete":"Видалено жанр","categories.insert":"Створено блок","categories.update":"Змінено блок","categories.delete":"Видалено блок","admin_users.insert":"Призначено адміністратора","admin_users.delete":"Знято адміністратора","title_flags.insert":"Змінено показ тайтла","title_flags.update":"Змінено показ тайтла","title_flags.delete":"Скинуто показ тайтла","recommendations.insert":"Додано рекомендацію","recommendations.update":"Змінено рекомендацію","recommendations.delete":"Прибрано рекомендацію","site_settings.insert":"Змінено налаштування","site_settings.update":"Змінено налаштування"};

/* ---------- Налаштування ---------- */
var TAB="gen";
function settings(m){q(sb.from("site_settings").select("key,value,updated_by,updated_at")).then(function(rows){var S={};rows.forEach(function(r){S[r.key]=r});
var an=(S.announcement&&S.announcement.value)||{},on=!!(S.announcement_enabled&&S.announcement_enabled.value===true),tg=(S.support_telegram_url&&S.support_telegram_url.value)||"";
var tabs=[["gen","Загальні"],["api","API та джерела"],["sec","Безпека"]];
m.innerHTML=head("Налаштування","Загальні налаштування сайту")+'<div class="tabs" role="tablist">'+tabs.map(function(t){return'<button type="button" role="tab" data-tab="'+t[0]+'" aria-selected="'+(t[0]===TAB)+'">'+t[1]+'</button>'}).join("")+'</div>'
+'<div class="g2"><section class="card" id="tp"></section><section class="card"><h2>Статус сервісів</h2><ul class="svc" id="svc"></ul><p class="note">Перевіряється щойно з вашого браузера.</p></section></div>';
function pane(){var p=$("#tp");
if(TAB==="gen"){p.innerHTML='<h2>Оголошення на сайті</h2><form class="form" id="sf"><div class="frow"><span>Показувати</span><label class="sw"><input type="checkbox" id="so"'+(on?' checked':'')+'> Смуга над шапкою на всіх сторінках</label></div>'
+[["uk","Українська"],["ru","Русский"],["en","English"]].map(function(l){return'<div class="frow"><label for="sa_'+l[0]+'">Текст · '+l[1]+'</label><textarea class="in" id="sa_'+l[0]+'" maxlength="240">'+esc(an[l[0]]||"")+'</textarea></div>'}).join("")
+'<div class="frow"><label for="st">Підтримка в Telegram</label><div><input class="in" id="st" type="url" placeholder="https://t.me/назва_каналу" value="'+esc(tg)+'"><p class="note">Порожнє поле — на сайті «Підтримка в Telegram · скоро».</p></div></div>'
+'<div><button class="btn">Зберегти зміни</button></div>'+(S.announcement?'<p class="note">Востаннє змінено: '+esc(S.announcement.updated_by||"—")+' · '+rel(S.announcement.updated_at)+'</p>':'')+'</form>';
$("#sf").addEventListener("submit",function(e){e.preventDefault();var t=$("#st").value.trim();if(t&&!/^https:\/\/t\.me\/[\w+/-]+$/.test(t)){toast("Посилання має бути у форматі https://t.me/…",true);return}
var a={uk:$("#sa_uk").value.trim(),ru:$("#sa_ru").value.trim(),en:$("#sa_en").value.trim()},o=$("#so").checked;if(o&&!a.uk){toast("Додайте текст українською, щоб увімкнути оголошення.",true);return}
q(sb.from("site_settings").upsert([{key:"announcement",value:a},{key:"announcement_enabled",value:o},{key:"support_telegram_url",value:t}])).then(function(){toast("Налаштування збережено. Відвідувачі побачать зміни після оновлення сторінки.");go("set")}).catch(fail)})}
else if(TAB==="api"){var tm=ALL.filter(function(x){return x.tmdb_id}).length,im=ALL.filter(function(x){return x.imdb_id}).length,ir=ALL.filter(function(x){return x.rating_imdb!=null}).length,tr=ALL.filter(function(x){return x.trailer_yt}).length;
p.innerHTML='<h2>Джерела даних</h2><dl class="kv"><dt>Каталог</dt><dd>'+ALL.length+' тайтлів у базі Supabase (без кошика) — єдине джерело для сайту й панелі</dd><dt>Початковий імпорт</dt><dd>TMDB (знімок 18.10.2026) + оцінки IMDb (19.10.2026), tools/seed/</dd><dt>TMDB ID</dt><dd>'+tm+'</dd><dt>IMDb ID / оцінки</dt><dd>'+im+' / '+ir+'</dd><dt>Трейлери YouTube</dt><dd>'+tr+'</dd><dt>Зображення</dt><dd>Нові — Supabase Storage (бакет media); імпортовані — файли сайту assets/</dd><dt>Supabase</dt><dd>'+esc((window.KUA_CONFIG.supabase||{}).url||"—")+'</dd><dt>Ключ у браузері</dt><dd>лише публічний (publishable)</dd><dt>Вхід</dt><dd>Google OAuth через Supabase Auth</dd></dl>'}
else{p.innerHTML='<h2>Безпека</h2><dl class="kv"><dt>Ваша роль</dt><dd>'+esc(RN[ME.role])+' (визначає сервер)</dd><dt>Перевірка прав</dt><dd>Функція admin_role() у базі: роль за підтвердженим email з auth.users, а не з браузера</dd><dt>Таблиці</dt><dd>Row Level Security на всіх: content, genres, seasons, episodes, video_sources, content_images, categories, category_items, admin_users, site_settings, title_views, login_events, admin_audit; сховище media — запис лише адміністраторам</dd><dt>Перегляди</dt><dd>Лише через функцію track_view: дедуплікація й ліміти, IP не зберігається (лише хеш із сіллю)</dd><dt>Головний адміністратор</dt><dd>Один; його запис не можна змінити чи видалити через API</dd><dt>Журнал</dt><dd>Кожна зміна записується тригером у admin_audit</dd><dt>Секрети</dt><dd>service_role і Google Client Secret не використовуються в коді сайту</dd></dl>'}}
$$("[data-tab]",m).forEach(function(b){b.addEventListener("click",function(){TAB=b.dataset.tab;$$("[data-tab]",m).forEach(function(x){x.setAttribute("aria-selected",String(x===b))});pane()})});pane();services()}).catch(function(e){m.innerHTML=errBox(e)})}
function services(){var C=window.KUA_CONFIG.supabase,list=[["Supabase Auth",function(){return fetch(C.url+"/auth/v1/health",{headers:{apikey:C.publishableKey}}).then(function(r){return r.ok})}],
["Google OAuth",function(){return fetch(C.url+"/auth/v1/settings",{headers:{apikey:C.publishableKey}}).then(function(r){return r.json()}).then(function(j){return!!(j.external&&j.external.google)})}],
["База даних (RLS)",function(){return q(sb.rpc("admin_whoami")).then(function(w){return!!(w&&w.role)})}],
["Публічний стан сайту",function(){return q(sb.rpc("public_site_state")).then(function(s){return!!s})}],
["Файли (постери)",function(){var x=ALL[0];return x?fetch(x.poster,{method:"HEAD",cache:"no-store"}).then(function(r){return r.ok}):Promise.resolve(false)}]];
$("#svc").innerHTML=list.map(function(s,i){return'<li><i class="dot wait" id="sv'+i+'"></i><span>'+s[0]+'</span><small id="svt'+i+'" style="color:var(--mu)">перевірка…</small></li>'}).join("");
list.forEach(function(s,i){s[1]().catch(function(){return false}).then(function(ok){var d=$("#sv"+i),t=$("#svt"+i);if(!d)return;d.className="dot "+(ok?"ok":"bad");t.textContent=ok?"Працює":"Помилка";t.style.color=ok?"var(--ok)":"var(--bad)"})})}

/* ---------- Вхід і перевірка доступу ---------- */
function gate(html){$("#adm").innerHTML='<div class="state">'+html+'</div>';$("#snav").innerHTML="";$("#who").innerHTML=""}
function start(){if(A.problem){gate('<span class="big">'+ic("lock",34)+'</span><h1>Адмін-панель недоступна</h1><p>Вхід через Supabase не налаштовано на цьому сайті ('+esc(A.problem)+').</p>');return}
A.check().then(function(r){if(!r.user){gate('<span class="big">'+ic("lock",34)+'</span><h1>Увійдіть, щоб продовжити</h1><p>Адмін-панель доступна лише адміністраторам KinoUA.</p><a class="btn" href="profile.html">Увійти через Google</a>');return}
ME.user=r.user;return q(sb.rpc("admin_whoami")).then(function(w){ME.email=w&&w.email||r.user.email;ME.role=w&&w.role;
if(!ME.role){gate('<span class="big">'+ic("shield",34)+'</span><h1>Немає доступу</h1><p>Акаунт <b>'+esc(ME.email)+'</b> не має прав адміністратора.<br>Права перевіряє сервер, тому змінити це з браузера неможливо.</p><a class="btn sec" href="index.html">На сайт</a>');return}
shell();var h=location.hash.slice(1);return q(sb.from("content").select("slug,ty,title_uk,title_orig,orig_lang,rating_imdb,trailer_yt,imdb_id,tmdb_id,poster").is("deleted_at",null)).catch(function(){return[]}).then(function(rows){ALL=rows;if(/^edit\//.test(h))edit(h.slice(5));else go(NAV.some(function(n){return n[0]===h})?h:"home",true)})})}).catch(function(e){gate('<span class="big">'+ic("x",34)+'</span><h1>Не вдалося перевірити доступ</h1><p>'+esc(String(e&&e.message||e))+'</p><button class="btn" onclick="location.reload()">Спробувати ще раз</button>')})}
if(A.client)A.onChange(function(ev){if(ev==="SIGNED_OUT")location.reload()});
start();
})();
