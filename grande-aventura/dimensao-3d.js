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
buffer(verts,posAttr);buffer(norms,normAttr);gl.enable(gl.DEPTH_TEST);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=2*far*near/(near-far);return o}
function lookAt(eye,target){let z=[eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]];let n=Math.hypot(...z);z=z.map(v=>v/n);let x=[z[2],0,-z[0]];n=Math.hypot(...x);x=x.map(v=>v/n);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,v,i)=>s+v*eye[i],0),-y.reduce((s,v,i)=>s+v*eye[i],0),-z.reduce((s,v,i)=>s+v*eye[i],0),1])}
function model(x,y,z,w,h,d){return new Float32Array([w,0,0,0,0,h,0,0,0,0,d,0,x,y,z,1])}
function rgb(hex){return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255]}
let vp;function box(x,y,z,w,h,d,c){gl.uniformMatrix4fv(mvpLoc,false,mul(vp,model(x,y,z,w,h,d)));gl.uniform3fv(colorLoc,rgb(c));gl.drawArrays(gl.TRIANGLES,0,36)}
const platforms=[{x:0,z:0,w:10,d:10},{x:0,z:-12,w:8,d:7},{x:9,z:-22,w:8,d:8},{x:9,z:-34,w:9,d:9},{x:-1,z:-45,w:11,d:10}];
const bridges=[{x:0,z:-7.4,w:3,d:5,unlock:0},{x:4.6,z:-17.2,w:8,d:3,unlock:1},{x:9,z:-28,w:3,d:5,unlock:0},{x:4,z:-39.3,w:9,d:3,unlock:2}];
const crystals=[[2,1],[-2,-12],[10,-22],[7,-34],[-2,-45]].map(([x,z])=>({x,z,taken:false}));
const switches=[{x:0,z:-12,on:false},{x:9,z:-34,on:false}];
const trees=[[3,3],[-3,-2],[2,-13],[-2,-12],[12,-23],[7,-34],[-4,-45],[3,-48]];
const keys=new Set();let x=0,y=0,z=2,vy=0,ground=true,collected=0,activated=0,done=false,clock=0;
function solid(a,b){return [...platforms,...bridges.filter(q=>q.unlock<=activated)].some(p=>Math.abs(a-p.x)<p.w/2-.15&&Math.abs(b-p.z)<p.d/2-.15)}
function notice(t){msg.textContent=t}
function update(dt){clock+=dt;let dx=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));let dz=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
if(keys.has('Space')&&ground){vy=8.5;ground=false}vy-=22*dt;const nx=x+dx*6.2*dt,nz=z+dz*6.2*dt;y+=vy*dt;
if(y<=0&&vy<=0&&solid(nx,nz)){y=0;vy=0;ground=true;x=nx;z=nz}else if(y>0){x=nx;z=nz;ground=false}
if(y<-8){x=0;y=0;z=2;vy=0;ground=true;notice('Você caiu! Tente novamente.')}
for(const c of crystals)if(!c.taken&&Math.hypot(x-c.x,z-c.z)<1.15&&Math.abs(y)<2){c.taken=true;collected++;gemsUI.textContent=`💎 Cristais: ${collected}/5`;notice('Cristal encontrado! ✨')}
for(const s of switches)if(!s.on&&Math.hypot(x-s.x,z-s.z)<1.25&&Math.abs(y)<2){s.on=true;activated++;progressUI.textContent=`🌉 Pontes: ${activated}/2`;notice('Terminal ativado! Uma nova ponte apareceu!')}
if(!done&&collected===5&&activated===2&&Math.hypot(x+1,z+47)<1.9){done=true;localStorage.setItem('miau-bit-dimensao-3d-concluida','sim');notice('🎉 Você concluiu a Conexão Secreta! Miau, Bit e Luma conseguiram!')}
}
function render(){const w=root.clientWidth,h=root.clientHeight;if(canvas.width!==Math.round(w*devicePixelRatio)||canvas.height!==Math.round(h*devicePixelRatio)){canvas.width=Math.round(w*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);canvas.style.width=w+'px';canvas.style.height=h+'px'}gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.48,.78,.97,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);vp=mul(perspective(Math.PI/3,canvas.width/canvas.height,.1,160),lookAt([x+11,y+12,z+17],[x,y+1,z-5]));
box(0,-15,-22,160,.3,160,'#91c8c4');
for(const p of platforms){box(p.x,-1.3,p.z,p.w,2.6,p.d,'#6a58b2');box(p.x,-.1,p.z,p.w,.25,p.d,'#67c987');box(p.x,0,p.z,p.w-.6,.08,p.d-.6,'#80e7a5')}
for(const b of bridges)if(b.unlock<=activated){box(b.x,-.2,b.z,b.w,.35,b.d,'#d7b66e');for(let i=-1;i<=1;i+=2)box(b.x+i*(b.w/2-.2),.15,b.z,.13,.6,b.d,'#fff1a9')}
for(const [tx,tz] of trees){box(tx,.7,tz,.35,1.5,.35,'#9a6d45');box(tx,1.7,tz,1.4,1.2,1.4,'#2fc383');box(tx,2.35,tz,.8,.6,.8,'#62e3a5')}
for(const c of crystals)if(!c.taken){const yy=1.25+Math.sin(clock*3+c.x)*.2;box(c.x,yy,c.z,.7,.9,.7,'#49f4ff');box(c.x,yy+.5,c.z,.3,.25,.3,'#f0ffff')}
for(const s of switches){box(s.x,.55,s.z,1,1.1,1,s.on?'#35edb1':'#9162ef');box(s.x,1.2,s.z,.6,.2,.6,'#4beaff')}
for(let a=0;a<12;a++){const angle=a*Math.PI/6;box(-1+Math.cos(angle)*1.55,2.3+Math.sin(angle)*1.55,-47,.38,.42,.38,'#d7a6ff')}box(-1,2.3,-47,1.9,2.3,.2,collected===5&&activated===2?'#54ffff':'#744ac7');
box(x,y+.85,z,.78,1.05,.75,'#ffac36');box(x,y+1.55,z-.1,.95,.78,.8,'#ffc153');box(x-.24,y+1.68,z-.52,.18,.24,.12,'#ffffff');box(x+.24,y+1.68,z-.52,.18,.24,.12,'#ffffff');box(x-.24,y+1.68,z-.6,.09,.12,.07,'#292345');box(x+.24,y+1.68,z-.6,.09,.12,.07,'#292345');box(x-.35,y+2.08,z,.3,.4,.26,'#ff8c4d');box(x+.35,y+2.08,z,.3,.4,.26,'#ff8c4d');box(x+.85,y+1.15,z+.7,.65,.75,.65,'#f4f9ff');box(x+.85,y+.65,z+.7,.5,.35,.45,'#4beaff');box(x+.85,y+1.25,z+.34,.48,.24,.12,'#273c72');
}
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(frame)}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code)});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>keys.delete(k))});
requestAnimationFrame(frame);
