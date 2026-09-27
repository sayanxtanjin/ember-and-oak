/* Admin > Categories: reorder, rename, enable/disable and delete menu
   categories. Deleting is blocked while a category still has dishes. */

function renderAdminCategoriesContent(){
  return `<div style="display:flex; justify-content:flex-end; margin-bottom:14px;"><button class="btn btn-primary" onclick="openCategoryEditor(null)">+ Add category</button></div>
  <div class="table-wrap"><table><thead><tr><th>Order</th><th>Name</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${DB.categories.sort((a,b)=>a.order-b.order).map(c=>`<tr>
      <td>${c.order}</td><td>${esc(c.name)}</td><td>${DB.menu.filter(f=>f.category===c.id).length}</td>
      <td>${c.enabled?'<span class="tag on">Enabled</span>':'<span class="tag off">Disabled</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="moveCategory('${c.id}',-1)">↑</button> <button class="btn btn-outline btn-sm" onclick="moveCategory('${c.id}',1)">↓</button>
          <button class="btn btn-outline btn-sm" onclick="openCategoryEditor('${c.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteCategory('${c.id}')">Delete</button></td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function moveCategory(id,dir){
  const cats = DB.categories.sort((a,b)=>a.order-b.order);
  const idx = cats.findIndex(c=>c.id===id);
  const swapIdx = idx+dir;
  if(swapIdx<0||swapIdx>=cats.length) return;
  const tmp = cats[idx].order; cats[idx].order = cats[swapIdx].order; cats[swapIdx].order=tmp;
  saveDB(); document.getElementById("dash-content").innerHTML = renderAdminCategoriesContent();
}

function openCategoryEditor(id){
  const c = id?DB.categories.find(x=>x.id===id):{name:"",enabled:true};
  showGenericModal(id?"Edit category":"Add category", `
    <div class="field"><label>Category name</label><input id="ce-name" value="${esc(c.name)}"></div>
    <label class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="ce-enabled" ${c.enabled?"checked":""}> Enabled (visible on menu)</label>
    <button class="btn btn-primary btn-block" onclick="saveCategoryEditor('${id||""}')">Save category</button>
  `);
}

function saveCategoryEditor(id){
  const name = document.getElementById("ce-name").value.trim();
  if(!name){ toast("Enter a category name","error"); return; }
  const enabled = document.getElementById("ce-enabled").checked;
  if(id){ const c=DB.categories.find(x=>x.id===id); c.name=name; c.enabled=enabled; toast("Category updated","success"); }
  else{ DB.categories.push({id:uid("cat"), name, enabled, order: DB.categories.length+1}); toast("Category added","success"); }
  saveDB(); closeModal(); document.getElementById("dash-content").innerHTML = renderAdminCategoriesContent();
}

function confirmDeleteCategory(id){
  if(DB.menu.some(f=>f.category===id)){ toast("Cannot delete — this category still has menu items","error"); return; }
  showConfirm("Delete this category?", ()=>{ DB.categories=DB.categories.filter(c=>c.id!==id); saveDB(); toast("Category deleted","success"); document.getElementById("dash-content").innerHTML = renderAdminCategoriesContent(); });
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","categories","Categories", renderAdminCategoriesContent());
});
