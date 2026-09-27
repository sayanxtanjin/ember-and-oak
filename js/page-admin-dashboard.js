/* Admin overview page: KPI cards, the revenue/branch/type/best-seller
   charts and a read-only list of the most recent orders. */

function renderAdminDashboardContent(){
  const today = new Date().toDateString();
  const todayOrders = DB.orders.filter(o=>new Date(o.date).toDateString()===today);
  const revenue = DB.orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const todayRevenue = todayOrders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
  const pending = DB.orders.filter(o=>["pending","confirmed","preparing","out_for_delivery","ready"].includes(o.status)).length;
  const completed = DB.orders.filter(o=>o.status==="completed").length;
  const cancelled = DB.orders.filter(o=>o.status==="cancelled").length;
  const customers = DB.users.filter(u=>u.role==="customer").length;

  const byBranch = DB.branches.map(b=>({name:b.name.split(" ")[0], count:DB.orders.filter(o=>o.branchId===b.id).length}));
  const byType = {delivery:DB.orders.filter(o=>o.type==="delivery").length, takeaway:DB.orders.filter(o=>o.type==="takeaway").length};
  const bestSellers = {};
  DB.orders.forEach(o=>o.items.forEach(i=>{ bestSellers[i.name]=(bestSellers[i.name]||0)+i.qty; }));
  const topFoods = Object.entries(bestSellers).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Revenue trend over the last 14 days
  const trendDays = [];
  for(let i=13;i>=0;i--){
    const d = new Date(Date.now()-i*86400000);
    const dayOrders = DB.orders.filter(o=>new Date(o.date).toDateString()===d.toDateString() && o.status!=="cancelled");
    trendDays.push({label:d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}), value:dayOrders.reduce((s,o)=>s+o.total,0)});
  }

  return `
  <div class="kpi-grid">
    <div class="kpi-card"><div class="lbl">Today's revenue</div><div class="val">${fmt(todayRevenue)}</div></div>
    <div class="kpi-card"><div class="lbl">Today's orders</div><div class="val">${todayOrders.length}</div></div>
    <div class="kpi-card"><div class="lbl">Total revenue</div><div class="val">${fmt(revenue)}</div></div>
    <div class="kpi-card"><div class="lbl">Total customers</div><div class="val">${customers}</div></div>
    <div class="kpi-card"><div class="lbl">Active branches</div><div class="val">${DB.branches.filter(b=>b.active).length}/${DB.branches.length}</div></div>
    <div class="kpi-card"><div class="lbl">Menu items</div><div class="val">${DB.menu.length}</div></div>
    <div class="kpi-card"><div class="lbl">Pending orders</div><div class="val">${pending}</div></div>
    <div class="kpi-card"><div class="lbl">Completed / Cancelled</div><div class="val">${completed} / ${cancelled}</div></div>
  </div>

  ${buildLineChart("chart-revenue","Revenue trend","Last 14 days", trendDays.map(d=>d.label), trendDays.map(d=>d.value), {valueLabel:"Revenue", formatter:v=>fmt(v)})}

  <div class="grid-2" style="margin-top:22px;">
    ${buildLineChart("chart-branch","Orders by branch", null, byBranch.map(b=>b.name), byBranch.map(b=>b.count), {valueLabel:"Orders"})}
    ${buildLineChart("chart-type","Delivery vs takeaway", null, ["Delivery","Takeaway"], [byType.delivery,byType.takeaway], {valueLabel:"Orders"})}
  </div>

  <div style="margin-top:22px;">
    ${buildLineChart("chart-bestsellers","Best-selling items", null, topFoods.map(([n])=>n.split(" ").slice(0,2).join(" ")), topFoods.map(([,c])=>c), {valueLabel:"Sold"})}
  </div>

  <div class="panel" style="margin-top:22px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;"><h3 style="font-size:15px;">Recent orders</h3><a href="${paths().adminOrders}" class="link-btn">View all</a></div>
    <div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Branch</th><th>Type</th><th>Total</th><th>Status</th></tr></thead><tbody>
      ${DB.orders.slice(0,6).map(o=>`<tr><td>${o.id}</td><td>${esc(o.customerName)}</td><td>${esc(branchName(o.branchId))}</td><td>${o.type}</td><td>${fmt(o.total)}</td><td><span class="status-pill st-${o.status.replace(/_/g,'')}">${STATUS_LABELS[o.status]}</span></td></tr>`).join("")}
    </tbody></table></div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","dashboard","Overview", renderAdminDashboardContent());
  wireAllCharts();
});
