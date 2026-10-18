import * as THREE from 'three';
import { CSS3DObject } from './vendor/three/CSS3DRenderer.js';

export function createSurfaces(cssScene, model) {
  const monitorElement=document.createElement('section');monitorElement.className='monitor-ui';monitorElement.setAttribute('aria-label','Projects on the monitor');
  monitorElement.innerHTML=`<div class="monitor-topbar"><span class="monitor-dots"><i></i><i></i><i></i></span><span>workshop://projects</span><img src="./assets/favicon.svg" width="16" height="16" alt=""></div><div class="monitor-heading"><div><small>A FEW THINGS I’VE BUILT</small><h2>Projects<span>.</span></h2></div><a href="https://github.com/hiooooopji" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div><nav class="monitor-tabs" aria-label="Choose a project"><button data-project="0" aria-pressed="true">01 · Learn Up!</button><button data-project="1" aria-pressed="false">02 · botas</button><button data-project="2" aria-pressed="false">03 · The Full Picture</button><button data-project="3" aria-pressed="false">04 · Connect X</button><button data-project="4" aria-pressed="false">More projects ↗</button></nav><div class="monitor-content"></div><footer class="monitor-status"><span class="status-dot"></span><span>BUILT WITH CURIOSITY</span><span id="monitor-count">01 / 05</span></footer>`;
  const sourceProjects=[...document.querySelectorAll('#work>.project')];
  let pendingStory=false;
  function showProject(index,expand=false){
    pendingStory=expand;
    monitorElement.querySelectorAll('[data-project]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.project)===index)));
    const content=monitorElement.querySelector('.monitor-content');content.replaceChildren();
    if(index<sourceProjects.length){
      const project=sourceProjects[index].cloneNode(true);project.removeAttribute('id');
      project.querySelectorAll('[id]').forEach(element=>{element.dataset.story=element.id;element.removeAttribute('id');});
      content.append(project);
      if(expand){const story=project.querySelector('.project-story');if(story)story.open=true;}
    }
    else {
      const heading=document.createElement('div');heading.className='drawer-heading';heading.innerHTML='<h3>More projects &amp; experiments.</h3><p>More code, side quests, and experiments.</p>';
      const repos=document.getElementById('repo-list').cloneNode(true);repos.removeAttribute('id');content.append(heading,repos);
    }
    monitorElement.querySelector('#monitor-count').textContent=`0${index+1} / 05`;content.scrollTop=0;
  }
  monitorElement.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>showProject(Number(button.dataset.project))));showProject(0);
  const monitor=new CSS3DObject(monitorElement);cssScene.add(monitor);

  const notebookElement=document.createElement('section');notebookElement.className='notebook-ui';notebookElement.setAttribute('aria-label','Interactive personal notebook');
  notebookElement.innerHTML=`<div class="notebook-binding"></div><div class="notebook-spread"><aside class="notebook-left"><span class="eyebrow">PROPERTY OF SIDDHARTH</span><h2>A few pages<br><em>from my world.</em></h2><div class="notebook-sketch">✧<span>⌘</span>✳</div><p>Stay curious.<br>Make something.<br>See what happens.</p><span class="notebook-margin-note">Always room for another idea.</span></aside><div class="notebook-right"><div class="notebook-page-content"></div><div class="notebook-pagination"><button id="notebook-prev" aria-label="Previous notebook page">←</button><span id="notebook-page" aria-live="polite">01 / 03</span><button id="notebook-next" aria-label="Next notebook page">→</button></div></div></div><nav class="notebook-tabs" aria-label="Notebook chapters"><button data-page="0" aria-pressed="true">The person</button><button data-page="1" aria-pressed="false">Field notes</button><button data-page="2" aria-pressed="false">Your doodle</button></nav>`;
  const pages=[
    `<span class="eyebrow">01 / THE PERSON</span><h3>Hi, I’m<br><em>Siddharth.</em></h3><p>I like the space where code meets curiosity. Bots that find their own way. Games that invite you to explore. Tools that make learning more interesting.</p><p>I’m a developer on <strong>Learn Up</strong>, a game developer on <strong>The Full Picture</strong>, and the person behind the experiments on this desk.</p><a class="notebook-link" href="https://github.com/hiooooopji" target="_blank" rel="noopener noreferrer">Find me on GitHub ↗</a><span class="handwritten">Turn the page. There’s more.</span>`,
    `<span class="eyebrow">02 / FIELD NOTES</span><h3>Follow the<br><em>interesting bit.</em></h3><ul class="field-notes"><li><b>01</b><span>A bot finding its way through Minecraft.<small>Java · navigation · automation</small></span></li><li><b>02</b><span>A detective puzzle, built with a team.<small>Godot · The Full Picture</small></span></li><li><b>03</b><span>A different way to learn.<small>Learn Up · web & Android</small></span></li><li><b>04</b><span>Two bots. Opposite ambitions.<small>Python · Connect X</small></span></li></ul><span class="handwritten">What happens if I try this?</span>`,
    `<span class="eyebrow">03 / YOUR LITTLE CORNER</span><h3>Leave a<br><em>little mark.</em></h3><p class="doodle-instruction">A thought, a tiny cat, a very bad circle.<br>This page is yours to draw on.</p><canvas id="notebook-doodle" width="600" height="360" aria-label="Draw a doodle with your mouse or finger"></canvas><div class="doodle-tools"><div class="doodle-colors" aria-label="Ink color"><button data-ink="#615b43" style="--ink-color:#615b43" aria-label="Graphite ink" aria-pressed="true"></button><button data-ink="#a75c43" style="--ink-color:#a75c43" aria-label="Terracotta ink" aria-pressed="false"></button><button data-ink="#6c8060" style="--ink-color:#6c8060" aria-label="Sage ink" aria-pressed="false"></button></div><button id="doodle-undo">Undo</button><button id="doodle-clear">Clear</button></div><small class="doodle-saved" role="status">Saved only in this browser.</small>`,
  ];
  let page=0,turnTimer;
  function displayPage(index,animate=true){
    if(index<0||index>=pages.length)return;
    page=index;clearTimeout(turnTimer);
    const container=notebookElement.querySelector('.notebook-page-content');
    container.innerHTML=pages[page];
    notebookElement.querySelector('#notebook-prev').disabled=page===0;notebookElement.querySelector('#notebook-next').disabled=page===pages.length-1;
    notebookElement.querySelector('#notebook-page').textContent=`0${page+1} / 03`;
    notebookElement.querySelectorAll('[data-page]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.page)===page)));
    if(animate){notebookElement.classList.remove('page-turn');void notebookElement.offsetWidth;notebookElement.classList.add('page-turn');turnTimer=setTimeout(()=>notebookElement.classList.remove('page-turn'),500);}
    if(page===2)setupDoodle(container);
  }
  notebookElement.querySelector('#notebook-prev').addEventListener('click',()=>displayPage(page-1));
  notebookElement.querySelector('#notebook-next').addEventListener('click',()=>displayPage(page+1));
  notebookElement.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>displayPage(Number(button.dataset.page))));displayPage(0,false);
  const notebook=new CSS3DObject(notebookElement);cssScene.add(notebook);
  function resize(mobile){
    const mw=mobile?480:960,mh=mobile?650:600,bw=mobile?420:820,bh=mobile?600:540;
    monitorElement.style.width=`${mw}px`;monitorElement.style.height=`${mh}px`;monitorElement.classList.toggle('compact',mobile);monitor.scale.setScalar(3.02/mw);
    notebookElement.style.width=`${bw}px`;notebookElement.style.height=`${bh}px`;notebookElement.classList.toggle('compact',mobile);notebook.scale.setScalar(1.81/bw);
    return {monitor:{width:3.02,height:3.02*mh/mw},notebook:{width:1.81,height:1.81*bh/bw}};
  }
  function position(){
    model.monitor.updateMatrixWorld(true);model.notebook.updateMatrixWorld(true);
    monitor.position.copy(model.monitor.localToWorld(new THREE.Vector3(0,.025,.115)));monitor.quaternion.copy(model.monitor.quaternion);
    notebook.position.copy(model.notebook.localToWorld(new THREE.Vector3(0,0,.09)));notebook.quaternion.copy(model.notebook.quaternion);
  }
  function show(view){
    monitor.visible=view==='monitor';notebook.visible=view==='notebook';
    for(const [name,element] of [['monitor',monitorElement],['notebook',notebookElement]]){element.inert=view!==name;element.style.visibility=view===name?'visible':'hidden';element.style.pointerEvents=view===name?'auto':'none';}
    if(view==='monitor'&&pendingStory)requestAnimationFrame(()=>{
      if(!monitor.visible)return;
      const content=monitorElement.querySelector('.monitor-content'),story=content.querySelector('.project-story');
      if(story)content.scrollTop=story.offsetTop-18;
      pendingStory=false;
    });
  }
  show('overview');position();
  return {monitor,notebook,monitorElement,notebookElement,resize,position,show,openProject(key){const index=sourceProjects.findIndex(project=>project.dataset.projectKey===key);if(index>=0)showProject(index,true);}};
}

function setupDoodle(container){
  const canvas=container.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),history=[];let drawing=false,ink='#615b43';
  ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
  try{const saved=localStorage.getItem('midnight-workshop:doodle');if(saved){const image=new Image();image.onload=()=>ctx.drawImage(image,0,0);image.src=saved;}}catch{}
  function point(event){const rect=canvas.getBoundingClientRect();return [(event.clientX-rect.left)*canvas.width/rect.width,(event.clientY-rect.top)*canvas.height/rect.height];}
  function save(){try{localStorage.setItem('midnight-workshop:doodle',canvas.toDataURL());container.querySelector('.doodle-saved').textContent='Saved only in this browser.';}catch{container.querySelector('.doodle-saved').textContent='Drawing kept for this visit.';}}
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();drawing=true;canvas.setPointerCapture(event.pointerId);history.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.length>15)history.shift();ctx.strokeStyle=ink;ctx.beginPath();ctx.moveTo(...point(event));});
  canvas.addEventListener('pointermove',event=>{if(!drawing)return;ctx.lineTo(...point(event));ctx.stroke();});
  const finish=()=>{if(drawing){drawing=false;save();}};canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
  container.querySelectorAll('[data-ink]').forEach(button=>button.addEventListener('click',()=>{ink=button.dataset.ink;container.querySelectorAll('[data-ink]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  container.querySelector('#doodle-undo').addEventListener('click',()=>{const state=history.pop();if(state){ctx.putImageData(state,0,0);save();}});
  container.querySelector('#doodle-clear').addEventListener('click',()=>{history.push(ctx.getImageData(0,0,canvas.width,canvas.height));ctx.clearRect(0,0,canvas.width,canvas.height);save();});
}
