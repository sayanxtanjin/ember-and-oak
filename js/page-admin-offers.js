/* Admin > Promotions: coupon codes with percentage/fixed discounts,
   minimum order, expiry and a usage limit. */

function renderAdminOffersContent(){
  return `<div style="display:flex; justify-content:flex-end; margin-bottom:14px;"><button class="btn btn-primary" onclick="openOfferEditor(null)">+ Add offer</button></div>
  <div class="table-wrap"><table><thead><tr><th>Title</th><th>Code</th><th>Value</th><th>Min order</th><th>Ends</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${DB.offers.map(o=>`<tr>
      <td>${esc(o.title)}</td><td>${esc(o.code)}</td><td>${o.type==="percentage"?o.value+"%":fmt(o.value)}</td><td>${fmt(o.minOrder)}</td>
      <td>${new Date(o.endDate).toLocaleDateString()}</td><td>${o.used||0}/${o.usageLimit}</td>
      <td>${o.active && new Date(o.endDate)>=new Date() ?'<span class="tag on">Active</span>':'<span class="tag off">Inactive</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openOfferEditor('${o.id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="confirmDeleteOffer('${o.id}')">Delete</button></td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function openOfferEditor(id){
  const o = id?DB.offers.find(x=>x.id===id):{title:"",desc:"",type:"percentage",value:10,minOrder:0,code:"",startDate:new Date().toISOString(),endDate:daysAhead(30),active:true,usageLimit:100,used:0};
  showGenericModal(id?"Edit offer":"Add offer", `
    <div class="field"><label>Title</label><input id="oe-title" value="${esc(o.title)}"></div>
    <div class="field"><label>Description</label><input id="oe-desc" value="${esc(o.desc)}"></div>
    <div class="grid-2">
      <div class="field"><label>Type</label><select id="oe-type"><option value="percentage" ${o.type==="percentage"?"selected":""}>Percentage</option><option value="fixed" ${o.type==="fixed"?"selected":""}>Fixed amount</option></select></div>
      <div class="field"><label>Value</label><input id="oe-value" type="number" value="${o.value}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Minimum order</label><input id="oe-min" type="number" value="${o.minOrder}"></div>
      <div class="field"><label>Coupon code</label><input id="oe-code" value="${esc(o.code)}"></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>End date</label><input id="oe-end" type="date" value="${new Date(o.endDate).toISOString().slice(0,10)}"></div>
      <div class="field"><label>Usage limit</label><input id="oe-limit" type="number" value="${o.usageLimit}"></div>
    </div>
    <label class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="oe-active" ${o.active?"checked":""}> Active</label>
    <button class="btn btn-primary btn-block" onclick="saveOfferEditor('${id||""}')">Save offer</button>
  `);
}

function saveOfferEditor(id){
  const title = document.getElementById("oe-title").value.trim();
  const code = document.getElementById("oe-code").value.trim().toUpperCase();
  if(!title||!code){ toast("Title and coupon code are required","error"); return; }
  const data = {
    title, desc:document.getElementById("oe-desc").value.trim(), type:document.getElementById("oe-type").value,
    value:parseFloat(document.getElementById("oe-value").value)||0, minOrder:parseFloat(document.getElementById("oe-min").value)||0,
    code, endDate:new Date(document.getElementById("oe-end").value).toISOString(), usageLimit:parseInt(document.getElementById("oe-limit").value)||100,
    active:document.getElementById("oe-active").checked
  };
  if(id){ Object.assign(DB.offers.find(o=>o.id===id), data); toast("Offer updated","success"); }
  else{ DB.offers.push({id:uid("off"), startDate:new Date().toISOString(), used:0, ...data}); toast("Offer created","success"); }
  saveDB(); closeModal(); document.getElementById("dash-content").innerHTML=renderAdminOffersContent();
}

function confirmDeleteOffer(id){ showConfirm("Delete this offer?", ()=>{ DB.offers=DB.offers.filter(o=>o.id!==id); saveDB(); toast("Offer deleted","success"); document.getElementById("dash-content").innerHTML=renderAdminOffersContent(); }); }

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","offers","Promotions", renderAdminOffersContent());
});
