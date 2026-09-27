/* Admin > Reviews: moderate customer reviews left on dishes. */

function renderAdminReviewsContent(){
  return `<div class="table-wrap"><table><thead><tr><th>Customer</th><th>Item</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr></thead><tbody>
    ${DB.reviews.map(r=>`<tr><td>${esc(r.customerName)}</td><td>${esc((DB.menu.find(f=>f.id===r.foodId)||{}).name||"—")}</td><td>${starString(r.rating)}</td><td style="max-width:280px;">${esc(r.comment)}</td><td>${fmtDate(r.date)}</td>
    <td><button class="btn btn-danger btn-sm" onclick="confirmDeleteReview('${r.id}')">Remove</button></td></tr>`).join("") || `<tr><td colspan="6">No reviews yet.</td></tr>`}
  </tbody></table></div>`;
}

function confirmDeleteReview(id){ showConfirm("Remove this review?", ()=>{ DB.reviews=DB.reviews.filter(r=>r.id!==id); saveDB(); toast("Review removed","success"); document.getElementById("dash-content").innerHTML=renderAdminReviewsContent(); }); }

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","reviews","Reviews", renderAdminReviewsContent());
});
