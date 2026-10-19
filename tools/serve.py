#!/usr/bin/env python3
"""Локальний сервер для KinoUA з підтримкою HTTP Range (потрібно для перемотування відео).
Запуск із кореня сайту:  python3 tools/serve.py  →  http://localhost:8765"""
import http.server,os,re,sys
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng=self.headers.get("Range");path=self.translate_path(self.path)
        if not rng or not os.path.isfile(path):return super().send_head()
        m=re.match(r"bytes=(\d*)-(\d*)",rng);size=os.path.getsize(path)
        if not m:return super().send_head()
        a,b=m.groups();start=int(a) if a else max(0,size-int(b));end=int(b) if (a and b) else size-1;end=min(end,size-1)
        if start>=size:self.send_error(416);return None
        f=open(path,"rb");f.seek(start);self.send_response(206)
        self.send_header("Content-Type",self.guess_type(path));self.send_header("Accept-Ranges","bytes")
        self.send_header("Content-Range",f"bytes {start}-{end}/{size}");self.send_header("Content-Length",str(end-start+1));self.end_headers()
        self._left=end-start+1;return f
    def copyfile(self,src,dst):
        left=getattr(self,"_left",None)
        if left is None:return super().copyfile(src,dst)
        while left>0:
            buf=src.read(min(65536,left))
            if not buf:break
            dst.write(buf);left-=len(buf)
    def end_headers(self):
        if not self.headers.get("Range"):self.send_header("Accept-Ranges","bytes")
        super().end_headers()
port=int(sys.argv[1]) if len(sys.argv)>1 else 8765
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
http.server.ThreadingHTTPServer(("127.0.0.1",port),H).serve_forever()
