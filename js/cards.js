/* Reusable card renderers — a food card, a branch card, an offer card and
   so on — shared by several pages so a dish or a branch looks the same
   everywhere it appears. */

function foodCard(f){
  const fav = DB.favorites[f.id];
  return `
  <div class="food-card ${f.available?'':'unavailable'}">
    <div class="food-media">
      <div class="food-badges">
        ${f.featured?'<span class="badge gold">Featured</span>':""}
        ${f.popular?'<span class="badge wine">Popular</span>':""}
        ${!f.available?'<span class="badge muted">Unavailable</span>':""}
      </div>
      <button class="food-fav ${fav?'active':''}" onclick="toggleFavorite('${f.id}', this)" aria-label="Favorite">${fav?'♥':'♡'}</button>
      ${foodVisual(f.art,108,f.image)}
    </div>
    <div class="food-body">
      <div class="food-title-row"><h3>${esc(f.name)}</h3><span class="food-price">${fmt(f.price)}</span></div>
      <p class="food-desc">${esc(f.desc)}</p>
      <div class="food-meta"><span class="stars">${starString(f.rating)}</span><span>${f.rating}</span><span>· ${f.prepTime} min</span></div>
      <div class="food-foot">
        <button class="btn btn-outline btn-sm" onclick="openFoodModal('${f.id}')">Details</button>
        <button class="btn btn-primary btn-sm" ${f.available?"":"disabled"} onclick="quickAdd('${f.id}')">Add to cart</button>
      </div>
    </div>
  </div>`;
}

function offerCard(o){
  const valueLabel = o.type==="percentage" ? `${o.value}% OFF` : `${fmt(o.value)} OFF`;
  return `<div class="offer-card"><h3>${valueLabel}</h3><p style="color:#C9BFA9;">${esc(o.desc)}</p>
    <div class="offer-code">${esc(o.code)}</div></div>`;
}

function branchCard(b){
  const open = branchIsOpenNow(b) && b.active;
  return `<div class="branch-card">
    <h3 style="font-size:18px;">${esc(b.name)}</h3>
    <p class="small-muted">${esc(b.address)}</p>
    <p class="small-muted"><span class="status-dot ${open?'status-open':'status-closed'}"></span>${open?'Open now':'Closed'} · ${b.openTime} – ${b.closeTime}</p>
    <div class="branch-tags">
      <span class="tag ${b.delivery?'on':'off'}">${b.delivery?'Delivery available':'No delivery'}</span>
      <span class="tag ${b.takeaway?'on':'off'}">${b.takeaway?'Takeaway available':'No takeaway'}</span>
    </div>
    <a href="${paths().branches}" class="btn btn-outline btn-sm" style="margin-top:10px;">View branch</a>
  </div>`;
}

function branchDetailCard(b,distance){
  const open = branchIsOpenNow(b) && b.active;
  return `<div class="branch-card">
    <div style="display:flex; justify-content:space-between;">
      <h3 style="font-size:18px;">${esc(b.name)}</h3>
      ${!b.active?'<span class="badge muted">Inactive</span>':''}
    </div>
    <p class="small-muted">${esc(b.address)}</p>
    <p class="small-muted">${esc(b.phone)}</p>
    <p class="small-muted"><span class="status-dot ${open?'status-open':'status-closed'}"></span>${open?'Open now':'Closed'} · ${b.openTime} – ${b.closeTime}</p>
    ${distance!=null?`<p class="small-muted">📍 ${distance.toFixed(1)} km away</p>`:""}
    <div class="branch-tags">
      <span class="tag ${b.delivery?'on':'off'}">${b.delivery?'Delivery':'No delivery'}</span>
      <span class="tag ${b.takeaway?'on':'off'}">${b.takeaway?'Takeaway':'No takeaway'}</span>
    </div>
    <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="chooseBranchAndOrder('${b.id}')">Order from here</button>
  </div>`;
}

function reviewCard(r){
  const f = DB.menu.find(x=>x.id===r.foodId);
  return `<div class="review-card">
    <div class="review-head">
      <div class="review-name"><span class="avatar">${esc(r.customerName[0])}</span>${esc(r.customerName)}</div>
      <span class="stars">${starString(r.rating)}</span>
    </div>
    <p style="font-size:13.5px;">"${esc(r.comment)}"</p>
    <p class="small-muted" style="margin-top:8px;">${f?esc(f.name)+" · ":""}${timeAgo(r.date)}</p>
  </div>`;
}

function notFoundContent(){
  return `<div class="center-page"><h2>Page not found</h2><p style="margin-top:10px;">The page you're looking for doesn't exist.</p><a href="${paths().home}" class="btn btn-primary" style="margin-top:20px;">Go home</a></div>`;
}

function emptyState(emoji,title,desc,actionHtml){
  return `<div class="empty-state"><div class="em">${emoji}</div><h3>${esc(title)}</h3><p style="margin-top:8px;">${esc(desc)}</p><div style="margin-top:18px;">${actionHtml||""}</div></div>`;
}

function catName(id){ const c=DB.categories.find(c=>c.id===id); return c?c.name:""; }

function orderRowCard(o){
  const b = DB.branches.find(x=>x.id===o.branchId);
  return `<div class="panel" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
    <div>
      <div style="font-weight:700;">${esc(o.id)} <span class="status-pill st-${o.status.replace(/_/g,'')}">${STATUS_LABELS[o.status]}</span></div>
      <div class="small-muted" style="margin-top:4px;">${esc(b.name)} · ${o.type==="delivery"?"Delivery":"Takeaway"} · ${fmtDate(o.date)}</div>
      <div class="small-muted">${o.items.map(i=>i.name+" ×"+i.qty).join(", ")}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-weight:700;">${fmt(o.total)}</div>
      <a href="${paths().order}?id=${o.id}" class="btn btn-outline btn-sm" style="margin-top:8px;">Track</a>
    </div>
  </div>`;
}

function notifItem(n){
  return `<div class="notif-item ${n.read?'read':''}"><div class="notif-dot"></div><div><div style="font-weight:600; font-size:13.5px;">${esc(n.title)}</div><div class="small-muted">${esc(n.message)}</div><div class="small-muted" style="margin-top:2px;">${timeAgo(n.date)}</div></div></div>`;
}

