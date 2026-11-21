// Miau & Bit: motor 3D WebGL nativo, 100% local, sem CDN nem dependências.
const root=document.querySelector('#view'),msg=document.querySelector('#message'),gemsUI=document.querySelector('#gems'),progressUI=document.querySelector('#progress'),fallback=document.querySelector('#fallback');
const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Aventura 3D');root.prepend(canvas);
const gl=canvas.getContext('webgl',{antialias:true,alpha:false})||canvas.getContext('experimental-webgl');
if(!gl){fallback.style.display='block';fallback.textContent='Seu navegador não disponibilizou WebGL. Ative a aceleração de hardware ou teste outro navegador.';throw Error('WebGL indisponível');}
const vs=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uMVP;uniform vec3 uColor;varying vec3 vColor;void main(){gl_Position=uMVP*vec4(aPosition,1.0);float light=max(.35,dot(normalize(aNormal),normalize(vec3(-.35,.85,.5))));vColor=uColor*light;}`;
const fs=`precision mediump float;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program)}catch(e){fallback.style.display='block';fallback.textContent='Falha ao iniciar o renderizador 3D: '+e.message;throw e}
const posAttr=gl.getAttribLocation(program,'aPosition'),normAttr=gl.getAttribLocation(program,'aNormal'),mvpLoc=gl.getUniformLocation(program,'uMVP'),colorLoc=gl.getUniformLocation(program,'uColor');
const verts=[],norms=[];const faces=[
[[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],
[[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],
[[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],
[[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],
[[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],
[[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]];
for(const [n,quad] of faces){for(const i of [0,1,2,0,2,3]){verts.push(...quad[i]);norms.push(...n)}}
function buffer(data,loc){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)}
const cubePositions=new Float32Array(verts),cubeNormals=new Float32Array(norms);
const spherePositions=[],sphereNormals=[];
for(let j=0;j<12;j++)for(let i=0;i<20;i++){
 const pt=(a,b)=>{const t=a*Math.PI/12,u=b*Math.PI*2/20;return [Math.sin(t)*Math.cos(u),Math.cos(t),Math.sin(t)*Math.sin(u)]};
 const a=pt(j,i),b=pt(j+1,i),c=pt(j+1,i+1),d=pt(j,i+1);
 for(const v of [a,b,c,a,c,d]){spherePositions.push(...v);sphereNormals.push(...v)}
}
const cubeMesh=[cubePositions,cubeNormals],sphereMesh=[new Float32Array(spherePositions),new Float32Array(sphereNormals)];
const meshBuffers={cube:[gl.createBuffer(),gl.createBuffer()],sphere:[gl.createBuffer(),gl.createBuffer()]};
for(const [kind,arr] of [['cube',cubeMesh],['sphere',sphereMesh]])for(let i=0;i<2;i++){gl.bindBuffer(gl.ARRAY_BUFFER,meshBuffers[kind][i]);gl.bufferData(gl.ARRAY_BUFFER,arr[i],gl.STATIC_DRAW)}
let activeMesh=null;
function mesh(which){if(activeMesh===which)return;activeMesh=which;const arr=which==='sphere'?sphereMesh:cubeMesh;
 for(let i=0;i<2;i++){gl.bindBuffer(gl.ARRAY_BUFFER,meshBuffers[which][i]);const loc=i===0?posAttr:normAttr;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)}}
mesh('cube');gl.enable(gl.DEPTH_TEST);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=2*far*near/(near-far);return o}
function lookAt(eye,target){let z=[eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]];let n=Math.hypot(...z);z=z.map(v=>v/n);let x=[z[2],0,-z[0]];n=Math.hypot(...x);x=x.map(v=>v/n);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,v,i)=>s+v*eye[i],0),-y.reduce((s,v,i)=>s+v*eye[i],0),-z.reduce((s,v,i)=>s+v*eye[i],0),1])}
function model(x,y,z,w,h,d){return new Float32Array([w,0,0,0,0,h,0,0,0,0,d,0,x,y,z,1])}
function rgb(hex){return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255]}
let vp;function shape(kind,x,y,z,w,h,d,c){mesh(kind);gl.uniformMatrix4fv(mvpLoc,false,mul(vp,model(x,y,z,w,h,d)));gl.uniform3fv(colorLoc,rgb(c));gl.drawArrays(gl.TRIANGLES,0,kind==='sphere'?spherePositions.length/3:36)}
function box(x,y,z,w,h,d,c){shape('cube',x,y,z,w,h,d,c)}
function orb(x,y,z,w,h,d,c){shape('sphere',x,y,z,w,h,d,c)}
// Cinco aventuras 3D completas. Cada etapa tem percurso, cenário e mecânica próprios.
const LEVELS=[
 {name:'As Ilhas do Despertar',theme:'islands',sky:[.43,.76,.95],islands:[[0,0,10,10],[0,-12,8,7],[9,-22,8,8],[9,-34,9,9],[-1,-45,11,10]],bridges:[[0,-7.4,3,5,0],[4.6,-17.2,8,3,1],[9,-28,3,5,0],[4,-39.3,9,3,2]],gems:[[2,1],[-2,-12],[10,-22],[7,-34],[-2,-45]],switches:[[0,-12],[9,-34]],exit:[-1,-47],start:[0,2],trees:true},
 {name:'A Floresta das Luzes',theme:'forest',sky:[.32,.62,.69],islands:[[0,0,11,10],[-2,-12,8,8],[-8,-23,8,8],[-2,-34,8,8],[4,-45,11,10]],bridges:[[-1,-7.5,3,5,0],[-5,-17.5,3,6,1],[-5,-28.5,3,6,1],[1,-39.5,3,6,2]],gems:[[2,1],[-4,-12],[-9,-23],[-2,-34],[5,-45]],switches:[[-2,-12],[-2,-34]],exit:[4,-47],start:[0,2],trees:true,challenge:'lights'},
 {name:'O Templo Submerso',theme:'ocean',sky:[.05,.34,.57],islands:[[0,0,11,10],[0,-12,8,8],[7,-23,9,8],[1,-34,9,8],[-4,-45,10,10]],bridges:[[0,-7.5,3,5,0],[3.5,-17.5,8,3,1],[4,-28.5,8,3,1],[-1.5,-39.5,8,3,2]],gems:[[-2,1],[1,-12],[8,-23],[0,-34],[-5,-45]],switches:[[0,-12],[1,-34]],exit:[-4,-47],start:[0,2],challenge:'currents'},
 {name:'A Cidade das Engrenagens',theme:'machine',sky:[.49,.51,.75],islands:[[0,0,10,10],[4,-12,9,8],[4,-24,9,8],[-3,-36,10,8],[2,-48,11,10]],bridges:[[2,-7.5,3,5,0],[4,-18,3,6,1],[.5,-30,8,3,1],[-.5,-42,3,6,2]],gems:[[1,1],[5,-12],[3,-24],[-3,-36],[3,-48]],switches:[[4,-12],[-3,-36]],exit:[2,-50],start:[0,2],challenge:'gears'},
 {name:'O Coração das Dimensões',theme:'final',sky:[.20,.12,.42],islands:[[0,0,12,10],[0,-13,10,9],[9,-25,10,9],[2,-37,11,9],[0,-50,14,12]],bridges:[[0,-8,3,6,0],[4.5,-19,9,3,1],[5.5,-31,9,3,1],[1,-43,3,6,2]],gems:[[-2,1],[1,-13],[10,-25],[2,-37],[0,-50]],switches:[[0,-13],[2,-37]],exit:[0,-53],start:[0,2],challenge:'final'}
];
const SAVE_KEY='miau-bit-coracao-dimensoes-fases-v1';
let unlocked=Math.max(1,Math.min(5,Number(localStorage.getItem(SAVE_KEY))||(localStorage.getItem('miau-bit-dimensao-3d-concluida')==='sim'?2:1)));
let stage=0,level=LEVELS[0],platforms=[],bridges=[],crystals=[],switches=[],trees=[],flowerBeds=[];
function loadLevel(index){
 stage=index;level=LEVELS[stage];
 platforms=level.islands.map(([x,z,w,d])=>({x,z,w,d}));
 bridges=level.bridges.map(([x,z,w,d,unlock])=>({x,z,w,d,unlock}));
 crystals=level.gems.map(([x,z])=>({x,z,taken:false}));
 switches=level.switches.map(([x,z])=>({x,z,on:false}));
 trees=level.trees?platforms.flatMap((p,i)=>[[p.x+p.w*.3,p.z+p.d*.3],[p.x-p.w*.32,p.z-p.d*.3]]):[];
 flowerBeds=platforms.flatMap((p,pi)=>Array.from({length:14},(_,i)=>{
 const ax=Math.sin((i+1)*14.71+pi*3.2),az=Math.cos((i+1)*19.41+pi*2.8);
 return {x:p.x+ax*(p.w/2-.65),z:p.z+az*(p.d/2-.65),c:['#ff77c8','#ffe26a','#cfa1ff','#ffffff','#ff977c'][i%5]}
 }));
 x=level.start[0];y=0;z=level.start[1];vy=0;ground=true;collected=0;activated=0;done=false;checkpoint=[x,z];cameraYaw=0;cameraPitch=.42;
 gemsUI.textContent='💎 Cristais: 0/5';progressUI.textContent='🌉 Pontes: 0/2';
 document.getElementById('levelName').textContent=(stage+1)+'/5 · '+level.name;
 document.getElementById('levelPicker').value=String(stage);
 notice(['Explore as ilhas com Miau e Bit!','Siga os vaga-lumes e descubra as passagens luminosas!','Explore as ruínas sob o mar e conecte os transmissores!','Encontre os terminais que controlam as máquinas!','Restaure o Coração das Dimensões!'][stage]);
 if(window.setDimensionMusicStage)window.setDimensionMusicStage(stage);
 const forest=document.getElementById('forestFrame'),active=true;
 root.classList.toggle('forest-active',active);document.body.classList.toggle('forest-active',active);
 forest.hidden=!active;
 if(active){window.location.replace('regioes-3d/fase-'+(stage+1)+'/index.html');return;}
 else if(forest.getAttribute('src')!=='about:blank'){forest.src='about:blank'}

}
function refreshPicker(){const sel=document.getElementById('levelPicker');sel.innerHTML='';LEVELS.forEach((l,i)=>{const op=document.createElement('option');op.value=i;op.textContent=(i+1)+'. '+l.name+(i>=unlocked?' 🔒':'');op.disabled=i>=unlocked;sel.append(op)});sel.value=stage}
const keys=new Set();let x=0,y=0,z=2,vy=0,ground=true,collected=0,activated=0,done=false,clock=0;
let cameraYaw=0,cameraPitch=.42,walking=0,heading=0,checkpoint=[0,2];
const particleStars=Array.from({length:95},(_,i)=>({x:Math.sin(i*21.7)*38,y:6+(i%9)*2,z:-55+(i*37%70)}));
const clouds=Array.from({length:13},(_,i)=>({x:Math.sin(i*6.31)*36,z:10-i*6.7,y:-3-(i%3)*1.7}));

function solid(a,b){return [...platforms,...bridges.filter(q=>q.unlock<=activated)].some(p=>Math.abs(a-p.x)<p.w/2-.15&&Math.abs(b-p.z)<p.d/2-.15)}
function notice(t){msg.textContent=t}
function update(dt){
 clock+=dt;
 if(window.dimensionVictoryOpen||stage>=0)return;
 let strafe=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
 let forward=Number(keys.has('ArrowUp')||keys.has('KeyW'))-Number(keys.has('ArrowDown')||keys.has('KeyS'));
 const len=Math.hypot(strafe,forward)||1;strafe/=len;forward/=len;
 const dx=(Math.cos(cameraYaw)*strafe+Math.sin(cameraYaw)*forward),dz=(Math.sin(cameraYaw)*strafe-Math.cos(cameraYaw)*forward);
 if(Math.hypot(dx,dz)>.1){heading=Math.atan2(dx,-dz);walking+=dt*12}
 if(keys.has('Space')&&ground){vy=stage===2?7.5:8.8;ground=false}
 vy-=22*dt;
 const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?9:5.7)*(stage===2?.86:1);
 const current=stage===2&&z<-10?.6*Math.sin(clock*1.6+z*.3):0;
 const nx=x+(dx*speed+current)*dt,nz=z+dz*speed*dt;
 y+=vy*dt;
 if(y<=0&&vy<=0&&solid(nx,nz)){y=0;vy=0;ground=true;x=nx;z=nz}
 else if(y>0){x=nx;z=nz;ground=false}
 else if(!solid(x,z)){ground=false}
 if(y<-9){x=checkpoint[0];y=0;z=checkpoint[1];vy=0;ground=true;notice('Ops! Miau voltou ao último ponto seguro. 🐾')}
 // Engrenagens móveis e pulsos do castelo: obstáculos de tempo, sem perguntas.
 if(stage===3||stage===4){
 const hazardPlatforms=stage===3?[1,2,3]:[1,2,3,4];
 for(const i of hazardPlatforms){const p=platforms[i];const hx=p.x+Math.sin(clock*(stage===3?1.7:2.3)+i)*p.w*.27;
 if(Math.hypot(x-hx,z-p.z)<.85&&y<1.15){x=checkpoint[0];z=checkpoint[1];y=0;vy=0;ground=true;notice(stage===3?'⚙️ Cuidado com as engrenagens!':'✨ Desvie dos pulsos do cristal!');break}}
 }

 for(const c of crystals)if(!c.taken&&Math.hypot(x-c.x,z-c.z)<1.1&&Math.abs(y)<2){c.taken=true;collected++;gemsUI.textContent=`💎 Cristais: ${collected}/5`;notice('Cristal encontrado! ✨')}
 for(const t of switches)if(!t.on&&Math.hypot(x-t.x,z-t.z)<1.3&&Math.abs(y)<2){t.on=true;activated++;checkpoint=[t.x,t.z];progressUI.textContent=`🌉 Pontes: ${activated}/2`;notice('Terminal ativado! Uma ponte apareceu! 🌉')}
 if(!done&&collected===5&&activated===2&&Math.hypot(x-level.exit[0],z-level.exit[1])<2.1){
 done=true;
 if(stage===4){localStorage.setItem('miau-bit-dimensao-3d-concluida','sim');localStorage.setItem('miau-bit-guardiao-das-dimensoes','sim');notice('🏆 O Coração das Dimensões foi restaurado!');document.getElementById('nextLevel').hidden=true}
 else{unlocked=Math.max(unlocked,stage+2);localStorage.setItem(SAVE_KEY,String(unlocked));refreshPicker();notice('🎉 Fase concluída! Uma nova região foi desbloqueada.');document.getElementById('nextLevel').hidden=false}
 if(window.showDimensionVictory)window.showDimensionVictory(stage,level.name);
 }

}
function render(){
 const w=root.clientWidth,h=root.clientHeight;
 if(canvas.width!==Math.round(w*devicePixelRatio)||canvas.height!==Math.round(h*devicePixelRatio)){
 canvas.width=Math.round(w*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);canvas.style.width=w+'px';canvas.style.height=h+'px'}
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...level.sky,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const distance=11.5;
 const eye=[x+Math.sin(cameraYaw)*distance*Math.cos(cameraPitch),y+3+Math.sin(cameraPitch)*distance,z+Math.cos(cameraYaw)*distance*Math.cos(cameraPitch)];
 vp=mul(perspective(Math.PI/3,canvas.width/canvas.height,.1,180),lookAt(eye,[x,y+1.2,z]));
 // Nuvens flutuantes e céu mágico, longe das ilhas
 if(stage!==2)for(const c of clouds){orb(c.x,c.y,c.z,5,1.6,2.7,'#e6f9ff');orb(c.x+2,c.y+.7,c.z,3.4,1.5,2.5,'#f3fdff');orb(c.x-2,c.y+.35,c.z,3.5,1.1,2,'#ffffff')}
 for(const p of platforms){
  orb(p.x,-2.2,p.z,p.w*.59,3.1,p.d*.59,['#6a52a4','#39644c','#1d6185','#6d6279','#54316d'][stage]);
  orb(p.x,-.35,p.z,p.w*.68,.75,p.d*.68,'#318c76');
  box(p.x,-.23,p.z,p.w,.4,p.d,['#42b985','#44b86a','#5a9fbd','#b39d8b','#8955b3'][stage]);
  orb(p.x,.04,p.z,p.w*.61,.2,p.d*.61,['#8ce5a0','#69c88a','#85d9de','#d7c2a4','#ba9df5'][stage]);
  for(let i=0;i<4;i++){const px=p.x-p.w/2+.8+(i+.5)*(p.w-1.6)/4;box(px,.12,p.z+p.d/2-.45,.45,.24,.38,'#f5d5fa')}}
 for(const b of bridges)if(b.unlock<=activated){box(b.x,-.17,b.z,b.w,.3,b.d,'#ddba77');
  for(let i=-1;i<=1;i+=2){box(b.x+i*(b.w/2-.2),.45,b.z,.12,1.1,b.d,'#fff0bd')}}
 for(const [tx,tz] of trees){
 box(tx,.83,tz,.3,1.65,.3,'#936044');
 orb(tx,1.8,tz,1.3,1.1,1.2,stage===1?'#7045ae':'#18a783');orb(tx+.5,2.12,tz,.95,.85,.9,stage===1?'#bd85f7':'#55dca0');orb(tx-.43,2.25,tz+.15,1.02,.87,1.05,'#28c28c');
 orb(tx+.42,.28,tz+.5,.27,.25,.27,'#f48ccf')}
 for(const f of flowerBeds){box(f.x,.14,f.z,.06,.27,.06,'#368f65');orb(f.x,.34,f.z,.16,.16,.16,f.c);orb(f.x+.1,.33,f.z,.09,.09,.09,'#ffe992')}
 // Cachoeiras e névoa: ilhas flutuantes ganham paisagem vertical.
 if(stage===0||stage===1)for(const [wx,wz] of [[4.6,-1],[12.8,-23],[-5.1,-46]]){
  box(wx,-3.7,wz,.62,7.2,.3,'#62dfff');orb(wx,-7.3,wz,.95,.25,.8,'#d7faff');
  for(let k=0;k<4;k++)orb(wx+Math.sin(clock*1.7+k)*.2,-1-k*1.5,wz+.28,.12,.2,.12,'#f4ffff')
 }
 for(let i=0;i<20;i++){const p=platforms[i%platforms.length];const px=p.x+Math.sin(i*13.1)*p.w*.35,pz=p.z+Math.cos(i*8.3)*p.d*.35;
 orb(px,1.4+Math.sin(clock*2+i)*.2,pz,.065,.065,.065,'#fff0ad')}
 for(let i=0;i<platforms.length;i++){const p=platforms[i];box(p.x-p.w/2+.6,.18,p.z-p.d/2+.6,.45,.4,.45,'#ffda78');box(p.x+p.w/2-.6,.18,p.z+p.d/2-.6,.45,.4,.45,'#9de8ff')}
 for(const c of crystals)if(!c.taken){const yy=1.2+Math.sin(clock*3+c.x)*.23;orb(c.x,yy,c.z,.46,.66,.46,'#2ae8f7');orb(c.x,yy+.54,c.z,.2,.25,.2,'#f5ffff');orb(c.x,.12,c.z,.48,.07,.48,'#b1ffff')}
 for(const t of switches){box(t.x,.52,t.z,1.1,1.04,1.1,t.on?'#22ddad':'#8055d6');box(t.x,1.12,t.z,.7,.2,.7,'#4beaff');box(t.x,1.45,t.z,.3,.45,.3,'#ffe596')}
 // Obstáculos móveis tridimensionais para as regiões mais difíceis.
 if(stage===3||stage===4)for(const i of (stage===3?[1,2,3]:[1,2,3,4])){
 const p=platforms[i],hx=p.x+Math.sin(clock*(stage===3?1.7:2.3)+i)*p.w*.27;
 orb(hx,.65,p.z,stage===3?.78:.58,.78,stage===3?.45:.58,stage===3?'#efb852':'#f887f3');
 if(stage===3){for(let k=0;k<8;k++){const a=k*Math.PI/4+clock;box(hx+Math.cos(a)*.75,.65+Math.sin(a)*.75,p.z,.24,.24,.45,'#f7d780')}}
 }
 // Portal de chegada da região, sempre na ilha final.
 for(let a=0;a<16;a++){const angle=a*Math.PI/8;orb(level.exit[0]+Math.cos(angle)*1.5,2.2+Math.sin(angle)*1.5,level.exit[1],.32,.4,.32,'#d6a5ff')}
 box(level.exit[0],2.2,level.exit[1],1.7,2.3,.24,collected===5&&activated===2?'#56faff':'#6849b3');
 if(stage===4&&done){for(let i=0;i<22;i++){const a=i*Math.PI/11+clock*.3;orb(level.exit[0]+Math.cos(a)*3,3+Math.sin(a)*2,level.exit[1],.24,.24,.24,['#f7df7a','#e9b3ff','#6bffff'][i%3])}}
 // Cenários temáticos: corais, cogumelos, engrenagens e cristais finais.
 for(let i=0;i<platforms.length;i++){
  const p=platforms[i],cx=p.x+p.w*.32,cz=p.z-p.d*.27;
  if(stage===1){orb(cx,.65,cz,1.35,.45,1.35,'#ef78d5');box(cx,.33,cz,.27,.7,.27,'#ffe7ae');orb(cx,1.08,cz,.9,.25,.9,'#b57cfa');}
  if(stage===2){for(let k=0;k<5;k++){const a=k*1.26;orb(cx+Math.cos(a)*.9,.45+Math.sin(clock*1.5+k)*.07,cz+Math.sin(a)*.8,.24,.8,.24,['#fa7a9f','#ffcb6b','#a98fff'][k%3])}for(let k=0;k<8;k++)orb(cx+Math.sin(clock+k*3)*2,1.3+k*.7,cz,.11,.11,.11,'#c9ffff')}
  if(stage===3){orb(cx,1.3,cz,1.5,1.5,.38,'#c2b4de');orb(cx,1.3,cz,1.08,1.08,.44,'#7c65ad');orb(cx,1.3,cz,.38,.38,.55,'#ffdd85');for(let k=0;k<8;k++){const a=k*Math.PI/4+clock*.6;box(cx+Math.cos(a)*1.1,1.3+Math.sin(a)*1.1,cz,.4,.4,.45,'#e2b96e')}}
  if(stage===4){for(let k=0;k<5;k++)orb(cx+Math.sin(k*2.5)*1.5,.9+k*.35,cz+Math.cos(k*2.5),.38,.65,.38,['#77efff','#fa9cff','#f8e68d'][k%3])}
 }

 // Miau em terceira pessoa: corpo, pernas animadas, rosto, orelhas, cauda e mochila
 const bob=ground&&Math.abs(Math.sin(walking))>.1?.06*Math.sin(walking*2):0;
 const step=ground?Math.sin(walking)*.18:0;
 box(x-.23,y+.32+step,z,.28,.64,.35,'#e89135');box(x+.23,y+.32-step,z,.28,.64,.35,'#e89135');
 orb(x,y+.91+bob,z,.47,.59,.4,'#ffab37');orb(x,y+1.62+bob,z-.06,.56,.49,.49,'#ffc45b');
 orb(x-.34,y+2.05+bob,z-.06,.22,.36,.2,'#f48c42');orb(x+.34,y+2.05+bob,z-.06,.22,.36,.2,'#f48c42');
 orb(x-.23,y+1.7+bob,z-.47,.16,.19,.11,'#ffffff');orb(x+.23,y+1.7+bob,z-.47,.16,.19,.11,'#ffffff');
 box(x-.23,y+1.69+bob,z-.56,.10,.15,.08,'#262243');box(x+.23,y+1.69+bob,z-.56,.10,.15,.08,'#262243');
 box(x,y+1.43+bob,z-.48,.21,.15,.11,'#f17d9e');box(x,y+.98+bob,z+.42,.6,.7,.23,'#8b51db');
 box(x+.46,y+.95+bob,z+.42,.24,.25,.8,'#e58e38');
 // Bit acompanha Miau flutuando ao lado
 const bx=x+1.25,bz=z+.8,by=y+1.12+Math.sin(clock*3)*.14;
 orb(bx,by,bz,.46,.43,.42,'#f3fbff');box(bx,by+.1,bz-.36,.53,.29,.09,'#273f79');
 box(bx-.13,by+.1,bz-.42,.10,.14,.08,'#4ef9ff');box(bx+.13,by+.1,bz-.42,.10,.14,.08,'#4ef9ff');
 box(bx,by+.52,bz,.1,.3,.1,'#ecfaff');orb(bx,by+.71,bz,.12,.12,.12,'#4ef9ff');
}
window.addEventListener('message',event=>{
 if(event.origin!=='null'&&event.origin!==location.origin)return;
 if(event.source!==document.getElementById('forestFrame').contentWindow)return;
 if(!event.data||event.data.type!=='miau-bit-regiao-concluida'||event.data.fase!==stage+1)return;
 unlocked=Math.max(unlocked,Math.min(5,stage+2));localStorage.setItem(SAVE_KEY,String(unlocked));
 if(stage===4){localStorage.setItem('miau-bit-dimensao-3d-concluida','sim');localStorage.setItem('miau-bit-guardiao-das-dimensoes','sim');}
 refreshPicker();document.getElementById('nextLevel').hidden=stage===4;
 if(window.showDimensionVictory)window.showDimensionVictory(stage,LEVELS[stage].name);
});
const requestedStage=Number(new URLSearchParams(location.search).get('fase'));
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(frame)}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code)});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
let dragging=false,px=0,py=0;
canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;cameraYaw-=(e.clientX-px)*.007;cameraPitch=Math.max(.13,Math.min(.95,cameraPitch+(e.clientY-py)*.005));px=e.clientX;py=e.clientY});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);

document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>keys.delete(k))});
document.getElementById('levelPicker').addEventListener('change',e=>{const n=Number(e.target.value);if(n<unlocked){loadLevel(n);document.getElementById('nextLevel').hidden=true}});
document.getElementById('nextLevel').addEventListener('click',()=>{if(stage<4&&stage+1<unlocked){loadLevel(stage+1);document.getElementById('nextLevel').hidden=true}});
window.dimensionVictoryNext=()=>{if(stage<4&&stage+1<unlocked){loadLevel(stage+1);document.getElementById('nextLevel').hidden=true}};
window.dimensionVictoryReplay=()=>{loadLevel(stage);document.getElementById('nextLevel').hidden=true};
// A fase é aberta como página completa: evita WebGL simultâneo em iframes
// e funciona também em file://, sem depender de service worker.
for(let i=1;i<=5;i++){
 if(localStorage.getItem('miau-bit-dimensao-3d-fase-'+i+'-concluida')==='sim'){
  unlocked=Math.max(unlocked,Math.min(5,i+1));
 }
}
localStorage.setItem(SAVE_KEY,String(unlocked));
refreshPicker();loadLevel(requestedStage>=1&&requestedStage<=5&&requestedStage<=unlocked?requestedStage-1:0);

requestAnimationFrame(frame);
