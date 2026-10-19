// Оригінальні ілюстровані постери (SVG), без зовнішніх картинок
(function(){
var K=window.KUA,AC=0;
function sh(h,f){var n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function c(v){return Math.max(0,Math.min(255,Math.round(v*f)))}return"rgb("+c(r)+","+c(g)+","+c(b)+")"}
function P(d,f,o){return'<path d="'+d+'" fill="'+f+'"'+(o?' opacity="'+o+'"':'')+'/>'}
function C(x,y,r,f,o){return'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(o?' opacity="'+o+'"':'')+'/>'}
function R(x,y,w,h,f,o){return'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(o?' opacity="'+o+'"':'')+'/>'}
function S(d,c,w,o){return'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"'+(o?' opacity="'+o+'"':'')+'/>'}
function D(n,seed,f,ym,r){var s="",v=seed;for(var i=0;i<n;i++){v=(v*9301+49297)%233280;var x=Math.round(v/233280*200);v=(v*9301+49297)%233280;s+=C(x,Math.round(v/233280*ym),r,f,.85)}return s}
function ring(x,y,r,c,w,o){return'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"'+(o?' opacity="'+o+'"':'')+'/>'}
K.art=function(m){
var a=m.c[0],b=m.c[1],k=m.k,id="a"+m.id.replace(/[^a-z0-9]/g,"")+"-"+(++AC),i;
var s='<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sh(a,.6)+'"/><stop offset=".72" stop-color="'+b+'"/></linearGradient></defs>'+R(0,0,200,300,"url(#"+id+")");
var H=P("M0 190Q60 140 120 180T200 165V300H0Z",sh(b,.75))+P("M0 225Q70 185 140 222T200 212V300H0Z",sh(b,.5))+P("M0 262Q100 232 200 258V300H0Z",sh(a,.4));
if(k==="hills")s+=C(150,85,30,"#fff",.85)+H+C(38,205,17,sh(b,.4))+R(36,212,5,22,sh(a,.3))+C(168,228,13,sh(b,.35))+R(166,233,4,16,sh(a,.3));
else if(k==="meadow"){for(i=0;i<9;i++)s+=P("M100 115L"+Math.round(100+170*Math.cos(i*.7))+" "+Math.round(115+170*Math.sin(i*.7))+"L"+Math.round(100+170*Math.cos(i*.7+.28))+" "+Math.round(115+170*Math.sin(i*.7+.28))+"Z","#fff",.13);s+=C(100,115,30,"#fff",.9)+H;[[30,250],[62,268],[96,256],[130,270],[165,254],[184,272]].forEach(function(p,j){s+=C(p[0],p[1],4.5,j%2?"#ffd84d":"#fff")})}
else if(k==="peaks")s+=D(30,3,"#fff",150,1)+C(55,72,22,"#fff",.9)+P("M0 235L50 150L85 205L125 120L170 195L200 165V300H0Z",sh(a,.45))+P("M125 120L112 143L125 137L138 145Z","#fff",.85)+P("M50 150L40 169L50 163L60 171Z","#fff",.8)+P("M0 262Q100 225 200 262V300H0Z",sh(a,.25))+S("M100 300Q96 275 112 255","#fff",3,.45);
else if(k==="snow"){s+=P("M0 95Q60 55 120 95T200 75V115Q140 135 100 105T0 125Z","#7dffcf",.28)+P("M0 220L60 140L110 200L150 130L200 210V300H0Z","#e8f1ff",.92)+P("M0 252Q100 215 200 252V300H0Z","#fff");[28,62,150,176].forEach(function(x){s+=P("M"+x+" 212l-12 28h24z",sh(a,.55))+P("M"+x+" 228l-15 32h30z",sh(a,.55))})}
else if(k==="city"||k==="noir"){[70,112,90,142,100,122,82,132,96].forEach(function(h,j){s+=R(j*22.5,300-h,21,h,sh(a,.3));for(var y=300-h+8;y<292;y+=14)s+=R(j*22.5+4,y,4,5,"#ffd84d",(j+y)%3?.15:.8)+R(j*22.5+12,y,4,5,"#ffd84d",(j*y)%4?.12:.7)});
if(k==="city")s+=ring(100,110,48,b,5,.95)+ring(100,110,36,"#fff",1.5,.5);
else{for(i=0;i<16;i++)s+=S("M"+(i*13+4)+" 0l-7 46","#fff",1,.22);s+=R(150,120,3,120,sh(a,.2))+C(151,118,10,"#ffd84d",.25)+C(151,118,5,"#ffd84d",.95)}}
else if(k==="desert")s+=C(100,100,40,b,.9)+P("M0 200Q50 170 110 200T200 190V300H0Z",sh(b,.7))+P("M0 245Q90 215 200 245V300H0Z",sh(a,.45))+'<circle cx="150" cy="192" r="26" fill="none" stroke="'+sh(a,.3)+'" stroke-width="9" stroke-dasharray="7 6"/>'+ring(150,192,15,sh(a,.3),3)+'<circle cx="52" cy="238" r="18" fill="none" stroke="'+sh(a,.3)+'" stroke-width="7" stroke-dasharray="5 5"/>';
else if(k==="island")s+=C(100,165,40,"#fff",.9)+R(0,165,200,135,sh(a,.55))+S("M20 190h40M120 205h60M60 225h50","#fff",2,.3)+P("M52 240Q100 192 148 240Z",sh(b,.45))+S("M100 218Q94 192 108 172","#4a321e",3)+P("M108 172Q132 158 142 176Q124 168 108 172Z",sh(a,.25))+P("M108 172Q88 156 76 174Q92 167 108 172Z",sh(a,.25));
else if(k==="cup")s+=ring(100,128,64,"#fff",2,.35)+P("M58 128H142V192Q142 228 100 228Q58 228 58 192Z","#fff")+S("M142 146Q172 148 170 178Q168 202 142 200","#fff",8)+S("M80 114Q70 94 84 78M104 114Q94 94 108 76M126 114Q116 96 130 82","#fff",4,.7)+D(18,9,"#fff",300,1.6)+R(40,246,120,5,"#fff",.5);
else s+=D(26,5,"#ffe98a",230,1.5)+[18,58,108,150,184].map(function(x,j){return R(x,70+j*8,9,230,sh(a,.3))+C(x+4,70+j*8,24,sh(a,.4),.8)}).join("")+P("M60 272Q80 244 100 272Z","#9dffd8",.92)+R(76,272,8,14,"#d9fff0",.9)+P("M130 276Q144 256 158 276Z","#9dffd8",.85)+R(141,276,6,10,"#d9fff0",.9);
return s+'</svg>'}
})();
