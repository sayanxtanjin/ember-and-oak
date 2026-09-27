/* Login, signup and logout. Role-based redirects after login/signup use
   paths() (see paths.js) so they work the same from any page. */

function togglePw(id,btn){ const el=document.getElementById(id); if(el.type==="password"){el.type="text"; btn.textContent="Hide";} else {el.type="password"; btn.textContent="Show";} }

function pwStrength(v){
  const hint = document.getElementById("pw-strength-hint");
  if(v.length===0){ hint.textContent="Use 6+ characters"; hint.style.color=""; return; }
  const strong = v.length>=8 && /[0-9]/.test(v) && /[A-Za-z]/.test(v);
  hint.textContent = v.length<6 ? "Too short" : strong ? "Strong password" : "Could be stronger — add numbers";
  hint.style.color = v.length<6 ? "var(--danger)" : strong ? "var(--success)" : "var(--ink-soft)";
}

async function submitLogin(){
  const email = document.getElementById("li-email").value.trim().toLowerCase();
  const pw = document.getElementById("li-pw").value;
  const errBox = document.getElementById("login-err");
  const user = DB.users.find(u=>u.email.toLowerCase()===email);
  if(!user || (user.role!=="admin" && !verifyPW(pw,user.password))){ errBox.innerHTML = `<div class="field has-err"><span class="err">Incorrect email or password.</span></div>`; return; }
  if(user.status==="disabled"){ errBox.innerHTML = `<div class="field has-err"><span class="err">This account has been disabled. Contact support.</span></div>`; return; }
  if(user.role==="admin"){
    try{
      const response = await fetch("/api/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pw})});
      const result = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error||"Admin sign-in failed.");
    }catch(error){
      errBox.innerHTML = `<div class="field has-err"><span class="err">${esc(error.message||"The website server is unavailable. Start it with npm start and try again.")}</span></div>`;
      return;
    }
  }
  DB.currentUserId = user.id; saveDB();
  toast(`Welcome back, ${user.name.split(" ")[0]}`,"success");
  if(user.role==="admin") location.href = paths().adminDashboard;
  else if(user.role==="manager") location.href = paths().managerDashboard;
  else location.href = paths().account;
}

function submitSignup(){
  const name=document.getElementById("su-name").value.trim();
  const mobile=document.getElementById("su-mobile").value.trim();
  const email=document.getElementById("su-email").value.trim().toLowerCase();
  const address=document.getElementById("su-address").value.trim();
  const pw=document.getElementById("su-pw").value;
  const pw2=document.getElementById("su-pw2").value;
  const errBox=document.getElementById("signup-err");
  if(!name||!mobile||!email||!pw||!pw2){ errBox.innerHTML=`<div class="field has-err"><span class="err">Please fill in all required fields.</span></div>`; return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ errBox.innerHTML=`<div class="field has-err"><span class="err">Enter a valid email address.</span></div>`; return; }
  if(pw.length<6){ errBox.innerHTML=`<div class="field has-err"><span class="err">Password must be at least 6 characters.</span></div>`; return; }
  if(pw!==pw2){ errBox.innerHTML=`<div class="field has-err"><span class="err">Passwords do not match.</span></div>`; return; }
  if(DB.users.some(u=>u.email.toLowerCase()===email)){ errBox.innerHTML=`<div class="field has-err"><span class="err">An account with this email already exists.</span></div>`; return; }
  const user = {id:uid("u"), name, email, mobile, address, password:hashPW(pw), role:"customer", branchId:null, status:"active", createdAt:new Date().toISOString()};
  DB.users.push(user); DB.currentUserId=user.id; saveDB();
  toast("Account created — welcome!","success");
  location.href = paths().account;
}

function logout(){
  fetch("/api/session",{method:"DELETE",keepalive:true}).catch(()=>{});
  DB.currentUserId=null; saveDB(); toast("You have been logged out","info"); location.href = paths().home;
}
