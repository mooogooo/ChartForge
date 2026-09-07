const assert = require('node:assert/strict');
const { test } = require('node:test');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const source = buildSync({entryPoints:['lib/pathUtils.ts'],bundle:true,write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
let commits;
function load() {
  const box = {module:{exports:{}},exports:{},mg:{commitUndo(){commits++}}, Math, console};
  vm.runInNewContext(source,box); return box.module.exports;
}
const api = load();
const copy = x => JSON.parse(JSON.stringify(x));
const page = {type:'PAGE',id:'page'};
function frame(parent=page, x=50,y=80,height=300) {
  return {id:'frame',type:'FRAME',parent,height,flexMode:'NONE',absoluteTransform:[[1,0,x],[0,1,y]]};
}
function pen(parent=page, horizontal=false, normalize=false) {
  let network = {nodes:Array.from({length:12},(_,i)=>({x:i*30,y:horizontal?0:i%2*100})),paths:Array.from({length:11},(_,i)=>[i,-1,-1,i+1]),ctrlNodes:[],regions:[]};
  let x=20,y=30, data={};
  const n={id:'pen',type:'PEN',parent,get x(){return x},set x(v){x=v},get y(){return y},set y(v){y=v},
    get absoluteTransform(){const t=parent.absoluteTransform || [[1,0,0],[0,1,0]];return [[1,0,x+t[0][2]],[0,1,y+t[1][2]]]},
    set relativeTransform(m){x=m[0][2];y=m[1][2]},
    getPluginData(k){return data[k]||''},setPluginData(k,v){data[k]=v},
    get penNetwork(){return copy(network)},set penNetwork(v){network=copy(v); if(normalize){const minX=Math.min(...network.nodes.map(p=>p.x));const minY=Math.min(...network.nodes.map(p=>p.y)); network.nodes.forEach(p=>{p.x-=minX;p.y-=minY}); /* simulate a host normalizing without compensating its origin */ }}
  }; return n;
}
function points(n){const t=n.absoluteTransform;return n.penNetwork.nodes.map(p=>({x:p.x+t[0][2],y:p.y+t[1][2]}))}
function check(n,min,max,originalX){const ps=points(n).sort((a,b)=>a.x-b.x);ps.forEach((p,i)=>{assert.ok(p.y>=min-0.001&&p.y<=max+0.001);assert.ok(Math.abs(p.x-originalX[i])<.001);if(i)assert.ok(Math.abs(p.y-ps[i-1].y)<=(max-min)*.4+.001)})}
test('12 nodes, 100 fresh runs, frame offsets, host normalization and undo boundaries',()=>{
  commits=0;const f=frame();const n=pen(f,false,true);const xs=points(n).map(p=>p.x);const paths=JSON.stringify(n.penNetwork.paths);const outputs=new Set();
  for(let i=0;i<100;i++){assert.equal(api.randomizePathPoints([n]).success,true);check(n,110,350,xs);outputs.add(JSON.stringify(points(n)));assert.equal(JSON.stringify(n.penNetwork.paths),paths)}
  assert.equal(outputs.size,100);assert.equal(commits,100);
});
test('page fallback is stable across 100 clicks and plugin reload',()=>{
  const n=pen(page,true,true);const xs=points(n).map(p=>p.x);
  for(let i=0;i<100;i++){assert.equal(load().randomizePathPoints([n]).success,true);check(n,-70,130,xs)}
});
test('manual geometry edits and reparenting refresh fallback',()=>{
 const n=pen();assert.equal(api.randomizePathPoints([n]).success,true);n.y+=500;
 const initial=points(n);const min=Math.min(...initial.map(p=>p.y)),max=Math.max(...initial.map(p=>p.y));
 assert.equal(api.randomizePathPoints([n]).success,true);check(n,min,max,initial.map(p=>p.x));
 n.parent={type:'PAGE',id:'other'};const before=points(n);assert.equal(api.randomizePathPoints([n]).success,true);check(n,Math.min(...before.map(p=>p.y)),Math.max(...before.map(p=>p.y)),before.map(p=>p.x));
});
test('skip groups and auto-height frames; read new fixed frame height',()=>{
 const outer=frame();const auto={...frame(outer,80,90),id:'auto',flexMode:'VERTICAL',mainAxisSizingMode:'AUTO'};
 const group={type:'GROUP',id:'group',parent:auto,absoluteTransform:[[1,0,100],[0,1,100]]};const n=pen(group);const xs=points(n).map(p=>p.x);
 assert.equal(api.randomizePathPoints([n]).success,true);check(n,110,350,xs);
 outer.height=500;assert.equal(api.randomizePathPoints([n]).success,true);check(n,130,530,xs);
});
test('preflight rejects curves, rotation, invalid height and mixed selections without mutations',()=>{
 const good=pen();const before=JSON.stringify(points(good));const curve=pen();let net=curve.penNetwork;net.ctrlNodes=[{x:1,y:2}];curve.penNetwork=net;
 const rotated=pen();Object.defineProperty(rotated,'absoluteTransform',{value:[[0,-1,0],[1,0,0]]});
 const invalid=pen(frame(page,0,0,0));
 for(const bad of [curve,rotated,invalid,{type:'RECTANGLE'}]){assert.equal(api.randomizePathPoints([good,bad]).success,false);assert.equal(JSON.stringify(points(good)),before)}
 assert.equal(api.randomizePathPoints([]).success,false);
});
test('multiple valid selections commit once; setter failure rolls back previous path and metadata',()=>{
 commits=0;const a=pen(),b=pen();assert.equal(api.randomizePathPoints([a,b]).success,true);assert.equal(commits,1);
 const before=JSON.stringify(points(a));const data=a.getPluginData('chartforge.lineRange.v1');
 const broken=pen();const original=broken.penNetwork;Object.defineProperty(broken,'penNetwork',{get(){return original},set(){throw Error('locked')}});
 assert.equal(api.randomizePathPoints([a,broken]).success,false);assert.equal(JSON.stringify(points(a)),before);assert.equal(a.getPluginData('chartforge.lineRange.v1'),data);assert.equal(commits,1);
});
test('generation respects X order without changing network order, including deterministic extremes',()=>{
 const ps=[{x:3,y:10},{x:1,y:20},{x:2,y:30}];for(const r of [0,1,.5]){const out=api.generateChartPoints(ps,{min:0,max:100},()=>r);assert.equal(JSON.stringify(out.map(p=>p.x)),'[3,1,2]');const sorted=[...out].sort((a,b)=>a.x-b.x);assert.ok(Math.abs(sorted[0].y-sorted[1].y)<=40);assert.ok(Math.abs(sorted[1].y-sorted[2].y)<=40)}
});
