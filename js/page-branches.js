/* Branches page — every branch with live open/closed status, and an
   optional "use my location" lookup that ranks branches by distance. */

function renderBranchesContent(){
  return `
  <section class="section-tight">
    <div class="container">
      <div class="sec-head"><div><h2>Our branches</h2><p>Pick a branch to see live status, delivery range and hours.</p></div>
        <button class="btn btn-outline" onclick="detectLocationGlobal()">📍 Use my location</button></div>
      <div id="branch-list" class="grid-3">${DB.branches.map(b=>branchDetailCard(b)).join("")}</div>
    </div>
  </section>`;
}

function chooseBranchAndOrder(branchId){ DB.selectedBranchId = branchId; saveDB(); location.href = paths().menu; toast("Branch selected — browse the menu to order","success"); }

function detectLocationGlobal(){
  if(!navigator.geolocation){ toast("Location is not supported in this browser","error"); return; }
  toast("Requesting your location…","info");
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude} = pos.coords;
    const ranked = DB.branches.filter(b=>b.active).map(b=>({...b, dist:haversineKm(latitude,longitude,b.lat,b.lng)})).sort((a,b)=>a.dist-b.dist);
    document.getElementById("branch-list").innerHTML = ranked.map(b=>branchDetailCard(b,b.dist)).join("");
    if(ranked[0]) toast(`Nearest branch: ${ranked[0].name} (${ranked[0].dist.toFixed(1)} km)`,"success");
  }, err=>{ toast("Location permission denied — choose a branch manually","error"); }, {timeout:8000});
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("branches");
  document.getElementById("page-content").innerHTML = renderBranchesContent();
});
