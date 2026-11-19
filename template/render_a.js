const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const SEGS=[[0,9.2],[9.7,13.9],[14.6,18.5],[18.9,24.9],[25.4,32.9],[33.4,39.4],[39.8,42.4],[42.5,48.5],[49.6,58.1],[58.4,71.0],[72.1,79.5]];
const mode=process.argv[2]||'prev';const FPS=30,DUR=81;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1.5});
 await p.goto('file://'+path.resolve('board_a.html'));await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(s=>setup(s),SEGS);
 if(mode==='prev'){
  for(const [n,t,safe] of [['p1',42.3,0],['p1s',42.3,1],['flip',42.9,0],['p2',80.5,0],['p2s',80.5,1]]){
   await p.evaluate(([t,s])=>{showSafe(s);renderAt(t)},[t,safe]);await p.screenshot({path:`A_${n}.png`});}
 } else {
  fs.mkdirSync('fullA',{recursive:true});const N=Math.round(DUR*FPS);
  for(let i=0;i<N;i++){await p.evaluate(t=>renderAt(t),i/FPS);await p.screenshot({path:`fullA/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
 }
 await b.close();})();
