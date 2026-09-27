/* Site header and footer. Every page has an empty <div id="header-mount">
   and <div id="footer-mount"> — this file fills them in on load so the
   header/footer markup, the restaurant name, the cart badge and the
   logged-in state only live in one place instead of being copy-pasted
   into every HTML file. */

const NAV_LINKS = [
  ["home","Home"],
  ["menu","Menu"],
  ["branches","Branches"],
  ["offers","Offers"],
  ["about","About"],
  ["contact","Contact"]
];

function siteHeaderHtml(activeKey){
  const user = currentUser();
  const p = paths();
  const cartCount = DB.cart.reduce((s,i)=>s+i.qty,0);
  return `
  <header id="site-header">
    <div class="container hdr-inner">
      <a href="${p.home}" class="brand"><span class="mark">🔥</span> ${esc(DB.config.name)}</a>
      <nav><ul class="nav-links">
        ${NAV_LINKS.map(([key,label])=>`<a href="${p[key]}" class="${activeKey===key?'active':''}">${label}</a>`).join("")}
      </ul></nav>
      <div class="hdr-actions">
        <button class="icon-btn hide-desktop" onclick="toggleMobileMenu()" aria-label="Menu">☰</button>
        <a class="icon-btn rel" href="${p.cart}" aria-label="Cart">🛒 <span id="header-cart-badge">${cartCount>0?`<span class="cart-badge">${cartCount}</span>`:""}</span></a>
        ${themeToggleHtml()}
        ${user ? `<a class="icon-btn" href="${p.account}" aria-label="Account" title="${esc(user.name)}">👤</a>
                  <button class="btn btn-gold hide-mobile" onclick="logout()">Log out</button>`
               : `<a class="btn btn-gold hide-mobile" href="${p.login}">Log in</a>
                  <a class="btn btn-gold hide-mobile" href="${p.signup}">Sign up</a>`}
      </div>
    </div>
    <div class="container" id="mobile-menu-panel" style="padding-bottom:16px; display:none;">
      <div class="mobile-nav-panel">
        ${NAV_LINKS.map(([key,label])=>`<a href="${p[key]}">${label}</a>`).join("")}
        ${user? `<a href="${p.account}">My Account</a><button class="btn btn-gold" style="margin:6px 12px;" onclick="logout()">Log out</button>`
               : `<a href="${p.login}" class="btn btn-gold" style="margin:6px 12px;">Log in</a><a href="${p.signup}" class="btn btn-gold" style="margin:6px 12px;">Sign up</a>`}
      </div>
    </div>
  </header>`;
}

function toggleMobileMenu(){
  const panel = document.getElementById("mobile-menu-panel");
  if(!panel) return;
  panel.style.display = panel.style.display==="none" ? "block" : "none";
}

function siteFooterHtml(){
  const c = DB.config;
  const p = paths();
  return `
  <footer id="site-footer">
    <div class="container">
      <div class="foot-grid">
        <div>
          <div class="brand foot-brand">🔥 ${esc(c.name)}</div>
          <p style="margin-top:14px; max-width:280px; color:var(--ink-soft);">${esc(c.tagline)}</p>
          <div class="social-row">
            <a href="#" onclick="return false;" aria-label="Instagram"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg></a>
            <a href="#" onclick="return false;" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.5 21v-8h2.68l.4-3.11h-3.08V7.94c0-.9.25-1.51 1.54-1.51h1.64V3.65C15.9 3.55 15 3.5 13.94 3.5c-2.4 0-4.04 1.46-4.04 4.15v2.24H7.2V13h2.7v8h3.6z"/></svg></a>
            <a href="#" onclick="return false;" aria-label="Twitter / X"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.9 3H21.6l-5.87 6.71L22.7 21h-5.4l-4.23-5.53L8.22 21H5.5l6.28-7.18L4.3 3h5.53l3.82 5.05L18.9 3zm-.94 16.34h1.5L8.1 4.58H6.5l11.46 14.76z"/></svg></a>
          </div>
        </div>
        <div><h4>Explore</h4><ul>
          <li><a href="${p.menu}">Menu</a></li><li><a href="${p.branches}">Branches</a></li><li><a href="${p.offers}">Offers</a></li><li><a href="${p.about}">About</a></li>
        </ul></div>
        <div><h4>Account</h4><ul>
          <li><a href="${p.account}">My Account</a></li><li><a href="${p.account}?tab=orders">Order History</a></li><li><a href="${p.account}?tab=favorites">Favorites</a></li><li><a href="${p.cart}">Cart</a></li>
        </ul></div>
        <div><h4>Contact</h4><ul>
          <li>${esc(c.address)}</li><li>${esc(c.phone)}</li><li>${esc(c.email)}</li><li>${esc(c.hours)}</li>
        </ul></div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} ${esc(c.name)}. All rights reserved.</span>
        <span>Prototype build · data stored locally in your browser</span>
      </div>
    </div>
  </footer>`;
}

function updateHeaderCartBadge(){
  const el = document.getElementById("header-cart-badge");
  if(!el) return;
  const count = DB.cart.reduce((s,i)=>s+i.qty,0);
  el.innerHTML = count>0 ? `<span class="cart-badge">${count}</span>` : "";
}

/* Called once by every page after loadDB(). activeKey highlights the
   matching nav link; pass null on pages with no nav item (auth pages,
   dashboards). showFooter defaults to true. */
function mountHeaderFooter(activeKey, showFooter){
  const hm = document.getElementById("header-mount");
  if(hm) hm.innerHTML = siteHeaderHtml(activeKey);
  if(showFooter!==false){
    const fm = document.getElementById("footer-mount");
    if(fm) fm.innerHTML = siteFooterHtml();
  }
}
