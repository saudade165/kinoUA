// Вхід KinoUA: Supabase Auth + Google OAuth. Єдиний клієнт Supabase на сторінку (window.__kuaSupabase).
// Потік PKCE: Google → Supabase → profile.html?code=… → SDK сам обмінює code на сесію (detectSessionInUrl), інших обробників callback немає.
// Користувач вважається таким, що ввійшов, лише після перевірки сесії на сервері Supabase (auth.getUser), а не через параметри в адресі.
// Токени зберігає й оновлює сам SDK; вручну сайт нічого не записує. Секретних ключів тут немає й бути не повинно.
(function(){
var C=(window.KUA_CONFIG||{}).supabase||{},A={client:null,problem:null};
// Захист від помилки: секретний ключ (sb_secret_… або JWT з роллю service_role) у браузері використовувати не можна
function secret(k){if(/^sb_secret_/.test(k))return true;var p=k.split(".");if(p.length!==3)return false;
  try{return/"role"\s*:\s*"service_role"/.test(atob(p[1].replace(/-/g,"+").replace(/_/g,"/")))}catch(e){return false}}
function problem(){
  if(location.protocol==="file:")return"file";
  if(!C.url||!/^https:\/\/[^\s/]+\/?$/.test(C.url))return"url";
  if(!C.publishableKey)return"key";
  if(secret(C.publishableKey))return"secret";
  if(!window.supabase||typeof window.supabase.createClient!=="function")return"sdk";
  return null}
A.problem=problem();
if(!A.problem){
  if(!window.__kuaSupabase)window.__kuaSupabase=window.supabase.createClient(C.url.replace(/\/$/,""),C.publishableKey,{auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
  A.client=window.__kuaSupabase}
// Адреса повернення: та сама сторінка профілю (з урахуванням підпапки /kinoUA/), без параметрів
A.redirectTo=function(){var u=new URL("profile.html",location.href);return u.origin+u.pathname};
// Помилка OAuth, яку Supabase повертає в адресі (query або hash)
A.urlError=function(){var q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.replace(/^#/,"")),g=function(k){return q.get(k)||h.get(k)||""};
  return g("error")?{code:g("error"),ecode:g("error_code"),desc:g("error_description")}:null};
// Прибрати службові параметри OAuth з адреси (після того як SDK їх обробив)
A.cleanUrl=function(){try{var u=new URL(location.href),ks=["code","error","error_code","error_description","state"],ch=false;
  ks.forEach(function(k){if(u.searchParams.has(k)){u.searchParams.delete(k);ch=true}});
  if(/(^#|&)(access_token|error|refresh_token)=/.test(u.hash)){u.hash="";ch=true}
  if(ch)history.replaceState(null,"",u.pathname+(u.search||"")+u.hash)}catch(e){}};
// Перевірений користувач або null. Помилку ініціалізації (наприклад, невдалий обмін code) повертає в err.
A.check=function(){if(!A.client)return Promise.resolve({user:null,err:null});
  return A.client.auth.initialize().then(function(r){var initErr=r&&r.error||null;
    return A.client.auth.getSession().then(function(s){if(!s.data||!s.data.session)return{user:null,err:initErr};
      return A.client.auth.getUser().then(function(g){if(g.error)return{user:null,err:g.error};return{user:g.data.user,err:null}})})})};
A.google=function(){return A.client.auth.signInWithOAuth({provider:"google",options:{redirectTo:A.redirectTo()}})};
A.signOut=function(){return A.client.auth.signOut()};
A.onChange=function(fn){if(!A.client)return;A.client.auth.onAuthStateChange(function(ev){if(ev==="SIGNED_IN"||ev==="SIGNED_OUT"||ev==="USER_UPDATED")setTimeout(function(){fn(ev)},0)})};
window.KUA_AUTH=A;
})();
