const root=document.documentElement;
const themeToggle=document.getElementById("themeToggle");
const menuToggle=document.getElementById("menuToggle");
const navLinks=document.getElementById("navLinks");
const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try {
  const saved=localStorage.getItem("susmita-theme");
  if(saved==="light"||saved==="dark") root.setAttribute("data-theme",saved);
} catch(e) {}
function updateThemeButton(){
  const light=root.getAttribute("data-theme")==="light";
  themeToggle.textContent=light?"☾":"☼";
  themeToggle.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");
}
updateThemeButton();
const navItems=Array.from(navLinks.querySelectorAll('a[href^="#"]'))
  .map(link=>({link,section:document.querySelector(link.getAttribute("href"))}))
  .filter(item=>item.section);
function setActiveNavLink(sectionId){
  navItems.forEach(({link,section})=>{
    const active=section.id===sectionId;
    link.classList.toggle("active",active);
    if(active)link.setAttribute("aria-current","location");
    else link.removeAttribute("aria-current");
  });
}
themeToggle.addEventListener("click",()=>{
  const next=root.getAttribute("data-theme")==="light"?"dark":"light";
  root.setAttribute("data-theme",next);
  try{localStorage.setItem("susmita-theme",next)}catch(e){}
  updateThemeButton();
});
menuToggle.addEventListener("click",()=>{
  const open=navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
  menuToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
});
let activeNavFrame;
let navClickScrollTimer;
let navClickInProgress=false;
navLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  setActiveNavLink(link.getAttribute("href").slice(1));
  navClickInProgress=true;
  if(activeNavFrame)cancelAnimationFrame(activeNavFrame);
  clearTimeout(navClickScrollTimer);
  navClickScrollTimer=setTimeout(finishNavClickScroll,160);
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded","false");
  menuToggle.setAttribute("aria-label","Open navigation");
}));
function finishNavClickScroll(){
  navClickInProgress=false;
  updateActiveNavLink();
}
function updateActiveNavLink(){
  if(navClickInProgress){
    clearTimeout(navClickScrollTimer);
    navClickScrollTimer=setTimeout(finishNavClickScroll,160);
    return;
  }
  if(activeNavFrame)cancelAnimationFrame(activeNavFrame);
  activeNavFrame=requestAnimationFrame(()=>{
    const activeItem=navItems.filter(({section})=>{
      const bounds=section.getBoundingClientRect();
      const activeLine=window.innerHeight*.32;
      return bounds.top<=activeLine&&bounds.bottom>activeLine;
    }).pop();
    if(activeItem)setActiveNavLink(activeItem.section.id);
  });
}
window.addEventListener("scroll",updateActiveNavLink,{passive:true});
window.addEventListener("resize",updateActiveNavLink);
updateActiveNavLink();
document.getElementById("year").textContent=new Date().getFullYear();
if("IntersectionObserver" in window&&!prefersReduced){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
    });
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
}else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));
const glow=document.querySelector(".cursor-glow");
if(glow&&window.matchMedia("(pointer: fine)").matches){
  let frame;
  window.addEventListener("pointermove",e=>{
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      glow.style.left=e.clientX+"px";
      glow.style.top=e.clientY+"px";
    });
  },{passive:true});
}
