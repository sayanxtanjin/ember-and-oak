/* Small interactive line/area chart engine used on the admin overview
   page. No dependency on a charting library — just SVG built from a
   category list and a value list, with a hover tooltip. */

const CHART_REGISTRY = {};

function niceMaxFor(raw){
  if(raw<=0) return 1;
  return Math.max(1, Math.ceil(raw*1.15));
}

function smoothPath(points){
  if(points.length===0) return "";
  if(points.length===1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for(let i=0;i<points.length-1;i++){
    const p0 = points[i-1] || points[i];
    const p1 = points[i];
    const p2 = points[i+1];
    const p3 = points[i+2] || p2;
    const cp1x = p1.x + (p2.x-p0.x)/6, cp1y = p1.y + (p2.y-p0.y)/6;
    const cp2x = p2.x - (p3.x-p1.x)/6, cp2y = p2.y - (p3.y-p1.y)/6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function buildLineChart(id, title, sub, categories, values, opts){
  opts = opts||{};
  const W=600, H=230, mL=34, mR=12, mT=10, mB=28;
  const plotW=W-mL-mR, plotH=H-mT-mB;
  const n = categories.length;
  const niceMax = niceMaxFor(Math.max(...values,0));
  const ticks = niceMax<=6 ? niceMax : 5;
  const pts = categories.map((c,i)=>({
    x: n>1 ? mL+(i*(plotW/(n-1))) : mL+plotW/2,
    y: mT+plotH-(values[i]/niceMax)*plotH,
    label:c, value:values[i]
  }));
  let grid = "";
  for(let t=0;t<=ticks;t++){
    const val = (niceMax/ticks)*t;
    const y = mT+plotH-(val/niceMax)*plotH;
    grid += `<line x1="${mL}" y1="${y.toFixed(1)}" x2="${W-mR}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1"/><text x="${mL-8}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--ink-soft)">${Math.round(val)}</text>`;
  }
  const linePath = smoothPath(pts);
  const areaPath = n>0 ? `${linePath} L ${pts[n-1].x.toFixed(1)} ${(mT+plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(mT+plotH).toFixed(1)} Z` : "";
  const gradId = "grad-"+id;
  const dots = pts.map((p,i)=>`<circle class="chart-dot" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--bronze)" stroke="#fff" stroke-width="2"/>`).join("");
  const xLabels = pts.map(p=>`<text x="${p.x.toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10.5" fill="var(--ink-soft)">${esc(String(p.label))}</text>`).join("");
  CHART_REGISTRY[id] = {pts, opts};
  return `<div class="chart-card">
    <div class="chart-head"><h3>${esc(title)}</h3>${sub?`<span class="sub">${esc(sub)}</span>`:""}</div>
    <div class="chart-svg-wrap" id="${id}-wrap">
      <svg id="${id}" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible;">
        <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--bronze-light)" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="var(--bronze-light)" stop-opacity="0"/>
        </linearGradient></defs>
        ${grid}
        <path d="${areaPath}" fill="url(#${gradId})" stroke="none"/>
        <path d="${linePath}" fill="none" stroke="var(--bronze)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
        <line id="${id}-guide" x1="0" y1="${mT}" x2="0" y2="${mT+plotH}" stroke="var(--bronze)" stroke-width="1" stroke-dasharray="3,3" opacity="0"/>
        <rect x="${mL}" y="${mT}" width="${plotW}" height="${plotH}" fill="transparent" id="${id}-hitbox"/>
        ${xLabels}
      </svg>
      <div class="chart-tooltip" id="${id}-tooltip"></div>
    </div>
  </div>`;
}

function wireChart(id){
  const entry = CHART_REGISTRY[id];
  const svg = document.getElementById(id);
  if(!entry || !svg) return;
  const {pts, opts} = entry;
  const guide = document.getElementById(id+"-guide");
  const tooltip = document.getElementById(id+"-tooltip");
  const W=600, H=230;
  function showAt(i){
    const p = pts[i]; if(!p) return;
    svg.querySelectorAll(".chart-dot").forEach(d=>d.setAttribute("r", d.dataset.i==i?"6":"4"));
    guide.setAttribute("x1",p.x); guide.setAttribute("x2",p.x); guide.setAttribute("opacity","1");
    tooltip.innerHTML = `<div class="tt-title">${esc(String(p.label))}</div><div class="tt-row"><span class="tt-dot"></span>${esc(opts.valueLabel||"Value")}: ${opts.formatter?opts.formatter(p.value):p.value}</div>`;
    tooltip.style.left = ((p.x/W)*100)+"%";
    tooltip.style.top = ((p.y/H)*100)+"%";
    tooltip.style.opacity = "1";
  }
  function hide(){
    svg.querySelectorAll(".chart-dot").forEach(d=>d.setAttribute("r","4"));
    guide.setAttribute("opacity","0");
    tooltip.style.opacity="0";
  }
  function onMove(e){
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = (clientX-rect.left)/rect.width*W;
    let nearest=0, best=Infinity;
    pts.forEach((p,i)=>{ const d=Math.abs(p.x-relX); if(d<best){ best=d; nearest=i; } });
    showAt(nearest);
  }
  svg.addEventListener("mousemove", onMove);
  svg.addEventListener("mouseleave", hide);
  svg.addEventListener("touchstart", onMove, {passive:true});
  svg.addEventListener("touchmove", onMove, {passive:true});
  if(pts.length) showAt(pts.length-1); else hide();
}

function wireAllCharts(){ Object.keys(CHART_REGISTRY).forEach(wireChart); }
