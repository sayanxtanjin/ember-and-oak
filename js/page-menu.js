/* Menu page — search, category filter, sort and the "available only"
   toggle. A ?cat= query string (set by the category chips on the home
   page) pre-selects a category on load. */

const menuFilter = {category:"all", search:"", sort:"popular", availableOnly:false};

function filteredMenuItems(){
  const f = menuFilter;
  let items = DB.menu.slice();
  if(f.category!=="all") items = items.filter(i=>i.category===f.category);
  if(f.search) items = items.filter(i=> (i.name+" "+i.desc+" "+catName(i.category)).toLowerCase().includes(f.search.toLowerCase()));
  if(f.availableOnly) items = items.filter(i=>i.available);
  switch(f.sort){
    case "price-asc": items.sort((a,b)=>a.price-b.price); break;
    case "price-desc": items.sort((a,b)=>b.price-a.price); break;
    case "rating": items.sort((a,b)=>b.rating-a.rating); break;
    case "featured": items.sort((a,b)=>(b.featured-a.featured)); break;
    default: items.sort((a,b)=>(b.popular-a.popular) || (b.rating-a.rating));
  }
  return items;
}

function renderMenuContent(){
  const f = menuFilter;
  return `
  <section class="section-tight">
    <div class="container">
      <div class="sec-head"><div><h2>Full menu</h2><p>Search, filter and build your order.</p></div></div>
      <div class="filter-bar" style="align-items:center;">
        <input type="search" placeholder="Search dishes, ingredients, categories…" value="${esc(f.search)}" oninput="menuFilter.search=this.value; rerenderMenuList();" style="flex:1; min-width:220px;">
        <select onchange="menuFilter.sort=this.value; rerenderMenuList();">
          <option value="popular" ${f.sort==="popular"?"selected":""}>Sort: Popular</option>
          <option value="rating" ${f.sort==="rating"?"selected":""}>Sort: Top rated</option>
          <option value="price-asc" ${f.sort==="price-asc"?"selected":""}>Sort: Price low–high</option>
          <option value="price-desc" ${f.sort==="price-desc"?"selected":""}>Sort: Price high–low</option>
          <option value="featured" ${f.sort==="featured"?"selected":""}>Sort: Featured first</option>
        </select>
        <label class="checkbox-row"><input type="checkbox" ${f.availableOnly?"checked":""} onchange="menuFilter.availableOnly=this.checked; rerenderMenuList();"> Available only</label>
      </div>
      <div class="chip-row" style="margin:18px 0 8px;">
        <button class="chip ${f.category==='all'?'active':''}" onclick="menuFilter.category='all'; rerenderMenuList();">All</button>
        ${DB.categories.filter(c=>c.enabled).sort((a,b)=>a.order-b.order).map(c=>`<button class="chip ${f.category===c.id?'active':''}" onclick="menuFilter.category='${c.id}'; rerenderMenuList();">${esc(c.name)}</button>`).join("")}
      </div>
      <div id="menu-list">${renderMenuList(filteredMenuItems())}</div>
    </div>
  </section>`;
}

function renderMenuList(items){
  if(items.length===0){
    return emptyState("🍽️","No dishes match your filters","Try a different search term or clear your filters.",
      `<button class="btn btn-outline" onclick="menuFilter.category='all'; menuFilter.search=''; menuFilter.sort='popular'; menuFilter.availableOnly=false; rerenderMenuList();">Clear filters</button>`);
  }
  return `<div class="food-grid">${items.map(foodCard).join("")}</div>`;
}

function rerenderMenuList(){
  document.getElementById("page-content").innerHTML = renderMenuContent();
}

function onFavoritesChanged(){
  document.getElementById("menu-list").innerHTML = renderMenuList(filteredMenuItems());
}

document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  const qp = new URLSearchParams(location.search);
  if(qp.get("cat")) menuFilter.category = qp.get("cat");
  mountHeaderFooter("menu");
  document.getElementById("page-content").innerHTML = renderMenuContent();
});
