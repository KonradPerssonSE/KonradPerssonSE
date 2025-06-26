<?php ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Notepad</title>
<style>
html,body{margin:0;height:100%}
#workspace{display:grid;height:100vh;width:100vw}
textarea{border:none;resize:none;padding:1rem;font:16px/1.4 monospace;width:100%;height:100%;box-sizing:border-box;outline:none;background:#fafafa;color:#111;white-space:pre;overflow:auto}
button#add{position:fixed;bottom:1rem;right:1rem;width:3rem;height:3rem;border:none;border-radius:50%;font-size:1.5rem;line-height:1.5rem;background:#111;color:#fafafa;cursor:pointer}
button#add:disabled{display:none}
</style>
</head>
<body>
<div id="workspace"></div>
<button id="add">+</button>
<script>
const key='notes';
const workspace=document.getElementById('workspace');
const addBtn=document.getElementById('add');
let dirty=false;
function layout(){
const n=workspace.children.length;
const cols=Math.min(n,3)||1;
const rows=Math.ceil(n/3)||1;
workspace.style.gridTemplateColumns=`repeat(${cols},1fr)`;
workspace.style.gridTemplateRows=`repeat(${rows},1fr)`;
addBtn.disabled=n>=6;
}
function createNote(txt=''){
const t=document.createElement('textarea');
t.value=txt;
t.addEventListener('input',()=>dirty=true);
workspace.appendChild(t);
layout();
}
function save(){
if(!dirty)return;
const data=[...workspace.children].map(e=>e.value);
localStorage.setItem(key,JSON.stringify(data));
dirty=false;
}
function load(){
const data=JSON.parse(localStorage.getItem(key)||'[]');
if(data.length){data.forEach(createNote);}else createNote();
}
addBtn.onclick=()=>{createNote();dirty=true;};
window.addEventListener('beforeunload',save);
window.addEventListener('keydown',e=>{
if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();}
});
load();
</script>
</body>
</html>
