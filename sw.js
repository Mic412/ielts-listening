const V='ielts-shell-v1',AU='ielts-audio';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!=AU).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
if(r.method!='GET'||u.origin!=location.origin)return;
if(u.pathname.includes('/audio/')){e.respondWith(audio(r));return}
e.respondWith(fetch(r).then(x=>{if(x.status==200){const y=x.clone();caches.open(V).then(c=>c.put(r,y))}return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('index.html'))))});
/* Saved audio is served from cache, with byte-range support so phones can play and seek it. */
async function audio(r){const c=await caches.open(AU),h=await c.match(r.url);
if(!h)return fetch(r);
const g=r.headers.get('range');if(!g)return h;
const b=await h.blob(),m=/bytes=(\d+)-(\d*)/.exec(g);
if(!m)return h;
const s=+m[1],e=m[2]?Math.min(+m[2],b.size-1):b.size-1;
return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':h.headers.get('content-type')||'audio/mpeg','Content-Range':`bytes ${s}-${e}/${b.size}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
