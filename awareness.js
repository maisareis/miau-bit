'use strict';

const awarenessAdventures = [
  {id:'mochila', tag:'SEGURANÇA DIGITAL · PRIVACIDADE', title:'A mochila dos segredos', description:'Ajude Bit a guardar com carinho as informações que merecem cuidado.', time:'5 min', skill:'Cuidar dos dados', medal:'Protetor dos segredos', symbol:'♧', filter:'proteger', category:'SEGURANÇA DIGITAL'},
  {id:'correio', tag:'SEGURANÇA DIGITAL · MENSAGENS', title:'O correio do quintal', description:'Chegaram cartas à oficina! Algumas precisam da ajuda de um adulto.', time:'5 min', skill:'Perceber pistas', medal:'Carteiro cuidadoso', symbol:'✉', filter:'proteger', category:'SEGURANÇA DIGITAL'},
  {id:'boatos', tag:'SEGURANÇA DIGITAL · INVESTIGAÇÃO', title:'O robô que acreditava em tudo', description:'Nuvens de algodão-doce? Investigue essa notícia com a turma!', time:'5 min', skill:'Conferir antes de compartilhar', medal:'Detetive das notícias', symbol:'⌕', filter:'proteger', category:'SEGURANÇA DIGITAL'},
  {id:'amizade', tag:'SEGURANÇA DIGITAL · RESPEITO', title:'A ponte da amizade', description:'Pequenas atitudes de carinho podem unir o quintal outra vez.', time:'5 min', skill:'Acolher e pedir ajuda', medal:'Construtor de amizade', symbol:'♡', filter:'proteger', category:'SEGURANÇA DIGITAL'},
  {id:'amigo', tag:'SEGURANÇA DIGITAL · JOGOS', title:'O novo amigo do jogo', description:'Colete estrelas com Bit e cuide dos seus segredos durante a missão.', time:'5 min', skill:'Brincar com cuidado', medal:'Explorador cuidadoso', symbol:'✦', filter:'proteger', category:'SEGURANÇA DIGITAL'}
];

function awarenessCardArt(id) {
  const drawings = {
    mochila:'<path d="M99 43v-8a26 26 0 0 1 52 0v8" fill="none" stroke="#3d7d6b" stroke-width="9"/><rect x="73" y="39" width="104" height="111" rx="28" fill="#3d8c79"/><path d="M82 73h86" stroke="#205c50" stroke-width="4"/><rect x="86" y="91" width="78" height="45" rx="13" fill="#f8d575"/><rect x="113" y="101" width="25" height="22" rx="5" fill="#e5ae56"/><path d="M118 102v-5a7 7 0 0 1 14 0v5" stroke="#925c34" stroke-width="3" fill="none"/><path d="M43 48v14M36 55h14M201 104v13M195 110h13" stroke="#df995a" stroke-width="3" stroke-linecap="round"/>',
    correio:'<rect x="45" y="41" width="122" height="85" rx="23" fill="#438879"/><path d="M106 42v84" stroke="#226251" stroke-width="3"/><path d="M64 73h30" stroke="#fff0c5" stroke-width="5" stroke-linecap="round"/><path d="M107 125v24" stroke="#967d5e" stroke-width="10"/><path d="M151 64V23h29v18h-25" fill="#eb8850" stroke="#c06f3d" stroke-width="3"/><rect x="119" y="88" width="77" height="52" rx="6" fill="#fff5d9" stroke="#bfac79" stroke-width="2"/><path d="M120 90l37 27 37-27" fill="none" stroke="#bfac79" stroke-width="2"/><path d="M202 41v14M195 48h14" stroke="#df995a" stroke-width="3" stroke-linecap="round"/>',
    boatos:'<rect x="39" y="30" width="147" height="109" rx="11" fill="#fff7df" stroke="#b4a3ba" stroke-width="2"/><path d="M55 49h88M55 59h58M55 116h65M55 125h82" stroke="#b8b4ba" stroke-width="4" stroke-linecap="round"/><path d="M62 92a13 13 0 0 1 14-18 18 18 0 0 1 33 0 13 13 0 0 1 12 21H62z" fill="#b6cdd0"/><circle cx="168" cy="92" r="28" fill="#f9eabc90" stroke="#6b5e8d" stroke-width="7"/><path d="M188 113l24 27" stroke="#6b5e8d" stroke-width="10" stroke-linecap="round"/><path d="M215 30v12M209 36h12" stroke="#dd9c60" stroke-width="3" stroke-linecap="round"/>',
    amizade:'<path d="M0 121q95-38 250 0v39H0z" fill="#97b8b9"/><path d="M20 101q105-78 210 0" fill="none" stroke="#b09161" stroke-width="12"/><path d="M40 89v43M80 72v45M122 66v46M164 72v45M207 89v43" stroke="#d9b777" stroke-width="13"/><path d="M23 91q104-77 204 0" stroke="#7d956a" stroke-width="5" fill="none"/><path d="M124 48c-32-19-19-45 0-29 19-16 32 10 0 29" fill="#e58b67"/>',
    amigo:'<rect x="35" y="41" width="181" height="91" rx="35" fill="#398776"/><path d="M65 65v38M46 84h38" stroke="#f8e9bb" stroke-width="10" stroke-linecap="round"/><circle cx="177" cy="71" r="8" fill="#f3d16f"/><circle cx="193" cy="90" r="8" fill="#ed9663"/><circle cx="161" cy="90" r="8" fill="#b2c9bc"/><path d="M126 52l5 11 12 2-9 8 2 12-10-6-11 6 2-12-9-8 12-2z" fill="#f4d47b"/><path d="M115 99h24" stroke="#245f50" stroke-width="5" stroke-linecap="round"/><path d="M201 17v12M195 23h12M28 137v12M22 143h12" stroke="#df995a" stroke-width="3" stroke-linecap="round"/>'
  };
  return `<svg class="art-svg" viewBox="0 0 250 160" aria-hidden="true">${drawings[id]}</svg>`;
}

function awarenessStatus(message, type='') {
  const status=$('#aw-feedback');
  status.className=`feedback ${type}`;
  status.textContent=message;
}

function awarenessFinish(a, message, replay) {
  award(a.id);
  $('#game-stage').classList.add('aw-game-complete');
  $$('#game-stage button').forEach(b=>{b.disabled=true;b.draggable=false;});
  $('#game-panel').innerHTML=`<span class="eyebrow">UMA NOVA DESCOBERTA</span><h2 class="aw-win-title">${a.medal}!</h2><p>${message}</p><div class="feedback success" role="status">Você encontrou mais uma estrela para o seu bolso! ✦</div>${nextLinks()}<button class="text-button" id="aw-replay">↶ Brincar de novo</button>`;
  $('#aw-replay').onclick=replay;
}

function backpackGame(a) {
  const cards=[
    {id:'senha',icon:'♧',label:'Senha da oficina',place:'guardado',tip:'A senha merece um bolso protegido. Ela não vai para um mural público!'},
    {id:'desenho',icon:'✦',label:'Desenho de uma estrela',place:'mural',tip:'Esse desenho inventado não conta quem somos nem onde moramos.'},
    {id:'endereco',icon:'⌂',label:'Endereço da casa de Bit',place:'guardado',tip:'O endereço de casa é pessoal. Vamos guardá-lo e pedir ajuda antes de compartilhar.'},
    {id:'apelido',icon:'☄',label:'Apelido inventado: RobôCometa',place:'mural',tip:'Um apelido inventado pode ajudar Bit a brincar sem mostrar seu nome completo.'},
    {id:'foto',icon:'▧',label:'Foto com o nome da escola',place:'guardado',tip:'Essa foto conta onde Bit estuda. Um adulto de confiança pode ajudar a cuidar dela.'},
    {id:'foguete',icon:'↗',label:'Desenho de um foguete',place:'mural',tip:'Nesse desenho só há um foguete imaginário. Nenhuma informação pessoal escondida!'}
  ];
  let selected=null;
  const placed=new Map();
  gameShell(a,'Bit arrumou uma mochila para passear pelo mundo digital! Alguns cartões podem ir para o mural de brincadeiras. Outros contam segredos da turma. Vamos ajudar a separar?', '', '', 'Senhas, endereço e fotos que mostram onde você estuda merecem cuidado. Antes de compartilhar informações pessoais, peça ajuda a um adulto de confiança. Todos os cartões desta brincadeira são inventados.');
  function render(message='Toque em um cartão. Depois, escolha onde ele fica.',type='') {
    $('#game-stage').innerHTML=`<div class="stage-label"><span>OS CARTÕES DA MOCHILA</span><span>${placed.size} DE ${cards.length}</span></div><div class="aw-card-grid">${cards.map(c=>`<button class="aw-item ${placed.has(c.id)?'aw-placed':''} ${selected===c.id?'aw-picked':''}" data-pack-card="${c.id}" draggable="${!placed.has(c.id)}" aria-pressed="${selected===c.id}" ${placed.has(c.id)?'disabled':''}><span class="aw-item-icon" aria-hidden="true">${placed.has(c.id)?'✓':c.icon}</span><span>${c.label}</span>${placed.has(c.id)?`<small>${placed.get(c.id)==='guardado'?'No bolso protegido':'No mural'}</small>`:''}</button>`).join('')}</div><div class="aw-drop-grid">${[['guardado','♧','Bolso protegido'],['mural','✦','Mural de brincadeiras']].map(([id,icon,label])=>`<button class="aw-drop" data-pack-place="${id}" aria-label="Colocar cartão no ${label.toLowerCase()}"><span aria-hidden="true">${icon}</span><b>${label}</b><small>${[...placed.values()].filter(v=>v===id).length} ${[...placed.values()].filter(v=>v===id).length===1?'cartão':'cartões'}</small></button>`).join('')}</div><p class="aw-caption">Você também pode arrastar os cartões. Não escreva dados reais.</p>`;
    $('#game-panel').innerHTML=`<h2>Um lugar para cada cartão</h2><p>O mural é visto por todo mundo. O bolso protege as informações pessoais de Bit.</p><div class="aw-buddy">${robotSVG()}<p>“Bip-bip! Pode me ajudar a cuidar dos meus segredos?”</p></div><div class="feedback ${type}" id="aw-feedback" role="status" aria-live="polite">${message}</div><details class="hint"><summary>Uma pista do Miau?</summary><p>Senha, endereço e a foto com o nome da escola ficam no bolso protegido. Os desenhos e o apelido inventado podem ir para o mural desta brincadeira.</p></details>`;
    $$('[data-pack-card]').forEach(b=>{b.onclick=()=>{selected=b.dataset.packCard;$$('[data-pack-card]').forEach(x=>{x.classList.toggle('aw-picked',x===b);x.setAttribute('aria-pressed',String(x===b));});awarenessStatus(`Você escolheu: ${cards.find(c=>c.id===selected).label}. Agora, toque num dos dois lugares.`);};b.ondragstart=e=>{selected=b.dataset.packCard;e.dataTransfer.setData('text/plain',selected);e.dataTransfer.effectAllowed='move';b.classList.add('aw-picked');};});
    $$('[data-pack-place]').forEach(b=>{b.onclick=()=>place(b.dataset.packPlace);b.ondragover=e=>{e.preventDefault();b.classList.add('aw-drop-over');};b.ondragleave=()=>b.classList.remove('aw-drop-over');b.ondrop=e=>{e.preventDefault();b.classList.remove('aw-drop-over');const id=e.dataTransfer.getData('text/plain');if(cards.some(c=>c.id===id)&&!placed.has(id)){selected=id;place(b.dataset.packPlace);}};});
  }
  function place(destination) {
    const c=cards.find(x=>x.id===selected);
    if(!c||placed.has(c.id)){awarenessStatus('Primeiro, escolha um cartão que ainda está na mochila.');return;}
    if(c.place!==destination){awarenessStatus(c.place==='guardado'?`Vamos pensar mais um pouquinho. ${c.tip}`:'Esse cartão é de faz de conta e não mostra dados pessoais. Ele pode enfeitar o mural!','error');return;}
    placed.set(c.id,destination);selected=null;render(c.tip,'success');
    if(placed.size===cards.length)awarenessFinish(a,'Mochila pronta! Você ajudou Bit a perceber quais cartões merecem um bolso protegido.',()=>backpackGame(a));
  }
  render();
}

function mailboxGame(a) {
  const letters=[
    {from:'Um remetente que Bit não conhece',text:'Você ganhou mil moedas! Escreva sua senha para receber agora.',adult:true,why:'Um prêmio pedindo senha é motivo para parar. Bit não responde e mostra a mensagem a um adulto.'},
    {from:'Um bilhete da brincadeira combinada com a família',text:'Hoje vamos desenhar foguetes na oficina. Escolha uma cor bem bonita!',adult:false,why:'É o recado da atividade que a família já combinou. Não há link, pedido de segredo ou dados pessoais.'},
    {from:'Uma mensagem durante um jogo',text:'Mande o código que chegou no seu celular para eu liberar uma fase.',adult:true,why:'Códigos também protegem contas. Bit não envia o código e pede ajuda a um adulto de confiança.'},
    {from:'O mural de desenhos da oficina',text:'Qual será o nome do nosso planeta imaginário? Que tal Planeta Pipoca?',adult:false,why:'Essa é uma pergunta sobre a história inventada da turma. Ela não pede nenhuma informação pessoal.'},
    {from:'Uma mensagem que deixou Bit desconfortável',text:'Não conte esta conversa para ninguém, nem para a sua família.',adult:true,why:'Bit pode contar o que o deixou desconfortável. Pedir ajuda é um cuidado, e ele não precisa guardar esse segredo.'}
  ];
  let index=0,answered=false;const sorted=[];
  gameShell(a,'Toc-toc! O correio chegou à oficina. Bit precisa organizar cinco mensagens de faz de conta. Algumas são recados da brincadeira; outras merecem a ajuda de um adulto de confiança.', '', '', 'Observe o que uma mensagem pede, mesmo que o nome do remetente pareça conhecido. Pedidos de senha, código ou segredo merecem uma pausa e a ajuda de um adulto. Na dúvida, também pode pedir ajuda!');
  function render() {
    answered=false;const l=letters[index];
    $('#game-stage').innerHTML=`<div class="stage-label"><span>CORREIO DE FAZ DE CONTA</span><span>CARTA ${index+1} DE ${letters.length}</span></div><div class="aw-letter"><span class="aw-envelope" aria-hidden="true">✉</span><p class="aw-from">${l.from}</p><p class="aw-letter-text">“${l.text}”</p></div><div class="aw-stamps" aria-label="${sorted.length} de ${letters.length} cartas organizadas">${letters.map((_,n)=>`<span class="${n<sorted.length?'aw-stamped':''}" aria-hidden="true">${n<sorted.length?'✓':'✉'}</span>`).join('')}</div><p class="aw-caption">Mensagens inventadas. Nenhum link abre de verdade.</p>`;
    $('#game-panel').innerHTML='<h2>Para onde vai essa carta?</h2><p>Leia a mensagem com calma. O que ela está pedindo?</p><div class="choices"><button class="choice" data-mail-place="recado"><span aria-hidden="true">✉</span>Guardar com os recados da brincadeira</button><button class="choice" data-mail-place="adulto"><span aria-hidden="true">♡</span>Mostrar a um adulto de confiança</button></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Pode tentar de novo. Bit está aprendendo com você!</div><div id="aw-mail-next"></div>';
    $$('[data-mail-place]').forEach(b=>b.onclick=()=>{if(answered)return;const choseAdult=b.dataset.mailPlace==='adulto';if(choseAdult!==l.adult){awarenessStatus(l.adult?'Essa carta pede um segredo, uma senha ou um código. Bit pode parar e procurar ajuda. Tente o outro lugar.':'Pedir ajuda é sempre permitido! Este recado faz parte da brincadeira e não pede dados. Para organizar o correio, coloque-o com os recados.','error');return;}answered=true;sorted.push(choseAdult);$$('[data-mail-place]').forEach(x=>x.disabled=true);b.classList.add('selected');awarenessStatus(l.why,'success');$('.aw-stamps').innerHTML=letters.map((_,n)=>`<span class="${n<sorted.length?'aw-stamped':''}" aria-hidden="true">${n<sorted.length?'✓':'✉'}</span>`).join('');$('.aw-stamps').setAttribute('aria-label',`${sorted.length} de ${letters.length} cartas organizadas`);$('#aw-mail-next').innerHTML=`<button class="button primary run" id="aw-open-letter">${index===letters.length-1?'Entregar o correio':'Abrir a próxima carta'} <span aria-hidden="true">→</span></button>`;$('#aw-open-letter').onclick=()=>{index++;if(index<letters.length)render();else awarenessFinish(a,'As cinco cartas chegaram ao lugar certo. Você ajudou Bit a perceber quando uma mensagem precisa de cuidado!',()=>mailboxGame(a));};});
  }
  render();
}

function rumorsGame(a) {
  const clues=[
    {id:'imagem',icon:'▧',label:'Olhar a imagem',title:'Essa foto é de uma festa!',text:'A legenda original diz “algodão-doce no palito”. A foto sozinha não prova que as nuvens mudaram.'},
    {id:'origem',icon:'⌕',label:'Procurar a origem',title:'Quem conferiu a história?',text:'A mensagem foi repassada, mas não diz quem verificou. Repassar muitas vezes não transforma uma história em verdade.'},
    {id:'data',icon:'◷',label:'Conferir a data',title:'A foto não é de hoje!',text:'A data da foto é da festa do ano passado. Ela não mostra o que aconteceu hoje no céu do quintal.'}
  ];
  const found=new Set();
  gameShell(a,'“As nuvens viraram algodão-doce!”, leu Bit. Ele já quer contar para todo mundo! Miau pegou sua lupa: “Vamos procurar pistas antes?” Toque nos três botões de investigação.', '', '', 'Uma imagem bonita e uma mensagem muito repetida não confirmam uma notícia. Procure a origem, observe o contexto e peça a ajuda de um adulto de confiança antes de compartilhar.');
  function render(message='Escolha uma pista para começar a investigação.',type='') {
    $('#game-stage').innerHTML=`<div class="stage-label"><span>UMA NOTÍCIA DE FAZ DE CONTA</span><span>${found.size} DE 3 PISTAS</span></div><article class="aw-news"><span class="eyebrow">REPASSARAM PARA BIT</span><h2>As nuvens do quintal viraram algodão-doce!</h2><svg viewBox="0 0 380 150" class="aw-news-picture" role="img" aria-label="Desenho de algodão-doce num palito, usado numa mensagem sobre nuvens."><rect width="380" height="150" rx="12" fill="#dbe8ef"/><path d="M30 123q135-39 320 0v27H30z" fill="#9fba9c"/><path d="M188 76v62" stroke="#aa8863" stroke-width="8" stroke-linecap="round"/><path d="M142 66a24 24 0 0 1 18-39 34 34 0 0 1 61 0 25 25 0 0 1 18 39c9 26-28 38-50 28-25 12-54-3-47-28" fill="#e8c5b7"/><path d="M45 37a10 10 0 0 1 12-14 15 15 0 0 1 27 0 10 10 0 0 1 10 14zM276 53a10 10 0 0 1 12-14 15 15 0 0 1 27 0 10 10 0 0 1 10 14z" fill="#fffaf0"/></svg><p>Será? A turma ainda não conferiu essa história.</p></article><div class="aw-clue-buttons">${clues.map(c=>`<button class="aw-clue ${found.has(c.id)?'aw-found':''}" data-clue="${c.id}" aria-pressed="${found.has(c.id)}"><span aria-hidden="true">${found.has(c.id)?'✓':c.icon}</span>${c.label}</button>`).join('')}</div>`;
    $('#game-panel').innerHTML=`<h2>Lupa em ação!</h2><p>Investigue as três pistas e ajude Bit a decidir o próximo passo.</p><div class="aw-clue-log">${found.size?clues.filter(c=>found.has(c.id)).map(c=>`<article><h3>✓ ${c.title}</h3><p>${c.text}</p></article>`).join(''):'<p class="aw-caption">As pistas encontradas vão aparecer aqui.</p>'}</div><div class="feedback ${type}" id="aw-feedback" role="status" aria-live="polite">${message}</div>${found.size===3?'<div class="choices"><button class="choice" id="aw-share-rumor"><span aria-hidden="true">↗</span>Compartilhar a notícia agora</button><button class="choice" id="aw-check-rumor"><span aria-hidden="true">⌕</span>Pedir ajuda para conferir antes</button></div>':''}`;
    $$('[data-clue]').forEach(b=>b.onclick=()=>{const c=clues.find(x=>x.id===b.dataset.clue);found.add(c.id);render(found.size===3?'Três pistas encontradas! Elas ainda não confirmam a notícia. O que Bit pode fazer agora?':c.text,found.size===3?'success':'');});
    if(found.size===3){$('#aw-share-rumor').onclick=()=>awarenessStatus('Espere um pouquinho, Bit! As pistas não confirmam a notícia. Vamos conferir com um adulto antes de repassar.','error');$('#aw-check-rumor').onclick=()=>awarenessFinish(a,'Bip-bip! Bit guardou a notícia por enquanto e foi conferir com um adulto. Investigar antes de repassar é uma grande descoberta.',()=>rumorsGame(a));}
  }
  render();
}

function friendshipGame(a) {
  const actions=[
    {id:'acolher',text:'Dizer: “Você pode contar comigo.”',correct:true,tip:'Acolher ajuda Miau a perceber que não está sozinho.'},
    {id:'repassar',text:'Repassar a mensagem para rir.',correct:false,tip:'Repassar a ofensa pode machucar Miau de novo. Vamos procurar uma atitude de apoio?'},
    {id:'adulto',text:'Procurar um adulto de confiança.',correct:true,tip:'Um adulto pode escutar, acolher e ajudar a cuidar do que aconteceu.'},
    {id:'ofender',text:'Responder com outra ofensa.',correct:false,tip:'Outra ofensa pode aumentar a briga. Podemos apoiar Miau e pedir ajuda sem machucar ninguém.'},
    {id:'brincar',text:'Convidar Miau para brincar junto.',correct:true,tip:'Um convite gentil ajuda a turma a ficar perto de Miau.'},
    {id:'proteger',text:'Pedir ajuda para bloquear ou denunciar.',correct:true,tip:'Com a ajuda de um adulto, a turma pode usar as ferramentas do jogo para se proteger.'}
  ];
  const chosen=new Set();
  gameShell(a,'Miau mostrou um desenho no jogo, mas recebeu uma mensagem que o deixou triste. No quintal da imaginação, a ponte da amizade perdeu quatro tábuas. Quais atitudes podem ajudar a reconstruí-la?', '', '', 'Quem recebe ofensas não tem culpa. Você pode apoiar a pessoa, não espalhar a agressão e pedir ajuda a um adulto de confiança. Bloquear ou denunciar, com ajuda, também pode proteger a turma.');
  function render(message='Cada atitude de apoio coloca uma tábua na ponte.',type='') {
    $('#game-stage').innerHTML=`<div class="stage-label"><span>UM QUINTAL COM MAIS CARINHO</span><span>${chosen.size} DE 4 TÁBUAS</span></div><div class="aw-river ${chosen.size===4?'aw-bridge-ready':''}"><span class="aw-bank aw-bank-left"></span><span class="aw-bank aw-bank-right"></span><div class="aw-friend aw-cat">${catSVG()}</div><div class="aw-friend aw-robot">${robotSVG()}</div><div class="aw-bridge" aria-label="${chosen.size} de 4 tábuas reconstruídas">${[0,1,2,3].map(n=>`<span class="aw-plank ${n<chosen.size?'aw-repaired':''}">${n<chosen.size?'♡':''}</span>`).join('')}</div><span class="aw-river-wave" aria-hidden="true">∿ ∿ ∿ ∿ ∿</span></div><p class="aw-caption">Uma ponte de faz de conta para lembrar que ninguém precisa ficar sozinho.</p>`;
    $('#game-panel').innerHTML=`<h2>Que atitude aproxima a turma?</h2><p>Encontre quatro jeitos de apoiar Miau.</p><div class="aw-actions">${actions.map(x=>`<button class="aw-action ${chosen.has(x.id)?'aw-helpful':''}" data-kindness="${x.id}" ${chosen.has(x.id)?'disabled':''}><span aria-hidden="true">${chosen.has(x.id)?'✓':'♡'}</span>${x.text}</button>`).join('')}</div><div class="feedback ${type}" id="aw-feedback" role="status" aria-live="polite">${message}</div>`;
    $$('[data-kindness]').forEach(b=>b.onclick=()=>{const x=actions.find(c=>c.id===b.dataset.kindness);if(!x.correct){awarenessStatus(x.tip,'error');return;}chosen.add(x.id);render(x.tip,'success');if(chosen.size===4)awarenessFinish(a,'A ponte ficou pronta! Miau encontrou apoio nos amigos e em um adulto de confiança. A turma pode brincar junta de novo.',()=>friendshipGame(a));});
  }
  render();
}

function gamingFriendGame(a) {
  const stops=[
    {title:'Uma equipe nova',from:'Um jogador que Bit acabou de conhecer',message:'“Oi! Qual é seu nome completo e em qual escola você estuda?”',choices:[{text:'Contar o nome completo e a escola.',good:false},{text:'Usar só um apelido inventado e guardar os dados.',good:true}],why:'Um apelido inventado ajuda a brincar sem revelar o nome completo ou a escola. Podemos continuar cuidando dos nossos dados.'},
    {title:'O mapa do tesouro',from:'O mesmo jogador fez outro pedido',message:'“Me passa o endereço da sua casa para eu mandar um presente!”',choices:[{text:'Não passar o endereço e mostrar o pedido a um adulto.',good:true},{text:'Mandar o endereço para ganhar o presente.',good:false}],why:'Bit guarda o endereço e mostra o pedido a um adulto de confiança. Um presente não é motivo para contar onde mora.'},
    {title:'Uma conversa em segredo',from:'Um convite fora do jogo',message:'“Vamos para outro aplicativo. Mas não conte para ninguém!”',choices:[{text:'Ir para outro aplicativo sem contar.',good:false},{text:'Parar a conversa e procurar um adulto de confiança.',good:true}],why:'Bit não precisa seguir um convite em segredo. Ele pode parar, procurar um adulto e pedir ajuda para bloquear ou denunciar, se necessário.'}
  ];
  let point=0,open=false,answered=false;
  gameShell(a,'Bit entrou no jogo “Planeta Pipoca” com o apelido RobôCometa. Há três estrelas no mapa! Durante a missão, outro jogador começa a conversar. Ajude Bit a explorar e cuidar dos seus segredos.', '', '', 'No jogo, uma pessoa desconhecida continua sendo alguém que você ainda não conhece, mesmo quando parece gentil. Guarde seus dados, evite convites em segredo e procure um adulto de confiança quando precisar.');
  function render() {
    $('#game-stage').innerHTML=`<div class="stage-label"><span>PLANETA PIPOCA · FAZ DE CONTA</span><span>${point} DE 3 ESTRELAS</span></div><div class="aw-game-map"><svg viewBox="0 0 420 270" preserveAspectRatio="none" aria-hidden="true"><path d="M38 220Q60 60 156 99T286 173 382 55" fill="none" stroke="#c3d1b7" stroke-width="32" stroke-linecap="round"/><path d="M38 220Q60 60 156 99T286 173 382 55" fill="none" stroke="#739780" stroke-width="2" stroke-dasharray="5 9"/><ellipse cx="320" cy="35" rx="32" ry="12" fill="#eff0d4"/><ellipse cx="58" cy="55" rx="30" ry="12" fill="#eff0d4"/></svg><div class="aw-map-avatar" style="--stop:${point}">${robotSVG()}</div>${stops.map((s,n)=>`<button class="aw-map-star aw-map-star-${n+1} ${n<point?'aw-collected':''}" data-game-stop="${n}" aria-label="${n<point?'Estrela '+(n+1)+' conquistada':'Explorar estrela '+(n+1)}" ${n!==point||open?'disabled':''}><span aria-hidden="true">${n<point?'✓':'✦'}</span></button>`).join('')}<span class="aw-map-name">RobôCometa · apelido inventado</span></div><p class="aw-caption">${point===3?'Missão concluída! As três estrelas estão com a turma.':'Toque na próxima estrela para continuar a missão.'}</p>`;
    if(!open){$('#game-panel').innerHTML=`<h2>${point===0?'Uma missão entre as estrelas!':'Mais uma estrela no mapa!'}</h2><p>${point===0?'Bit escolheu um apelido inventado para brincar. Toque na estrela 1 e acompanhe sua aventura.':`Você ajudou Bit a cuidar dos seus dados. A estrela ${point+1} está esperando!`}</p><div class="aw-buddy">${robotSVG()}<p>“Bip-bip! Meus dados ficam guardadinhos. Minha imaginação pode viajar!”</p></div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">As conversas desta missão são de faz de conta.</div>`;}else{const s=stops[point];$('#game-panel').innerHTML=`<span class="eyebrow">PARADA ${point+1} · ${s.title}</span><h2 class="aw-win-title">Um papo durante a missão</h2><div class="aw-game-chat"><small>${s.from}</small><p>${s.message}</p></div><p>O que Bit pode fazer?</p><div class="choices">${s.choices.map((c,n)=>`<button class="choice" data-game-reply="${n}">${c.text}</button>`).join('')}</div><div class="feedback" id="aw-feedback" role="status" aria-live="polite">Pode pensar com calma. Seus segredos merecem cuidado.</div><div id="aw-game-next"></div>`;$$('[data-game-reply]').forEach(b=>b.onclick=()=>{if(answered)return;const choice=s.choices[Number(b.dataset.gameReply)];if(!choice.good){awarenessStatus('Vamos cuidar de Bit? Ele pode guardar suas informações e pedir ajuda a um adulto de confiança. Experimente a outra atitude.','error');return;}answered=true;b.classList.add('selected');$$('[data-game-reply]').forEach(x=>x.disabled=true);awarenessStatus(s.why,'success');$('#aw-game-next').innerHTML=`<button class="button primary run" id="aw-return-map">${point===2?'Concluir a missão':'Voltar ao mapa'} <span aria-hidden="true">✦</span></button>`;$('#aw-return-map').onclick=()=>{point++;open=false;answered=false;if(point===3){render();awarenessFinish(a,'Três estrelas e muitos cuidados! Bit brincou com seu apelido inventado, guardou seus dados e encontrou ajuda quando precisou.',()=>gamingFriendGame(a));}else render();};});}
    $$('[data-game-stop]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.gameStop)!==point||open)return;open=true;answered=false;render();});
  }
  render();
}

const awarenessGames={mochila:backpackGame,correio:mailboxGame,boatos:rumorsGame,amizade:friendshipGame,amigo:gamingFriendGame};
