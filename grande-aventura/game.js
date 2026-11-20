'use strict';
const canvas=document.querySelector('#stage'),ctx=canvas.getContext('2d'),overlay=document.querySelector('#overlay'),startBtn=document.querySelector('#start');
const W=960,H=540,keys={left:false,right:false,jump:false};
const portalScene=document.querySelector('#portalScene');let portalTimer=null;const kingdom=document.querySelector('#kingdom'),gameSection=document.querySelector('#gameSection'),choose=document.querySelector('#choose');
let character='miau';const sprites={};for(const name of ['miau','luma']){const im=new Image();im.src=name+'.svg';sprites[name]=im;}
try{character=localStorage.getItem('miau-bit-aventura-personagem')==='luma'?'luma':'miau'}catch(e){}
const names=['','Primeiros Pulos','O Caminho das Engrenagens','A Ponte Misteriosa','O Labirinto Verde','A Máquina Descontrolada'];
const descriptions=['','Colete as engrenagens e encontre Bit!','Desvie dos espinhos e use as plataformas.','Acione as três alavancas para reconstruir a ponte.','Encontre as três pistas na ordem certa: 1, 2 e 3.','Desative a máquina ativando seus três terminais.'];
const configs={
1:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[]},
2:{width:2800,coins:[315,510,805,1095,1400,1690,1960,2460],spikes:[670,940,1475,1870,2320],extras:[{x:1150,y:365,w:105,h:20},{x:1780,y:285,w:120,h:20}]},
3:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[910,1500],extras:[{x:600,y:385,w:120,h:20},{x:1150,y:385,w:120,h:20},{x:2150,y:390,w:120,h:20}],switches:[{x:385,y:315},{x:1215,y:420},{x:1950,y:310}],bridge:true},
4:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[{x:640,y:385,w:130,h:20},{x:1200,y:250,w:135,h:20},{x:1750,y:370,w:130,h:20},{x:2270,y:250,w:130,h:20}],switches:[{x:350,y:315},{x:1260,y:205},{x:2300,y:205}],ordered:true},
5:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[{x:600,y:385,w:130,h:20},{x:1190,y:385,w:130,h:20},{x:1790,y:385,w:130,h:20}],switches:[{x:650,y:340},{x:1240,y:340},{x:1840,y:340}],boss:true}
};
const castleNames=['','Portão dos Segredos','A Ponte dos Códigos','As Torres da Proteção','O Cofre Misterioso','O Guardião das Senhas'];
const castleDescriptions=['','🔑 Senhas longas protegem melhor! Colete as chaves e alcance o portão.','🔐 Uma senha diferente para cada conta! Acione os três cadeados.','🧩 Nunca compartilhe sua senha! Descubra as pistas 1, 2 e 3 na ordem.','🛡️ A verificação em duas etapas reforça a proteção! Ative os escudos.','👾 O Guardião quer roubar senhas! Desligue seus três terminais.'];
const castleConfigs={
1:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[]},
2:{width:2800,coins:[315,510,805,1095,1400,1690,1960,2460],spikes:[670,940,1475,1870],extras:[{x:1150,y:365,w:105,h:20},{x:1780,y:285,w:120,h:20}],switches:[{x:350,y:315},{x:1215,y:420},{x:1950,y:310}],bridge:true},
3:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[910,1500],extras:[{x:600,y:385,w:120,h:20},{x:1150,y:385,w:120,h:20},{x:2150,y:390,w:120,h:20}],switches:[{x:350,y:315},{x:1215,y:420},{x:1950,y:310}],ordered:true},
4:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[{x:640,y:385,w:130,h:20},{x:1200,y:250,w:135,h:20},{x:1750,y:370,w:130,h:20}],switches:[{x:350,y:315},{x:1260,y:205},{x:1950,y:310}]},
5:{width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:[900,1475,2025],extras:[{x:600,y:385,w:130,h:20},{x:1190,y:385,w:130,h:20},{x:1790,y:385,w:130,h:20}],switches:[{x:650,y:340},{x:1240,y:340},{x:1840,y:340}],boss:true}
};
let world=1,castleUnlocked=1,world1Complete=false;
try{castleUnlocked=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo2'))||1));world1Complete=localStorage.getItem('miau-bit-aventura-mundo1-completo')==='sim'}catch(e){}
function currentNames(){return world===2?castleNames:names}
function currentDescriptions(){return world===2?castleDescriptions:descriptions}
function currentConfigs(){return world===2?castleConfigs:configs}
function worldTitle(){return world===2?'🏰 Mundo 2 — Castelo das Senhas':'🌳 Mundo 1 — Floresta dos Algoritmos'}
function updateCastleAccess(){const b=document.querySelector('#castleWorld');b.disabled=!world1Complete;b.classList.toggle('available',world1Complete);b.classList.toggle('locked',!world1Complete);document.querySelector('#castleStatus').textContent=world1Complete?'Entrar no mundo ▶':'🔒 Conclua o Mundo 1'}
const base=[{x:0,y:465,w:520,h:75},{x:610,y:465,w:440,h:75},{x:1140,y:465,w:410,h:75},{x:1630,y:465,w:460,h:75},{x:2180,y:465,w:620,h:75},{x:260,y:360,w:135,h:24},{x:475,y:310,w:120,h:24},{x:760,y:345,w:150,h:24},{x:1030,y:285,w:145,h:24},{x:1350,y:355,w:150,h:24},{x:1580,y:290,w:140,h:24},{x:1890,y:350,w:150,h:24},{x:2130,y:300,w:145,h:24},{x:2400,y:355,w:150,h:24}];
let level=1,unlocked=1,player,coins,spikes,switches,platforms,score=0,lives=3,camera=0,playing=false,invuln=0,last=0,muted=false,audio=null,tick=0,notice='',noticeFrames=0,previousJump=false;
try{unlocked=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo1'))||1));}catch(e){}
function tone(f=440,d=.13,type='sine',vol=.035){if(muted)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
setInterval(()=>{if(playing&&!muted){const n=[392,523,587,659,587,523,440,392,330,392,440,523,440,392,330,294];tone(n[tick++%n.length],.18,'triangle',.012)}},340);
function message(s){notice=s;noticeFrames=170;}
function renderMap(){document.querySelectorAll('[data-level]').forEach(b=>{let n=Number(b.dataset.level),limit=world===2?castleUnlocked:unlocked;b.disabled=n>limit;b.textContent=(n>limit?'🔒 ':'🌟 ')+`${world}-${n} · ${currentNames()[n]}`+(n===5?' 👾':'');});}
function showMap(){stopPortal();choose.hidden=true;kingdom.hidden=true;gameSection.hidden=false;playing=false;overlay.hidden=false;overlay.querySelector('h2').textContent=worldTitle();overlay.querySelector('p').textContent='Cinco fases. Conclua uma para liberar a próxima!';document.querySelector('#map').hidden=false;startBtn.hidden=true;renderMap();}
function reset(){stopPortal();choose.hidden=true;kingdom.hidden=true;gameSection.hidden=false;const cfg=currentConfigs()[level];platforms=base.map(p=>({...p})).concat(cfg.extras.map(p=>({...p})));if(cfg.bridge)platforms.push({x:2090,y:465,w:90,h:75,conditional:true});player={x:55,y:370,w:38,h:47,vx:0,vy:0,ground:false,spawnX:55,spawnY:370};coins=cfg.coins.map((x,i)=>({x,y:[322,272,307,247,317,252,312,317][i],got:false}));spikes=cfg.spikes.map(x=>({x,y:440,w:42}));switches=(cfg.switches||[]).map((s,i)=>({...s,on:false,index:i}));score=0;lives=3;camera=0;invuln=0;notice='';previousJump=false;playing=true;overlay.hidden=true;document.querySelector('#score').textContent=0;document.querySelector('#goal').textContent=coins.length;document.querySelector('#lives').textContent=lives;document.querySelector('#stageLabel').textContent=`Fase ${world}-${level} · ${currentNames()[level]}`;message(currentDescriptions()[level]);tone(523,.15);}
function finish(win){playing=false;overlay.hidden=false;overlay.querySelector('h2').textContent=win?(level===5?(world===2?'🏆 Castelo protegido!':'🏆 Floresta salva!'):'🎉 Fase concluída!'):'💛 Vamos tentar de novo?';overlay.querySelector('p').textContent=win?(level===5?(world===2?'O Guardião foi desligado! Você protegeu o Castelo das Senhas!':'A floresta foi salva! O Castelo das Senhas foi desbloqueado!'):`Você concluiu a fase ${world}-${level}. A próxima aventura foi liberada!`):'Tente novamente. Você consegue!';startBtn.hidden=false;startBtn.textContent='Jogar novamente ↻';document.querySelector('#map').hidden=false;if(win){if(world===1){unlocked=Math.max(unlocked,Math.min(5,level+1));if(level===5)world1Complete=true;try{localStorage.setItem('miau-bit-aventura-mundo1',String(unlocked));if(level===5)localStorage.setItem('miau-bit-aventura-mundo1-completo','sim')}catch(e){}}else{castleUnlocked=Math.max(castleUnlocked,Math.min(5,level+1));try{localStorage.setItem('miau-bit-aventura-mundo2',String(castleUnlocked))}catch(e){}}updateCastleAccess();[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.22,'triangle',.035),i*150));}else tone(180,.4,'sawtooth');renderMap();}
function hurt(){if(invuln>0||!playing)return;lives--;document.querySelector('#lives').textContent=lives;tone(175,.28,'sawtooth');if(lives<=0){finish(false);return;}invuln=95;player.x=player.spawnX;player.y=player.spawnY;player.vx=player.vy=0;}
function update(dt){if(!playing)return;const sc=Math.min(dt/16.67,2);invuln=Math.max(0,invuln-sc);noticeFrames=Math.max(0,noticeFrames-sc);player.vx=(Number(keys.right)-Number(keys.left))*5.1;player.x=Math.max(0,Math.min(2762,player.x+player.vx*sc));if(keys.jump&&!previousJump&&player.ground){player.vy=-13.5;player.ground=false;tone(470,.11,'square',.017)}previousJump=keys.jump;const bottom=player.y+player.h;player.vy+=.64*sc;player.y+=player.vy*sc;player.ground=false;for(const p of platforms){if(p.conditional&&!switches.every(s=>s.on))continue;if(player.vy>=0&&bottom<=p.y+9&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;player.vy=0;player.ground=true;}}
if(player.y>H+90)hurt();for(const s of spikes)if(player.x+player.w>s.x+7&&player.x<s.x+s.w-7&&player.y+player.h>s.y+8&&player.y<s.y+25)hurt();for(const c of coins){if(!c.got&&Math.abs(player.x+19-c.x)<31&&Math.abs(player.y+23-c.y)<37){c.got=true;score++;document.querySelector('#score').textContent=score;tone(650+score*50,.15);}}
for(const s of switches){if(s.on)continue;if(Math.abs(player.x+19-s.x)<35&&Math.abs(player.y+23-s.y)<50){if(currentConfigs()[level].ordered&&switches.slice(0,s.index).some(q=>!q.on)){message('🔢 Siga a sequência: 1 → 2 → 3!');continue;}s.on=true;tone(880,.25,'triangle');message(world===2?(currentConfigs()[level].boss?'🛡️ Guardião enfraquecido!':currentConfigs()[level].ordered?'🔐 Pista protegida!':'🔑 Proteção ativada!'):(currentConfigs()[level].boss?'⚡ Terminal desativado!':currentConfigs()[level].ordered?'✨ Pista encontrada na ordem certa!':'🔧 Alavanca acionada!'));}}
if(player.x>1600&&player.spawnX<1600){player.spawnX=1640;player.spawnY=390;message('🚩 Checkpoint ativado!');}
if(player.x>2650){if(score===coins.length&&switches.every(s=>s.on))finish(true);else if(noticeFrames<40)message(`Faltam ${coins.length-score} ${world===2?'chaves':'engrenagens'} e ${switches.filter(s=>!s.on).length} mecanismos!`);}
camera=Math.max(0,Math.min(1840,player.x-W*.32));}
function roundRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function scenery(time){
 const castle=world===2;
 let sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,castle?'#6c70b8':'#69c8f2');sky.addColorStop(.58,castle?'#c3b4e5':'#c5f4e7');sky.addColorStop(1,castle?'#e9d9fa':'#e8f7b8');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 ellipse(790-camera*.018,88,53,53,castle?'#ffe3b6':'#fff2ae');
 ellipse(775-camera*.018,76,62,62,'#ffffff24');
 for(let i=0;i<11;i++){
  let x=((i*215-camera*.09)%1450+1450)%1450-120,y=65+i%4*35;
  ellipse(x,y,56,17,'#ffffffa0');ellipse(x+29,y-10,35,24,'#ffffffb0');ellipse(x-27,y-7,31,19,'#ffffffa0');
 }
 // Three scenic depth planes move at different speeds
 for(let layer=0;layer<3;layer++){
  const speed=[.12,.26,.45][layer],baseline=[367,411,470][layer];
  const col=castle?['#8d91c4','#757cba','#666ba4'][layer]:['#a0d6bf','#71bf9d','#3d9d80'][layer];
  for(let i=-2;i<15;i++){
   const x=i*(210-layer*20)-camera*speed;
   polygon([[x-150,baseline+65],[x,baseline-95-layer*10],[x+160,baseline+65]],col);
  }
 }
 for(let i=0;i<25;i++){
  const x=i*148-camera*.53,y=428+i%3*14;
  if(castle){
   roundRect(x-21,y-135,45,148,5,'#7772a8');
   polygon([[x-30,y-135],[x,y-174],[x+34,y-135]],'#575e97');
   roundRect(x-6,y-104,15,36,7,'#ffe3a3');
  }else{
   roundRect(x-10,y-45,20,105,5,'#946949');
   ellipse(x,y-78,66,76,i%2?'#3b9d71':'#58b581');
   ellipse(x-19,y-100,47,49,'#ffffff16');
   ellipse(x+19,y-53,42,35,'#247e6130');
  }
 }
 // castle arcade or forest leaves in the near scenery
 for(let i=0;i<10;i++){
  const x=i*350-camera*.73;
  if(castle){
   roundRect(x-60,370,20,140,3,'#5f6393');
   roundRect(x+125,370,20,140,3,'#5f6393');
   polygon([[x-70,370],[x+42,300],[x+155,370]],'#8886b5');
  }else{
   ellipse(x+40,415,115,34,'#398a71b0');
   ellipse(x-14,411,70,28,'#68ba82a0');
  }
 }
 for(let i=0;i<16;i++){
  const x=((i*177-camera*.29)%1350+1350)%1350-100,y=130+i%5*55;
  ellipse(x,y+Math.sin(time/700+i)*5,2.8,2.8,castle?'#fff2cd':'#f9ffc7');
 }
}
function platform25(p){
 const depth=p.y===465?35:22,castle=world===2;
 const side=castle?'#615477':'#795b46',front=castle?'#8b79a5':'#a77b55',top=castle?'#c7b6e5':'#82c991';
 if(p.conditional&&!switches.every(q=>q.on))ctx.globalAlpha=.35;
 polygon([[p.x+p.w,p.y],[p.x+p.w+depth*.48,p.y-depth*.42],[p.x+p.w+depth*.48,p.y+p.h-depth*.42],[p.x+p.w,p.y+p.h]],side);
 polygon([[p.x,p.y],[p.x+depth*.48,p.y-depth*.42],[p.x+p.w+depth*.48,p.y-depth*.42],[p.x+p.w,p.y]],castle?'#f0dfff':'#c7f2aa');
 roundRect(p.x,p.y,p.w,p.h,2,front);
 roundRect(p.x,p.y,p.w,13,2,top);
 for(let i=p.x+17;i<p.x+p.w;i+=38){
  roundRect(i,p.y+22,22,7,2,castle?'#685b83':'#8b6449');
  if(p.h>40)roundRect(i+6,p.y+45,14,7,2,castle?'#9c8bb5':'#c69466');
 }
 if(!castle)for(let i=p.x+12;i<p.x+p.w;i+=51){
  ellipse(i,p.y+2,11,4,'#b6eb8a');
  if(i%3===0)ellipse(i+6,p.y-4,3,3,'#ffe8a0');
 }
 else for(let i=p.x+25;i<p.x+p.w;i+=70)ellipse(i,p.y+3,5,3,'#f8e7ff');
 ctx.globalAlpha=1;
}
function hero25(t){
 const x=player.x+player.w/2,y=player.y+player.h/2;
 const moving=Math.abs(player.vx)>0.2,step=moving?Math.sin(t/85)*3:0;
 ctx.save();ctx.translate(x,y+step);
 if(player.vx<0)ctx.scale(-1,1);
 // Cast shadow and rim light: volumetric cartoon silhouette
 ellipse(0,23,22,7,'#263b5060');
 const fur=character==='luma'?'#d3a6ef':'#f5a251';
 const shade=character==='luma'?'#9865bd':'#b96934';
 const rim=character==='luma'?'#f3dcff':'#ffe0a1';
 polygon([[-16,-11],[-17,-33],[-3,-20]],fur);
 polygon([[4,-20],[17,-34],[17,-10]],fur);
 let g=ctx.createRadialGradient(-8,-14,2,1,3,33);
 g.addColorStop(0,rim);g.addColorStop(.48,fur);g.addColorStop(1,shade);
 ellipse(0,1,22,24,g);
 ellipse(-9,-4,6.5,9,'#fff');ellipse(9,-4,6.5,9,'#fff');
 ellipse(-8,-2,3.5,5,'#2e3348');ellipse(10,-2,3.5,5,'#2e3348');
 ellipse(-7,-4,1.3,1.8,'#fff');ellipse(11,-4,1.3,1.8,'#fff');
 polygon([[-4,8],[4,8],[0,13]],'#e97595');
 ctx.strokeStyle='#765064';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,13);ctx.quadraticCurveTo(-6,18,-10,12);ctx.moveTo(0,13);ctx.quadraticCurveTo(6,18,10,12);ctx.stroke();
 ellipse(-15,9,5,3,'#f79ca66b');ellipse(15,9,5,3,'#f79ca66b');
 if(character==='luma'){ellipse(16,-24,7,7,'#f172b4');ellipse(11,-27,3,3,'#ffd7f0')}
 else{roundRect(-13,-27,25,5,2,'#715bc1');ellipse(9,-26,4,4,'#ffe2a0')}
 ctx.restore();
}
function draw(){
 const t=performance.now();ctx.clearRect(0,0,W,H);
 scenery(t);
 ctx.save();ctx.translate(-camera,0);
 for(const p of platforms)platform25(p);
 for(const s of spikes){
  ellipse(s.x+20,s.y+26,24,5,'#7a344a55');
  polygon([[s.x,s.y+25],[s.x+21,s.y-7],[s.x+42,s.y+25]],'#e66f83');
  polygon([[s.x+21,s.y-7],[s.x+42,s.y+25],[s.x+26,s.y+22]],'#aa4b6c');
  polygon([[s.x+5,s.y+22],[s.x+21,s.y-7],[s.x+18,s.y+21]],'#ffb7bc');
 }
 for(const c of coins){
  if(c.got)continue;
  const cy=c.y+Math.sin(t/300+c.x)*4,scale=.68+.32*Math.abs(Math.cos(t/380+c.x));
  ellipse(c.x,cy+19,14,4,'#2b52632b');
  ctx.save();ctx.translate(c.x,cy);ctx.scale(scale,1);
  ellipse(0,0,18,18,world===2?'#b87331':'#b77b25');
  ellipse(-2,-2,15,15,world===2?'#ffe09a':'#ffdf67');
  ctx.fillStyle='#805327';ctx.font='bold 21px sans-serif';ctx.textAlign='center';ctx.fillText(world===2?'◆':'⚙',0,7);ctx.restore();
 }
 for(const q of switches){
  ellipse(q.x,q.y+23,24,6,'#263f6244');
  roundRect(q.x-21,q.y-23,42,45,7,q.on?'#5ec69b':'#f2ae61');
  roundRect(q.x-16,q.y-17,32,34,5,q.on?'#baf9d2':'#ffe4b0');
  ctx.fillStyle='#34465b';ctx.font='bold 23px sans-serif';ctx.textAlign='center';
  ctx.fillText(q.on?'✓':String(q.index+1),q.x,q.y+9);
 }
 if(currentConfigs()[level].boss){
  ellipse(2577,469,77,15,'#2c38565a');
  roundRect(2520,349,115,116,20,switches.every(q=>q.on)?'#6bcda3':'#7557a5');
  roundRect(2534,368,87,60,12,'#c8f2ff');
  ellipse(2558,394,8,9,'#25354e');ellipse(2599,394,8,9,'#25354e');
  ctx.fillStyle='#273a53';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(switches.every(q=>q.on)?'OFF':'GUARDIÃO',2577,449);
 }
 roundRect(2685,398,48,66,7,world===2?'#c99b52':'#b8a4ed');
 roundRect(2693,407,32,29,5,'#f1f6ff');
 ellipse(2703,420,3,3,'#324568');ellipse(2716,420,3,3,'#324568');
 ctx.fillStyle='#283f65';ctx.font='bold 17px sans-serif';ctx.fillText(world===2?'COFRE':'BIT!',2675,384);
 if(invuln===0||Math.floor(invuln/5)%2===0)hero25(t);
 ctx.restore();
 // near-camera foliage creates an extra foreground depth plane
 for(let i=0;i<10;i++){
  const x=((i*210-camera*.91)%1370+1370)%1370-100;
  if(world===1){ellipse(x,528,72,32,'#2c916c55');ellipse(x+22,537,55,19,'#66b68a55')}
  else{polygon([[x-38,540],[x+10,508],[x+48,540]],'#6c679750')}
 }
 roundRect(12,10,Math.min(W-24,440),35,12,'#ffffffd9');
 ctx.fillStyle='#243956';ctx.font='bold 16px system-ui';ctx.textAlign='left';
 ctx.fillText((world===2?'🏰 ':'🌳 ')+currentNames()[level]+' · '+world+'-'+level,24,33);
 if(noticeFrames>0){
  roundRect(110,46,740,49,12,'#fffaf0ed');
  ctx.fillStyle='#263f62';ctx.font='bold 17px system-ui';ctx.textAlign='center';
  ctx.fillText(notice,480,76);ctx.textAlign='left';
 }
}
function frame(t){const dt=t-last||16.67;last=t;update(dt);draw();requestAnimationFrame(frame)}
function stopPortal(){if(portalTimer!==null){clearTimeout(portalTimer);portalTimer=null;}portalScene.hidden=true;portalScene.classList.remove('entering');}
function enterPortal(){stopPortal();playing=false;choose.hidden=true;kingdom.hidden=true;gameSection.hidden=true;portalScene.hidden=false;const hero=document.querySelector('#portalHero');hero.src=character+'.svg';hero.alt=character==='luma'?'Luma entrando no reino':'Miau entrando no reino';void portalScene.offsetWidth;portalScene.classList.add('entering');tone(560,.23,'triangle');portalTimer=setTimeout(()=>{portalTimer=null;showKingdom();},3100);}
document.querySelector('#skipPortal').addEventListener('click',()=>showKingdom());
function showKingdom(){stopPortal();playing=false;updateCastleAccess();choose.hidden=true;kingdom.hidden=false;gameSection.hidden=true;window.scrollTo({top:0,behavior:'smooth'});}
function showChoose(){stopPortal();playing=false;gameSection.hidden=true;kingdom.hidden=true;choose.hidden=false;document.querySelectorAll('[data-character]').forEach(b=>b.classList.toggle('selected',b.dataset.character===character));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>{character=b.dataset.character;document.querySelectorAll('[data-character]').forEach(x=>x.classList.toggle('selected',x===b));tone(740,.15);try{localStorage.setItem('miau-bit-aventura-personagem',character)}catch(e){}}));
document.querySelector('#enterKingdom').addEventListener('click',()=>{tone(880,.3);enterPortal()});
document.querySelector('#characterBtn').addEventListener('click',showChoose);
document.querySelector('#forestWorld').addEventListener('click',()=>{world=1;showMap()});document.querySelector('#castleWorld').addEventListener('click',()=>{if(world1Complete){world=2;showMap()}});
document.querySelector('#kingdomBtn').addEventListener('click',showKingdom);
startBtn.addEventListener('click',reset);document.querySelector('#mapBtn').addEventListener('click',showMap);document.querySelector('#soundBtn').addEventListener('click',()=>{muted=!muted;document.querySelector('#soundBtn').textContent=muted?'🔇 Som desligado':'🔊 Som ligado';if(!muted)tone(600,.12)});document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{if(!b.disabled){level=Number(b.dataset.level);reset();}}));
function bind(id,key){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;el.setPointerCapture(e.pointerId)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>keys[key]=false)}bind('left','left');bind('right','right');bind('jump','jump');const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump'};window.addEventListener('keydown',e=>{const k=mapping[e.code];if(k){e.preventDefault();keys[k]=true}});window.addEventListener('keyup',e=>{const k=mapping[e.code];if(k){e.preventDefault();keys[k]=false}});window.addEventListener('blur',()=>{keys.left=keys.right=keys.jump=false});reset();showChoose();updateCastleAccess();requestAnimationFrame(frame);
