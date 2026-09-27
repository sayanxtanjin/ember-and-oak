/* Cart page — line items, quantity controls, coupon code and the order
   summary. onCartChanged() (called by the shared cart.js after any
   mutation) just redraws this whole section, which is cheap and keeps
   the totals honest. */

function renderCartContent(){
  if(DB.cart.length===0){
    return `<section class="section"><div class="container">${emptyState("🛒","Your cart is empty","Looks like you haven't added anything yet.", `<a href="${paths().menu}" class="btn btn-primary">Explore menu</a>`)}</div></section>`;
  }
  const sub = cartSubtotal(); const discount = currentDiscount(); const delivery = DB.orderType==="takeaway"?0:(DB.selectedBranchId? (DB.branches.find(b=>b.id===DB.selectedBranchId)?.deliveryFee||DB.config.deliveryDefaultFee) : DB.config.deliveryDefaultFee);
  const total = Math.max(0, sub - discount) + delivery;
  return `
  <section class="section-tight">
    <div class="container">
      <div class="sec-head"><h2>Your cart</h2></div>
      <div class="cart-layout">
        <div class="panel">
          ${DB.cart.map(i=>`
            <div class="cart-item">
              <div class="em">${foodVisual(i.art,44,i.image)}</div>
              <div>
                <div style="font-weight:600;">${esc(i.name)}</div>
                <div class="small-muted">${[i.size,i.variant].filter(Boolean).join(" · ")||"Standard"}</div>
                <div class="small-muted">${fmt(i.unitPrice)} each</div>
                <div class="qty-ctrl" style="margin-top:8px;">
                  <button onclick="updateCartQty('${i.key}',-1)">−</button><span>${i.qty}</span><button onclick="updateCartQty('${i.key}',1)">+</button>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700;">${fmt(i.unitPrice*i.qty)}</div>
                <button class="link-btn" style="margin-top:10px;" onclick="removeCartItem('${i.key}')">Remove</button>
              </div>
            </div>`).join("")}
          <button class="btn btn-ghost btn-sm" style="margin-top:14px;" onclick="clearCart()">Clear cart</button>
        </div>
        <div class="panel">
          <h3 style="margin-bottom:14px;">Order summary</h3>
          <div class="field">
            <label>Coupon code</label>
            <div style="display:flex; gap:8px;">
              <input id="coupon-input" placeholder="e.g. WELCOME10" value="${esc(DB.appliedCoupon||'')}">
              <button class="btn btn-outline btn-sm" onclick="applyCoupon()">Apply</button>
            </div>
            ${DB.appliedCoupon?`<span class="hint">Applied: ${esc(DB.appliedCoupon)} <button class="link-btn" onclick="removeCoupon()">remove</button></span>`:""}
          </div>
          <div class="summary-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
          <div class="summary-row"><span>Discount</span><span>${discount>0?"−":""}${fmt(discount)}</span></div>
          <div class="summary-row"><span>Delivery fee</span><span>${DB.orderType==="takeaway"?"—":fmt(delivery)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
          <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="location.href=paths().checkout">Proceed to checkout</button>
        </div>
      </div>
    </div>
  </section>`;
}

function onCartChanged(){
  document.getElementById("page-content").innerHTML = renderCartContent();
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("cart");
  document.getElementById("page-content").innerHTML = renderCartContent();
});
