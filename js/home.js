// Головна сторінка KinoUA
(function(){
var K=window.KUA,esc=K.esc,N=K.N,L=K.lang(),D=KUA_I18N.dict("home"),RM=matchMedia("(prefers-reduced-motion: reduce)");
function t(k){return D[k][L]}function $(s){return document.querySelector(s)}function q(s){return document.querySelectorAll(s)}
var ALL=MOVIES.slice(),pop=function(a,b){return(a.pop||9999)-(b.pop||9999)||a.rank-b.rank};
var FILMS=ALL.filter(function(m){return m.ty==="films"&&m.tmdb}).sort(pop),CARTS=ALL.filter(function(m){return m.ty==="cartoons"&&m.tmdb}).sort(pop),SER=ALL.filter(function(m){return m.ty==="series"}).sort(pop);
var I={play:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>',
prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>'};
function meta(m){return[m.y,K.genres(m,L),m.ty==="series"&&m.sc?K.seasons(m.sc,L):(m.m?m.m+" "+t("min"):null),m.cert?m.cert.v:null].filter(Boolean).join(" · ")}
// IMDb і TMDB — різні сервіси: кожна оцінка підписана своїм джерелом, IMDb веде на сторінку саме цього тайтлу
function rate(m){var ri=K.rating(m,"IMDb"),rt=K.rating(m,"TMDB"),iu=K.imdbUrl(m);
return(ri&&iu?'<a class="rchip" href="'+iu+'" target="_blank" rel="noopener" aria-label="IMDb '+ri.v.toFixed(1)+'/10 — '+esc(t("imdbOpen"))+'"><b>IMDb</b> '+ri.v.toFixed(1)+'<small>/10</small></a>':'')+(rt?'<span class="rchip" title="TMDB"><b>TMDB</b> '+rt.v.toFixed(1)+'<small>/10</small></span>':'')}
function sdP(m,cls){var s=K.short(m,L);return s?'<p class="'+cls+'"'+(s.lang!==N[L]?' lang="en"':'')+'>'+esc(s.v)+'</p>':''}

/* ---------- 1. Головний банер ---------- */
var hero={i:0,ids:[]};
function heroBuild(){var pick=[],add=function(m){if(m&&m.backdrop&&m.trailer&&pick.indexOf(m)<0&&K.released(m))pick.push(m)};
FILMS.slice(0,8).forEach(function(m){if(pick.length<3)add(m)});add(CARTS[0]);add(SER[0]);hero.ids=pick.map(function(m){return m.id});
var el=$("#hero"),n=pick.length;el.setAttribute("aria-label",t("heroL"));
el.innerHTML='<div class="hstage">'+pick.map(function(m,j){var tt=K.title(m,L);return'<article class="hslide'+(j===hero.i?' on':'')+'" aria-roledescription="slide" aria-label="'+(j+1)+' '+t("of")+' '+n+': '+esc(tt)+'"'+(j===hero.i?'':' inert aria-hidden="true"')+'>'
+'<div class="hmedia"><img class="hbg" src="'+m.backdrop+'" alt="" width="1280" height="720"'+(j===0?' fetchpriority="high"':' loading="lazy"')+' decoding="async" onerror="this.remove()"></div><div class="wrap hin"><p class="eyebrow light">'+t("k_"+m.ty)+' · '+t("heroPop")+'</p><h2 class="htitle">'+esc(tt)+'</h2>'+(tt!==m.t?'<p class="hot" lang="en">'+esc(m.t)+'</p>':'')
+'<p class="hmeta">'+rate(m)+'<span>'+esc(meta(m))+'</span></p>'+sdP(m,"hdesc")+'<div class="acts"><button type="button" class="btn" data-tr="'+m.id+'">'+I.play+t("trailer")+'</button><a class="btn secondary" href="movie.html?id='+m.id+'">'+t("more")+'<span class="vh">: '+esc(tt)+'</span></a></div></div></article>'}).join("")+'</div>'
+'<div class="wrap hctl"><div class="hthumbs" role="group" aria-label="'+t("heroL")+'">'+pick.map(function(m,j){return'<button type="button" class="hthumb" data-j="'+j+'" aria-label="'+t("sl")+' '+(j+1)+': '+esc(K.title(m,L))+'"'+(j===hero.i?' aria-current="true"':'')+'><img src="'+m.poster+'" alt="" width="500" height="750" loading="lazy"><span class="hbar"></span></button>'}).join("")+'</div>'
+'<div class="harrows"><button type="button" class="rbtn2 dark" data-d="-1" aria-label="'+t("prv")+'">'+I.prev+'</button><button type="button" class="rbtn2 dark" data-d="1" aria-label="'+t("nxt")+'">'+I.next+'</button></div></div>';
el.querySelectorAll("[data-tr]").forEach(function(b){b.addEventListener("click",function(){K.trailer(K.byId(b.dataset.tr),L,b)})});
el.querySelectorAll("[data-d]").forEach(function(b){b.addEventListener("click",function(){heroGo(hero.i+ +b.dataset.d)})});
el.querySelectorAll("[data-j]").forEach(function(b){b.addEventListener("click",function(){heroGo(+b.dataset.j)})})}
function heroGo(j){var n=hero.ids.length;hero.i=(j+n)%n;q("#hero .hslide").forEach(function(s,k){var on=k===hero.i;s.classList.toggle("on",on);if(on){s.removeAttribute("inert");s.removeAttribute("aria-hidden");var im=s.querySelector(".hbg");if(im)im.loading="eager"}else{s.setAttribute("inert","");s.setAttribute("aria-hidden","true")}});
q("#hero .hthumb").forEach(function(d,k){if(k===hero.i)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current")})}
// Свайп по банеру перемикає слайди (вертикальна прокрутка сторінки не блокується: touch-action:pan-y)
(function(){var el=$("#hero"),sx=null,sy=0;el.addEventListener("pointerdown",function(e){if(e.pointerType==="mouse"||!e.target.closest(".hstage"))return;sx=e.clientX;sy=e.clientY});
el.addEventListener("pointerup",function(e){if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)heroGo(hero.i+(dx<0?1:-1))});
el.addEventListener("pointercancel",function(){sx=null})})();
(function(){var el=$("#hero"),hold=false;["mouseenter","focusin"].forEach(function(e){el.addEventListener(e,function(){hold=true})});["mouseleave","focusout"].forEach(function(e){el.addEventListener(e,function(){hold=false})});
setInterval(function(){if(!hold&&!RM.matches&&!document.hidden&&!document.querySelector("dialog[open]"))heroGo(hero.i+1)},9000)})();

/* ---------- 2. Подвійні субтитри: справжній плеєр із таймкодами ---------- */
var player=null,PAIRS=[["uk","en"],["ru","en"],["uk","ru"],["uk","ru","en"],["uk"],["ru"],["en"]],TAG={uk:"UA",ru:"RU",en:"EN"};
function pairsUi(){var cur=K.subPrefs().langs.join(",");q("#pairs button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.p===cur))})}
function dualBuild(){var S=window.KUA_SCENE;if(S.lvl&&$("#dpl"))$("#dpl").innerHTML='<span class="lvtag">≈ '+esc(S.lvl.v)+'</span> '+t("lvlScene")+' — '+t("lvlSceneN");player=K.DualPlayer($("#dp"),{src:S.src,poster:S.poster,cues:S.cues,vtt:S.vtt,gloss:S.gloss,title:t("sceneT"),L:L,onPrefs:pairsUi});
$("#pairs").innerHTML=PAIRS.map(function(p){return'<button type="button" data-p="'+p.join(",")+'" aria-pressed="false">'+p.map(function(l){return'<span class="pt pt-'+l+'" aria-hidden="true">'+TAG[l]+'</span>'}).join('<i aria-hidden="true">+</i>')+'<span class="vh">'+p.map(function(l){return t("lang_"+l)}).join(" + ")+'</span></button>'}).join("");
q("#pairs button").forEach(function(b){b.addEventListener("click",function(){player.setLangs(b.dataset.p.split(","));pairsUi();if(player.video.paused&&player.video.currentTime<0.5)player.seekTo(4.6)})});pairsUi()}
function playDemo(){var v=$("#demoVid"),rm=RM.matches;$("#demo").scrollIntoView({behavior:rm?"auto":"smooth",block:"center"});setTimeout(function(){var p=v.play();if(p&&p.catch)p.catch(function(){});v.focus({preventScroll:true})},rm?0:450)}
$("#watchDemo").addEventListener("click",playDemo);$("#ctaDemo").addEventListener("click",playDemo);

/* ---------- Статистика каталогу (реальні числа з даних) ---------- */
function stats(){var eps=0;SER.forEach(function(s){eps+=s.ec||0});var it=[[FILMS.length,t("stF")],[CARTS.length,t("stC")],[SER.length,t("stS")],[eps,t("stE")],[3,t("stL")]];
$("#stats").innerHTML=it.map(function(x){return'<div class="stat"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join("")}

/* ---------- 3. Популярні фільми: безшовна стрічка (друга копія прихована від читачів і клавіатури) ---------- */
var mq={pos:0,w:0,raf:0,last:0,hover:false,focus:false,user:false,drag:null,target:null};
function mqBuild(){var tr=$("#mqt"),cards=FILMS.map(function(m){return K.card(m,L)});
tr.innerHTML='<div class="mq-set" role="list">'+cards.map(function(c){return'<div role="listitem">'+c+'</div>'}).join("")+'</div><div class="mq-set" aria-hidden="true" inert>'+cards.join("")+'</div>';
tr.querySelectorAll('[aria-hidden="true"] a').forEach(function(a){a.tabIndex=-1});mqMeasure();mqLabels();if(!mq.raf)mq.raf=requestAnimationFrame(mqTick)}
function mqMeasure(){var s=q("#mqt .mq-set");if(s.length<2)return;mq.w=s[1].offsetLeft-s[0].offsetLeft;mq.pos=((mq.pos%mq.w)+mq.w)%mq.w}
function mqPaused(){return mq.user||mq.hover||mq.focus||mq.drag||document.hidden||RM.matches}
function mqTick(ts){var dt=Math.min(64,ts-(mq.last||ts));mq.last=ts;
if(mq.target!==null){var d=mq.target-mq.pos;if(Math.abs(d)<1||RM.matches){mq.pos=mq.target;mq.target=null}else mq.pos+=d*Math.min(1,dt/110)}else if(!mqPaused())mq.pos+=dt*0.03;
if(mq.w){if(mq.pos>=mq.w){mq.pos-=mq.w;if(mq.target!==null)mq.target-=mq.w}if(mq.pos<0){mq.pos+=mq.w;if(mq.target!==null)mq.target+=mq.w}}
var tr=$("#mqt");if(tr)tr.style.transform="translate3d("+(-mq.pos).toFixed(2)+"px,0,0)";mq.raf=requestAnimationFrame(mqTick)}
function mqStep(d){var it=$("#mqt .pc");var w=it?it.getBoundingClientRect().width+22:220;var base=mq.target!==null?mq.target:mq.pos;mq.target=Math.round((base+d*w*3)/w)*w}
function mqLabels(){var b=$("#mqs"),off=mq.user||RM.matches;b.setAttribute("aria-pressed",String(off));b.setAttribute("aria-label",t(off?"mqr":"mqs"));b.title=t(off?"mqr":"mqs");
b.innerHTML=off?'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>'}
(function(){var mr=$("#marq"),tr=$("#mqt");
mr.addEventListener("mouseenter",function(){mq.hover=true});mr.addEventListener("mouseleave",function(){mq.hover=false});
mr.addEventListener("focusin",function(e){mq.focus=true;var a=e.target.closest(".pc");if(!a)return;var r=a.getBoundingClientRect(),c=mr.getBoundingClientRect();if(r.left<c.left||r.right>c.right)mq.target=mq.pos+(r.left-c.left)-24});
mr.addEventListener("focusout",function(){mq.focus=false});
tr.addEventListener("pointerdown",function(e){if(e.button)return;mq.drag={x:e.clientX,p:mq.pos,moved:false,id:e.pointerId};mq.target=null});
addEventListener("pointermove",function(e){var d=mq.drag;if(!d||e.pointerId!==d.id)return;var dx=e.clientX-d.x;if(Math.abs(dx)>6){d.moved=true;if(!tr.hasPointerCapture(d.id))try{tr.setPointerCapture(d.id)}catch(x){}}if(d.moved)mq.pos=d.p-dx});
function end(e){var d=mq.drag;if(!d||e.pointerId!==d.id)return;mq.drag=null;if(d.moved){tr.dataset.drag="1";setTimeout(function(){delete tr.dataset.drag},50)}if(e.pointerType==="touch")mq.hover=false}
addEventListener("pointerup",end);addEventListener("pointercancel",end);
tr.addEventListener("click",function(e){if(tr.dataset.drag){e.preventDefault();e.stopPropagation()}},true);tr.addEventListener("dragstart",function(e){e.preventDefault()});
$("#mqp").addEventListener("click",function(){mqStep(-1)});$("#mqn").addEventListener("click",function(){mqStep(1)});
$("#mqs").addEventListener("click",function(){if(RM.matches)return;mq.user=!mq.user;mqLabels()});
addEventListener("resize",mqMeasure);document.addEventListener("visibilitychange",function(){mq.last=0})})();

/* ---------- 4. Мультфільми: великий банер + стрічка ---------- */
function cartBuild(){var f=CARTS[0];$("#cartFeat").innerHTML='<article class="bigcard"><img src="'+f.backdrop+'" alt="" width="1280" height="720" loading="lazy" decoding="async" onerror="this.remove()"><div class="bc-in"><p class="eyebrow light">'+t("cartTop")+'</p><h3>'+esc(K.title(f,L))+'</h3><p class="hmeta">'+rate(f)+'<span>'+esc(meta(f))+'</span></p>'+sdP(f,"bc-d")+'<div class="acts"><button type="button" class="btn" data-tr="'+f.id+'">'+I.play+t("trailer")+'</button><a class="btn secondary" href="movie.html?id='+f.id+'">'+t("more")+'<span class="vh">: '+esc(K.title(f,L))+'</span></a></div></div></article>';
var cb=$("#cartFeat [data-tr]");cb.addEventListener("click",function(){K.trailer(f,L,cb)});
$("#cartRail").innerHTML=K.rail("cartr",CARTS.slice(1).map(function(m){return K.card(m,L)}).join(""),L,t("cartH"));K.railInit($("#cartr"))}

/* ---------- 5. Серіали: широкі картки з кадрами ---------- */
function serBuild(){$("#sgrid").innerHTML=SER.map(function(m,i){var tt=K.title(m,L),r=(m.ratings||[])[0],s=K.short(m,L);return'<a class="scard'+(i===0?' wide':'')+'" href="movie.html?id='+m.id+'"><img src="'+m.backdrop+'" alt="" width="1280" height="720" loading="lazy" decoding="async" onerror="this.remove()"><span class="sc-in"><span class="sc-tag">'+K.seasons(m.sc,L)+' · '+m.ec+' '+t("eps")+'</span><b>'+esc(tt)+'</b>'+(tt!==m.t?'<small lang="en">'+esc(m.t)+'</small>':'')+'<span class="sc-m">'+(r?'<span class="star">'+K.STAR+r.v.toFixed(1)+' <i class="rsrc">'+r.src+'</i></span>':'')+esc(K.genres(m,L))+'</span>'+(s?'<span class="sc-d"'+(s.lang!==N[L]?' lang="en"':'')+'>'+esc(s.v)+'</span>':'')+'</span></a>'}).join("")}

/* ---------- 6. Нещодавно вийшли ---------- */
function newBuild(){var today=new Date().toISOString().slice(0,10);$("#row").innerHTML=ALL.filter(function(m){return m.date&&m.date<=today&&m.tmdb}).sort(function(a,b){return a.date<b.date?1:-1}).slice(0,6).map(function(m){return K.card(m,L)}).join("")}

/* ---------- 7. Переваги: кожна картка з реальним візуальним змістом ---------- */
function bentoBuild(){var P=FILMS.slice(0,6),tr=FILMS.filter(function(m){return m.trailer&&m.backdrop})[3]||FILMS[0],S=window.KUA_SCENE;
$("#bento").innerHTML=
'<article class="card wide b-subs"><div><span class="badge">01</span><h3>'+t("c1t")+'</h3><p>'+t("c1p")+'</p><a class="btn" href="#dual">'+t("c1b")+'</a></div><div class="mini-player" aria-hidden="true"><img src="'+S.poster+'" alt="" width="1280" height="720" loading="lazy"><span class="mp-l mp-uk"><i>UA</i>Я не можу здатися зараз.</span><span class="mp-l mp-en"><i>EN</i>I can’t give up now.</span><span class="mp-bar"><span></span></span></div></article>'
+'<article class="card b-cat"><span class="badge">02</span><h3>'+t("c2t")+'</h3><p>'+t("c2p")+'</p><div class="fanx" aria-hidden="true">'+P.map(function(m){return'<img src="'+m.poster+'" alt="" width="500" height="750" loading="lazy">'}).join("")+'</div><a class="lnk" href="catalog.html">'+t("b2")+' →</a></article>'
+'<article class="card b-tr"><span class="badge">03</span><h3>'+t("c3t")+'</h3><p>'+t("c3p")+'</p><button type="button" class="trtile" data-tr="'+tr.id+'"><img src="'+tr.backdrop+'" alt="" width="1280" height="720" loading="lazy"><span class="tl-play">'+I.play+'</span><span class="trcap">'+esc(K.title(tr,L))+' — '+t("trailer")+'</span></button></article>'
+'<article class="card wide b-dict"><div class="dict"><div><b lang="en">to give up</b><small>[ɡɪv ʌp]</small></div><div class="tr">'+t("dt")+'</div><p class="dex"><span lang="en">Don’t give up on your dreams.</span><br>'+t("dex")+'</p><div class="row"><button type="button" id="say"'+("speechSynthesis" in window?'':' hidden')+'>🔊 '+t("vo")+'</button><button type="button" id="save"></button></div></div><div><span class="badge">04</span><h3>'+t("c4t")+'</h3><p>'+t("c4p")+'</p><a class="btn" href="#dual">'+t("c4b")+'</a></div></article>'
+'<article class="card b-lang"><span class="badge">05</span><h3>'+t("c5t")+'</h3><p>'+t("c5p")+'</p><div class="langs3" role="group" aria-label="'+t("c5t")+'">'+["UA · Українська","RU · Русский","EN · English"].map(function(s,i){return'<button type="button" data-l="'+i+'" aria-pressed="'+(i===L)+'" lang="'+N[i]+'">'+s+'</button>'}).join("")+'</div></article>'
+'<article class="card b-noads"><span class="badge">06</span><h3>'+t("c6t")+'</h3><p>'+t("c6p")+'</p><div class="clean" aria-hidden="true"><span class="cl-screen"><span class="cl-play">'+I.play+'</span></span><span class="cl-l"></span><span class="cl-l s"></span></div></article>'
+'<article class="card b-set"><span class="badge">07</span><h3>'+t("c7t")+'</h3><p>'+t("c7p")+'</p><div class="set"><label for="sz">'+t("s1")+'</label><input id="sz" type="range" min="14" max="34" value="22"><label for="bt">'+t("s2")+'</label><input id="bt" type="range" min="0" max="50" value="8"><div class="prev" id="prev"><span id="pt" style="font-size:22px">It’s a piece of cake.</span></div></div><a class="lnk" href="profile.html#subs">'+t("subSet")+' →</a></article>'
+'<article class="card b-theme"><span class="badge">08</span><h3>'+t("c8t")+'</h3><p>'+t("c8p")+'</p><div class="themes3" role="group" aria-label="'+t("c8t")+'">'+["dark","light","auto"].map(function(m){return'<button type="button" data-theme-set="'+m+'" aria-pressed="false"><span class="th-'+m+'" aria-hidden="true"></span>'+t("th_"+m)+'</button>'}).join("")+'</div></article>';
var tt0=$(".trtile");tt0.addEventListener("click",function(){K.trailer(tr,L,tt0)});
q("#bento .langs3 button").forEach(function(b){b.addEventListener("click",function(){var i=+b.dataset.l;try{localStorage.setItem("kinoua_lang",String(i))}catch(e){}L=i;apply()})});
q("#bento [data-theme-set]").forEach(function(b){b.addEventListener("click",function(){KUATheme.set(b.dataset.themeSet)})});if(window.KUATheme)KUATheme.sync();
var save=$("#save"),saved=K.words().some(function(x){return x.w==="give up"});save.textContent=saved?t("sd"):t("add");save.disabled=saved;
save.addEventListener("click",function(){var g=KUA_SCENE.gloss["give up"];K.addWord({w:"give up",ipa:g.ipa,uk:g.uk,ru:g.ru,ex:g.ex,src:"KinoUA",at:new Date().toISOString().slice(0,10)});save.textContent=t("sd");save.disabled=true});
var say=$("#say");if(say)say.addEventListener("click",function(){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance("give up");u.lang="en-GB";u.rate=.85;speechSynthesis.speak(u)}catch(e){}});
var sz=$("#sz"),bt=$("#bt"),pt=$("#pt"),pv=$("#prev");sz.addEventListener("input",function(){pt.style.fontSize=sz.value+"px"});bt.addEventListener("input",function(){pv.style.paddingBottom=(14+Number(bt.value))+"px"})}

/* ---------- 8. Демо-ролик ---------- */
var CH=[[0,"ch0"],[4.4,"ch1"],[10.2,"ch2"],[14,"ch3"],[23.3,"ch4"],[27.3,"ch5"],[36,"ch6"],[43.2,"ch7"]];
function demoBuild(){$("#chapters").innerHTML=CH.map(function(c){return'<li><button type="button" data-t="'+c[0]+'"><span class="tc">'+Math.floor(c[0]/60)+":"+String(Math.floor(c[0]%60)).padStart(2,"0")+'</span>'+t(c[1])+'</button></li>'}).join("");
q("#chapters button").forEach(function(b){b.addEventListener("click",function(){var v=$("#demoVid");v.currentTime=+b.dataset.t;var p=v.play();if(p&&p.catch)p.catch(function(){})})});
$("#demoErr").innerHTML='<p>'+t("vErr")+'</p>'}
(function(){var v=$("#demoVid");v.addEventListener("error",function(){$("#demoErr").hidden=false},true);v.querySelector("source").addEventListener("error",function(){$("#demoErr").hidden=false});
v.addEventListener("timeupdate",function(){var c=-1;CH.forEach(function(x,i){if(v.currentTime>=x[0])c=i});q("#chapters button").forEach(function(b,i){if(i===c)b.setAttribute("aria-current","true");else b.removeAttribute("aria-current")})})})();

/* ---------- 9. Кроки, фінальний блок ---------- */
function stepsBuild(){var P=FILMS.slice(6,9);$("#steps").innerHTML=
'<li><span class="sv sv1" aria-hidden="true">'+P.map(function(m){return'<img src="'+m.poster+'" alt="" width="500" height="750" loading="lazy">'}).join("")+'</span><b>1</b><h3>'+t("s1t")+'</h3><p>'+t("s1p")+'</p></li>'
+'<li><span class="sv sv2" aria-hidden="true"><span class="sl sl-uk"><i>UA</i>Світло має горіти й далі.</span><span class="sl sl-en"><i>EN</i>The light has to keep burning.</span></span><b>2</b><h3>'+t("s2t")+'</h3><p>'+t("s2p")+'</p></li>'
+'<li><span class="sv sv3" aria-hidden="true"><span class="wc"><b>lamp</b> [læmp]<small>лампа</small></span></span><b>3</b><h3>'+t("s3t")+'</h3><p>'+t("s3p")+'</p></li>';
$("#ctaBg").innerHTML=FILMS.slice(0,14).map(function(m){return'<img src="'+m.poster+'" alt="" width="500" height="750" loading="lazy">'}).join("");$("#ctaMark").innerHTML=K.mark.replace(/kmk/g,"kmkc")}

function apply(){document.documentElement.lang=N[L];document.title=t("ti");
q("[data-i]").forEach(function(e){e.innerHTML=t(e.dataset.i)});q("[data-ia]").forEach(function(e){e.setAttribute("aria-label",t(e.dataset.ia))});
q("[data-i-list]").forEach(function(e){e.innerHTML=e.dataset.iList.split(" ").map(function(k){return'<span>'+t(k)+'</span>'}).join("")});
K.header($("#hd"),L,function(i){L=i;apply()});K.footer($("#ft"),L);
heroBuild();dualBuild();stats();mqBuild();cartBuild();serBuild();newBuild();bentoBuild();demoBuild();stepsBuild();
var a6=q('[data-i="a6"]')[0];if(a6)a6.insertAdjacentHTML("beforeend",' '+K.support(L));K.reveal()}
apply();
})();
