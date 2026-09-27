/* Order confirmation page shown right after checkout — reads the new
   order's id from ?order= in the URL. */

function renderConfirmationContent(orderId){
  const o = DB.orders.find(x=>x.id===orderId);
  if(!o) return notFoundContent();
  const b = DB.branches.find(x=>x.id===o.branchId);
  return `<div class="center-page">
    <div class="confirm-check">✓</div>
    <h2>Order placed!</h2>
    <p style="margin-top:10px;">Your order <b>${esc(o.id)}</b> has been sent to <b>${esc(b.name)}</b>.</p>
    <p class="small-muted" style="margin-top:6px;">Estimated ${o.type==="delivery"?"delivery":"pickup"} time: 30–45 minutes.</p>
    <div style="margin-top:26px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
      <a href="${paths().order}?id=${o.id}" class="btn btn-primary">Track order</a>
      <a href="${paths().menu}" class="btn btn-outline">Order more</a>
    </div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter(null);
  const qp = new URLSearchParams(location.search);
  const orderId = qp.get("order");
  document.getElementById("page-content").innerHTML = orderId ? renderConfirmationContent(orderId) : notFoundContent();
});
