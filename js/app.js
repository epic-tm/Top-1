
async function loadAdvancements(){
  const res = await fetch('data/advancements.json');
  const json = await res.json();
  const list = document.getElementById('adv-list');
  const state = JSON.parse(localStorage.getItem('lifeState')||'{"unlocked":[],"xp":0,"level":1,"powerups":{}}');
  const xpPerLevel = 10000;

  function save(){ localStorage.setItem('lifeState', JSON.stringify(state)); }

  function gainXP(amount){
    // apply powerup multipliers per domain
    let final = amount;
    if (window.applyPowerupMultiplier){
      final = window.applyPowerupMultiplier(amount, currentDomain);
    }
    state.xp += final;
    while(state.xp >= xpPerLevel){
      state.xp -= xpPerLevel; state.level++;
    }
    document.getElementById('levelNum').textContent = state.level;
    document.getElementById('xpFill').style.width = Math.min(100, (state.xp / xpPerLevel * 100)) + '%';
    save();
  }

  function showToast(text){ const t = document.getElementById('toast'); t.innerText = text; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }

  // helper to create framed card with 9 tiles
  function makeFrameContent(adv, unlocked){
    const wrapper = document.createElement('div');
    wrapper.className = 'adv-frame' + (unlocked? '':' locked');
    // 9 tile divs
    const tiles = ['adv-tl','adv-tm','adv-tr','adv-ml','adv-mm','adv-mr','adv-bl','adv-bm','adv-br'];
    tiles.forEach(cls => { const d = document.createElement('div'); d.className = cls; wrapper.appendChild(d); });
    // content overlay
    const content = document.createElement('div');
    content.className = 'adv-content';
    content.innerHTML = `<strong>${adv.title}</strong><div style="font-size:12px">${adv.domain || ''} • Rank ${adv.rank || ''}</div><div style="font-size:11px;margin-top:6px">${adv.description}</div>`;
    wrapper.appendChild(content);
    return wrapper;
  }

  // store currentDomain for XP multiplier context
  window.applyPowerupMultiplier = (amount, domain) => {
    let mul = 1.0;
    const pu = state.powerups || {};
    for(const k in pu){
      const p = pu[k];
      if(p.domain === domain){
        mul *= (1 + (p.xpMultiplierPercent||0)/100);
      }
    }
    return Math.round(amount * mul);
  };

  json.advancements.forEach(adv => {
    const unlocked = state.unlocked.includes(adv.id);
    const card = document.createElement('div');
    card.style.width = '160px';
    card.style.height = '64px';
    const frame = makeFrameContent(adv, unlocked);
    card.appendChild(frame);

    card.onclick = () => {
      if(state.unlocked.includes(adv.id)) return;
      if(adv.parent && !state.unlocked.includes(adv.parent)){
        alert('Prerequisite not met: ' + adv.parent);
        return;
      }
      // unlock logic
      state.unlocked.push(adv.id);
      // if it's a powerup, register it
      if(adv.powerup){
        state.powerups = state.powerups || {};
        state.powerups[adv.id] = {domain: adv.domain, xpMultiplierPercent: adv.powerup.xpMultiplierPercent};
      }
      gainXP(adv.xp || 0);
      showToast('Advancement: ' + adv.title);
      save();
      // visual update
      frame.classList.remove('locked');
    };

    list.appendChild(card);
  });

  // initialize hud
  document.getElementById('levelNum').textContent = state.level;
  document.getElementById('xpFill').style.width = Math.min(100, (state.xp / xpPerLevel * 100)) + '%';
}

loadAdvancements();
