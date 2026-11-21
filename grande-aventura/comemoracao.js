/* Comemorações do Coração das Dimensões: não interfere no motor 3D. */
(()=>{'use strict';
const overlay=document.getElementById('victory'),layer=document.getElementById('confettiLayer');
const title=document.getElementById('victoryTitle'),desc=document.getElementById('victoryText');
const characters=document.getElementById('victoryCharacters'),trophy=document.getElementById('victoryTrophy');
const badge=document.getElementById('victoryBadge'),next=document.getElementById('victoryContinue');
const replay=document.getElementById('victoryReplay'),close=document.getElementById('victoryClose');
let previousFocus=null;
window.dimensionVictoryOpen=false;
function fanfare(final){
 try{
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
 const ctx=new Audio(),gain=ctx.createGain();gain.gain.value=.11;gain.connect(ctx.destination);
 const notes=final?[72,76,79,84,79,84,88,91]:[72,76,79,84];
 notes.forEach((n,i)=>{const osc=ctx.createOscillator(),env=ctx.createGain(),start=ctx.currentTime+i*(final?.19:.15)+.03;
 osc.type='triangle';osc.frequency.value=440*Math.pow(2,(n-69)/12);
 env.gain.setValueAtTime(.0001,start);env.gain.exponentialRampToValueAtTime(.7,start+.035);
 env.gain.exponentialRampToValueAtTime(.0001,start+(final?.4:.32));
 osc.connect(env);env.connect(gain);osc.start(start);osc.stop(start+.45)});
 setTimeout(()=>ctx.close().catch(()=>{}),4000);
 }catch(e){/* O navegador pode bloquear áudio sem interação prévia. */}
}
function confetti(){layer.replaceChildren();const colors=['#ffe57d','#f49bff','#7af2ff','#a7ffbd','#ffffff','#ff8d9d'];
 for(let i=0;i<68;i++){const part=document.createElement('i');part.className='confetti';
 part.style.left=((i*37.7)%100)+'%';part.style.background=colors[i%colors.length];
 part.style.setProperty('--delay',(-i*.17)+'s');part.style.setProperty('--duration',(3+(i%7)*.37)+'s');
 part.style.setProperty('--drift',((i%9)-4)*24+'px');part.style.setProperty('--rotate',(i*19)+'deg');layer.append(part)}
}
window.showDimensionVictory=(stage,name)=>{
 const final=stage===4;previousFocus=document.activeElement;
 title.textContent=final?'O Coração foi restaurado!':'Fase '+(stage+1)+' concluída!';
 trophy.textContent=final?'🏆':'🌟';characters.textContent=final?'🐱 🤖 👧 👾 ✨':'🐱 🤖 🎊';
 desc.textContent=final?'Miau, Bit, Luma e Glitch celebram juntos! Você restaurou a magia das cinco dimensões e conquistou o título de Guardião das Dimensões.':'Você completou '+name+'! Miau e Bit comemoram sua descoberta. Uma nova região foi desbloqueada!';
 badge.hidden=!final;next.hidden=final;next.textContent='Explorar próxima fase ▶';
 confetti();overlay.hidden=false;window.dimensionVictoryOpen=true;next.focus();if(final)close.focus();fanfare(final);
};
function hide(){overlay.hidden=true;window.dimensionVictoryOpen=false;layer.replaceChildren();if(previousFocus&&previousFocus.focus)previousFocus.focus()}
next.addEventListener('click',()=>{hide();window.dimensionVictoryNext?.()});
replay.addEventListener('click',()=>{hide();window.dimensionVictoryReplay?.()});
close.addEventListener('click',hide);
document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape'){e.preventDefault();hide()}else if(e.key==='Tab'){const focusable=[...overlay.querySelectorAll('button:not([hidden])')];const idx=focusable.indexOf(document.activeElement);if(e.shiftKey&&idx===0){e.preventDefault();focusable.at(-1).focus()}else if(!e.shiftKey&&idx===focusable.length-1){e.preventDefault();focusable[0].focus()}}});
})();
