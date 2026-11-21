/* Trilha original do Coração das Dimensões — Web Audio, offline. */
(()=>{'use strict';
const btn=document.getElementById('musicToggle');
let ctx=null, master=null, timer=null, step=0, enabled=false, stage=0;
const melody=[76,79,83,88,86,83,79,74,76,79,81,83,79,76,74,71,69,74,76,81,79,76,74,69,71,74,79,83,81,79,76,74];
const bass=[45,45,52,52,48,48,43,43];
const songs=[
 {melody:melody,bass:bass,tempo:270,wave:'sine'},
 {melody:[79,83,86,91,88,86,83,79,76,79,83,86,88,86,83,79],bass:[48,55,52,55],tempo:345,wave:'triangle'},
 {melody:[69,74,76,81,79,76,74,69,67,71,74,79,76,74,71,67],bass:[41,48,45,48],tempo:440,wave:'sine'},
 {melody:[64,67,71,76,71,67,64,60,64,69,72,76,72,69,64,60],bass:[40,47,43,47],tempo:210,wave:'square'},
 {melody:[76,79,83,88,91,88,86,83,79,83,86,91,88,86,83,79],bass:[45,52,48,43],tempo:235,wave:'sawtooth'}
];
window.setDimensionMusicStage=function(next){stage=Math.max(0,Math.min(4,next));step=0;if(timer){clearInterval(timer);timer=setInterval(tick,songs[stage].tempo)}};
const hz=n=>440*Math.pow(2,(n-69)/12);
function voice(note,at,duration,type,volume){
 const o=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
 o.type=type;o.frequency.setValueAtTime(hz(note),at);
 filter.type='lowpass';filter.frequency.value=type==='triangle'?1800:1100;
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.025);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 o.connect(filter);filter.connect(gain);gain.connect(master);
 o.start(at);o.stop(at+duration+.04);
}
function tick(){
 if(!ctx||!enabled||ctx.state!=='running')return;
 const now=ctx.currentTime+.04;
 const song=songs[stage];const n=song.melody[step%song.melody.length];
 if(step%4!==3)voice(n,now,stage===2?.62:.34,song.wave,stage===3?.07:.13);
 if(step%2===0)voice(n-12,now+.09,.24,'triangle',.035);
 if(step%4===0){voice(song.bass[Math.floor(step/4)%song.bass.length],now,.8,'triangle',.095);voice(song.bass[Math.floor(step/4)%song.bass.length]+12,now+.12,.6,'sine',.03)}
 if(step%8===7)voice(88,now+.18,.45,'sine',.03);
 step++;
}
async function start(){
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio){btn.textContent='🔇 Áudio indisponível';btn.disabled=true;return}
  if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.28;master.connect(ctx.destination)}
  await ctx.resume();enabled=true;btn.textContent='🎵 Música ligada';
  if(!timer){tick();timer=setInterval(tick,songs[stage].tempo)}
 }catch(e){btn.textContent='🔇 Áudio indisponível';console.warn('Música indisponível',e)}
}
function stop(){enabled=false;btn.textContent='🔇 Ligar música';if(timer){clearInterval(timer);timer=null}if(ctx)ctx.suspend().catch(()=>{})}
btn.addEventListener('click',()=>enabled?stop():start());
/* O navegador exige interação para iniciar áudio. O botão é o controle explícito. */
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden){ctx.suspend().catch(()=>{})}else if(enabled){ctx.resume().catch(()=>{})}});
window.addEventListener('pagehide',()=>{if(timer)clearInterval(timer);if(ctx)ctx.close().catch(()=>{})});
})();
