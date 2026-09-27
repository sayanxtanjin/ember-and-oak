/* Admin > Branches: add/edit/deactivate branches, set hours, delivery
   fee and coordinates used for the nearest-branch lookup. */

function renderAdminBranchesContent(){
  return `<div style="display:flex; justify-content:flex-end; margin-bottom:14px;"><button class="btn btn-primary" onclick="openBranchEditor(null)">+ Add branch</button></div>
  <div class="grid-3">${DB.branches.map(b=>`
    <div class="branch-card">
      <div style="display:flex; justify-content:space-between;"><h3 style="font-size:16px;">${esc(b.name)}</h3><span class="tag ${b.active?'on':'off'}">${b.active?'Active':'Inactive'}</span></div>
      <p class="small-muted">${esc(b.address)}</p>
      <p class="small-muted">${b.openTime} – ${b.closeTime} · Fee ${fmt(b.deliveryFee)}</p>
      <p class="small-muted">Manager: ${(() => { const m = DB.users.find(u=>u.role==="manager" && u.branchId===b.id); return m ? esc(m.name) : "Unassigned"; })()}</p>
      <div class="branch-tags"><span class="tag ${b.delivery?'on':'off'}">Delivery</span><span class="tag ${b.takeaway?'on':'off'}">Takeaway</span></div>
      <div style="display:flex; gap:8px; margin-top:10px;">
        <button class="btn btn-outline btn-sm" onclick="openBranchEditor('${b.id}')">Edit</button>
        <button class="btn btn-outline btn-sm" onclick="toggleBranchActive('${b.id}')">${b.active?'Deactivate':'Activate'}</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteBranch('${b.id}')">Delete</button>
      </div>
    </div>`).join("")}</div>`;
}

function toggleBranchActive(id){ const b=DB.branches.find(x=>x.id===id); b.active=!b.active; saveDB(); toast(`Branch ${b.active?'activated':'deactivated'}`,"success"); document.getElementById("dash-content").innerHTML=renderAdminBranchesContent(); }

function openBranchEditor(id){
  const b = id?DB.branches.find(x=>x.id===id):{name:"",address:"",phone:"",email:"",lat:23.78,lng:90.4,openTime:"11:00",closeTime:"23:00",delivery:true,takeaway:true,active:true,deliveryFee:80,deliveryRadiusKm:8};
  showGenericModal(id?"Edit branch":"Add branch", `
    <div class="grid-2">
      <div class="field"><label>Branch name</label><input id="be-name" value="${esc(b.name)}"></div>
      <div class="field"><label>Phone</label><input id="be-phone" value="${esc(b.phone)}"></div>
    </div>
    <div class="field"><label>Address</label><input id="be-address" value="${esc(b.address)}"></div>
    <div class="grid-2">
      <div class="field"><label>Latitude</label><input id="be-lat" type="number" step="0.0001" value="${b.lat}"></div>
      <div class="field"><label>Longitude</label><input id="be-lng" type="number" step="0.0001" value="${b.lng}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Opening time</label><input id="be-open" type="time" value="${b.openTime}"></div>
      <div class="field"><label>Closing time</label><input id="be-close" type="time" value="${b.closeTime}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Delivery fee (${DB.config.currency})</label><input id="be-fee" type="number" value="${b.deliveryFee}"></div>
      <div class="field"><label>Delivery radius (km)</label><input id="be-radius" type="number" value="${b.deliveryRadiusKm}"></div>
    </div>
    <div style="display:flex; gap:16px; margin-bottom:18px;">
      <label class="checkbox-row"><input type="checkbox" id="be-delivery" ${b.delivery?"checked":""}> Delivery enabled</label>
      <label class="checkbox-row"><input type="checkbox" id="be-takeaway" ${b.takeaway?"checked":""}> Takeaway enabled</label>
      <label class="checkbox-row"><input type="checkbox" id="be-active" ${b.active?"checked":""}> Active</label>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveBranchEditor('${id||""}')">Save branch</button>
  `);
}

function saveBranchEditor(id){
  const name = document.getElementById("be-name").value.trim();
  if(!name){ toast("Enter a branch name","error"); return; }
  const data = {
    name, phone:document.getElementById("be-phone").value.trim(), address:document.getElementById("be-address").value.trim(),
    lat:parseFloat(document.getElementById("be-lat").value)||0, lng:parseFloat(document.getElementById("be-lng").value)||0,
    openTime:document.getElementById("be-open").value, closeTime:document.getElementById("be-close").value,
    deliveryFee:parseFloat(document.getElementById("be-fee").value)||0, deliveryRadiusKm:parseFloat(document.getElementById("be-radius").value)||5,
    delivery:document.getElementById("be-delivery").checked, takeaway:document.getElementById("be-takeaway").checked, active:document.getElementById("be-active").checked
  };
  if(id){ Object.assign(DB.branches.find(b=>b.id===id), data); toast("Branch updated","success"); }
  else{ DB.branches.push({id:uid("br"), email:"", ...data}); toast("Branch added","success"); }
  saveDB(); closeModal(); document.getElementById("dash-content").innerHTML=renderAdminBranchesContent();
}

function confirmDeleteBranch(id){
  if(DB.orders.some(o=>o.branchId===id)){ toast("Cannot delete — this branch has order history","error"); return; }
  showConfirm("Delete this branch?", ()=>{ DB.branches=DB.branches.filter(b=>b.id!==id); saveDB(); toast("Branch deleted","success"); document.getElementById("dash-content").innerHTML=renderAdminBranchesContent(); });
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","branches","Branches", renderAdminBranchesContent());
});
