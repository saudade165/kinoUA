// Стан сайту з адмін-панелі: приховані тайтли, рекомендації редакції, оголошення, посилання на підтримку.
// Джерело — Supabase RPC public_site_state (лише публічні дані, без персональних). Підключається після catalog.js і config.js.
// Останній стан кешується в localStorage, щоб сторінка рендерилась одразу; якщо на сервері він змінився — сторінка оновлюється один раз за сесію.
// Тут же — запис переглядів сторінок тайтлів (title_views; читати їх можуть лише адміністратори).
(function(){
var C=(window.KUA_CONFIG||{}).supabase||{},KEY="kinoua_site_state",EMPTY={hidden:[],recs:[],settings:{}};
var ok=!!(C.url&&C.publishableKey&&location.protocol!=="file:"),API=ok?C.url.replace(/\/$/,"")+"/rest/v1/":"";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){return null}}
function norm(s){s=s||EMPTY;return JSON.stringify({h:(s.hidden||[]).slice().sort(),r:s.recs||[],s:s.settings||{}})}
function apply(s){s=s||EMPTY;var h=s.hidden||[],M=window.MOVIES;
  // Приховані тайтли прибираються з даних до рендеру: їх немає в каталозі, пошуку, стрічках і на сторінці тайтлу
  if(h.length&&M)for(var i=M.length-1;i>=0;i--)if(h.indexOf(M[i].id)>-1)M.splice(i,1);
  var st=s.settings||{},tg=st.support_telegram_url;
  if(typeof tg==="string"&&/^https:\/\/t\.me\/[\w+/-]+$/.test(tg)&&window.KUA_CONFIG)window.KUA_CONFIG.supportTelegramUrl=tg;
  window.KUA_SITE={hidden:h,recs:(s.recs||[]).filter(function(r){return!M||M.some(function(m){return m.id===r.id})}),settings:st}}
var cached=read();apply(cached);
// Оголошення (вмикається в адмін-панелі → Налаштування)
document.addEventListener("DOMContentLoaded",function(){var st=window.KUA_SITE.settings,a=st.announcement,on=st.announcement_enabled===true;if(!on||!a)return;
  var L=0;try{L=+localStorage.getItem("kinoua_lang")||0}catch(e){}var tx=typeof a==="string"?a:(a[["uk","ru","en"][L]]||a.uk||"");if(!tx)return;
  var sig="kinoua_ann_"+tx.length+"_"+tx.slice(0,24);try{if(sessionStorage.getItem(sig))return}catch(e){}
  var b=document.createElement("div");b.className="ann";b.setAttribute("role","note");var p=document.createElement("p");p.textContent=tx;var x=document.createElement("button");x.type="button";x.className="ann-x";x.textContent="✕";x.setAttribute("aria-label",["Закрити","Закрыть","Close"][L]||"Close");
  x.onclick=function(){b.remove();try{sessionStorage.setItem(sig,"1")}catch(e){}};b.appendChild(p);b.appendChild(x);var tb=document.querySelector(".topbar");if(tb)tb.parentNode.insertBefore(b,tb);else document.body.insertBefore(b,document.body.firstChild)});
if(ok)fetch(API+"rpc/public_site_state",{method:"POST",headers:{apikey:C.publishableKey,"Content-Type":"application/json"},body:"{}"})
  .then(function(r){return r.ok?r.json():null}).then(function(s){if(!s)return;
    var changed=norm(s)!==norm(cached);try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    if(changed&&!(cached===null&&norm(s)===norm(EMPTY))){var f="kinoua_ss_reload";try{if(!sessionStorage.getItem(f)){sessionStorage.setItem(f,"1");location.reload()}}catch(e){}}})
  .catch(function(){});
// Перегляд сторінки тайтлу — один запис на тайтл за сесію браузера (з локальної розробки не пишеться, щоб не псувати статистику)
window.KUA_TRACK_VIEW=function(id){if(!ok||!/^[a-z0-9-]{1,100}$/.test(id)||/^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname))return;var k="kinoua_v_"+id;try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1")}catch(e){}
  fetch(API+"title_views",{method:"POST",headers:{apikey:C.publishableKey,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({title_id:id}),keepalive:true}).catch(function(){})};
})();
