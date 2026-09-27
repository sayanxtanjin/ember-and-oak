/* Login page. */

function renderLoginContent(){
  return `<div class="auth-wrap"><div class="panel">
    <div class="auth-head"><h2>Welcome back</h2><p style="margin-top:6px;">Log in to continue your order.</p></div>
    <div id="login-err"></div>
    <div class="field"><label>Email</label><input id="li-email" type="email" placeholder="you@example.com"></div>
    <div class="field"><label>Password</label>
      <div class="pw-wrap"><input id="li-pw" type="password" placeholder="••••••••"><button type="button" onclick="togglePw('li-pw',this)">Show</button></div>
    </div>
    <button class="btn btn-primary btn-block" onclick="submitLogin()">Log in</button>
    <p class="auth-switch">Don't have an account? <a href="${paths().signup}" style="color:var(--wine); font-weight:600;">Sign up</a></p>
    <div class="demo-box"><b>Demo accounts</b><br>Admin: admin@emberandoak.com — use the password configured for this site.<br>Manager: manager@emberandoak.com / manager123<br>Customer: customer@example.com / customer123</div>
  </div></div>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter(null, false);
  document.getElementById("page-content").innerHTML = renderLoginContent();
});
