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
    <div class="grid-2">
      <div class="field"><label>Phone</label><input id="st-phone" value="${esc(c.phone)}"></div>
      <div class="field"><label>Email</label><input id="st-email" value="${esc(c.email)}"></div>
    </div>
    <div class="field"><label>Head office address</label><input id="st-address" value="${esc(c.address)}"></div>
    <div class="grid-2">
      <div class="field"><label>Opening hours (display text)</label><input id="st-hours" value="${esc(c.hours)}"></div>
      <div class="field"><label>Default delivery fee</label><input id="st-fee" type="number" value="${c.deliveryDefaultFee}"></div>
    </div>
    <div class="field"><label for="st-currency">Display currency</label><select id="st-currency">${currencies.map(item=>`<option value="${item.symbol}" ${c.currency===item.symbol?"selected":""}>${item.symbol} — ${item.name}</option>`).join("")}</select><span class="hint">This changes the currency symbol shown on prices; it does not convert the stored amounts.</span></div>
    <button class="btn btn-primary" onclick="saveSiteSettings()">Save settings</button>
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
      <input type="file" id="fav-image-file" accept="image/*" onchange="handleFaviconUpload(this)">
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

function handleFaviconUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){ toast("Please choose an image file","error"); input.value=""; return; }
  if(file.size > 1*1024*1024){ toast("Please choose an image under 1MB","error"); input.value=""; return; }
  const reader = new FileReader();
  reader.onload = function(e){
    _favImageData = e.target.result;
    _favImageChanged = true;
    document.getElementById("fav-preview").innerHTML = `<img src="${_favImageData}" style="width:100%;height:100%;object-fit:cover;">`;
    document.getElementById("fav-remove-wrap").innerHTML = `<button type="button" class="link-btn" onclick="removeFaviconImage()">Remove uploaded icon</button>`;
  };
  reader.readAsDataURL(file);
}

function removeFaviconImage(){
  _favImageData = null;
  _favImageChanged = true;
  const fileInput = document.getElementById("fav-image-file");
  if(fileInput) fileInput.value = "";
  document.getElementById("fav-preview").innerHTML = esc(document.getElementById("st-favicon-emoji").value || "🔥");
  document.getElementById("fav-remove-wrap").innerHTML = "";
}

function saveFaviconSettings(){
  DB.config.favicon = document.getElementById("st-favicon-emoji").value.trim() || "🔥";
  if(_favImageChanged) DB.config.faviconImage = _favImageData;
  saveDB();
  applyFavicon();
  toast("Website icon updated","success");
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

async function saveSiteSettings(){
  const currency = document.getElementById("st-currency").value;
  try{
    await saveSharedCurrency(currency);
  }catch(error){
    toast(error.message||"The currency setting could not be saved to the website.","error");
    return;
  }
  DB.config.name = document.getElementById("st-name").value.trim() || DB.config.name;
  DB.config.tagline = document.getElementById("st-tagline").value.trim();
  DB.config.description = document.getElementById("st-desc").value.trim();
  DB.config.phone = document.getElementById("st-phone").value.trim();
  DB.config.email = document.getElementById("st-email").value.trim();
  DB.config.address = document.getElementById("st-address").value.trim();
  DB.config.hours = document.getElementById("st-hours").value.trim();
  DB.config.deliveryDefaultFee = parseFloat(document.getElementById("st-fee").value)||80;
  DB.config.currency = currency;
  saveDB(); toast("Settings saved","success"); document.title = DB.config.name+" — Wood-Fired Kitchen";
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","settings","Settings", renderAdminSettingsContent());
});
