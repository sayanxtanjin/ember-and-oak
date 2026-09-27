/* Home page content — hero, featured dishes, categories, offers, popular
   items, a branch preview and reviews. */

function renderHomeContent(){
  const featured = DB.menu.filter(f=>f.featured);
  const popular = DB.menu.filter(f=>f.popular).slice(0,8);
  const activeBranches = DB.branches.filter(b=>b.active).slice(0,3);
  const totalOrders = DB.orders.length;
  return `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="eyebrow">Live-fire kitchen · 4 branches</div>
        <h1>${esc(DB.config.tagline)}</h1>
        <p class="lede">${esc(DB.config.description)}</p>
        <div class="hero-ctas">
          <a href="${paths().menu}" class="btn btn-gold">Order now</a>
          <a href="${paths().menu}" class="btn btn-outline" style="color:#fff;border-color:#584e40;">Explore menu</a>
        </div>
        <div class="stats-row">
          <div class="stat"><b>${DB.branches.length}</b><span>City branches</span></div>
          <div class="stat"><b>${DB.menu.length}+</b><span>Menu items</span></div>
          <div class="stat"><b>4.8</b><span>Average rating</span></div>
          <div class="stat"><b>${totalOrders}+</b><span>Orders served</span></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="dish-card">
          <div class="floating-tag">Chef's pick</div>
          <div class="dish-emoji">${foodVisual(featured[0]?.art||"pizza_margherita",150,featured[0]?.image)}</div>
          <h3>${esc(featured[0]?.name||"")}</h3>
          <p style="font-size:13.5px; margin-top:6px;">${esc(featured[0]?.desc||"")}</p>
          <div class="price-row">
            <span class="dish-price">${fmt(featured[0]?.price||0)}</span>
            <button class="btn btn-primary btn-sm" onclick="quickAdd('${featured[0]?.id}')">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="sec-head"><div><h2>This week's featured</h2><p>Signature dishes our chefs are proudest of right now.</p></div>
        <a href="${paths().menu}" class="btn btn-outline">View full menu</a></div>
      <div class="food-grid">${featured.map(foodCard).join("")}</div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="sec-head"><div><h2>Categories</h2><p>Everything on the hearth, organised the way you order.</p></div></div>
      <div class="chip-row" style="flex-wrap:wrap; overflow:visible;">
        ${DB.categories.filter(c=>c.enabled).sort((a,b)=>a.order-b.order).map(c=>`<a href="${paths().menu}?cat=${c.id}" class="chip">${esc(c.name)}</a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="sec-head"><div><h2>Current offers</h2><p>Limited-time deals, available at checkout.</p></div>
        <a href="${paths().offers}" class="btn btn-outline">See all offers</a></div>
      <div class="grid-3">${DB.offers.filter(o=>o.active).slice(0,3).map(offerCard).join("")}</div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="sec-head"><div><h2>Most popular</h2><p>What Dhaka and Chattogram are ordering the most.</p></div></div>
      <div class="food-grid">${popular.map(foodCard).join("")}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="sec-head"><div><h2>Find your nearest branch</h2><p>Four locations, all serving delivery and most with takeaway.</p></div>
        <a href="${paths().branches}" class="btn btn-outline">All branches</a></div>
      <div class="grid-3">${activeBranches.map(b=>branchCard(b)).join("")}</div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="sec-head"><div><h2>What guests are saying</h2></div></div>
      <div class="grid-3">${DB.reviews.slice(0,3).map(reviewCard).join("")}</div>
    </div>
  </section>

  <section class="section-tight">
    <div class="cta-band">
      <h2>Hungry already?</h2>
      <p>Pick a branch, choose delivery or takeaway, and your order will be on the fire in minutes.</p>
      <a href="${paths().menu}" class="btn btn-gold">Start your order</a>
    </div>
  </section>
  `;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("home");
  document.getElementById("page-content").innerHTML = renderHomeContent();
});
