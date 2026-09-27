/* Contact page — a simple message form (kept local to this prototype,
   no email is actually sent) plus head office and branch details. */

function renderContactContent(){
  return `<section class="section-tight"><div class="container">
    <div class="sec-head"><h2>Get in touch</h2></div>
    <div class="grid-2">
      <div class="panel">
        <div class="field"><label>Full name <span class="req">*</span></label><input id="cf-name" placeholder="Your name"></div>
        <div class="field"><label>Email <span class="req">*</span></label><input id="cf-email" type="email" placeholder="you@example.com"></div>
        <div class="field"><label>Message <span class="req">*</span></label><textarea id="cf-msg" rows="5" placeholder="How can we help?"></textarea></div>
        <button class="btn btn-primary" onclick="submitContact()">Send message</button>
      </div>
      <div class="panel">
        <h3 style="font-size:17px; margin-bottom:14px;">Head office</h3>
        <p>${esc(DB.config.address)}</p>
        <p style="margin-top:8px;">${esc(DB.config.phone)}</p>
        <p style="margin-top:8px;">${esc(DB.config.email)}</p>
        <p style="margin-top:8px;">${esc(DB.config.hours)}</p>
        <hr class="rule">
        <h3 style="font-size:17px; margin-bottom:10px;">All branches</h3>
        ${DB.branches.map(b=>`<p class="small-muted" style="margin-bottom:6px;">${esc(b.name)} — ${esc(b.address)}</p>`).join("")}
      </div>
    </div>
  </div></section>`;
}

function submitContact(){
  const name=document.getElementById("cf-name").value.trim();
  const email=document.getElementById("cf-email").value.trim();
  const msg=document.getElementById("cf-msg").value.trim();
  if(!name||!email||!msg){ toast("Please fill in all required fields","error"); return; }
  toast("Message sent — we'll get back to you shortly","success");
  document.getElementById("cf-name").value=""; document.getElementById("cf-email").value=""; document.getElementById("cf-msg").value="";
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("contact");
  document.getElementById("page-content").innerHTML = renderContactContent();
});
