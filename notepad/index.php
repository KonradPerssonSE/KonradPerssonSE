<?php ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Notepad 1.2</title>
<style>
html,body{margin:0;height:100%}
#workspace{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;height:100%;padding:8px;box-sizing:border-box;overflow-y:auto;scroll-snap-type:y mandatory;-webkit-overflow-scrolling:touch}
.space{background:#ccc;position:relative;resize:both;overflow:hidden;min-width:150px;min-height:150px;scroll-snap-align:start}
.space.focus{background:#fff}
.toolbar{display:flex;gap:4px;padding:4px;background:#f0f0f0;user-select:none;font:12px/1 monospace}
.toolbar input{width:70px}
textarea{border:none;resize:none;padding:8px;font:16px/1.4 monospace;width:100%;height:calc(100% - 24px);box-sizing:border-box;outline:none;background:transparent;color:#111;white-space:pre;overflow:auto}
button#add{position:fixed;bottom:1rem;right:1rem;width:4rem;height:4rem;border:none;border-radius:50%;font-size:2rem;line-height:2rem;background:#111;color:#fafafa;cursor:pointer}
button#add:disabled{display:none}

/* Mobile specific */
@media (pointer:coarse){
  #workspace{grid-template-columns:1fr;grid-auto-rows:minmax(80vh,auto)}
  textarea{font-size:18px}
}
</style>
</head>
<body>
<div id="workspace"></div>
<button id="add">+</button>
<script>
const key='notes';
const workspace=document.getElementById('workspace');
const addBtn=document.getElementById('add');
let dirty=false,debounce;
function save(){
  if(!dirty)return;
  const data=[...workspace.children].map(space=>{
    const note=space.querySelector('textarea');
    return{
      v:note.value,
      w:space.style.width,
      h:space.style.height,
      wrap:note.style.whiteSpace==='pre-wrap',
      nums:note.dataset.nums==='1',
      lines:note.dataset.lines==='1',
      font:note.style.fontFamily||''
    };
  });
  try{localStorage.setItem(key,JSON.stringify(data));}catch(e){}
  dirty=false;
}
function saveSoon(){
  dirty=true;
  clearTimeout(debounce);
  debounce=setTimeout(save,500);
}
function createNote(obj={}){
  const space=document.createElement('div');
  space.className='space';
  if(obj.w)space.style.width=obj.w;
  if(obj.h)space.style.height=obj.h;

  const bar=document.createElement('div');
  bar.className='toolbar';
  bar.innerHTML='\n    <button data-act="close">×</button>\n    <button data-act="wrap">↩</button>\n    <button data-act="nums">#</button>\n    <button data-act="lines">≡</button>\n    <input placeholder="font">';
  space.appendChild(bar);

  const note=document.createElement('textarea');
  note.value=obj.v||'';
  note.style.whiteSpace=obj.wrap?'pre-wrap':'pre';
  note.dataset.nums=obj.nums?'1':'0';
  note.dataset.lines=obj.lines?'1':'0';
  if(obj.font)note.style.fontFamily=obj.font;
  space.appendChild(note);

  function applyNums(){
    if(note.dataset.nums==='1'){
      note.style.counterReset='line';
      note.style.paddingLeft='2.5em';
      note.style.backgroundImage='linear-gradient(to right,#ddd 2.5em,transparent 2.5em)';
      note.style.backgroundClip='content-box';
      note.style.fontVariantNumeric='tabular-nums';
      note.style.fontFeatureSettings='"tnum"';
    }else{
      note.style.counterReset='';
      note.style.paddingLeft='8px';
      note.style.backgroundImage='';
    }
  }
  function applyLines(){
    if(note.dataset.lines==='1'){
      note.style.backgroundImage='repeating-linear-gradient(to bottom,transparent,transparent 1.4em,#eef 1.4em,#eef calc(1.4em + 1px))';
    }else if(note.dataset.nums!=='1'){
      note.style.backgroundImage='';
    }
  }
  applyNums();
  applyLines();

  note.addEventListener('input',saveSoon);
  note.addEventListener('focus',()=>space.classList.add('focus'));
  note.addEventListener('blur',()=>{space.classList.remove('focus');saveSoon();});

  bar.addEventListener('click',e=>{
    const act=e.target.dataset.act;
    if(!act)return;
    if(act==='close'){space.remove();saveSoon();layout();return;}
    if(act==='wrap'){note.style.whiteSpace=(note.style.whiteSpace==='pre'?'pre-wrap':'pre');saveSoon();}
    if(act==='nums'){note.dataset.nums=(note.dataset.nums==='1'?'0':'1');applyNums();applyLines();saveSoon();}
    if(act==='lines'){note.dataset.lines=(note.dataset.lines==='1'?'0':'1');applyLines();saveSoon();}
  });
  bar.querySelector('input').addEventListener('keydown',e=>{
    if(e.key==='Enter'){note.style.fontFamily=e.target.value;saveSoon();e.target.blur();}
  });

  workspace.appendChild(space);
  layout();
}
function layout(){
  const n=workspace.children.length;
  const cols=Math.min(n,3)||1;
  workspace.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  addBtn.disabled=n>=6;
}
function load(){
  let data=[];
  try{data=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}
  if(data.length)data.forEach(createNote);else createNote();
}
addBtn.onclick=()=>{createNote();saveSoon();};
window.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();}
});
window.addEventListener('pagehide',save);
window.addEventListener('resize',saveSoon);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
load();
</script>
</body>
</html>