<?php ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Notepad 1.1</title>
<style>
html,body{margin:0;height:100%}
#workspace{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;height:100%;padding:8px;box-sizing:border-box}
.space{background:#ccc;position:relative;resize:both;overflow:hidden;min-width:150px;min-height:150px}
.space.focus{background:#fff}
.toolbar{display:flex;gap:4px;padding:4px;background:rgba(0,0,0,.05);user-select:none}
.toolbar button,.toolbar input{border:none;background:#eee;padding:2px 6px;border-radius:4px;font:14px monospace;cursor:pointer}
.toolbar input{flex:1;min-width:100px}
.editor{display:flex;height:calc(100% - 32px)}
.numsCol{width:40px;padding:4px 4px 0;text-align:right;overflow:hidden;font:12px monospace;background:#e0e0e0;white-space:pre;user-select:none}
.numsCol.hide{display:none}
textarea{flex:1;border:none;margin:0;padding:4px;font:14px monospace;line-height:1.4;resize:none;outline:none;white-space:pre-wrap;overflow:auto;background:transparent}
textarea.nowrap{white-space:pre}
textarea.lines{background-image:repeating-linear-gradient(to bottom,#f2f2f2 0,#f2f2f2 1px,transparent 1px,transparent 1.4em)}
#add{position:fixed;bottom:1rem;right:1rem;width:3rem;height:3rem;border:none;border-radius:50%;font-size:1.5rem;line-height:1.5rem;background:#111;color:#fafafa;cursor:pointer}
#add:disabled{display:none}
</style>
</head>
<body>
<div id="workspace"></div>
<button id="add">+</button>
<script>
const key='notes_v1_1';
const workspace=document.getElementById('workspace');
const addBtn=document.getElementById('add');
let dirty=false;
function updateAddBtn(){addBtn.disabled=workspace.children.length>=6}
function save(){if(!dirty)return;const data=[...workspace.children].map(s=>{const n=s.note;n.w=s.offsetWidth;n.h=s.offsetHeight;n.text=s.querySelector('textarea').value;return n});localStorage.setItem(key,JSON.stringify(data));dirty=false}
window.addEventListener('beforeunload',save);
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save()}});
function addListeners(space,textarea,numsCol,note){
textarea.addEventListener('input',()=>{dirty=true;updateNums(textarea,numsCol);});
textarea.addEventListener('focus',()=>space.classList.add('focus'));
textarea.addEventListener('blur',()=>space.classList.remove('focus'));
textarea.addEventListener('scroll',()=>numsCol.scrollTop=textarea.scrollTop);
space.addEventListener('mouseup',()=>{note.w=space.offsetWidth;note.h=space.offsetHeight;dirty=true});
}
function updateNums(textarea,numsCol){const lines=textarea.value.split('\n').length;let out='';for(let i=1;i<=lines;i++)out+=i+'\n';numsCol.textContent=out}
function createSpace(data){
if(workspace.children.length>=6)return;
const note=Object.assign({text:'',w:null,h:null,wrap:true,nums:false,lines:false,font:''},data||{});
const space=document.createElement('div');space.className='space';
if(note.w)space.style.width=note.w+'px';
if(note.h)space.style.height=note.h+'px';
const toolbar=document.createElement('div');toolbar.className='toolbar';
const closeBtn=document.createElement('button');closeBtn.textContent='×';
const wrapBtn=document.createElement('button');wrapBtn.textContent='↩';
const numBtn=document.createElement('button');numBtn.textContent='#';
const lineBtn=document.createElement('button');lineBtn.textContent='≡';
const fontInput=document.createElement('input');fontInput.placeholder='font';
toolbar.append(closeBtn,wrapBtn,numBtn,lineBtn,fontInput);
const editor=document.createElement('div');editor.className='editor';
const numsCol=document.createElement('div');numsCol.className='numsCol';
const textarea=document.createElement('textarea');textarea.value=note.text;
if(!note.wrap)textarea.classList.add('nowrap');
if(note.lines)textarea.classList.add('lines');
if(!note.nums)numsCol.classList.add('hide');
if(note.font)textarea.style.fontFamily=note.font;fontInput.value=note.font;
editor.append(numsCol,textarea);
space.append(toolbar,editor);
workspace.append(space);
space.note=note;
updateNums(textarea,numsCol);
addListeners(space,textarea,numsCol,note);
closeBtn.onclick=()=>{workspace.removeChild(space);dirty=true;updateAddBtn()};
wrapBtn.onclick=()=>{note.wrap=!note.wrap;textarea.classList.toggle('nowrap');dirty=true};
numBtn.onclick=()=>{note.nums=!note.nums;numsCol.classList.toggle('hide');dirty=true};
lineBtn.onclick=()=>{note.lines=!note.lines;textarea.classList.toggle('lines');dirty=true};
fontInput.onchange=()=>{note.font=fontInput.value.trim();textarea.style.fontFamily=note.font;dirty=true};
dirty=true;
updateAddBtn();
}
addBtn.onclick=()=>{createSpace()};
const stored=JSON.parse(localStorage.getItem(key)||'[]');
if(stored.length)stored.forEach(createSpace);else createSpace();
updateAddBtn();
</script>
</body>
</html>