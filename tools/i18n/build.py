# Збирає js/i18n.js зі словників у цій папці.  Запуск із кореня сайту:  python3 tools/i18n/build.py .
# *.json і *.py — простори імен {ключ:[uk,ru,en]}; файли *_add.py доповнюють або перевизначають ключі (застосовуються останніми, за абеткою).
import json,os,sys,glob,importlib.util
D=os.path.dirname(os.path.abspath(__file__));K=sys.argv[1] if len(sys.argv)>1 else os.path.join(D,"..","..")
NS={}
for f in sorted(glob.glob(D+"/*.json")):NS[os.path.basename(f)[:-5]]=json.load(open(f))
for f in sorted(glob.glob(D+"/*.py"),key=lambda x:("_add" in x,x)):
    if f.endswith("build.py"):continue
    sp=importlib.util.spec_from_file_location("m",f);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
    for k,v in vars(m).items():
        if k.isupper() and isinstance(v,dict):
            n=k.lower()
            if n.endswith("_add"):
                b=NS.setdefault(n[:-4],{})
                for kk,vv in v.items():b[kk]=vv
            else:NS[n]=v
def split(node,i):
    if isinstance(node,list):return node[i] if len(node)>i and node[i] is not None else node[0]
    return {k:split(v,i) for k,v in node.items()}
L={"uk":0,"ru":1,"en":2};out={l:{ns:split(v,i) for ns,v in sorted(NS.items())} for l,i in L.items()}
js=["// Словники інтерфейсу: окремо для кожної мови (uk — основна, ru, en). Ключі однакові в усіх трьох.",
"// Модулі отримують переклади через KUA_I18N.dict(\"простір\") → {ключ:[uk,ru,en]}.","(function(){var D={};"]
for l in ["uk","ru","en"]:js.append("D."+l+"="+json.dumps(out[l],ensure_ascii=False,indent=1)+";")
js.append('function z(a,b,c){if(typeof a==="string")return[a,b==null?a:b,c==null?a:c];var o={};Object.keys(a).forEach(function(k){o[k]=z(a[k],b&&b[k],c&&c[k])});return o}')
js.append('window.KUA_I18N={langs:["uk","ru","en"],dicts:D,dict:function(ns){if(!D.uk[ns])throw new Error("i18n: "+ns);return z(D.uk[ns],D.ru[ns],D.en[ns])}};})();')
open(K+"/js/i18n.js","w",encoding="utf-8").write("\n".join(js)+"\n")
# перевірка повноти
def keys(n,p=""):return sum(([p+k] if not isinstance(v,dict) else keys(v,p+k+".") for k,v in n.items()),[]) if isinstance(n,dict) else []
for ns in NS:
    for l in ["ru","en"]:
        miss=set(keys(out["uk"][ns]))-set(keys(out[l][ns]))
        if miss:print("missing",l,ns,miss)
print("namespaces",sorted(NS), "keys", sum(len(keys(out["uk"][n])) for n in NS))
