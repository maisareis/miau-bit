'use strict';

const expansionAdventures = [
  {id:'permissoes',tag:'SEGURANÇA DIGITAL · APLICATIVOS',title:'O aplicativo que pedia demais',description:'O aplicativo quer acessar o quê? Ajude Luma a combinar os acessos com cada atividade.',time:'5 min',medal:'Detetive dos aplicativos',symbol:'⚙',filter:'proteger',category:'SEGURANÇA DIGITAL',bonus:true,unlockStars:12},
  {id:'redes',tag:'SEGURANÇA DIGITAL · CONEXÕES',title:'Qual é a rede do quintal?',description:'Nomes parecidos confundiram a antena de Bit. Uma pista de um adulto pode ajudar!',time:'5 min',medal:'Explorador das conexões',symbol:'⌁',filter:'proteger',category:'SEGURANÇA DIGITAL',bonus:true,unlockStars:12},
  {id:'padroes',tag:'LÓGICA · PADRÕES',title:'A ponte dos padrões',description:'Estrela, lua… qual peça vem depois? Complete a ponte e leve os amigos ao outro lado.',time:'5 min',medal:'Construtor de pontes',symbol:'✦',filter:'logica',category:'LÓGICA',bonus:true,unlockStars:12}
];
function expansionCardArt(id) {
  const drawings = {
    permissoes:'<rect x="64" y="10" width="112" height="141" rx="20" fill="#397d70"/><rect x="73" y="22" width="94" height="114" rx="11" fill="#fff5da"/><circle cx="120" cy="66" r="24" fill="#e1d9ef"/><path d="M106 66l10 10 19-23" fill="none" stroke="#6d609b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M91 107h56M91 119h34" stroke="#9ab6a0" stroke-width="6" stroke-linecap="round"/><circle cx="120" cy="143" r="3" fill="#fff5da"/><path d="M36 59h16M44 51v16M197 99h16M205 91v16" stroke="#e99b61" stroke-width="4"/>',
    redes:'<path d="M40 58q85-75 170 0M66 86q59-53 118 0M94 114q31-28 62 0" fill="none" stroke="#397d70" stroke-width="14" stroke-linecap="round"/><circle cx="125" cy="137" r="12" fill="#e5b84f"/><circle cx="196" cy="116" r="27" fill="#fff5da" stroke="#8e79ac" stroke-width="4"/><path d="M184 115l8 9 17-20" fill="none" stroke="#8e79ac" stroke-width="6" stroke-linecap="round"/>',
    padroes:'<path d="M18 128q108 28 215 0" stroke="#85b8bd" stroke-width="35" fill="none"/><path d="M20 79q105 37 210 0" fill="none" stroke="#a67746" stroke-width="5"/><g fill="#eed197" stroke="#b78f56" stroke-width="2"><rect x="24" y="69" width="42" height="28" rx="5"/><rect x="76" y="82" width="42" height="28" rx="5"/><rect x="128" y="82" width="42" height="28" rx="5"/><rect x="180" y="69" width="42" height="28" rx="5"/></g><path d="M46 75l3 6 7 1-5 5 1 6-6-3-6 3 1-6-5-5 7-1zM150 88l3 6 7 1-5 5 1 6-6-3-6 3 1-6-5-5 7-1z" fill="#397d70"/><path d="M101 87a10 10 0 1 0 9 16 10 10 0 0 1-9-16M205 74a10 10 0 1 0 9 16 10 10 0 0 1-9-16" fill="#6d609b"/>'
  };
  return '<svg class="art-svg" viewBox="0 0 250 160" aria-hidden="true">' + drawings[id] + '</svg>';
}
const PERMISSION_TYPES = {
  microfone:{icon:'♫',name:'Microfone',detail:'Captar a voz'},
  camera:{icon:'▣',name:'Câmera',detail:'Tirar uma foto'},
  contatos:{icon:'☷',name:'Contatos',detail:'Ver a lista de pessoas'},
  localizacao:{icon:'⌖',name:'Localização',detail:'Saber onde o aparelho está'}
};
const PERMISSION_PHASES = [
  {title:'A história falada',task:'Gravar a voz de Miau contando uma história.',needed:['microfone'],choices:['contatos','microfone','localizacao'],adult:'Vamos olhar o que a atividade precisa. Para gravar uma voz, o microfone pode fazer sentido. A lista de contatos e a localização não ajudam nessa história.',hint:'Queremos gravar uma voz. Qual acesso faz isso?'},
  {title:'O desenho na tela',task:'Desenhar uma estrela com o dedo e escolher a cor na própria tela.',needed:[],choices:['camera','localizacao','microfone','contatos'],adult:'Esta brincadeira de desenhar não precisa de câmera, microfone, contatos ou localização. Você pode continuar sem escolher nenhum acesso extra.',hint:'A estrela é desenhada com o dedo na tela. Ela precisa de algum destes acessos?'},
  {title:'O álbum da flor',task:'Tirar uma foto da flor de faz de conta e gravar uma legenda com a voz.',needed:['camera','microfone'],choices:['localizacao','camera','contatos','microfone'],adult:'São duas tarefas: tirar a foto e gravar uma voz. Podemos pensar em cada uma antes de escolher. Os contatos e a localização não são necessários para este álbum.',hint:'A tarefa tem duas partes: uma imagem e uma voz. Quais acessos combinam com elas?'}
];
function permissionCheck(cfg, chosen, helped) {
  if (!helped) return {good:false,text:'Um adulto pode ajudar a entender o pedido. Vamos conversar primeiro?'};
  if (chosen.some(id => !cfg.needed.includes(id))) return {good:false,text:'Um acesso escolhido não ajuda nessa atividade. Olhe a tarefa e tente retirar o que está sobrando.'};
  if (cfg.needed.some(id => !chosen.includes(id))) return {good:false,text:cfg.hint};
  return {good:true,text:'Cada acesso tem um motivo. Você combinou a escolha com a atividade!'};
}
function permissionsGame(a) {
  const cfg = PERMISSION_PHASES[requestedPhase(a.id)-1];
  let helped = false, chosen = [];
  gameShell(a,'Bit encontrou um aplicativo de faz de conta. Luma quer entender os pedidos antes de continuar. Vamos olhar a atividade juntos?','','','Um adulto ajuda a avaliar os acessos que um aplicativo pede. Escolher só o necessário para a atividade é um cuidado com a privacidade. Aqui, nenhum acesso real ao aparelho é solicitado.');
  function render(message,type,focus) {
    $('#game-stage').innerHTML = '<div class="stage-label"><span>A OFICINA DOS APLICATIVOS</span><span>MISSÃO ' + requestedPhase(a.id) + '</span></div><div class="app-phone"><div class="phone-top" aria-hidden="true"></div><div class="phone-illustration">' + expansionCardArt('permissoes') + '</div><h3>' + cfg.title + '</h3><p>' + cfg.task + '</p><div class="permission-pocket" aria-label="Acessos escolhidos">' + (chosen.length ? chosen.map(id => '<span>' + PERMISSION_TYPES[id].icon + ' ' + PERMISSION_TYPES[id].name + '</span>').join('') : '<span>Nenhum acesso extra escolhido</span>') + '</div></div><p class="aw-caption">Aplicativo inventado. A câmera e o microfone do aparelho ficam como estão.</p>';
    $('#game-panel').innerHTML = '<h2>O que ajuda nesta atividade?</h2><p>Peça uma pista a um adulto. Depois, toque nos cartões para escolher ou retirar acessos.</p><button class="button ' + (helped ? 'secondary' : 'primary') + ' adult-hint" id="permission-help">' + (helped ? 'Rever a pista do adulto ♡' : 'Pedir ajuda a um adulto ♡') + '</button>' + (helped ? '<p class="adult-note">' + cfg.adult + '</p>' : '') + '<div class="permission-options">' + cfg.choices.map(id => '<button class="permission-card ' + (chosen.includes(id) ? 'selected' : '') + '" data-permission="' + id + '" aria-pressed="' + chosen.includes(id) + '" ' + (!helped ? 'disabled' : '') + '><span aria-hidden="true">' + PERMISSION_TYPES[id].icon + '</span><strong>' + PERMISSION_TYPES[id].name + '</strong><small>' + PERMISSION_TYPES[id].detail + '</small></button>').join('') + '</div><button class="button primary run" id="permission-check" ' + (!helped ? 'disabled' : '') + '>Conferir os acessos ✓</button><div class="feedback ' + (type || '') + '" id="aw-feedback" role="status" aria-live="polite">' + (message || 'Pode escolher, retirar e tentar de novo.') + '</div>';
    $('#permission-help').onclick = () => { helped = true; render(cfg.adult,'', '#permission-help'); };
    $$('[data-permission]').forEach(button => button.onclick = () => { const id = button.dataset.permission; chosen = chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen,id]; render('', '', '[data-permission="' + id + '"]'); });
    $('#permission-check').onclick = () => {
      const result = permissionCheck(cfg,chosen,helped);
      if (!result.good) { awarenessStatus(result.text,'error'); return; }
      awarenessFinish(a,'Você ajudou a turma a pedir só os acessos que combinam com a atividade, com o apoio de um adulto. ' + (cfg.needed.length ? 'Cada acesso escolhido tem um propósito.' : 'Nesta atividade, nenhum acesso extra foi necessário!'),() => permissionsGame(a));
    };
    if (focus) $(focus)?.focus({preventScroll:true});
  }
  render();
}
const NETWORK_PHASES = [
  {place:'Na oficina',story:'Bit encontrou várias redes no quintal. Um nome conhecido não conta a história inteira. Quem pode ajudar?',adult:'Um adulto responsável confirmou e preparou a rede da oficina para esta atividade. A conexão combinada está marcada abaixo. Ele também ajuda a conectar.',confirmed:'oficina',portal:false,networks:[{id:'premio',name:'Quintal_Premio_Gratis'},{id:'oficina',name:'Quintal_da_Turma'},{id:'parecida',name:'Quintal_da_Turma_2'}]},
  {place:'Um passeio pela biblioteca',story:'A turma quer mostrar um desenho na biblioteca, mas ainda não combinou nenhuma conexão com o responsável pelo local.',adult:'Ainda não conseguimos confirmar uma rede adequada neste lugar. Podemos brincar sem conectar agora e procurar ajuda depois.',confirmed:'offline',portal:false,networks:[{id:'biblioteca',name:'Biblioteca_Gratis'},{id:'parecida',name:'Biblioteca_Visitantes'},{id:'rapida',name:'Internet_Super_Rapida'}]},
  {place:'De volta ao quintal',story:'Uma conexão foi combinada com um adulto. Mas uma tela pediu dados que não têm relação com a brincadeira. Vamos cuidar de cada etapa?',adult:'Um adulto confirmou a conexão da oficina e ajuda com o aparelho. Mesmo depois de escolher a rede, não precisamos preencher pedidos inesperados de dados.',confirmed:'oficina',portal:true,networks:[{id:'nova',name:'Quintal_da_Turma_Nova'},{id:'vizinho',name:'WiFi_do_Quintal'},{id:'oficina',name:'Quintal_da_Turma'}]}
];
function networkCheck(cfg,choice,helped) {
  if (choice === 'offline') return {good:true,portal:cfg.portal,text:'Tudo bem continuar sem conectar. A turma pode esperar e pedir apoio depois.'};
  if (!helped) return {good:false,text:'O nome e o cadeado não confirmam quem cuida de uma rede. Peça a confirmação de um adulto antes de escolher.'};
  if (choice !== cfg.confirmed) return {good:false,text:cfg.confirmed === 'offline' ? 'Ainda não há uma conexão confirmada. Dá para continuar a brincadeira sem conectar.' : 'Esta opção não foi a combinada com o adulto. Procure a rede marcada, sem decidir só pelo nome.'};
  return {good:true,portal:cfg.portal,text:'Uma escolha combinada com um adulto!'};
}
function networksGame(a) {
  const cfg = NETWORK_PHASES[requestedPhase(a.id)-1];
  let helped = false, portal = false, continuedOffline = false;
  gameShell(a,cfg.story,'','','Nomes conhecidos e cadeados não garantem, sozinhos, que uma rede seja confiável. Um adulto responsável ajuda a confirmar e escolher a conexão. Estas telas são de faz de conta: nenhum botão conecta ou altera a rede do aparelho.');
  function render(message,type,focus) {
    $('#game-stage').innerHTML = '<div class="stage-label"><span>A ANTENA DO BIT</span><span>MISSÃO ' + requestedPhase(a.id) + '</span></div><div class="network-scene"><div class="network-rings" aria-hidden="true">' + expansionCardArt('redes') + '</div><div class="network-bit">' + robotSVG() + '</div><h3>' + cfg.place + '</h3><p>' + (helped ? cfg.confirmed === 'offline' ? 'Ainda não há uma rede confirmada.' : 'Uma conexão foi combinada com um adulto.' : 'A antena encontrou nomes. Falta confirmar a conexão!') + '</p></div><p class="aw-caption">Antena e redes de faz de conta.</p>';
    if (portal) {
      $('#game-panel').innerHTML = '<h2>Opa! E este pedido?</h2><div class="pretend-portal"><span class="eyebrow">TELA INVENTADA</span><p>“Para mostrar seu desenho, conte seu endereço e a senha de outro jogo.”</p></div><div class="choices"><button class="choice" data-portal="stop">Parar e mostrar o pedido a um adulto.</button><button class="choice" data-portal="send">Preencher os dados para continuar.</button></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Pense no que esta atividade precisa.</div>';
      $$('[data-portal]').forEach(b => b.onclick = () => { if (b.dataset.portal !== 'stop') { awarenessStatus('Esses dados não ajudam a mostrar o desenho. A turma pode parar e pedir apoio.','error'); return; } awarenessFinish(a,(continuedOffline ? 'Você escolheu continuar sem conectar' : 'Você confirmou a conexão com um adulto') + ' e parou diante de um pedido inesperado de dados. Cada etapa merece cuidado!',() => networksGame(a)); });
      return;
    }
    $('#game-panel').innerHTML = '<h2>Qual é o próximo passo?</h2><p>Primeiro confirme com um adulto. Você também pode continuar sem conectar.</p><button class="button ' + (helped ? 'secondary' : 'primary') + ' adult-hint" id="network-ask">' + (helped ? 'Rever a confirmação ♡' : 'Pedir confirmação a um adulto ♡') + '</button>' + (helped ? '<p class="adult-note">' + cfg.adult + '</p>' : '') + '<div class="network-options">' + cfg.networks.map(n => '<button class="network-option" data-network="' + n.id + '"><span class="network-signal" aria-hidden="true">⌁</span><span><strong>' + n.name + '</strong><small>' + (helped && cfg.confirmed === n.id ? '✓ Combinada com um adulto' : 'Nome exibido na tela') + '</small></span><span class="network-lock" aria-hidden="true"><svg viewBox="0 0 24 30"><path d="M6 12V8a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" stroke-width="3"/><rect x="2" y="11" width="20" height="17" rx="4" fill="currentColor"/><circle cx="12" cy="18" r="2" fill="#fff8e9"/></svg></span></button>').join('') + '<button class="network-option offline-option" data-network="offline"><span aria-hidden="true">✦</span><span><strong>Continuar sem conectar</strong><small>A brincadeira pode esperar pela internet.</small></span></button></div><div class="feedback ' + (type || '') + '" id="aw-feedback" role="status" aria-live="polite">' + (message || 'Nome bonito e cadeado, sozinhos, não bastam.') + '</div>';
    $('#network-ask').onclick = () => { helped = true; render(cfg.adult,'', '#network-ask'); };
    $$('[data-network]').forEach(b => b.onclick = () => {
      const result = networkCheck(cfg,b.dataset.network,helped);
      if (!result.good) { awarenessStatus(result.text,'error'); return; }
      if (result.portal) { continuedOffline = b.dataset.network === 'offline'; portal = true; render(); return; }
      awarenessFinish(a,b.dataset.network === 'offline' ? 'Você percebeu que não precisava escolher uma rede sem confirmação. A turma pode brincar sem conectar e pedir ajuda depois.' : 'Você pediu apoio antes de escolher. O adulto confirmou a conexão e ajudou a turma a cuidar do aparelho.',() => networksGame(a));
    });
    if (focus) $(focus)?.focus({preventScroll:true});
  }
  render();
}
const PATTERN_PIECES = {
  estrela:{name:'Estrela',symbol:'✦',color:'gold'},lua:{name:'Lua',symbol:'☾',color:'purple'},folha:{name:'Folha',symbol:'❧',color:'green'},flor:{name:'Flor',symbol:'✿',color:'rose'},
  'estrela-azul':{name:'Estrela azul',symbol:'✦',color:'blue'},'lua-amarela':{name:'Lua amarela',symbol:'☾',color:'gold'},'flor-lilas':{name:'Flor lilás',symbol:'✿',color:'purple'}
};
const PATTERN_PHASES = [
  {title:'Um passo de cada vez',unit:['estrela','lua'],length:6,given:4,options:['lua','estrela','flor'],hint:'Olhe os dois primeiros desenhos. Estrela e lua se alternam.'},
  {title:'Três amigas na sequência',unit:['folha','flor','lua'],length:9,given:6,options:['lua','estrela','flor','folha'],hint:'O grupo tem três peças: folha, flor e lua. Depois ele começa outra vez.'},
  {title:'Vai e volta de formas e cores',unit:['estrela-azul','lua-amarela','lua-amarela','estrela-azul'],length:8,given:4,options:['lua-amarela','flor-lilas','estrela-azul'],hint:'O grupo é estrela azul, lua amarela, lua amarela, estrela azul. Repita esse grupo inteiro.'}
];
function expectedPatternPiece(cfg,index) { return cfg.unit[index % cfg.unit.length]; }
function patternsGame(a) {
  const cfg = PATTERN_PHASES[requestedPhase(a.id)-1];
  let chosen = [], crossed = false;
  gameShell(a,'A ponte do quintal perdeu algumas peças. Miau, Bit e Luma precisam da sua ideia para atravessar. Observe o começo e continue o padrão!','','','Um padrão tem uma regra que se repete. Observar o que já existe ajuda a prever o próximo passo. Você pode experimentar, voltar e construir outra vez.');
  function piece(id) { const p = PATTERN_PIECES[id]; return '<span class="pattern-symbol ' + p.color + '" aria-hidden="true">' + p.symbol + '</span><span class="pattern-name">' + p.name + '</span>'; }
  function render(message,type,focus) {
    const filled = cfg.given + chosen.length, complete = filled === cfg.length;
    $('#game-stage').innerHTML = '<div class="stage-label"><span>A PONTE DOS PADRÕES</span><span>' + chosen.length + ' DE ' + (cfg.length-cfg.given) + ' PEÇAS</span></div><h3 class="bridge-title">' + cfg.title + '</h3><div class="bridge-track" aria-label="Miau, Bit e Luma avançam conforme a ponte fica pronta"><div class="bridge-friends" style="left:calc((100% - 126px) * ' + (chosen.length/(cfg.length-cfg.given)) + ')"><span>' + catSVG() + '</span><span>' + robotSVG() + '</span><span>' + lumaSVG() + '</span></div></div><div class="bridge-water"><ol class="bridge-tiles bridge-size-' + cfg.length + '" aria-label="Sequência da ponte">' + Array.from({length:cfg.length},(_,i) => { const id = i < cfg.given ? expectedPatternPiece(cfg,i) : chosen[i-cfg.given]; return '<li class="bridge-tile ' + (id ? 'filled' : i === filled ? 'next' : '') + '" ' + (i === filled ? 'aria-current="step"' : '') + '><small>Passo ' + (i+1) + '</small>' + (id ? piece(id) : '<span class="pattern-empty">?</span><span class="pattern-name">' + (i === filled ? 'Sua próxima peça' : 'A completar') + '</span>') + '</li>'; }).join('') + '</ol></div><p class="aw-caption">Leia a sequência da esquerda para a direita, uma linha de cada vez.</p>';
    $('#game-panel').innerHTML = '<h2>' + (complete ? 'A ponte ficou pronta!' : 'Qual peça vem agora?') + '</h2><p>' + (complete ? 'Os amigos já podem chegar ao outro lado.' : 'Toque numa peça. O mesmo desenho pode aparecer mais de uma vez.') + '</p><div class="pattern-options">' + cfg.options.map(id => '<button class="pattern-option" data-pattern-option="' + id + '" ' + (complete ? 'disabled' : '') + '>' + piece(id) + '</button>').join('') + '</div><div class="path-edit-controls"><button id="pattern-undo" ' + (!chosen.length ? 'disabled' : '') + '>↶ Voltar uma peça</button><button id="pattern-clear" ' + (!chosen.length ? 'disabled' : '') + '>× Limpar minhas peças</button></div>' + (complete ? '<button class="button primary run" id="bridge-cross">Vamos atravessar! ↗</button>' : '') + '<div class="feedback ' + (type || '') + '" id="aw-feedback" role="status" aria-live="polite">' + (message || 'As primeiras peças contam a regra. Pode olhar com calma.') + '</div><details class="hint"><summary>Uma pista da Luma?</summary><p>' + cfg.hint + '</p></details>';
    $$('[data-pattern-option]').forEach(b => b.onclick = () => {
      if (crossed || complete) return;
      const id = b.dataset.patternOption;
      if (id !== expectedPatternPiece(cfg,filled)) { awarenessStatus('Essa peça mudou o padrão. ' + cfg.hint + ' Vamos tentar outra?','error'); return; }
      chosen.push(id); render('A turma avançou! Você encontrou mais uma peça.','success', cfg.given+chosen.length === cfg.length ? '#bridge-cross' : '[data-pattern-option="' + id + '"]');
    });
    $('#pattern-undo').onclick = () => { chosen.pop(); render('A última peça saiu. Vamos observar o padrão de novo?'); };
    $('#pattern-clear').onclick = () => { chosen = []; render('O começo da ponte continua. Suas peças podem ganhar uma nova tentativa!'); };
    const cross = $('#bridge-cross'); if (cross) cross.onclick = () => { if (crossed) return; crossed = true; awarenessFinish(a,'Miau, Bit e Luma chegaram juntos! Você encontrou a regra e continuou a sequência da ponte.',() => patternsGame(a)); };
    if (focus) { const output = $(focus); output?.setAttribute('tabindex','-1'); output?.focus({preventScroll:true}); }
  }
  render();
}
const expansionGames = {permissoes:permissionsGame,redes:networksGame,padroes:patternsGame};
