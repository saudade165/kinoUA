// Теми: dark (типова), light, auto (світла 07:00–19:00 за локальним часом пристрою).
// Підключається в <head> до стилів, щоб сторінка не блимала при завантаженні.
(function(){
var KEY="kinoua_theme",MODES=["dark","light","auto"],DAY=7,NIGHT=19,root=document.documentElement,timer=null;
var mq=window.matchMedia?matchMedia("(prefers-color-scheme: light)"):null;
function saved(){try{var v=localStorage.getItem(KEY);if(MODES.indexOf(v)>-1)return v}catch(e){}return null}
// Без збереженого вибору враховуємо системне налаштування, інакше — темна тема
function mode(){return saved()||(mq&&mq.matches?"light":"dark")}
function byClock(d){var h=(d||new Date()).getHours();return h>=DAY&&h<NIGHT?"light":"dark"}
function effective(m){m=m||mode();return m==="auto"?byClock():m}
// Мілісекунди до наступної межі 07:00 або 19:00
function untilSwitch(){var n=new Date(),t=new Date(n);t.setSeconds(0,0);t.setMinutes(0);
t.setHours(n.getHours()<DAY?DAY:n.getHours()<NIGHT?NIGHT:24+DAY);return t-n+500}
function schedule(m){clearTimeout(timer);timer=null;if(m==="auto")timer=setTimeout(apply,untilSwitch())}
function sync(){var m=mode();document.querySelectorAll("[data-theme-set]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.themeSet===m))})}
function apply(){var m=mode(),e=effective(m);
if(root.dataset.theme!==e)root.dataset.theme=e;root.dataset.themeMode=m;root.style.colorScheme=e;
var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.content=e==="light"?"#F5F6F9":"#111318";
schedule(m);sync();
try{document.dispatchEvent(new CustomEvent("kinoua:theme",{detail:{mode:m,theme:e}}))}catch(x){}}
function set(m){if(MODES.indexOf(m)<0)return;try{localStorage.setItem(KEY,m)}catch(e){}apply()}
// Таймери «засинають» разом із пристроєм: перевіряємо годинник, коли вкладка знову активна
document.addEventListener("visibilitychange",function(){if(!document.hidden&&mode()==="auto")apply()});
window.addEventListener("focus",function(){if(mode()==="auto")apply()});
// Вибір в іншій вкладці
window.addEventListener("storage",function(e){if(e.key===KEY)apply()});
if(mq){var onSys=function(){if(!saved())apply()};mq.addEventListener?mq.addEventListener("change",onSys):mq.addListener&&mq.addListener(onSys)}
window.KUATheme={modes:MODES,mode:mode,effective:effective,set:set,sync:sync,byClock:byClock};
apply();
})();
