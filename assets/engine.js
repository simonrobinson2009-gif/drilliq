// ─── DrillIQ Animation Engine ───────────────────────────────────────────────
// Shared by all drill pages. Do not edit unless changing core behaviour.

const W=405,H=720,PITCH_X=20,PITCH_Y=210,PITCH_W=365,PITCH_H=280,PLAYER_R=13;

function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}
function toCanvas(pt){return{x:PITCH_X+pt.x,y:PITCH_Y+pt.y};}

function buildSegMeta(segments){
  let total=0;
  return segments.map(seg=>{
    const start=total,moveEnd=start+seg.moveDuration,end=moveEnd+seg.pauseDuration;
    total=end;
    return{...seg,start,moveEnd,end};
  });
}

function interpState(sA,sB,localT){
  const et=easeInOut(Math.max(0,Math.min(1,localT)));
  let arrowOpacity,arrows;
  if(localT<0.38){arrowOpacity=1;arrows=sA.arrows;}
  else if(localT<0.52){arrowOpacity=Math.max(0,1-(localT-0.38)/0.14);arrows=sA.arrows;}
  else{arrows=sB.arrows;arrowOpacity=Math.min(1,(localT-0.52)/0.2);}
  return{
    label:localT<0.5?sA.label:sB.label,
    players:sA.players.map((p,i)=>({x:lerp(p.x,sB.players[i].x,et),y:lerp(p.y,sB.players[i].y,et)})),
    ball:{x:lerp(sA.ball.x,sB.ball.x,et),y:lerp(sA.ball.y,sB.ball.y,et)},
    arrows,arrowOpacity,isPause:false
  };
}

function getAnimState(elapsedMs,states,segMeta,totalDuration){
  const t=elapsedMs%totalDuration;
  for(const seg of segMeta){
    if(t>=seg.start&&t<seg.end){
      const sA=states[seg.from],sB=states[seg.to];
      if(t<seg.moveEnd)return interpState(sA,sB,(t-seg.start)/seg.moveDuration);
      return{...sB,arrowOpacity:1,isPause:true};
    }
  }
  return{...states[Object.keys(states)[0]],arrowOpacity:1,isPause:false};
}

function resolvePoint(ref,players){
  return typeof ref==="number"?toCanvas(players[ref]):toCanvas(ref);
}

function svgEl(tag,attrs,text){
  const el=document.createElementNS("http://www.w3.org/2000/svg",tag);
  for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);
  if(text!==undefined)el.textContent=text;
  return el;
}

function drawArrow(parent,arrow,players,opacity){
  const rF=resolvePoint(arrow.from,players),rT=resolvePoint(arrow.to,players);
  const dx=rT.x-rF.x,dy=rT.y-rF.y,dist=Math.sqrt(dx*dx+dy*dy)||1;
  const ux=dx/dist,uy=dy/dist;
  const s=typeof arrow.from==="number"?PLAYER_R+1:0;
  const e=typeof arrow.to==="number"?PLAYER_R+1:0;
  const x1=rF.x+ux*s,y1=rF.y+uy*s,x2=rT.x-ux*e,y2=rT.y-uy*e;
  const hs=9,ex=x2-ux*hs,ey=y2-uy*hs,px=-uy*hs*0.5,py=ux*hs*0.5;
  const g=document.createElementNS("http://www.w3.org/2000/svg","g");
  g.setAttribute("opacity",opacity);
  const line=document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1",x1);line.setAttribute("y1",y1);line.setAttribute("x2",ex);line.setAttribute("y2",ey);
  line.setAttribute("stroke",arrow.color);line.setAttribute("stroke-width",arrow.dashed?"1.6":"2.5");
  if(arrow.dashed)line.setAttribute("stroke-dasharray","6 4");
  line.setAttribute("stroke-linecap","round");
  g.appendChild(line);
  if(!arrow.dashed){
    const poly=document.createElementNS("http://www.w3.org/2000/svg","polygon");
    poly.setAttribute("points",`${x2},${y2} ${ex+px},${ey+py} ${ex-px},${ey-py}`);
    poly.setAttribute("fill",arrow.color);g.appendChild(poly);
  } else {
    const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",x2);c.setAttribute("cy",y2);c.setAttribute("r",3);c.setAttribute("fill",arrow.color);g.appendChild(c);
  }
  parent.appendChild(g);
}

function drawBall(parent,x,y,spinAngle){
  const r=9;
  parent.appendChild(svgEl("ellipse",{cx:x+2,cy:y+r+1,rx:r*0.75,ry:2.5,fill:"rgba(0,0,0,0.35)"}));
  parent.appendChild(svgEl("circle",{cx:x,cy:y,r,fill:"#f0f0f0"}));
  const rot=document.createElementNS("http://www.w3.org/2000/svg","g");
  rot.setAttribute("transform",`rotate(${spinAngle},${x},${y})`);
  rot.appendChild(svgEl("circle",{cx:x,cy:y,r:3,fill:"#111"}));
  [0,72,144,216,288].forEach(deg=>{
    const rad=deg*Math.PI/180,px2=x+Math.cos(rad)*5.5,py2=y+Math.sin(rad)*5.5;
    const el=svgEl("ellipse",{cx:px2,cy:py2,rx:2.2,ry:1.5,fill:"#111"});
    el.setAttribute("transform",`rotate(${deg},${px2},${py2})`);rot.appendChild(el);
  });
  parent.appendChild(rot);
  parent.appendChild(svgEl("circle",{cx:x,cy:y,r,fill:"none",stroke:"#222","stroke-width":"0.8"}));
  parent.appendChild(svgEl("circle",{cx:x-3,cy:y-3,r:2.2,fill:"rgba(255,255,255,0.55)"}));
}

function drawPlayer(parent,cx,cy,color,label){
  parent.appendChild(svgEl("circle",{cx:cx+1.5,cy:cy+2.5,r:PLAYER_R,fill:"rgba(0,0,0,0.5)"}));
  parent.appendChild(svgEl("circle",{cx,cy,r:PLAYER_R,fill:color}));
  parent.appendChild(svgEl("circle",{cx,cy,r:PLAYER_R,fill:"none",stroke:"rgba(255,255,255,0.25)","stroke-width":"1.5"}));
  const t=svgEl("text",{x:cx,y:cy+5,"text-anchor":"middle",fill:"#000","font-size":"12","font-weight":"900","font-family":"'Barlow Condensed',sans-serif"},label);
  parent.appendChild(t);
}

// ─── Build the static (non-animating) parts of the SVG frame ────────────────
function buildStaticSVG(svg, config){
  const{drillNum,drillCat,title1,title2,meta,seriesLabel,players,phaseDots,startPositions,coneGate}=config;
  const ns="http://www.w3.org/2000/svg";

  // defs
  const defs=document.createElementNS(ns,"defs");
  defs.innerHTML=`
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#0d1530"/>
      <stop offset="100%" stop-color="#080c18"/>
    </radialGradient>
    <filter id="playerGlow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="pitchClip">
      <rect x="${PITCH_X}" y="${PITCH_Y}" width="${PITCH_W}" height="${PITCH_H}"/>
    </clipPath>`;
  svg.appendChild(defs);

  // background
  svg.appendChild(svgEl("rect",{width:W,height:H,fill:"url(#bgGrad)"}));
  for(let i=0;i<8;i++) svg.appendChild(svgEl("line",{x1:0,y1:i*90,x2:W,y2:i*90,stroke:"rgba(180,255,80,0.03)","stroke-width":1}));

  // series badge
  svg.appendChild(svgEl("rect",{x:22,y:8,width:62,height:16,rx:3,fill:"rgba(180,255,80,0.08)",stroke:"rgba(180,255,80,0.2)","stroke-width":1}));
  svg.appendChild(svgEl("text",{x:53,y:20,"text-anchor":"middle",fill:"rgba(180,255,80,0.6)","font-size":9,"font-weight":700,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":2},seriesLabel));
  svg.appendChild(svgEl("line",{x1:0,y1:62,x2:W,y2:62,stroke:"rgba(180,255,80,0.15)","stroke-width":1}));

  // logo — tspans so DRILL and IQ sit flush as one word
  const logoEl=document.createElementNS(ns,"text");
  logoEl.setAttribute("x",22);logoEl.setAttribute("y",46);
  logoEl.setAttribute("font-size",28);logoEl.setAttribute("font-weight",900);
  logoEl.setAttribute("font-family","'Barlow Condensed',sans-serif");
  const ts1=document.createElementNS(ns,"tspan");ts1.setAttribute("fill","#B4FF50");ts1.setAttribute("letter-spacing",1);ts1.textContent="DRILL";
  const ts2=document.createElementNS(ns,"tspan");ts2.setAttribute("fill","#ffffff");ts2.setAttribute("letter-spacing",2);ts2.textContent="IQ";
  logoEl.appendChild(ts1);logoEl.appendChild(ts2);svg.appendChild(logoEl);

  // age badge
  svg.appendChild(svgEl("rect",{x:W-80,y:22,width:58,height:24,rx:12,fill:"rgba(180,255,80,0.12)",stroke:"rgba(180,255,80,0.3)","stroke-width":1}));
  svg.appendChild(svgEl("text",{x:W-51,y:38,"text-anchor":"middle",fill:"#B4FF50","font-size":10,"font-weight":700,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":2},"U8 · U10"));

  // drill label + title
  svg.appendChild(svgEl("text",{x:22,y:86,fill:"rgba(180,255,80,0.55)","font-size":10,"font-weight":700,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":4},`DRILL ${drillNum} · ${drillCat}`));
  svg.appendChild(svgEl("text",{x:22,y:120,fill:"#ffffff","font-size":38,"font-weight":900,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":1},title1));
  svg.appendChild(svgEl("text",{x:22,y:155,fill:"#ffffff","font-size":38,"font-weight":900,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":1},title2));

  // meta pills
  meta.forEach((tag,i)=>{
    svg.appendChild(svgEl("rect",{x:22+i*88,y:163,width:80,height:20,rx:4,fill:"rgba(255,255,255,0.04)",stroke:"rgba(255,255,255,0.08)","stroke-width":1}));
    svg.appendChild(svgEl("text",{x:22+i*88+40,y:177,"text-anchor":"middle",fill:"rgba(255,255,255,0.4)","font-size":9,"font-weight":600,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":2},tag));
  });

  // pitch stripes + markings
  const pw=PITCH_W,ph=PITCH_H,ox=PITCH_X,oy=PITCH_Y;
  for(let i=0;i<Math.ceil(pw/28);i++) svg.appendChild(svgEl("rect",{x:ox+i*28,y:oy,width:14,height:ph,fill:i%2===0?"#0d1f0d":"#0b1a0b"}));
  svg.appendChild(svgEl("rect",{x:ox,y:oy,width:pw,height:ph,fill:"none",stroke:"#1a5c2a","stroke-width":1.2}));
  svg.appendChild(svgEl("line",{x1:ox+pw/2,y1:oy,x2:ox+pw/2,y2:oy+ph,stroke:"#1a5c2a","stroke-width":1}));
  svg.appendChild(svgEl("circle",{cx:ox+pw/2,cy:oy+ph/2,r:36,fill:"none",stroke:"#1a5c2a","stroke-width":1}));
  svg.appendChild(svgEl("circle",{cx:ox+pw/2,cy:oy+ph/2,r:2,fill:"#1a5c2a"}));
  svg.appendChild(svgEl("rect",{x:ox,y:oy+ph*0.25,width:pw*0.18,height:ph*0.5,fill:"none",stroke:"#1a5c2a","stroke-width":1}));
  svg.appendChild(svgEl("rect",{x:ox+pw*0.82,y:oy+ph*0.25,width:pw*0.18,height:ph*0.5,fill:"none",stroke:"#1a5c2a","stroke-width":1}));
  svg.appendChild(svgEl("rect",{x:ox,y:oy+ph*0.37,width:pw*0.08,height:ph*0.26,fill:"none",stroke:"#1a5c2a","stroke-width":0.8}));
  svg.appendChild(svgEl("rect",{x:ox+pw*0.92,y:oy+ph*0.37,width:pw*0.08,height:ph*0.26,fill:"none",stroke:"#1a5c2a","stroke-width":0.8}));
  svg.appendChild(svgEl("rect",{x:ox-12,y:oy+ph*0.37,width:12,height:ph*0.26,fill:"none",stroke:"rgba(255,255,255,0.4)","stroke-width":1.2}));
  svg.appendChild(svgEl("rect",{x:ox+pw,y:oy+ph*0.37,width:12,height:ph*0.26,fill:"none",stroke:"rgba(255,255,255,0.4)","stroke-width":1.2}));
  svg.appendChild(svgEl("circle",{cx:ox+pw*0.14,cy:oy+ph*0.5,r:2.2,fill:"#1a5c2a"}));
  svg.appendChild(svgEl("circle",{cx:ox+pw*0.86,cy:oy+ph*0.5,r:2.2,fill:"#1a5c2a"}));

  // start position rings — dashed circle in player colour at initial position
  if(startPositions){
    startPositions.forEach((p,i)=>{
      const col=players[i]?players[i].color:"#ffffff";
      svg.appendChild(svgEl("circle",{cx:PITCH_X+p.x,cy:PITCH_Y+p.y,r:PLAYER_R+5,fill:"none",stroke:col,"stroke-width":1.2,"stroke-dasharray":"4 3",opacity:0.35}));
    });
  }

  // cone gate — two orange triangles marking the finishing zone near goal mouth
  if(coneGate){
    coneGate.forEach(c=>{
      const cx3=PITCH_X+c.x,cy3=PITCH_Y+c.y,cs=7;
      svg.appendChild(svgEl("polygon",{points:`${cx3},${cy3-cs} ${cx3-cs*0.6},${cy3+cs*0.5} ${cx3+cs*0.6},${cy3+cs*0.5}`,fill:"#FF8C00",opacity:0.85}));
      svg.appendChild(svgEl("polygon",{points:`${cx3},${cy3-cs} ${cx3-cs*0.6},${cy3+cs*0.5} ${cx3+cs*0.6},${cy3+cs*0.5}`,fill:"none",stroke:"rgba(255,255,255,0.35)","stroke-width":0.8}));
    });
  }

  // dynamic layer — cleared and redrawn every frame
  const dl=document.createElementNS(ns,"g");dl.id="dynamicLayer";svg.appendChild(dl);

  // goal flash overlay
  const go=document.createElementNS(ns,"rect");
  go.id="goalOverlay";go.setAttribute("width",W);go.setAttribute("height",H);
  go.setAttribute("fill","rgba(180,255,80,0.05)");go.setAttribute("opacity",0);
  svg.appendChild(go);

  // phase bar background
  svg.appendChild(svgEl("rect",{x:0,y:PITCH_Y+PITCH_H,width:W,height:1,fill:"rgba(180,255,80,0.12)"}));
  svg.appendChild(svgEl("rect",{x:0,y:PITCH_Y+PITCH_H+1,width:W,height:72,fill:"rgba(10,15,30,0.95)"}));

  // phase step dots
  const dotsGroup=document.createElementNS(ns,"g");dotsGroup.id="dotsGroup";svg.appendChild(dotsGroup);
  const spacing=phaseDots<=4?32:28,wA=phaseDots<=4?28:24,wI=phaseDots<=4?20:16;
  for(let i=0;i<phaseDots;i++){
    const dot=document.createElementNS(ns,"rect");
    dot.setAttribute("x",22+i*spacing);dot.setAttribute("y",PITCH_Y+PITCH_H+14);
    dot.setAttribute("width",wI);dot.setAttribute("height",3);dot.setAttribute("rx",1.5);
    dot.setAttribute("fill","rgba(180,255,80,0.18)");dot.id=`dot_${i}`;dotsGroup.appendChild(dot);
  }

  // hold badge
  const hg=document.createElementNS(ns,"g");hg.id="holdGroup";hg.setAttribute("opacity",0);svg.appendChild(hg);
  hg.appendChild(svgEl("rect",{x:W-78,y:PITCH_Y+PITCH_H+8,width:56,height:18,rx:9,fill:"rgba(180,255,80,0.1)",stroke:"rgba(180,255,80,0.25)","stroke-width":1}));
  hg.appendChild(svgEl("text",{x:W-50,y:PITCH_Y+PITCH_H+20,"text-anchor":"middle",fill:"#B4FF50","font-size":9,"font-weight":700,"letter-spacing":1.5,"font-family":"'Barlow Condensed',sans-serif"},"● HOLD"));

  // phase label text
  const pl=document.createElementNS(ns,"text");
  pl.id="phaseLabel";pl.setAttribute("x",22);pl.setAttribute("y",PITCH_Y+PITCH_H+36);
  pl.setAttribute("fill","#ffffff");pl.setAttribute("font-size",18);pl.setAttribute("font-weight",900);
  pl.setAttribute("font-family","'Barlow Condensed',sans-serif");pl.setAttribute("letter-spacing",1);
  svg.appendChild(pl);

  // footer
  svg.appendChild(svgEl("rect",{x:0,y:PITCH_Y+PITCH_H+73,width:W,height:1,fill:"rgba(180,255,80,0.08)"}));
  svg.appendChild(svgEl("rect",{x:0,y:PITCH_Y+PITCH_H+74,width:W,height:56,fill:"rgba(8,12,24,0.98)"}));

  // legend — pass
  svg.appendChild(svgEl("line",{x1:22,y1:PITCH_Y+PITCH_H+95,x2:50,y2:PITCH_Y+PITCH_H+95,stroke:"#B4FF50","stroke-width":2}));
  svg.appendChild(svgEl("polygon",{points:`50,${PITCH_Y+PITCH_H+92} 58,${PITCH_Y+PITCH_H+95} 50,${PITCH_Y+PITCH_H+98}`,fill:"#B4FF50"}));
  svg.appendChild(svgEl("text",{x:64,y:PITCH_Y+PITCH_H+99,fill:"rgba(255,255,255,0.5)","font-size":10,"font-weight":600,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":1.5},"PASS"));
  // legend — run
  svg.appendChild(svgEl("line",{x1:114,y1:PITCH_Y+PITCH_H+95,x2:142,y2:PITCH_Y+PITCH_H+95,stroke:"#7aaff0","stroke-width":1.5,"stroke-dasharray":"5 3"}));
  svg.appendChild(svgEl("circle",{cx:146,cy:PITCH_Y+PITCH_H+95,r:2.5,fill:"#7aaff0"}));
  svg.appendChild(svgEl("text",{x:154,y:PITCH_Y+PITCH_H+99,fill:"rgba(255,255,255,0.5)","font-size":10,"font-weight":600,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":1.5},"RUN"));

  // player colour keys
  const keyX=players.length<=2?220:players.length===3?220:205;
  const keySpacing=players.length<=3?58:48;
  players.forEach((p,i)=>{
    svg.appendChild(svgEl("circle",{cx:keyX+i*keySpacing,cy:PITCH_Y+PITCH_H+95,r:7,fill:p.color}));
    svg.appendChild(svgEl("text",{x:keyX+i*keySpacing,y:PITCH_Y+PITCH_H+99,"text-anchor":"middle",fill:"#000","font-size":8,"font-weight":900,"font-family":"'Barlow Condensed',sans-serif"},p.label));
  });

  // handle
  svg.appendChild(svgEl("text",{x:W/2,y:PITCH_Y+PITCH_H+122,"text-anchor":"middle",fill:"rgba(180,255,80,0.25)","font-size":10,"font-weight":700,"font-family":"'Barlow Condensed',sans-serif","letter-spacing":3},"@DRILLIQ · #FOOTBALLCOACHING"));

  // progress bar track + fill
  svg.appendChild(svgEl("rect",{x:0,y:H-4,width:W,height:4,fill:"rgba(180,255,80,0.08)"}));
  const pb=document.createElementNS(ns,"rect");
  pb.id="progressBar";pb.setAttribute("x",0);pb.setAttribute("y",H-4);pb.setAttribute("width",0);pb.setAttribute("height",4);pb.setAttribute("fill","#B4FF50");pb.setAttribute("opacity",0.7);
  svg.appendChild(pb);
}

// ─── Mount and run the animation loop for a drill ───────────────────────────
function runDrill(config){
  const{states,segments,players,goalThreshold,phaseDots,startBall}=config;
  const segMeta=buildSegMeta(segments);
  const totalDuration=segMeta[segMeta.length-1].end;

  const svg=document.getElementById("mainSVG");
  buildStaticSVG(svg,config);

  let playing=false,elapsed=0,speed=1,lastTs=null,spinAngle=0;
  let prevBall=toCanvas(startBall||{x:0,y:0});

  function render(state,progress){
    const isGoal=progress>goalThreshold;
    const ns="http://www.w3.org/2000/svg";
    const dl=document.getElementById("dynamicLayer");
    while(dl.firstChild)dl.removeChild(dl.firstChild);

    const clip=document.createElementNS(ns,"g");
    clip.setAttribute("clip-path","url(#pitchClip)");

    if(state.arrows)state.arrows.forEach(a=>drawArrow(clip,a,state.players,state.arrowOpacity??1));
    if(state.players)state.players.forEach((p,i)=>{
      const cp=toCanvas(p),g=document.createElementNS(ns,"g");
      g.setAttribute("filter","url(#playerGlow)");
      drawPlayer(g,cp.x,cp.y,players[i].color,players[i].label);
      clip.appendChild(g);
    });
    if(state.ball){
      const bc=toCanvas(state.ball);
      spinAngle+=Math.sqrt((bc.x-prevBall.x)**2+(bc.y-prevBall.y)**2)*4;
      prevBall={x:bc.x,y:bc.y};
      drawBall(clip,bc.x,bc.y,spinAngle);
    }
    dl.appendChild(clip);

    document.getElementById("goalOverlay").setAttribute("opacity",0);

    // step dots
    const t=elapsed%totalDuration;
    let phaseIdx=0;
    for(let i=0;i<segMeta.length;i++){if(t<segMeta[i].end){phaseIdx=i;break;}}
    const sp=phaseDots<=4?32:28,wA2=phaseDots<=4?28:24,wI2=phaseDots<=4?20:16;
    for(let i=0;i<phaseDots;i++){
      const d=document.getElementById(`dot_${i}`);
      if(d){d.setAttribute("width",i===phaseIdx?wA2:wI2);d.setAttribute("fill",i===phaseIdx?"#B4FF50":"rgba(180,255,80,0.18)");}
    }

    document.getElementById("holdGroup").setAttribute("opacity",(state.isPause&&!isGoal)?1:0);
    document.getElementById("phaseLabel").textContent=isGoal?"⚽ GOAL! RESET & REPEAT":(state.label||"").toUpperCase();
    document.getElementById("progressBar").setAttribute("width",W*progress);
  }

  function tick(ts){
    if(lastTs!==null)elapsed+=(ts-lastTs)*speed;
    lastTs=ts;
    render(getAnimState(elapsed,states,segMeta,totalDuration),(elapsed%totalDuration)/totalDuration);
    if(playing)requestAnimationFrame(tick);
  }

  // controls
  const btnPlay=document.getElementById("btnPlay");
  btnPlay.addEventListener("click",()=>{
    playing=!playing;
    btnPlay.textContent=playing?"⏸ PAUSE":"▶ PLAY";
    btnPlay.classList.toggle("paused",playing);
    if(playing){lastTs=null;requestAnimationFrame(tick);}
  });
  document.getElementById("btnReset").addEventListener("click",()=>{
    playing=false;elapsed=0;lastTs=null;spinAngle=0;
    prevBall=toCanvas(startBall||{x:0,y:0});
    btnPlay.textContent="▶ PLAY";btnPlay.classList.remove("paused");
    render(getAnimState(0,states,segMeta,totalDuration),0);
  });
  document.querySelectorAll(".btn-speed").forEach(btn=>{
    btn.addEventListener("click",()=>{
      speed=parseFloat(btn.dataset.speed);
      document.querySelectorAll(".btn-speed").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // initial render
  render(getAnimState(0,states,segMeta,totalDuration),0);
}
