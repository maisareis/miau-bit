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
  const cmds=['➡️','⬆️','⬇️']; let sequence=[],busy=false;
  const target=Array.from({length:len},(_,i)=>cmds[(i*3+phase+Math.floor(i/2))%3]);
  const toys=['🚗','🚀','🤖','🧸','🐱','🚂'];
  const toy=toys[(phase-1)%toys.length];
  let audioCtx;
  function beep(freq=480,dur=.09,type='sine',vol=.08){
    try {audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();
      const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;
      o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
      o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.01);
    }catch(e){}
  }
  newStage(a,'As esteiras da fábrica precisam de comandos! Observe o projeto e monte a sequência para o robô levar as peças até a máquina.','Planejar uma sequência e testar comandos são passos importantes da programação.');
  function draw(){
    $('#game-stage').innerHTML='<div class="new-scene factory-scene"><div class="scene-top">⚙️ OFICINA DE INVENÇÕES <span>FASE '+phase+'/10</span></div><div class="factory-workshop"><div class="factory-sparks" aria-hidden="true">✦　✧　✦</div><div class="factory-robot" aria-label="Bit trabalhando">🤖</div><div class="factory-conveyor"><div class="factory-items">⚙️　📦　⚙️　📦　⚙️</div></div><div class="factory-toy" aria-label="Brinquedo fabricado">'+toy+'</div></div><p>Projeto da máquina</p><div class="new-sequence">'+target.map(x=>'<span>'+x+'</span>').join('')+'</div><p>Seus comandos</p><div class="new-sequence player">'+Array.from({length:len},(_,i)=>'<span>'+(sequence[i]||'·')+'</span>').join('')+'</div></div>';
    $('#game-panel').innerHTML='<h2>Programe a esteira</h2><p>Toque nas setas na mesma ordem do projeto. Depois, ligue a máquina para ver o Bit trabalhar!</p><div class="new-controls">'+cmds.map((c,i)=>'<button type="button" data-cmd="'+i+'">'+c+'</button>').join('')+'</div><div class="new-controls"><button type="button" id="new-undo">↶ Desfazer</button><button type="button" id="new-run" '+(sequence.length<len?'disabled':'')+'>▶ Ligar máquina</button></div><p id="new-feedback" class="new-feedback" role="status">'+sequence.length+' de '+len+' comandos</p>';
    $$('[data-cmd]').forEach(b=>b.onclick=()=>{if(!busy&&sequence.length<len){sequence.push(cmds[Number(b.dataset.cmd)]);beep(360+sequence.length*55,.075,'triangle');draw();}});
    $('#new-undo').onclick=()=>{if(!busy){sequence.pop();beep(250,.08);draw();}};
    $('#new-run').onclick=()=>{
      if(busy)return;busy=true;beep(280,.16,'sawtooth',.045);
      const scene=$('.factory-scene');scene.classList.add('factory-running');
      $$('#game-panel button').forEach(x=>x.disabled=true);
      newFeedback('⚙️ A esteira está funcionando!');
      let step=0;const ok=sequence.join('|')===target.join('|');
      const ticker=setInterval(()=>{
        if(!scene.isConnected){clearInterval(ticker);return;}
        beep(320+(step%4)*90,.085,'square',.025);step++;
        if(step>=len){clearInterval(ticker);if(!scene.isConnected)return;
          if(ok){scene.classList.add('factory-success');beep(659,.14);setTimeout(()=>beep(880,.25),160);setTimeout(()=>newFinish(a,'A máquina funcionou! O Bit fabricou '+toy+' seguindo seus comandos.',()=>factoryGame(a)),900);}
          else{scene.classList.add('factory-error');beep(190,.3,'sawtooth',.06);setTimeout(()=>{sequence=[];busy=false;draw();newFeedback('A máquina seguiu outro caminho. Confira a sequência e tente novamente.');},800);}
        }
      },Math.max(170,350-phase*9));
    };
  }draw();
}
function adventureSound(notes=[523,659,784],type='sine'){
 try{const C=window.AudioContext||window.webkitAudioContext;const c=adventureSound.ctx||(adventureSound.ctx=new C());if(c.state==='suspended')c.resume();notes.forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.105;o.type=type;o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.065,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.18);});}catch(e){}
}
function gardenGame(a) {
 const phase=requestedPhase(a.id),flowers=['🌷','🌻','🌼','🌺','🌸'],count=Math.min(8,3+Math.floor(phase/2));
 const seed=phase%flowers.length,target=Array.from({length:count},(_,i)=>flowers[(seed+i*(phase%2+1))%flowers.length]);let planted=[],busy=false;
 newStage(a,'Ajude Luma a recuperar o jardim! Descubra a ordem das flores e veja cada semente florescer.','Reconhecer padrões e experimentar ajuda a planejar soluções.');
 function draw(){
  $('#game-stage').innerHTML='<div class="new-scene garden-scene garden-alive"><div class="scene-top">🌸 JARDIM DA LUMA <span>FASE '+phase+'/10</span></div><div class="garden-landscape"><div class="garden-cloud">☁️</div><div class="garden-sunshine">☀️</div><div class="garden-butterfly">🦋</div><div class="garden-luma">🐈‍⬛</div><div class="garden-water">💧</div></div><p>Flores do projeto</p><div class="new-sequence">'+target.map(x=>'<span>'+x+'</span>').join('')+'</div><div class="garden-soil garden-plots">'+Array.from({length:count},(_,i)=>'<span class="garden-plant" style="--i:'+i+'">'+(planted[i]||'🌱')+'</span>').join('')+'</div></div>';
  $('#game-panel').innerHTML='<h2>Vamos fazer o jardim florescer?</h2><p>Escolha as flores na ordem do projeto e toque em Florescer.</p><div class="new-controls">'+flowers.map((f,i)=>'<button data-flower="'+i+'">'+f+'</button>').join('')+'</div><div class="new-controls"><button id="new-undo">↶ Desfazer</button><button id="new-run" '+(planted.length<count?'disabled':'')+'>🌈 Florescer!</button></div><p id="new-feedback" class="new-feedback" role="status">'+planted.length+' de '+count+' flores plantadas</p>';
  $$('[data-flower]').forEach(b=>b.onclick=()=>{if(busy||planted.length>=count)return;planted.push(flowers[Number(b.dataset.flower)]);adventureSound([390+planted.length*45]);draw();});
  $('#new-undo').onclick=()=>{if(busy)return;planted.pop();draw();};
  $('#new-run').onclick=()=>{if(busy)return;if(planted.join('|')!==target.join('|')){adventureSound([250,190],'triangle');planted=[];draw();newFeedback('Algumas flores trocaram de lugar. Observe o projeto e tente novamente.');return;}
   busy=true;$$('#game-panel button').forEach(b=>b.disabled=true);const scene=$('.garden-alive');scene.classList.add('garden-bloom');newFeedback('🌱 As sementes estão brotando!',true);
   const plants=$$('.garden-plant');plants.forEach((el,i)=>{el.textContent='🌱';setTimeout(()=>{if(!el.isConnected)return;el.textContent=target[i];el.classList.add('flower-open');adventureSound([450+i*40,600+i*30]);},350+i*330);});
   setTimeout(()=>{if(scene.isConnected){scene.classList.add('garden-celebrate');adventureSound([523,659,784,1047]);newFinish(a,'O jardim floresceu de verdade! Luma agradece por recuperar suas cores.',()=>gardenGame(a));}},1000+count*330);
  };
 }draw();
}
function libraryGame(a){
 const phase=requestedPhase(a.id),symbols=['🌙','⭐','🍃','🔑','💎','☀️'];let found=[],busy=false;
 const len=Math.min(6,2+Math.floor(phase/2)),target=Array.from({length:len},(_,i)=>symbols[(phase+i*2)%symbols.length]);
 const shelves=Array.from({length:12},(_,i)=>symbols[(i*5+phase)%symbols.length]);
 newStage(a,'Explore a biblioteca mágica: abra os livros na ordem do mapa para revelar uma passagem secreta.','Buscar pistas na ordem certa desenvolve atenção e organização.');
 function draw(){
  $('#game-stage').innerHTML='<div class="new-scene library-scene library-alive"><div class="scene-top">📚 BIBLIOTECA DOS SEGREDOS <span>FASE '+phase+'/10</span></div><div class="library-magic">✨　🕯️　✨</div><p>Mapa dos livros</p><div class="new-sequence">'+target.map((x,i)=>'<span class="'+(i<found.length?'complete':'')+'">'+x+'</span>').join('')+'</div><div class="library-shelves">'+shelves.map((x,i)=>'<button data-book="'+i+'" aria-label="Abrir livro com símbolo '+x+'"><span class="book-cover">📕</span><small>'+x+'</small></button>').join('')+'</div><div class="library-secret-door">🚪 <span>Passagem secreta</span></div></div>';
  $('#game-panel').innerHTML='<h2>Procure o próximo livro</h2><p>Abra os livros mágicos seguindo o mapa. Cada livro revela uma pista.</p><p id="new-feedback" class="new-feedback" role="status">'+found.length+' de '+len+' livros encontrados</p>';
  $$('[data-book]').forEach(b=>b.onclick=()=>{if(busy)return;const symbol=shelves[Number(b.dataset.book)];b.classList.add('book-opening');b.querySelector('.book-cover').textContent='📖';adventureSound([430,550],'triangle');
   if(symbol!==target[found.length]){newFeedback('✨ Esse livro não é o próximo do mapa. Procure outro!');setTimeout(()=>{if(b.isConnected){b.classList.remove('book-opening');b.querySelector('.book-cover').textContent='📕';}},650);return;}
   busy=true;found.push(symbol);newFeedback('✨ Livro encontrado! '+found.length+' de '+len,true);
   if(found.length===len){const scene=$('.library-alive');scene.classList.add('library-unlocked');adventureSound([440,554,659,880]);setTimeout(()=>{if(scene.isConnected)newFinish(a,'A estante deslizou e revelou uma passagem secreta! Você encontrou todos os livros.',()=>libraryGame(a));},1550);}
   else setTimeout(()=>{if(b.isConnected){busy=false;draw();}},650);
  });
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
  function draw(){const t=tasks[(phase+step)%tasks.length];$('#game-stage').innerHTML='<div class="new-scene ocean-scene"><div class="scene-top">🐠 OCEANO DIGITAL <span>FASE '+phase+'/10</span></div><div class="ocean-art ocean-swim">🐙　🐟　🫧　🐢　🫧</div><div class="ocean-chest ocean-treasure">🪸　🧰　🪸</div><p>'+t[0]+'</p></div>';
    $('#game-panel').innerHTML='<h2>Qual é o cuidado?</h2><div class="new-controls"><button id="ocean-good">'+t[1]+'</button><button id="ocean-bad">'+t[2]+'</button></div><p id="new-feedback" class="new-feedback" role="status">Baús seguros: '+step+' de '+count+'</p>';
    $('#ocean-good').onclick=()=>{adventureSound([523,659,784]);$('.ocean-treasure')?.classList.add('ocean-open');step++;if(step>=count)newFinish(a,'Você protegeu os tesouros e ajudou a turma a navegar com cuidado!',()=>oceanGame(a));else draw();};
    $('#ocean-bad').onclick=()=>{adventureSound([220,180],'triangle');newFeedback('Esse caminho pode colocar informações pessoais em risco. Escolha uma atitude mais segura.');};
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
    for(const [sx,sy] of [[25,27],[70,40],[50,15]]){if(Math.hypot(pos-sx,y-sy)<8&&!bounced){points++;adventureSound([660,880]);bounced=true;vy=-Math.abs(vy)-1;vx=-vx;newFeedback('⭐ '+points+'/'+goal+' estrelas · '+balls+' bolinhas',true);if(points>=goal){running=false;newFinish(a,'Você conquistou as estrelas do pinball! Boa mira e bons reflexos.',()=>pinballGame(a));return;}}}if(bounced&&y>55)bounced=false;
    ball.style.left=pos+'%';ball.style.top=y+'%';frame=requestAnimationFrame(update);
  }
  const launch=()=>{if(!running)return;adventureSound([290,390],'triangle');vy=-4-phase*.12;bounced=false;};
  $('#pinball-launch').onclick=launch;
  $('#pinball-left').onclick=()=>{vx=-Math.abs(vx)-.4;launch();};$('#pinball-right').onclick=()=>{vx=Math.abs(vx)+.4;launch();};
  const key=e=>{if(!ball.isConnected){window.removeEventListener('keydown',key);return;}if(e.key==='ArrowLeft')$('#pinball-left')?.click();if(e.key==='ArrowRight')$('#pinball-right')?.click();if(e.code==='Space'){e.preventDefault();launch();}};
  window.addEventListener('keydown',key);frame=requestAnimationFrame(update);
}
