import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { CSS3DRenderer } from './vendor/three/CSS3DRenderer.js';
import { buildRoom } from './room-model.js';
import { createSurfaces } from './room-surfaces.js';

export function createWorkshop({ dialog, game }) {
  const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#eee9dd');
  const cssScene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.domElement.setAttribute('aria-label','Interactive 3D workshop. Use the navigation buttons to visit the monitor, notebook, or Connect X board.');
  $('world-layer').replaceChildren(renderer.domElement);
  const cssRenderer=new CSS3DRenderer();cssRenderer.domElement.style.pointerEvents='none';$('surface-layer').replaceChildren(cssRenderer.domElement);
  const camera=new THREE.PerspectiveCamera(45,1,.03,100);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
  controls.minPolarAngle=.48;controls.maxPolarAngle=1.35;controls.minAzimuthAngle=.12;controls.maxAzimuthAngle=1.3;controls.minDistance=9;controls.maxDistance=40;
  const ambient=new THREE.HemisphereLight('#fff2d7','#7c8b73',2.1);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#ffe8c0',3.4);sun.position.set(3,8,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:25});sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;scene.add(sun);
  const fill=new THREE.DirectionalLight('#b9d6d8',1.2);fill.position.set(-3,5,-1);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#eee9dd',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.3;ground.receiveShadow=true;scene.add(ground);
  const model=buildRoom(scene),surfaces=createSurfaces(cssScene,model);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
  let view='overview',isOpen=false,transition=null,frame=0,mobile=false,width=1,height=1,dimensions,gameState=game.getState(),lampOn=true,dirty=true;
  controls.addEventListener('change',()=>{dirty=true;});
  let pointerStart=null,movedGame=[];
  const labelButtons=[...$('world-labels').querySelectorAll('button')];
  const columnButtons=[];
  for(let column=0;column<7;column++){
    const button=document.createElement('button');button.type='button';button.textContent=column+1;button.setAttribute('aria-label',`Drop a piece in column ${column+1}`);button.dataset.column=column;
    button.addEventListener('click',()=>game.playColumn(column));
    button.addEventListener('pointerenter',()=>{model.hoverColumn(column,gameState);dirty=true;});button.addEventListener('pointerleave',()=>{model.hoverColumn(null,gameState);dirty=true;});
    button.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const dir=event.key==='ArrowRight'?1:-1;for(let n=1;n<7;n++){const next=columnButtons[(column+dir*n+7)%7];if(!next.disabled){next.focus();break;}}}});
    $('room-column-controls').append(button);columnButtons.push(button);
  }
  game.subscribe(state=>{
    gameState=state;model.syncGame(state);dirty=true;
    columnButtons.forEach((button,c)=>{button.disabled=!state.active||state.busy||state.board[c]!==0;button.setAttribute('aria-label',document.querySelector(`.board-column[data-column="${c}"]`).getAttribute('aria-label'));});
    if(view==='game')$('room-hint').textContent=state.active?'Click a column on the board, or press 1–7.':'Choose an opponent, then start a round.';
  });
  function moveGameIn(){
    if(movedGame.length)return;
    for(const selector of ['#play .play-copy','#play .game-table']){
      const node=document.querySelector(selector),placeholder=document.createComment('Game controls return here');
      node.before(placeholder);movedGame.push([node,placeholder]);$('room-game-controls').append(node);
    }
  }
  function restoreGame(){for(const [node,placeholder] of movedGame)placeholder.replaceWith(node);movedGame=[];}
  function fit(w,h,vertical=.68,horizontal=.83){return Math.max(h/(2*Math.tan(Math.PI/8)*vertical),w/(2*Math.tan(Math.PI/8)*camera.aspect*horizontal));}
  function pose(name){
    const position=new THREE.Vector3(),target=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
    if(name==='overview'){
      const distance=mobile?Math.max(24,31*(.46/camera.aspect)):13.7;
      target.set(0,1.65,0);position.set(.55,.48,.69).normalize().multiplyScalar(distance).add(target);
    }else if(name==='monitor'){
      target.copy(model.monitor.position).add(new THREE.Vector3(0,.025,.12));position.copy(target).add(new THREE.Vector3(0,0,fit(dimensions.monitor.width,dimensions.monitor.height,.69,.85)));
    }else if(name==='notebook'){
      target.copy(model.notebook.position).add(new THREE.Vector3(0,.095,0));
      const d=fit(dimensions.notebook.width,dimensions.notebook.height,.68,.82);
      position.copy(target).add(new THREE.Vector3(0,d,.0001));up.set(0,1,0).applyQuaternion(model.notebook.quaternion);
    }else{
      target.copy(model.board.position).add(new THREE.Vector3(mobile?0:-.87,mobile?-.83:.03,.15));
      const d=fit(2.85,2.6,mobile?.43:.67,mobile?.86:.60);position.copy(target).add(new THREE.Vector3(0,0,d));
    }
    const probe=new THREE.PerspectiveCamera();probe.position.copy(position);probe.up.copy(up);probe.lookAt(target);
    return {position,target,quaternion:probe.quaternion.clone()};
  }
  function updatePhysicalSurfaces(){
    const monitorHeight=view==='monitor'?dimensions.monitor.height:1.8;
    model.monitorBody.scale.y=(monitorHeight+.24)/2.04;
    model.monitorScreen.scale.y=monitorHeight/1.8;
    const notebookHeight=view==='notebook'?dimensions.notebook.height:1.17;
    model.bookCover.scale.y=(notebookHeight+.12)/1.29;model.bookPaper.scale.y=notebookHeight/1.17;model.bookPreview.scale.y=notebookHeight/1.15;
    surfaces.position();
    renderer.shadowMap.needsUpdate=true;
  }
  function focus(name,animate=true){
    if(!['overview','monitor','notebook','game'].includes(name))return;
    view=name;dirty=true;dialog.dataset.view=name;dialog.dataset.moving='true';
    controls.enabled=false;surfaces.show('overview');model.monitorScreen.visible=true;model.bookPreview.visible=true;
    model.hoverColumn(null,gameState);
    $('room-game-controls').hidden=true;$('room-column-controls').hidden=true;
    if(name==='game')moveGameIn();else restoreGame();
    updatePhysicalSurfaces();
    const names={overview:'MAKE YOURSELF AT HOME',monitor:'01 / THE MONITOR',notebook:'02 / THE NOTEBOOK',game:'03 / THE GAME TABLE'};
    $('room-location').textContent=names[name];$('room-back').querySelector('span').textContent=name==='overview'?'Back to portfolio':'Back to the room';
    $('room-intro').hidden=name!=='overview';$('world-labels').hidden=name!=='overview';
    $('room-hint').textContent={overview:'Drag to look around · Click an object to explore',monitor:'A few things I’ve built. Click a tab to explore.',notebook:'Turn a page. Follow a thought. Leave a doodle.',game:'Choose an opponent, then start a round.'}[name];
    dialog.querySelectorAll('.world-dock button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.worldTarget===name)));
    const goal=pose(name);
    transition={start:performance.now(),duration:animate&&!reduced.matches?1200:0,fromPosition:camera.position.clone(),fromQuaternion:camera.quaternion.clone(),...goal};
  }
  function completeTransition(){
    const goal=transition;transition=null;camera.position.copy(goal.position);camera.quaternion.copy(goal.quaternion);controls.target.copy(goal.target);
    controls.enabled=view==='overview';if(controls.enabled)controls.update();
    surfaces.show(view);model.monitorScreen.visible=view!=='monitor';model.bookPreview.visible=view!=='notebook';
    $('room-game-controls').hidden=view!=='game';$('room-column-controls').hidden=view!=='game';dialog.dataset.moving='false';
  }
  function resize(){
    width=dialog.clientWidth||innerWidth;height=dialog.clientHeight||innerHeight;mobile=width<740;
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);cssRenderer.setSize(width,height);
    dimensions=surfaces.resize(mobile);updatePhysicalSurfaces();
    if(isOpen)focus(view,false);
  }
  function screenPoint(position){projected.copy(position).project(camera);return {x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height};}
  function positionLabels(){
    if(view==='overview')for(const button of labelButtons){const p=screenPoint(model.anchors[button.dataset.worldTarget]);button.style.left=`${p.x}px`;button.style.top=`${p.y}px`;}
    if(view==='game')for(let c=0;c<7;c++){const p=screenPoint(model.board.localToWorld(new THREE.Vector3((c-3)*.36,1.36,.25)));columnButtons[c].style.left=`${p.x}px`;columnButtons[c].style.top=`${p.y}px`;}
  }
  function animate(time){
    frame=0;if(!isOpen)return;
    let changed=dirty||Boolean(transition);
    if(transition){
      const t=transition.duration?Math.min(1,(time-transition.start)/transition.duration):1;
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      camera.position.lerpVectors(transition.fromPosition,transition.position,eased);camera.quaternion.slerpQuaternions(transition.fromQuaternion,transition.quaternion,eased);
      if(t===1)completeTransition();
    }else if(controls.enabled)controls.update();
    changed=model.update(time,reduced.matches)||changed||dirty;
    if(changed){positionLabels();renderer.render(scene,camera);cssRenderer.render(cssScene,camera);dirty=false;}
    frame=requestAnimationFrame(animate);
  }
  function cast(event,objects){
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(objects,false)[0];
  }
  renderer.domElement.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointermove',event=>{
    if(transition)return;
    if(view==='game'){
      const hit=cast(event,model.columnHits);model.hoverColumn(hit?hit.object.userData.column:null,gameState);dirty=true;renderer.domElement.style.cursor=hit&&gameState.active&&!gameState.busy?'pointer':'default';
    }else if(view==='overview'){
      const hit=cast(event,model.interactive);renderer.domElement.style.cursor=hit?'pointer':'grab';
      labelButtons.forEach(button=>button.classList.toggle('hovered',button.dataset.worldTarget===hit?.object.userData.target));
    }
  });
  renderer.domElement.addEventListener('pointerleave',()=>{model.hoverColumn(null,gameState);dirty=true;});
  renderer.domElement.addEventListener('pointerup',event=>{
    if(!pointerStart||Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>7||transition)return;
    pointerStart=null;
    if(view==='game'){
      const hit=cast(event,model.columnHits);if(hit)game.playColumn(hit.object.userData.column);
    }else if(view==='overview'){
      const hit=cast(event,model.interactive);if(!hit)return;
      const target=hit.object.userData.target;
      if(target==='lamp'){lampOn=!lampOn;model.deskLight.intensity=lampOn?7:.2;model.lampGlow.material.emissiveIntensity=lampOn?1:.1;dirty=true;$('room-hint').textContent=lampOn?'The light’s on. Let’s make something.':'A little quieter. A little cozier.';}
      else focus(target);
    }
  });
  dialog.querySelectorAll('[data-world-target]').forEach(button=>button.addEventListener('click',()=>focus(button.dataset.worldTarget)));
  dialog.addEventListener('keydown',event=>{if(view==='game'&&/^[1-7]$/.test(event.key)&&!['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)){event.preventDefault();game.playColumn(Number(event.key)-1);}});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();$('room-error').hidden=false;});
  window.addEventListener('resize',()=>{if(isOpen)resize();});
  resize();
  return {
    get view(){return view;},focus,
    openProject(key){surfaces.openProject(key);focus('monitor');},
    open(target='overview'){
      isOpen=true;resize();
      const initial=pose('overview');camera.position.copy(initial.position).multiplyScalar(1.07);camera.quaternion.copy(initial.quaternion);controls.target.copy(initial.target);
      focus(target);if(!frame)frame=requestAnimationFrame(animate);
    },
    close(){isOpen=false;cancelAnimationFrame(frame);frame=0;transition=null;controls.enabled=false;restoreGame();surfaces.show('overview');$('room-game-controls').hidden=true;$('room-column-controls').hidden=true;},
  };
}
