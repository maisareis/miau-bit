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
const platforms=[{x:0,z:0,w:10,d:10},{x:0,z:-12,w:8,d:7},{x:9,z:-22,w:8,d:8},{x:9,z:-34,w:9,d:9},{x:-1,z:-45,w:11,d:10}];
const bridges=[{x:0,z:-7.4,w:3,d:5,unlock:0},{x:4.6,z:-17.2,w:8,d:3,unlock:1},{x:9,z:-28,w:3,d:5,unlock:0},{x:4,z:-39.3,w:9,d:3,unlock:2}];
const crystals=[[2,1],[-2,-12],[10,-22],[7,-34],[-2,-45]].map(([x,z])=>({x,z,taken:false}));
const switches=[{x:0,z:-12,on:false},{x:9,z:-34,on:false}];
const trees=[[3,3],[-3,-2],[2,-13],[-2,-12],[12,-23],[7,-34],[-4,-45],[3,-48]];
const flowerBeds=platforms.flatMap((p,pi)=>Array.from({length:14},(_,i)=>{
 const ax=Math.sin((i+1)*14.71+pi*3.2),az=Math.cos((i+1)*19.41+pi*2.8);
 return {x:p.x+ax*(p.w/2-.65),z:p.z+az*(p.d/2-.65),c:['#ff77c8','#ffe26a','#cfa1ff','#ffffff','#ff977c'][i%5]}
}));
const keys=new Set();let x=0,y=0,z=2,vy=0,ground=true,collected=0,activated=0,done=false,clock=0;
let cameraYaw=0,cameraPitch=.42,walking=0,heading=0,checkpoint=[0,2];
const particleStars=Array.from({length:95},(_,i)=>({x:Math.sin(i*21.7)*38,y:6+(i%9)*2,z:-55+(i*37%70)}));
const clouds=Array.from({length:13},(_,i)=>({x:Math.sin(i*6.31)*36,z:10-i*6.7,y:-3-(i%3)*1.7}));

function solid(a,b){return [...platforms,...bridges.filter(q=>q.unlock<=activated)].some(p=>Math.abs(a-p.x)<p.w/2-.15&&Math.abs(b-p.z)<p.d/2-.15)}
function notice(t){msg.textContent=t}
function update(dt){
 clock+=dt;
 let strafe=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
 let forward=Number(keys.has('ArrowUp')||keys.has('KeyW'))-Number(keys.has('ArrowDown')||keys.has('KeyS'));
 const len=Math.hypot(strafe,forward)||1;strafe/=len;forward/=len;
 const dx=(Math.cos(cameraYaw)*strafe+Math.sin(cameraYaw)*forward),dz=(Math.sin(cameraYaw)*strafe-Math.cos(cameraYaw)*forward);
 if(Math.hypot(dx,dz)>.1){heading=Math.atan2(dx,-dz);walking+=dt*12}
 if(keys.has('Space')&&ground){vy=8.8;ground=false}
 vy-=22*dt;
 const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?9:5.7;
 const nx=x+dx*speed*dt,nz=z+dz*speed*dt;
 y+=vy*dt;
 if(y<=0&&vy<=0&&solid(nx,nz)){y=0;vy=0;ground=true;x=nx;z=nz}
 else if(y>0){x=nx;z=nz;ground=false}
 else if(!solid(x,z)){ground=false}
 if(y<-9){x=checkpoint[0];y=0;z=checkpoint[1];vy=0;ground=true;notice('Ops! Miau voltou ao último ponto seguro. 🐾')}
 for(const c of crystals)if(!c.taken&&Math.hypot(x-c.x,z-c.z)<1.1&&Math.abs(y)<2){c.taken=true;collected++;gemsUI.textContent=`💎 Cristais: ${collected}/5`;notice('Cristal encontrado! ✨')}
 for(const t of switches)if(!t.on&&Math.hypot(x-t.x,z-t.z)<1.3&&Math.abs(y)<2){t.on=true;activated++;checkpoint=[t.x,t.z];progressUI.textContent=`🌉 Pontes: ${activated}/2`;notice('Terminal ativado! Uma ponte apareceu! 🌉')}
 if(!done&&collected===5&&activated===2&&Math.hypot(x+1,z+47)<1.9){done=true;localStorage.setItem('miau-bit-dimensao-3d-concluida','sim');notice('🎉 Conexão Secreta concluída! Miau, Bit e Luma conseguiram!')}
}
function render(){
 const w=root.clientWidth,h=root.clientHeight;
 if(canvas.width!==Math.round(w*devicePixelRatio)||canvas.height!==Math.round(h*devicePixelRatio)){
 canvas.width=Math.round(w*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);canvas.style.width=w+'px';canvas.style.height=h+'px'}
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.43,.76,.95,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const distance=11.5;
 const eye=[x+Math.sin(cameraYaw)*distance*Math.cos(cameraPitch),y+3+Math.sin(cameraPitch)*distance,z+Math.cos(cameraYaw)*distance*Math.cos(cameraPitch)];
 vp=mul(perspective(Math.PI/3,canvas.width/canvas.height,.1,180),lookAt(eye,[x,y+1.2,z]));
 // Nuvens flutuantes e céu mágico, longe das ilhas
 for(const c of clouds){orb(c.x,c.y,c.z,5,1.6,2.7,'#e6f9ff');orb(c.x+2,c.y+.7,c.z,3.4,1.5,2.5,'#f3fdff');orb(c.x-2,c.y+.35,c.z,3.5,1.1,2,'#ffffff')}
 for(const p of platforms){
  orb(p.x,-2.2,p.z,p.w*.59,3.1,p.d*.59,'#6a52a4');
  orb(p.x,-.35,p.z,p.w*.68,.75,p.d*.68,'#318c76');
  box(p.x,-.23,p.z,p.w,.4,p.d,'#42b985');
  orb(p.x,.04,p.z,p.w*.61,.2,p.d*.61,'#8ce5a0');
  for(let i=0;i<4;i++){const px=p.x-p.w/2+.8+(i+.5)*(p.w-1.6)/4;box(px,.12,p.z+p.d/2-.45,.45,.24,.38,'#f5d5fa')}}
 for(const b of bridges)if(b.unlock<=activated){box(b.x,-.17,b.z,b.w,.3,b.d,'#ddba77');
  for(let i=-1;i<=1;i+=2){box(b.x+i*(b.w/2-.2),.45,b.z,.12,1.1,b.d,'#fff0bd')}}
 for(const [tx,tz] of trees){
 box(tx,.83,tz,.3,1.65,.3,'#936044');
 orb(tx,1.8,tz,1.3,1.1,1.2,'#18a783');orb(tx+.5,2.12,tz,.95,.85,.9,'#55dca0');orb(tx-.43,2.25,tz+.15,1.02,.87,1.05,'#28c28c');
 orb(tx+.42,.28,tz+.5,.27,.25,.27,'#f48ccf')}
 for(const f of flowerBeds){box(f.x,.14,f.z,.06,.27,.06,'#368f65');orb(f.x,.34,f.z,.16,.16,.16,f.c);orb(f.x+.1,.33,f.z,.09,.09,.09,'#ffe992')}
 // Cachoeiras e névoa: ilhas flutuantes ganham paisagem vertical.
 for(const [wx,wz] of [[4.6,-1],[12.8,-23],[-5.1,-46]]){
  box(wx,-3.7,wz,.62,7.2,.3,'#62dfff');orb(wx,-7.3,wz,.95,.25,.8,'#d7faff');
  for(let k=0;k<4;k++)orb(wx+Math.sin(clock*1.7+k)*.2,-1-k*1.5,wz+.28,.12,.2,.12,'#f4ffff')
 }
 for(let i=0;i<20;i++){const p=platforms[i%platforms.length];const px=p.x+Math.sin(i*13.1)*p.w*.35,pz=p.z+Math.cos(i*8.3)*p.d*.35;
 orb(px,1.4+Math.sin(clock*2+i)*.2,pz,.065,.065,.065,'#fff0ad')}
 for(let i=0;i<platforms.length;i++){const p=platforms[i];box(p.x-p.w/2+.6,.18,p.z-p.d/2+.6,.45,.4,.45,'#ffda78');box(p.x+p.w/2-.6,.18,p.z+p.d/2-.6,.45,.4,.45,'#9de8ff')}
 for(const c of crystals)if(!c.taken){const yy=1.2+Math.sin(clock*3+c.x)*.23;orb(c.x,yy,c.z,.46,.66,.46,'#2ae8f7');orb(c.x,yy+.54,c.z,.2,.25,.2,'#f5ffff');orb(c.x,.12,c.z,.48,.07,.48,'#b1ffff')}
 for(const t of switches){box(t.x,.52,t.z,1.1,1.04,1.1,t.on?'#22ddad':'#8055d6');box(t.x,1.12,t.z,.7,.2,.7,'#4beaff');box(t.x,1.45,t.z,.3,.45,.3,'#ffe596')}
 for(let a=0;a<16;a++){const angle=a*Math.PI/8;box(-1+Math.cos(angle)*1.5,2.2+Math.sin(angle)*1.5,-47,.35,.42,.35,'#d6a5ff')}
 box(-1,2.2,-47,1.7,2.3,.24,collected===5&&activated===2?'#56faff':'#6849b3');
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
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(frame)}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code)});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
let dragging=false,px=0,py=0;
canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;cameraYaw-=(e.clientX-px)*.007;cameraPitch=Math.max(.13,Math.min(.95,cameraPitch+(e.clientY-py)*.005));px=e.clientX;py=e.clientY});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);

document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>keys.delete(k))});
requestAnimationFrame(frame);
