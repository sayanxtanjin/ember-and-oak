/* Admin > Menu: full CRUD for dishes, including the dish-artwork
   dropdown, the optional custom-photo upload, and size/price editing
   (Pizza items only — everything else just has a single price). */

function renderAdminMenuContent(){
  return `
  <div style="display:flex; justify-content:flex-end; margin-bottom:14px;"><button type="button" class="btn btn-primary" data-action="add-food-item">+ Add food item</button></div>
  <div class="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Flags</th><th>Actions</th></tr></thead><tbody>
    ${DB.menu.map(f=>`<tr>
      <td>${miniArt(f.art,24,f.image)}${esc(f.name)}</td><td>${esc(catName(f.category))}</td><td>${fmt(f.price)}</td><td>${f.rating}</td>
      <td>${f.available?'<span class="tag on">Available</span>':'<span class="tag off">Unavailable</span>'}</td>
      <td>${f.featured?'<span class="badge gold" style="margin-right:4px;">Featured</span>':''}${f.popular?'<span class="badge wine">Popular</span>':''}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openFoodEditor('${f.id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="confirmDeleteFood('${f.id}')">Delete</button></td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function isPizzaCategory(categoryId){
  const category = (DB.categories||[]).find(c=>c.id===categoryId);
  return categoryId==="cat-pizza" || /pizza/i.test(category?.name||"");
}

function renderPizzaSizeRows(sizes, basePrice){
  const rows = sizes.length ? sizes : [{name:"Small",delta:0},{name:"Large",delta:0},{name:"Family",delta:0}];
  return rows.map(size=>`
    <div class="fe-size-row" style="display:grid; grid-template-columns:minmax(100px,1fr) minmax(120px,1fr) auto; align-items:center; gap:8px; margin-top:8px;">
      <input class="fe-size-name" aria-label="Size name" placeholder="e.g. Small" value="${esc(size.name||"")}">
      <input class="fe-size-price" aria-label="${esc(size.name||"Size")} price" type="number" min="1" step="1" placeholder="Price" value="${Math.max(0,Number(basePrice||0)+Number(size.delta||0))||""}">
      <button type="button" class="btn btn-outline btn-sm" onclick="removePizzaSizeRow(this)" aria-label="Remove size">Remove</button>
    </div>`).join("");
}

function openFoodEditor(id){
  // Older browser saves may predate sizes/variants, and malformed records
  // should not prevent the Add/Edit dialog from opening.
  const saved = id ? (DB.menu||[]).find(x=>x.id===id) : null;
  if(id && !saved){ toast("This menu item could not be found. Refresh the page and try again.","error"); return; }
  const f = saved ? {
    ...saved,
    sizes:Array.isArray(saved.sizes)?saved.sizes.filter(size=>size&&typeof size==="object"&&size.name):[],
    variants:Array.isArray(saved.variants)?saved.variants.map(v=>typeof v==="string"?{name:v}:v).filter(v=>v&&v.name):[]
  } : {id:null,name:"",category:DB.categories[0]?.id||"",price:"",desc:"",art:"pizza_margherita",image:null,rating:4.5,prepTime:15,featured:false,popular:false,available:true,sizes:[],variants:[]};
  window._feImageData = f.image || null;
  showGenericModal(id?"Edit food item":"Add food item", `
    <div class="grid-2">
      <div class="field" id="fe-name-field"><label>Name <span class="req">*</span></label><input id="fe-name" value="${esc(f.name)}"></div>
      <div class="field"><label>Dish artwork (fallback icon)</label><select id="fe-art" onchange="updateFoodPreview()">${DISH_ART_OPTIONS.map(k=>`<option value="${k}" ${f.art===k?"selected":""}>${esc(k.replace(/_/g,' '))}</option>`).join("")}</select></div>
    </div>
    <div class="field">
      <label>Photo</label>
      <div style="display:flex; align-items:center; gap:14px;">
        <div id="fe-art-preview" style="border:1px solid var(--line); border-radius:8px;">${foodVisual(f.art,64,f.image)}</div>
        <div>
          <input type="file" id="fe-image-file" accept="image/*" onchange="handleFoodImageUpload(this)">
          <div id="fe-remove-image-wrap" style="margin-top:8px;">${f.image ? `<button type="button" class="link-btn" onclick="removeFoodImage()">Remove uploaded photo</button>` : `<span class="small-muted">No photo uploaded — using illustration</span>`}</div>
        </div>
      </div>
      <span class="hint">Upload a JPG/PNG (max 3MB). The photo is saved to the website and shared with visitors after you save the item.</span>
    </div>
    <div class="field"><label>Description</label><textarea id="fe-desc" rows="2">${esc(f.desc)}</textarea></div>
    <div class="grid-2">
      <div class="field"><label>Category</label><select id="fe-cat" onchange="toggleSizesField()">${DB.categories.map(c=>`<option value="${c.id}" ${f.category===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
      <div class="field" id="fe-price-field"><label>Price (${DB.config.currency}) <span class="req">*</span></label><input id="fe-price" type="number" min="1" step="1" placeholder="e.g. 450" value="${f.price||""}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Rating (0–5)</label><input id="fe-rating" type="number" step="0.1" min="0" max="5" value="${f.rating}"></div>
      <div class="field"><label>Prep time (minutes)</label><input id="fe-prep" type="number" value="${f.prepTime}"></div>
    </div>
    <div class="field" id="fe-sizes-field" style="${isPizzaCategory(f.category)?'':'display:none;'}">
      <label>Pizza sizes and prices</label>
      <span class="hint">Set the full price customers pay when they choose each size.</span>
      <div id="fe-size-rows">${isPizzaCategory(f.category)?renderPizzaSizeRows(f.sizes, f.price):""}</div>
      <button type="button" class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="addPizzaSizeRow()">+ Add size</button>
    </div>
    <div class="field"><label>Variants (comma separated — optional)</label><input id="fe-variants" placeholder="Mild, Spicy" value="${f.variants.map(v=>v.name).join(', ')}"></div>
    <div style="display:flex; gap:16px; margin:10px 0 18px;">
      <label class="checkbox-row"><input type="checkbox" id="fe-available" ${f.available?"checked":""}> Available</label>
      <label class="checkbox-row"><input type="checkbox" id="fe-featured" ${f.featured?"checked":""}> Featured</label>
      <label class="checkbox-row"><input type="checkbox" id="fe-popular" ${f.popular?"checked":""}> Popular</label>
    </div>
    <button type="button" id="fe-save-button" class="btn btn-primary btn-block" onclick="saveFoodEditor('${id||""}')">Save item</button>
  `);
}

function toggleSizesField(){
  const isPizza = isPizzaCategory(document.getElementById("fe-cat").value);
  const field = document.getElementById("fe-sizes-field");
  field.style.display = isPizza ? "" : "none";
  if(isPizza && !document.querySelector("#fe-size-rows .fe-size-row")){
    document.getElementById("fe-size-rows").innerHTML = renderPizzaSizeRows([], document.getElementById("fe-price").value);
  }
}

function addPizzaSizeRow(){
  const basePrice = parseFloat(document.getElementById("fe-price").value)||0;
  document.getElementById("fe-size-rows").insertAdjacentHTML("beforeend",renderPizzaSizeRows([{name:"",delta:0}],basePrice));
}

function removePizzaSizeRow(button){
  button.closest(".fe-size-row").remove();
}

function updateFoodPreview(){
  const art = document.getElementById("fe-art").value;
  document.getElementById("fe-art-preview").innerHTML = foodVisual(art, 64, window._feImageData);
}

function compressFoodImage(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=>reject(new Error("Couldn't read that image."));
    reader.onload = ()=>{
      const image = new Image();
      image.onerror = ()=>reject(new Error("That image could not be opened."));
      image.onload = async ()=>{
        const canvas = document.createElement("canvas");
        const maxSide = 800;
        let scale = Math.min(1, maxSide/Math.max(image.naturalWidth,image.naturalHeight));
        const qualities = [0.78,0.68,0.58];
        let blob = null;
        try{
          for(let attempt=0; attempt<12; attempt++){
            canvas.width = Math.max(1,Math.round(image.naturalWidth*scale));
            canvas.height = Math.max(1,Math.round(image.naturalHeight*scale));
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0,0,canvas.width,canvas.height);
            context.drawImage(image,0,0,canvas.width,canvas.height);
            blob = await new Promise(done=>canvas.toBlob(done,"image/jpeg",qualities[attempt%qualities.length]));
            if(!blob) throw new Error("This browser couldn't process that image.");
            if(blob.size<=100*1024 || (scale<=0.5 && blob.size<=140*1024)) break;
            if(attempt%qualities.length===qualities.length-1) scale*=0.82;
          }
          if(!blob || blob.size>140*1024) throw new Error("That image could not be reduced enough for browser storage. Try a smaller image.");
          const output = new FileReader();
          output.onerror = ()=>reject(new Error("Couldn't prepare the optimized image."));
          output.onload = ()=>resolve(output.result);
          output.readAsDataURL(blob);
        }catch(error){ reject(error); }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleFoodImageUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){ toast("Please choose an image file","error"); input.value=""; return; }
  if(file.size > 3*1024*1024){ toast("Please choose an image under 3MB","error"); input.value=""; return; }
  const saveButton = document.getElementById("fe-save-button");
  if(saveButton) saveButton.disabled = true;
  try{
    const optimizedImage = await compressFoodImage(file);
    window._feImageData = await uploadFoodImageToWebsite(optimizedImage);
    updateFoodPreview();
    document.getElementById("fe-remove-image-wrap").innerHTML = `<button type="button" class="link-btn" onclick="removeFoodImage()">Remove uploaded photo</button>`;
    toast("Photo optimized — save the item to apply it","success");
  }catch(error){
    input.value = "";
    toast(error.message||"Couldn't upload that photo to the website. Make sure the website server is running.","error");
  }finally{
    if(saveButton) saveButton.disabled = false;
  }
}

function removeFoodImage(){
  window._feImageData = null;
  const fileInput = document.getElementById("fe-image-file");
  if(fileInput) fileInput.value = "";
  updateFoodPreview();
  document.getElementById("fe-remove-image-wrap").innerHTML = `<span class="small-muted">No photo uploaded — using illustration</span>`;
}

function clearFieldErrors(){
  ["fe-name-field","fe-price-field","fe-sizes-field"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.classList.remove("has-err");
  });
  document.querySelectorAll("#generic-modal-overlay .err").forEach(e=>e.remove());
}

function markFieldError(fieldId, message){
  const field = document.getElementById(fieldId);
  field.classList.add("has-err");
  const span = document.createElement("span");
  span.className = "err";
  span.textContent = message;
  field.appendChild(span);
}

async function saveFoodEditor(id){
  clearFieldErrors();
  const name = document.getElementById("fe-name").value.trim();
  const priceRaw = document.getElementById("fe-price").value;
  const price = parseFloat(priceRaw);

  let hasError = false;
  if(!name){ markFieldError("fe-name-field","Please enter a name for this dish."); hasError = true; }
  if(!priceRaw || isNaN(price) || price<=0){ markFieldError("fe-price-field","Enter a price greater than 0."); hasError = true; }
  if(hasError){ toast("Please fix the highlighted fields","error"); return; }

  const category = document.getElementById("fe-cat").value;
  let sizes = [];
  if(isPizzaCategory(category)){
    const rows = [...document.querySelectorAll("#fe-size-rows .fe-size-row")];
    const seenNames = new Set();
    rows.forEach(row=>{
      const sizeName = row.querySelector(".fe-size-name").value.trim();
      const sizePriceRaw = row.querySelector(".fe-size-price").value;
      if(!sizeName && !sizePriceRaw) return;
      const sizePrice = parseFloat(sizePriceRaw);
      if(!sizeName || !sizePriceRaw || !Number.isFinite(sizePrice) || sizePrice<=0){
        markFieldError("fe-sizes-field","Enter a size name and a price greater than 0 for each size.");
        hasError = true;
        return;
      }
      const key = sizeName.toLocaleLowerCase();
      if(seenNames.has(key)){
        markFieldError("fe-sizes-field","Each pizza size must have a unique name.");
        hasError = true;
        return;
      }
      seenNames.add(key);
      sizes.push({name:sizeName,delta:sizePrice-price});
    });
    if(!sizes.length){ markFieldError("fe-sizes-field","Add at least one pizza size and its price."); hasError=true; }
  }
  if(hasError){ toast("Please fix the highlighted fields","error"); return; }
  const variants = document.getElementById("fe-variants").value.split(",").map(s=>s.trim()).filter(Boolean).map(n=>({name:n}));
  const data = {
    name, desc:document.getElementById("fe-desc").value.trim(), art:document.getElementById("fe-art").value||"pizza_margherita",
    image: window._feImageData || null,
    category, price,
    rating:parseFloat(document.getElementById("fe-rating").value)||4.5, prepTime:parseInt(document.getElementById("fe-prep").value)||10,
    sizes, variants,
    available:document.getElementById("fe-available").checked, featured:document.getElementById("fe-featured").checked, popular:document.getElementById("fe-popular").checked
  };
  const previousMenu = Array.isArray(DB.menu)?DB.menu:[];
  const nextMenu = previousMenu.slice();
  if(id){
    const index = nextMenu.findIndex(f=>f.id===id);
    if(index<0){ toast("This menu item could not be found. Refresh the page and try again.","error"); return; }
    nextMenu[index] = {...nextMenu[index], ...data};
  } else { nextMenu.push({id:uid("f"), ...data}); }
  DB.menu = nextMenu;
  try{
    await saveSharedMenu(nextMenu);
    saveDB();
  }
  catch(error){
    DB.menu = previousMenu;
    toast("The item couldn't be saved to the website. Check that the server is running, then try again.","error");
    return;
  }
  window._feImageData = null;
  toast(id?"Item updated":"Item added","success");
  closeModal(); document.getElementById("dash-content").innerHTML = renderAdminMenuContent();
}

function confirmDeleteFood(id){
  showConfirm("Delete this food item? This cannot be undone.", ()=>{
    const previousMenu = DB.menu;
    DB.menu = DB.menu.filter(f=>f.id!==id);
    saveSharedMenu(DB.menu).then(()=>{
      saveDB(); toast("Item deleted","success"); document.getElementById("dash-content").innerHTML = renderAdminMenuContent();
    }).catch(()=>{
      DB.menu = previousMenu;
      toast("The item couldn't be deleted from the website. Check that the server is running.","error");
    });
  });
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  // Delegate from the stable document root so the Add action continues to
  // work when the dashboard content is replaced after an edit or save.
  document.addEventListener("click", function(event){
    const button = event.target.closest('[data-action="add-food-item"]');
    if(button){ event.preventDefault(); openFoodEditor(null); }
  });
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","menu","Menu", renderAdminMenuContent());
});
