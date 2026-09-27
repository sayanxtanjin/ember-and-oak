/* Admin > Customers: every non-admin account. Admin can create a new
   account here (it starts out as a Customer), and can promote it to
   Manager and assign it to a branch — one manager per branch. */

function renderAdminCustomersContent(){
  const accounts = DB.users.filter(u=>u.role!=="admin");
  return `
  <div style="display:flex; justify-content:flex-end; margin-bottom:14px;">
    <button class="btn btn-primary" onclick="openAccountEditor(null)">+ Add account</button>
  </div>
  <div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Orders</th><th>Spent</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${accounts.map(a=>{
      const orders = DB.orders.filter(o=>o.customerId===a.id);
      const spent = orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0);
      const roleLabel = a.role==="manager"
        ? `Manager <span class="small-muted">— ${esc(branchName(a.branchId))}</span>`
        : "Customer";
      return `<tr><td>${esc(a.name)}</td><td>${esc(a.email)}</td><td>${esc(a.mobile)}</td><td>${roleLabel}</td><td>${orders.length}</td><td>${fmt(spent)}</td>
      <td>${a.status==="active"?'<span class="tag on">Active</span>':'<span class="tag off">Disabled</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="viewCustomerDetail('${a.id}')">View</button>
          <button class="btn btn-outline btn-sm" onclick="openAccountEditor('${a.id}')">Edit</button>
          <button class="btn btn-outline btn-sm" onclick="toggleCustomerStatus('${a.id}')">${a.status==="active"?"Disable":"Enable"}</button></td></tr>`;
    }).join("")}
  </tbody></table></div>`;
}

function viewCustomerDetail(id){
  const c = DB.users.find(u=>u.id===id);
  const orders = DB.orders.filter(o=>o.customerId===id);
  showGenericModal(esc(c.name), `
    <p class="small-muted">${esc(c.email)} · ${esc(c.mobile)}</p>
    <p class="small-muted">${esc(c.address||"No address on file")}</p>
    <p class="small-muted">Member since ${fmtDate(c.createdAt)}</p>
    ${c.role==="manager" ? `<p class="small-muted">Manages <b>${esc(branchName(c.branchId))}</b></p>` : ""}
    <hr class="rule">
    <h4 style="margin-bottom:8px;">Order history (${orders.length})</h4>
    ${orders.length? orders.map(o=>`<div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; border-bottom:1px solid var(--line);"><span>${o.id} · ${fmtDate(o.date)}</span><span>${fmt(o.total)}</span></div>`).join("") : `<p class="small-muted">No orders yet.</p>`}
  `);
}

function toggleCustomerStatus(id){
  const c = DB.users.find(u=>u.id===id);
  c.status = c.status==="active" ? "disabled" : "active";
  saveDB(); toast(`Account ${c.status==="active"?"enabled":"disabled"}`,"success"); document.getElementById("dash-content").innerHTML=renderAdminCustomersContent();
}

function openAccountEditor(id){
  const a = id ? DB.users.find(u=>u.id===id) : {name:"",email:"",mobile:"",address:"",role:"customer",branchId:null};
  showGenericModal(id ? "Edit account" : "Add account", `
    <div class="grid-2">
      <div class="field"><label>Full name</label><input id="ae-name" value="${esc(a.name)}"></div>
      <div class="field"><label>Mobile number</label><input id="ae-mobile" value="${esc(a.mobile)}"></div>
    </div>
    <div class="field"><label>Email</label><input id="ae-email" type="email" value="${esc(a.email)}" ${id?"disabled":""}></div>
    ${id ? `<span class="hint">Email can't be changed once an account is created.</span>` : ""}
    <div class="field"><label>Address</label><input id="ae-address" value="${esc(a.address||"")}"></div>
    ${id ? "" : `<div class="field"><label>Password</label><input id="ae-password" type="password" placeholder="Minimum 6 characters"></div>`}
    <div class="field"><label>Role</label><select id="ae-role" onchange="toggleAccountBranchField()">
      <option value="customer" ${a.role==="customer"?"selected":""}>Customer</option>
      <option value="manager" ${a.role==="manager"?"selected":""}>Manager</option>
    </select></div>
    <div class="field" id="ae-branch-field" style="${a.role==="manager"?"":"display:none;"}">
      <label>Branch this account manages</label>
      <select id="ae-branch">
        <option value="">Select a branch…</option>
        ${DB.branches.map(b=>{
          const currentManager = DB.users.find(u=>u.role==="manager" && u.branchId===b.id && u.id!==id);
          const taken = currentManager ? ` (already managed by ${currentManager.name})` : "";
          return `<option value="${b.id}" ${a.branchId===b.id?"selected":""}>${esc(b.name)}${esc(taken)}</option>`;
        }).join("")}
      </select>
      <span class="hint">Each branch can only have one manager.</span>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:8px;" onclick="saveAccountEditor('${id||""}')">Save account</button>
  `);
}

function toggleAccountBranchField(){
  const field = document.getElementById("ae-branch-field");
  field.style.display = document.getElementById("ae-role").value==="manager" ? "" : "none";
}

function saveAccountEditor(id){
  const name = document.getElementById("ae-name").value.trim();
  const mobile = document.getElementById("ae-mobile").value.trim();
  const address = document.getElementById("ae-address").value.trim();
  const role = document.getElementById("ae-role").value;
  const branchId = role==="manager" ? (document.getElementById("ae-branch").value || null) : null;

  if(!name || !mobile){ toast("Name and mobile number are required","error"); return; }
  if(role==="manager" && !branchId){ toast("Pick a branch for this manager","error"); return; }
  if(role==="manager"){
    const clash = DB.users.find(u=>u.role==="manager" && u.branchId===branchId && u.id!==id);
    if(clash){ toast(`${clash.name} already manages this branch`,"error"); return; }
  }

  if(id){
    const account = DB.users.find(u=>u.id===id);
    account.name = name; account.mobile = mobile; account.address = address;
    account.role = role; account.branchId = branchId;
    saveDB();
    toast("Account updated","success");
  } else {
    const email = document.getElementById("ae-email").value.trim().toLowerCase();
    const password = document.getElementById("ae-password").value;
    if(!email || !/^\S+@\S+\.\S+$/.test(email)){ toast("Enter a valid email address","error"); return; }
    if(!password || password.length<6){ toast("Password must be at least 6 characters","error"); return; }
    if(DB.users.some(u=>u.email.toLowerCase()===email)){ toast("An account with this email already exists","error"); return; }
    DB.users.push({
      id: uid("u"), name, email, mobile, address,
      password: hashPW(password), role, branchId, status:"active", createdAt: new Date().toISOString()
    });
    saveDB();
    toast("Account created","success");
  }
  closeModal();
  document.getElementById("dash-content").innerHTML = renderAdminCustomersContent();
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const user = requireRole(["admin"]);
  if(!user) return;
  document.getElementById("app-root").innerHTML = renderDashboardShell("admin","customers","Customers", renderAdminCustomersContent());
});
