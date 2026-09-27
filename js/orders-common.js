/* Order rendering shared by every admin/manager page: the orders table,
   the order detail modal and the status-update action. Each page defines
   its own onOrderStatusChanged() so the right list redraws afterwards. */

function adminOrdersTable(orders, role){
  role = role || "admin";
  if(orders.length===0) return emptyState("🧾","No matching orders","Try adjusting your filters.");
  return `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Branch</th><th>Type</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>
    ${orders.map(o=>`<tr><td>${o.id}</td><td>${esc(o.customerName)}<br><span class="small-muted">${esc(o.mobile)}</span></td><td>${esc(branchName(o.branchId))}</td><td>${o.type}</td><td>${fmt(o.total)}</td>
      <td><span class="status-pill st-${o.status.replace(/_/g,'')}">${STATUS_LABELS[o.status]}</span></td><td>${fmtDate(o.date)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openOrderDetail('${o.id}','${role}')">View</button></td></tr>`).join("")}
  </tbody></table></div>`;
}

function openOrderDetail(orderId, role){
  const o = DB.orders.find(x=>x.id===orderId);
  const b = DB.branches.find(x=>x.id===o.branchId);
  const canEdit = role==="admin" || role==="manager";
  const nextStatuses = ["pending","confirmed","preparing", o.type==="delivery"?"out_for_delivery":"ready","completed","cancelled"];
  showGenericModal(`Order ${o.id}`, `
    <div class="grid-2">
      <div><span class="small-muted">Customer</span><p style="font-weight:600;">${esc(o.customerName)}</p></div>
      <div><span class="small-muted">Phone</span><p style="font-weight:600;">${esc(o.mobile)}</p></div>
      <div><span class="small-muted">Branch</span><p style="font-weight:600;">${esc(b.name)}</p></div>
      <div><span class="small-muted">Type</span><p style="font-weight:600;">${o.type}</p></div>
      <div><span class="small-muted">Address</span><p style="font-weight:600;">${esc(o.address)}</p></div>
      <div><span class="small-muted">Date</span><p style="font-weight:600;">${fmtDate(o.date)}</p></div>
    </div>
    <hr class="rule">
    ${o.items.map(i=>`<div style="display:flex; justify-content:space-between; font-size:13.5px; padding:5px 0;"><span>${miniArt(i.art,20,i.image)}${esc(i.name)} ${[i.size,i.variant].filter(Boolean).length?`(${[i.size,i.variant].filter(Boolean).join(", ")})`:''} × ${i.qty}</span><span>${fmt(i.subtotal)}</span></div>`).join("")}
    <div class="summary-row"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
    <div class="summary-row"><span>Discount</span><span>${fmt(o.discount)}</span></div>
    <div class="summary-row"><span>Delivery</span><span>${fmt(o.deliveryFee)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${fmt(o.total)}</span></div>
    ${canEdit ? `<div class="field" style="margin-top:16px;"><label>Update status</label>
      <select id="order-status-select">${nextStatuses.map(s=>`<option value="${s}" ${o.status===s?"selected":""}>${STATUS_LABELS[s]}</option>`).join("")}</select>
    </div>
    <button class="btn btn-primary btn-block" onclick="updateOrderStatus('${o.id}','${role}')">Update status</button>` : ""}
  `);
}

function ordersForThisManager(){
  const user = currentUser();
  if(user.role!=="manager") return DB.orders; // an admin browsing a manager page sees everything
  if(!user.branchId) return [];
  return DB.orders.filter(o=>o.branchId===user.branchId);
}

function updateOrderStatus(orderId, role){
  const sel = document.getElementById("order-status-select");
  const newStatus = sel.value;
  const o = DB.orders.find(x=>x.id===orderId);
  o.status = newStatus;
  saveDB();
  pushNotification(o.customerId, "Order update", `Your order ${o.id} is now ${STATUS_LABELS[newStatus]}.`);
  toast("Order status updated","success");
  closeModal();
  if(typeof onOrderStatusChanged==="function") onOrderStatusChanged();
}
