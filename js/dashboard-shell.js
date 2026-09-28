/* The admin/manager sidebar + topbar wrapper that every dashboard page
   sits inside. Each page renders its own content (a table, a form, the
   overview charts...) and hands the HTML to renderDashboardShell(), which
   takes care of the sidebar links, the active-page highlight and the
   "signed in as" line. */

const ADMIN_NAV = [
  ["dashboard","Overview","📊"],
  ["orders","Orders","🧾"],
  ["menu","Menu","🍽️"],
  ["categories","Categories","🏷️"],
  ["branches","Branches","🏬"],
  ["customers","Customers","👥"],
  ["offers","Promotions","🏷️"],
  ["reviews","Reviews","⭐"],
  ["settings","Settings","⚙️"]
];
const MANAGER_NAV = [
  ["dashboard","Overview","📊"],
  ["orders","Orders","🧾"]
];

function dashboardNavHref(role, key){
  const p = paths();
  const map = {
    admin: {dashboard:p.adminDashboard, orders:p.adminOrders, menu:p.adminMenu, categories:p.adminCategories, branches:p.adminBranches, customers:p.adminCustomers, offers:p.adminOffers, reviews:p.adminReviews, settings:p.adminSettings},
    manager: {dashboard:p.managerDashboard, orders:p.managerOrders}
  };
  return map[role][key];
}

function renderDashboardShell(role, activeKey, pageTitle, contentHtml){
  const user = currentUser();
  const nav = role==="admin" ? ADMIN_NAV : MANAGER_NAV;
  const p = paths();
  return `
  <div class="dash-shell">
    <aside class="dash-sidebar" id="dash-sidebar">
      <div class="dash-brand">${DB.config.logoImage?`<img class="admin-brand-logo" src="${esc(DB.config.logoImage)}" alt="">`:"🔥"} ${esc(DB.config.name)}</div>
      <div class="dash-role-badge">${role} panel</div>
      <ul class="dash-nav">
        ${nav.map(([key,label,ic])=>`<li><a href="${dashboardNavHref(role,key)}" class="${activeKey===key?'active':''}">${ic} ${label}</a></li>`).join("")}
        <li><a href="${p.home}">🏠 View website</a></li>
        <li><a href="javascript:void(0)" onclick="logout()">↩ Log out</a></li>
      </ul>
    </aside>
    <div>
      <div class="dash-main">
        <div class="dash-topbar">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="icon-btn hide-desktop" onclick="toggleDashSidebar()">☰</button>
            <h2 style="font-size:22px;">${esc(pageTitle)}</h2>
          </div>
          <div class="dash-topbar-actions">${themeToggleHtml()}<div class="small-muted">Signed in as <b>${esc(user.name)}</b> (${user.role})</div></div>
        </div>
        <div id="dash-content">${contentHtml}</div>
      </div>
    </div>
  </div>`;
}

function toggleDashSidebar(){
  const el = document.getElementById("dash-sidebar");
  if(el) el.classList.toggle("open");
}

/* Route guard for every admin/manager page: redirects to login if no one
   is signed in, or if the signed-in account doesn't hold one of the
   allowed roles. Returns the user object so the caller can use it, or
   null if it already redirected away. */
function requireRole(roles){
  const user = currentUser();
  if(!user || !roles.includes(user.role)){
    toast("Please log in with an account that can view this page.","error");
    location.href = paths().login;
    return null;
  }
  return user;
}
