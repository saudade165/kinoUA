// Спільні компоненти: шапка, логотип, постер, картка, футер, стрічки, кнопка «нагору»,
// завантаження деталей фільму та налаштування користувача (зберігаються на цьому пристрої).
(function(){
var N=["uk","ru","en"],LB=["UA","RU","EN"],LOC=["uk-UA","ru-RU","en-GB"],TY=["films","series","cartoons"];
var X=KUA_I18N.dict("nav");
var K=window.KUA=Object.assign(window.KUA||{},{N:N,LOC:LOC,TY:TY,X:X});
K.esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
K.lang=function(){try{var s=localStorage.getItem("kinoua_lang");if(s!==null&&N[s])return +s}catch(e){}return 0};
K.names=function(L){return TY.map(function(t){return X[t][L]})};
K.typeName=function(ty,L){return X[ty][L]};
K.title=function(m,L){return(m.n&&m.n[N[L]])||m.t};
K.genres=function(m,L){return m.g.filter(function(k){return GENRES[k]}).map(function(k){return GENRES[k][L+1]}).join(", ")};
// Жанри, які справді є в каталозі для розділу (меню й фільтри не показують порожніх варіантів)
K.genresFor=function(ty){var s={};(window.MOVIES||[]).forEach(function(m){if(!ty||m.ty===ty)m.g.forEach(function(g){s[g]=1})});return Object.keys(GENRES).filter(function(g){return s[g]})};
K.plural=function(n,f,L){if(L===2)return n===1?f[0]:f[1];var a=n%10,b=n%100;return a===1&&b!==11?f[0]:a>=2&&a<=4&&(b<10||b>=20)?f[1]:f[2]};
K.seasons=function(n,L){return n+" "+K.plural(n,X.seas[L].split("|"),L)};
// Текст із перекладом; якщо перекладу немає — англійський оригінал (позначається атрибутом lang)
K.loc=function(o,L){if(!o)return null;var v=o[N[L]];if(v)return{v:v,lang:N[L]};return o.en?{v:o.en,lang:"en"}:null};
K.short=function(m,L){return K.loc(m.sd||m.d,L)};
K.date=function(iso,L){try{return new Intl.DateTimeFormat(LOC[L],{day:"numeric",month:"long",year:"numeric"}).format(new Date(iso+"T12:00:00"))}catch(e){return iso}};
K.released=function(m){return!m.status||m.status==="released"||m.status==="returning"||m.status==="ended"};
K.mark='<svg class="mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><linearGradient id="kmk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A80FF"/><stop offset="1" stop-color="#5B3DDB"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#kmk)"/><path d="M25 13.5 44 25 25 36.5Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><rect x="13" y="44" width="38" height="5.5" rx="2.75" fill="#fff"/><rect x="20" y="52.5" width="24" height="4.5" rx="2.25" fill="#fff" opacity=".6"/></svg>';
var LC=0;K.logo=function(L){var g="kmk"+(++LC);return'<a class="logo" href="index.html" aria-label="'+X.home[L]+'">'+K.mark.replace(/kmk/g,g)+'<span class="wm">Kino<span>UA</span></span></a>'};
K.byId=function(id){return(window.MOVIES||[]).filter(function(m){return m.id===id})[0]};

/* ---------- Налаштування на цьому пристрої (localStorage; без сервера) ---------- */
K.get=function(k,d){try{var v=localStorage.getItem("kinoua_"+k);return v===null?d:JSON.parse(v)}catch(e){return d}};
K.set=function(k,v){try{localStorage.setItem("kinoua_"+k,JSON.stringify(v))}catch(e){}};
var SUB_ORDER=["uk","ru","en"];
K.SUB_ORDER=SUB_ORDER;
K.subPrefs=function(p){var d={langs:["uk","en"],size:100,pos:"bottom",bg:true};if(p){p=Object.assign({},d,p);p.langs=SUB_ORDER.filter(function(l){return p.langs.indexOf(l)>-1});K.set("subs",p);return p}
var v=K.get("subs",d);if(!v||!Array.isArray(v.langs))v=d;v=Object.assign({},d,v);v.langs=SUB_ORDER.filter(function(l){return v.langs.indexOf(l)>-1});return v};
K.favs=function(){var v=K.get("favs",[]);return Array.isArray(v)?v.filter(K.byId):[]};
K.isFav=function(id){return K.favs().indexOf(id)>-1};
K.toggleFav=function(id){var f=K.favs(),i=f.indexOf(id);if(i>-1)f.splice(i,1);else f.unshift(id);K.set("favs",f);return i<0};
K.history=function(){var v=K.get("history",[]);return Array.isArray(v)?v.filter(K.byId):[]};
K.addHistory=function(id){var h=K.history().filter(function(x){return x!==id});h.unshift(id);K.set("history",h.slice(0,24))};
K.words=function(){var v=K.get("words",[]);return Array.isArray(v)?v:[]};
K.addWord=function(w){var a=K.words().filter(function(x){return x.w!==w.w});a.unshift(w);K.set("words",a.slice(0,200))};
K.removeWord=function(w){K.set("words",K.words().filter(function(x){return x.w!==w}))};

/* ---------- Деталі тайтлу: із Supabase (js/store.js → public_title), кешуються на сторінці ---------- */
var DET={},WAIT={};
K.addDetail=function(id,d){DET[id]=d;(WAIT[id]||[]).forEach(function(f){f[0](d)});delete WAIT[id]};
// Подробиці тайтлу — з Supabase (public_title; у режимі попереднього перегляду — admin_preview)
K.loadDetail=function(id){if(DET[id])return Promise.resolve(DET[id]);if(!window.KUA_TITLE)return Promise.reject(new Error("no store"));
return window.KUA_TITLE(id).then(function(d){DET[id]=d;return d})};

/* ---------- Постер і картка ---------- */
K.imgFail=function(img){var p=img.closest(".poster");if(!p)return;var m=K.byId(p.dataset.id);p.classList.remove("real");p.classList.add("fallback");
img.remove();p.insertAdjacentHTML("afterbegin",m&&K.art?K.art(Object.assign({},m,{k:m.k||"noir",c:m.c||["#1b1a3a","#7a5cc7"]})):"");if(!p.querySelector("b"))p.insertAdjacentHTML("beforeend","<b>"+K.esc(m?m.t:"")+"</b>")};
K.poster=function(m,eager){
if(m.poster)return'<span class="poster real" data-id="'+m.id+'"><img src="'+m.poster+'" alt="" width="500" height="750"'+(eager?' fetchpriority="high"':' loading="lazy"')+' decoding="async" onerror="KUA.imgFail(this)"></span>';
return'<span class="poster" data-id="'+m.id+'">'+K.art(m)+'<b>'+K.esc(m.t)+'</b></span>'};
K.STAR='<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
K.metaLine=function(m,L){return K.released(m)?[m.ty==="series"&&m.sc?K.seasons(m.sc,L):m.y,m.cert?m.cert.v:null].filter(Boolean).join(" · "):X.soon[L]+": "+K.date(m.date,L)};
// Оцінка конкретного сервісу (IMDb і TMDB зберігаються окремо й ніколи не змішуються)
K.rating=function(m,src){return(m.ratings||[]).filter(function(r){return r.src===src})[0]||null};
K.imdbUrl=function(m){return m.imdb&&/^tt\d{7,9}$/.test(m.imdb)?"https://www.imdb.com/title/"+m.imdb+"/":null};
K.card=function(m,L){var sd=K.short(m,L),r=(m.ratings||[])[0],ds=sd?' lang="'+sd.lang+'"':'';
return'<a class="pc" href="movie.html?id='+m.id+'"><div class="pw">'+K.poster(m)+'<span class="pbadges">'+(m.ol?'<span class="pb-ol" title="'+K.esc(X.olt[L])+'">'+m.ol.toUpperCase()+'</span>':'')+(m.lvl&&m.lvl.v?'<span class="pb-lv" title="'+K.esc(X.lvt[L])+'">≈'+m.lvl.v+'</span>':'')+'</span>'+(sd?'<span class="pdesc" aria-hidden="true"'+ds+'>'+K.esc(sd.v)+'</span>':'')+'</div><h3>'+K.esc(K.title(m,L))+'</h3>'+(L<2&&K.title(m,L)!==m.t?'<p class="ot" lang="en">'+K.esc(m.t)+'</p>':'')
+'<small class="cm">'+(r?'<span class="star" title="'+K.esc(r.src+' — '+X.rat2[L])+'">'+K.STAR+r.v.toFixed(1)+'<i class="rsrc">'+r.src+'</i></span>':'')+'<span>'+K.esc(K.metaLine(m,L))+'</span></small><small class="cg">'+K.esc(K.genres(m,L))+'</small>'+(sd?'<span class="pc-sd"'+ds+'>'+K.esc(sd.v)+'</span>':'')+'</a>'};

/* ---------- Шапка ---------- */
var UI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
var TI={dark:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',auto:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/>'};
K.header=function(el,L,cb,act){
el.innerHTML=K.logo(L)+'<nav aria-label="'+X.nv[L]+'">'
+TY.map(function(ty){var gl=K.genresFor(ty);return'<div class="dd'+(ty===act?' on':'')+'"><a href="catalog.html?type='+ty+'"'+(ty===act?' aria-current="page"':'')+'>'+X[ty][L]+'</a><div class="menu" style="grid-template-rows:repeat('+Math.ceil(gl.length/2)+',auto)">'+gl.map(function(k){return'<a href="catalog.html?type='+ty+'&amp;genre='+k+'"><span aria-hidden="true">'+GENRES[k][0]+'</span>'+GENRES[k][L+1]+'</a>'}).join("")+'</div></div>'}).join("")
+'<a class="sr" href="search.html"'+(act==="search"?' aria-current="page"':'')+'><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>'+X.s[L]+'</a></nav><div class="hr"><div class="seg lang" role="group" aria-label="'+X.lgl[L]+'">'+LB.map(function(n,i){return'<button type="button" data-l="'+i+'" aria-pressed="'+(i===L)+'" lang="'+N[i]+'">'+n+'</button>'}).join("")+'</div>'
+'<div class="seg theme" role="group" aria-label="'+X.th[L]+'">'+["dark","light","auto"].map(function(m){var l=X.tm[m][L];return'<button type="button" data-theme-set="'+m+'" aria-pressed="false" aria-label="'+l+'" title="'+l+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">'+TI[m]+'</svg></button>'}).join("")+'</div>'
+'<a class="login'+(act==="profile"?' on':'')+'" href="profile.html" aria-label="'+X.prof[L]+'"'+(act==="profile"?' aria-current="page"':'')+'>'+UI+'<span>'+X.lg[L]+'</span></a></div>';
el.querySelectorAll(".lang button").forEach(function(b){b.addEventListener("click",function(){var i=+b.dataset.l;try{localStorage.setItem("kinoua_lang",String(i))}catch(e){}
document.documentElement.classList.add("lswap");setTimeout(function(){document.documentElement.classList.remove("lswap")},300);cb(i)})});
el.querySelectorAll("[data-theme-set]").forEach(function(b){b.addEventListener("click",function(){window.KUATheme&&KUATheme.set(b.dataset.themeSet)})});
if(window.KUATheme)KUATheme.sync();var sk=document.querySelector(".skip");if(sk)sk.textContent=X.skip[L];K.chrome(L)};
// Липка панель і кнопка «нагору» (одна на сторінку)
K.chrome=function(L){var tb=document.querySelector(".topbar");
if(tb&&!tb.dataset.on){tb.dataset.on=1;var f=function(){tb.classList.toggle("scrolled",scrollY>8)};addEventListener("scroll",f,{passive:true});f()}
var b=document.getElementById("totop");if(!b){b=document.createElement("button");b.id="totop";b.type="button";b.className="totop";b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';document.body.appendChild(b);
b.addEventListener("click",function(){var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;scrollTo({top:0,behavior:rm?"auto":"smooth"});var t=document.querySelector(".logo");if(t)t.focus({preventScroll:true})});
var g=function(){b.classList.toggle("show",scrollY>700)};addEventListener("scroll",g,{passive:true});g()}
b.setAttribute("aria-label",X.top[L]);b.title=X.top[L]};

/* ---------- Підтримка й футер ---------- */
var TG='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5l18.5-7.1c.9-.3 1.6.2 1.4 1.3Z"/></svg>';
K.support=function(L,cls){var u=(window.KUA_CONFIG||{}).supportTelegramUrl;
if(u&&/^https:\/\/t\.me\//.test(u))return'<a class="support '+(cls||"")+'" href="'+K.esc(u)+'" target="_blank" rel="noopener">'+TG+'<span>'+X.sup[L]+'</span></a>';
return'<span class="support off '+(cls||"")+'" title="'+X.supNote[L]+'">'+TG+'<span>'+X.sup[L]+' · '+X.supSoon[L]+'</span></span>'};
K.footer=function(el,L){if(!el)return;
el.innerHTML='<div class="fwrap"><div class="fbrand">'+K.logo(L)+'<p>'+X.ft[L]+'</p><p class="small">'+X.ft2[L]+'</p></div><nav class="flinks" aria-label="'+X.fnav[L]+'"><a href="catalog.html">'+X.cat[L]+'</a>'+TY.map(function(ty){return'<a href="catalog.html?type='+ty+'">'+X[ty][L]+'</a>'}).join("")+'<a href="search.html">'+X.s[L]+'</a><a href="profile.html">'+X.prof[L]+'</a>'+K.support(L)+'</nav></div><p class="tmdb">'+X.tmdb[L]+' <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">themoviedb.org</a><br>'+X.imdbD[L]+' <a href="https://developer.imdb.com/non-commercial-datasets/" target="_blank" rel="noopener">imdb.com</a></p>'};

/* ---------- Горизонтальна стрічка ---------- */
K.rail=function(id,html,L,label,cls){return'<div class="rail'+(cls?" "+cls:"")+'" id="'+id+'"><button type="button" class="rbtn prev" aria-label="'+X.prev[L]+'" aria-controls="'+id+'-t"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><div class="rtrack" id="'+id+'-t" role="region" tabindex="0" aria-label="'+K.esc(label)+'">'+html+'</div><button type="button" class="rbtn next" aria-label="'+X.next[L]+'" aria-controls="'+id+'-t"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div>'};
K.railInit=function(root){if(!root)return;var tr=root.querySelector(".rtrack"),pv=root.querySelector(".prev"),nx=root.querySelector(".next");
function upd(){var max=tr.scrollWidth-tr.clientWidth-2;pv.disabled=tr.scrollLeft<=2;nx.disabled=tr.scrollLeft>=max;root.classList.toggle("static",max<=0)}
function go(d){var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;tr.scrollBy({left:d*Math.max(tr.clientWidth*.8,200),behavior:rm?"auto":"smooth"})}
pv.addEventListener("click",function(){go(-1)});nx.addEventListener("click",function(){go(1)});
tr.addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);
tr.querySelectorAll("img").forEach(function(i){i.addEventListener("load",upd)});upd()};
// Поява розділів і карток (вимикається при prefers-reduced-motion)
K.reveal=function(sel){if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.classList.add("rv");
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px",threshold:.06});
document.querySelectorAll(sel||".reveal").forEach(function(s){if(!s.classList.contains("in"))io.observe(s)})};
})();
