import * as THREE from 'three';

export function buildRoom(scene) {
  const room = new THREE.Group(); scene.add(room);
  const interactive = [], materials = new Map();
  function mat(color, extras = {}) {
    if (Object.keys(extras).length) return new THREE.MeshStandardMaterial({ color, roughness: .8, ...extras });
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .8 }));
    return materials.get(color);
  }
  function mesh(geometry, material, position, parent = room) {
    const object = new THREE.Mesh(geometry, material); object.position.set(...position);
    object.castShadow = object.receiveShadow = true; parent.add(object); return object;
  }
  const box = (w,h,d,color,p,parent=room) => mesh(new THREE.BoxGeometry(w,h,d), typeof color === 'string' ? mat(color) : color, p, parent);
  const cylinder = (top,bottom,h,color,p,parent=room,n=24) => mesh(new THREE.CylinderGeometry(top,bottom,h,n), typeof color === 'string' ? mat(color) : color,p,parent);
  function sphere(r,color,p,scale=[1,1,1],parent=room) {
    const object=mesh(new THREE.SphereGeometry(r,20,12),mat(color),p,parent);object.scale.set(...scale);return object;
  }
  function rod(a,b,r,color,parent=room) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const object=cylinder(r,r,start.distanceTo(end),color,start.clone().add(end).multiplyScalar(.5).toArray(),parent,12);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return object;
  }
  function hit(object,target) { object.traverse(child=>{if(child.isMesh){child.userData.target=target;interactive.push(child);}}); }
  function texture(draw,w=512,h=256) {
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  function label(text,color='#e3d9b7',background='#354c43',w=512,h=256) {
    return texture((c)=>{c.fillStyle=background;c.fillRect(0,0,w,h);c.fillStyle=color;c.font='28px monospace';c.fillText(text,34,72);c.globalAlpha=.45;for(let i=0;i<5;i++){c.fillRect(34,106+i*23,120+(i*53)%270,4);}},w,h);
  }
  const wood = texture((c,w,h)=>{c.fillStyle='#bc946a';c.fillRect(0,0,w,h);for(let i=0;i<50;i++){c.strokeStyle=`rgba(104,72,42,${.04+(i%4)*.015})`;c.beginPath();c.moveTo(0,i*5);c.bezierCurveTo(170,i*5+8,320,i*5-7,w,i*5+2);c.stroke();}});
  const woodMat=mat('#dbc5a1',{map:wood,roughness:.9});
  box(8.2,.22,6.2,'#7e684f',[0,-.15,0]);
  for(let i=0;i<16;i++)box(.49,.07,6,woodMat,[-3.75+i*.5,0,0]);
  box(8.2,4.5,.16,'#3d5551',[0,2.17,-3.05]);
  box(.16,4.5,6.15,'#53665b',[-4.05,2.17,0]);
  box(8.25,.09,.24,'#9eab8d',[0,4.46,-3.05]);box(.24,.09,6.15,'#9eab8d',[-4.05,4.46,0]);
  box(8,.13,.1,'#243e35',[0,.1,-2.93]);box(.1,.13,6,'#243e35',[-3.94,.1,0]);
  // Woven rug, with narrow borders and visible threads.
  box(4.35,.025,2.8,'#bca983',[.15,.065,1.03]);
  for(const [w,d,color] of [[4.12,2.57,'#ded1aa'],[3.96,2.41,'#8d9276'],[3.85,2.3,'#c0b08b']])box(w,.006,d,color,[.15,.082+(4.35-w)*.02,1.03]);
  for(let i=0;i<25;i++)box(3.8,.003,.013,'#b1a480',[.15,.104,-.06+i*.09]);
  // Window: the night sky is a self-contained procedural illustration.
  const sky=texture((c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#142734');g.addColorStop(1,'#52616b');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#e4dbb2';c.beginPath();c.arc(360,72,26,0,Math.PI*2);c.fill();c.fillStyle='#1a2d3a';c.beginPath();c.arc(371,64,25,0,Math.PI*2);c.fill();for(let i=0;i<22;i++){const x=i*27,y=170+(i*31)%60;c.fillStyle='#1a3038';c.fillRect(x,y,28,h-y);c.fillStyle='#b9a375';if(i%3)c.fillRect(x+8,y+15,4,7);}c.strokeStyle='#a1b5bc55';for(let i=0;i<70;i++){const x=i*83%w,y=i*37%h;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+14);c.stroke();}});
  const windowGroup=new THREE.Group();windowGroup.position.set(1.75,3.07,-2.93);room.add(windowGroup);
  box(2.75,1.8,.09,'#a6aa8d',[0,0,0],windowGroup);
  mesh(new THREE.PlaneGeometry(2.52,1.58),new THREE.MeshBasicMaterial({map:sky}),[0,0,.051],windowGroup);
  box(.055,1.63,.08,'#a6aa8d',[0,0,.1],windowGroup);box(2.6,.055,.08,'#a6aa8d',[0,-.08,.1],windowGroup);
  box(2.95,.1,.36,'#b4b396',[0,-.94,.1],windowGroup);
  // Shelf and books on the left wall.
  box(.65,.1,2.9,woodMat,[-3.65,3.18,-.8]);
  for(let i=0;i<11;i++){const h=.38+(i%4)*.08;const book=box(.39,h,.13,['#c4bb91','#b47954','#748a81','#c8a770'][i%4],[-3.64,3.25+h/2,-1.95+i*.155]);if(i===10)book.rotation.x=.18;box(.405,.015,.136,'#e0d0a2',[-3.64,3.35,-1.95+i*.155]);}
  function plant(x,y,z,size=1) {
    const p=new THREE.Group();p.position.set(x,y,z);p.scale.setScalar(size);room.add(p);
    cylinder(.22,.16,.4,'#b67f5d',[0,.2,0],p);cylinder(.208,.208,.018,'#66513a',[0,.405,0],p);
    for(let i=0;i<7;i++){const angle=i*2.4;const end=[Math.cos(angle)*.23,.67+(i%3)*.13,Math.sin(angle)*.23];rod([0,.4,0],end,.012,'#71835b',p);const leaf=sphere(.15,['#90a172','#788c5e','#a0ad7b'][i%3],end,[.55,1.65,.3],p);leaf.rotation.z=-Math.cos(angle)*.6;leaf.rotation.y=-angle;}
    return p;
  }
  plant(-3.65,3.23,.25,.63);plant(3.35,.03,-2,1.7);
  // Desk, drawers, and a warm pool of lamplight.
  box(5.8,.16,1.9,woodMat,[-.6,1.68,-1.5]);
  for(const x of [-3.25,2.05])for(const z of [-2.2,-.8])box(.13,1.6,.13,'#6b5943',[x,.8,z]);
  box(1.02,1.38,1.5,'#98774f',[-2.65,.82,-1.5]);
  for(let i=0;i<3;i++){box(.94,.4,.06,'#b48d5e',[-2.65,.35+i*.44,-.72]);box(.28,.035,.045,'#655a42',[-2.65,.35+i*.44,-.676]);}
  // Monitor: its HTML project browser will occupy this exact screen in 3D.
  const monitor=new THREE.Group();monitor.position.set(.25,2.85,-1.96);room.add(monitor);
  const monitorBody=box(3.28,2.04,.2,'#414b40',[0,0,0],monitor);
  const monitorScreen=mesh(new THREE.PlaneGeometry(3.02,1.8),new THREE.MeshBasicMaterial({map:label('hello, world.')}),[0,.025,.108],monitor);
  box(.24,.56,.22,'#6c7562',[0,-1.2,-.01],monitor);box(1,.07,.55,'#6c7562',[0,-1.48,.12],monitor);
  sphere(.025,'#d2d6a7',[1.42,-.94,.12],[1,1,.4],monitor);hit(monitor,'monitor');
  const keyboard=box(1.57,.065,.52,'#747b63',[.15,1.81,-.56]);
  for(let r=0;r<4;r++)for(let c=0;c<13;c++)box(.087,.025,.075,'#cbc8a4',[-.54+c*.11,1.855,-.73+r*.11]);
  const mouse=sphere(.15,'#8d967d',[1.23,1.84,-.5],[.65,.35,1]);
  hit(keyboard,'monitor');hit(mouse,'monitor');
  // Notebook lies on the desk. Its pages stay attached during the camera move.
  const notebook=new THREE.Group();notebook.position.set(-1.67,1.82,-.62);notebook.rotation.set(-Math.PI/2,0,-.12);room.add(notebook);
  const bookCover=box(1.93,1.29,.07,'#966e48',[0,0,0],notebook);
  const bookPaper=box(1.81,1.17,.055,'#eee1bd',[0,0,.055],notebook);
  const bookPreview=mesh(new THREE.PlaneGeometry(1.79,1.15),new THREE.MeshBasicMaterial({map:label('stay curious.','#797155','#eee1bd')}),[0,0,.085],notebook);
  box(.018,1.2,.02,'#a39a7c',[0,0,.09],notebook);hit(notebook,'notebook');
  const pencil=cylinder(.018,.018,.65,'#a88144',[-.62,1.8,-.35],room,8);pencil.rotation.z=Math.PI/2;pencil.rotation.y=.3;
  const lamp=new THREE.Group();lamp.position.set(-2.55,1.81,-1.73);room.add(lamp);
  cylinder(.23,.26,.07,'#a3a381',[0,0,0],lamp);rod([0,.02,0],[.06,.6,0],.035,'#8c9171',lamp);rod([.06,.6,0],[.48,.92,.05],.035,'#8c9171',lamp);
  sphere(.065,'#c3bc91',[.06,.6,0],[1,1,1],lamp);
  cylinder(.12,.32,.24,'#c8b784',[.48,.82,.05],lamp);const lampGlow=cylinder(.29,.29,.015,mat('#ffe0a0',{emissive:'#ffc96d',emissiveIntensity:1}),[.48,.695,.05],lamp);
  const deskLight=new THREE.PointLight('#ffd49b',7,5,2);deskLight.position.set(-2.1,2.4,-1.65);scene.add(deskLight);hit(lamp,'lamp');
  // Mug, tiny plant, and a few loose notes.
  cylinder(.145,.13,.24,'#c6ad83',[1.68,1.93,-1.32]);cylinder(.117,.117,.006,'#604c34',[1.68,2.055,-1.32]);
  const handle=mesh(new THREE.TorusGeometry(.095,.025,8,24),mat('#c6ad83'),[1.83,1.96,-1.32]);handle.rotation.y=Math.PI/2;
  plant(1.93,1.78,-2.13,.65);
  for(let i=0;i<2;i++){const note=box(.45,.004,.32,'#e5d7ae',[-3.05+i*.2,1.775,-.9+i*.04]);note.rotation.y=i*.2;}
  // Chair and a sleeping cat.
  cylinder(.07,.07,.75,'#485040',[-.25,.45,.72]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod([-.25,.2,.72],[-.25+Math.cos(a)*.55,.12,.72+Math.sin(a)*.55],.035,'#485040');}
  box(1.14,.16,1,'#a56e4e',[-.25,.92,.72]);box(1.12,.83,.14,'#b5865d',[-.25,1.4,1.18]);
  sphere(.35,'#baa98a',[-2.6,.3,1.1],[1.1,.6,.8]);sphere(.18,'#c2b394',[-2.3,.38,1.1]);
  for(const dx of [-.11,.11]){const ear=mesh(new THREE.ConeGeometry(.08,.15,3),mat('#c2b394'),[-2.3+dx,.55,1.09]);ear.rotation.z=dx>0?-.2:.2;}
  const tail=mesh(new THREE.TorusGeometry(.27,.055,8,24,Math.PI*1.5),mat('#baa98a'),[-2.9,.18,1.12]);tail.rotation.x=Math.PI/2;
  // Framed paper and pinned plans.
  box(.07,.92,.68,'#c2ae86',[-3.94,2.5,.75]);const sketch=mesh(new THREE.PlaneGeometry(.61,.83),new THREE.MeshBasicMaterial({map:label('what if?','#6f765a','#e5d9b4')}),[-3.896,2.5,.75]);sketch.rotation.y=Math.PI/2;
  const wallNote=mesh(new THREE.PlaneGeometry(.67,.52),new THREE.MeshBasicMaterial({map:label('one more idea','#727b61','#d4d0ae')}),[-1.9,3.65,-2.954]);wallNote.rotation.z=-.08;
  // Physical Connect X board with real holes, stands, and drop-in tokens.
  const board=new THREE.Group();board.position.set(2.15,1.94,1.38);room.add(board);
  box(3.2,.12,1.4,woodMat,[2.15,.67,1.38]);for(const x of [.8,3.5])for(const z of [.85,1.9])box(.09,.63,.09,'#786045',[x,.32,z]);
  const shape=new THREE.Shape();shape.moveTo(-1.36,-1.21);shape.lineTo(1.36,-1.21);shape.lineTo(1.36,1.21);shape.lineTo(-1.36,1.21);shape.closePath();
  const cell=(r,c)=>new THREE.Vector3((c-3)*.36,(2.5-r)*.36,.1);
  for(let r=0;r<6;r++)for(let c=0;c<7;c++){const p=cell(r,c),hole=new THREE.Path();hole.absarc(p.x,p.y,.153,0,Math.PI*2,true);shape.holes.push(hole);}
  const boardMesh=mesh(new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:16}),mat('#9aa986'),[0,0,0],board);
  for(const x of [-1.3,1.3]){box(.11,2.7,.28,'#647957',[x,-.08,.07],board);box(.28,.09,.87,'#647957',[x,-1.24,.1],board);}
  hit(board,'game');
  const tokens=[],rings=[],faceRings=[],falling=new Map();let previous=Array(42).fill(0);
  const amber=mat('#d8a04b',{roughness:.55,metalness:.1}),sage=mat('#718d68',{roughness:.55,metalness:.1});
  const amberRim=mat('#f1c573',{roughness:.65}),sageRim=mat('#b1c399',{roughness:.65});
  for(let r=0;r<6;r++)for(let c=0;c<7;c++){
    const position=cell(r,c);const token=cylinder(.143,.143,.16,amber,position.toArray(),board,32);token.rotation.x=Math.PI/2;token.visible=false;tokens.push(token);
    const ring=mesh(new THREE.TorusGeometry(.158,.012,6,32),new THREE.MeshBasicMaterial({color:'#ffe9a5'}),[position.x,position.y,.209],board);ring.visible=false;rings.push(ring);
    const faceRing=mesh(new THREE.TorusGeometry(.112,.008,6,24),amberRim,[position.x,position.y,.185],board);faceRing.visible=false;faceRing.castShadow=false;faceRings.push(faceRing);
  }
  const ghost=cylinder(.14,.14,.16,mat('#e4b66d',{transparent:true,opacity:.5}),[0,1.42,.1],board,24);ghost.rotation.x=Math.PI/2;ghost.visible=false;
  const columnHits=[];
  for(let c=0;c<7;c++){const hitbox=box(.35,2.45,.06,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),[(c-3)*.36,0,.26],board);hitbox.userData.column=c;columnHits.push(hitbox);}
  const syncGame=state=>{
    for(let i=0;i<42;i++){
      tokens[i].visible=Boolean(state.board[i]);tokens[i].material=state.board[i]===state.humanMark?amber:sage;rings[i].visible=state.winners.includes(i);
      faceRings[i].visible=Boolean(state.board[i]);faceRings[i].material=state.board[i]===state.humanMark?amberRim:sageRim;
      const goal=cell(Math.floor(i/7),i%7).y;
      if(!state.board[i]){falling.delete(i);tokens[i].position.y=goal;faceRings[i].position.y=goal;}
      else if(!previous[i]){falling.set(i,{start:performance.now(),goal});tokens[i].position.y=1.48;faceRings[i].position.y=1.48;}
    }
    previous=[...state.board];ghost.visible=false;
  };
  function update(time,reducedMotion){const changed=falling.size>0;for(const [i,fall] of falling){const t=reducedMotion?1:Math.min(1,(time-fall.start)/430);tokens[i].position.y=THREE.MathUtils.lerp(1.48,fall.goal,t*t);faceRings[i].position.y=tokens[i].position.y;if(t===1)falling.delete(i);}return changed;}
  function hoverColumn(column,state){ghost.visible=column!==null&&state.active&&!state.busy&&state.board[column]===0;if(ghost.visible)ghost.position.x=(column-3)*.36;}
  return {room,interactive,monitor,monitorBody,monitorScreen,notebook,bookCover,bookPaper,bookPreview,board,boardMesh,columnHits,syncGame,update,hoverColumn,deskLight,lampGlow,anchors:{monitor:new THREE.Vector3(.25,3.3,-1.8),notebook:new THREE.Vector3(-1.67,1.84,-.62),game:new THREE.Vector3(2.15,3.25,1.5)}};
}
