/* Manager > Orders — the same order list admin sees, but scoped to this
   manager's own branch, with no branch/type filters since there's only
   ever one branch to look at here. */

const managerOrderFilter = {status:"all", q:""};

function applyManagerOrderFilter(){
  const f = managerOrderFilter;
  let orders = ordersForThisManager();
  if(f.status!=="all") orders = orders.filter(o=>o.status===f.status);
  if(f.q) orders = orders.filter(o=>(o.id+" "+o.customerName+" "+o.mobile).toLowerCase().includes(f.q.toLowerCase()));
  return orders;
}

function renderManagerOrdersContent(){
  const user = currentUser();
  if(user.role==="manager" && !user.branchId){
    return `<div class="panel"><p>You haven't been assigned to a branch yet. Ask an admin to assign you to one from Admin &gt; Customers.</p></div>`;
  }
  const f = managerOrderFilter;
  return `${user.role==="manager" ? `<p class="small-muted" style="margin-bottom:14px;">Showing orders for <b>${esc(branchName(user.branchId))}</b> only.</p>` : ""}
  <div class="filter-bar">
    <input placeholder="Search order ID, customer, phone…" value="${esc(f.q)}" oninput="managerOrderFilter.q=this.value; rerenderManagerOrders();">
    <select onchange="managerOrderFilter.status=this.value; rerenderManagerOrders();">
      <option value="all">All statuses</option>
      ${["pending","confirmed","preparing","ready","out_for_delivery","completed","cancelled"].map(s=>`<option value="${s}" ${f.status===s?"selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
    </select>
  </div>
  <div id="manager-orders-table">${adminOrdersTable(applyManagerOrderFilter(), "manager")}</div>`;
}

function rerenderManagerOrders(){
  document.getElementById("manager-orders-table").innerHTML = adminOrdersTable(applyManagerOrderFilter(), "manager");
}

function onOrderStatusChanged(){ rerenderManagerOrders(); }

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["manager","admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("manager","orders","Orders", renderManagerOrdersContent());
});
