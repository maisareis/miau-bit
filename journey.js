'use strict';

const CORE_IDS = ['scratch', 'python', 'sql', 'safety', 'mochila', 'correio', 'boatos', 'amizade', 'amigo'];
const PHASE_COUNTS = {scratch: 6, python: 3, sql: 3, correio: 3, permissoes: 3, redes: 3, padroes: 3};
const PHASE_KEY = 'miau-bit-phases-v1';
const PARTY_KEY = 'miau-bit-journey-party-v2';
const bonusAdventures = [
  {id:'senhas', tag:'SEGURANÇA DIGITAL · SENHAS', title:'A senha do quintal', description:'Palavras inesperadas ajudam Luma a cuidar dos segredos da turma.', time:'5 min', medal:'Inventor de segredos', symbol:'♧', filter:'proteger', category:'SEGURANÇA DIGITAL', bonus:true},
  {id:'fotos', tag:'SEGURANÇA DIGITAL · FOTOS', title:'Antes do clique', description:'Uma foto pode contar mais do que parece. Vamos olhar com carinho?', time:'5 min', medal:'Guardião das imagens', symbol:'▧', filter:'proteger', category:'SEGURANÇA DIGITAL', bonus:true},
  {id:'receita', tag:'LÓGICA · ORDEM DOS PASSOS', title:'O sanduíche do Bit', description:'O recheio ficou de fora! Organize os passos dessa receita de faz de conta.', time:'3 min', medal:'Mestre das sequências', symbol:'☷', filter:'logica', category:'LÓGICA', bonus:true},
  ...expansionAdventures
];
let phaseProgress = {};
let partySeen = 0;
let legacyGuardian = false;
try {
  const saved = JSON.parse(localStorage.getItem(PHASE_KEY) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) phaseProgress = saved;
  const legacy = Number(localStorage.getItem('miau-bit-journey-party-v1')) || 0;
  legacyGuardian = legacy >= 2;
  partySeen = Number(localStorage.getItem(PARTY_KEY)) || (legacy ? 1 : 0);
} catch (_) {}

function phaseCount(id) { return PHASE_COUNTS[id] || 1; }
function completedPhases(id) {
  const saved = Number(phaseProgress[id]);
  const valid = Number.isInteger(saved) ? Math.max(0, Math.min(phaseCount(id), saved)) : 0;
  return Math.max(discovered.has(id) ? 1 : 0, valid);
}
function requestedPhase(id) {
  const parts = location.hash.slice(1).split('/');
  const value = parts[1] === id ? Number(parts[2] || 1) : 1;
  return Number.isInteger(value) && value >= 1 && value <= phaseCount(id) ? value : 1;
}
function phaseURL(id, phase) { return '#aventura/' + id + (phase > 1 ? '/' + phase : ''); }
function coreStars() { return CORE_IDS.filter(id => discovered.has(id)).length; }
function bonusUnlocked() { return coreStars() === CORE_IDS.length; }
function collectedStars() { return adventures.filter(a => discovered.has(a.id)).length; }
function expansionUnlocked() { return bonusUnlocked() && ['senhas','fotos','receita'].every(id => discovered.has(id)); }
function adventureUnlocked(a) { return !a.bonus || (a.unlockStars === 12 ? expansionUnlocked() : bonusUnlocked()); }
function nextStarMilestone() { return !bonusUnlocked() ? 9 : !expansionUnlocked() ? 12 : 15; }
function nextStarAdventure() { return adventures.find(a => adventureUnlocked(a) && !discovered.has(a.id)); }
function celebrationStage() { return journeyFullyComplete() ? 4 : collectedStars() === 15 ? 3 : expansionUnlocked() ? 2 : bonusUnlocked() ? 1 : 0; }
function journeyFullyComplete() { return adventures.every(a => completedPhases(a.id) === phaseCount(a.id)); }
function rememberPhase(id) {
  const before = completedPhases(id);
  const phase = requestedPhase(id);
  phaseProgress[id] = Math.max(before, phase);
  try { localStorage.setItem(PHASE_KEY, JSON.stringify(phaseProgress)); } catch (_) {}
  return phase > before;
}
function phaseDots(a) {
  if (phaseCount(a.id) === 1) return '';
  return '<span class="phase-dots" aria-label="' + completedPhases(a.id) + ' de ' + phaseCount(a.id) + ' fases descobertas">' +
    Array.from({length:phaseCount(a.id)}, (_, i) => '<span class="' + (i < completedPhases(a.id) ? 'done' : '') + '" aria-hidden="true">✦</span>').join('') + '</span>';
}
function phaseNavigation(a) {
  if (phaseCount(a.id) === 1) return '';
  const current = requestedPhase(a.id);
  return '<nav class="phase-navigation" aria-label="Fases desta aventura"><div><b>Uma aventura, novos desafios</b><span>Fase ' + current + ' de ' + phaseCount(a.id) + '</span></div><ol>' +
    Array.from({length:phaseCount(a.id)}, (_, i) => {
      const n = i + 1, available = n <= completedPhases(a.id) + 1;
      const label = (n <= completedPhases(a.id) ? '✦ ' : '') + 'Fase ' + n;
      return '<li>' + (available
        ? '<a href="' + phaseURL(a.id,n) + '" class="' + (n === current ? 'current' : '') + '" ' + (n === current ? 'aria-current="step"' : '') + '>' + label + '</a>'
        : '<span class="phase-locked" aria-label="Fase ' + n + ', abre depois da fase anterior">♧ ' + label + '</span>') + '</li>';
    }).join('') + '</ol></nav>';
}
function phaseNextLinks() {
  const id = location.hash.slice(1).split('/')[1];
  const phase = requestedPhase(id);
  const next = phase < phaseCount(id) && completedPhases(id) >= phase;
  return '<div class="success-next">' +
    (next ? '<a class="button primary small" href="' + phaseURL(id,phase+1) + '">Próxima fase →</a>' : '<a class="button primary small" href="#aventuras">Outra aventura ↗</a>') +
    '<a class="button secondary small" href="#conquistas">Minhas descobertas ✦</a></div>';
}
function journeyCard(a) {
  const locked = !adventureUnlocked(a);
  const threshold = a.unlockStars || 9;
  const done = completedPhases(a.id);
  const next = Math.min(phaseCount(a.id), done + 1);
  const href = locked ? '#novidades' : phaseURL(a.id, done === phaseCount(a.id) ? 1 : next);
  const art = a.bonus ? bonusCardArt(a.id) : cardArt(a.id);
  const category = a.category || (a.id === 'safety' ? 'SEGURANÇA DIGITAL' : a.id.toUpperCase());
  return '<a class="adventure-card ' + (locked ? 'locked-card' : '') + '" href="' + href + '" aria-label="' +
    (locked ? a.title + ': abre com ' + threshold + ' estrelas' : 'Jogar ' + a.title) + '">' +
    (locked ? '<span class="complete-mark bonus-label">♧ Novo cantinho</span>' : discovered.has(a.id) ? '<span class="complete-mark">✦ Estrela conquistada</span>' : '') +
    '<div class="adventure-illustration ' + a.id + '">' + art + '</div><div class="card-content"><div class="card-label"><span>' + category + '</span><span>◷ ' + a.time + '</span></div><h3>' + a.title + '</h3><p>' + a.description + '</p>' +
    (phaseCount(a.id) > 1 ? '<div class="card-phases">' + phaseDots(a) + '<small>' + done + ' de ' + phaseCount(a.id) + ' fases</small></div>' : '') +
    '<div class="card-cta">' + (locked ? 'Abre com ' + threshold + ' estrelas' : done > 0 && done < phaseCount(a.id) ? 'Continuar na fase ' + next : discovered.has(a.id) ? 'Brincar de novo' : 'Vamos brincar') + ' <span aria-hidden="true">↗</span></div></div></a>';
}
function bonusCardArt(id) {
  const drawings = {
    senhas:'<path d="M94 70V48a31 31 0 0 1 62 0v22" fill="none" stroke="#397d70" stroke-width="12"/><rect x="70" y="65" width="110" height="81" rx="23" fill="#397d70"/><circle cx="125" cy="99" r="11" fill="#ffe5a1"/><path d="M125 107v15" stroke="#ffe5a1" stroke-width="8" stroke-linecap="round"/><path d="M42 42v17M34 50h17M207 103v17M199 111h17" stroke="#e99b61" stroke-width="4"/>',
    fotos:'<rect x="40" y="31" width="171" height="112" rx="16" fill="#fff6db" stroke="#8e79ac" stroke-width="5"/><circle cx="88" cy="65" r="15" fill="#f1c75c"/><path d="M51 129l48-45 33 28 24-25 43 42" fill="#9ab6a0"/><circle cx="171" cy="96" r="31" fill="#e4eff080" stroke="#397d70" stroke-width="7"/><path d="M192 120l22 23" stroke="#397d70" stroke-width="10" stroke-linecap="round"/>',
    receita:'<path d="M55 65q6-48 70-48t70 48z" fill="#e6b86e" stroke="#ad7c45" stroke-width="3"/><path d="M52 84q25-18 48 0t49 0 49 0" fill="none" stroke="#8cad70" stroke-width="15" stroke-linecap="round"/><path d="M56 104h138" stroke="#e99c63" stroke-width="15" stroke-linecap="round"/><path d="M54 124h142v10q-67 28-142 0z" fill="#e6b86e" stroke="#ad7c45" stroke-width="3"/><path d="M90 42l3-5M122 36l3-5M153 43l3-5" stroke="#fff1c7" stroke-width="4" stroke-linecap="round"/>'
  };
  if (!drawings[id]) return expansionCardArt(id);
  return '<svg class="art-svg" viewBox="0 0 250 160" aria-hidden="true">' + drawings[id] + '</svg>';
}
function journeyBanner() {
  const n = collectedStars(), target = nextStarMilestone(), next = nextStarAdventure();
  const full = journeyFullyComplete(), allStars = n === 15;
  const heading = full ? 'O quintal inteiro brilhou!' : allStars ? 'Quinze estrelas. Uma turma inteira!' : n >= 12 ? 'Uma nova rota está aberta!' : n >= 9 ? 'As surpresas da Luma estão abertas!' : 'Cada estrela abre uma possibilidade.';
  const detail = full ? 'Você descobriu todas as fases! A turma adora brincar de novo com você.' : allStars ? 'Sua coleção de estrelas está completa. Ainda dá para explorar novas fases!' : n + ' de 15 estrelas. Faltam ' + (target-n) + ' para ' + (target === 15 ? 'a medalha das quinze estrelas.' : 'abrir três novas brincadeiras!');
  return '<section class="journey-banner"><div class="journey-banner-icon" aria-hidden="true">✦</div><div><span class="eyebrow">SEU MAPA CONTINUA CRESCENDO</span><h2>' + heading + '</h2><p>' + detail + '</p></div><a class="button primary" href="' + (next ? phaseURL(next.id,1) : '#conquistas') + '">' + (next ? 'Minha próxima estrela ↗' : 'Ver minhas conquistas ✦') + '</a></section>';
}
function bonusPreview() {
  return [9,12].map(threshold => {
    const available = threshold === 9 ? bonusUnlocked() : expansionUnlocked();
    const title = threshold === 9 ? 'As surpresas da Luma' : 'Uma nova rota no quintal';
    return '<section class="adventure-section bonus-preview"><div class="section-heading"><div><span class="eyebrow">' + threshold + ' ESTRELAS ABREM ESTE CANTINHO</span><h2>' + title + '</h2><p>' + (available ? 'Cantinho aberto! Escolha sua próxima descoberta.' : 'Mais três jogos esperam por você. Continue encontrando estrelas!') + '</p></div><a class="text-link" href="#novidades">Ver meu caminho ↗</a></div><div class="adventure-grid bonus-grid">' + bonusAdventures.filter(a => (a.unlockStars || 9) === threshold).map(journeyCard).join('') + '</div></section>';
  }).join('');
}
function decorateJourneyHome() {
  const heroCopy = main.querySelector('.hero-copy');
  if (heroCopy) heroCopy.insertAdjacentHTML('beforeend','<aside class="install-promo" data-install-section><div class="install-promo-heading"><img src="assets/icons/miau-bit-192-v2.png" width="48" height="48" alt=""><div><b>Leve o quintal com você!</b><p>Instale para brincar pela tela inicial.</p></div></div><button class="button yellow" type="button" data-install-app>Instalar Miau &amp; Bit <span aria-hidden="true">↗</span></button><p class="install-promo-help" id="home-install-help" tabindex="-1" hidden></p></aside>');
  const strip = main.querySelector('.welcome-strip');
  if (strip) strip.insertAdjacentHTML('afterend', journeyBanner());
  const teaser = main.querySelector('.story-teaser');
  if (teaser) teaser.insertAdjacentHTML('beforebegin', bonusPreview());
}
function renderAdventureCatalogue() {
  const filters = [['todas','Todas as aventuras'],['logica','Criar caminhos'],['criar','Acender ideias'],['descobrir','Procurar pistas'],['proteger','Cuidar da turma'],['novas','O novo cantinho']];
  main.innerHTML = '<section class="page-heading"><span class="eyebrow">PORTAS ABERTAS PARA A IMAGINAÇÃO</span><h1>Uma história para cada “e se…”</h1><p>Quinze jogos, novos caminhos e muitas fases. Escolha sua próxima descoberta!</p><div class="filter-bar" aria-label="Tipos de aventura">' +
    filters.map(f => '<button class="filter ' + (f[0] === 'todas' ? 'active' : '') + '" data-filter="' + f[0] + '" aria-pressed="' + (f[0] === 'todas') + '">' + f[1] + '</button>').join('') +
    '</div></section><section class="full-adventures"><div class="adventure-grid" id="filtered-adventures">' + adventures.map(journeyCard).join('') + '</div></section>';
  $$('[data-filter]').forEach(button => button.onclick = () => {
    $$('[data-filter]').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed',String(b === button)); });
    $('#filtered-adventures').innerHTML = adventures.filter(a => button.dataset.filter === 'todas' || (button.dataset.filter === 'novas' ? a.bonus : a.filter === button.dataset.filter)).map(journeyCard).join('');
  });
}
function bonusHub() {
  const n = collectedStars(), target = nextStarMilestone(), next = nextStarAdventure();
  main.innerHTML = '<section class="page-heading bonus-heading"><span class="eyebrow">UM QUINTAL DE SURPRESAS</span><h1>' + (bonusUnlocked() ? 'Cada descoberta abre um caminho.' : 'Tem mais quintal depois das estrelas.') + '</h1><p>' + n + ' de 15 estrelas. ' + (n === 15 ? 'Você encontrou todas! Suas fases favoritas continuam aqui.' : 'Faltam ' + (target-n) + ' para ' + (target === 15 ? 'uma nova medalha.' : 'abrir três jogos!')) + '</p>' +
    (next ? '<a class="button primary" href="' + phaseURL(next.id,1) + '">Encontrar a próxima estrela ✦</a>' : '<a class="button primary" href="#conquistas">Ver minhas descobertas ✦</a>') +
    (bonusUnlocked() ? '<button class="text-button" id="see-party">Rever minha conquista ✦</button>' : '') + '</section>' + milestoneTrail() + bonusPreview();
  const party = $('#see-party'); if (party) party.onclick = showJourneyParty;
}
function milestoneTrail() {
  const n = collectedStars();
  return '<section class="milestone-trail" aria-label="As surpresas da coleção">' + [{n:9,title:'As surpresas da Luma',text:'Três jogos se abrem',done:bonusUnlocked()},{n:12,title:'Uma nova rota',text:'Mais três jogos se abrem',done:expansionUnlocked()},{n:15,title:'Quinze estrelas',text:'Uma medalha especial',done:n===15}].map(m => '<div class="milestone-stop ' + (m.done ? 'done' : '') + '"><span aria-hidden="true">' + (m.done ? '✦' : '✧') + '</span><b>' + m.n + ' estrelas</b><strong>' + m.title + '</strong><small>' + (m.done ? 'Conquista desbloqueada' : m.text) + '</small></div>').join('') + '</section>';
}
function phaseGate(a) {
  const available = Math.min(phaseCount(a.id),completedPhases(a.id)+1);
  main.innerHTML = '<section class="page-heading"><span class="eyebrow">UM PASSO DE CADA VEZ</span><h1>Uma descoberta abre a próxima.</h1><p>Complete a fase anterior de “' + a.title + '” para continuar por aqui.</p>' + phaseNavigation(a) + '<a class="button primary" href="' + phaseURL(a.id,available) + '">Vamos para a fase ' + available + ' →</a></section>';
}
function renderDiscoveries() {
  const n = collectedStars(), phases = adventures.reduce((sum,a) => sum + completedPhases(a.id),0);
  const total = adventures.reduce((sum,a) => sum + phaseCount(a.id),0), complete = journeyFullyComplete();
  const core = adventures.filter(a => !a.bonus), target = nextStarMilestone();
  main.innerHTML = '<section class="page-heading"><span class="eyebrow">SEU BOLSO DE PEQUENAS GRANDES IDEIAS</span><h1>Olha o que você descobriu!</h1><p>Cada jogo tem uma estrela. As fases continuam sua aventura sem repetir a mesma estrela. Suas descobertas ficam guardadas.</p><div class="progress-bar" role="progressbar" aria-label="Estrelas da coleção" aria-valuemin="0" aria-valuemax="15" aria-valuenow="' + n + '"><span style="width:' + n/15*100 + '%"></span></div><p><b>' + n + ' de 15 estrelas</b> na coleção ✦ <span class="phase-total">' + phases + ' de ' + total + ' fases descobertas</span></p><p class="next-surprise">' + (n === 15 ? 'Todas as estrelas encontradas! Continue explorando as fases.' : 'Faltam ' + (target-n) + ' estrelas para ' + (target === 15 ? 'uma nova medalha.' : 'abrir mais três jogos!')) + '</p></section>' + milestoneTrail() +
    (bonusUnlocked() ? '<section class="journey-complete"><div class="journey-medal" aria-hidden="true">✦</div><div><span class="eyebrow">' + (complete ? 'TODAS AS FASES DESCOBERTAS' : n===15 ? 'QUINZE ESTRELAS NO SEU BOLSO' : 'SUA CONQUISTA ESPECIAL') + '</span><h2>' + (complete ? 'Guardião das Ideias!' : n===15 ? 'Turma das Quinze Estrelas!' : 'Explorador do Quintal!') + '</h2><p>' + (complete ? 'Você descobriu as ' + total + ' fases do quintal. Miau, Bit e Luma comemoram cada ideia e cada cuidado!' : n===15 ? 'A coleção de estrelas está completa. Você pode continuar descobrindo as fases e revisitar suas brincadeiras favoritas.' : 'As nove estrelas da primeira jornada continuam suas! Agora o quintal tem novos cantinhos para explorar.') + '</p>' + (legacyGuardian && !complete ? '<p class="legacy-medal">✦ Guardião das Ideias: sua medalha da coleção anterior também continua com você.</p>' : '') + '<div class="success-next"><a class="button primary" href="' + (complete ? '#aventuras' : '#novidades') + '">' + (complete ? 'Escolher minha favorita ↗' : 'Explorar os cantinhos ↗') + '</a><button class="button secondary" id="replay-party">Rever a festa ✦</button></div></div></section>' : '') +
    '<section class="achievements"><div class="medal-grid">' + core.map(a => '<article class="medal ' + (discovered.has(a.id) ? 'earned' : '') + '"><div class="medal-icon" aria-hidden="true">' + (discovered.has(a.id) ? '✦' : a.symbol) + '</div><h3>' + a.medal + '</h3><p>' + (discovered.has(a.id) ? 'A estrela desta aventura já é sua!' : 'Encontre a estrela em “' + a.title + '”.') + '</p>' + phaseDots(a) + '<a class="text-link" href="' + phaseURL(a.id,completedPhases(a.id) === phaseCount(a.id) ? 1 : Math.min(phaseCount(a.id),completedPhases(a.id)+1)) + '">' + (completedPhases(a.id) === phaseCount(a.id) ? 'Brincar de novo' : completedPhases(a.id) ? 'Continuar na próxima fase' : 'Encontrar a estrela') + ' ↗</a></article>').join('') + '</div></section>' + bonusPreview() + '<section class="reset-section"><p>Suas descobertas ficam só neste navegador ou aplicativo.</p><button class="text-button" id="reset-stars">Recomeçar toda a coleção</button></section>';
  $('#reset-stars').onclick = resetJourney;
  const party = $('#replay-party'); if (party) party.onclick = showJourneyParty;
}
function resetJourney() {
  const dialog = document.createElement('dialog');
  dialog.className = 'journey-dialog reset-dialog';
  dialog.setAttribute('aria-labelledby','reset-title');
  dialog.innerHTML = '<h2 id="reset-title">Uma nova coleção?</h2><p>Isso recomeça as estrelas e todas as fases neste aparelho. Você também pode continuar brincando sem apagar suas descobertas.</p><div class="success-next"><button class="button primary" id="keep-stars">Ficar com minhas descobertas</button><button class="button secondary" id="clear-stars">Sim, recomeçar tudo</button></div>';
  document.body.append(dialog);
  const close = () => { dialog.close(); dialog.remove(); $('#reset-stars')?.focus(); };
  $('#keep-stars',dialog).onclick = close;
  $('#clear-stars',dialog).onclick = () => {
    discovered.clear(); phaseProgress = {}; partySeen = 0; legacyGuardian = false;
    try { [PHASE_KEY,PARTY_KEY,'miau-bit-journey-party-v1','miau-bit-stars-v1'].forEach(key => localStorage.removeItem(key)); } catch (_) {}
    dialog.close(); dialog.remove(); updateProgress(); renderDiscoveries(); toast('Uma nova jornada começa quando você quiser!');
  };
  dialog.addEventListener('cancel',event => { event.preventDefault(); close(); });
  dialog.showModal(); $('#keep-stars',dialog).focus();
}
function showJourneyParty() {
  const stage = celebrationStage();
  if (!stage || document.querySelector('#journey-party')) return;
  partySeen = Math.max(partySeen,stage); try { localStorage.setItem(PARTY_KEY,String(partySeen)); } catch (_) {}
  const messages = {
    1:{eyebrow:'NOVE ESTRELAS, MUITAS DESCOBERTAS',title:'Você é da turma do quintal!',body:'Miau, Bit e Luma têm uma medalha para você: <strong>Explorador do Quintal.</strong> E abriram três brincadeiras para a aventura continuar!',href:'#novidades',cta:'Abrir meu novo cantinho ↗'},
    2:{eyebrow:'DOZE ESTRELAS, UMA NOVA ROTA',title:'Mais quintal para descobrir!',body:'Você encontrou doze estrelas! Agora a turma abriu três missões: os aplicativos, as conexões e a ponte dos padrões. Vamos explorar?',href:'#novidades',cta:'Conhecer os três jogos ↗'},
    3:{eyebrow:'QUINZE ESTRELAS NO SEU BOLSO',title:'Todas as estrelas brilham com você!',body:'Você ganhou a medalha <strong>Turma das Quinze Estrelas!</strong> Miau, Bit e Luma comemoram com você. As fases continuam esperando suas ideias!',href:'#conquistas',cta:'Ver minha coleção ✦'},
    4:{eyebrow:'TODAS AS FASES, TODAS AS DESCOBERTAS',title:'O quintal inteiro brilhou!',body:'Você descobriu as 32 fases e ganhou a conquista <strong>Guardião das Ideias.</strong> A turma agradece cada ideia e cada cuidado. Suas brincadeiras favoritas continuam aqui!',href:'#aventuras',cta:'Escolher minha favorita ↗'}
  };
  const m = messages[stage], before = document.activeElement, dialog = document.createElement('dialog');
  dialog.id = 'journey-party'; dialog.className = 'journey-dialog party-dialog';
  dialog.setAttribute('aria-labelledby','party-title'); dialog.setAttribute('aria-describedby','party-description');
  dialog.innerHTML = '<button class="party-close" aria-label="Fechar a comemoração">×</button><div class="party-stars" aria-hidden="true">' + Array.from({length:9},(_,i) => '<span style="--i:' + i + '">✦</span>').join('') + '</div><div class="journey-medal" aria-hidden="true">✦</div><span class="eyebrow">' + m.eyebrow + '</span><h2 id="party-title">' + m.title + '</h2><p id="party-description">' + m.body + '</p><div class="party-signatures"><span>Miau ♡</span><span>Bit ✦</span><span>Luma ♡</span></div><div class="success-next"><a class="button primary" href="' + m.href + '" id="open-bonus">' + m.cta + '</a><button class="button secondary" id="stay-party">Ver minhas descobertas</button></div>';
  document.body.append(dialog);
  const close = () => { dialog.close(); dialog.remove(); if (before?.isConnected && !before.disabled) before.focus(); else main.focus({preventScroll:true}); };
  $('.party-close',dialog).onclick = close; $('#open-bonus',dialog).onclick = close;
  $('#stay-party',dialog).onclick = () => { close(); location.hash = '#conquistas'; };
  dialog.addEventListener('cancel',event => { event.preventDefault(); close(); });
  dialog.showModal(); $('#open-bonus',dialog).focus();
}
function maybeCelebrateJourney() {
  const stage = celebrationStage();
  if (!stage || partySeen >= stage) return;
  const currentVisit = visit;
  setTimeout(() => { if (currentVisit === visit && partySeen < stage && !document.querySelector('dialog[open]')) showJourneyParty(); },350);
}

const PATH_PHASES = [
  {size:4,start:[3,0],goal:[0,3],blocks:[[1,1],[2,1]],key:null,limit:12,title:'A estrela que caiu',story:'Uma estrela caiu no quintal! Escolha os passos para Bit buscar a estrela, dando a volta nos arbustos.',hint:'Um caminho: direita, direita, cima, cima, direita, cima.'},
  {size:5,start:[4,0],goal:[0,4],blocks:[[3,1],[2,1],[1,1],[1,3],[2,3],[3,3]],key:null,limit:18,title:'A trilha entre os canteiros',story:'A estrela caiu do outro lado dos canteiros. O quintal cresceu! Bit pode passear pelos espaços livres sem pisar nas plantas.',hint:'Experimente subir pela primeira coluna e depois atravessar pela linha de cima.'},
  {size:5,start:[4,0],goal:[0,4],blocks:[[3,1],[2,1],[1,3],[2,3]],key:[4,3],limit:20,title:'Uma chave no caminho',story:'Antes da estrela, Bit precisa pegar a chave dourada. Monte um caminho que passe pela chave e depois chegue à estrela.',hint:'A chave está na linha de baixo. Vá até ela e procure um caminho pela última coluna.'},
  {size:6,start:[5,0],goal:[0,5],blocks:[[5,1],[4,1],[3,1],[2,3],[1,3],[0,3]],key:null,limit:24,title:'O quintal cresceu',story:'Novos canteiros apareceram! Bit precisa encontrar uma passagem entre as plantas para chegar à estrela do outro lado do quintal.',hint:'Suba pela primeira coluna até encontrar uma passagem. Depois procure um espaço para atravessar o meio do mapa.'},
  {size:6,start:[5,0],goal:[0,5],blocks:[[5,1],[4,1],[3,1],[2,3],[1,3],[0,3]],key:[0,1],limit:28,title:'A chave lá no alto',story:'A chave dourada ficou lá em cima! Busque a chave e planeje as voltas entre os canteiros antes de chegar à estrela.',hint:'Busque a chave pela primeira coluna. Para passar ao outro lado, desça até a quarta linha.'},
  {size:6,start:[5,0],goal:[0,5],blocks:[[4,1],[3,1],[2,1],[1,3],[2,3],[3,3],[4,3]],items:[{at:[1,0],icon:'⚿',label:'Chave'},{at:[4,4],icon:'✿',label:'Flor'}],limit:30,title:'Duas descobertas pelo caminho',story:'A turma preparou uma missão especial: buscar a chave e a flor antes da estrela. Os dois itens precisam ir com Bit. Qual caminho visita todos?',hint:'A chave está na primeira coluna. A flor está do outro lado. A linha de cima e a linha de baixo ajudam a atravessar o quintal.'}
];

function pathPickups(cfg) { return cfg.items || (cfg.key ? [{at:cfg.key,icon:'⚿',label:'Chave'}] : []); }
function phasePathGame(a) {
  const cfg = PATH_PHASES[requestedPhase(a.id)-1], currentVisit = visit, items = pathPickups(cfg);
  const dirs = {up:{r:-1,c:0,arrow:'↑',label:'Cima'},right:{r:0,c:1,arrow:'→',label:'Direita'},down:{r:1,c:0,arrow:'↓',label:'Baixo'},left:{r:0,c:-1,arrow:'←',label:'Esquerda'}};
  let commands = [], pos = {r:cfg.start[0],c:cfg.start[1]}, trail = [], busy = false, collected = new Set();
  const blocked = (r,c) => cfg.blocks.some(p => p[0] === r && p[1] === c);
  gameShell(a,cfg.story,'<div class="stage-label"><span>' + cfg.title.toUpperCase() + '</span><span>' + cfg.size + ' × ' + cfg.size + '</span></div><div class="board phase-board" id="board" role="img" style="--board-size:' + cfg.size + '" aria-label="Mapa do quintal"></div><div class="board-caption"><span>🌿 Dê a volta nas plantas</span><span>✦ Seu destino</span></div><div class="path-pickups" id="path-pickups"></div>',
    '<h2>Qual é o caminho, capitão?</h2><p>Monte os passos e veja Bit passear.</p><div class="direction-pad">' + Object.entries(dirs).map(([id,d]) => '<button class="direction-button" data-dir="' + id + '" aria-label="Adicionar passo para ' + d.label.toLowerCase() + '">' + d.arrow + '<small>' + d.label + '</small></button>').join('') + '</div><div class="program" id="program" aria-label="Seu caminho de comandos"></div><p class="path-step-count" id="step-count"></p><div class="path-edit-controls"><button id="undo" aria-describedby="path-edit-help"><span aria-hidden="true">↶</span>Voltar um passo</button><button id="clear" aria-describedby="path-edit-help"><span aria-hidden="true">×</span>Limpar caminho</button></div><p class="path-edit-help" id="path-edit-help">Voltar remove a última seta. Limpar apaga o caminho inteiro.</p><button class="button primary run" id="run-path">Vamos, Bit! ▶</button><div class="feedback" id="path-feedback" role="status" aria-live="polite">Pode testar quantas vezes quiser.</div><details class="hint"><summary>Uma pista do Miau?</summary><p>' + cfg.hint + '</p></details>',
    'Você criou uma sequência de comandos, testou a ideia e pôde mudar o caminho. Programar também é experimentar!');
  function draw() {
    $('#board').innerHTML = Array.from({length:cfg.size*cfg.size},(_,i) => {
      const r = Math.floor(i/cfg.size), c = i%cfg.size, here = pos.r === r && pos.c === c, target = r === cfg.goal[0] && c === cfg.goal[1];
      const item = items.find((p,n) => !collected.has(n) && p.at[0] === r && p.at[1] === c);
      return '<div class="cell ' + (blocked(r,c) ? 'blocked' : '') + ' ' + (target ? 'target' : '') + ' ' + (trail.includes(i) && !here ? 'trail' : '') + '">' + (here ? robotSVG('tiny-robot') : blocked(r,c) ? '🌿' : item ? item.icon : target ? '✦' : '') + '</div>';
    }).join('');
    $('#board').setAttribute('aria-label','Quintal com ' + cfg.size + ' linhas e colunas. Bit está na linha ' + (pos.r+1) + ', coluna ' + (pos.c+1) + '. A estrela está na linha ' + (cfg.goal[0]+1) + ', coluna ' + (cfg.goal[1]+1) + '. ' + items.map((p,n) => p.label + ' na linha ' + (p.at[0]+1) + ', coluna ' + (p.at[1]+1) + (collected.has(n) ? ', já coletada.' : ', ainda no caminho.')).join(' '));
    $('#path-pickups').innerHTML = items.map((p,n) => '<span class="' + (collected.has(n) ? 'collected' : '') + '">' + (collected.has(n) ? '✓' : p.icon) + ' ' + p.label + (collected.has(n) ? ' encontrada' : ' para buscar') + '</span>').join('');
  }
  function program() {
    $('#program').innerHTML = commands.length ? commands.map((id,i) => '<span class="step" data-step="' + i + '">' + dirs[id].arrow + '</span>').join('') : '<span class="program-empty">Seu caminho aparece aqui ✦</span>';
    $('#step-count').textContent = commands.length + ' de ' + cfg.limit + ' passos';
    $('#undo').disabled = busy || !commands.length; $('#clear').disabled = busy || (!commands.length && !trail.length);
  }
  function feedback(text,type) { const el = $('#path-feedback'); el.className = 'feedback ' + (type || ''); el.innerHTML = text; }
  function unlock() { busy = false; $$('.direction-button,#run-path').forEach(b => b.disabled = false); $$('.step').forEach(s => s.classList.remove('running')); program(); }
  $$('[data-dir]').forEach(b => b.onclick = () => { if (busy) return; if (commands.length >= cfg.limit) { feedback('Seu caminho está cheio. Que tal voltar um passo?','error'); return; } commands.push(b.dataset.dir); program(); });
  $('#undo').onclick = () => { if (!busy) { commands.pop(); program(); feedback('A última seta saiu. Você pode escolher outro passo.'); } };
  $('#clear').onclick = () => { if (busy) return; commands = []; pos = {r:cfg.start[0],c:cfg.start[1]}; trail = []; collected.clear(); draw(); program(); feedback('Uma ideia novinha para testar!'); };
  $('#run-path').onclick = async () => {
    if (busy) return; if (!commands.length) { feedback('Escolha uma seta para mostrar o caminho.','error'); return; }
    busy = true; $$('.direction-button,#undo,#clear,#run-path').forEach(b => b.disabled = true);
    pos = {r:cfg.start[0],c:cfg.start[1]}; trail = []; collected.clear(); draw(); feedback('Bip-bip… seguindo sua ideia!');
    for (let i=0;i<commands.length;i++) {
      if (currentVisit !== visit) return; $$('.step').forEach(s => s.classList.toggle('running',Number(s.dataset.step) === i));
      await wait(motionReduced ? 70 : 360); if (currentVisit !== visit) return;
      const d = dirs[commands[i]], r = pos.r+d.r, c = pos.c+d.c;
      if (r < 0 || r >= cfg.size || c < 0 || c >= cfg.size) { feedback('Bit chegou à beirinha. Vamos mudar os passos e tentar outra vez?','error'); unlock(); return; }
      if (blocked(r,c)) { feedback('Uma plantinha! Bit parou para cuidar dela. Vamos dar a volta?','error'); unlock(); return; }
      trail.push(pos.r*cfg.size+pos.c); pos = {r,c}; items.forEach((p,n) => { if (p.at[0] === r && p.at[1] === c) collected.add(n); }); draw();
    }
    const reached = pos.r === cfg.goal[0] && pos.c === cfg.goal[1];
    if (reached && collected.size === items.length) { award(a.id); feedback('Sua ideia brilhou! Bit encontrou a estrela' + (items.length ? ' e trouxe todas as descobertas do caminho' : '') + '. ✦' + nextLinks(),'success'); }
    else feedback(reached && collected.size < items.length ? 'Chegamos à estrela, mas ainda falta buscar: ' + items.filter((_,n) => !collected.has(n)).map(p => p.label.toLowerCase()).join(' e ') + '. Vamos mudar o caminho?' : 'Bit passeou. Que passos ainda faltam para chegar à estrela?','error');
    unlock();
  };
  program(); draw();
}

function phaseLightsGame(a) {
  const phase = requestedPhase(a.id), cfg = [{total:4,group:1},{total:6,group:2},{total:8,group:2}][phase-1], currentVisit = visit;
  let busy = false;
  const action = cfg.group === 1 ? 'Acender uma lanterna' : 'Acender duas lanternas';
  gameShell(a,phase === 1 ? 'O piquenique vai começar! Bit acende uma lanterna por vez. Quantas vezes ele precisa repetir para iluminar as quatro?' : 'O piquenique cresceu! Agora, cada repetição acende duas lanternas. Quantas repetições iluminam as ' + cfg.total + ' luzinhas?',
    '<div class="stage-label"><span>O PIQUENIQUE DAS LUZES</span><span>' + cfg.total + ' LANTERNAS</span></div><div class="lantern-garden phase-lanterns">' + Array.from({length:cfg.total},(_,i) => '<div class="lantern" data-lantern="' + (i+1) + '" aria-label="Lanterna ' + (i+1) + ', apagada">✦</div>').join('') + '<div class="garden-caption" id="light-count">O quintal espera sua ideia!</div></div>',
    '<h2>Uma repetição, ' + (cfg.group === 1 ? 'uma luzinha' : 'duas luzinhas') + '!</h2><p>O bloco amarelo conta o que acontece em cada volta.</p><div class="repeat-block"><label for="repeat-count">Repita <select id="repeat-count">' + [1,2,3,4,5,6].map(n => '<option value="' + n + '" ' + (n === 2 ? 'selected' : '') + '>' + n + '</option>').join('') + '</select> vezes</label><div class="repeat-inner">✦ ' + action + '</div></div><button class="button primary run" id="light-run">Acender o quintal ▶</button><div class="feedback" id="light-feedback" role="status" aria-live="polite">Conte de ' + (cfg.group === 1 ? 'uma em uma' : 'duas em duas') + ' para descobrir!</div><details class="code-details"><summary>Espiar o Python com um adulto</summary><p>As lanternas são uma simulação da ideia de repetir.</p><pre id="python-code"></pre></details>',
    'Um laço repete as ações que estão dentro dele. Se colocamos duas ações no bloco, as duas acontecem a cada repetição.');
  function code() { $('#python-code').textContent = 'for vez in range(' + $('#repeat-count').value + '):\n    acender_lanterna()' + (cfg.group === 2 ? '\n    acender_lanterna()' : '') + '\n\n# As lanternas são ações da nossa brincadeira.'; }
  $('#repeat-count').onchange = code; code();
  $('#light-run').onclick = async () => {
    if (busy) return; busy = true; $('#light-run').disabled = true; $('#repeat-count').disabled = true;
    const count = Number($('#repeat-count').value);
    $$('[data-lantern]').forEach(l => { l.classList.remove('on'); l.setAttribute('aria-label','Lanterna ' + l.dataset.lantern + ', apagada'); });
    $('#light-feedback').className = 'feedback'; $('#light-feedback').textContent = 'Bit vai repetir o bloco…';
    for (let i=0;i<Math.min(count*cfg.group,cfg.total);i++) {
      await wait(motionReduced ? 60 : 280); if (currentVisit !== visit) return;
      const l = $('[data-lantern="' + (i+1) + '"]'); l.classList.add('on'); l.setAttribute('aria-label','Lanterna ' + (i+1) + ', acesa');
      $('#light-count').textContent = (i+1) + ' de ' + cfg.total + ' lanternas acesas';
    }
    const f = $('#light-feedback');
    if (count*cfg.group === cfg.total) { award(a.id); f.className = 'feedback success'; f.innerHTML = 'O quintal brilhou! ' + count + ' repetições, ' + cfg.group + ' ' + (cfg.group === 1 ? 'luzinha' : 'luzinhas') + ' por vez. ✦' + nextLinks(); }
    else { f.className = 'feedback error'; f.textContent = count*cfg.group < cfg.total ? 'Ainda faltam luzinhas. Veja quantas cada repetição acende e experimente outro número.' : 'As luzes acenderam, mas sobraram repetições. Quantas voltas bastam para estas lanternas?'; }
    busy = false; $('#light-run').disabled = false; $('#repeat-count').disabled = false;
  };
}
function phaseSearchGame(a) {
  const phase = requestedPhase(a.id);
  const cfg = [{color:'amarela',shape:'todas',title:'Todas as peças amarelas',story:'O foguete de Miau precisa de todas as peças amarelas. Qual pista separa só as peças certas?'},{color:'azul',shape:'bola',title:'Só as bolas azuis',story:'Luma quer rodas para um carrinho azul. Agora precisamos de duas pistas: cor azul e formato de bola.'},{color:'amarela',shape:'cubo',title:'Só os cubos amarelos',story:'A oficina ganhou mais peças. Bit precisa separar os cubos amarelos para uma torre. Use as duas pistas!'}][phase-1];
  const toys = [{name:'Cubo',shape:'cubo',color:'amarela'},{name:'Bola',shape:'bola',color:'azul'},{name:'Triângulo',shape:'triangulo',color:'amarela'},{name:'Cubo',shape:'cubo',color:'azul'},{name:'Bola',shape:'bola',color:'amarela'},{name:'Triângulo',shape:'triangulo',color:'azul'},...(phase === 3 ? [{name:'Cubo',shape:'cubo',color:'amarela'},{name:'Bola',shape:'bola',color:'azul'},{name:'Cubo',shape:'cubo',color:'amarela'}] : [])];
  let color = 'todas', shape = 'todas';
  function icon(t) { return '<span class="search-shape ' + t.shape + ' ' + t.color + '" aria-hidden="true"></span>'; }
  gameShell(a,cfg.story,'<div class="stage-label"><span>A CAIXA DAS INVENÇÕES</span><span>' + toys.length + ' PEÇAS</span></div><div class="sql-shelf">' + toys.map((t,i) => '<div class="toy" data-toy="' + i + '" role="img" aria-label="' + t.name + ', cor ' + t.color + '"><div>' + icon(t) + '<small>' + t.name + ' · ' + (t.color === 'amarela' ? 'amarelo' : 'azul') + '</small></div></div>').join('') + '</div><p class="board-caption" id="found-count" role="status">' + cfg.title + '</p>',
    '<h2>' + (phase === 1 ? 'Uma pista para encontrar!' : 'Duas pistas, uma descoberta!') + '</h2><p>' + cfg.title + ': esse é o pedido da turma.</p><span class="select-label">Procure pela cor:</span><div class="color-select">' + [['amarela','☀ Amarela'],['azul','● Azul'],['todas','Todas']].map(f => '<button class="color-option ' + (f[0] === color ? 'selected' : '') + '" data-color="' + f[0] + '" aria-pressed="' + (f[0] === color) + '">' + f[1] + '</button>').join('') + '</div>' +
    (phase > 1 ? '<span class="select-label">E pelo formato:</span><div class="color-select">' + [['cubo','■ Cubo'],['bola','● Bola'],['triangulo','▲ Triângulo'],['todas','Todos']].map(f => '<button class="color-option ' + (f[0] === shape ? 'selected' : '') + '" data-shape="' + f[0] + '" aria-pressed="' + (f[0] === shape) + '">' + f[1] + '</button>').join('') + '</div>' : '') +
    '<button class="button primary run" id="find-toys">Procurar, Bit! ⌕</button><div class="feedback" id="find-feedback" role="status" aria-live="polite">Pode testar suas pistas.</div><details class="code-details"><summary>Espiar o SQL com um adulto</summary><p>Este código mostra a ideia da busca. As peças são uma simulação.</p><pre id="sql-code"></pre></details>',
    'O WHERE escolhe as peças que combinam com uma pista. O AND junta duas pistas: a peça precisa combinar com as duas ao mesmo tempo.');
  function code() { const conditions = []; if (color !== 'todas') conditions.push("cor = '" + color + "'"); if (phase > 1 && shape !== 'todas') conditions.push("formato = '" + shape + "'"); $('#sql-code').textContent = 'SELECT * FROM pecas' + (conditions.length ? '\nWHERE ' + conditions.join('\n  AND ') : '') + ';'; }
  function select(kind,button) { if (kind === 'color') color = button.dataset.color; else shape = button.dataset.shape; $$('[data-' + kind + ']').forEach(b => { b.classList.toggle('selected',b === button); b.setAttribute('aria-pressed',String(b === button)); }); code(); }
  $$('[data-color]').forEach(b => b.onclick = () => select('color',b)); $$('[data-shape]').forEach(b => b.onclick = () => select('shape',b)); code();
  $('#find-toys').onclick = () => {
    let found = 0; toys.forEach((t,i) => { const match = (color === 'todas' || t.color === color) && (shape === 'todas' || t.shape === shape); if (match) found++; const el = $('[data-toy="' + i + '"]'); el.classList.toggle('selected',match); el.classList.toggle('dim',!match); });
    $('#found-count').textContent = found + ' ' + (found === 1 ? 'peça encontrada' : 'peças encontradas');
    const f = $('#find-feedback');
    if (color === cfg.color && shape === cfg.shape) { award(a.id); f.className = 'feedback success'; f.innerHTML = 'Era exatamente o pedido da turma! Suas pistas encontraram ' + found + ' ' + (found === 1 ? 'peça' : 'peças') + '. ✦' + nextLinks(); }
    else { f.className = 'feedback error'; f.textContent = 'Vamos comparar com o pedido: ' + cfg.title.toLowerCase() + '. Ajuste as pistas e tente outra vez!'; }
  };
}

const MAIL_PHASES = [
  [
    {from:'Um remetente que Bit não conhece',text:'Você ganhou mil moedas! Escreva sua senha para receber agora.',adult:true,why:'Um prêmio pedindo senha é motivo para parar. Bit não responde e mostra a mensagem a um adulto.'},
    {from:'Uma brincadeira combinada com a família',text:'Hoje vamos desenhar foguetes. Escolha uma cor bem bonita!',adult:false,why:'É a atividade já combinada com a família. Não há link, pedido de segredo nem dados pessoais.'},
    {from:'Uma mensagem durante um jogo',text:'Mande o código que chegou no celular para eu liberar uma fase.',adult:true,why:'Códigos protegem contas. Bit não envia e pede ajuda a um adulto de confiança.'},
    {from:'O mural de histórias inventadas',text:'Que tal chamar nosso planeta de Planeta Pipoca?',adult:false,why:'O nome do planeta é de faz de conta. A pergunta não pede informações pessoais.'},
    {from:'Uma conversa desconfortável',text:'Não conte esta conversa para ninguém, nem para a sua família.',adult:true,why:'Bit pode contar o que o deixou desconfortável. Um segredo assim merece ajuda.'}
  ],
  [
    {from:'Um perfil com a foto de Miau',text:'Sou eu! Me empresta sua senha rapidinho?',adult:true,why:'Foto e nome conhecidos não garantem quem está falando. Bit não envia a senha e confere com um adulto.'},
    {from:'Um bilhete já combinado na oficina',text:'Pode colocar uma estrela amarela no desenho do nosso foguete?',adult:false,why:'É um pedido sobre o desenho combinado. Não envolve segredos ou dados pessoais.'},
    {from:'Uma oferta com muita pressa',text:'Última chance! Você tem dez segundos para mandar uma foto do seu documento.',adult:true,why:'A pressa não é motivo para enviar documentos. Bit para e pede ajuda.'},
    {from:'O grupo da história de faz de conta',text:'Nossa nave vai visitar um planeta roxo ou um planeta verde?',adult:false,why:'Escolher a cor de um planeta inventado faz parte da brincadeira.'}
  ],
  [
    {from:'Um aviso inesperado sobre a conta',text:'Sua conta vai sumir hoje. Toque aqui e diga o código de acesso.',adult:true,why:'Ameaça e urgência merecem uma pausa. Um adulto pode conferir pelo caminho oficial, sem usar esse link.'},
    {from:'Uma mensagem de quem Bit não conhece',text:'Eu sei consertar seu jogo. Instale este arquivo que enviei.',adult:true,why:'Arquivos e instalações precisam da ajuda de um adulto. Bit não abre o envio.'},
    {from:'Uma atividade combinada com a família',text:'Qual nome de faz de conta podemos dar ao robô da história?',adult:false,why:'Um nome inventado para o personagem não revela dados da criança.'},
    {from:'Uma pessoa insistindo na conversa',text:'Sua família não entenderia. Vamos conversar escondido em outro aplicativo.',adult:true,why:'Bit não precisa aceitar nem continuar. Ele pode mostrar a conversa e pedir apoio a um adulto de confiança.'}
  ]
];
function phaseMailboxGame(a) {
  const phase = requestedPhase(a.id), letters = MAIL_PHASES[phase-1];
  let index = 0, answered = false;
  gameShell(a,'Chegaram ' + letters.length + ' cartas de faz de conta. ' + (phase === 1 ? 'Algumas fazem parte da brincadeira; outras precisam da ajuda de um adulto.' : phase === 2 ? 'Um nome conhecido nem sempre conta toda a história. Vamos olhar o que cada mensagem pede?' : 'Pressa, arquivos e segredos? A turma pode parar e pedir ajuda.'),'','','Observe o pedido da mensagem. Na dúvida, pedir ajuda a um adulto de confiança é sempre permitido.');
  function render() {
    answered = false; const l = letters[index];
    $('#game-stage').innerHTML = '<div class="stage-label"><span>CORREIO DE FAZ DE CONTA</span><span>CARTA ' + (index+1) + ' DE ' + letters.length + '</span></div><div class="aw-letter"><span class="aw-envelope" aria-hidden="true">✉</span><p class="aw-from">' + l.from + '</p><p class="aw-letter-text">“' + l.text + '”</p></div><div class="aw-stamps" aria-label="' + index + ' de ' + letters.length + ' cartas organizadas">' + letters.map((_,i) => '<span class="' + (i < index ? 'aw-stamped' : '') + '" aria-hidden="true">' + (i < index ? '✓' : '✉') + '</span>').join('') + '</div><p class="aw-caption">Cartas inventadas. Nenhum link abre de verdade.</p>';
    $('#game-panel').innerHTML = '<h2>Para onde vai essa carta?</h2><p>Leia com calma. O que a mensagem está pedindo?</p><div class="choices"><button class="choice" data-mail-place="recado">✉ Guardar com os recados da brincadeira</button><button class="choice" data-mail-place="adulto">♡ Mostrar a um adulto de confiança</button></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Você pode pensar e tentar de novo.</div><div id="aw-mail-next"></div>';
    $$('[data-mail-place]').forEach(b => b.onclick = () => {
      if (answered) return; const adult = b.dataset.mailPlace === 'adulto';
      if (adult !== l.adult) { awarenessStatus(l.adult ? 'Essa mensagem merece cuidado. Bit pode parar e procurar ajuda. Experimente o outro lugar.' : 'Pedir ajuda é sempre permitido! Para organizar esta atividade combinada, vamos colocar o bilhete com os recados.','error'); return; }
      answered = true; b.classList.add('selected'); $$('[data-mail-place]').forEach(x => x.disabled = true); awarenessStatus(l.why,'success');
      const stamps = $('.aw-stamps');
      stamps.setAttribute('aria-label', (index+1) + ' de ' + letters.length + ' cartas organizadas');
      stamps.innerHTML = letters.map((_,i) => '<span class="' + (i <= index ? 'aw-stamped' : '') + '" aria-hidden="true">' + (i <= index ? '✓' : '✉') + '</span>').join('');
      $('#aw-mail-next').innerHTML = '<button class="button primary run" id="aw-open-letter">' + (index === letters.length-1 ? 'Concluir esta fase ✦' : 'Abrir a próxima carta →') + '</button>';
      $('#aw-open-letter').onclick = () => { index++; if (index < letters.length) render(); else awarenessFinish(a,'As cartas chegaram ao lugar certo. Você encontrou pistas e ajudou Bit a pedir apoio quando precisava!',() => phaseMailboxGame(a)); };
    });
  }
  render();
}

function passwordGame(a) {
  let step = 0, chosen = [];
  const words = ['Pipoca','Nuvem','Bota','Lua','Janela','Tigre','Piano','Bolha'];
  gameShell(a,'Luma encontrou a senha “Miau123”. Parece fácil de adivinhar! Ajude a turma a descobrir outra ideia, só de faz de conta.','','','Peça ajuda a um adulto para cuidar das contas. Uma frase longa com palavras inesperadas e uma senha diferente para cada conta ajudam a proteger. Não use os exemplos desta brincadeira em contas reais.');
  function render() {
    $('#game-stage').innerHTML = '<div class="stage-label"><span>A OFICINA DOS SEGREDOS</span><span>' + (step+1) + ' DE 3 DESCOBERTAS</span></div><div class="secret-lock" aria-hidden="true">' + bonusCardArt('senhas') + '</div>' +
      (step === 0 ? '<div class="mock-password">Miau123</div><p class="aw-caption">Uma senha inventada para esta história.</p>' : step === 1 ? '<div class="word-phrase" aria-label="Frase de faz de conta">' + (chosen.length ? chosen.join(' · ') : 'Quatro palavras esperam sua ideia…') + '</div><p class="aw-caption">Palavras da brincadeira: não use esta frase em contas reais.</p>' : '<div class="account-pair"><span>🚀 Jogo do foguete</span><span>🎨 Oficina de desenhos</span></div><p class="aw-caption">Contas diferentes, cuidados diferentes.</p>');
    if (step === 0) $('#game-panel').innerHTML = '<h2>O que deixou essa senha fácil?</h2><div class="choices"><button class="choice" data-pass-choice="good">É o nome de Miau com números em sequência.</button><button class="choice" data-pass-choice="bad">As letras são muito bonitas.</button></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Pense no que a turma já sabe sobre Miau.</div>';
    if (step === 1) $('#game-panel').innerHTML = '<h2>Uma frase inesperada!</h2><p>Escolha quatro palavras diferentes para montar uma frase de faz de conta.</p><div class="word-bank">' + words.map((word,i) => '<button class="word-card ' + (chosen.includes(word) ? 'selected' : '') + '" data-word="' + i + '" aria-pressed="' + chosen.includes(word) + '">' + word + '</button>').join('') + '</div><p class="word-counter">' + chosen.length + ' de 4 palavras</p><button class="button primary run" id="use-phrase" ' + (chosen.length !== 4 ? 'disabled' : '') + '>Continuar →</button><div class="feedback" id="aw-feedback" role="status">Com um adulto, podemos escolher palavras ao acaso. Esta frase é só uma experiência.</div>';
    if (step === 2) $('#game-panel').innerHTML = '<h2>E a conta de outro jogo?</h2><p>Miau vai criar outra conta. O que pode fazer com um adulto?</p><div class="choices"><button class="choice" data-pass-choice="bad">Usar a mesma senha em todo lugar.</button><button class="choice" data-pass-choice="good">Escolher uma senha diferente para essa conta.</button></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Cada conta merece seu próprio segredo.</div>';
    $$('[data-pass-choice]').forEach(b => b.onclick = () => {
      if (b.dataset.passChoice !== 'good') { awarenessStatus(step === 0 ? 'O nome de Miau é conhecido. E os números seguem uma ordem fácil. Que outra opção explica isso?' : 'Se uma senha escapar, repetir em várias contas pode levar o problema para elas também. Vamos escolher outra ideia?','error'); return; }
      if (step === 2) { awarenessFinish(a,'Você ajudou a turma a escolher palavras inesperadas e a cuidar de cada conta com um segredo diferente. Os exemplos ficaram só na brincadeira!',() => passwordGame(a)); return; }
      step++; render();
    });
    $$('[data-word]').forEach(b => b.onclick = () => { const word = words[Number(b.dataset.word)]; if (chosen.includes(word)) chosen = chosen.filter(x => x !== word); else if (chosen.length < 4) chosen.push(word); render(); });
    const next = $('#use-phrase'); if (next) next.onclick = () => { if (chosen.length !== 4) return; step++; render(); };
  }
  render();
}
function photoGame(a) {
  const scenes = [
    {title:'A foto na entrada da escola',detail:'O nome da escola aparece no uniforme.',icon:'⌂',image:'ESCOLA DO QUINTAL · FAZ DE CONTA',question:'A foto mostra onde a turma estuda. O que podemos fazer?',choices:[{text:'Publicar assim, sem olhar os detalhes.',good:false},{text:'Guardar a foto e pedir ajuda a um adulto antes de compartilhar.',good:true}],why:'Uniformes, placas e endereços podem revelar lugares. Um adulto ajuda a cuidar desses detalhes.'},
    {title:'Luma também aparece',detail:'Luma disse que prefere não publicar esta foto.',icon:'♡',image:'UM PASSEIO COM LUMA',question:'E a vontade da amiga?',choices:[{text:'Respeitar a escolha de Luma e não publicar a foto.',good:true},{text:'Publicar mesmo assim: a foto ficou bonita.',good:false}],why:'Cada pessoa pode dizer que não quer aparecer. Respeitar essa escolha também é cuidar da amizade.'},
    {title:'O desenho do planeta',detail:'Só aparece um desenho inventado, sem nomes, escola ou endereço.',icon:'✦',image:'PLANETA PIPOCA',question:'Como mostrar a criação com cuidado?',choices:[{text:'Mostrar o desenho com um adulto, sem acrescentar dados pessoais.',good:true},{text:'Adicionar o endereço de casa para todo mundo visitar.',good:false}],why:'Dá para compartilhar uma criação com ajuda de um adulto, sem revelar informações pessoais.'}
  ];
  let index = 0, answered = false;
  gameShell(a,'A turma quer mostrar suas criações. Antes do clique, Luma convida você a olhar os detalhes e respeitar quem aparece na foto.','','','Antes de compartilhar, observe o fundo, os nomes e as pessoas. Peça ajuda a um adulto de confiança e respeite quem não quer aparecer. Todas as imagens e situações deste jogo são de faz de conta.');
  function render() {
    answered = false; const s = scenes[index];
    $('#game-stage').innerHTML = '<div class="stage-label"><span>O ÁLBUM DA TURMA</span><span>FOTO ' + (index+1) + ' DE 3</span></div><div class="photo-card"><div class="photo-drawing" aria-hidden="true"><span>' + s.icon + '</span><small>' + s.image + '</small></div><h3>' + s.title + '</h3><p>' + s.detail + '</p></div>';
    $('#game-panel').innerHTML = '<h2>Antes do clique…</h2><p>' + s.question + '</p><div class="choices">' + s.choices.map((c,i) => '<button class="choice" data-photo-choice="' + i + '">' + c.text + '</button>').join('') + '</div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Pode olhar e pensar com calma.</div><div id="photo-next"></div>';
    $$('[data-photo-choice]').forEach(b => b.onclick = () => {
      if (answered) return; const choice = s.choices[Number(b.dataset.photoChoice)];
      if (!choice.good) { awarenessStatus('Vamos cuidar dos detalhes e da vontade de quem aparece? Experimente a outra atitude.','error'); return; }
      answered = true; b.classList.add('selected'); $$('[data-photo-choice]').forEach(x => x.disabled = true); awarenessStatus(s.why,'success');
      $('#photo-next').innerHTML = '<button class="button primary run" id="next-photo">' + (index === 2 ? 'Concluir o álbum ✦' : 'Olhar a próxima foto →') + '</button>';
      $('#next-photo').onclick = () => { index++; if (index < scenes.length) render(); else awarenessFinish(a,'Você olhou os detalhes, respeitou Luma e encontrou um jeito cuidadoso de mostrar as criações da turma!',() => photoGame(a)); };
    });
  }
  render();
}
function sandwichGame(a) {
  const steps = [{id:'abrir',icon:'◒',text:'Abrir o pão'},{id:'recheio',icon:'▰',text:'Colocar o recheio'},{id:'fechar',icon:'◓',text:'Fechar o sanduíche'},{id:'prato',icon:'◯',text:'Servir no prato'}];
  const order = ['fechar','prato','abrir','recheio'];
  let program = [];
  gameShell(a,'Miau pediu um sanduíche. Bit colocou o pão fechado no prato e deixou o recheio do lado! Que ordem resolve essa confusão de faz de conta?','','','Uma sequência explica o que fazer e em qual ordem. Testar, perceber o que faltou e ajustar os passos faz parte de programar. A receita aqui é só uma brincadeira.');
  function render(message,type) {
    $('#game-stage').innerHTML = '<div class="stage-label"><span>A RECEITA DO BIT</span><span>' + program.length + ' DE 4 PASSOS</span></div><div class="recipe-picture">' + bonusCardArt('receita') + '</div><ol class="recipe-program">' + (program.length ? program.map(id => '<li>' + steps.find(s => s.id === id).text + '</li>').join('') : '<li class="empty-recipe">Seu plano vai aparecer aqui.</li>') + '</ol>';
    $('#game-panel').innerHTML = '<h2>Qual passo vem agora?</h2><p>Toque nos cartões para montar a ordem. Pode mudar antes de testar.</p><div class="recipe-bank">' + order.map(id => { const s = steps.find(x => x.id === id); return '<button class="recipe-step" data-recipe="' + id + '" ' + (program.includes(id) ? 'disabled' : '') + '><span aria-hidden="true">' + s.icon + '</span>' + s.text + '</button>'; }).join('') + '</div><div class="program-tools"><button id="recipe-undo" ' + (!program.length ? 'disabled' : '') + '>↶ Voltar um passo</button><button id="recipe-clear">Limpar</button></div><button class="button primary run" id="recipe-run">Testar a receita ▶</button><div class="feedback ' + (type || '') + '" id="aw-feedback" role="status" aria-live="polite">' + (message || 'Uma ideia de cada vez. Bit pode testar com você!') + '</div>';
    $$('[data-recipe]').forEach(b => b.onclick = () => { if (program.includes(b.dataset.recipe)) return; program.push(b.dataset.recipe); render(); });
    $('#recipe-undo').onclick = () => { program.pop(); render(); }; $('#recipe-clear').onclick = () => { program = []; render(); };
    $('#recipe-run').onclick = () => {
      if (program.length !== 4) { render('Precisamos dos quatro passos para contar a receita inteira.','error'); return; }
      const wrong = program.findIndex((id,i) => id !== steps[i].id);
      if (wrong >= 0) { render(wrong === 0 ? 'Para colocar o recheio, o pão precisa estar aberto. Qual passo vem primeiro?' : 'Opa! Olhe o passo ' + (wrong+1) + '. Antes de fechar, precisamos colocar o recheio; o prato vem no final.','error'); return; }
      awarenessFinish(a,'Agora sim! Pão aberto, recheio dentro, sanduíche fechado e prato pronto. Você organizou uma sequência que Bit conseguiu seguir!',() => sandwichGame(a));
    };
  }
  render();
}
const bonusGames = {senhas:passwordGame,fotos:photoGame,receita:sandwichGame,...expansionGames};
