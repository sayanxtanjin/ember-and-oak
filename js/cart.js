/* Shopping cart + favorites logic. Any page can call addToCart/quickAdd;
   after a change it refreshes the header's cart badge and, if the current
   page defines onCartChanged()/onFavoritesChanged(), asks that page to
   redraw whatever part of itself depends on the cart or favorites. */

function cartLineTotal(f,size,variant){
  const delta = size ? (f.sizes.find(s=>s.name===size)||{delta:0}).delta : 0;
  return f.price+delta;
}

function addToCart(foodId,size,variant,qty){
  const f = DB.menu.find(x=>x.id===foodId);
  if(!f || !f.available) return;
  const key = foodId+"|"+(size||"")+"|"+(variant||"");
  const existing = DB.cart.find(c=>c.key===key);
  const unit = cartLineTotal(f,size,variant);
  if(existing){ existing.qty += qty; }
  else { DB.cart.push({key, foodId, name:f.name, art:f.art, image:f.image||null, size:size||null, variant:variant||null, qty, unitPrice:unit}); }
  saveDB();
  toast(f.name+" added to cart","success");
  updateHeaderCartBadge();
  if(typeof onCartChanged==="function") onCartChanged();
}

function updateCartQty(key,delta){
  const item = DB.cart.find(c=>c.key===key);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) DB.cart = DB.cart.filter(c=>c.key!==key);
  saveDB();
  updateHeaderCartBadge();
  if(typeof onCartChanged==="function") onCartChanged();
}

function removeCartItem(key){
  DB.cart = DB.cart.filter(c=>c.key!==key);
  saveDB();
  toast("Item removed","info");
  updateHeaderCartBadge();
  if(typeof onCartChanged==="function") onCartChanged();
}

function clearCart(){
  DB.cart=[]; DB.appliedCoupon=null;
  saveDB();
  updateHeaderCartBadge();
  if(typeof onCartChanged==="function") onCartChanged();
}

function cartSubtotal(){ return DB.cart.reduce((s,i)=>s+i.unitPrice*i.qty,0); }

function currentDiscount(){
  if(!DB.appliedCoupon) return 0;
  const o = DB.offers.find(x=>x.code===DB.appliedCoupon);
  if(!o) return 0;
  const sub = cartSubtotal();
  if(sub < o.minOrder) return 0;
  return o.type==="percentage" ? Math.round(sub*o.value/100) : Math.min(o.value, sub);
}

function currentDeliveryFee(){
  if(document.body.dataset.page==="cart") return DB.selectedBranchId ? (DB.branches.find(b=>b.id===DB.selectedBranchId)?.deliveryFee||DB.config.deliveryDefaultFee) : DB.config.deliveryDefaultFee;
  if(DB.orderType!=="delivery") return 0;
  const b = DB.branches.find(x=>x.id===DB.selectedBranchId);
  return b ? b.deliveryFee : DB.config.deliveryDefaultFee;
}

function toggleFavorite(foodId, btnEl){
  const user = currentUser();
  if(!user){ toast("Log in to save favorites","info"); location.href = paths().login; return; }
  DB.favorites[foodId] = !DB.favorites[foodId];
  const isFav = !!DB.favorites[foodId];
  if(!isFav) delete DB.favorites[foodId];
  saveDB();
  if(btnEl){ btnEl.classList.toggle("active", isFav); btnEl.textContent = isFav ? "♥" : "♡"; }
  if(typeof onFavoritesChanged==="function") onFavoritesChanged();
}

function applyCoupon(){
  const code = document.getElementById("coupon-input").value.trim().toUpperCase();
  if(!code){ return; }
  const o = DB.offers.find(x=>x.code===code);
  if(!o){ toast("Invalid coupon code","error"); return; }
  if(!o.active){ toast("This coupon is no longer active","error"); return; }
  if(new Date(o.endDate) < new Date()){ toast("This coupon has expired","error"); return; }
  if(o.usageLimit && o.used>=o.usageLimit){ toast("This coupon has reached its usage limit","error"); return; }
  if(cartSubtotal() < o.minOrder){ toast(`Minimum order for this coupon is ${fmt(o.minOrder)}`,"error"); return; }
  DB.appliedCoupon = code; saveDB(); toast("Coupon applied","success");
  if(typeof onCartChanged==="function") onCartChanged();
}

function removeCoupon(){ DB.appliedCoupon=null; saveDB(); if(typeof onCartChanged==="function") onCartChanged(); }

function quickAdd(id){
  if(!id) return;
  const f = DB.menu.find(x=>x.id===id);
  if(!f || !f.available) return;
  if(f.category==="cat-pizza" && f.sizes.length){ openSizePicker(id); return; }
  addToCart(id, f.sizes[0]?f.sizes[0].name:null, f.variants[0]?f.variants[0].name:null, 1);
}
