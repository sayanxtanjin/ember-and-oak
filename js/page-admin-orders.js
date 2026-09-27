/* Admin > Orders: the full order list with search + status/branch/type
   filters, wired to the shared order detail modal in orders-common.js. */

const adminOrderFilter = {status:"all", branch:"all", type:"all", q:""};

function renderAdminOrdersContent(){
  const f = adminOrderFilter;
  let orders = DB.orders.slice();
  if(f.status!=="all") orders = orders.filter(o=>o.status===f.status);
  if(f.branch!=="all") orders = orders.filter(o=>o.branchId===f.branch);
  if(f.type!=="all") orders = orders.filter(o=>o.type===f.type);
  if(f.q) orders = orders.filter(o=>(o.id+" "+o.customerName+" "+o.mobile).toLowerCase().includes(f.q.toLowerCase()));
  return `
  <div class="filter-bar">
    <input placeholder="Search order ID, customer, phone…" value="${esc(f.q)}" oninput="adminOrderFilter.q=this.value; rerenderAdminOrders();">
    <select onchange="adminOrderFilter.status=this.value; rerenderAdminOrders();">
      <option value="all">All statuses</option>
      ${["pending","confirmed","preparing","ready","out_for_delivery","completed","cancelled"].map(s=>`<option value="${s}" ${f.status===s?"selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
    </select>
    <select onchange="adminOrderFilter.branch=this.value; rerenderAdminOrders();">
      <option value="all">All branches</option>
      ${DB.branches.map(b=>`<option value="${b.id}" ${f.branch===b.id?"selected":""}>${esc(b.name)}</option>`).join("")}
    </select>
    <select onchange="adminOrderFilter.type=this.value; rerenderAdminOrders();">
      <option value="all">All types</option><option value="delivery" ${f.type==='delivery'?'selected':''}>Delivery</option><option value="takeaway" ${f.type==='takeaway'?'selected':''}>Takeaway</option>
    </select>
  </div>
  <div id="admin-orders-table">${adminOrdersTable(orders, "admin")}</div>`;
}

function rerenderAdminOrders(){
  const f = adminOrderFilter;
  let orders = DB.orders.slice();
  if(f.status!=="all") orders = orders.filter(o=>o.status===f.status);
  if(f.branch!=="all") orders = orders.filter(o=>o.branchId===f.branch);
  if(f.type!=="all") orders = orders.filter(o=>o.type===f.type);
  if(f.q) orders = orders.filter(o=>(o.id+" "+o.customerName+" "+o.mobile).toLowerCase().includes(f.q.toLowerCase()));
  document.getElementById("admin-orders-table").innerHTML = adminOrdersTable(orders, "admin");
}

function onOrderStatusChanged(){ rerenderAdminOrders(); }

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","orders","Orders", renderAdminOrdersContent());
});
