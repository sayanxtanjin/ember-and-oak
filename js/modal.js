/* Generic modal overlay used for confirmations and admin forms, plus the
   food-detail modal (with size/variant picker, reviews, and a size-only
   quick-pick for pizzas) shared by any page that shows dishes to a
   customer. Every modal opener closes whatever overlay is already open
   first, so two never end up stacked on top of each other. */

function closeModal(){
  document.querySelectorAll(".modal-overlay").forEach(o => o.remove());
}

function showGenericModal(title, bodyHtml){
  closeModal();
  const overlay = document.createElement("div");
  overlay.className="modal-overlay"; overlay.id="generic-modal-overlay";
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  overlay.innerHTML = `<div class="modal"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>${bodyHtml}</div>`;
  document.body.appendChild(overlay);
}

function showConfirm(message, onYes){
  showGenericModal("Please confirm", `<p>${esc(message)}</p><div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
    <button class="btn btn-danger" id="confirm-yes-btn">Confirm</button>
  </div>`);
  document.getElementById("confirm-yes-btn").onclick = ()=>{ closeModal(); onYes(); };
}

/* Pizzas ask for a size before they're added — a small, focused modal
   with each size and its actual price, rather than a full detail view. */
function openSizePicker(id){
  const f = DB.menu.find(x=>x.id===id);
  if(!f) return;
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "size-picker-overlay";
  overlay.onclick = (e)=>{ if(e.target===overlay) closeModal(); };
  overlay.innerHTML = `<div class="modal">
    <div class="modal-head"><h3>Choose a size</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <p class="small-muted" style="margin-bottom:14px;">${esc(f.name)} — pick a size to add it to your cart.</p>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${f.sizes.map(s=>`
        <div class="select-branch-card" style="cursor:pointer;" onclick="addToCart('${f.id}','${esc(s.name)}',${f.variants[0]?`'${esc(f.variants[0].name)}'`:null},1); closeModal();">
          <div style="font-weight:600;">${esc(s.name)}</div>
          <div style="font-weight:700; color:var(--wine);">${fmt(f.price+s.delta)}</div>
        </div>
      `).join("")}
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function openFoodModal(id){
  const f = DB.menu.find(x=>x.id===id);
  if(!f) return;
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "food-modal-overlay";
  overlay.onclick = (e)=>{ if(e.target===overlay) closeModal(); };
  const sizeOptions = f.sizes.length ? `<div class="field"><label>Size</label><select id="fm-size">${f.sizes.map(s=>`<option value="${s.name}">${s.name} — ${fmt(f.price+s.delta)}</option>`).join("")}</select></div>` : "";
  const variantOptions = f.variants.length ? `<div class="field"><label>Option</label><select id="fm-variant">${f.variants.map(v=>`<option value="${v.name}">${v.name}</option>`).join("")}</select></div>` : "";
  const foodReviews = DB.reviews.filter(r=>r.foodId===f.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const user = currentUser();
  overlay.innerHTML = `<div class="modal">
    <div class="modal-head"><h3>${esc(f.name)}</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
    <div class="food-modal-media">${foodVisual(f.art,150,f.image)}</div>
    <p>${esc(f.desc)}</p>
    <div class="food-meta" style="margin:12px 0;"><span class="stars">${starString(f.rating)}</span><span>${f.rating}</span><span>· ${f.prepTime} min prep</span><span>· ${catName(f.category)}</span></div>
    ${sizeOptions}${variantOptions}
    <div class="field"><label>Quantity</label>
      <div class="qty-ctrl" style="width:110px;">
        <button onclick="fmQty(-1)">−</button><span id="fm-qty">1</span><button onclick="fmQty(1)">+</button>
      </div>
    </div>
    <hr class="rule">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-family:var(--font-display); font-size:22px; color:var(--wine);" id="fm-total">${fmt(f.price)}</span>
      <button class="btn btn-primary" ${f.available?"":"disabled"} onclick="addFromModal('${f.id}')">${f.available?"Add to cart":"Currently unavailable"}</button>
    </div>
    <hr class="rule">
    <h4 style="margin-bottom:10px;">Reviews ${foodReviews.length?`(${foodReviews.length})`:""}</h4>
    <div id="fm-reviews-list">${foodReviewsHtml(foodReviews)}</div>
    ${user ? `
      <div class="field" style="margin-top:14px;">
        <label>Your rating</label>
        <select id="fm-review-rating">
          <option value="5">★★★★★ — Excellent</option>
          <option value="4">★★★★☆ — Good</option>
          <option value="3">★★★☆☆ — Okay</option>
          <option value="2">★★☆☆☆ — Not great</option>
          <option value="1">★☆☆☆☆ — Poor</option>
        </select>
      </div>
      <div class="field"><label>Your review</label><textarea id="fm-review-comment" rows="2" placeholder="What did you think of this dish?"></textarea></div>
      <button class="btn btn-outline btn-sm" onclick="submitReview('${f.id}')">Submit review</button>
    ` : `<p class="small-muted">Log in to leave a review.</p>`}
  </div>`;
  document.body.appendChild(overlay);
  window._fmQty = 1; window._fmBase = f.price;
  const recalc = ()=>{
    const sizeSel = document.getElementById("fm-size");
    const delta = sizeSel ? (f.sizes.find(s=>s.name===sizeSel.value)||{delta:0}).delta : 0;
    document.getElementById("fm-total").textContent = fmt((f.price+delta)*window._fmQty);
  };
  if(document.getElementById("fm-size")) document.getElementById("fm-size").onchange = recalc;
  window._fmRecalc = recalc;
}

function foodReviewsHtml(reviews){
  if(!reviews.length) return `<p class="small-muted">No reviews yet — be the first to leave one.</p>`;
  return reviews.map(r=>`
    <div style="padding:10px 0; border-bottom:1px solid var(--line);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; font-size:13.5px;">${esc(r.customerName)}</span>
        <span class="stars" style="font-size:12.5px;">${starString(r.rating)}</span>
      </div>
      <p style="font-size:13px; margin-top:4px;">${esc(r.comment)}</p>
      <span class="small-muted" style="font-size:11.5px;">${timeAgo(r.date)}</span>
    </div>
  `).join("");
}

function submitReview(foodId){
  const user = currentUser();
  if(!user){ toast("Log in to leave a review","info"); location.href = paths().login; return; }
  const rating = parseInt(document.getElementById("fm-review-rating").value);
  const comment = document.getElementById("fm-review-comment").value.trim();
  if(!comment){ toast("Write a quick note before submitting","error"); return; }
  DB.reviews.unshift({id:uid("rv"), customerId:user.id, customerName:user.name, foodId, rating, comment, date:new Date().toISOString()});
  saveDB();
  toast("Thanks for your review!","success");
  document.getElementById("fm-reviews-list").innerHTML = foodReviewsHtml(DB.reviews.filter(r=>r.foodId===foodId).sort((a,b)=>new Date(b.date)-new Date(a.date)));
  document.getElementById("fm-review-comment").value = "";
}

function fmQty(delta){
  window._fmQty = Math.max(1, (window._fmQty||1)+delta);
  document.getElementById("fm-qty").textContent = window._fmQty;
  window._fmRecalc();
}

function addFromModal(id){
  const f = DB.menu.find(x=>x.id===id);
  const size = document.getElementById("fm-size") ? document.getElementById("fm-size").value : null;
  const variant = document.getElementById("fm-variant") ? document.getElementById("fm-variant").value : null;
  const qty = window._fmQty||1;
  addToCart(f.id, size, variant, qty);
  closeModal();
}
