
let data,rank,completed=new Set(),titles=[];

async function load(){
 data=await fetch('data.json').then(r=>r.json());
 rank=Number(localStorage.getItem('rank'))||data.initialRank;
 completed=new Set(JSON.parse(localStorage.getItem('completed')||'[]'));
 render();
}

function apply(w){
 rank=Math.floor(rank*(1-w));
 localStorage.setItem('rank',rank);
}

function complete(n){
 const pass=document.getElementById('pass').value;
 if(pass!==data.secret)return alert('ACCESS DENIED');
 if(completed.has(n.id))return;
 completed.add(n.id);
 apply(n.weight);
 localStorage.setItem('completed',JSON.stringify([...completed]));
 log('NODE CLEARED: '+n.label);
 checkSynergy();
 render();
}

function checkSynergy(){
 data.synergies.forEach(s=>{
  if(!titles.includes(s.title)&&s.requires.every(r=>completed.has(r))){
   titles.push(s.title);
   apply(s.weight);
   log('SYNERGY UNLOCKED: '+s.title);
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
  const h=document.createElement('h3');
  h.textContent=p.name.toUpperCase();
  tree.appendChild(h);
  p.nodes.forEach(n=>{
   const d=document.createElement('div');
   d.className='node'+(completed.has(n.id)?' done':'');
   d.textContent=(completed.has(n.id)?'✓ ':'')+n.label;
   d.onclick=()=>complete(n);
   tree.appendChild(d);
  });
 });
}

load();
