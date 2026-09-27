/* Offers page — active coupon codes plus a faded list of past ones. */

function renderOffersContent(){
  const active = DB.offers.filter(o=>o.active && new Date(o.endDate)>=new Date());
  const expired = DB.offers.filter(o=>!(o.active && new Date(o.endDate)>=new Date()));
  return `<section class="section-tight"><div class="container">
    <div class="sec-head"><h2>Offers & coupons</h2></div>
    <div class="grid-3">${active.map(offerCard).join("") || `<p>No active offers right now — check back soon.</p>`}</div>
    ${expired.length?`<h3 style="margin:36px 0 16px; font-size:18px; color:var(--ink-soft);">Past offers</h3><div class="grid-3">${expired.map(o=>`<div class="branch-card" style="opacity:.6;"><h3>${esc(o.title)}</h3><p class="small-muted">${esc(o.desc)}</p><span class="tag off">Expired</span></div>`).join("")}</div>`:""}
  </div></section>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("offers");
  document.getElementById("page-content").innerHTML = renderOffersContent();
});
