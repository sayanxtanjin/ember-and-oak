/* Order tracking page — reads the order id from ?id= in the URL, shows
   a visual status timeline and a printable receipt. */

function renderTrackingContent(orderId){
  const o = DB.orders.find(x=>x.id===orderId);
  if(!o) return notFoundContent();
  const user = currentUser();
  if(user && user.role==="customer" && o.customerId!==user.id) return notFoundContent();
  const b = DB.branches.find(x=>x.id===o.branchId);
  const flow = o.type==="delivery"?STATUS_FLOW_DELIVERY:STATUS_FLOW_TAKEAWAY;
  const curIdx = flow.indexOf(o.status);
  return `<section class="section-tight"><div class="container" style="max-width:760px;">
    <div class="sec-head"><h2>Order ${esc(o.id)}</h2><span class="status-pill st-${o.status.replace(/_/g,'')}">${STATUS_LABELS[o.status]}</span></div>
    ${o.status==="cancelled" ? `<div class="panel" style="border-color:var(--danger);"><p style="color:var(--danger); font-weight:600;">This order was cancelled.</p></div>` : `
    <div class="panel">
      <div class="timeline">
        ${flow.map((s,i)=>`<div class="tl-step ${i<curIdx?'done':i===curIdx?'current':''}"><div class="tl-dot">${i<curIdx?'✓':i+1}</div><div class="tl-label">${STATUS_LABELS[s]}</div></div>`).join("")}
      </div>
    </div>`}
    <div class="panel" style="margin-top:20px;">
      <div class="grid-2">
        <div><span class="small-muted">Branch</span><p style="font-weight:600;">${esc(b.name)}</p></div>
        <div><span class="small-muted">Order type</span><p style="font-weight:600;">${o.type==="delivery"?"Delivery":"Takeaway"}</p></div>
        <div><span class="small-muted">Placed</span><p style="font-weight:600;">${fmtDate(o.date)}</p></div>
        <div><span class="small-muted">Payment</span><p style="font-weight:600;">${esc(o.paymentMethod)}</p></div>
      </div>
      <hr class="rule">
      ${o.items.map(i=>`<div style="display:flex; justify-content:space-between; padding:6px 0; font-size:14px;"><span>${miniArt(i.art,20,i.image)}${esc(i.name)} ${[i.size,i.variant].filter(Boolean).length?`(${[i.size,i.variant].filter(Boolean).join(", ")})`:''} × ${i.qty}</span><span>${fmt(i.subtotal)}</span></div>`).join("")}
      <div class="summary-row"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
      <div class="summary-row"><span>Discount</span><span>${o.discount>0?"−":""}${fmt(o.discount)}</span></div>
      <div class="summary-row"><span>Delivery fee</span><span>${fmt(o.deliveryFee)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${fmt(o.total)}</span></div>
    </div>
    <div style="margin-top:18px; display:flex; gap:10px;"><a href="${paths().account}?tab=orders" class="btn btn-outline">Back to orders</a>
      <button class="btn btn-outline" onclick="printReceipt('${o.id}')">Print receipt</button></div>
  </div></section>`;
}

function printReceipt(orderId){
  const o = DB.orders.find(x=>x.id===orderId); const b=DB.branches.find(x=>x.id===o.branchId);
  const w = window.open("","_blank");
  w.document.write(`<html><head><title>Receipt ${o.id}</title><style>body{font-family:monospace;padding:24px;max-width:380px;} h2{text-align:center;} hr{border-top:1px dashed #999;} .row{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;} .tot{font-weight:700;border-top:1px solid #000;margin-top:6px;padding-top:6px;}</style></head><body>
  <h2>${esc(DB.config.name)}</h2><p style="text-align:center;">${esc(b.name)}</p><hr>
  <div class="row"><span>Order</span><span>${o.id}</span></div>
  <div class="row"><span>Customer</span><span>${esc(o.customerName)}</span></div>
  <div class="row"><span>Phone</span><span>${esc(o.mobile)}</span></div>
  <div class="row"><span>Type</span><span>${o.type}</span></div>
  <div class="row"><span>Date</span><span>${fmtDate(o.date)}</span></div>
  <hr>
  ${o.items.map(i=>`<div class="row"><span>${i.name} x${i.qty}</span><span>${fmt(i.subtotal)}</span></div>`).join("")}
  <hr>
  <div class="row"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
  <div class="row"><span>Discount</span><span>${fmt(o.discount)}</span></div>
  <div class="row"><span>Delivery</span><span>${fmt(o.deliveryFee)}</span></div>
  <div class="row tot"><span>Total</span><span>${fmt(o.total)}</span></div>
  <hr><p style="text-align:center;">Status: ${STATUS_LABELS[o.status]}</p>
  </body></html>`);
  w.document.close(); w.print();
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter(null);
  const qp = new URLSearchParams(location.search);
  const orderId = qp.get("id");
  document.getElementById("page-content").innerHTML = orderId ? renderTrackingContent(orderId) : notFoundContent();
});
