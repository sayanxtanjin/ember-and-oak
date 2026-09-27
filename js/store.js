/* Tiny data layer. DB is the whole application's state, kept in memory
   and mirrored to localStorage. Swap loadDB/saveDB for real API calls if
   this ever grows a backend. */

const DB_KEY = "eo_platform_db_v1";

let DB = null;

async function loadDB(){
  const raw = localStorage.getItem(DB_KEY);
  if(raw){ try{ DB = JSON.parse(raw); }catch(e){ DB = null; } }
  if(!DB){
    // build seed lookup first
    SEED_MENU_LOOKUP = {};
    const menuForLookup = seedMenuOnly();
    menuForLookup.forEach(m=>SEED_MENU_LOOKUP[m.id]=m);
    DB = seedData();
  }
  if(!DB.notifications) DB.notifications=[];
  if(!DB.cart) DB.cart=[];
  if(!DB.favorites) DB.favorites={};
  // Menu records and their image URLs are shared through the website server.
  // Keep the rest of this prototype's account/cart state in this browser.
  try{
    const response = await fetch("/api/menu", {cache:"no-store"});
    if(response.ok){
      const result = await response.json();
      if(Array.isArray(result.menu)){
        const publicMenu = await makeMenuImagesPublic(result.menu);
        DB.menu = publicMenu.menu;
        if(publicMenu.changed || result.needsSave) await saveSharedMenu(DB.menu);
      }else{
        const publicMenu = await makeMenuImagesPublic(DB.menu||[]);
        DB.menu = publicMenu.menu;
        await saveSharedMenu(DB.menu);
      }
    }
  }catch(error){
    // The static site can still be opened without its server, but shared
    // menu and photo operations require npm start.
    console.warn("Shared menu is unavailable; using this browser's saved menu.",error);
  }
  try{
    const response = await fetch("/api/settings", {cache:"no-store"});
    if(response.ok){
      const settings = await response.json();
      if(typeof settings.currency==="string" && settings.currency) DB.config = Object.assign({},DB.config,{currency:settings.currency});
    }
  }catch(error){
    console.warn("Shared site settings are unavailable; using this browser's saved settings.",error);
  }
  // fill in any config fields added since this browser last saved (new
  // installs get every default already, so this only matters for people
  // revisiting with an older copy already in their browser)
  DB.config = Object.assign({}, DEFAULT_CONFIG, DB.config);
  saveDB();
  applyFavicon();
}

function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

async function uploadFoodImageToWebsite(dataUrl){
  const response = await fetch("/api/images",{
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({image:dataUrl})
  });
  const result = await response.json().catch(()=>({}));
  if(!response.ok || !result.url) throw new Error(result.error||"The website couldn't save this photo.");
  return result.url;
}

async function makeMenuImagesPublic(menu){
  let changed = false;
  const result = await Promise.all(menu.map(async item=>{
    if(typeof item.image==="string" && item.image.startsWith("data:image/")){
      changed = true;
      return {...item,image:await uploadFoodImageToWebsite(item.image)};
    }
    return item;
  }));
  return {menu:result,changed};
}

async function saveSharedMenu(menu){
  const response = await fetch("/api/menu",{
    method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({menu})
  });
  const result = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.error||"The website couldn't save the shared menu.");
}

async function saveSharedCurrency(currency){
  const response = await fetch("/api/settings",{
    method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({currency})
  });
  const result = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.error||"The website couldn't save the shared currency setting.");
}
