/* Checkout — a four-step flow (branch, delivery/takeaway, contact info,
   review) kept on one page. Each step re-renders just #checkout-body, so
   moving between steps never reloads the page. */

let checkoutStep = 1;

function renderCheckoutContent(){
  if(DB.cart.length===0){
    return `<section class="section"><div class="container">${emptyState("🛒","Your cart is empty","Add items to your cart before checking out.",`<a href="${paths().menu}" class="btn btn-primary">Browse menu</a>`)}</div></section>`;
  }
  const user = currentUser();
  const steps = ["Branch","Order Type","Your Info","Review & Place"];
  return `<section class="section-tight"><div class="container" style="max-width:760px;">
    <div class="sec-head"><h2>Checkout</h2></div>
    <div class="stepper">${steps.map((s,i)=>`<div class="step ${checkoutStep===i+1?'active':checkoutStep>i+1?'done':''}"><div class="step-num">${checkoutStep>i+1?'✓':i+1}</div><div class="step-label">${s}</div></div>`).join("")}</div>
    <div id="checkout-body">${checkoutStepBody(checkoutStep,user)}</div>
  </div></section>`;
}

function checkoutStepBody(step,user){
  if(step===1) return checkoutStepBranch();
  if(step===2) return checkoutStepType();
  if(step===3) return checkoutStepInfo(user);
  return checkoutStepReview(user);
}

function checkoutStepBranch(){
  return `<div class="panel">
    <h3 style="margin-bottom:14px;">Select your branch</h3>
    <div id="co-branch-list">${DB.branches.map(b=>`
      <div class="select-branch-card ${DB.selectedBranchId===b.id?'selected':''}" onclick="selectCheckoutBranch('${b.id}')">
        <div>
          <div style="font-weight:600;">${esc(b.name)} ${!b.active?'<span class="badge muted">Inactive</span>':''}</div>
          <div class="small-muted">${esc(b.address)}</div>
          <div class="branch-tags" style="margin-top:6px;">
            <span class="tag ${branchIsOpenNow(b)&&b.active?'on':'off'}">${branchIsOpenNow(b)&&b.active?'Open now':'Closed'}</span>
            <span class="tag ${b.delivery?'on':'off'}">${b.delivery?'Delivery':'No delivery'}</span>
            <span class="tag ${b.takeaway?'on':'off'}">${b.takeaway?'Takeaway':'No takeaway'}</span>
          </div>
        </div>
        <div>${DB.selectedBranchId===b.id?'✓':''}</div>
      </div>`).join("")}</div>
    <button class="btn btn-outline btn-sm" style="margin-top:6px;" onclick="detectLocationCheckout()">📍 Suggest nearest branch</button>
    <div style="margin-top:22px; display:flex; justify-content:flex-end;">
      <button class="btn btn-primary" onclick="checkoutNext()">Continue</button>
    </div>
  </div>`;
}

function selectCheckoutBranch(id){
  const b = DB.branches.find(x=>x.id===id);
  if(!b.active){ toast("This branch is currently inactive","error"); return; }
  DB.selectedBranchId=id; saveDB();
  document.getElementById("co-branch-list").innerHTML = DB.branches.map(bb=>`
      <div class="select-branch-card ${DB.selectedBranchId===bb.id?'selected':''}" onclick="selectCheckoutBranch('${bb.id}')">
        <div>
          <div style="font-weight:600;">${esc(bb.name)} ${!bb.active?'<span class="badge muted">Inactive</span>':''}</div>
          <div class="small-muted">${esc(bb.address)}</div>
          <div class="branch-tags" style="margin-top:6px;">
            <span class="tag ${branchIsOpenNow(bb)&&bb.active?'on':'off'}">${branchIsOpenNow(bb)&&bb.active?'Open now':'Closed'}</span>
            <span class="tag ${bb.delivery?'on':'off'}">${bb.delivery?'Delivery':'No delivery'}</span>
            <span class="tag ${bb.takeaway?'on':'off'}">${bb.takeaway?'Takeaway':'No takeaway'}</span>
          </div>
        </div>
        <div>${DB.selectedBranchId===bb.id?'✓':''}</div>
      </div>`).join("");
}

function detectLocationCheckout(){
  if(!navigator.geolocation){ toast("Location not supported","error"); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude}=pos.coords;
    const best = DB.branches.filter(b=>b.active).map(b=>({...b,dist:haversineKm(latitude,longitude,b.lat,b.lng)})).sort((a,b)=>a.dist-b.dist)[0];
    if(best){ selectCheckoutBranch(best.id); toast(`Nearest branch selected: ${best.name} (${best.dist.toFixed(1)} km)`,"success"); }
  }, ()=>toast("Location permission denied — please pick a branch manually","error"));
}

function checkoutStepType(){
  const b = DB.branches.find(x=>x.id===DB.selectedBranchId);
  return `<div class="panel">
    <h3 style="margin-bottom:14px;">How would you like your order?</h3>
    <div class="grid-2">
      <div class="order-type-card ${DB.orderType==='delivery'?'selected':''} ${!b.delivery?'unavailable':''}" style="${!b.delivery?'opacity:.5;pointer-events:none;':''}" onclick="setOrderType('delivery')">
        <div class="em">🛵</div><div style="font-weight:600;">Delivery</div><div class="small-muted">Fee: ${fmt(b.deliveryFee)}</div>
      </div>
      <div class="order-type-card ${DB.orderType==='takeaway'?'selected':''}" style="${!b.takeaway?'opacity:.5;pointer-events:none;':''}" onclick="setOrderType('takeaway')">
        <div class="em">🥡</div><div style="font-weight:600;">Takeaway</div><div class="small-muted">${b.takeaway?'Pickup at branch':'Not available at this branch'}</div>
      </div>
    </div>
    <div style="margin-top:22px; display:flex; justify-content:space-between;">
      <button class="btn btn-outline" onclick="checkoutBack()">Back</button>
      <button class="btn btn-primary" onclick="checkoutNext()">Continue</button>
    </div>
  </div>`;
}

function setOrderType(t){ DB.orderType=t; saveDB(); renderCheckoutStepBody(); }

function checkoutStepInfo(user){
  return `<div class="panel">
    <h3 style="margin-bottom:14px;">Your information</h3>
    <div class="grid-2">
      <div class="field"><label>Full name</label><input id="co-name" value="${esc(user.name)}"></div>
      <div class="field"><label>Mobile number</label><input id="co-mobile" value="${esc(user.mobile)}"></div>
    </div>
    ${DB.orderType==="delivery" ? `
    <div class="field"><label>Delivery address <span class="req">*</span></label><textarea id="co-address" rows="2">${esc(user.address||"")}</textarea></div>
    <div class="field"><label>Delivery notes (optional)</label><input id="co-notes" placeholder="Gate code, floor, landmark…"></div>
    ` : `<p class="small-muted">Pickup at: ${esc(DB.branches.find(b=>b.id===DB.selectedBranchId).name)} — estimated ready in 20–30 minutes.</p>`}
    <div style="margin-top:22px; display:flex; justify-content:space-between;">
      <button class="btn btn-outline" onclick="checkoutBack()">Back</button>
      <button class="btn btn-primary" onclick="checkoutNext()">Continue</button>
    </div>
  </div>`;
}

function checkoutStepReview(user){
  const b = DB.branches.find(x=>x.id===DB.selectedBranchId);
  const sub = cartSubtotal(); const discount=currentDiscount(); const delivery = DB.orderType==="delivery"?b.deliveryFee:0;
  const total = Math.max(0,sub-discount)+delivery;
  return `<div class="panel">
    <h3 style="margin-bottom:14px;">Review your order</h3>
    ${DB.cart.map(i=>`<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line); font-size:14px;"><span>${miniArt(i.art,20,i.image)}${esc(i.name)} ${[i.size,i.variant].filter(Boolean).length?`(${[i.size,i.variant].filter(Boolean).join(", ")})`:''} × ${i.qty}</span><span>${fmt(i.unitPrice*i.qty)}</span></div>`).join("")}
    <div class="summary-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
    <div class="summary-row"><span>Discount</span><span>${discount>0?"−":""}${fmt(discount)}</span></div>
    <div class="summary-row"><span>Delivery fee</span><span>${DB.orderType==="delivery"?fmt(delivery):"—"}</span></div>
    <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
    <hr class="rule">
    <div class="grid-2">
      <div><span class="small-muted">Branch</span><p style="color:var(--ink); font-weight:600;">${esc(b.name)}</p></div>
      <div><span class="small-muted">Order type</span><p style="color:var(--ink); font-weight:600;">${DB.orderType==="delivery"?"Delivery":"Takeaway"}</p></div>
      <div><span class="small-muted">Contact</span><p style="color:var(--ink); font-weight:600;">${esc(user.name)} · ${esc(user.mobile)}</p></div>
      <div><span class="small-muted">Payment</span><p style="color:var(--ink); font-weight:600;">${DB.orderType==="delivery"?"Cash on Delivery":"Pay at Restaurant"}</p></div>
    </div>
    <div style="margin-top:22px; display:flex; justify-content:space-between;">
      <button class="btn btn-outline" onclick="checkoutBack()">Back</button>
      <button class="btn btn-gold" onclick="placeOrder()">Place order</button>
    </div>
  </div>`;
}

function renderCheckoutStepBody(){
  document.getElementById("checkout-body").innerHTML = checkoutStepBody(checkoutStep, currentUser());
  document.querySelectorAll(".stepper .step").forEach((el,i)=>{
    el.classList.remove("active","done");
    if(checkoutStep===i+1) el.classList.add("active");
    else if(checkoutStep>i+1) el.classList.add("done");
    el.querySelector(".step-num").textContent = checkoutStep>i+1 ? "✓" : String(i+1);
  });
}

function checkoutNext(){
  if(checkoutStep===1 && !DB.selectedBranchId){ toast("Please select a branch","error"); return; }
  if(checkoutStep===1){
    const b = DB.branches.find(x=>x.id===DB.selectedBranchId);
    if(!branchIsOpenNow(b)){ toast("This branch is currently closed — you can still place a scheduled order.","info"); }
  }
  if(checkoutStep===2 && !DB.orderType){ toast("Please choose delivery or takeaway","error"); return; }
  if(checkoutStep===3 && DB.orderType==="delivery"){
    const addr = document.getElementById("co-address").value.trim();
    if(!addr){ toast("Please enter a delivery address","error"); return; }
  }
  checkoutStep = Math.min(4, checkoutStep+1);
  renderCheckoutStepBody();
}

function checkoutBack(){ checkoutStep = Math.max(1, checkoutStep-1); renderCheckoutStepBody(); }

function placeOrder(){
  const user = currentUser();
  const b = DB.branches.find(x=>x.id===DB.selectedBranchId);
  const name = document.getElementById("co-name")?.value || user.name;
  const mobile = document.getElementById("co-mobile")?.value || user.mobile;
  const address = DB.orderType==="delivery" ? (document.getElementById("co-address")?.value||user.address) : b.name+" (pickup)";
  const sub = cartSubtotal(); const discount=currentDiscount(); const delivery = DB.orderType==="delivery"?b.deliveryFee:0;
  const total = Math.max(0,sub-discount)+delivery;
  const order = {
    id: "ORD-"+Math.floor(1000+Math.random()*8999),
    customerId:user.id, customerName:name, mobile, address,
    branchId:b.id, type:DB.orderType,
    items: DB.cart.map(i=>({foodId:i.foodId,name:i.name,art:i.art,image:i.image||null,size:i.size,variant:i.variant,qty:i.qty,unitPrice:i.unitPrice,subtotal:i.unitPrice*i.qty})),
    subtotal:sub, discount, deliveryFee:delivery, total,
    status:"pending",
    paymentMethod: DB.orderType==="delivery"?"Cash on Delivery":"Pay at Restaurant",
    date: new Date().toISOString()
  };
  DB.orders.unshift(order);
  if(DB.appliedCoupon){ const o=DB.offers.find(x=>x.code===DB.appliedCoupon); if(o) o.used=(o.used||0)+1; }
  pushNotification("u-admin","New order",`New order ${order.id} placed at ${b.name}.`);
  pushNotification("u-manager","New order",`New order ${order.id} needs confirmation.`);
  pushNotification(user.id,"Order placed",`Your order ${order.id} has been placed.`);
  DB.cart=[]; DB.appliedCoupon=null; DB.orderType=null; DB.selectedBranchId=null;
  saveDB();
  checkoutStep = 1;
  location.href = paths().confirmation + "?order=" + order.id;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  if(!currentUser()){ location.href = paths().login; return; }
  mountHeaderFooter(null);
  document.getElementById("page-content").innerHTML = renderCheckoutContent();
});
