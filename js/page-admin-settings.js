/* Admin > Settings: the restaurant's own config (name, tagline,
   contact info, opening hours, default delivery fee) — this is the one
   place that data lives, instead of being hard-coded on every page. */

function renderAdminSettingsContent(){
  const c = DB.config;
  const currencies = [
    {symbol:"৳",name:"Bangladeshi Taka (BDT)"},
    {symbol:"$",name:"US Dollar (USD)"},
    {symbol:"€",name:"Euro (EUR)"},
    {symbol:"£",name:"British Pound (GBP)"},
    {symbol:"₹",name:"Indian Rupee (INR)"},
    {symbol:"₨",name:"Pakistani Rupee (PKR)"},
    {symbol:"¥",name:"Japanese Yen (JPY)"}
  ];
  return `<div class="panel" style="max-width:640px;">
    <h3 style="margin-bottom:16px;">Restaurant configuration</h3>
    <div class="grid-2">
      <div class="field"><label>Restaurant name</label><input id="st-name" value="${esc(c.name)}"></div>
      <div class="field"><label>Tagline</label><input id="st-tagline" value="${esc(c.tagline)}"></div>
    </div>
    <div class="field"><label>Description</label><textarea id="st-desc" rows="3">${esc(c.description)}</textarea></div>
    <div class="field"><label>Logo image URL</label><input id="st-logo-image" value="${esc(c.logoImage||"")}" placeholder="https://… or upload below"><input type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadSiteImage(this,'st-logo-image')"><span class="hint">Upload a PNG, JPG, or WebP logo to show it throughout the website.</span></div>
    <div class="grid-2">
      <div class="field"><label>Phone</label><input id="st-phone" value="${esc(c.phone)}"></div>
      <div class="field"><label>Email</label><input id="st-email" value="${esc(c.email)}"></div>
    </div>
    <div class="field"><label>Head office address</label><input id="st-address" value="${esc(c.address)}"></div>
    <div class="grid-2">
      <div class="field"><label>Opening hours (display text)</label><input id="st-hours" value="${esc(c.hours)}"></div>
      <div class="field"><label>Default delivery fee</label><input id="st-fee" type="number" value="${c.deliveryDefaultFee}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Instagram URL</label><input id="st-instagram" value="${esc(c.social?.instagram||"")}"></div>
      <div class="field"><label>Facebook URL</label><input id="st-facebook" value="${esc(c.social?.facebook||"")}"></div>
    </div>
    <div class="field"><label>Twitter / X URL</label><input id="st-twitter" value="${esc(c.social?.twitter||"")}"></div>
    <div class="field"><label for="st-currency">Display currency</label><select id="st-currency">${currencies.map(item=>`<option value="${item.symbol}" ${c.currency===item.symbol?"selected":""}>${item.symbol} — ${item.name}</option>`).join("")}</select><span class="hint">This changes the currency symbol shown on prices; it does not convert the stored amounts.</span></div>
    <button class="btn btn-primary" onclick="saveSiteSettings()">Save settings</button>
  </div>

  <div class="panel page-editor-panel" style="margin-top:22px;">
    <h3 style="margin-bottom:6px;">Edit website pages</h3>
    <p class="small-muted">Choose a page and click a heading, paragraph, or image in the preview. Update the selected content and save. Changes are shared with every visitor.</p>
    <div class="field"><label for="site-edit-page">Page to edit</label><select id="site-edit-page" onchange="loadContentPreview(this.value)">${contentPageOptions()}</select></div>
    <div class="content-editor-grid">
      <iframe id="site-page-preview" title="Website page preview in edit mode" src="${paths().home}?eo-editor=1"></iframe>
      <div class="content-editor-fields">
        <div id="content-selection-hint" class="small-muted">Click text or an image in the preview to select it.</div>
        <label class="field" id="content-text-wrap">Text<input id="content-text" oninput="previewPageEdit()" disabled></label>
        <label class="field" id="content-image-wrap" hidden>Image URL<input id="content-image" placeholder="https://… or upload below" oninput="previewPageEdit()" disabled></label>
        <label class="field" id="content-image-file-wrap" hidden>Upload replacement image<input type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadSiteImage(this,'content-image')"><span class="hint">PNG, JPG, or WebP up to 5 MB.</span></label>
        <button class="btn btn-primary" id="content-save-button" onclick="savePageEdit()" disabled>Save page change</button>
        <button class="btn btn-outline" onclick="clearPageEdit()">Clear this edit</button>
      </div>
    </div>
  </div>

  <div class="panel" style="max-width:640px; margin-top:22px;">
    <h3 style="margin-bottom:6px;">Website icon</h3>
    <p class="small-muted" style="margin-bottom:16px;">This is the small icon shown in the browser tab. Use a single emoji, or upload your own image.</p>
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
      <div id="fav-preview" style="width:40px; height:40px; border:1px solid var(--line); border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:24px;">
        ${c.faviconImage ? `<img src="${c.faviconImage}" style="width:100%;height:100%;object-fit:cover;">` : esc(c.favicon||"🔥")}
      </div>
      <div class="field" style="margin:0; flex:1;"><label>Emoji icon</label><input id="st-favicon-emoji" value="${esc(c.favicon||"🔥")}" maxlength="4" style="width:100px;"></div>
    </div>
    <div class="field">
      <label>Or upload a custom image</label>
      <input type="file" id="fav-image-file" accept="image/png,image/jpeg,image/webp" onchange="handleFaviconUpload(this)">
      <div id="fav-remove-wrap" style="margin-top:8px;">${c.faviconImage ? `<button type="button" class="link-btn" onclick="removeFaviconImage()">Remove uploaded icon</button>` : ""}</div>
    </div>
    <button class="btn btn-primary" onclick="saveFaviconSettings()">Save icon</button>
  </div>

  <div class="panel" style="max-width:640px; margin-top:22px;">
    <h3 style="margin-bottom:6px;">Customer & order data</h3>
    <p class="small-muted" style="margin-bottom:16px;">Everything below lives in this browser's storage. Use these buttons any time you need an actual customers.json or orders.json file — for a backup, or to hand off to another system.</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-outline" onclick="exportCustomersJSON()">Download customers.json</button>
      <button class="btn btn-outline" onclick="exportOrdersJSON()">Download orders.json</button>
    </div>
  </div>`;
}

let _favImageData = null;
let _favImageChanged = false;

async function handleFaviconUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  try{
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Choose a PNG, JPG, or WebP image under 5 MB.");
    _favImageData=await uploadFoodImageToWebsite(await optimizeSiteImage(file));
    _favImageChanged = true;
    document.getElementById("fav-preview").innerHTML = `<img src="${esc(_favImageData)}" style="width:100%;height:100%;object-fit:cover;">`;
    document.getElementById("fav-remove-wrap").innerHTML = `<button type="button" class="link-btn" onclick="removeFaviconImage()">Remove uploaded icon</button>`;
    toast("Icon uploaded. Save it to publish.","success");
  }catch(error){toast(error.message||"Could not upload the icon.","error");}
  finally{input.value="";}
}

function removeFaviconImage(){
  _favImageData = null;
  _favImageChanged = true;
  const fileInput = document.getElementById("fav-image-file");
  if(fileInput) fileInput.value = "";
  document.getElementById("fav-preview").innerHTML = esc(document.getElementById("st-favicon-emoji").value || "🔥");
  document.getElementById("fav-remove-wrap").innerHTML = "";
}

async function saveFaviconSettings(){
  DB.config.favicon = document.getElementById("st-favicon-emoji").value.trim() || "🔥";
  if(_favImageChanged) DB.config.faviconImage = _favImageData;
  try{await saveSharedSiteSettings();saveDB();applyFavicon();toast("Website icon updated for every visitor","success");}
  catch(error){toast(error.message||"The website icon could not be saved.","error");}
}

function downloadJSON(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportCustomersJSON(){
  const customers = DB.users.filter(u=>u.role==="customer").map(u => ({
    id: u.id, name: u.name, email: u.email, mobile: u.mobile,
    address: u.address, status: u.status, createdAt: u.createdAt
  }));
  downloadJSON("customers.json", customers);
  toast("customers.json downloaded","success");
}

function exportOrdersJSON(){
  downloadJSON("orders.json", DB.orders);
  toast("orders.json downloaded","success");
}

const EDITABLE_PAGES={"index.html":"Home","menu.html":"Menu","branches.html":"Branches","offers.html":"Offers","about.html":"About","contact.html":"Contact","cart.html":"Cart","checkout.html":"Checkout","confirmation.html":"Order confirmation","order-tracking.html":"Order tracking","login.html":"Login","signup.html":"Sign up","account.html":"Customer account","404.html":"Not found"};
function contentPageOptions(){return Object.entries(EDITABLE_PAGES).map(([key,label])=>`<option value="${key}">${label}</option>`).join("");}
let selectedContentEdit=null;
function loadContentPreview(page){
  selectedContentEdit=null;
  const text=document.getElementById("content-text"),image=document.getElementById("content-image");
  text.value="";image.value="";text.disabled=true;image.disabled=true;document.getElementById("content-save-button").disabled=true;
  document.getElementById("content-selection-hint").textContent="Click text or an image in the preview to select it.";
  document.getElementById("content-text-wrap").hidden=false;document.getElementById("content-image-wrap").hidden=true;document.getElementById("content-image-file-wrap").hidden=true;
  const routes={"index.html":paths().home,"menu.html":paths().menu,"branches.html":paths().branches,"offers.html":paths().offers,"about.html":paths().about,"contact.html":paths().contact,"cart.html":paths().cart,"checkout.html":paths().checkout,"confirmation.html":paths().confirmation,"order-tracking.html":paths().order,"login.html":paths().login,"signup.html":paths().signup,"account.html":paths().account,"404.html":(typeof ROOT==="string"?ROOT:"../")+"pages/404.html"};
  document.getElementById("site-page-preview").src=routes[page]+"?eo-editor=1";
}
window.addEventListener("message",event=>{
  if(event.origin!==location.origin||event.data?.type!=="eo-editor-selection")return;
  selectedContentEdit=event.data;
  const isText=event.data.kind==="text";
  document.getElementById("content-selection-hint").textContent=`Selected ${event.data.kind} (${event.data.tag}).`;
  document.getElementById("content-text-wrap").hidden=!isText;document.getElementById("content-image-wrap").hidden=isText;document.getElementById("content-image-file-wrap").hidden=isText;
  document.getElementById("content-text").value=event.data.text||"";document.getElementById("content-image").value=event.data.image||"";
  document.getElementById("content-text").disabled=!isText;document.getElementById("content-image").disabled=isText;document.getElementById("content-save-button").disabled=false;
});
function previewPageEdit(){
  if(!selectedContentEdit)return;
  document.getElementById("site-page-preview").contentWindow.postMessage({type:"eo-editor-preview",page:selectedContentEdit.page,selector:selectedContentEdit.selector,text:document.getElementById("content-text").value,image:document.getElementById("content-image").value},location.origin);
}
async function savePageEdit(){
  if(!selectedContentEdit)return;
  const value={};
  if(selectedContentEdit.kind==="text")value.text=document.getElementById("content-text").value;
  else{const image=document.getElementById("content-image").value.trim();if(image&&!isAllowedSiteImage(image))return toast("Use a secure HTTPS image URL or upload an image.","error");value.image=image;}
  DB.config.pageContent=DB.config.pageContent||{};DB.config.pageContent[selectedContentEdit.page]=DB.config.pageContent[selectedContentEdit.page]||{};
  DB.config.pageContent[selectedContentEdit.page][selectedContentEdit.selector]=value;
  try{await saveSharedSiteSettings();saveDB();toast("Page change saved for all visitors.","success");}
  catch(error){toast(error.message||"The page change could not be saved.","error");}
}
async function clearPageEdit(){
  if(!selectedContentEdit)return;
  delete DB.config.pageContent?.[selectedContentEdit.page]?.[selectedContentEdit.selector];
  try{await saveSharedSiteSettings();saveDB();document.getElementById("site-page-preview").contentWindow.location.reload();toast("Page change removed.","success");}
  catch(error){toast(error.message||"The page change could not be removed.","error");}
}
function isAllowedSiteImage(value){return value.startsWith("/uploads/")||value.startsWith("/api/images/")||/^https:\/\//i.test(value);}
async function uploadSiteImage(input,targetId){
  const file=input.files?.[0];if(!file)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024){toast("Choose a PNG, JPG, or WebP image under 5 MB.","error");input.value="";return;}
  try{const data=await optimizeSiteImage(file);const url=await uploadFoodImageToWebsite(data);const target=document.getElementById(targetId);if(target)target.value=url;if(targetId==="content-image")previewPageEdit();toast("Image uploaded. Save the change to publish it.","success");}
  catch(error){toast(error.message||"The image could not be uploaded.","error");}
  finally{input.value="";}
}
function optimizeSiteImage(file){return new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onerror=()=>reject(new Error("Could not read that image."));
  reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error("That image could not be opened."));image.onload=async()=>{
    const canvas=document.createElement("canvas");let scale=Math.min(1,1200/Math.max(image.naturalWidth,image.naturalHeight)),blob=null;
    for(let attempt=0;attempt<12;attempt++){
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
      blob=await new Promise(done=>canvas.toBlob(done,"image/jpeg",[0.78,0.65,0.52][attempt%3]));
      if(blob&&blob.size<=140*1024){const output=new FileReader();output.onload=()=>resolve(output.result);output.onerror=()=>reject(new Error("Could not prepare that image."));output.readAsDataURL(blob);return;}
      if(attempt%3===2)scale*=0.82;
    }
    reject(new Error("That image could not be reduced enough. Choose a smaller image."));
  };image.src=reader.result;};reader.readAsDataURL(file);
});}

async function saveSiteSettings(){
  const currency = document.getElementById("st-currency").value;
  DB.config.name = document.getElementById("st-name").value.trim() || DB.config.name;
  DB.config.tagline = document.getElementById("st-tagline").value.trim();
  DB.config.description = document.getElementById("st-desc").value.trim();
  DB.config.phone = document.getElementById("st-phone").value.trim();
  DB.config.email = document.getElementById("st-email").value.trim();
  DB.config.address = document.getElementById("st-address").value.trim();
  DB.config.hours = document.getElementById("st-hours").value.trim();
  DB.config.deliveryDefaultFee = parseFloat(document.getElementById("st-fee").value)||80;
  DB.config.currency = currency;
  DB.config.logoImage=document.getElementById("st-logo-image").value.trim();
  DB.config.social={instagram:document.getElementById("st-instagram").value.trim(),facebook:document.getElementById("st-facebook").value.trim(),twitter:document.getElementById("st-twitter").value.trim()};
  try{await saveSharedSiteSettings();saveDB();applyFavicon();toast("Settings saved for every visitor","success");document.title=DB.config.name+" — Settings";}
  catch(error){toast(error.message||"The website settings could not be saved.","error");}
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","settings","Settings", renderAdminSettingsContent());
});
