
let data, rank, completed=new Set(), titles=[];

async function load(){
 data=await fetch('data.json').then(r=>r.json());
 rank=Number(localStorage.getItem('rank'))||data.initialRank;
 completed=new Set(JSON.parse(localStorage.getItem('completed')||'[]'));
 render();
}

function applyWeight(w){
 rank=Math.floor(rank*(1-w));
 localStorage.setItem('rank',rank);
}

function complete(node){
 const pass=document.getElementById('pass').value;
 if(pass!==data.secret) return alert('ACCESS DENIED');
 if(completed.has(node.id)) return;
 completed.add(node.id);
 applyWeight(node.weight);
 localStorage.setItem('completed',JSON.stringify([...completed]));
 log(`NODE CLEARED: ${node.label}`);
 checkSynergy();
 render();
}

function checkSynergy(){
 data.synergies.forEach(s=>{
  if(!titles.includes(s.title)&&s.requires.every(r=>completed.has(r))){
   applyWeight(s.weight);
   titles.push(s.title);
   log(`SYNERGY UNLOCKED: ${s.title}`);
  }
 });
}

function log(t){
 const d=document.createElement('div');
 d.className='log';
 d.textContent=t;
 document.getElementById('log').prepend(d);
}

function render(){
 document.getElementById('rank').textContent=rank.toLocaleString();
 const tree=document.getElementById('tree');
 tree.innerHTML='';
 data.pillars.forEach(p=>{
  const h=document.createElement('h3');h.textContent=p.name;tree.appendChild(h);
  p.nodes.forEach(n=>{
   const d=document.createElement('div');
   d.className='node';
   d.textContent=(completed.has(n.id)?'✓ ':'')+n.label;
   d.onclick=()=>complete(n);
   tree.appendChild(d);
  });
 });
}

load();
