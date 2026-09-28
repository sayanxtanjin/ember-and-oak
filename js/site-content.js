/* Shared visual edits used by the admin's page preview and every public page. */
(() => {
  const cleanPath=location.pathname.replace(/^\//,"")||"index.html";
  const page=cleanPath.startsWith("pages/")?cleanPath.slice(6):cleanPath;
  const edits=()=>DB?.config?.pageContent?.[page]||{};

  function selectorFor(element){
    if(element.id) return `#${CSS.escape(element.id)}`;
    const parts=[];
    while(element&&element.nodeType===1&&element!==document.documentElement){
      let part=element.tagName.toLowerCase();
      if(element.classList.length) part+="."+[...element.classList].slice(0,2).map(name=>CSS.escape(name)).join(".");
      const siblings=element.parentElement?[...element.parentElement.children].filter(item=>item.tagName===element.tagName):[];
      if(siblings.length>1) part+=`:nth-of-type(${siblings.indexOf(element)+1})`;
      parts.unshift(part);
      if(element.id){parts[0]="#"+CSS.escape(element.id);break;}
      element=element.parentElement;
    }
    return parts.join(" > ");
  }
  function validImage(value){return typeof value==="string"&&(value.startsWith("/uploads/")||value.startsWith("/api/images/")||/^https:\/\//i.test(value));}
  function apply(){
    for(const [selector,edit] of Object.entries(edits())){
      let element;try{element=document.querySelector(selector);}catch{continue;}
      if(!element||!edit) continue;
      if(typeof edit.text==="string"&&element.textContent!==edit.text) element.textContent=edit.text;
      if(validImage(edit.image)){
        if(element instanceof HTMLImageElement){if(element.getAttribute("src")!==edit.image) element.src=edit.image;}
        else if(element.dataset.eoContentImage!==edit.image){element.style.backgroundImage=`url("${edit.image.replace(/["\\]/g,"\\$&")}")`;element.style.backgroundSize="cover";element.style.backgroundPosition="center";element.dataset.eoContentImage=edit.image;}
      }
    }
    const logo=DB?.config?.logoImage;
    document.querySelectorAll(".brand .mark,.foot-brand .mark,.dash-brand .mark").forEach(mark=>{
      if(logo){if(mark.tagName!=="IMG"){const img=document.createElement("img");img.className="mark brand-logo-image";img.src=logo;img.alt=DB.config.name;mark.replaceWith(img);}}
      else if(mark.tagName==="IMG"&&mark.classList.contains("brand-logo-image")){const span=document.createElement("span");span.className="mark";span.textContent="🔥";mark.replaceWith(span);}
    });
  }
  window.applySiteContent=apply;
  addEventListener("message",event=>{
    if(event.origin!==location.origin||event.data?.type!=="eo-editor-preview"||event.data.page!==page)return;
    let element;try{element=document.querySelector(event.data.selector);}catch{return;}
    if(!element)return;
    if(typeof event.data.text==="string"&&!element.children.length)element.textContent=event.data.text;
    if(event.data.image){if(element instanceof HTMLImageElement)element.src=event.data.image;else{element.style.backgroundImage=`url("${event.data.image.replace(/["\\]/g,"\\$&")}")`;element.style.backgroundSize="cover";element.style.backgroundPosition="center";}}
  });
  function enableEditor(){
    if(!new URLSearchParams(location.search).has("eo-editor")) return;
    const style=document.createElement("style");style.textContent="[data-eo-editor-hover]{outline:2px solid #c49a5b!important;outline-offset:2px;cursor:crosshair!important}";document.head.append(style);
    document.addEventListener("mouseover",event=>{const target=event.target.closest("#header-mount *,#page-content *,#footer-mount *");document.querySelectorAll("[data-eo-editor-hover]").forEach(node=>node.removeAttribute("data-eo-editor-hover"));if(target)target.setAttribute("data-eo-editor-hover","");},true);
    document.addEventListener("click",event=>{
      const target=event.target.closest("#header-mount *,#page-content *,#footer-mount *");
      if(!target)return;
      event.preventDefault();event.stopPropagation();
      const image=target.closest("img");
      const type=image?"image":(!target.children.length?"text":"background");
      const element=image||target;
      const edit=edits()[selectorFor(element)]||{};
      const currentBackground=!image?getComputedStyle(element).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1]?.replace(/["']$/g,""):"";
      parent.postMessage({type:"eo-editor-selection",page,selector:selectorFor(element),kind:type,text:edit.text??(type==="text"?element.textContent.trim():""),image:edit.image||(image?image.getAttribute("src"):currentBackground)||"",tag:element.tagName.toLowerCase()},location.origin);
    },true);
    document.addEventListener("submit",event=>event.preventDefault(),true);
  }
  const observer=new MutationObserver(()=>apply());
  document.addEventListener("DOMContentLoaded",()=>{apply();observer.observe(document.body,{childList:true,subtree:true});enableEditor();});
})();
