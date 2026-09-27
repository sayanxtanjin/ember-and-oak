/* Small helpers used all over the site: formatting, escaping, distance
   math, the logged-in user lookup and the toast notification popup. */

function uid(prefix){ return prefix+"-"+Math.random().toString(36).slice(2,9); }

function fmt(n){ return DB.config.currency + Number(n||0).toLocaleString("en-US",{maximumFractionDigits:0}); }

const THEME_KEY = "eo_color_mode_v1";
function activeTheme(){
  const explicit = document.documentElement.dataset.theme;
  return explicit || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function themeToggleHtml(){
  const next = activeTheme()==="dark" ? "light" : "dark";
  return `<button type="button" class="theme-toggle" onclick="toggleTheme()" aria-label="Switch to ${next} mode" title="Switch to ${next} mode"><span aria-hidden="true">${next==="light"?"☀️":"🌙"}</span><span class="theme-label">${next==="light"?"Light":"Dark"}</span></button>`;
}
function toggleTheme(){
  const next = activeTheme()==="dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  try{ localStorage.setItem(THEME_KEY,next); }catch(error){}
  document.querySelectorAll(".theme-toggle").forEach(button=>{
    const target = next==="dark" ? "light" : "dark";
    button.setAttribute("aria-label",`Switch to ${target} mode`);
    button.title = `Switch to ${target} mode`;
    button.innerHTML = `<span aria-hidden="true">${target==="light"?"☀️":"🌙"}</span><span class="theme-label">${target==="light"?"Light":"Dark"}</span>`;
  });
}
try{
  const savedTheme = localStorage.getItem(THEME_KEY);
  if(savedTheme==="dark" || savedTheme==="light"){
    document.documentElement.dataset.theme = savedTheme;
    document.documentElement.style.colorScheme = savedTheme;
  }
}catch(error){}

function esc(s){ return (s==null?"":String(s)).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function timeAgo(iso){
  const diff = Date.now()-new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if(m<1) return "just now";
  if(m<60) return m+"m ago";
  const h = Math.floor(m/60);
  if(h<24) return h+"h ago";
  const d = Math.floor(h/24);
  return d+"d ago";
}

function fmtDate(iso){ const d=new Date(iso); return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})+" · "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); }

function haversineKm(lat1,lon1,lat2,lon2){
  const toRad = d=>d*Math.PI/180;
  const R=6371;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function branchIsOpenNow(b){
  const now = new Date();
  const [oh,om]=b.openTime.split(":").map(Number);
  const [ch,cm]=b.closeTime.split(":").map(Number);
  const openMin=oh*60+om, closeMin=ch*60+cm, nowMin=now.getHours()*60+now.getMinutes();
  if(closeMin>openMin) return nowMin>=openMin && nowMin<closeMin;
  return nowMin>=openMin || nowMin<closeMin; // overnight branch
}

function currentUser(){ return DB.users.find(u=>u.id===DB.currentUserId) || null; }

function requireLogin(){ return !!currentUser(); }

function toast(msg, type){
  type = type||"info";
  const root = document.getElementById("toast-root");
  const t = document.createElement("div");
  t.className = "toast "+type;
  t.innerHTML = (type==="success"?"✓ ":type==="error"?"⚠ ":"ℹ ") + esc(msg);
  root.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .3s"; setTimeout(()=>t.remove(),300); }, 3200);
}

/* Builds the little favicon everyone sees in their browser tab, either
   from a plain emoji (the default) or from a custom image the admin
   uploaded in Settings. */
function emojiFaviconDataUri(emoji){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function applyFavicon(){
  const link = document.querySelector('link[rel="icon"]');
  if(!link) return;
  link.href = DB.config.faviconImage || emojiFaviconDataUri(DB.config.favicon || "🔥");
}

function starString(rating){
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5-full);
}

function branchName(id){ return (DB.branches.find(b=>b.id===id)||{}).name||"—"; }
