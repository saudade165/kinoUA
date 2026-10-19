// Профіль. Сервера автентифікації поки немає: сторінка показує стан «не ввійшли» і готовий інтерфейс входу.
// Жоден спосіб входу не імітує успіх. Паролі й токени на клієнті не обробляються.
(function(){
var K=window.KUA,N=K.N,L=K.lang(),esc=K.esc,CFG=(window.KUA_CONFIG||{}).auth||{};
var T=KUA_I18N.dict("profile");
function t(k){return T[k][L]}function $(s){return document.querySelector(s)}
var IG='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>';
var IT='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#29A9EB"/><path fill="#fff" d="m17.6 7.4-1.9 9.5c-.1.6-.5.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2 0-.3-.4-.1l-6.9 4.3-3-.9c-.6-.2-.6-.6.2-.9l11.6-4.5c.5-.2 1 .1.8.7Z"/></svg>';
var IE='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
// Кнопка провайдера: справжнє посилання лише коли в config.js задано серверний маршрут
function prov(icon,label,url,id){if(url)return'<a class="pbtn" id="'+id+'" href="'+esc(url)+'">'+icon+'<span>'+label+'</span></a>';
return'<button type="button" class="pbtn" id="'+id+'" disabled aria-describedby="'+id+'-n">'+icon+'<span>'+label+'</span><small id="'+id+'-n">'+t("soon")+'</small></button>'}
function signedOut(){return'<h1>'+t("h")+'</h1><div class="prof"><section class="pcard welcome" aria-labelledby="pw"><span class="avatar" aria-hidden="true"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><h2 id="pw">'+t("wt")+'</h2><p>'+t("wp")+'</p><p class="note">'+t("dev")+'</p></section>'
+'<section class="pcard auth" aria-labelledby="pa"><h2 id="pa">'+t("st")+'</h2><div class="pbtns">'+prov(IG,t("g"),CFG.googleStartUrl,"pg")+prov(IT,t("tg"),CFG.telegramStartUrl,"pt")+'</div>'
+((!CFG.googleStartUrl||!CFG.telegramStartUrl)?'<p class="meta small">'+t("soonT")+'</p>':'')
+'<div class="or"><span>'+t("or")+'</span></div><form id="ef" novalidate><label for="em">'+t("em")+'</label><input id="em" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="name@example.com" aria-describedby="emh em-err"><p class="meta small" id="emh">'+t("emh")+'</p><p class="ferr" id="em-err" hidden></p>'
+'<button class="btn" id="eb" type="submit">'+IE+'<span>'+t("eb")+'</span></button><div class="fstat" id="fst" role="status" aria-live="polite"></div></form></section></div>'
+device()
+'<p class="phelp">'+t("hp")+' '+K.support(L)+'</p>'}
// Макет для користувача, що ввійшов. Викликається лише з реальною сесією від сервера (window.KUA_SESSION), у демо не використовується.
function signedIn(u){return'<h1>'+t("h")+'</h1><div class="prof"><section class="pcard welcome"><span class="avatar" aria-hidden="true">'+esc((u.name||"?")[0])+'</span><h2>'+esc(u.name||"")+'</h2><dl class="facts"><div><dt>'+t("nm")+'</dt><dd>'+esc(u.name||"")+'</dd></div><div><dt>'+t("em")+'</dt><dd>'+esc(u.email||"")+'</dd></div><div><dt>'+t("via")+'</dt><dd>'+esc(u.provider||"")+'</dd></div></dl><a class="btn secondary" href="'+esc(u.signOutUrl||"#")+'">'+t("out")+'</a></section>'
+'<section class="pcard"><h2>'+t("f1")+'</h2><p class="meta">'+t("emptyF")+'</p><h2>'+t("f2")+'</h2><p class="meta">'+t("emptyH")+'</p></section></div>'}
var LB={uk:"Українська",ru:"Русский",en:"English"};
function cardsOr(ids,empty,id){var ms=ids.map(K.byId).filter(Boolean);return ms.length?K.rail(id,ms.map(function(m){return K.card(m,L)}).join(""),L,t(id)):'<div class="empty-state small"><span class="es-ico" aria-hidden="true">'+empty[0]+'</span><p>'+empty[1]+'</p><a class="btn secondary" href="catalog.html">'+t("toCat")+'</a></div>'}
var HE='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.1 3.3 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.6 0 5.7 3.6 4.1 6.9C19 15.6 12 20 12 20Z"/></svg>',CL='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',BK='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>';
function words(){var w=K.words();return w.length?'<ul class="wlist">'+w.map(function(x){return'<li><div><b lang="en">'+esc(x.w)+'</b> <span class="ipa">['+esc(x.ipa||"")+']</span><p>'+esc(L===2?x.uk+" · "+x.ru:x[K.N[L]]||x.uk)+'</p>'+(x.ex?'<p class="meta" lang="en">'+esc(x.ex)+'</p>':'')+'</div><button type="button" class="btn secondary wdel" data-w="'+esc(x.w)+'" aria-label="'+esc(t("wDel")+": "+x.w)+'">✕</button></li>'}).join("")+'</ul>':'<div class="empty-state small"><span class="es-ico" aria-hidden="true">'+BK+'</span><p>'+t("wEmpty")+'</p><a class="btn secondary" href="index.html#dual">'+t("wTry")+'</a></div>'}
function device(){var sp=K.subPrefs();return'<section class="msec2" id="subs" aria-labelledby="hset"><h2 id="hset">'+t("setH")+'</h2><p class="meta">'+t("setP")+'</p><div class="setgrid">'
+'<div class="pcard"><h3>'+t("uiLang")+'</h3><div class="seg big" role="group" aria-label="'+t("uiLang")+'">'+["uk","ru","en"].map(function(l,i){return'<button type="button" data-ul="'+i+'" aria-pressed="'+(i===L)+'" lang="'+l+'">'+LB[l]+'</button>'}).join("")+'</div>'
+'<h3>'+t("theme")+'</h3><div class="seg big" role="group" aria-label="'+t("theme")+'">'+["dark","light","auto"].map(function(m){return'<button type="button" data-theme-set="'+m+'" aria-pressed="false">'+t("th_"+m)+'</button>'}).join("")+'</div><p class="meta small">'+t("autoNote")+'</p></div>'
+'<div class="pcard subcard"><h3>'+t("subH")+'</h3><p class="meta small">'+t("subP")+'</p><fieldset><legend>'+t("subL")+'</legend>'+K.SUB_ORDER.map(function(l){return'<label class="dp-chk"><input type="checkbox" class="sl" value="'+l+'"'+(sp.langs.indexOf(l)>-1?' checked':'')+'><span>'+LB[l]+'</span></label>'}).join("")+'</fieldset>'
+'<label class="rlab" for="ssz">'+t("subSize")+' <output id="sszv">'+sp.size+'%</output></label><input id="ssz" type="range" min="70" max="160" step="10" value="'+sp.size+'">'
+'<p class="rlab">'+t("subPos")+'</p><div class="seg big" role="group" aria-label="'+t("subPos")+'"><button type="button" data-sp="bottom" aria-pressed="'+(sp.pos==="bottom")+'">'+t("bottom")+'</button><button type="button" data-sp="top" aria-pressed="'+(sp.pos==="top")+'">'+t("top")+'</button></div>'
+'<label class="dp-sw"><input type="checkbox" id="sbg"'+(sp.bg?' checked':'')+'><span>'+t("subBg")+'</span></label>'
+'<div class="subprev" id="subprev" aria-hidden="true"></div></div></div></section>'
+'<section class="msec2" id="favs" aria-labelledby="hfav"><h2 id="hfav">'+t("favH")+' <span class="cnt">'+K.favs().length+'</span></h2><div id="favBody">'+cardsOr(K.favs(),[HE,t("favEmpty")],"favr")+'</div></section>'
+'<section class="msec2" id="hist" aria-labelledby="hhis"><h2 id="hhis">'+t("histH")+'</h2><p class="meta">'+t("histP")+'</p>'+cardsOr(K.history(),[CL,t("histEmpty")],"histr")+'</section>'
+'<section class="msec2" id="words" aria-labelledby="hw"><h2 id="hw">'+t("wH")+' <span class="cnt">'+K.words().length+'</span></h2><div id="wBody">'+words()+'</div></section>'}
function subPrev(){var sp=K.subPrefs(),tx={uk:"Я не можу здатися зараз.",ru:"Я не могу сдаться сейчас.",en:"I can’t give up now."},el=$("#subprev");if(!el)return;
el.dataset.pos=sp.pos;el.innerHTML='<div class="sp-lines'+(sp.bg?'':' nobg')+'" style="--sub:'+sp.size/100+'">'+(sp.langs.length?sp.langs.map(function(l){return'<p class="dl dl-'+l+'"><span class="dtag">'+LB[l].toUpperCase()+'</span><span class="dtx">'+tx[l]+'</span></p>'}).join(""):'<p class="sp-off">'+t("subOff")+'</p>')+'</div>'}
function initDevice(){var sp=function(){return K.subPrefs()},save=function(p){K.subPrefs(p);subPrev()};
document.querySelectorAll("[data-ul]").forEach(function(b){b.addEventListener("click",function(){var i=+b.dataset.ul;try{localStorage.setItem("kinoua_lang",String(i))}catch(e){}L=i;render()})});
document.querySelectorAll("#subs [data-theme-set]").forEach(function(b){b.addEventListener("click",function(){KUATheme.set(b.dataset.themeSet)})});if(window.KUATheme)KUATheme.sync();
document.querySelectorAll("#subs .sl").forEach(function(c){c.addEventListener("change",function(){var p=sp();p.langs=[].slice.call(document.querySelectorAll("#subs .sl:checked")).map(function(x){return x.value});save(p)})});
$("#ssz").addEventListener("input",function(){var p=sp();p.size=+this.value;$("#sszv").textContent=p.size+"%";save(p)});
document.querySelectorAll("[data-sp]").forEach(function(b){b.addEventListener("click",function(){var p=sp();p.pos=b.dataset.sp;document.querySelectorAll("[data-sp]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});save(p)})});
$("#sbg").addEventListener("change",function(){var p=sp();p.bg=this.checked;save(p)});subPrev();
K.railInit($("#favr"));K.railInit($("#histr"));
$("#wBody").addEventListener("click",function(e){var b=e.target.closest(".wdel");if(!b)return;K.removeWord(b.dataset.w);$("#wBody").innerHTML=words();document.querySelector("#words .cnt").textContent=K.words().length;var n=$("#wBody .wdel");(n||$("#hw")).focus()})}
function validEmail(v){return/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)}
function init(){var f=$("#ef");if(!f)return;var inp=$("#em"),err=$("#em-err"),st=$("#fst"),b=$("#eb");
function setErr(m){err.textContent=m||"";err.hidden=!m;inp.setAttribute("aria-invalid",m?"true":"false")}
inp.addEventListener("input",function(){if(!err.hidden&&validEmail(inp.value.trim()))setErr("")});
f.addEventListener("submit",function(e){e.preventDefault();st.textContent="";st.className="fstat";var v=inp.value.trim();
if(!v){setErr(t("e0"));inp.focus();return}if(!validEmail(v)){setErr(t("e1"));inp.focus();return}setErr("");
if(!CFG.emailEndpoint){st.textContent=t("nc");st.className="fstat info";return}
b.disabled=true;b.setAttribute("aria-busy","true");b.querySelector("span").textContent=t("ld");
fetch(CFG.emailEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:v,lang:N[L]})})
.then(function(r){if(!r.ok)throw new Error(r.status);st.textContent=t("ok")+v;st.className="fstat ok"})
.catch(function(){st.textContent=t("er");st.className="fstat err"})
.then(function(){b.disabled=false;b.removeAttribute("aria-busy");b.querySelector("span").textContent=t("eb")})})}
function render(){document.documentElement.lang=N[L];document.title=t("h")+" — KinoUA";
K.header($("#hd"),L,function(i){L=i;render()},"profile");K.footer($("#ft"),L);
var s=window.KUA_SESSION;$("#app").innerHTML=s&&s.user?signedIn(s.user):signedOut();init();if($("#subs"))initDevice();if(location.hash){var h=document.querySelector(location.hash);if(h)setTimeout(function(){h.scrollIntoView()},60)}}
render();
})();
