// Сторінки: каталог, пошук, сторінка фільму/серіалу (один шаблон).
(function(){
var M=window.MOVIES,GN=window.GENRES,K=window.KUA,N=K.N,L=K.lang(),P=document.body.dataset.page,TY=K.TY,esc=K.esc;
var T=KUA_I18N.dict("app"),CT=KUA_I18N.dict("app_ct"),LN=KUA_I18N.dict("app_ln");
function t(k){return T[k][L]}function $(s){return document.querySelector(s)}
function par(){var o={};new URLSearchParams(location.search).forEach(function(v,k){o[k]=v});return o}
function find(){var id=par().id;return M.filter(function(m){return m.id===id})[0]}
function dur(m){if(!m)return null;var h=Math.floor(m/60),r=m%60;return(h?h+" "+t("hr")+" ":"")+(r?r+" "+t("min"):"")}
function grid(a,soon){return a.length?'<div class="grid">'+a.map(function(m){return K.card(m,L)}).join("")+'</div>':'<div class="empty-state"><span class="es-ico" aria-hidden="true">'+ico.search+'</span><p><b>'+t(soon?"soon":"none")+'</b></p>'+(soon?'':'<p class="meta">'+t("tip")+'</p>')+'<a class="btn secondary" href="catalog.html">'+t("tocat")+'</a></div>'}
function rating(m,src){var r=K.rating(m,src);return r?r.v:-1}
var LVLS=["A1","A2","B1","B2","C1","C2"];function lvOf(m){return m.lvl&&m.lvl.v?m.lvl.v:"unk"}
function lnName(c){var n=LN[c]?LN[c][L]:c.toUpperCase();return n.charAt(0).toUpperCase()+n.slice(1)}
function rdate(m){return m.date||(m.y+"-01-01")}
function popv(m){return m.pop||9999}
// Сортування лише за реальними даними: позиція в TMDB Popular (знімок), дата, оцінка IMDb або TMDB (окремо), назва, рік.
// Фільтри діють разом: розділ, жанр, рік, мова оригіналу (ol), рівень CEFR (lvl, кілька значень через кому; unk = не визначено), назва.
function filt(p){var q=(p.q||"").toLowerCase().trim(),s=p.sort||"pop",lv=(p.lvl||"").split(",").filter(Boolean);if(s==="sp")s="pop";
var r=M.filter(function(m){var hay=[m.t,m.n&&m.n.uk,m.n&&m.n.ru].join(" ").toLowerCase();return(!q||hay.indexOf(q)>-1)&&(!p.type||m.ty===p.type)&&(!p.genre||m.g.indexOf(p.genre)>-1)&&(!p.year||String(m.y)===p.year)&&(!p.ol||m.ol===p.ol)&&(!lv.length||lv.indexOf(lvOf(m))>-1)});
r.sort(function(a,b){return s==="st"?K.title(a,L).localeCompare(K.title(b,L),K.LOC[L]):s==="sy"?(b.y-a.y||a.rank-b.rank):s==="sn"?(rdate(b)>rdate(a)?1:rdate(b)<rdate(a)?-1:a.rank-b.rank):s==="sr"?(rating(b,"IMDb")-rating(a,"IMDb")||a.rank-b.rank):s==="srt"?(rating(b,"TMDB")-rating(a,"TMDB")||a.rank-b.rank):s==="rec"?a.rank-b.rank:(popv(a)-popv(b)||a.rank-b.rank)});return r}
function opt(v,l,c){return'<option value="'+v+'"'+(String(c)===String(v)?" selected":"")+'>'+esc(l)+'</option>'}
function sform(q){return'<form class="sf" action="search.html" role="search"><input type="search" name="q" value="'+esc(q)+'" placeholder="'+esc(t("ph"))+'" aria-label="'+esc(t("lq"))+'"><button class="btn">'+t("go")+'</button></form>'}
function catalog(){var p=par(),ty=TY.indexOf(p.type)>-1?p.type:"",ys=[],ol={},lc={unk:0},gl=K.genresFor(ty),so=p.sort==="sp"?"pop":(p.sort||"pop"),lv=(p.lvl||"").split(",");
M.forEach(function(m){if(ty&&m.ty!==ty)return;if(ys.indexOf(m.y)<0)ys.push(m.y);if(m.ol)ol[m.ol]=(ol[m.ol]||0)+1;var v=lvOf(m);lc[v]=(lc[v]||0)+1});ys.sort(function(a,b){return b-a});
var ols=Object.keys(ol).sort(function(a,b){return ol[b]-ol[a]||lnName(a).localeCompare(lnName(b),K.LOC[L])});
function fld(lab,ctl){return'<label class="fld"><small>'+lab+'</small>'+ctl+'</label>'}
return'<div class="chead"><div><p class="eyebrow">'+t("cat")+'</p><h1>'+(ty?CT[ty][L]:t("all"))+'</h1><p class="meta" id="cnt"></p><div class="fchips" id="chips"></div></div><div class="ctl2"><button class="fb" id="fb" type="button" aria-expanded="false" aria-controls="fp"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M7 12h10M10 17h4"/></svg>'+t("fb")+'<i id="bd" aria-hidden="true">0</i></button><label class="sortbox"><small>'+t("sb")+'</small><select id="fs">'+["pop","sn","sr","srt","st","sy","rec"].map(function(s){return opt(s,t(s),so)}).join("")+'</select></label></div></div>'
+'<div class="typeseg" role="group" aria-label="'+t("tyl")+'">'+[""].concat(TY).map(function(x){return'<a href="catalog.html'+(x?'?type='+x:'')+'"'+(x===ty?' aria-current="page"':'')+'>'+(x?CT[x][L]:t("all"))+'</a>'}).join("")+'</div>'
+'<div class="fp" id="fp" role="group" aria-label="'+t("fpp")+'" hidden><div class="fp-row">'
+fld(t("fq0"),'<input id="fq" type="search" placeholder="'+esc(t("ph"))+'" value="'+esc(p.q||"")+'">')
+fld(t("fg0"),'<select id="fg">'+opt("",t("ag"),p.genre||"")+gl.map(function(k){return opt(k,GN[k][L+1],p.genre)}).join("")+'</select>')
+fld(t("fy0"),'<select id="fy">'+opt("",t("ay"),p.year||"")+ys.map(function(y){return opt(y,y,p.year)}).join("")+'</select>')
+fld(t("fol"),'<select id="fo">'+opt("",t("folAll"),p.ol||"")+ols.map(function(c){return opt(c,lnName(c)+" ("+ol[c]+")",p.ol)}).join("")+'</select>')
+'</div><fieldset class="lvset"><legend>'+t("flv")+'</legend><div class="lvchips">'+LVLS.concat(["unk"]).map(function(v){var n=lc[v]||0,on=lv.indexOf(v)>-1;return'<label class="lvc'+(n||on?'':' off')+'"><input type="checkbox" name="lvl" value="'+v+'"'+(on?' checked':'')+(n||on?'':' disabled')+'><span>'+(v==="unk"?t("flvUnk"):esc(T.lvlN[v][L]))+' <small>'+n+'</small></span></label>'}).join("")+'</div><p class="meta lvnote">'+t("flvNote")+'</p></fieldset>'
+'<div class="fp-act"><button type="button" class="btn secondary" id="frs">'+t("fresAll")+'</button></div></div><div id="res" aria-live="polite"></div>'}
function catInit(){var ty=par().type||"";
function lvls(){return[].slice.call(document.querySelectorAll('#fp input[name=lvl]:checked')).map(function(x){return x.value}).join(",")}
function chips(p){var o=[];if(p.type)o.push(["type",CT[p.type][L]]);if(p.genre&&GN[p.genre])o.push(["genre",GN[p.genre][L+1]]);if(p.year)o.push(["year",p.year]);if(p.ol)o.push(["ol",t("fol")+": "+lnName(p.ol)]);
(p.lvl||"").split(",").filter(Boolean).forEach(function(v){o.push(["lvl:"+v,v==="unk"?t("flvUnk"):v])});if(p.q)o.push(["q","“"+p.q+"”"]);
$("#bd").textContent=o.filter(function(c){return c[0]!=="type"}).length;
$("#chips").innerHTML=o.map(function(c){var u=new URLSearchParams();Object.keys(p).forEach(function(k){if(!p[k])return;if(c[0].indexOf("lvl:")===0&&k==="lvl"){var r=p.lvl.split(",").filter(function(x){return x!==c[0].slice(4)}).join(",");if(r)u.set(k,r);return}if(k!==c[0])u.set(k,p[k])});return'<a class="chip2" href="catalog.html?'+u+'" aria-label="'+esc(t("rm")+": "+c[1])+'">'+esc(c[1])+' <span aria-hidden="true">✕</span></a>'}).join("")}
function upd(){var p={q:$("#fq").value,genre:$("#fg").value,year:$("#fy").value,ol:$("#fo").value,lvl:lvls(),sort:$("#fs").value,type:ty},u=new URLSearchParams();
Object.keys(p).forEach(function(k){if(p[k]&&!(k==="sort"&&p[k]==="pop"))u.set(k,p[k])});try{history.replaceState(null,"","?"+u)}catch(e){}chips(p);var r=filt(p);$("#cnt").textContent=t("found")+": "+r.length;$("#res").innerHTML=grid(r,false);K.reveal(".grid .pc")}
["#fq","#fg","#fy","#fo","#fs"].forEach(function(s){$(s).addEventListener("input",upd)});document.querySelectorAll('#fp input[name=lvl]').forEach(function(x){x.addEventListener("change",upd)});
$("#frs").addEventListener("click",function(){$("#fq").value="";$("#fg").value="";$("#fy").value="";$("#fo").value="";document.querySelectorAll('#fp input[name=lvl]').forEach(function(x){x.checked=false});upd();$("#fq").focus()});
$("#fb").addEventListener("click",function(){var h=$("#fp").hidden;$("#fp").hidden=!h;this.setAttribute("aria-expanded",String(h));if(h)$("#fq").focus()});
var p0=par();if(p0.genre||p0.year||p0.q||p0.ol||p0.lvl){$("#fp").hidden=false;$("#fb").setAttribute("aria-expanded","true")}
upd()}
function search(){var q=(par().q||"").trim(),r=q?filt({q:q,sort:"pop"}):[];
return'<p class="eyebrow">KinoUA</p><h1>'+t("srch")+'</h1>'+sform(q)+(q?'<p class="meta">'+t("found")+': '+r.length+'</p>'+grid(r):'<div class="search-hint"><p>'+t("hint")+'</p><div class="tags">'+M.slice().sort(function(a,b){return popv(a)-popv(b)}).slice(0,8).map(function(m){return'<a href="search.html?q='+encodeURIComponent(K.title(m,L))+'">'+esc(K.title(m,L))+'</a>'}).join("")+'</div></div>')}
function notFound(){return'<div class="nf"><span class="nf-code" aria-hidden="true">404</span><h1>'+t("nf")+'</h1><p class="meta">'+t("nft")+'</p>'+sform("")+'<a class="btn secondary" href="catalog.html">'+t("tocat")+'</a></div>'}

/* ---------- Сторінка фільму / серіалу ---------- */
var EXT='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
var ico={play:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>',info:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
cc:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 10.5a2 2 0 1 0 0 3M17 10.5a2 2 0 1 0 0 3"/></svg>',
heart:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.1 3.3 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.6 0 5.7 3.6 4.1 6.9C19 15.6 12 20 12 20Z"/></svg>',
search:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>'};
function similar(m){var sc=M.filter(function(x){return x.id!==m.id}).map(function(x){var s=0;x.g.forEach(function(g){if(m.g.indexOf(g)>-1)s+=2});if(x.ty===m.ty)s+=2;return{x:x,s:s}});
sc.sort(function(a,b){return b.s-a.s||popv(a.x)-popv(b.x)});return sc.slice(0,14).map(function(o){return o.x})}
function subsList(a){return a.map(function(x){return LN[x]?LN[x][L]:x}).join(", ")}
function facts(m,d,full){var r=[],cr=(d&&d.crew)||[],dir=cr.filter(function(c){return/Director|Creator/.test(c.job)}),w=cr.filter(function(c){return!/Director|Creator/.test(c.job)}),lt=m.n&&m.n[N[L]];
if(full)r.push([t("otitle"),'<span lang="en">'+esc(m.t)+'</span>']);
if(full&&L<2)r.push([t("ltitle"),lt?esc(lt):t("unk")]);
r.push([t("type"),CT[m.ty][L]]);
r.push([t("genres"),esc(K.genres(m,L))||t("unk")]);
if(m.ty==="series"&&m.sc)r.push([t("seasonsL"),K.seasons(m.sc,L)+' · '+m.ec+' '+t("epsN")]);
if(m.m)r.push([m.ty==="series"?t("eprun"):t("run"),dur(m.m)]);
r.push([m.ty==="series"?t("first"):t("rel"),m.date?esc(K.date(m.date,L))+(d&&d.dateRegion?' <small>('+d.dateRegion+')</small>':''):m.y]);
if(dir.length)r.push([/Creator/.test(dir[0].job)?t("creator"):t("dir"),dir.map(function(c){return'<span lang="en">'+esc(c.name)+'</span>'}).join(", ")]);
if(full){if(m.status&&T.stS[m.status])r.push([t("status"),T.stS[m.status][L]]);
if(m.ol||(d&&d.olang))r.push([t("olang"),esc(lnName(m.ol||d.olang))]);
r.push([t("lvl"),m.lvl&&m.lvl.v?'≈ '+esc(m.lvl.v)+' <small>('+t("lvlApprox")+')</small>':t("flvUnk")]);
if(m.cert)r.push([t("cert"),esc(m.cert.v)+(m.cert.region?' <small>('+esc(m.cert.region)+')</small>':'')]);
if(w.length)r.push([t("writ"),w.slice(0,6).map(function(c){return'<span lang="en">'+esc(c.name)+'</span> <small lang="en">('+esc(c.job)+')</small>'}).join(", ")]);
r.push([t("subt"),m.s?(m.s.length?subsList(m.s):t("nocc")):t("unk")]);
r.push([t("avl"),t("no")]);
var ids=[];if(K.imdbUrl(m))ids.push('<a href="'+K.imdbUrl(m)+'" target="_blank" rel="noopener">IMDb · '+m.imdb+' ↗</a>');if(m.tmdb)ids.push('<a href="https://www.themoviedb.org/'+(m.kind==="tv"?"tv":"movie")+'/'+m.tmdb+'" target="_blank" rel="noopener">TMDB · '+m.tmdb+' ↗</a>');
r.push([t("ids"),ids.join("<br>")||t("unk")])}
return'<dl class="facts">'+r.map(function(x){return'<div><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>'}).join("")+'</dl>'}
function personCard(c){var nm=(c.n&&c.n[N[L]])||c.name,ini=c.name.split(/\s+/).map(function(s){return s[0]}).slice(0,2).join("");
return'<li class="person"><span class="ph" data-ini="'+esc(ini)+'">'+(c.img?'<img src="'+c.img+'" alt="" width="185" height="278" loading="lazy" decoding="async" onerror="this.remove()">':'')+'</span><b>'+esc(nm)+'</b>'+(nm!==c.name?'<small lang="en">'+esc(c.name)+'</small>':'')+(c.ch?'<small class="ch">'+t("role")+': <span lang="en">'+esc(c.ch)+'</span></small>':'')+'</li>'}
function skel(n){return'<div class="skel" role="status" aria-label="'+t("loading")+'">'+Array(n+1).join('<span></span>')+'</div>'}
function favBtn(m){var on=K.isFav(m.id);return'<button type="button" class="btn secondary fav" id="favb" aria-pressed="'+on+'">'+ico.heart+'<span>'+(on?t("favOn"):t("favAdd"))+'</span></button>'}
function langPanel(m){var lv=m.lvl&&m.lvl.v,b=lv&&m.lvl.basis;
return'<div class="lvpanel"><div class="lvbig'+(lv?'':' unk')+'"><span>'+t("lvl")+'</span><b>'+(lv?'≈ '+esc(lv):'?')+'</b><small>'+(lv?esc(T.lvlN[lv][L]):t("flvUnk"))+'</small></div><div>'
+'<dl class="facts"><div><dt>'+t("olangN")+'</dt><dd>'+(m.ol?esc(lnName(m.ol))+' <small>('+t("olangSrc")+')</small>':t("unk"))+'</dd></div>'
+'<div><dt>'+t("lvl")+'</dt><dd>'+(lv?'≈ '+esc(lv)+' — '+t("lvlApprox"):t("flvUnk"))+'</dd></div>'
+'<div><dt>'+t("subt")+'</dt><dd>'+(m.s&&m.s.length?subsList(m.s):t("subsUnk"))+'</dd></div></dl>'
+'<p class="meta lvwhy">'+(lv&&b?esc(b.words+" words · "+b.wpm+" wpm · avg sentence "+b.avgSentence):t("lvlWhyUnk"))+'</p></div></div>'}
function movie(){var m=find();if(!m)return'<div class="wrap">'+notFound()+'</div>';
var title=K.title(m,L),sd=K.short(m,L),rel=K.released(m),hasTr=K.ytOk(m),iu=K.imdbUrl(m),ri=K.rating(m,"IMDb"),rt=K.rating(m,"TMDB");
var bg=m.backdrop?'<img class="mbd" src="'+m.backdrop+'" alt="" width="1280" height="720" fetchpriority="high" decoding="async" onerror="this.parentNode.parentNode.classList.add(\'art\');this.remove()">':'';
var meta=[T.kind[m.ty][L],rel?m.y:null,K.genres(m,L),m.ty==="series"&&m.sc?K.seasons(m.sc,L):null,m.m?dur(m.m)+(m.ty==="series"?" / "+t("ep"):""):null,m.cert?m.cert.v:null].filter(Boolean);
var acts=(hasTr?'<button type="button" class="btn" id="trb">'+ico.play+t("trl")+'</button>':'<button type="button" class="btn" disabled aria-describedby="trno">'+ico.play+t("trl")+'</button>')+favBtn(m)+(iu?'<a class="btn secondary imdbb" href="'+iu+'" target="_blank" rel="noopener"><b class="imdb-logo" aria-hidden="true">IMDb</b>'+t("imdbRev")+'<span class="vh"> ('+t("imdbOpen")+')</span>'+EXT+'</a>':'');
var rates=(ri?'<li class="r-imdb">'+(iu?'<a href="'+iu+'" target="_blank" rel="noopener" aria-label="IMDb '+ri.v.toFixed(1)+'/10 — '+esc(t("imdbOpen"))+'">':'<span>')+'<b>IMDb</b> '+ri.v.toFixed(1)+'<small>/10 · '+ri.votes.toLocaleString(K.LOC[L])+' '+t("votes")+'</small>'+(iu?EXT+'</a>':'</span>')+'</li>':(iu?'<li class="r-imdb"><a href="'+iu+'" target="_blank" rel="noopener"><b>IMDb</b> <small>'+t("imdbOpen")+'</small>'+EXT+'</a></li>':''))
+(rt?'<li class="r-tmdb"><a href="https://www.themoviedb.org/'+(m.kind==="tv"?"tv":"movie")+'/'+m.tmdb+'" target="_blank" rel="noopener" aria-label="TMDB '+rt.v.toFixed(1)+'/10"><b>TMDB</b> '+rt.v.toFixed(1)+'<small>/10 · '+t("ratU")+'</small>'+EXT+'</a></li>':'');
var h='<section class="mhero'+(m.backdrop?'':' art')+'" aria-labelledby="mt"><div class="mhero-bg">'+bg+(m.backdrop?'':'<div class="mart">'+K.art(m)+'</div>')+'</div><div class="wrap mhero-in">'
+'<nav class="crumbs" aria-label="'+t("crumbs")+'"><a href="index.html">KinoUA</a><span aria-hidden="true">/</span><a href="catalog.html?type='+m.ty+'">'+CT[m.ty][L]+'</a></nav><h1 id="mt">'+esc(title)+'</h1>'+(title!==m.t?'<p class="ot" lang="en">'+esc(m.t)+'</p>':'')
+'<ul class="mmeta">'+meta.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ul>'
+(rates?'<ul class="rates" aria-label="'+t("rat")+'">'+rates+'</ul>':'')
+'<ul class="mlang"><li><span>'+t("olang")+'</span><b>'+(m.ol?esc(lnName(m.ol)):t("unk"))+'</b></li><li><span>'+t("lvl")+'</span><b>'+(m.lvl&&m.lvl.v?'≈ '+esc(m.lvl.v):t("flvUnk"))+'</b></li><li><span>'+ico.cc+'</span><b>'+(m.s&&m.s.length?subsList(m.s):t("subsUnk"))+'</b></li></ul>'
+(sd?'<p class="mov"'+(sd.lang!==N[L]?' lang="'+sd.lang+'"':'')+'>'+esc(sd.v)+'</p>':'')
+'<div class="acts">'+acts+'</div>'
+(!rel?'<p class="mnote">'+ico.info+t("prem")+' <b>'+esc(K.date(m.date,L))+'</b></p>':'')
+'<p class="mnote" id="trno">'+ico.info+(hasTr?t("na"):t("nat"))+'</p>'
+'</div></section>';
if(m.ty==="series")h+='<section class="wrap msec" id="seasons" aria-labelledby="hse"><div class="shead2"><h2 id="hse">'+t("seasonsL")+'</h2><div class="sseg" id="sseg" role="tablist" aria-label="'+t("seasonsL")+'"></div></div><div id="eps" role="tabpanel">'+skel(5)+'</div></section>';
h+='<section class="wrap msec" id="castSec" aria-labelledby="hc"><h2 id="hc">'+t("cast")+'</h2><div id="castBody">'+skel(7)+'</div></section>';
var tabs=[["about",t("about")],["lang",t("lvlH")],["extra",t("add")]];
h+='<section class="wrap msec" id="info"><div class="tabs" role="tablist" aria-label="'+esc(title)+'">'+tabs.map(function(x,i){return'<button type="button" role="tab" id="tab-'+x[0]+'" aria-controls="pn-'+x[0]+'" aria-selected="'+(i===0)+'"'+(i?' tabindex="-1"':'')+'>'+x[1]+'</button>'}).join("")+'</div>'
+'<div class="tabp" role="tabpanel" id="pn-about" aria-labelledby="tab-about" tabindex="0">'+skel(4)+'</div>'
+'<div class="tabp" role="tabpanel" id="pn-extra" aria-labelledby="tab-extra" tabindex="0" hidden>'+skel(4)+'</div>'
+'<div class="tabp" role="tabpanel" id="pn-lang" aria-labelledby="tab-lang" tabindex="0" hidden>'+langPanel(m)+'</div></section>';
if(hasTr)h+='<section class="wrap msec" aria-labelledby="htr"><h2 id="htr">'+t("trl2")+'</h2><div class="tlite" id="tlite"><button type="button" class="tl-btn" id="tlb">'+(m.backdrop?'<img src="'+m.backdrop+'" alt="" width="1280" height="720" loading="lazy" decoding="async">':'')+'<span class="tl-play">'+ico.play+'</span><span class="tl-cap"><b>'+t("trl")+'</b><small lang="en">'+esc(m.trailer.name)+' · YouTube</small></span></button></div><p class="meta">'+t("trnote")+'</p></section>';
h+='<section class="wrap msec" aria-labelledby="hs"><h2 id="hs">'+t("sim")+'</h2>'+K.rail("simr",similar(m).map(function(x){return K.card(x,L)}).join(""),L,t("sim"))+'</section>';
h+='<section class="wrap msec" id="wcSec" hidden aria-labelledby="hw"><h2 id="hw">'+t("withcast")+'</h2><div id="wcBody"></div></section>';
return h}
var DET=null,SEASON=null;
function fillDetail(m,d){DET=d;var full=K.loc(d.d,L),tg=K.loc(d.tagline,L),cast=d.cast||[],crew=(d.crew||[]).slice().sort(function(a,b){return(/Director|Creator/.test(b.job)?1:0)-(/Director|Creator/.test(a.job)?1:0)});
$("#castBody").innerHTML=(crew.length?'<p class="crew"><b>'+t("crew")+':</b> '+crew.slice(0,8).map(function(c){return'<span lang="en">'+esc(c.name)+'</span> <small lang="en">('+esc(c.job)+')</small>'}).join(" · ")+'</p>':'')
+(cast.length?K.rail("castr",'<ul class="people">'+cast.map(personCard).join("")+'</ul>',L,t("cast")):'');K.railInit($("#castr"));
if(!cast.length&&!crew.length)$("#castSec").hidden=true;
$("#pn-about").innerHTML='<div class="about2"><div>'+(tg?'<p class="tagline"'+(tg.lang!==N[L]?' lang="en"':'')+'>'+esc(tg.v)+'</p>':'')+(full?'<p'+(full.lang!==N[L]?' lang="en"':'')+'>'+esc(full.v)+'</p>'+(full.lang!==N[L]&&T.noTr[L]?'<p class="meta">'+T.noTr[L]+'</p>':''):'<p class="meta">'+t("nodesc")+'</p>')+'</div>'+facts(m,d,false)+'</div>';
$("#pn-extra").innerHTML=facts(m,d,true);
var wc=(d.withCast||[]).filter(function(x){return K.byId(x.id)});
if(wc.length){$("#wcSec").hidden=false;$("#wcBody").innerHTML=K.rail("wcr",wc.map(function(x){return'<div class="wcw">'+K.card(K.byId(x.id),L)+'<p class="via"><span>'+t("via")+'</span> <span lang="en">'+esc(x.via)+'</span></p></div>'}).join(""),L,t("withcast"));K.railInit($("#wcr"))}
if(m.ty==="series")seasonsUi(m,d)}
function seasonsUi(m,d){var ss=d.seasons||[];if(!ss.length){$("#seasons").hidden=true;return}
var want=+par().s||ss[0].n;if(!ss.some(function(s){return s.n===want}))want=ss[0].n;
$("#sseg").innerHTML=ss.map(function(s){return'<button type="button" role="tab" id="st'+s.n+'" data-s="'+s.n+'" aria-selected="false" tabindex="-1" aria-controls="eps">'+t("season")+' '+s.n+(s.year?' <small>'+s.year+'</small>':'')+'</button>'}).join("");
var bs=[].slice.call(document.querySelectorAll("#sseg [role=tab]"));
function pick(n,focus){SEASON=n;bs.forEach(function(b){var on=+b.dataset.s===n;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
var s=ss.filter(function(x){return x.n===n})[0],box=$("#eps");box.setAttribute("aria-labelledby","st"+n);box.classList.remove("swap");void box.offsetWidth;box.classList.add("swap");
box.innerHTML='<p class="meta">'+t("season")+' '+n+' · '+s.eps.length+' '+t("epsN")+(s.year?' · '+s.year:'')+'</p><ol class="eplist">'+s.eps.map(function(e){var ov=K.loc(e.ov,L);
return'<li><button type="button" class="ep" data-e="'+e.n+'"><span class="ep-img"><span class="ep-ph" aria-hidden="true"><b>S'+n+' · E'+e.n+'</b></span>'+(e.still?'<img src="'+e.still+'" alt="" width="300" height="169" loading="lazy" decoding="async" onerror="this.remove()">':'')+'<span class="ep-n">'+t("epShort")+' '+e.n+'</span></span><span class="ep-t"><b lang="en">'+esc(e.name||"—")+'</b><small>'+[e.date?K.date(e.date,L):null,e.rt?e.rt+" "+t("min"):null].filter(Boolean).join(" · ")+'</small>'+(ov?'<span class="ep-ov"'+(ov.lang!==N[L]?' lang="en"':'')+'>'+esc(ov.v)+'</span>':'')+'</span></button></li>'}).join("")+'</ol>';
try{var u=new URLSearchParams(location.search);u.set("s",n);u.delete("e");history.replaceState(null,"","?"+u)}catch(x){}}
bs.forEach(function(b,i){b.addEventListener("click",function(){pick(+b.dataset.s)});b.addEventListener("keydown",function(e){var j={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:bs.length-1}[e.key];if(j==null)return;e.preventDefault();pick(+bs[(j+bs.length)%bs.length].dataset.s,true)})});
$("#eps").addEventListener("click",function(e){var b=e.target.closest(".ep");if(b)episode(m,SEASON,+b.dataset.e,b)});
var pe=+par().e;pick(want);if(pe)episode(m,want,pe)}
var epd;
function episode(m,sn,en,opener){var s=(DET.seasons||[]).filter(function(x){return x.n===sn})[0],e=s&&s.eps.filter(function(x){return x.n===en})[0];if(!e)return;
if(!epd){epd=document.createElement("dialog");epd.className="epd";document.body.appendChild(epd);epd.addEventListener("click",function(ev){if(ev.target===epd)epd.close()});epd.addEventListener("close",function(){try{var u=new URLSearchParams(location.search);u.delete("e");history.replaceState(null,"","?"+u)}catch(x){}if(epd._op)epd._op.focus()})}
epd._op=opener;var ov=K.loc(e.ov,L);epd.setAttribute("aria-label",(e.name||"")+" — "+t("season")+" "+sn+", "+t("epShort")+" "+en);
epd.innerHTML='<div class="epbox"><button type="button" class="trx" aria-label="'+t("close")+'">✕</button><div class="ep-hero"><span class="ep-ph big" aria-hidden="true"><b>S'+sn+' · E'+en+'</b></span>'+(e.still?'<img src="'+e.still+'" alt="" width="300" height="169" onerror="this.remove()">':'')+'</div><div class="epin"><p class="eyebrow">'+esc(K.title(m,L))+' · '+t("season")+' '+sn+' · '+t("epShort")+' '+en+'</p><h2 lang="en">'+esc(e.name||"—")+'</h2><p class="meta">'+[e.date?K.date(e.date,L):null,e.rt?e.rt+" "+t("min"):null].filter(Boolean).join(" · ")+'</p>'
+(ov?'<p'+(ov.lang!==N[L]?' lang="en"':'')+'>'+esc(ov.v)+'</p>':'<p class="meta">'+t("nodesc")+'</p>')+'<p class="mnote2">'+ico.info+t("epna")+'</p></div></div>';
epd.querySelector(".trx").onclick=function(){epd.close()};try{var u=new URLSearchParams(location.search);u.set("s",sn);u.set("e",en);history.replaceState(null,"","?"+u)}catch(x){}
if(epd.showModal)epd.showModal();else epd.setAttribute("open","")}
function movieInit(){var m=find();if(!m)return;K.addHistory(m.id);
K.railInit($("#simr"));
var tabs=[].slice.call(document.querySelectorAll('#info [role=tab]'));
function sel(b){tabs.forEach(function(x){var on=x===b;x.setAttribute("aria-selected",String(on));x.tabIndex=on?0:-1;document.getElementById(x.getAttribute("aria-controls")).hidden=!on})}
tabs.forEach(function(b,i){b.addEventListener("click",function(){sel(b)});b.addEventListener("keydown",function(e){var j={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:tabs.length-1}[e.key];if(j==null)return;e.preventDefault();var n=tabs[(j+tabs.length)%tabs.length];sel(n);n.focus()})});
var tb=$("#trb");if(tb)tb.addEventListener("click",function(){K.trailer(m,L,tb)});
var tl=$("#tlb");if(tl)tl.addEventListener("click",function(){var box=$("#tlite");box.innerHTML='<div class="video ytbox"></div>';K.yt(box.firstChild,m,L,{autoplay:true})});
$("#favb").addEventListener("click",function(){var on=K.toggleFav(m.id);this.setAttribute("aria-pressed",String(on));this.querySelector("span").textContent=on?t("favOn"):t("favAdd")});
if(m.det){K.loadDetail(m.id).then(function(d){fillDetail(m,d)}).catch(function(){var er='<div class="err-state">'+ico.info+'<p>'+t("loadErr")+'</p><button type="button" class="btn secondary" onclick="location.reload()">'+t("retry")+'</button></div>';["#castBody","#pn-about","#pn-extra","#eps"].forEach(function(s){if($(s))$(s).innerHTML=er})})}
else fillDetail(m,{d:m.d,tagline:null,crew:[],cast:[]})}

function render(){document.documentElement.lang=N[L];var f=P==="movie"&&find(),act=P==="catalog"?par().type:P==="search"?"search":f?f.ty:"";
K.header($("#hd"),L,function(i){L=i;render()},act);K.footer($("#ft"),L);
$("#app").innerHTML=({catalog:catalog,movie:movie,search:search})[P]();
var ttl=P==="catalog"?$("#app h1").textContent:P==="search"?t("srch"):f?K.title(f,L):t("nf");document.title=ttl+" — KinoUA";
var md=document.querySelector('meta[name="description"]');if(md&&f){var s=K.short(f,L);md.content=s?s.v:""}
if(P==="catalog")catInit();if(P==="movie")movieInit();if(P==="search")K.reveal(".grid .pc")}
render();
})();
