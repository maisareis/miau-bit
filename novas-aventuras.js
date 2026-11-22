'use strict';
// Cinco aventuras independentes. As fases usam as mesmas chaves de progresso do portal.
const newGames = {
  fabrica: factoryGame, jardim: gardenGame, biblioteca: libraryGame,
  oceano: oceanGame, pinball: pinballGame
};
function newFinish(a, text, replay) { awarenessFinish(a, text, replay); }
function newStage(a, story, note) {
  gameShell(a, story, '', '', note);
  $('#game-stage').classList.add('new-adventure-stage','new-'+a.id);
  $('#game-panel').classList.add('new-adventure-panel');
}
function newFeedback(text, good=false) { const e=$('#new-feedback'); if(e){e.textContent=text;e.className='new-feedback '+(good?'good':'');} }
function factoryGame(a) {
  const phase=requestedPhase(a.id), len=Math.min(8,3+Math.floor(phase/2));
  const cmds=['➡️','⬆️','⬇️']; let sequence=[];
  const target=Array.from({length:len},(_,i)=>cmds[(i*3+phase+Math.floor(i/2))%3]);
  newStage(a,'As esteiras da fábrica precisam de comandos! Observe o projeto e monte a sequência para o robô levar as peças até a máquina.','Planejar uma sequência e testar comandos são passos importantes da programação.');
  function draw(){
    $('#game-stage').innerHTML='<div class="new-scene factory-scene"><div class="scene-top">⚙️ OFICINA DE INVENÇÕES <span>FASE '+phase+'/10</span></div><div class="factory-machine">🤖 <span class="factory-belt">⚙️ 📦 ⚙️ 📦 ⚙️</span> 🧸</div><p>Projeto da máquina</p><div class="new-sequence">'+target.map(x=>'<span>'+x+'</span>').join('')+'</div><p>Seus comandos</p><div class="new-sequence player">'+Array.from({length:len},(_,i)=>'<span>'+(sequence[i]||'·')+'</span>').join('')+'</div></div>';
    $('#game-panel').innerHTML='<h2>Programe a esteira</h2><p>Toque nas setas na mesma ordem do projeto. Você pode desfazer e tentar de novo.</p><div class="new-controls">'+cmds.map((c,i)=>'<button type="button" data-cmd="'+i+'">'+c+'</button>').join('')+'</div><div class="new-controls"><button type="button" id="new-undo">↶ Desfazer</button><button type="button" id="new-run" '+(sequence.length<len?'disabled':'')+'>▶ Ligar máquina</button></div><p id="new-feedback" class="new-feedback" role="status">'+sequence.length+' de '+len+' comandos</p>';
    $$('[data-cmd]').forEach(b=>b.onclick=()=>{if(sequence.length<len){sequence.push(cmds[Number(b.dataset.cmd)]);draw();}});
    $('#new-undo').onclick=()=>{sequence.pop();draw();};
    $('#new-run').onclick=()=>{if(sequence.join('|')===target.join('|'))newFinish(a,'A máquina funcionou! Você organizou os comandos e criou um brinquedo novo.',()=>factoryGame(a));else{sequence=[];draw();newFeedback('O robô fez um caminho diferente. Confira o projeto e tente de novo.');}};
  } draw();
}
function gardenGame(a) {
  const phase=requestedPhase(a.id), flowers=['🌷','🌻','🌼','🌺','🌸'], count=Math.min(8,3+Math.floor(phase/2));
  const seed=phase%flowers.length, target=Array.from({length:count},(_,i)=>flowers[(seed+i*(phase%2+1))%flowers.length]); let planted=[];
  newStage(a,'Luma encontrou um canteiro que precisa recuperar suas cores. Plante as flores na ordem das placas mágicas!','Observar regularidades, comparar e experimentar ajuda a reconhecer padrões.');
  function draw(){
    $('#game-stage').innerHTML='<div class="new-scene garden-scene"><div class="scene-top">🌸 JARDIM DA LUMA <span>FASE '+phase+'/10</span></div><div class="garden-sun">☀️　☁️　🦋</div><p>Flores do projeto</p><div class="new-sequence">'+target.map(x=>'<span>'+x+'</span>').join('')+'</div><div class="garden-soil">'+Array.from({length:count},(_,i)=>'<span>'+(planted[i]||'🌱')+'</span>').join('')+'</div></div>';
    $('#game-panel').innerHTML='<h2>Vamos plantar?</h2><p>Escolha as flores para completar o canteiro.</p><div class="new-controls">'+flowers.map((f,i)=>'<button data-flower="'+i+'">'+f+'</button>').join('')+'</div><div class="new-controls"><button id="new-undo">↶ Desfazer</button><button id="new-run" '+(planted.length<count?'disabled':'')+'>🌈 Florescer!</button></div><p id="new-feedback" class="new-feedback" role="status">'+planted.length+' de '+count+' flores plantadas</p>';
    $$('[data-flower]').forEach(b=>b.onclick=()=>{if(planted.length<count){planted.push(flowers[Number(b.dataset.flower)]);draw();}});
    $('#new-undo').onclick=()=>{planted.pop();draw();};
    $('#new-run').onclick=()=>{if(planted.join('|')===target.join('|'))newFinish(a,'O jardim floresceu! Você descobriu a ordem das flores.',()=>gardenGame(a));else{planted=[];draw();newFeedback('Algumas flores trocaram de lugar. Vamos observar as placas outra vez?');}};
  }draw();
}
function libraryGame(a){
  const phase=requestedPhase(a.id), symbols=['🌙','⭐','🍃','🔑','💎','☀️'];let found=[];
  const len=Math.min(6,2+Math.floor(phase/2)), target=Array.from({length:len},(_,i)=>symbols[(phase+i*2)%symbols.length]);
  const shelves=Array.from({length:12},(_,i)=>symbols[(i*5+phase)%symbols.length]);
  newStage(a,'Os livros mágicos mudaram de lugar! Encontre os símbolos na ordem indicada pelo mapa da biblioteca.','Buscar pistas na ordem certa desenvolve atenção e organização.');
  function draw(){
    $('#game-stage').innerHTML='<div class="new-scene library-scene"><div class="scene-top">📚 BIBLIOTECA DOS SEGREDOS <span>FASE '+phase+'/10</span></div><p>Mapa dos livros</p><div class="new-sequence">'+target.map((x,i)=>'<span class="'+(i<found.length?'complete':'')+'">'+x+'</span>').join('')+'</div><div class="library-shelves">'+shelves.map((x,i)=>'<button data-book="'+i+'" aria-label="Livro '+x+'">📕<small>'+x+'</small></button>').join('')+'</div></div>';
    $('#game-panel').innerHTML='<h2>Procure o próximo livro</h2><p>Abra os livros que tenham o símbolo do mapa, na ordem indicada.</p><p id="new-feedback" class="new-feedback" role="status">'+found.length+' de '+len+' livros encontrados</p>';
    $$('[data-book]').forEach(b=>b.onclick=()=>{let symbol=shelves[Number(b.dataset.book)];if(symbol!==target[found.length]){newFeedback('Esse não é o próximo símbolo do mapa. Continue procurando!');return;}found.push(symbol);if(found.length===len)newFinish(a,'Você encontrou todos os livros mágicos! A biblioteca revelou seu segredo.',()=>libraryGame(a));else draw();});
  }draw();
}
function oceanGame(a){
  const phase=requestedPhase(a.id), tasks=[
    ['Uma mensagem pede sua senha para abrir um baú.', '🛑 Não compartilhar', '🔓 Compartilhar'],
    ['Um desconhecido pede seu endereço para enviar um prêmio.', '🛑 Pedir ajuda a um adulto', '📍 Enviar endereço'],
    ['Um link estranho promete moedas grátis.', '🛑 Não abrir o link', '🔗 Abrir o link'],
    ['Você quer publicar uma foto com outras crianças.', '💬 Conversar com um adulto', '📸 Publicar sem perguntar'],
    ['Uma pessoa pede para guardar um segredo que deixa você desconfortável.', '💬 Contar a um adulto de confiança', '🤐 Guardar sozinho']
  ];
  const count=Math.min(5,2+Math.floor(phase/3));let step=0;
  newStage(a,'Miau e Bit exploram um oceano cheio de tesouros. Alguns baús escondem mensagens estranhas: escolha como cuidar da turma!','Na internet, proteger dados e pedir ajuda a um adulto de confiança são atitudes importantes.');
  function draw(){const t=tasks[(phase+step)%tasks.length];$('#game-stage').innerHTML='<div class="new-scene ocean-scene"><div class="scene-top">🐠 OCEANO DIGITAL <span>FASE '+phase+'/10</span></div><div class="ocean-art">🐙　🐟　🫧　🐢　🫧</div><div class="ocean-chest">🪸　🧰　🪸</div><p>'+t[0]+'</p></div>';
    $('#game-panel').innerHTML='<h2>Qual é o cuidado?</h2><div class="new-controls"><button id="ocean-good">'+t[1]+'</button><button id="ocean-bad">'+t[2]+'</button></div><p id="new-feedback" class="new-feedback" role="status">Baús seguros: '+step+' de '+count+'</p>';
    $('#ocean-good').onclick=()=>{step++;if(step>=count)newFinish(a,'Você protegeu os tesouros e ajudou a turma a navegar com cuidado!',()=>oceanGame(a));else draw();};
    $('#ocean-bad').onclick=()=>newFeedback('Esse caminho pode colocar informações pessoais em risco. Escolha uma atitude mais segura.');
  }draw();
}
function pinballGame(a){
  const phase=requestedPhase(a.id), goal=3+phase, duration=30;let points=0, balls=3, running=true, pos=50, vx=1.2+phase*.12, y=10, vy=0, frame=null;
  newStage(a,'As estrelas caíram dentro de uma máquina maluca! Use as palhetas para lançar a bolinha e acertar os alvos.','Experimentar trajetórias e ajustar o momento do movimento ajuda a perceber causa e efeito.');
  $('#game-stage').innerHTML='<div class="new-scene pinball-scene"><div class="scene-top">⭐ PINBALL DAS ESTRELAS <span>FASE '+phase+'/10</span></div><div class="pinball-field" id="pinball-field"><span class="pinball-star" style="left:25%;top:27%">⭐</span><span class="pinball-star" style="left:70%;top:40%">⭐</span><span class="pinball-star" style="left:50%;top:15%">⭐</span><span class="pinball-ball" id="pinball-ball"></span><span class="pinball-paddles">◀━━━━　━━━━▶</span></div></div>';
  $('#game-panel').innerHTML='<h2>Acertar '+goal+' estrelas!</h2><p>Toque em LANÇAR para impulsionar a bolinha. Use as palhetas para mantê-la em jogo.</p><div class="new-controls"><button id="pinball-left">◀ Palheta</button><button id="pinball-launch">🚀 Lançar</button><button id="pinball-right">Palheta ▶</button></div><p id="new-feedback" class="new-feedback" role="status">Estrelas: 0/'+goal+' · Bolinhas: 3</p>';
  const ball=$('#pinball-ball');let last=0, bounced=false;
  function update(t){if(!running||!ball.isConnected)return;const dt=Math.min(.04,(t-last)/1000||.016);last=t;pos+=vx*dt*32;y+=vy*dt*32;vy+=dt*5;
    if(pos<4||pos>96){vx=-vx;pos=Math.max(4,Math.min(96,pos));}if(y<3){vy=Math.abs(vy);}if(y>92){balls--;if(balls<=0){running=false;newFeedback('As bolinhas acabaram! Tente novamente.');return;}y=10;vy=0;pos=50;}
    for(const [sx,sy] of [[25,27],[70,40],[50,15]]){if(Math.hypot(pos-sx,y-sy)<8&&!bounced){points++;bounced=true;vy=-Math.abs(vy)-1;vx=-vx;newFeedback('⭐ '+points+'/'+goal+' estrelas · '+balls+' bolinhas',true);if(points>=goal){running=false;newFinish(a,'Você conquistou as estrelas do pinball! Boa mira e bons reflexos.',()=>pinballGame(a));return;}}}if(bounced&&y>55)bounced=false;
    ball.style.left=pos+'%';ball.style.top=y+'%';frame=requestAnimationFrame(update);
  }
  const launch=()=>{if(!running)return;vy=-4-phase*.12;bounced=false;};
  $('#pinball-launch').onclick=launch;
  $('#pinball-left').onclick=()=>{vx=-Math.abs(vx)-.4;launch();};$('#pinball-right').onclick=()=>{vx=Math.abs(vx)+.4;launch();};
  const key=e=>{if(!ball.isConnected){window.removeEventListener('keydown',key);return;}if(e.key==='ArrowLeft')$('#pinball-left')?.click();if(e.key==='ArrowRight')$('#pinball-right')?.click();if(e.code==='Space'){e.preventDefault();launch();}};
  window.addEventListener('keydown',key);frame=requestAnimationFrame(update);
}
