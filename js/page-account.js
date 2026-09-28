/* Customer account page — overview, order history, favorites,
   notifications and profile settings, switched locally between tabs
   with no page reload. A ?tab= query string picks the tab to open with
   (used by links from the home page and footer). */

let accountTab = "overview";

function tabLink(key,label,active){
  return `<button class="tab-btn ${active===key?'active':''}" onclick="switchAccountTab('${key}')">${label}</button>`;
}

function renderAccountContent(){
  let sub = accountTab;
  const user = currentUser();
  sub = ["orders","favorites","notifications","settings"].includes(sub) ? sub : "overview";
  const myOrders = DB.orders.filter(o=>o.customerId===user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const current = myOrders.filter(o=>!["completed","cancelled"].includes(o.status));
  const favIds = Object.keys(DB.favorites).filter(id=>DB.favorites[id]);
  const myNotifs = DB.notifications.filter(n=>n.userId===user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return `<section class="section-tight"><div class="container">
    <div class="sec-head"><div><h2>Hello, ${esc(user.name.split(" ")[0])}</h2><p>Manage your orders, favorites and profile.</p></div></div>
    <div class="tabs">
      ${tabLink("overview","Overview",sub)}${tabLink("orders","Orders",sub)}${tabLink("favorites","Favorites",sub)}${tabLink("notifications","Notifications",sub)}${tabLink("settings","Account",sub)}
    </div>
    ${sub==="overview" ? `
      <div class="kpi-grid">
        <div class="kpi-card"><div class="lbl">Active orders</div><div class="val">${current.length}</div></div>
        <div class="kpi-card"><div class="lbl">Total orders</div><div class="val">${myOrders.length}</div></div>
        <div class="kpi-card"><div class="lbl">Favorites saved</div><div class="val">${favIds.length}</div></div>
        <div class="kpi-card"><div class="lbl">Unread notifications</div><div class="val">${myNotifs.filter(n=>!n.read).length}</div></div>
      </div>
      <h3 style="margin-bottom:14px;">Current orders</h3>
      ${current.length? current.map(o=>orderRowCard(o)).join("") : emptyState("📦","No active orders","Ready for something delicious?", `<a href="${paths().menu}" class="btn btn-primary">Browse menu</a>`)}
    ` : sub==="orders" ? `
      <h3 style="margin-bottom:14px;">Order history</h3>
      ${myOrders.length? myOrders.map(o=>orderRowCard(o)).join("") : emptyState("📦","No orders yet","Your placed orders will show up here.", `<a href="${paths().menu}" class="btn btn-primary">Browse menu</a>`)}
    ` : sub==="favorites" ? `
      <h3 style="margin-bottom:14px;">Your favorites</h3>
      ${favIds.length? `<div class="food-grid">${favIds.map(id=>DB.menu.find(f=>f.id===id)).filter(Boolean).map(foodCard).join("")}</div>` : emptyState("♡","No favorites yet","Tap the heart on any dish to save it here.", `<a href="${paths().menu}" class="btn btn-primary">Browse menu</a>`)}
    ` : sub==="notifications" ? `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><h3>Notifications</h3><button class="link-btn" onclick="markAllRead('${user.id}')">Mark all as read</button></div>
      ${myNotifs.length? `<div class="panel">${myNotifs.map(n=>notifItem(n)).join("")}</div>` : emptyState("🔔","No notifications","You're all caught up.")}
    ` : `
      <div class="panel" style="max-width:520px;">
        <h3 style="margin-bottom:14px;">Your account</h3>
        <div class="field"><label>Full name</label><input id="pf-name" value="${esc(user.name)}"></div>
        <div class="field"><label>Mobile number</label><input id="pf-mobile" value="${esc(user.mobile)}"></div>
        <div class="field"><label>Email</label><input value="${esc(user.email)}" disabled></div>
        <div class="field"><label>Address</label><textarea id="pf-address" rows="2">${esc(user.address||"")}</textarea></div>
        <button class="btn btn-primary" onclick="saveProfile()">Save changes</button>
      </div>
    `}
  </div></section>`;
}

function onFavoritesChanged(){
  if(accountTab==="favorites") document.getElementById("page-content").innerHTML = renderAccountContent();
}

function onNotificationsChanged(){
  document.getElementById("page-content").innerHTML = renderAccountContent();
}

function switchAccountTab(key){
  accountTab = key;
  document.getElementById("page-content").innerHTML = renderAccountContent();
}

function saveProfile(){
  const user = currentUser();
  const name=document.getElementById("pf-name").value.trim();
  if(!name){toast("Please enter your name","error");return;}
  user.name = name;
  user.mobile = document.getElementById("pf-mobile").value.trim();
  user.address = document.getElementById("pf-address").value.trim();
  saveDB(); toast("Your account details were updated","success");
  document.getElementById("page-content").innerHTML = renderAccountContent();
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireLogin() ? currentUser() : null;
  if(!currentUser()){ location.href = paths().login; return; }
  const qp = new URLSearchParams(location.search);
  const tab = qp.get("tab");
  if(["orders","favorites","notifications","settings"].includes(tab)) accountTab = tab;
  mountHeaderFooter(null);
  document.getElementById("page-content").innerHTML = renderAccountContent();
});
