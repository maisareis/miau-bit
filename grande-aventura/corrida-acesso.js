(()=>{'use strict';
const el=document.getElementById('racePortal');if(!el)return;
let completed=0;const done=[];
try{for(let w=1;w<=10;w++){let n=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo'+w))||1));let finished=localStorage.getItem('miau-bit-aventura-mundo'+w+'-completo')==='sim';if(finished)completed=Math.max(completed,w);done.push(finished?5:n-1)}for(let w=1;w<=completed;w++)done[w-1]=5}catch(e){}
const count=done.reduce((a,b)=>a+b,0),unlocked=count>=10;
el.classList.toggle('locked',!unlocked);el.setAttribute('aria-label',unlocked?'Jogar Grande Prêmio das Dimensões':'Corrida das Dimensões: conclua 10 fases para desbloquear');
el.querySelector('span').textContent=unlocked?'🏁 Grande Prêmio':'🔒 Corrida · '+count+'/10';
el.addEventListener('click',e=>{if(!unlocked){e.preventDefault();alert('🏎️ Conclua 10 fases da Grande Aventura para liberar a Corrida das Dimensões. Você já concluiu '+count+'!')}});
})();
