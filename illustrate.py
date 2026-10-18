"""Original vector illustrations for the workshop; no external image assets."""
from pathlib import Path
import random

random.seed(8)
assets = Path(__file__).parent / 'dist' / 'assets'
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 680">
<defs>
 <linearGradient id="left" x2="1" y2="1"><stop stop-color="#64716b"/><stop offset="1" stop-color="#394e4a"/></linearGradient>
 <linearGradient id="right" x2="0" y2="1"><stop stop-color="#3e5554"/><stop offset="1" stop-color="#293f40"/></linearGradient>
 <linearGradient id="floor" x2="1" y2=".4"><stop stop-color="#b68d63"/><stop offset="1" stop-color="#84694c"/></linearGradient>
 <linearGradient id="wood" x2=".6" y2="1"><stop stop-color="#d3ad79"/><stop offset="1" stop-color="#ad8054"/></linearGradient>
 <linearGradient id="screen" x2="0" y2="1"><stop stop-color="#435e55"/><stop offset="1" stop-color="#253a35"/></linearGradient>
 <linearGradient id="night" x2="0" y2="1"><stop stop-color="#1e303b"/><stop offset="1" stop-color="#40515a"/></linearGradient>
 <radialGradient id="glow"><stop stop-color="#ffda8a" stop-opacity=".65"/><stop offset="1" stop-color="#ffda8a" stop-opacity="0"/></radialGradient>
 <radialGradient id="shadow"><stop stop-color="#66563c" stop-opacity=".2"/><stop offset="1" stop-color="#66563c" stop-opacity="0"/></radialGradient>
 <pattern id="grain" width="80" height="18" patternUnits="userSpaceOnUse"><path d="M0 3Q30 8 80 3M0 13Q50 8 80 13" fill="none" stroke="#886244" stroke-opacity=".15" stroke-width=".6"/></pattern>
 <clipPath id="floorclip"><path d="M103 478L394 374 720 490 427 605Z"/></clipPath>
 <clipPath id="windowclip"><path d="M464 142L648 208 648 325 464 260Z"/></clipPath>
</defs>
<ellipse cx="419" cy="574" rx="344" ry="67" fill="url(#shadow)"/>
<!-- architectural shell -->
<path d="M96 157L394 53 727 170 727 495 427 618 96 495Z" fill="#4a4c3d"/>
<path d="M103 166L394 64 394 383 103 487Z" fill="url(#left)"/>
<path d="M394 64L720 179 720 493 394 383Z" fill="url(#right)"/>
<path d="M103 478L394 374 720 490 427 605Z" fill="url(#floor)"/>
<path d="M103 478L427 592 720 479V493L427 610 103 492Z" fill="#9b7852"/>
<path d="M103 478L394 374 720 490 427 605Z" fill="url(#grain)"/>
<g clip-path="url(#floorclip)" stroke="#74543c" stroke-width="1" opacity=".35">''']
for i in range(13):
    x = 65 + i * 57
    parts.append(f'<path d="M{x} 385l345 122"/>')
for i in range(6):
    x=95+i*65
    parts.append(f'<path d="M{x} 535l300-109"/>')
parts.append('''</g>
<path d="M103 467L394 364 720 480" fill="none" stroke="#293e37" stroke-width="10"/>
<path d="M394 66V364" stroke="#708077" stroke-width="2" opacity=".35"/>
<!-- framed night window -->
<path d="M450 119L663 194 663 346 450 272Z" fill="#25362e" stroke="#8a8e73" stroke-width="2"/>
<path d="M464 142L648 208 648 325 464 260Z" fill="url(#night)"/>
<g clip-path="url(#windowclip)">
<circle cx="596" cy="203" r="19" fill="#d3ceac"/><circle cx="606" cy="197" r="18" fill="#263946"/>
<path d="M455 242L479 250 479 230 505 239 505 263 526 270 526 246 544 253 544 277 564 284 564 264 584 270 584 292 610 300 610 278 633 286 633 308 655 314V345L450 277Z" fill="#1d3038"/>
<g fill="#bcac77" opacity=".55"><path d="M485 245h3v4h-3zM496 249h3v4h-3zM533 260h3v4h-3zM618 292h3v4h-3zM573 278h3v4h-3z"/></g>
<g stroke="#b3c4c4" stroke-width=".8" opacity=".3">''')
for i in range(38):
    x=random.randrange(465,650);y=random.randrange(145,326)
    parts.append(f'<path d="M{x} {y}l-2 9"/>')
parts.append('''</g></g><path d="M555 172V293M463 201L648 266" stroke="#798477" stroke-width="5"/>
<path d="M450 272L663 346 678 338 463 263Z" fill="#9e977b"/>
<path d="M450 272L663 346V352L450 278Z" fill="#666e5b"/>
<!-- wall shelf -->
<path d="M139 234L321 170 346 180 164 246Z" fill="#bd9a6b"/><path d="M164 246L346 180V189L164 254Z" fill="#8c704f"/>
<path d="M176 248V266M317 198V217" stroke="#293b34" stroke-width="5"/>
''')
for x,y,h,col in [(164,222,41,'#b4b190'),(177,217,49,'#b98161'),(190,213,44,'#d0b586'),(203,208,51,'#7f9290'),(215,204,43,'#d6c49a'),(228,199,49,'#c6926a')]:
    parts.append(f'<path d="M{x} {y}v-{h}l10-4v{h}Z" fill="{col}" stroke="#3e4b3f" stroke-width="1"/><path d="M{x+2} {y-h+8}l6-2M{x+2} {y-7}l6-2" stroke="#ece0b7" opacity=".7"/>')
parts.append('''<!-- shelf plant -->
<path d="M284 187l-6-24 29-10-3 27Z" fill="#b5805d"/><path d="M281 162l26-9 2 6-27 10Z" fill="#c99a71"/>
<path d="M291 159q-22-18-18-31 22-3 22 28M294 155q-3-35 12-39 13 12-9 37M295 158q10-23 25-20-1 17-25 23" fill="#8d9d6f"/>
<!-- taped sketches -->
<path d="M142 298l66-24v72l-66 24Z" fill="#e1d8b8" transform="rotate(-3 173 322)"/>
<path d="M160 287l24-9v7l-24 9Z" fill="#b7b19c"/>
<g fill="none" stroke="#89866e" stroke-width="1.4"><path d="M154 329l17-23 24 13-16 20Z M171 306v19l-17 4M171 325l24-6M179 339v-12"/><path d="M153 351l41-15" stroke-width=".7"/></g>
<path d="M244 272l64-22v56l-64 23Z" fill="#b8b7a2"/>
<path d="M253 284l16-6m-16 12 38-13m-38 20 27-9m-27 16 38-13" stroke="#737d69" stroke-width="2"/>
<path d="M267 259l19-7v6l-19 7Z" fill="#d0c4a0"/>
<!-- rug -->
<path d="M245 495L438 427 626 494 432 569Z" fill="#bba987" stroke="#d6c7a5" stroke-width="3"/>
<path d="M265 495L439 436 605 494 432 558Z" fill="none" stroke="#827b62" stroke-width="2"/>
<path d="M283 496L439 445 585 494 432 548Z" fill="none" stroke="#dbceb0" stroke-width="2"/>
<!-- desk structure -->
<path d="M191 390v104l12 5V394Z" fill="#554b38"/><path d="M366 447v111l12 5V451Z" fill="#574934"/><path d="M622 382v118l11-4V378Z" fill="#514632"/>
<path d="M220 395L280 375 280 470 220 492Z" fill="#8a7353"/><path d="M220 395l65 22v74l-65-23Z" fill="#b18d60"/><path d="M285 417l45-17v74l-45 17Z" fill="#7c674b"/>
<path d="M225 415l55 19m-55 3 55 19m-55 3 55 19" stroke="#8b6d4b" stroke-width="2"/>
<path d="M244 417l18 6m-18 16 18 6m-18 16 18 6" stroke="#5f5941" stroke-width="3"/>
<path d="M177 365L458 285 662 359 375 450Z" fill="url(#wood)" stroke="#d3b387" stroke-width="2"/>
<path d="M177 365L375 435 662 348V362L375 454 177 380Z" fill="#876647"/>
<path d="M177 365L458 285 662 359 375 450Z" fill="url(#wood)"/>
<path d="M177 365L458 285 662 359 375 450Z" fill="url(#grain)"/>
<!-- light pool -->
<ellipse cx="313" cy="360" rx="123" ry="72" fill="url(#glow)"/>
<!-- articulated brass lamp -->
<ellipse cx="261" cy="361" rx="25" ry="9" fill="#5c6347"/><ellipse cx="261" cy="357" rx="25" ry="8" fill="#a6a17c"/>
<path d="M260 355L273 304 305 276" fill="none" stroke="#555941" stroke-width="8"/><path d="M258 352L271 302 303 275" fill="none" stroke="#b9b188" stroke-width="3"/>
<circle cx="272" cy="304" r="6" fill="#c9bc8b" stroke="#737657" stroke-width="2"/>
<path d="M288 279Q304 253 326 279L337 297Q310 310 281 295Z" fill="#c3b481" stroke="#666e50" stroke-width="2"/>
<ellipse cx="309" cy="296" rx="28" ry="7" fill="#f8daa0"/><ellipse cx="309" cy="296" rx="18" ry="4" fill="#ffe6ac"/>
<!-- monitor and stand -->
<path d="M408 380v24l-23 8 48 16 27-9-26-9v-23" fill="#61685a"/><path d="M385 412l48 16 27-9v5l-27 9-48-16Z" fill="#414b40"/>
<path d="M344 265L521 315 521 408 344 357Z" fill="#242f2b" stroke="#9da18a" stroke-width="3"/>
<path d="M354 278L511 322 511 393 354 349Z" fill="url(#screen)"/>
<path d="M355 280l156 44" stroke="#7b9882" stroke-width=".7"/>
<g transform="matrix(1 .285 0 1 363 292)"><circle cx="0" cy="0" r="2" fill="#c38e66"/><circle cx="7" cy="0" r="2" fill="#c5b675"/><circle cx="14" cy="0" r="2" fill="#91a87d"/>
<text x="0" y="19" font-family="monospace" font-size="8" fill="#c9d3af">hello, world.</text>
<path d="M0 28h20m6 0h35M7 35h23m6 0h41M7 42h16m6 0h47M0 49h27" stroke="#a9bb8a" stroke-width="2"/><path d="M65 28h17M79 42h27M80 35h10" stroke="#c7a876" stroke-width="2"/><path d="M93 49h5" stroke="#e5d9ac" stroke-width="4"/></g>
<circle cx="434" cy="387" r="1.7" fill="#a5bd79"/>
<!-- keyboard -->
<path d="M342 391l100 29-32 11-100-29Z" fill="#626c5b"/><path d="M310 402l100 29v4l-100-29Z" fill="#435142"/>
<g stroke="#c3c4a6" stroke-width="3">''')
for r in range(3):
    for c in range(11):
        x=337+c*8-r*7;y=397+c*2.3+r*3
        parts.append(f'<path d="M{x:.1f} {y:.1f}l5 1.4"/>')
parts.append('''</g><path d="M347 416l35 10" stroke="#b5b69a" stroke-width="3"/>
<ellipse cx="461" cy="424" rx="10" ry="6" fill="#6a725e" transform="rotate(16 461 424)"/><path d="M461 419v3" stroke="#babfa0"/>
<!-- open notebook -->
<path d="M214 385l45-13 57 20-46 14Z" fill="#786444"/><path d="M214 381l43-12 15 28-3 6-55-18Z" fill="#e3d6b1"/><path d="M259 369l57 19-44 13-14-28Z" fill="#f1e6c8"/>
<path d="M258 371l13 29" stroke="#baac84"/><path d="M228 383l20 6m-17-11 20 6m27-3 23 8m-26-2 17 6" stroke="#9b9978" stroke-width="1"/>
<path d="M287 402l32-10" stroke="#785a3b" stroke-width="3"/><path d="M287 402l-5 1" stroke="#d9c6a0" stroke-width="2"/>
<!-- coffee cup and steam -->
<ellipse cx="566" cy="370" rx="20" ry="7" fill="#76684b" opacity=".3"/><path d="M551 346v20q14 11 28 0v-20" fill="#d5bc90"/><ellipse cx="565" cy="346" rx="14" ry="5" fill="#e4d1aa"/><ellipse cx="565" cy="346" rx="10" ry="3" fill="#63503d"/><path d="M579 350q15-1 9 11l-9 1" fill="none" stroke="#d5bc90" stroke-width="5"/><path d="M562 333q-8-7 0-14m9 16q8-7 0-14" fill="none" stroke="#d4cfb5" opacity=".4" stroke-width="1.6"/>
<!-- desk succulent -->
<path d="M602 329l4 21q13 6 23-1l4-21Z" fill="#bb8864"/><ellipse cx="617" cy="329" rx="16" ry="5" fill="#735d42"/>
<path d="M616 329q-27-10-20-25 17-2 20 25M618 329q-4-30 9-32 10 12-9 32M618 329q8-18 24-16 1 16-24 16" fill="#84976b"/>
<!-- front chair -->
<path d="M388 494v57m-1-4-37 13m38-14 36 14m-36-14v22" stroke="#414c40" stroke-width="7" stroke-linecap="round"/>
<path d="M343 470l49-18 50 19-53 22Z" fill="#9b684e" stroke="#71533e" stroke-width="2"/>
<path d="M343 470v11l46 17 53-20v-7l-53 22Z" fill="#80533f"/>
<path d="M338 457v-53q0-8 9-5l65 21q7 2 7 11v52Z" fill="#b27e5b" stroke="#75543d" stroke-width="2"/>
<path d="M344 452v-44q0-5 6-2l58 18q5 2 5 7v44Z" fill="#be8d63"/>
<path d="M344 427l68 23" stroke="#a87752" stroke-width="1"/>
<!-- low game table -->
<g transform="translate(-24 -28)">
<path d="M527 493v32M655 504v27M586 523v30" stroke="#6a5840" stroke-width="10"/>
<path d="M503 486l97-35 91 33-103 39Z" fill="#c6a471" stroke="#93734f" stroke-width="2"/><path d="M503 486v9l85 36 103-39v-8l-103 39Z" fill="#97794f"/>
<!-- connect X board -->
<path d="M536 418l119 37v75l-119-38Z" fill="#9ba58a" stroke="#56694d" stroke-width="2"/>
<path d="M530 488l12-4 11 20-12 4Zm112 36 13-4 11 20-13 4Z" fill="#758366"/>
''')
for c in range(7):
    for r in range(6):
        x=545+c*16;y=431+c*4.9+r*10
        fill='#485a48'
        if r>=5-(c%3): fill=('#d4aa60' if (r+c)%2 else '#c9ccad')
        parts.append(f'<ellipse cx="{x}" cy="{y}" rx="5.1" ry="4.2" fill="{fill}"/>')
parts.append('''<ellipse cx="667" cy="497" rx="8" ry="3" fill="#d6ad62"/><ellipse cx="667" cy="493" rx="8" ry="3" fill="#e6bc70"/>
</g>
<!-- floor plant in far corner -->
<ellipse cx="674" cy="455" rx="21" ry="9" fill="#45513b" opacity=".35"/>
<path d="M657 416l5 34q15 10 29 0l6-34Z" fill="#b88060"/><ellipse cx="677" cy="416" rx="20" ry="7" fill="#7e6247"/>
<path d="M677 414q-6-36-3-66m4 62 17-49m-19 52-19-37" stroke="#788b60" stroke-width="3" fill="none"/>
<path d="M675 379q-32-20-24-36 23 2 24 36M676 362q-13-36 1-43 15 17-1 43M684 390q28-4 29-25-20-8-29 25M691 374q-2-31 16-34 10 18-16 34M666 399q-30-4-31-24 19-5 31 24" fill="#7a9161"/>
<path d="M674 374q-18-15-20-25M695 373l10-26M667 394l-24-13" stroke="#9eae7d" fill="none" opacity=".5"/>
<!-- curious cat -->
<ellipse cx="221" cy="509" rx="30" ry="12" fill="#4b4a3b" opacity=".2"/>
<path d="M192 501q-2-29 25-27 24-1 22 27-14 14-47 0Z" fill="#b9ac8a"/><path d="M209 477l-5-17 16 8 13-10 3 24Z" fill="#c5b99a"/>
<path d="M210 477h3m14-3h3" stroke="#515340" stroke-width="2"/><path d="M219 483l4 1-2 3Z" fill="#826650"/>
<path d="M195 499q-25 5-28-7-2-10 9-8" fill="none" stroke="#b9ac8a" stroke-width="9" stroke-linecap="round"/>
<!-- subtle architectural edges -->
<path d="M96 157L394 53 727 170" fill="none" stroke="#939780" stroke-width="4"/>
<path d="M96 157v338l331 123 300-123V170" fill="none" stroke="#67715c" stroke-width="3"/>
</svg>''')
(assets / 'workshop.svg').write_text(''.join(parts))

parts=['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 330"><defs><radialGradient id="bg"><stop stop-color="#c7d5ca"/><stop offset="1" stop-color="#dfe6e5"/></radialGradient></defs><path fill="url(#bg)" d="M0 0h560v330H0z"/><ellipse cx="286" cy="263" rx="170" ry="29" fill="#9fafa4" opacity=".13"/>''']
def cube(x,y,w,h,top='#a3b394',left='#738774',right='#8d9c7e'):
    parts.append(f'<path d="M{x} {y}l{w} {-w/2} {w} {w/2}-{w} {w/2}Z" fill="{top}"/><path d="M{x} {y}v{h}l{w} {w/2}v-{h}Z" fill="{left}"/><path d="M{x+w} {y+w/2}l{w} {-w/2}v{h}l-{w} {w/2}Z" fill="{right}"/>')
for x,y,w,h in [(260,115,42,70),(176,157,42,40),(302,157,42,65),(218,178,42,47),(134,199,42,30),(260,199,42,38),(344,178,42,50),(302,220,42,25),(218,241,42,15)]:
    cube(x,y,w,h)
parts.append('<path d="M186 205l77-38 42 20 43 21" fill="none" stroke="#f5e8bd" stroke-width="3" stroke-dasharray="5 6"/>')
cube(252,99,21,36,'#b7aa8c','#948972','#a79b7d')
cube(247,68,26,35,'#e5d7b8','#c7bb9e','#d7c9a9')
parts.append('''<path d="M253 82l16 8v12l-16-8Z" fill="#465b50"/><path d="M256 87l3 2v4l-3-2Zm8 4 3 2v4l-3-2Z" fill="#cee3b0"/><path d="M273 70v-13" stroke="#8e9779" stroke-width="3"/><circle cx="273" cy="54" r="4" fill="#d6aa69"/><path d="M246 111l-10 14m50-1 9 15" stroke="#8e8c71" stroke-width="7"/>
<path d="M384 162v-45" stroke="#827b60" stroke-width="8"/><path d="M355 107l30-16 32 17-31 17Z" fill="#92a57e"/><path d="M355 107v25l31 16v-23Z" fill="#718b6e"/><path d="M386 125l31-17v25l-31 15Z" fill="#829a74"/>
<path d="M114 174l23-11 25 11-25 12Z" fill="#b6c4a6"/><path d="M114 174v16l23 12v-16Z" fill="#8fa18b"/><path d="M137 186l25-12v16l-25 12Z" fill="#9eae8e"/>
<g fill="#91a48b" opacity=".45"><path d="M407 232l8-4 8 4-8 4Z"/><path d="M118 246l7-4 7 4-7 4Z"/><path d="M330 83l6-3 6 3-6 3Z"/></g></svg>''')
(assets/'botas.svg').write_text(''.join(parts))
