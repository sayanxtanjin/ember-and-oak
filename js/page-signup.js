/* Signup page. */

function renderSignupContent(){
  return `<div class="auth-wrap"><div class="panel">
    <div class="auth-head"><h2>Create your account</h2><p style="margin-top:6px;">Join to track orders and save favorites.</p></div>
    <div id="signup-err"></div>
    <div class="field"><label>Full name <span class="req">*</span></label><input id="su-name" placeholder="Your full name"></div>
    <div class="field"><label>Mobile number <span class="req">*</span></label><input id="su-mobile" placeholder="01XXXXXXXXX"></div>
    <div class="field"><label>Email <span class="req">*</span></label><input id="su-email" type="email" placeholder="you@example.com"></div>
    <div class="field"><label>Address</label><input id="su-address" placeholder="Delivery address"></div>
    <div class="field"><label>Password <span class="req">*</span></label>
      <div class="pw-wrap"><input id="su-pw" type="password" placeholder="Minimum 6 characters" oninput="pwStrength(this.value)"><button type="button" onclick="togglePw('su-pw',this)">Show</button></div>
      <span class="hint" id="pw-strength-hint">Use 6+ characters</span>
    </div>
    <div class="field"><label>Confirm password <span class="req">*</span></label><input id="su-pw2" type="password" placeholder="Repeat password"></div>
    <button class="btn btn-primary btn-block" onclick="submitSignup()">Create account</button>
    <p class="auth-switch">Already have an account? <a href="${paths().login}" style="color:var(--wine); font-weight:600;">Log in</a></p>
  </div></div>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter(null, false);
  document.getElementById("page-content").innerHTML = renderSignupContent();
});
