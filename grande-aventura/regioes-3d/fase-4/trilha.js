(()=>{'use strict';
const stage=Number(document.documentElement.dataset.stage||1)-1;
const button=document.getElementById('musicButton');if(!button)return;
const tunes=[
 {notes:[76,79,83,88,86,83,79,74,76,79,81,83,79,76,74,71],bass:[45,52,48,43],pace:290,wave:'sine'},
 {notes:[79,83,86,91,88,86,83,79,76,79,83,86,88,86,83,79],bass:[48,55,52,55],pace:335,wave:'triangle'},
 {notes:[69,74,76,81,79,76,74,69,67,71,74,79,76,74,71,67],bass:[41,48,45,48],pace:415,wave:'sine'},
 {notes:[64,67,71,76,71,67,64,60,64,69,72,76,72,69,64,60],bass:[40,47,43,47],pace:230,wave:'triangle'},
 {notes:[76,79,83,88,91,88,86,83,79,83,86,91,88,86,83,79],bass:[45,52,48,43],pace:255,wave:'sine'}
];const song=tunes[Math.max(0,Math.min(4,stage))];
let ctx,master,interval=null,index=0,playing=false,starting=false;
const hz=n=>440*Math.pow(2,(n-69)/12);
function tone(note,time,len,type,volume){
 const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();osc.type=type;osc.frequency.setValueAtTime(hz(note),time);
 filter.type='lowpass';filter.frequency.value=type==='triangle'?1700:2600;
 gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.035);gain.gain.exponentialRampToValueAtTime(.0001,time+len);
 osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start(time);osc.stop(time+len+.02);
}
function tick(){if(!playing||!ctx||ctx.state!=='running')return;const t=ctx.currentTime+.03,n=song.notes[index%song.notes.length];
 if(index%4!==3)tone(n,t,song.pace/1000*.88,song.wave,.14);
 if(index%2===0)tone(n-12,t+.065,.27,'sine',.032);
 if(index%4===0){const b=song.bass[Math.floor(index/4)%song.bass.length];tone(b,t,.82,'triangle',.10);tone(b+12,t+.13,.5,'sine',.024)}
 if(index%8===7)tone(n+12,t+.09,.38,'sine',.028);index++;
}
async function start(){if(starting||playing)return;starting=true;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC){button.textContent='🔇 Áudio indisponível';return}
 if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=.25;master.connect(ctx.destination)}await ctx.resume();playing=true;button.textContent='🎵 Música ligada';tick();interval=setInterval(tick,song.pace);
 }catch(e){button.textContent='🔇 Música indisponível';console.warn(e)}finally{starting=false}}
function stop(){playing=false;button.textContent='🎵 Ligar música';if(interval){clearInterval(interval);interval=null}if(ctx)ctx.suspend().catch(()=>{})}
button.addEventListener('click',()=>playing?stop():start());
// browsers allow audio after first interaction. Start automatically on first gameplay input.
const first=()=>{if(!playing)start()};window.addEventListener('keydown',first,{once:true});document.querySelector('canvas')?.addEventListener('pointerdown',first,{once:true});
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(playing)ctx.resume().catch(()=>{})});
window.addEventListener('pagehide',()=>{if(interval)clearInterval(interval);if(ctx)ctx.close().catch(()=>{})});
})();