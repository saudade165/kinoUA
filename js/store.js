// Каталог KinoUA з Supabase — єдине джерело даних для сайту й адмін-панелі.
// public_catalog(): опубліковані тайтли, жанри, блоки головної, публічні налаштування (без персональних даних).
// Сторінки чекають на KUA_READY. Якщо є кеш — сайт показується одразу, а свіжі дані перевіряються у фоні:
// якщо в адмін-панелі щось змінили, сторінка один раз оновлюється. Без мережі й без кешу — повідомлення з кнопкою «Спробувати ще раз».
// ?preview=1 на сторінці тайтлу — попередній перегляд будь-якого статусу (лише для адміністраторів, перевіряє сервер).
(function(){
var C=(window.KUA_CONFIG||{}).supabase||{},KEY="kinoua_catalog_v1";
var ok=!!(C.url&&C.publishableKey&&location.protocol!=="file:"),BASE=ok?C.url.replace(/\/$/,""):"";
window.MOVIES=[];window.GENRES={};window.TYG={films:[],series:[],cartoons:[]};window.KUA_SITE={hidden:[],recs:[],blocks:[],settings:{}};
function rpc(name,body,token){return fetch(BASE+"/rest/v1/rpc/"+name,{method:"POST",headers:Object.assign({apikey:C.publishableKey,"Content-Type":"application/json"},token?{Authorization:"Bearer "+token}:{}),body:JSON.stringify(body||{})})
  .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})}
window.KUA_RPC=rpc;
function apply(d){var M=window.MOVIES,G=window.GENRES,T=window.TYG;M.length=0;(d.titles||[]).forEach(function(t){M.push(t)});
  Object.keys(G).forEach(function(k){delete G[k]});["films","series","cartoons"].forEach(function(s){T[s].length=0});
  (d.genres||[]).forEach(function(g){G[g.slug]=[g.icon||"🎬",g.uk,g.ru||g.uk,g.en||g.uk];(g.sections||[]).forEach(function(s){if(T[s])T[s].push(g.slug)})});
  var st=d.settings||{},tg=st.support_telegram_url;if(typeof tg==="string"&&/^https:\/\/t\.me\/[\w+/-]+$/.test(tg)&&window.KUA_CONFIG)window.KUA_CONFIG.supportTelegramUrl=tg;
  var ed=(d.blocks||[]).filter(function(b){return b.slug==="editors"})[0];
  window.KUA_SITE={blocks:d.blocks||[],recs:ed?ed.items:[],settings:st,hidden:[]}}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){return null}}
function save(s){try{localStorage.setItem(KEY,s)}catch(e){}}
document.documentElement.classList.add("kua-loading");
function done(){document.documentElement.classList.remove("kua-loading")}
function banner(msg,retry){var show=function(){if(document.getElementById("kerr"))return;var b=document.createElement("div");b.id="kerr";b.className="kerr";b.setAttribute("role","alert");b.innerHTML="<p>"+msg+"</p>";
  if(retry){var x=document.createElement("button");x.type="button";x.className="btn";x.textContent=retry;x.onclick=function(){location.reload()};b.appendChild(x)}
  var tb=document.querySelector(".topbar");if(tb&&tb.parentNode)tb.parentNode.insertBefore(b,tb.nextSibling);else document.body.insertBefore(b,document.body.firstChild)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",show);else show()}
function L(){try{return+localStorage.getItem("kinoua_lang")||0}catch(e){return 0}}
var cachedStr=null;try{cachedStr=localStorage.getItem(KEY)}catch(e){}var cached=null;try{cached=cachedStr&&JSON.parse(cachedStr)}catch(e){cached=null}
var fresh=ok?rpc("public_catalog"):Promise.reject(new Error("not configured"));
var base;
if(cached&&cached.titles){apply(cached);base=Promise.resolve();
  fresh.then(function(d){var s=JSON.stringify(d);if(s===cachedStr)return;save(s);var sig="kinoua_reload_"+(d.v||"")+"_"+s.length;try{if(!sessionStorage.getItem(sig)){sessionStorage.setItem(sig,"1");location.reload()}}catch(e){}}).catch(function(){})}
else base=fresh.then(function(d){save(JSON.stringify(d));apply(d)}).catch(function(){
  banner(["Не вдалося завантажити каталог: немає зв’язку з базою даних.","Не удалось загрузить каталог: нет связи с базой данных.","Couldn’t load the catalog: the database is unreachable."][L()],["Спробувати ще раз","Попробовать снова","Try again"][L()])});
// Попередній перегляд неопублікованого тайтла (адмін)
var P=new URLSearchParams(location.search),prev=P.get("preview")==="1"&&P.get("id");
function loadScript(src,attrs){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;Object.keys(attrs||{}).forEach(function(k){s.setAttribute(k,attrs[k])});s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
if(prev&&ok)base=base.then(function(){return loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js",{integrity:"sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok",crossorigin:"anonymous"})})
  .then(function(){return loadScript("js/auth.js?v=5.0")}).then(function(){var A=window.KUA_AUTH;if(!A||!A.client)throw new Error("auth");return A.client.rpc("admin_preview",{p_slug:prev})})
  .then(function(r){if(r.error||!r.data)throw r.error||new Error("not found");var t=r.data.title,M=window.MOVIES;for(var i=M.length-1;i>=0;i--)if(M[i].id===t.id)M.splice(i,1);M.push(t);window.KUA_PREVIEW={slug:t.id,status:t.pub_status,detail:r.data.detail};
    banner(["Попередній перегляд · статус: ","Предпросмотр · статус: ","Preview · status: "][L()]+t.pub_status)})
  .catch(function(){banner(["Попередній перегляд доступний лише адміністраторам після входу.","Предпросмотр доступен только администраторам после входа.","Preview is available to signed-in admins only."][L()])});
window.KUA_READY=base.then(done,done);
// Оголошення (вмикається в адмін-панелі → Налаштування)
window.KUA_READY.then(function(){var st=window.KUA_SITE.settings,a=st.announcement;if(st.announcement_enabled!==true||!a)return;var tx=typeof a==="string"?a:(a[["uk","ru","en"][L()]]||a.uk||"");if(!tx)return;
  var sig="kinoua_ann_"+tx.length+"_"+tx.slice(0,24);try{if(sessionStorage.getItem(sig))return}catch(e){}
  var b=document.createElement("div");b.className="ann";b.setAttribute("role","note");var p=document.createElement("p");p.textContent=tx;var x=document.createElement("button");x.type="button";x.className="ann-x";x.textContent="✕";x.setAttribute("aria-label",["Закрити","Закрыть","Close"][L()]);
  x.onclick=function(){b.remove();try{sessionStorage.setItem(sig,"1")}catch(e){}};b.appendChild(p);b.appendChild(x);var tb=document.querySelector(".topbar");if(tb)tb.parentNode.insertBefore(b,tb);else document.body.insertBefore(b,document.body.firstChild)});
// Перегляд сторінки тайтлу: серверна функція з дедуплікацією (той самий відвідувач — раз на 30 хв) і лімітами за хешем IP. З локальної розробки не пишеться.
window.KUA_TRACK_VIEW=function(id){if(!ok||!/^[a-z0-9][a-z0-9-]{1,99}$/.test(id)||/^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$/.test(location.hostname)||window.KUA_PREVIEW)return;
  var vid;try{vid=localStorage.getItem("kinoua_vid");if(!vid){vid=(crypto.randomUUID?crypto.randomUUID():"10000000-1000-4000-8000-100000000000".replace(/[018]/g,function(c){return(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)}));localStorage.setItem("kinoua_vid",vid)}}catch(e){return}
  rpc("track_view",{p_slug:id,p_visitor:vid}).catch(function(){})};
// Подробиці тайтлу (опис, актори, сезони, серії, джерела відео)
window.KUA_TITLE=function(id){if(window.KUA_PREVIEW&&window.KUA_PREVIEW.slug===id)return Promise.resolve(window.KUA_PREVIEW.detail);
  return rpc("public_title",{p_slug:id}).then(function(d){if(!d)throw new Error("not found");return d})};
})();
