/* Manager overview page — scoped to whichever branch this manager is
   assigned to. Today's order counts plus a short, editable list of
   orders from that branch that still need attention. */

function renderManagerDashboardContent(){
  const user = currentUser();
  if(user.role==="manager" && !user.branchId){
    return `<div class="panel"><p>You haven't been assigned to a branch yet. Ask an admin to assign you to one from Admin &gt; Customers.</p></div>`;
  }
  const myOrders = ordersForThisManager();
  const today = new Date().toDateString();
  const todayOrders = myOrders.filter(o=>new Date(o.date).toDateString()===today);
  const pending = myOrders.filter(o=>o.status==="pending").length;
  const active = myOrders.filter(o=>["confirmed","preparing","out_for_delivery","ready"].includes(o.status)).length;
  const completedToday = todayOrders.filter(o=>o.status==="completed").length;
  return `${user.role==="manager" ? `<p class="small-muted" style="margin-bottom:16px;">Showing orders for <b>${esc(branchName(user.branchId))}</b> only.</p>` : ""}
  <div class="kpi-grid">
    <div class="kpi-card"><div class="lbl">Today's orders</div><div class="val">${todayOrders.length}</div></div>
    <div class="kpi-card"><div class="lbl">Pending confirmation</div><div class="val">${pending}</div></div>
    <div class="kpi-card"><div class="lbl">Active orders</div><div class="val">${active}</div></div>
    <div class="kpi-card"><div class="lbl">Completed today</div><div class="val">${completedToday}</div></div>
  </div>
  <div class="panel"><h3 style="font-size:15px; margin-bottom:10px;">Orders needing attention</h3>
    <div id="manager-dashboard-orders">${adminOrdersTable(myOrders.filter(o=>["pending","confirmed","preparing"].includes(o.status)).slice(0,8), "manager")}</div>
  </div>`;
}

function onOrderStatusChanged(){
  document.getElementById("dash-content").innerHTML = renderManagerDashboardContent();
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["manager","admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("manager","dashboard","Overview", renderManagerDashboardContent());
});
