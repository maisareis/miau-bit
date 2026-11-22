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
const worldInfo={
1:{icon:'🌳',name:'Floresta dos Algoritmos',names,descriptions,configs},
2:{icon:'🏰',name:'Castelo das Senhas',names:castleNames,descriptions:castleDescriptions,configs:castleConfigs},
3:{icon:'🤖',name:'Cidade dos Robôs',names:['','O Primeiro Circuito','Esteiras em Movimento','O Elevador Maluco','O Código dos Robôs','O Robô Descontrolado'],descriptions:['','Observe os robôs patrulhando e desvie deles!','As esteiras empurram Miau e Luma. Pule no momento certo!','As plataformas móveis mudam de altura. Espere e salte!','Ative os circuitos na ordem 1, 2 e 3.','Desligue os três núcleos do robô gigante!'],configs:{}},
4:{icon:'💎',name:'Caverna dos Dados',names:['','Cristais Perdidos','Pedras que Somem','O Labirinto das Sequências','O Rio de Dados','O Coração da Caverna'],descriptions:['','Explore a caverna e evite os cristais pontiagudos.','Algumas plataformas aparecem e desaparecem. Observe o ritmo!','Encontre os cristais na ordem 1, 2 e 3.','Salte entre plataformas móveis sobre os abismos.','Ative os três cristais para estabilizar a caverna!'],configs:{}},
5:{icon:'🛡️',name:'Cyberlândia',names:['','A Mensagem Suspeita','A Ponte da Privacidade','Wi-Fi em Perigo','O Labirinto do Glitch','O Confronto Final'],descriptions:['','Cuidado com mensagens suspeitas! Desvie das ameaças digitais.','Proteja seus dados e atravesse as plataformas temporárias.','Redes desconhecidas podem ser arriscadas: acione os escudos na ordem!','O Glitch muda os caminhos. Observe as plataformas e os drones!','Ative os três escudos para derrotar o Glitch e proteger Cyberlândia!'],configs:{}}
};
const nextWorlds={
6:{icon:'🏭',name:'Fábrica dos Comandos',names:['','A Esteira Acorda','Engrenagens em Movimento','A Ponte Programada','Robôs em Equipe','O Núcleo da Fábrica'],descriptions:['','Explore a fábrica e ligue o primeiro circuito.','Pule as esteiras e sincronize seus movimentos.','Ative os mecanismos na ordem para reconstruir a ponte.','Encontre os três comandos e evite os robôs.','Desligue a máquina antes que as engrenagens parem.']},
7:{icon:'🌿',name:'Jardim das Decisões',names:['','Flores do Amanhecer','O Caminho das Cores','As Pontes Condicionais','O Labirinto das Escolhas','O Coração do Jardim'],descriptions:['','Ative os botões que fazem as flores crescer.','Observe os sinais e escolha a rota.','Ligue as pontes seguindo a sequência dos interruptores.','Combine plataformas móveis e decisões.','Restaure os três núcleos do jardim.']},
8:{icon:'🌊',name:'Oceano das Conexões',names:['','O Mergulho Digital','Correntes Submarinas','Os Cabos de Coral','A Rede das Profundezas','O Farol Submerso'],descriptions:['','Mergulhe no oceano e encontre os transmissores submersos.','Desvie das correntes e explore os recifes.','Conecte os cabos entre as estações submarinas.','Ative os transmissores das profundezas na ordem correta.','Acenda o farol submerso para proteger a mensagem.']},
9:{icon:'📚',name:'Arquivo dos Mistérios',names:['','Livros Perdidos','Estantes Móveis','O Padrão Secreto','Arquivos em Ordem','A Biblioteca Viva'],descriptions:['','Encontre os arquivos espalhados.','Salte pelas estantes móveis.','Ative os mecanismos na ordem 1, 2 e 3.','Combine plataformas e circuitos de classificação.','Restaure o arquivo central.']},
10:{icon:'🏯',name:'Fortaleza do Glitch',names:['','Portões da Fortaleza','A Torre dos Erros','O Labirinto Digital','A Máquina do Glitch','A Última Conexão'],descriptions:['','Atravesse os portões e encontre os escudos.','Desvie das armadilhas que mudam de lugar.','Ative os terminais na ordem certa.','Desligue os mecanismos da máquina do Glitch.','Restaure os três núcleos e conclua a aventura!']}
};
for(const [id,info] of Object.entries(nextWorlds)){
 const w=Number(id);worldInfo[w]={...info,configs:{}};
 for(let l=1;l<=5;l++){
  const hard=w-5,spikes=[675,935,1470,1870,2300];
  if(l>=3)spikes.push(2020);
  const cfg={width:2800,coins:[340,530,820,1095,1420,1650,1950,2450],spikes:spikes.slice(0,Math.min(6,2+Math.ceil(l/2)+Math.floor(hard/2))),extras:[],drones:[],moving:[],vanish:[],conveyors:[],lasers:[],switches:[{x:350,y:315},{x:1260,y:420},{x:1950,y:310}].slice(0,l<=2?1:l<=4?2:3)};
  if(l>=2){cfg.extras=[{x:690,y:365,w:120,h:20},{x:1430,y:330,w:125,h:20}];cfg.moving=[{x:1150,y:345,w:110,h:20,axis:'x',amp:35+hard*8,speed:.7+hard*.1}]}
  if(l>=3){cfg.ordered=true;cfg.moving.push({x:1790,y:310,w:125,h:20,axis:'y',amp:28+hard*3,speed:1.0+hard*.08})}
  if(l>=4){cfg.drones=[{x:1510,y:398,range:45+hard*8,speed:1+hard*.12}];cfg.vanish=[{x:2270,y:300,w:115,h:20,period:250-hard*12}]}
  if(l===5){cfg.boss=true;cfg.drones.push({x:2110,y:400,range:45+hard*6,speed:1.3})}
  if(w===6)cfg.conveyors=[{x:620,y:465,w:400,push:.45+hard*.1},{x:1640,y:465,w:370,push:-.35}];
  if(w===8&&l>=3)cfg.bridge=true;
  if(w===10&&l>=3)cfg.lasers=[{x:1320,y:390,period:220},{x:2200,y:385,period:190}];
  // Cada fase usa uma distribuição própria: alternância de rotas, altura, ritmo e riscos.
  const pattern=(w*7+l*11)%5;
  cfg.coins=cfg.coins.map((x,i)=>x+((i*37+w*29+l*53)%125)-62);
  cfg.spikes=cfg.spikes.map((x,i)=>x+((i*89+l*117+w*43)%210)-105);
  if(pattern===0){cfg.extras.push({x:920,y:280,w:150,h:22},{x:2020,y:280,w:140,h:22});cfg.moving.push({x:1510,y:305,w:120,h:22,axis:'y',amp:62,speed:.75+l*.11});}
  if(pattern===1){cfg.extras.push({x:1050,y:350,w:180,h:22},{x:1740,y:280,w:150,h:22});cfg.vanish.push({x:2120,y:350,w:130,h:20,period:270-l*12});}
  if(pattern===2){cfg.moving.push({x:780,y:310,w:140,h:20,axis:'x',amp:85,speed:.7+l*.13});cfg.extras.push({x:1880,y:270,w:135,h:22});}
  if(pattern===3){cfg.extras.push({x:880,y:270,w:125,h:20},{x:1560,y:295,w:150,h:20},{x:2170,y:330,w:110,h:20});}
  if(pattern===4){cfg.moving.push({x:990,y:325,w:135,h:20,axis:'y',amp:65,speed:1+l*.1});cfg.extras.push({x:1840,y:290,w:130,h:22});}
  if(w===6){cfg.conveyors=[{x:420+l*65,w:260+25*l,push:l%2?1.5:-1.25},{x:1680-l*30,w:340,push:l%2?-1.3:1.4}];}
  if(w===7){cfg.vanish.push({x:800+l*60,y:310,w:120,h:22,period:290-l*20});cfg.moving.push({x:1730,y:325,w:140,h:20,axis:'y',amp:35+l*12,speed:.65+l*.16});}
  if(w===8){cfg.moving.push({x:1080,y:290,w:130,h:22,axis:'y',amp:55+l*10,speed:.45+l*.11});cfg.vanish.push({x:2040,y:340,w:145,h:20,period:320-l*18});}
  if(w===9){cfg.extras.push({x:530+l*35,y:300,w:130,h:22},{x:2300-l*32,y:275,w:150,h:22});cfg.moving.push({x:1460,y:310,w:130,h:22,axis:'x',amp:65+l*9,speed:.7+l*.12});}
  if(w===10){cfg.lasers.push({x:980+l*30,y:395,period:280-l*15});cfg.drones.push({x:1700,y:392,range:70+l*9,speed:.9+l*.13});}
  worldInfo[w].configs[l]=cfg;
 }
}
const commonCoins=[340,530,820,1095,1420,1650,1950,2450];
function makeCfg(w,l){
 const shift=w===3?0:w===4?20:35;
 const cfg={width:2800,coins:commonCoins.map(x=>x),spikes:[910,1500,2035],extras:[],drones:[],moving:[],vanish:[],conveyors:[],lasers:[],difficulty:w};
 if(l>=2)cfg.spikes.push(2320);
 if(l>=3)cfg.extras.push({x:1200,y:345,w:120,h:22},{x:1750,y:335,w:120,h:22});
 if(w===3){
  cfg.drones=[{x:1050,y:404,range:65,speed:1.2},{x:1900,y:398,range:85,speed:1.4}];
  if(l>=2)cfg.conveyors=[{x:630,w:360,push:1.15},{x:1650,w:390,push:-1.1}];
  if(l>=3)cfg.moving=[{x:1190,y:340,w:115,h:20,axis:'y',amp:35,speed:1.1},{x:1790,y:325,w:110,h:20,axis:'y',amp:45,speed:1.3}];
 }else if(w===4){
  cfg.spikes=[930,1490,2030,2320];
  if(l>=2)cfg.vanish=[{x:950,y:310,w:120,h:22,period:240},{x:2050,y:350,w:120,h:22,period:200}];
  if(l>=4)cfg.moving=[{x:1190,y:345,w:125,h:20,axis:'x',amp:75,speed:.8},{x:1780,y:330,w:125,h:20,axis:'y',amp:40,speed:1.0}];
  if(l>=4)cfg.drones=[{x:1490,y:395,range:60,speed:1}];
 }else{
  cfg.drones=[{x:1010,y:400,range:80,speed:1.2},{x:1880,y:405,range:95,speed:1.4}];
  if(l>=2)cfg.vanish=[{x:940,y:315,w:125,h:20,period:210},{x:2050,y:345,w:125,h:20,period:190}];
  if(l>=3)cfg.lasers=[{x:1330,y:380,period:200},{x:2220,y:385,period:240}];
  if(l>=4)cfg.moving=[{x:1150,y:330,w:110,h:20,axis:'y',amp:40,speed:1.4},{x:1770,y:320,w:110,h:20,axis:'x',amp:60,speed:1.3}];
 }
 if(l===3){cfg.switches=[{x:350,y:315},{x:1260,y:300},{x:1950,y:310}];cfg.ordered=true}
 if(l===4){cfg.switches=[{x:350,y:315},{x:1260,y:300},{x:1950,y:310}];cfg.ordered=(w===5)}
 if(l===5){cfg.switches=[{x:650,y:340},{x:1240,y:340},{x:1840,y:340}];cfg.boss=true;cfg.drones=cfg.drones.slice(0,1)}
 return cfg;
}
for(let w=3;w<=5;w++)for(let l=1;l<=5;l++)worldInfo[w].configs[l]=makeCfg(w,l);
let world=1,worldUnlocked=1;
const progress=Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,1]));
try{
 progress[1]=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo1'))||1));
 progress[2]=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo2'))||1));
 for(let w=3;w<=10;w++)progress[w]=Math.min(5,Math.max(1,Number(localStorage.getItem('miau-bit-aventura-mundo'+w))||1));
 if(localStorage.getItem('miau-bit-aventura-mundo1-completo')==='sim')worldUnlocked=2;
 for(let w=2;w<=9;w++)if(localStorage.getItem('miau-bit-aventura-mundo'+w+'-completo')==='sim')worldUnlocked=Math.max(worldUnlocked,w+1);
}catch(e){}
function currentNames(){return worldInfo[world].names}
function currentDescriptions(){return worldInfo[world].descriptions}
function currentConfigs(){return worldInfo[world].configs}
function worldTitle(){return worldInfo[world].icon+' Mundo '+world+' — '+worldInfo[world].name}
function updateGlitchAccess(){const el=document.querySelector('#glitchWorld');if(el)el.hidden=localStorage.getItem('miau-bit-aventura-mundo5-completo')!=='sim';}
function updateWorldAccess(){updateGlitchAccess();
 for(let w=2;w<=10;w++){
  const b=document.querySelector(w===2?'#castleWorld':'#world'+w+'Btn');
  const glitchDone=localStorage.getItem('miau-bit-intermundo-glitch-completo')==='sim';
  const available=w<=worldUnlocked&&(w<6||glitchDone);b.disabled=!available;b.classList.toggle('available',available);b.classList.toggle('locked',!available);
  document.querySelector(w===2?'#castleStatus':'#world'+w+'Status').textContent=available?'Entrar no mundo ▶':w===6&& !glitchDone?'🔒 Enfrente o Glitch':w>6&&!glitchDone?'🔒 Conclua o Intermundo':'🔒 Conclua o Mundo '+(w-1);
 }
}
const base=[{x:0,y:465,w:520,h:75},{x:610,y:465,w:440,h:75},{x:1140,y:465,w:410,h:75},{x:1630,y:465,w:460,h:75},{x:2180,y:465,w:620,h:75},{x:260,y:360,w:135,h:24},{x:475,y:310,w:120,h:24},{x:760,y:345,w:150,h:24},{x:1030,y:285,w:145,h:24},{x:1350,y:355,w:150,h:24},{x:1580,y:290,w:140,h:24},{x:1890,y:350,w:150,h:24},{x:2130,y:300,w:145,h:24},{x:2400,y:355,w:150,h:24}];
const missionBank={"1": [["A ponte está quebrada! Qual ordem ajuda o Bit?", ["Pegar tábuas → montar → atravessar", "Atravessar → pegar tábuas → montar", "Montar → atravessar → pegar tábuas"], 0, "Um algoritmo segue passos na ordem certa."], ["O robô precisa chegar à árvore. Qual sequência funciona?", ["Pular → andar → parar", "Andar → pular obstáculo → chegar", "Chegar → pular → andar"], 1, "A ordem dos comandos muda o resultado."], ["Para abrir a ponte, o que fazemos primeiro?", ["Testar a ponte", "Reunir as peças", "Atravessar o rio"], 1, "Dividir um problema em etapas ajuda a resolvê-lo."], ["Qual padrão continua? ⭐ 🌙 ⭐ 🌙 ...", ["🌙", "⭐", "☀️"], 1, "Reconhecer padrões ajuda a prever sequências."], ["A máquina falhou. Qual é a melhor estratégia?", ["Repetir o erro", "Desistir", "Verificar cada passo e corrigir"], 2, "Encontrar e corrigir erros se chama depuração."]], "2": [["Qual senha protege melhor o portão?", ["123456", "GatoAzul!PulaNaLua27", "miau"], 1, "Senhas longas e únicas são mais difíceis de adivinhar."], ["Dois cofres precisam de senhas. O que fazer?", ["Usar a mesma senha", "Criar uma senha diferente para cada um", "Deixar sem senha"], 1, "Senhas diferentes reduzem os danos se uma for descoberta."], ["Um desconhecido pede sua senha. Você...", ["Conta para ajudar", "Publica no chat", "Não compartilha e procura um adulto de confiança"], 2, "Senhas são segredos que devemos proteger."], ["Além da senha, o cofre pede um código. Isso é...", ["Verificação em duas etapas", "Um erro do cofre", "Um convite para compartilhar dados"], 0, "Uma segunda verificação aumenta a segurança."], ["O guardião oferece um prêmio se você revelar sua senha.", ["Revela para ganhar", "Recusa e avisa um adulto de confiança", "Envia a senha de um amigo"], 1, "Prêmios não justificam revelar senhas."]], "3": [["Programe o Bit: há um obstáculo à frente.", ["Avançar → pular → avançar", "Avançar → avançar → cair", "Parar → parar → parar"], 0, "Comandos executados na ordem correta levam ao objetivo."], ["O Bit precisa dar três passos iguais. Qual comando é melhor?", ["Repetir 3 vezes: avançar", "Pular 3 vezes", "Voltar 3 vezes"], 0, "Laços de repetição evitam repetir instruções manualmente."], ["Se o elevador estiver embaixo, o Bit deve...", ["Pular no vazio", "Esperar; quando chegar, entrar", "Ignorar o elevador"], 1, "Uma condição permite agir somente quando algo acontece."], ["Qual comando evita o robô patrulheiro?", ["Se robô perto → esperar; senão → avançar", "Sempre avançar", "Desligar todos os comandos"], 0, "Condições tornam programas capazes de tomar decisões."], ["O robô repete movimentos errados. Como corrigir?", ["Executar mais rápido", "Encontrar o comando errado e ajustar", "Apagar o jogo"], 1, "Testar e corrigir instruções é parte de programar."]], "4": [["Organize os dados: 🔵 🔴 🔵 🔴 ...", ["🔵", "🔴", "🟢"], 0, "Sequências possuem regras que podemos identificar."], ["Qual grupo reúne apenas cristais azuis?", ["🔵 🔵 🔵", "🔵 🔴 🔵", "🔴 🟢 🔵"], 0, "Organizar dados por características facilita a busca."], ["Qual número completa 2, 4, 6, 8, ...?", ["9", "12", "10"], 2, "A sequência aumenta de dois em dois."], ["Qual regra separa os cristais corretamente?", ["Misturar tudo", "Agrupar por cor e tamanho", "Escolher ao acaso"], 1, "Classificar dados ajuda a encontrar informações."], ["Os dados 3, 1, 2 estão fora de ordem. Organize:", ["3 → 2 → 1", "1 → 2 → 3", "2 → 1 → 3"], 1, "Ordenar dados permite comparar e localizar valores."]], "5": [["Chegou uma mensagem: 'Clique e ganhe 1000 moedas!' Você...", ["Clica depressa", "Confere a origem com um adulto de confiança", "Envia aos amigos"], 1, "Mensagens com prêmios podem ser golpes."], ["Um jogo pede seu endereço de casa. Você...", ["Digita o endereço", "Envia a localização", "Não compartilha dados pessoais"], 2, "Informações pessoais precisam ser protegidas."], ["Qual rede é mais segura para uma conta importante?", ["Wi-Fi público desconhecido", "Rede confiável e protegida", "Qualquer rede com nome divertido"], 1, "Redes desconhecidas podem trazer riscos."], ["Um link estranho pede sua senha para liberar o caminho.", ["Não digita e verifica o endereço", "Digita para continuar", "Compartilha o link"], 0, "Links suspeitos podem tentar roubar informações."], ["O Glitch envia uma mensagem fingindo ser o Bit. O que fazer?", ["Acreditar sem verificar", "Conferir com o Bit por outro caminho", "Enviar todos os dados"], 1, "Confirmar a identidade ajuda a evitar golpes."]]};


// Uma única pergunta educativa no início de cada fase dos mundos adicionais.
const extraMissionBank={
 6:[
 ['Qual é o primeiro passo para ensinar o robô?', ['Dar instruções claras','Apertar botões ao acaso','Desligar tudo'],0,'Instruções claras ajudam o robô.'],
 ['Para repetir um movimento, podemos usar...', ['Um comando de repetição','Um segredo','Um obstáculo'],0,'Repetições facilitam tarefas.'],
 ['Se o caminho estiver bloqueado, o robô deve...', ['Continuar sem olhar','Verificar e escolher outra ação','Parar para sempre'],1,'Condições ajudam nas decisões.'],
 ['Uma sequência de comandos deve ser executada...', ['Fora de ordem','Na ordem planejada','Só pela metade'],1,'A ordem faz diferença.'],
 ['Se um comando falhar, devemos...', ['Testar e corrigir','Ignorar o erro','Repetir o erro'],0,'Corrigir erros é parte de programar.']],
 7:[
 ['O que ajuda uma planta a crescer?', ['Água e luz','Lixo','Escuridão constante'],0,'Cuidar do ambiente faz diferença.'],
 ['Qual ação protege a floresta?', ['Jogar lixo no chão','Recolher o lixo','Quebrar galhos'],1,'Cuidar da natureza é importante.'],
 ['Para descobrir um caminho, podemos...', ['Observar pistas','Fechar os olhos','Ignorar sinais'],0,'Observar ajuda a decidir.'],
 ['O que fazemos quando uma estratégia não funciona?', ['Testamos outra','Desistimos sempre','Ignoramos o problema'],0,'Experimentar novas soluções ajuda.'],
 ['Qual atitude é melhor em equipe?', ['Compartilhar ideias','Não ouvir ninguém','Esconder as pistas'],0,'Cooperar ajuda a resolver desafios.']],
 8:[
 ['Qual pista ajuda a reconhecer um padrão?', ['Elementos que se repetem','Escolhas ao acaso','Nenhuma observação'],0,'Padrões têm regras.'],
 ['Para atravessar com segurança, devemos...', ['Observar o movimento','Pular sem olhar','Ignorar o caminho'],0,'Observar o ritmo ajuda.'],
 ['Qual sequência continua 2, 4, 6...?', ['7','8','9'],1,'A sequência cresce de dois em dois.'],
 ['Como organizar informações?', ['Por uma regra','Misturando tudo','Sem observar'],0,'Classificar facilita a busca.'],
 ['Quando surge um desafio difícil, é melhor...', ['Dividir em etapas','Fazer tudo de uma vez','Desistir'],0,'Etapas menores ajudam.']],
 9:[
 ['Antes de abrir um arquivo desconhecido, devemos...', ['Verificar a origem','Abrir imediatamente','Enviar para todos'],0,'Verificar a origem evita riscos.'],
 ['Qual informação devemos proteger?', ['Endereço de casa','Cor favorita de um desenho','Nome de um personagem fictício'],0,'Dados pessoais merecem cuidado.'],
 ['Um link suspeito deve ser...', ['Verificado antes de clicar','Aberto imediatamente','Compartilhado sem pensar'],0,'Desconfie de links estranhos.'],
 ['Se alguém pedir sua senha, você...', ['Não compartilha','Conta a senha','Publica a senha'],0,'Senhas são privadas.'],
 ['Quando aparece um aviso estranho, é melhor...', ['Pedir ajuda a um adulto de confiança','Clicar sem ler','Ignorar toda segurança'],0,'Pedir ajuda é uma boa escolha.']],
 10:[
 ['Para resolver um problema, começamos por...', ['Entender o desafio','Escolher ao acaso','Ignorar as pistas'],0,'Entender é o primeiro passo.'],
 ['Qual é a melhor maneira de testar uma ideia?', ['Experimentar e observar','Não conferir','Desistir antes'],0,'Testar ajuda a aprender.'],
 ['Quando duas pistas se repetem, podemos procurar...', ['Um padrão','Uma senha de outra pessoa','Um erro qualquer'],0,'Padrões ajudam a prever.'],
 ['Uma informação pessoal deve ser...', ['Protegida','Publicada para todos','Enviada a desconhecidos'],0,'Privacidade é importante.'],
 ['O que fazer depois de errar um desafio?', ['Aprender e tentar de novo','Desistir para sempre','Culpar os colegas'],0,'Erros também ensinam.']]
};
let missionOpen=false,missionPending=null,missionSolved=0,missionRequired=0,missionFailures=0;
const missionBox=document.querySelector('#missionBox');
function missionCount(){return level<=2?1:level<=4?2:3;}
function missionTitle(){return `${worldInfo[world].icon} Missão ${world}-${level}`;}
function missionHint(){
 if(world>=6)return currentDescriptions()[level];
 const n=missionBank[world][level-1];
 return n[0];
}
function updateMissionHUD(){
 document.querySelector('#missionProgress').textContent=`🧠 Missões ${missionSolved}/${missionRequired}`;
}
function openMission(s){
 if(missionOpen)return;
 missionOpen=true;missionPending=s;
 const data=(missionBank[world]||extraMissionBank[world])[level-1],idx=0;
 const question=idx===0?data[0]:idx===1?
  (world===3?'O que é importante ao programar?':world===5?'Qual atitude ajuda a manter você seguro?':world===4?'Como resolver o desafio dos dados?':world===2?'Qual hábito protege sua conta?':'Como resolver um problema complicado?'):
  (world===3?'O programa não funcionou. E agora?':world===5?'Uma situação parece suspeita. E agora?':world===4?'Os cristais estão desorganizados. E agora?':world===2?'Um estranho pede dados pessoais. E agora?':'O caminho não deu certo. E agora?');
 let options,correct,feedback;
 if(idx===0){options=data[1];correct=data[2];feedback=data[3];}
 else if(idx===1){
  options=world===3?['Testar os comandos antes de continuar','Apertar tudo ao mesmo tempo','Ignorar o resultado']:
  world===5?['Compartilhar dados','Verificar antes de clicar','Confiar em qualquer mensagem']:
  world===4?['Procurar padrões e comparar','Escolher sem olhar','Misturar tudo']:
  world===2?['Usar senhas únicas e longas','Contar a senha aos amigos','Usar 123456']:
  ['Dividir em passos menores','Fazer tudo sem pensar','Ignorar as instruções'];
  correct=world===5?1:0;feedback='Observar, pensar e testar é uma boa estratégia!';
 }else{
  options=world===3?['Desistir','Encontrar o erro e ajustar','Repetir sem mudar']:
  world===5?['Pedir ajuda a um adulto de confiança','Enviar informações','Clicar imediatamente']:
  world===4?['Misturar tudo','Ordenar por uma regra','Escolher de olhos fechados']:
  world===2?['Enviar os dados','Publicar a senha','Recusar e procurar um adulto de confiança']:
  ['Conferir os passos e corrigir','Desistir','Ignorar o problema'];
  correct=world===3||world===4?1:world===2?2:0;feedback='Você usou a lógica para resolver o desafio!';
 }
 document.querySelector('#missionTitle').textContent=missionTitle();
 document.querySelector('#missionQuestion').textContent=question;
 document.querySelector('#missionFeedback').textContent='';
 const answers=document.querySelector('#missionAnswers');answers.replaceChildren();
 if(world===3){
  const targets=[['➡️','⬆️','➡️'],['➡️','➡️','➡️'],['⏳','➡️','⬆️'],['⏳','➡️','➡️'],['➡️','⬆️','⏳']];
  const target=targets[level-1];let entered=[];
  document.querySelector('#missionQuestion').textContent='🤖 Programe o Bit! Monte esta sequência: '+target.join('  ');
  const preview=document.createElement('p');preview.textContent='Seus comandos: (vazio)';answers.append(preview);
  const commandNames={'➡️':'Avançar','⬆️':'Pular','⏳':'Esperar'};
  for(const cmd of ['➡️','⬆️','⏳']){
   const b=document.createElement('button');b.type='button';b.textContent=cmd+' '+commandNames[cmd];
   b.addEventListener('click',()=>{
    entered.push(cmd);preview.textContent='Seus comandos: '+entered.join(' ');
    if(entered.length===target.length){
     if(entered.every((x,i)=>x===target[i])){
      s.on=true;missionSolved++;updateMissionHUD();tone(880,.22,'triangle');missionOpen=false;missionPending=null;missionBox.hidden=true;
      message('🤖 Programa executado! Circuito ativado.');
     }else{
      entered=[];preview.textContent='Seus comandos: (vazio)';
      document.querySelector('#missionFeedback').textContent='🔧 O Bit não chegou lá. Ajuste os comandos e tente de novo!';
     }
    }
   });answers.append(b);
  }
  missionBox.hidden=false;return;
 }
 if(world===4){
  const patterns=[['🔵','🔴','🔵'],['💎','⭐','💎'],['1','2','3'],['🔷','🔶','🔷'],['2','4','6']];
  const target=patterns[level-1];let entered=[];
  document.querySelector('#missionQuestion').textContent='💎 Organize os cristais nesta ordem: '+target.join('  ');
  const preview=document.createElement('p');preview.textContent='Sua sequência: (vazia)';answers.append(preview);
  for(const cmd of [...new Set([...target,'🔴','⭐','4'])]){
   const b=document.createElement('button');b.type='button';b.textContent=cmd;
   b.addEventListener('click',()=>{
    entered.push(cmd);preview.textContent='Sua sequência: '+entered.join(' ');
    if(entered.length===target.length){
     if(entered.every((x,i)=>x===target[i])){
      s.on=true;missionSolved++;updateMissionHUD();tone(880,.22,'triangle');missionOpen=false;missionPending=null;missionBox.hidden=true;
      message('💎 Dados organizados! Cristal ativado.');
     }else{entered=[];preview.textContent='Sua sequência: (vazia)';document.querySelector('#missionFeedback').textContent='🔍 Essa ordem não funcionou. Observe o padrão e tente novamente.';}
    }
   });answers.append(b);
  }
  missionBox.hidden=false;return;
 }
 options.forEach((answer,i)=>{
  const b=document.createElement('button');b.type='button';b.textContent=answer;
  b.addEventListener('click',()=>{
   if(i!==correct){missionFailures++;document.querySelector('#missionFeedback').textContent='🔎 Quase! Observe as pistas e tente outra vez.';tone(230,.16);return;}
   s.on=true;missionSolved++;updateMissionHUD();tone(880,.22,'triangle');
   document.querySelector('#missionFeedback').textContent='✨ '+feedback;
   missionOpen=false;missionPending=null;missionBox.hidden=true;
   message('🧠 Desafio resolvido! Mecanismo ativado.');
  });answers.append(b);
 });
 missionBox.hidden=false;
}

let level=1,player,coins,spikes,switches,platforms,drones=[],laserTraps=[],score=0,lives=3,camera=0,playing=false,invuln=0,last=0,muted=false,audio=null,tick=0,notice='',noticeFrames=0,previousJump=false,elapsed=0;

function tone(f=440,d=.13,type='sine',vol=.035){if(muted)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
// Ten original procedural themes, lightweight and offline: one per world, shared Miau & Bit motif.
const themes={
 1:{notes:[392,523,587,659,587,523,440,392,330,392,440,523,440,392,330,294],bass:[196,196,220,196],tempo:335,wave:'triangle'},
 2:{notes:[330,392,440,392,311,349,392,311,294,349,392,349,261,311,349,261],bass:[165,155,147,131],tempo:385,wave:'sine'},
 3:{notes:[440,554,659,554,440,330,392,494,523,659,784,659,523,392,330,392],bass:[110,131,147,131],tempo:245,wave:'square'},
 4:{notes:[294,349,440,523,440,349,294,261,330,392,494,587,494,392,330,294],bass:[147,165,131,147],tempo:450,wave:'sine'},
 5:{notes:[392,466,587,698,659,587,466,392,349,440,554,659,587,554,440,349],bass:[196,175,233,165],tempo:275,wave:'sawtooth'},
 6:{notes:[440,523,659,784,659,523,440,392,440,523,659,880,784,659,523,440],bass:[110,147,165,147],tempo:190,wave:'square'},
 7:{notes:[392,494,587,659,587,494,440,392,330,392,494,587,659,587,494,392],bass:[196,220,247,196],tempo:430,wave:'sine'},
 8:{notes:[294,392,440,523,587,523,440,392,349,440,523,587,523,440,392,294],bass:[147,196,174,147],tempo:510,wave:'sine'},
 9:{notes:[349,440,523,587,523,440,392,349,294,349,440,523,494,440,392,349],bass:[175,196,220,175],tempo:305,wave:'triangle'},
 10:{notes:[392,466,554,698,659,554,466,392,349,466,587,784,698,587,466,392],bass:[196,233,175,147],tempo:205,wave:'sawtooth'}
};
let musicTimer=null,musicStep=0;
function stopMusic(){if(musicTimer!==null){clearInterval(musicTimer);musicTimer=null;}}
function startMusic(){stopMusic();musicStep=0;if(muted||!playing)return;
 const theme=themes[world];musicTimer=setInterval(()=>{
  if(!playing||muted){stopMusic();return;}
  const step=musicStep++,f=theme.notes[step%theme.notes.length],beat=theme.tempo/1000;
  if(world<=5){tone(f,beat*.72,theme.wave,.013);if(step%4===0)tone(theme.bass[Math.floor(step/4)%theme.bass.length],beat*1.8,'triangle',.009);return;}
  // Ritmos e arranjos distintos por ambiente; cada mundo tem seu próprio padrão.
  if(world===6){if(step%2===0)tone(f,beat*.38,'square',.012);tone(step%4===0?88:step%2===0?180:320,.055,'sawtooth',.009);if(step%4===0)tone(theme.bass[(step/4)%4],beat*1.2,'triangle',.014);}
  if(world===7){tone(f,beat*1.3,'sine',.013);if(step%4===2)tone(f*2,beat*.5,'triangle',.004);if(step%8===0)tone(theme.bass[(step/4)%4],beat*3,'sine',.008);}
  if(world===8){if(step%2===0)tone(f,beat*1.8,'sine',.012);if(step%4===0)tone(f*.5,beat*3,'triangle',.009);if(step%8===6)tone(f*1.5,beat*2,'sine',.005);}
  if(world===9){tone(f,beat*.35,'triangle',.015);if(step%3===0)tone(f*2,beat*1.5,'sine',.006);if(step%8===0)tone(theme.bass[(step/4)%4],beat*2.5,'sine',.009);}
  if(world===10){tone(f,beat*.56,'sawtooth',.011);if(step%2===0)tone(f*.5,beat*.6,'square',.009);if(step%4===0)tone(95,beat*.18,'triangle',.024);if(step%8===7)tone(f*2,beat*.25,'square',.006);}
 },theme.tempo);
}
function message(s){notice=s;noticeFrames=170;}
function renderMap(){document.querySelectorAll('[data-level]').forEach(b=>{let n=Number(b.dataset.level),limit=progress[world];b.disabled=n>limit;b.textContent=(n>limit?'🔒 ':'🌟 ')+`${world}-${n} · ${currentNames()[n]}`+(n===5?' 👾':'');});}
function showMap(){document.querySelector('#nextLevel').hidden=true;stopMusic();stopPortal();choose.hidden=true;kingdom.hidden=true;gameSection.hidden=false;playing=false;overlay.hidden=false;overlay.querySelector('h2').textContent=worldTitle();overlay.querySelector('p').textContent=world>=6?'Explore o cenário, colete os itens e ative os mecanismos para abrir a saída.':'Colete os itens, resolva os desafios de lógica e chegue ao final!';document.querySelector('#map').hidden=false;startBtn.hidden=true;renderMap();}
function reset(showQuestion=true){document.querySelector('#nextLevel').hidden=true;stopMusic();stopPortal();choose.hidden=true;kingdom.hidden=true;gameSection.hidden=false;const cfg=currentConfigs()[level];const special=[...(cfg.moving||[]),...(cfg.vanish||[])];
const staticPlatforms=base.concat(cfg.extras).filter(p=>{
 if(p.y>=460)return true; // ground remains untouched
 return !special.some(q=>{
  const xMin=q.axis==='x'?q.x-(q.amp||0):q.x;
  const xMax=q.axis==='x'?q.x+q.w+(q.amp||0):q.x+q.w;
  const yMin=q.axis==='y'?q.y-(q.amp||0):q.y;
  const yMax=q.axis==='y'?q.y+(q.amp||0)+q.h:q.y+q.h;
  return p.x<xMax&&p.x+p.w>xMin&&p.y<yMax+18&&p.y+p.h>yMin-18;
 });
});
platforms=staticPlatforms.map(p=>({...p}));if(cfg.moving)platforms.push(...cfg.moving.map(p=>({...p,moving:true,originX:p.x,originY:p.y})));if(cfg.vanish)platforms.push(...cfg.vanish.map(p=>({...p,vanish:true})));drones=(cfg.drones||[]).map(d=>({...d}));laserTraps=(cfg.lasers||[]).map(d=>({...d}));elapsed=0;if(cfg.bridge)platforms.push({x:2090,y:465,w:90,h:75,conditional:true});player={x:55,y:370,w:38,h:47,vx:0,vy:0,ground:false,spawnX:55,spawnY:370};coins=cfg.coins.map((x,i)=>({x,y:[322,272,307,247,317,252,312,317][i],got:false}));spikes=cfg.spikes.map(x=>({x,y:440,w:42}));switches=(cfg.switches&&cfg.switches.length?cfg.switches:[{x:350,y:315},{x:1260,y:420},{x:1950,y:310}].slice(0,missionCount())).map((s,i)=>({...s,on:false,index:i}));score=0;lives=3;camera=0;invuln=0;notice='';previousJump=false;missionOpen=false;missionPending=null;missionSolved=0;missionRequired=1;missionBox.hidden=true;updateMissionHUD();playing=true;overlay.hidden=true;document.querySelector('#score').textContent=0;document.querySelector('#goal').textContent=coins.length;document.querySelector('#lives').textContent=lives;document.querySelector('#stageLabel').textContent=`Fase ${world}-${level} · ${currentNames()[level]}`;message('🌟 Prepare-se para a aventura!');if(showQuestion){tone(523,.15);startMusic();openMission({on:false});}else{playing=false;missionBox.hidden=true;}}
function finish(win){
 playing=false;stopMusic();overlay.hidden=false;
 overlay.querySelector('h2').textContent=win?(level===5?'🏆 '+worldInfo[world].name+' concluído!':'🎉 Fase concluída!'):'💛 Vamos tentar de novo?';
 overlay.querySelector('p').textContent=win?(level===5?(world===5?'Cyberlândia protegida! Mas uma presença misteriosa abriu um novo portal...':'Mundo concluído! '+(world<10?'O próximo mundo foi desbloqueado!':'Parabéns!')):'A próxima fase foi liberada!'):'Tente novamente. Você consegue!';
 startBtn.hidden=false;startBtn.textContent='Jogar novamente ↻';document.querySelector('#map').hidden=false;
 const next=document.querySelector('#nextLevel');
 next.hidden=!win;
 next.textContent=world===5&&level===5?'👾 Enfrentar o Glitch':level===5?'🌍 Ir para o próximo mundo':'➡️ Próxima fase';
 
 if(win){progress[world]=Math.max(progress[world],Math.min(5,level+1));
  if(level===5)worldUnlocked=Math.max(worldUnlocked,Math.min(10,world+1));
  try{localStorage.setItem('miau-bit-aventura-mundo'+world,String(progress[world]));
   if(level===5)localStorage.setItem('miau-bit-aventura-mundo'+world+'-completo','sim');
  }catch(e){}
  updateWorldAccess();[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.22,'triangle',.035),i*150));
 }else tone(180,.4,'sawtooth');renderMap();
}
function hurt(){if(invuln>0||!playing)return;lives--;document.querySelector('#lives').textContent=lives;tone(175,.28,'sawtooth');if(lives<=0){finish(false);return;}invuln=95;player.x=player.spawnX;player.y=player.spawnY;player.vx=player.vy=0;}
function update(dt){if(!playing||missionOpen)return;const sc=Math.min(dt/16.67,2);elapsed+=dt;const cfg=currentConfigs()[level];for(const p of platforms){if(p.moving){const t=elapsed/1000*p.speed;p.x=p.originX+(p.axis==='x'?Math.sin(t)*p.amp:0);p.y=p.originY+(p.axis==='y'?Math.sin(t)*p.amp:0)}}invuln=Math.max(0,invuln-sc);noticeFrames=Math.max(0,noticeFrames-sc);player.vx=(Number(keys.right)-Number(keys.left))*5.1;for(const belt of (cfg.conveyors||[]))if(player.ground&&player.x>belt.x&&player.x<belt.x+belt.w)player.vx+=belt.push;player.x=Math.max(0,Math.min(2762,player.x+player.vx*sc));if(keys.jump&&!previousJump&&player.ground){player.vy=-13.5;player.ground=false;tone(470,.11,'square',.017)}previousJump=keys.jump;const bottom=player.y+player.h;player.vy+=.64*sc;player.y+=player.vy*sc;player.ground=false;for(const p of platforms){if(p.conditional&&!switches.every(s=>s.on))continue;if(p.vanish&&Math.sin(elapsed/(p.period||220)*Math.PI)<-.1)continue;if(player.vy>=0&&bottom<=p.y+9&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;player.vy=0;player.ground=true;}}
if(player.y>H+90)hurt();for(const d of drones){const dx=d.x+Math.sin(elapsed/1000*d.speed)*d.range;if(Math.abs(player.x+19-dx)<28&&Math.abs(player.y+23-d.y)<32)hurt();}for(const laser of laserTraps){if(Math.sin(elapsed/laser.period)>0.3&&Math.abs(player.x+19-laser.x)<14&&player.y+player.h>laser.y)hurt();}for(const s of spikes)if(player.x+player.w>s.x+7&&player.x<s.x+s.w-7&&player.y+player.h>s.y+8&&player.y<s.y+25)hurt();for(const c of coins){if(!c.got&&Math.abs(player.x+19-c.x)<31&&Math.abs(player.y+23-c.y)<37){c.got=true;score++;document.querySelector('#score').textContent=score;tone(650+score*50,.15);}}
for(const s of switches){if(missionOpen)break;if(s.on)continue;if(Math.abs(player.x+19-s.x)<35&&Math.abs(player.y+23-s.y)<50){if(currentConfigs()[level].ordered&&switches.slice(0,s.index).some(q=>!q.on)){message('🔢 Siga a sequência: 1 → 2 → 3!');continue;}{s.on=true;tone(850,.2);message(currentConfigs()[level].ordered?"✨ Circuito ativado na ordem correta!":"✨ Mecanismo ativado! Continue explorando.");}}}
if(player.x>1600&&player.spawnX<1600){player.spawnX=1640;player.spawnY=390;message('🚩 Checkpoint ativado!');}
if(player.x>2650){if(score===coins.length&&switches.every(s=>s.on))finish(true);else if(noticeFrames<40)message(`Faltam ${coins.length-score} ${world===2?'chaves':world===3?'circuitos':world===4?'cristais':world===5||world===10?'escudos':world===8?'conexões':world===9?'arquivos':world===7?'sementes':'engrenagens'} e ${switches.filter(s=>!s.on).length} mecanismos!`);}
camera=Math.max(0,Math.min(1840,player.x-W*.32));}
function roundRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function oceanScenery(time){
 // Mundo 8 é SUBAQUÁTICO: a superfície fica muito acima do cenário.
 const water=ctx.createLinearGradient(0,0,0,H);
 water.addColorStop(0,'#174c89');water.addColorStop(.36,'#117baf');water.addColorStop(.73,'#08677e');water.addColorStop(1,'#073d57');
 ctx.fillStyle=water;ctx.fillRect(0,0,W,H);
 // Raios solares que atravessam a água, em parallax.
 ctx.save();ctx.globalAlpha=.16;
 for(let i=0;i<9;i++){
  const x=((i*170-camera*.045)%1300+1300)%1300-150;
  polygon([[x,-20],[x+40,-20],[x+170,540],[x+100,540]],'#b8f9ff');
 }
 ctx.restore();
 // Rochas e recifes ao fundo.
 for(let i=0;i<11;i++){
  const x=((i*230-camera*.12)%1480+1480)%1480-150;
  const y=390+i%3*18;
  ellipse(x+15,y+70,125,76,i%2?'#0b506d':'#0b5e70');
  ellipse(x+10,y+37,55,33,'#0c7b88');
  for(let j=0;j<4;j++){
   const bx=x-42+j*30,by=y+10+(j%2)*13;
   ctx.strokeStyle=['#ff8fa8','#f4b66c','#bc8dff','#5ae3d1'][j];ctx.lineWidth=9;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(bx,by+55);ctx.lineTo(bx,by+18);ctx.lineTo(bx-12,by+4);ctx.moveTo(bx,by+28);ctx.lineTo(bx+14,by+7);ctx.stroke();
  }
 }
 // Estações submarinas e cabos luminosos.
 for(let i=0;i<5;i++){
  const x=i*345-camera*.30;
  roundRect(x+18,330,85,95,16,'#184a79');roundRect(x+30,343,60,48,14,'#62e3ef');
  ellipse(x+60,365,18,18,'#0d4b7b');ellipse(x+60,365,9,9,'#c6ffff');
  ctx.strokeStyle='#44d9ed';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+100,410);ctx.bezierCurveTo(x+145,380,x+200,455,x+250,408);ctx.stroke();
 }
 // Cardumes e peixes, animados sem interação com a jogabilidade.
 for(let i=0;i<18;i++){
  const x=((i*131+time*(.006+i%3*.003)-camera*.16)%1250+1250)%1250-110;
  const y=110+(i*59)%260+Math.sin(time/900+i)*9;
  ctx.save();ctx.translate(x,y);ctx.scale(i%3===0?-1:1,1);
  ellipse(0,0,11,6,i%2?'#ffd28c':'#a6f3ff');polygon([[-7,0],[-19,-8],[-19,8]],i%2?'#ffa66d':'#63d6f2');
  ellipse(5,-1,1.6,1.6,'#16365b');ctx.restore();
 }
 // Bolhas sobem continuamente desde o fundo.
 for(let i=0;i<40;i++){
  const x=((i*97-camera*.11)%1090+1090)%1090-60;
  const y=((i*71-time*(.018+(i%4)*.008))%640+640)%640-50;
  const r=2+i%5*1.6;
  ctx.strokeStyle='#b2f9ff85';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
 }
}
function scenery(time){
 if(world===8){oceanScenery(time);return;}
 const castle=world===2||world===9,robot=world===3||world===6,cave=world===4||world===8,cyber=world===5||world===10;
 const palette={6:['#5390c0','#c7edee','#e5f9db'],7:['#62b89e','#b8e8a8','#f6f4bb'],8:['#236baf','#69d4e9','#d7f8ff'],9:['#9471b9','#e3c6f3','#fff1c6'],10:['#201744','#594191','#a483c8']}[world];
 let sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,cyber?'#15133f':cave?'#192b56':robot?'#62a8d4':castle?'#6c70b8':'#69c8f2');sky.addColorStop(.58,cyber?'#44367e':cave?'#354e80':robot?'#9ce1ee':castle?'#c3b4e5':'#c5f4e7');sky.addColorStop(1,cyber?'#7661ac':cave?'#5d7a9c':robot?'#d0e9fa':castle?'#e9d9fa':'#e8f7b8');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);if(palette){const tint=ctx.createLinearGradient(0,0,0,H);palette.forEach((c,i)=>tint.addColorStop(i/2,c));ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);}
 ellipse(790-camera*.018,88,53,53,cyber?'#ee6fdd':cave?'#9defff':robot?'#f7fbff':castle?'#ffe3b6':'#fff2ae');
 ellipse(775-camera*.018,76,62,62,'#ffffff24');
 for(let i=0;i<11;i++){
  let x=((i*215-camera*.09)%1450+1450)%1450-120,y=65+i%4*35;
  ellipse(x,y,56,17,'#ffffffa0');ellipse(x+29,y-10,35,24,'#ffffffb0');ellipse(x-27,y-7,31,19,'#ffffffa0');
 }
 if(world>=6){ctx.save();ctx.globalAlpha=.16;ctx.font='150px system-ui';ctx.textAlign='center';for(let i=0;i<5;i++)ctx.fillText(worldInfo[world].icon,150+i*290-camera*.08,245+i%2*55);ctx.restore();}
 // Three scenic depth planes move at different speeds
 for(let layer=0;layer<3;layer++){
  const speed=[.12,.26,.45][layer],baseline=[367,411,470][layer];
  const col=cyber?['#494185','#514a9b','#6453a9'][layer]:cave?['#4a6187','#3c5a80','#304c75'][layer]:robot?['#88b9d1','#5e9fbf','#3f86ae'][layer]:castle?['#8d91c4','#757cba','#666ba4'][layer]:['#a0d6bf','#71bf9d','#3d9d80'][layer];
  for(let i=-2;i<15;i++){
   const x=i*(210-layer*20)-camera*speed;
   polygon([[x-150,baseline+65],[x,baseline-95-layer*10],[x+160,baseline+65]],col);
  }
 }
 for(let i=0;i<25;i++){
  const x=i*148-camera*.53,y=428+i%3*14;
  if(castle||robot||cyber){
   roundRect(x-21,y-135,45,148,5,cyber?'#34305d':robot?'#5e88b0':'#7772a8');
   polygon([[x-30,y-135],[x,y-174],[x+34,y-135]],cyber?'#c75cc8':robot?'#7adce9':'#575e97');
   roundRect(x-6,y-104,15,36,7,cyber?'#ff82ec':robot?'#a2fcff':'#ffe3a3');
  }else if(cave){polygon([[x-55,y+12],[x,y-160],[x+55,y+12]],'#5dd7d6');polygon([[x-22,y+9],[x+8,y-118],[x+35,y+9]],'#a2efff');}else{
   roundRect(x-10,y-45,20,105,5,'#946949');
   ellipse(x,y-78,66,76,i%2?'#3b9d71':'#58b581');
   ellipse(x-19,y-100,47,49,'#ffffff16');
   ellipse(x+19,y-53,42,35,'#247e6130');
  }
 }
 // castle arcade or forest leaves in the near scenery
 for(let i=0;i<10;i++){
  const x=i*350-camera*.73;
  if(castle||robot||cyber){
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
 if(world===8){
  const d=p.y===465?30:18;
  if(p.conditional&&!switches.every(q=>q.on))ctx.globalAlpha=.32;
  if(p.vanish){const phase=Math.sin(elapsed/(p.period||220)*Math.PI);if(phase<-.1){ctx.globalAlpha=1;return;}if(phase<.18)ctx.globalAlpha=.4;}
  polygon([[p.x,p.y],[p.x+d*.5,p.y-d*.4],[p.x+p.w+d*.5,p.y-d*.4],[p.x+p.w,p.y]],'#a7dfcf');
  polygon([[p.x+p.w,p.y],[p.x+p.w+d*.5,p.y-d*.4],[p.x+p.w+d*.5,p.y+p.h-d*.4],[p.x+p.w,p.y+p.h]],'#174b68');
  roundRect(p.x,p.y,p.w,p.h,3,'#28788a');roundRect(p.x,p.y,p.w,13,3,'#65c5b2');
  for(let i=p.x+20;i<p.x+p.w-10;i+=65){ellipse(i,p.y+6,11,5,'#e6c79b');ellipse(i+8,p.y+8,4,3,'#e9a0ba');}
  ctx.globalAlpha=1;return;
 }

 const depth=p.y===465?35:22,castle=world===2,robot=world===3,cave=world===4,cyber=world===5;
 const side=cyber?'#292b63':cave?'#285d78':robot?'#4b728d':castle?'#615477':'#795b46',front=cyber?'#5d4a9e':cave?'#3d8298':robot?'#6da6c3':castle?'#8b79a5':'#a77b55',top=cyber?'#b56de2':cave?'#6dd6d7':robot?'#a6e7ef':castle?'#c7b6e5':'#82c991';
 if(p.conditional&&!switches.every(q=>q.on))ctx.globalAlpha=.35;
 if(p.vanish){
  const phase=Math.sin(elapsed/(p.period||220)*Math.PI);
  if(phase<-.1){ctx.globalAlpha=1;return;} // invisible means non-solid and not rendered
  if(phase<.18)ctx.globalAlpha=.35; // warning before disappearing
 }
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
  ellipse(0,0,18,18,world===2?'#b87331':world===3?'#5bbbc3':world===4?'#368db5':world===5?'#9d4bc9':'#b77b25');
  ellipse(-2,-2,15,15,world===2?'#ffe09a':world===3?'#b2f6ff':world===4?'#b4eeff':world===5?'#f0b8ff':'#ffdf67');
  ctx.fillStyle='#805327';ctx.font='bold 21px sans-serif';ctx.textAlign='center';ctx.fillText(world===2?'◆':world===3?'⚡':world===4?'◆':world===5?'✦':'⚙',0,7);ctx.restore();
 }
 for(const d of drones){
  const x=d.x+Math.sin(elapsed/1000*d.speed)*d.range;
  ellipse(x,d.y+22,25,7,'#203b6b55');ellipse(x,d.y,24,21,world===5?'#ed73d8':world===4?'#5ee4f4':'#c0d7e8');
  ellipse(x-9,d.y-2,5,6,'#243856');ellipse(x+9,d.y-2,5,6,'#243856');
  ellipse(x,d.y-22,10,5,'#ffd17e');
 }
 for(const laser of laserTraps){const active=Math.sin(elapsed/laser.period)>.3;
  if(active){roundRect(laser.x-5,laser.y,10,465-laser.y,3,'#ff71e7');ellipse(laser.x,laser.y,12,12,'#ffe7fb');}
  else ellipse(laser.x,laser.y,10,10,'#ac9fbf');
 }
 for(const belt of (currentConfigs()[level].conveyors||[])){
  roundRect(belt.x,460,belt.w,5,2,'#f3da7e');
  ctx.fillStyle='#254a67';ctx.font='bold 15px system-ui';for(let x=belt.x+20;x<belt.x+belt.w;x+=55)ctx.fillText(belt.push>0?'→':'←',x,458);
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
  ctx.fillStyle='#273a53';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(switches.every(q=>q.on)?'OFF':world===5?'GLITCH':world===3?'ROBÔ':world===4?'CRISTAL':'GUARDIÃO',2577,449);
 }
 roundRect(2685,398,48,66,7,world===2?'#c99b52':'#b8a4ed');
 roundRect(2693,407,32,29,5,'#f1f6ff');
 ellipse(2703,420,3,3,'#324568');ellipse(2716,420,3,3,'#324568');
 ctx.fillStyle='#283f65';ctx.font='bold 17px sans-serif';ctx.fillText(world===2?'COFRE':world===5?'PORTAL':'BIT!',2675,384);
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
 ctx.fillText(worldInfo[world].icon+' '+currentNames()[level]+' · '+world+'-'+level,24,33);
 if(noticeFrames>0){
  roundRect(110,46,740,49,12,'#fffaf0ed');
  ctx.fillStyle='#263f62';ctx.font='bold 17px system-ui';ctx.textAlign='center';
  ctx.fillText(notice,480,76);ctx.textAlign='left';
 }
}
function frame(t){const dt=t-last||16.67;last=t;update(dt);draw();requestAnimationFrame(frame)}
function stopPortal(){if(portalTimer!==null){clearTimeout(portalTimer);portalTimer=null;}portalScene.hidden=true;portalScene.classList.remove('entering');}
function enterPortal(){stopMusic();stopPortal();playing=false;choose.hidden=true;kingdom.hidden=true;gameSection.hidden=true;portalScene.hidden=false;const hero=document.querySelector('#portalHero');hero.src=character+'.svg';hero.alt=character==='luma'?'Luma entrando no reino':'Miau entrando no reino';void portalScene.offsetWidth;portalScene.classList.add('entering');tone(560,.23,'triangle');portalTimer=setTimeout(()=>{portalTimer=null;showKingdom();},3100);}
document.querySelector('#skipPortal').addEventListener('click',()=>showKingdom());
function showKingdom(){updateGlitchAccess();document.querySelector('#nextLevel').hidden=true;stopMusic();stopPortal();playing=false;updateWorldAccess();choose.hidden=true;kingdom.hidden=false;gameSection.hidden=true;window.scrollTo({top:0,behavior:'smooth'});}
function showChoose(){stopMusic();stopPortal();playing=false;gameSection.hidden=true;kingdom.hidden=true;choose.hidden=false;document.querySelectorAll('[data-character]').forEach(b=>b.classList.toggle('selected',b.dataset.character===character));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>{character=b.dataset.character;document.querySelectorAll('[data-character]').forEach(x=>x.classList.toggle('selected',x===b));tone(740,.15);try{localStorage.setItem('miau-bit-aventura-personagem',character)}catch(e){}}));
document.querySelector('#enterKingdom').addEventListener('click',()=>{tone(880,.3);enterPortal()});
document.querySelector('#characterBtn').addEventListener('click',showChoose);
document.querySelector('#forestWorld').addEventListener('click',()=>{world=1;showMap()});document.querySelector('#castleWorld').addEventListener('click',()=>{if(worldUnlocked>=2){world=2;showMap()}});for(let w=3;w<=10;w++)document.querySelector('#world'+w+'Btn').addEventListener('click',()=>{if(worldUnlocked>=w&&(w<6||localStorage.getItem('miau-bit-intermundo-glitch-completo')==='sim')){world=w;showMap()}});
document.querySelector('#kingdomBtn').addEventListener('click',showKingdom);document.querySelector('#backToKingdom').addEventListener('click',showKingdom);
document.querySelector('#nextLevel').addEventListener('click',()=>{
 if(playing)return;
 if(level<5){level++;reset();return;}
 if(world===5){window.location.href='glitch.html';return;}if(world<10){world++;level=1;showMap();return;}
 showKingdom();
});
startBtn.addEventListener('click',reset);document.querySelector('#mapBtn').addEventListener('click',showMap);document.querySelector('#soundBtn').addEventListener('click',()=>{muted=!muted;document.querySelector('#soundBtn').textContent=muted?'🔇 Som desligado':'🔊 Som ligado';if(!muted){tone(600,.12);if(playing)startMusic()}else stopMusic()});document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{if(!b.disabled){level=Number(b.dataset.level);reset();}}));
function bind(id,key){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;el.setPointerCapture(e.pointerId)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>keys[key]=false)}bind('left','left');bind('right','right');bind('jump','jump');const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump'};window.addEventListener('keydown',e=>{const k=mapping[e.code];if(k){e.preventDefault();keys[k]=true}});window.addEventListener('keyup',e=>{const k=mapping[e.code];if(k){e.preventDefault();keys[k]=false}});window.addEventListener('blur',()=>{keys.left=keys.right=keys.jump=false});reset(false);showChoose();updateWorldAccess();
try{if(new URLSearchParams(location.search).get('world')==='6'&&localStorage.getItem('miau-bit-intermundo-glitch-completo')==='sim'){world=6;showMap();}}catch(e){}
requestAnimationFrame(frame);
