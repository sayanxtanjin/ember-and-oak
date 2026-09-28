import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const dataDir = join(root, "data");
const uploadsDir = join(root, "uploads");
const menuFile = join(dataDir, "menu.json");
const settingsFile = join(dataDir, "site-settings.json");
const sessions = new Map();
const port = Number(process.env.PORT || 4173);
const adminEmail = (process.env.ADMIN_EMAIL || "admin@emberandoak.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || "";
const currencies = new Set(["৳", "$", "€", "£", "₹", "₨", "¥"]);
const contentTypes = {
  ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".png":"image/png", ".webp":"image/webp", ".ico":"image/x-icon"
};

mkdirSync(dataDir,{recursive:true});
mkdirSync(uploadsDir,{recursive:true});

function send(response,status,body,headers={}){
  response.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers});
  response.end(JSON.stringify(body));
}

async function readJson(request,maxBytes=16*1024*1024){
  const chunks=[]; let length=0;
  for await(const chunk of request){
    length+=chunk.length;
    if(length>maxBytes) throw Object.assign(new Error("Request is too large."),{status:413});
    chunks.push(chunk);
  }
  try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
  catch{return null;}
}

function cookie(request,name){
  const entry=(request.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));
  return entry?decodeURIComponent(entry.slice(name.length+1)):"";
}

function validAdminSession(request){
  const token=cookie(request,"eo_admin_session");
  const expires=sessions.get(token);
  if(!expires||expires<Date.now()){ sessions.delete(token); return false; }
  return true;
}

function equalSecret(a,b){
  const left=Buffer.from(String(a)); const right=Buffer.from(String(b));
  return left.length===right.length&&timingSafeEqual(left,right);
}

async function handleApi(request,response,url){
  if(url.pathname==="/api/session"&&request.method==="POST"){
    const body=await readJson(request,16*1024);
    if(!adminPassword||!adminSessionSecret) return send(response,500,{error:"Admin authentication is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET."});
    if(!body||String(body.email||"").toLowerCase()!==adminEmail||!equalSecret(body.password,adminPassword))
      return send(response,401,{error:"Admin sign-in failed."});
    const token=randomUUID(); sessions.set(token,Date.now()+8*60*60*1000);
    const secure=request.socket.encrypted?"; Secure":"";
    return send(response,200,{ok:true},{"set-cookie":`eo_admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`});
  }
  if(url.pathname==="/api/session"&&request.method==="DELETE"){
    sessions.delete(cookie(request,"eo_admin_session"));
    return send(response,200,{ok:true},{"set-cookie":"eo_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"});
  }
  if(url.pathname==="/api/menu"&&request.method==="GET"){
    if(!existsSync(menuFile)) return send(response,200,{menu:null});
    try{return send(response,200,{menu:JSON.parse(readFileSync(menuFile,"utf8"))});}
    catch{return send(response,500,{error:"The shared menu file could not be read."});}
  }
  if(url.pathname==="/api/settings"&&request.method==="GET"){
    try{
      if(!existsSync(settingsFile)) return send(response,200,{currency:null,site:null});
      const settings=JSON.parse(readFileSync(settingsFile,"utf8"));
      return send(response,200,{currency:currencies.has(settings.currency)?settings.currency:null,site:settings.site&&typeof settings.site==="object"?settings.site:null});
    }catch{return send(response,500,{error:"The shared settings file could not be read."});}
  }
  if(url.pathname==="/api/settings"&&request.method==="PUT"){
    if(!validAdminSession(request)) return send(response,401,{error:"Sign in as admin to update the website settings."});
    const body=await readJson(request,512*1024);
    if(!currencies.has(body?.currency)) return send(response,400,{error:"Choose a supported currency."});
    const site=body.site&&typeof body.site==="object"?body.site:{};
    const stringFields=["name","tagline","description","phone","email","address","hours","logoImage","favicon"];
    if(site.faviconImage!==undefined&&site.faviconImage!==null&&(typeof site.faviconImage!=="string"||site.faviconImage.length>500)) return send(response,400,{error:"The favicon image setting is invalid."});
    if(typeof site.faviconImage==="string"&&site.faviconImage!==""&&!site.faviconImage.startsWith("/uploads/")&&!site.faviconImage.startsWith("/api/images/")&&!/^https:\/\//i.test(site.faviconImage)) return send(response,400,{error:"Use an HTTPS favicon URL or upload an icon image."});
    for(const key of stringFields) if(site[key]!==undefined&&(typeof site[key]!=="string"||site[key].length>(key==="description"?3000:key==="logoImage"?500:500))) return send(response,400,{error:`The ${key} setting is invalid.`});
    if(site.logoImage!==undefined&&site.logoImage!==""&&!site.logoImage.startsWith("/uploads/")&&!site.logoImage.startsWith("/api/images/")&&!/^https:\/\//i.test(site.logoImage)) return send(response,400,{error:"Use an HTTPS logo URL or upload a logo image."});
    if(site.pageContent!==undefined&&(typeof site.pageContent!=="object"||Array.isArray(site.pageContent)||JSON.stringify(site.pageContent).length>300000)) return send(response,400,{error:"Page content is invalid or too large."});
    const previous=existsSync(settingsFile)?JSON.parse(readFileSync(settingsFile,"utf8")):{};
    const safeSite={...(previous.site||{}),...Object.fromEntries(stringFields.filter(key=>typeof site[key]==="string").map(key=>[key,site[key]]))};
    if(site.pageContent&&typeof site.pageContent==="object"&&!Array.isArray(site.pageContent)) safeSite.pageContent=site.pageContent;
    if(site.faviconImage===null||typeof site.faviconImage==="string") safeSite.faviconImage=site.faviconImage;
    if(site.social&&typeof site.social==="object"&&!Array.isArray(site.social)) safeSite.social=Object.fromEntries(["instagram","facebook","twitter"].filter(key=>typeof site.social[key]==="string").map(key=>[key,site.social[key].slice(0,500)]));
    if(Number.isFinite(Number(site.deliveryDefaultFee))) safeSite.deliveryDefaultFee=Math.max(0,Math.min(100000,Number(site.deliveryDefaultFee)));
    writeFileSync(settingsFile,JSON.stringify({currency:body.currency,site:safeSite},null,2)+"\n","utf8");
    return send(response,200,{ok:true});
  }
  if(url.pathname==="/api/menu"&&request.method==="PUT"){
    if(!validAdminSession(request)) return send(response,401,{error:"Sign in as admin to update the shared menu."});
    const body=await readJson(request);
    if(!body||!Array.isArray(body.menu)||body.menu.length>1000) return send(response,400,{error:"The menu data is invalid."});
    const temp=menuFile+"."+process.pid+".tmp";
    writeFileSync(temp,JSON.stringify(body.menu,null,2)+"\n","utf8");
    renameSync(temp,menuFile);
    return send(response,200,{ok:true});
  }
  if(url.pathname==="/api/images"&&request.method==="POST"){
    if(!validAdminSession(request)) return send(response,401,{error:"Sign in as admin to upload food photos."});
    const body=await readJson(request,256*1024);
    const match=typeof body?.image==="string"&&body.image.match(/^data:image\/(jpeg|png|webp);base64,([a-z0-9+/]+=*)$/i);
    if(!match) return send(response,400,{error:"Choose a JPG, PNG, or WebP image."});
    const bytes=Buffer.from(match[2],"base64");
    if(!bytes.length||bytes.length>150*1024) return send(response,413,{error:"The optimized photo is too large. Choose a smaller image."});
    const ext=match[1].toLowerCase()==="jpeg"?"jpg":match[1].toLowerCase();
    const filename=`${randomUUID()}.${ext}`;
    writeFileSync(join(uploadsDir,filename),bytes,{flag:"wx"});
    return send(response,201,{url:`/uploads/${filename}`});
  }
  return send(response,404,{error:"API route not found."});
}

const server=createServer(async(request,response)=>{
  try{
    const url=new URL(request.url,"http://localhost");
    if(url.pathname.startsWith("/api/")) return await handleApi(request,response,url);
    if(request.method!=="GET"&&request.method!=="HEAD") return send(response,405,{error:"Method not allowed."});
    let pathname=decodeURIComponent(url.pathname);
    if(pathname==="/") pathname="/index.html";
    const file=resolve(root,"."+normalize(pathname));
    if(file!==root&&!file.startsWith(root+sep)) return send(response,403,{error:"Forbidden."});
    let bytes;
    try{bytes=readFileSync(file);}catch{return send(response,404,{error:"File not found."});}
    response.writeHead(200,{"content-type":contentTypes[extname(file).toLowerCase()]||"application/octet-stream","x-content-type-options":"nosniff"});
    response.end(request.method==="HEAD"?undefined:bytes);
  }catch(error){
    if(!response.headersSent) send(response,error.status||500,{error:error.message||"Server error."});
    else response.destroy();
  }
});

server.listen(port,process.env.HOST||"0.0.0.0",()=>{
  console.log(`Ember & Oak is running on http://localhost:${port}`);
  console.log(`Admin account email: ${adminEmail}. Configure ADMIN_PASSWORD and ADMIN_SESSION_SECRET before admin sign-in.`);
});
