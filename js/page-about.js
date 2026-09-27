/* About page — mostly static copy, with the restaurant description
   itself pulled from DB.config so it stays editable from Admin Settings. */

function renderAboutContent(){
  return `<section class="section-tight"><div class="container" style="max-width:820px;">
    <div class="eyebrow">Our story</div>
    <h2 style="font-size:clamp(26px,4vw,40px); margin-bottom:18px;">Cooking the way restaurants used to</h2>
    <p style="font-size:16px; margin-bottom:16px;">${esc(DB.config.description)}</p>
    <p style="margin-bottom:16px;">Every branch runs its own wood-fired hearth and rotisserie. We buy whole animals and produce daily from local farms, break everything down by hand, and cook to order — nothing sits under a heat lamp.</p>
    <div class="grid-3" style="margin-top:36px;">
      <div class="panel"><h3 style="font-size:17px;">Our philosophy</h3><p style="margin-top:8px;">Fewer ingredients, better sourcing, real fire. If it can't be grilled, roasted or smoked, it's probably not on the menu.</p></div>
      <div class="panel"><h3 style="font-size:17px;">Quality standard</h3><p style="margin-top:8px;">No frozen proteins, no pre-made sauces. Every kitchen is audited weekly against the same recipe book.</p></div>
      <div class="panel"><h3 style="font-size:17px;">Our team</h3><p style="margin-top:8px;">Led by chefs trained across live-fire kitchens in Dhaka, Bangkok and Rome, brought home to build something local.</p></div>
    </div>
  </div></section>`;
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  mountHeaderFooter("about");
  document.getElementById("page-content").innerHTML = renderAboutContent();
});
