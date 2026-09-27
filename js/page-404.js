/* Fallback page for any broken or missing link. */

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter(null);
  document.getElementById("page-content").innerHTML = notFoundContent();
});
