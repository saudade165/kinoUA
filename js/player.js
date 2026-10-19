// Плеєр KinoUA з кількома рядками субтитрів одночасно (власні відео з таймкодами),
// словникові картки для слів і модальне вікно трейлера YouTube.
(function(){
var K=window.KUA,esc=K.esc,P=KUA_I18N.dict("player"),LN={uk:"УКРАЇНСЬКА",ru:"РУССКИЙ",en:"ENGLISH"};
function fmt(s){s=Math.max(0,s|0);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
var I={play:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>',
pause:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
vol:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
mute:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',
cc:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 10.5a2 2 0 1 0 0 3M17 10.5a2 2 0 1 0 0 3"/></svg>',
fs:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
spk:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>'};
// Розбиття англійського рядка: фрази й слова зі словника стають кнопками, решта — простий текст
function tokens(text,gloss){var keys=Object.keys(gloss).sort(function(a,b){return b.length-a.length}),out=[],i=0,low=text.toLowerCase();
while(i<text.length){var hit=null;if(i===0||/[^a-z']/i.test(text[i-1])){for(var k=0;k<keys.length;k++){var w=keys[k];if(low.substr(i,w.length)===w&&!/[a-z']/i.test(text[i+w.length]||" ")){hit=w;break}}}
if(hit){out.push({w:hit,t:text.substr(i,hit.length)});i+=hit.length}else{var last=out[out.length-1];if(last&&!last.w)last.t+=text[i];else out.push({t:text[i]});i++}}return out}
K.DualPlayer=function(root,o){var L=o.L,pref=K.subPrefs(),avail=K.SUB_ORDER.filter(function(l){return o.cues[l]}),started=false,raf=0;
root.classList.add("dp");root.innerHTML='<div class="dp-stage" data-pos="'+pref.pos+'"><video preload="none" playsinline poster="'+o.poster+'" aria-label="'+esc(o.title)+'"><source src="'+o.src+'" type="video/mp4">'
+avail.map(function(l){return'<track kind="subtitles" srclang="'+l+'" label="'+LN[l]+'" src="'+o.vtt[l]+'">'}).join("")+'</video>'
+'<div class="dp-subs'+(pref.bg?'':' nobg')+'" style="--sub:'+pref.size/100+'"></div><button type="button" class="dp-big">'+I.play+'<span>'+P.play[L]+'</span></button>'
+'<div class="dp-err" hidden><p>'+P.err[L]+'</p></div>'
+'<div class="dp-bar"><button type="button" class="dp-b dp-pp" aria-label="'+P.play[L]+'">'+I.play+'</button><span class="dp-time">0:00 / 0:00</span><input class="dp-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="'+P.seek[L]+'">'
+'<button type="button" class="dp-b dp-mute" aria-label="'+P.mute[L]+'">'+I.vol+'</button><input class="dp-vol" type="range" min="0" max="100" value="100" aria-label="'+P.volume[L]+'">'
+'<button type="button" class="dp-b dp-set" aria-expanded="false" aria-label="'+P.settings[L]+'">'+I.cc+'</button><button type="button" class="dp-b dp-fs" aria-label="'+P.full[L]+'">'+I.fs+'</button></div>'
+'<div class="dp-panel" hidden role="group" aria-label="'+P.settings[L]+'"><p class="dp-h">'+P.langs[L]+'</p>'+K.SUB_ORDER.map(function(l){var ok=avail.indexOf(l)>-1;return'<label class="dp-chk'+(ok?'':' off')+'"><input type="checkbox" value="'+l+'"'+(pref.langs.indexOf(l)>-1&&ok?' checked':'')+(ok?'':' disabled')+'><span>'+LN[l]+'</span></label>'}).join("")
+'<p class="dp-h">'+P.size[L]+' <output class="dp-sv">'+pref.size+'%</output></p><input class="dp-size" type="range" min="70" max="160" step="10" value="'+pref.size+'" aria-label="'+P.size[L]+'">'
+'<p class="dp-h">'+P.pos[L]+'</p><div class="dp-seg"><button type="button" data-pos="bottom">'+P.bottom[L]+'</button><button type="button" data-pos="top">'+P.topp[L]+'</button></div>'
+'<label class="dp-sw"><input type="checkbox" class="dp-bg"'+(pref.bg?' checked':'')+'><span>'+P.bgl[L]+'</span></label></div>'
+'<div class="dp-dict" hidden role="dialog" aria-modal="false" aria-label="'+P.dict[L]+'"></div></div>';
var $=function(s){return root.querySelector(s)},v=$("video"),subs=$(".dp-subs"),stage=$(".dp-stage");
v.querySelectorAll("track").forEach(function(t){t.track.mode="disabled"});
function save(){K.subPrefs(pref);if(o.onPrefs)o.onPrefs(pref)}
function draw(){var t=v.currentTime,lines=pref.langs.filter(function(l){return avail.indexOf(l)>-1}).map(function(l){var c=o.cues[l].filter(function(c){return t>=c[0]&&t<c[1]})[0];return c?{l:l,t:c[2]}:null}).filter(Boolean);
var key=lines.map(function(x){return x.l+x.t}).join("|");if(subs.dataset.k===key)return;subs.dataset.k=key;
subs.innerHTML=lines.map(function(x){var body=x.l==="en"&&o.gloss?tokens(x.t,o.gloss).map(function(p){return p.w?'<button type="button" class="dw" data-w="'+esc(p.w)+'">'+esc(p.t)+'</button>':esc(p.t)}).join(""):esc(x.t);
return'<p class="dl dl-'+x.l+'" lang="'+x.l+'"><span class="dtag" aria-hidden="true">'+LN[x.l]+'</span><span class="dtx">'+body+'</span></p>'}).join("")}
function loop(){draw();if(!v.paused)raf=requestAnimationFrame(loop)}
function ui(){var p=v.paused;$(".dp-pp").innerHTML=p?I.play:I.pause;$(".dp-pp").setAttribute("aria-label",p?P.play[L]:P.pause[L]);root.classList.toggle("playing",!p);
var d=v.duration||0;$(".dp-time").textContent=fmt(v.currentTime)+" / "+fmt(d);if(d&&!seeking)$(".dp-seek").value=Math.round(v.currentTime/d*1000);$(".dp-mute").innerHTML=v.muted||v.volume===0?I.mute:I.vol}
var seeking=false;
function play(){started=true;$(".dp-big").hidden=true;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
$(".dp-big").addEventListener("click",play);$(".dp-pp").addEventListener("click",function(){v.paused?play():v.pause()});
v.addEventListener("click",function(){if(started)v.paused?play():v.pause()});
v.addEventListener("play",function(){closeDict();cancelAnimationFrame(raf);loop();ui()});v.addEventListener("pause",function(){ui();draw()});v.addEventListener("timeupdate",function(){ui();if(v.paused)draw()});
v.addEventListener("loadedmetadata",ui);v.addEventListener("ended",function(){ui();$(".dp-big").hidden=false});
v.addEventListener("error",function(){$(".dp-err").hidden=false},true);v.querySelector("source").addEventListener("error",function(){$(".dp-err").hidden=false});
$(".dp-seek").addEventListener("input",function(){seeking=true;if(v.duration){if(!started){started=true;$(".dp-big").hidden=true}v.currentTime=this.value/1000*v.duration;draw()}});$(".dp-seek").addEventListener("change",function(){seeking=false});
$(".dp-mute").addEventListener("click",function(){v.muted=!v.muted;ui()});$(".dp-vol").addEventListener("input",function(){v.volume=this.value/100;v.muted=this.value==0;ui()});
$(".dp-fs").addEventListener("click",function(){if(document.fullscreenElement)document.exitFullscreen();else if(stage.requestFullscreen)stage.requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen()});
var panel=$(".dp-panel"),sb=$(".dp-set");sb.addEventListener("click",function(){panel.hidden=!panel.hidden;sb.setAttribute("aria-expanded",String(!panel.hidden))});
panel.querySelectorAll("input[type=checkbox][value]").forEach(function(c){c.addEventListener("change",function(){pref.langs=[].slice.call(panel.querySelectorAll("input[value]:checked")).map(function(x){return x.value});save();subs.dataset.k="";draw()})});
$(".dp-size").addEventListener("input",function(){pref.size=+this.value;subs.style.setProperty("--sub",pref.size/100);$(".dp-sv").textContent=pref.size+"%";save()});
function segUi(){panel.querySelectorAll(".dp-seg button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.pos===pref.pos))});stage.dataset.pos=pref.pos}
panel.querySelectorAll(".dp-seg button").forEach(function(b){b.addEventListener("click",function(){pref.pos=b.dataset.pos;segUi();save()})});segUi();
$(".dp-bg").addEventListener("change",function(){pref.bg=this.checked;subs.classList.toggle("nobg",!pref.bg);save()});
// Словникова картка
var dict=$(".dp-dict"),opener=null,canSpeak="speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined";
function closeDict(){if(!dict.hidden){dict.hidden=true;if(opener)opener.focus({preventScroll:true})}}
subs.addEventListener("click",function(e){var b=e.target.closest(".dw");if(!b)return;v.pause();opener=b;var w=b.dataset.w,g=o.gloss[w],tr=L===2?g.uk+" · "+g.ru:g[K.N[L]],ex=L===2?g.exuk:g["ex"+K.N[L]],saved=K.words().some(function(x){return x.w===w});
dict.innerHTML='<button type="button" class="dp-x" aria-label="'+P.close[L]+'">✕</button><p class="dw-h"><b lang="en">'+esc(w)+'</b> <span class="ipa">['+esc(g.ipa)+']</span>'+(canSpeak?'<button type="button" class="dp-say" aria-label="'+P.say[L]+'">'+I.spk+'</button>':'')+'</p><p class="dw-pos" lang="en">'+esc(g.pos)+'</p><p class="dw-tr">'+esc(tr)+'</p><p class="dw-ex"><span lang="en">'+esc(g.ex)+'</span><br>'+esc(ex)+'</p><div class="dw-act"><button type="button" class="btn dw-save"'+(saved?' disabled':'')+'>'+(saved?P.saved[L]:P.save[L])+'</button><button type="button" class="btn secondary dw-go">'+P.resume[L]+'</button></div>';
dict.hidden=false;dict.querySelector(".dp-x").focus();
dict.querySelector(".dp-x").onclick=closeDict;dict.querySelector(".dw-go").onclick=function(){closeDict();play()};
var sp=dict.querySelector(".dp-say");if(sp)sp.onclick=function(){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(w);u.lang="en-GB";u.rate=.85;speechSynthesis.speak(u)}catch(x){}};
dict.querySelector(".dw-save").onclick=function(){K.addWord({w:w,ipa:g.ipa,uk:g.uk,ru:g.ru,ex:g.ex,src:o.title,at:new Date().toISOString().slice(0,10)});this.textContent=P.saved[L];this.disabled=true}});
root.addEventListener("keydown",function(e){if(e.key==="Escape"){if(!dict.hidden)closeDict();else if(!panel.hidden){panel.hidden=true;sb.setAttribute("aria-expanded","false");sb.focus()}}
if(e.key===" "&&e.target===v){e.preventDefault();v.paused?play():v.pause()}});
draw();ui();
return{video:v,setLangs:function(ls){pref.langs=K.SUB_ORDER.filter(function(l){return ls.indexOf(l)>-1});panel.querySelectorAll("input[value]").forEach(function(c){c.checked=pref.langs.indexOf(c.value)>-1});save();subs.dataset.k="";draw()},prefs:function(){return pref},play:play,
seekTo:function(t){v.currentTime=t;draw()}}};

/* ---------- YouTube: офіційний IFrame Player API ----------
   Помилка 153 («Помилка конфігурації відеопрогравача») — YouTube не отримав адресу сторінки (HTTP Referer).
   Так буває, коли сайт відкрито як файл (file://) або сервер віддає Referrer-Policy: no-referrer.
   Тому: <meta name="referrer"> на сторінках, origin/widget_referrer у плеєрі, окреме повідомлення для file://,
   обробка onError (2, 5, 100, 101, 150, 153) і тайм-аут замість нескінченного завантаження. */
var ytQ=[],ytS=0,IC='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
function ytApi(cb){if(window.YT&&YT.Player)return cb(true);ytQ.push(cb);if(ytS)return;ytS=1;var prev=window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady=function(){if(prev)try{prev()}catch(e){}var q=ytQ;ytQ=[];q.forEach(function(f){f(true)})};
var s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.async=true;s.onerror=function(){ytS=0;s.remove();var q=ytQ;ytQ=[];q.forEach(function(f){f(false)})};document.head.appendChild(s)}
K.ytOk=function(m){return!!(m&&m.trailer&&/^[\w-]{11}$/.test(m.trailer.yt||""))};
K.yt=function(box,m,L,o){o=o||{};var id=m.trailer&&m.trailer.yt,url="https://www.youtube.com/watch?v="+encodeURIComponent(id||""),done=false,pl=null,tm;
function fail(msg,code){if(done)return;done=true;clearTimeout(tm);try{if(pl)pl.destroy()}catch(e){}box.classList.add("err");
box.innerHTML='<div class="yt-err" role="alert">'+IC+'<p>'+msg+(code?' <small>('+P.trCode[L]+': '+code+')</small>':'')+'</p>'+(K.ytOk(m)?'<a class="btn" href="'+url+'" target="_blank" rel="noopener">'+P.trOpen[L]+' <span aria-hidden="true">↗</span></a>':'')+'</div>'}
function gone(){return{destroy:function(){box.innerHTML="";box.classList.remove("err")}}}
box.classList.remove("err");if(!K.ytOk(m)){fail(P.trErr[L]);return gone()}
if(location.protocol==="file:"){fail(P.trFile[L],153);return gone()}
box.innerHTML='<div class="yt-load" role="status"><span class="spin" aria-hidden="true"></span>'+P.trLoad[L]+'</div><div class="yt-slot"></div>';
tm=setTimeout(function(){fail(P.trSlow[L])},15000);
ytApi(function(ok){if(done)return;if(!ok)return fail(P.trSlow[L]);
pl=new YT.Player(box.querySelector(".yt-slot"),{host:"https://www.youtube-nocookie.com",videoId:id,width:"100%",height:"100%",
playerVars:{rel:0,playsinline:1,autoplay:o.autoplay?1:0,hl:K.N[L],origin:location.origin,widget_referrer:location.origin+location.pathname},
events:{onReady:function(e){if(done)return;clearTimeout(tm);var ld=box.querySelector(".yt-load");if(ld)ld.remove();box.classList.add("ready");
var f=e.target.getIframe();if(f)f.setAttribute("title",m.t+" — "+P.trailer[L])},
onError:function(e){fail(P.trErr[L],e.data)}}})});
return{destroy:function(){done=true;clearTimeout(tm);try{if(pl)pl.destroy()}catch(e){}box.innerHTML="";box.classList.remove("ready","err")}}};

/* ---------- Трейлер у модальному вікні ---------- */
var dlg,cur=null,keep={y:0,op:null};
K.trailer=function(m,L,opener){if(!m||!m.trailer)return;
if(!dlg){dlg=document.createElement("dialog");dlg.className="trd";dlg.innerHTML='<div class="trbox"><div class="trtop"><p class="trh"></p><button type="button" class="trx">✕</button></div><div class="video trv"></div><p class="meta trm"></p></div>';document.body.appendChild(dlg);
dlg.querySelector(".trx").addEventListener("click",function(){dlg.close()});
dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
dlg.addEventListener("close",function(){if(cur){cur.destroy();cur=null}document.documentElement.classList.remove("modal-open");
var y=keep.y,op=keep.op;requestAnimationFrame(function(){scrollTo(0,y);if(op&&op.focus)try{op.focus({preventScroll:true})}catch(e){}})})}
keep.y=scrollY;keep.op=opener||document.activeElement;
var tt=K.title(m,L);dlg.setAttribute("aria-label",P.trailer[L]+": "+tt);dlg.querySelector(".trx").setAttribute("aria-label",P.close[L]);
dlg.querySelector(".trh").innerHTML='<b>'+esc(tt)+'</b><small lang="en">'+esc(m.trailer.name||P.trailer[L])+'</small>';
dlg.querySelector(".trm").innerHTML=P.trnote[L]+' · <a href="https://www.youtube.com/watch?v='+encodeURIComponent(m.trailer.yt)+'" target="_blank" rel="noopener">YouTube ↗</a>';
document.documentElement.classList.add("modal-open");
if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");
cur=K.yt(dlg.querySelector(".trv"),m,L,{autoplay:true})};
})();
