const CACHE="pier-shell-v4";
const SHELL=["./","./index.html","./stock_universe.json","./gig_catalog.json","./manifest.webmanifest","./icon-192.svg","./icon-512.svg","./icon-maskable.svg"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(req).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(cache=>cache.put(req,copy));
    return res;
  }).catch(()=>caches.match(req).then(hit=>hit||caches.match("./index.html"))));
});

self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()||""}}
  const title=data.title||"Pier";
  const options={
    body:data.body||"You have something waiting in Pier.",
    icon:"./icon-192.svg",
    badge:"./icon-192.svg",
    tag:data.tag||"pier-push",
    renotify:true,
    data:{url:data.url||"./",view:data.view||"dashboard"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const view=event.notification.data?.view||"dashboard";
  const url="./?view="+encodeURIComponent(view);
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if("focus" in client){client.postMessage({type:"PIER_NAVIGATE",view});return client.focus()}
    }
    return clients.openWindow?clients.openWindow(url):undefined;
  }));
});
