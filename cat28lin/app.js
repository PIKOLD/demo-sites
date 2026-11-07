(function(){
'use strict';
var D=document, R=D.documentElement, $=function(s,c){return (c||D).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
var NB=' ';
var hero=$('.hero'), stage=$('#stage'), bar=$('.bar'), mast=$('#mast'), foot=$('.foot'), belt=$('.belt');
var strapL=$('.strap--l'), strapR=$('.strap--r');
var words=$$('.w',mast);
var lastW=0, vh=innerHeight, phone=innerWidth<=760, fitLs=[0,0,0];
var p=rm?1:0, pS=p, snapped=false, lastY=scrollY, vel=0;

function setVh(){vh=innerHeight;R.style.setProperty('--vh',(vh/100)+'px')}

/* ---------- headline: every word on full width ---------- */
function fit(){
  phone=innerWidth<=760;
  mast.style.setProperty('--sx',1);
  mast.style.setProperty('--fs','100px');
  words.forEach(function(w){w.style.letterSpacing='0px';w.style.marginRight='0px'});
  var W=mast.clientWidth-2, nat=words.map(function(w){return w.getBoundingClientRect().width||1});
  var fs=Math.min.apply(null,nat.map(function(n){return W/n*100}));
  if(!phone){var avail=stage.clientHeight-bar.offsetHeight-foot.offsetHeight-34;fs=Math.min(fs,avail/(3*.86))}
  fs=Math.max(40,Math.floor(fs));
  mast.style.setProperty('--fs',fs+'px');
  fitLs=words.map(function(w,i){var n=w.textContent.length,wn=nat[i]*fs/100;return Math.max(0,(W-wn)/(n-1))});
  var l1=mast.querySelector('.mast__line');
  var bh=phone?40:Math.round(Math.max(48,Math.min(72,fs*.24)));
  belt.style.setProperty('--bh',bh+'px');
  belt.style.top=(mast.offsetTop+l1.offsetHeight-bh*.62)+'px';
  apply(true);
}
function apply(force){
  var sx=phone?1:1-.18*pS;
  mast.style.setProperty('--sx',sx.toFixed(4));
  var k=phone?1:1-.78*pS;
  words.forEach(function(w,i){var ls=fitLs[i]*k;w.style.letterSpacing=ls.toFixed(2)+'px';w.style.marginRight=(-ls).toFixed(2)+'px'});
  var Dd=(phone?.26:.2)*innerWidth;
  belt.style.setProperty('--off',((1-pS)*Dd).toFixed(1)+'px');
  if(pS>.985&&!snapped){snapped=true;stage.classList.add('snapped')}
  else if(pS<.9&&snapped){snapped=false;stage.classList.remove('snapped')}
}
function progress(){
  if(rm)return 1;
  if(phone)return Math.min(1,Math.max(0,scrollY/(vh*.5)));
  var r=hero.getBoundingClientRect(),travel=hero.offsetHeight-stage.offsetHeight;
  return Math.min(1,Math.max(0,-r.top/Math.max(1,travel)));
}

/* ---------- CSS fringe (phone / no WebGL) ---------- */
var strands=[];
function buildFringe(){
  $$('.fr').forEach(function(fr){fr.innerHTML=''});strands=[];
  var per=phone?8:12, H=phone?vh:stage.clientHeight;
  [[strapL,.14,.9,'#141110'],[strapR,.12,.86,'#7B3F1E']].forEach(function(s,si){
    var fr=$('.fr',s[0]);
    for(var i=0;i<per;i++){
      var e=D.createElement('span');e.className='st';
      var f=s[1]+(s[2]-s[1])*(i/(per-1));
      var len=(phone?.24:.36+.12*Math.random())*H+(phone?Math.random()*.1*H:0);
      e.style.left=(f*100).toFixed(2)+'%';
      e.style.setProperty('--len',len.toFixed(0)+'px');
      e.style.setProperty('--sw',(phone?8:10)+(i%3)+'px');
      if((i+si)%3===0)e.style.setProperty('--sc',s[3]);
      fr.appendChild(e);
      strands.push({e:e,a:(i%2?1:-1)*(rm?0:2+Math.random()*3),v:0,k:.018+ .012*Math.random(),ph:Math.random()*6.28});
      e.style.setProperty('--a',strands[strands.length-1].a.toFixed(2));
    }
  });
}
var tilt=0;
function kick(x,str){
  strands.forEach(function(s){var r=s.e.getBoundingClientRect();var d=Math.abs(r.left-x);var f=Math.max(0,1-d/260);s.v+=(str*(.5+Math.random()*.5))*(x!=null?f:1)*(Math.random()<.5?-1:1)});
}
function stepFringe(t){
  for(var i=0;i<strands.length;i++){var s=strands[i];
    var target=tilt+Math.sin(t*.0011+s.ph)*1.2+vel*.12;
    s.v+=(target-s.a)*s.k; s.v*=.94; s.a+=s.v;
    if(s.a>35)s.a=35;if(s.a<-35)s.a=-35;
    s.e.style.setProperty('--a',s.a.toFixed(2));
  }
}
var lastPX=null;
stage.addEventListener('pointermove',function(e){
  if(R.classList.contains('gl')||rm)return;
  if(lastPX!=null){var dx=e.clientX-lastPX;strands.forEach(function(s){var r=s.e.getBoundingClientRect();if(Math.abs(r.left-e.clientX)<70&&e.clientY>r.top-10&&e.clientY<r.top+parseFloat(s.e.style.getPropertyValue('--len')))s.v+=dx*.09})}
  lastPX=e.clientX;
},{passive:true});
stage.addEventListener('pointerdown',function(e){
  if(rm)return;
  if(e.pointerType!=='mouse')kick(e.clientX,9);
  if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'&&!kick.asked){kick.asked=1;DeviceOrientationEvent.requestPermission().then(function(r){if(r==='granted')addEventListener('deviceorientation',onTilt)}).catch(function(){})}
},{passive:true});
function onTilt(e){if(e.gamma!=null)tilt=Math.max(-22,Math.min(22,e.gamma*.6))}
if(!rm)addEventListener('deviceorientation',onTilt);

/* ---------- handwritten notes ---------- */
var NS='http://www.w3.org/2000/svg', notes=$$('[data-write]');
function prepNotes(){
  notes.forEach(function(n){
    if(!n.dataset.split){
      var html=n.innerHTML.split(/<br\s*\/?>/i);
      n.innerHTML=html.map(function(line){return line.trim().split(/\s+/).map(function(w){return '<span class="wd"><i style="display:inline-block;width:0;height:0;vertical-align:baseline"></i>'+w+'</span>'}).join(' ')}).join('<br>');
      n.dataset.split=1;
    }
    var old=n.querySelector('svg');if(old)old.remove();
    var cs=getComputedStyle(n);n.style.setProperty('--nc',cs.color);
    n.classList.add('wr');
    var svg=D.createElementNS(NS,'svg');svg.setAttribute('aria-hidden','true');
    svg.setAttribute('width',n.offsetWidth);svg.setAttribute('height',n.offsetHeight);
    $$('.wd',n).forEach(function(w){var t=D.createElementNS(NS,'text');t.setAttribute('x',w.offsetLeft);t.setAttribute('y',w.firstChild.offsetTop);t.textContent=w.textContent;svg.appendChild(t)});
    n.appendChild(svg);
  });
}
function done(n){n.classList.add('go');setTimeout(function(){n.classList.add('done')},1600)}
function initNotes(){
  if(rm)return;
  prepNotes();
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(Math.abs(vel)>40)e.target.classList.add('go','done');else done(e.target);io.unobserve(e.target)}})},{threshold:.35,rootMargin:'0px 0px -5% 0px'});
  notes.forEach(function(n,i){
    var r=n.getBoundingClientRect();
    if(r.top<innerHeight&&r.bottom>0){n.classList.add('pend');setTimeout(function(){done(n)},700+i*350)}
    else{n.classList.add('pend');io.observe(n)}
  });
}

/* ---------- configurator ---------- */
var form=$('#fit'), msg=$('#msg'), priceEl=$('#tagPrice'), tagStrap=$('#tagStrap'), waist=$('#waist'), hint=$('#hint');
var ITEMS={portupeya:'портупею',remen:'ремень',duo:'ремень Дуо',baska:'баску',setka:'юбку-сетку'};
var COLORS={black:['чёрная','#141110'],cognac:['коньячная','#7B3F1E'],red:['красная','#9C1C14']};
function val(n){var c=form.querySelector('input[name='+n+']:checked');return c?c.value:''}
function upd(){
  var it=val('item'), co=val('color'), w=parseInt(waist.value,10); if(!(w>=40&&w<=160))w=0;
  var price, inDuo=it==='duo'&&w>=70&&w<=80;
  if(it==='duo'){
    if(inDuo)price='Ремень Дуо на объём талии 70–80'+NB+'см — 195'+NB+'Byn (5'+NB+'300'+NB+'₽)';
    else if(w)price='Ремень Дуо в посте — на объём талии 70–80'+NB+'см. Для '+w+NB+'см цену назовёт Катя';
    else price='Ремень Дуо на объём талии 70–80'+NB+'см — 195'+NB+'Byn (5'+NB+'300'+NB+'₽). Введите талию';
  }else if(it==='setka')price='Юбка-сетка — 395'+NB+'Byn';
  else if(it==='baska')price='Аксессуар-баска из кожи — 345'+NB+'Byn';
  else price='Цену назовёт Катя';
  priceEl.textContent=price;
  var t='Катя, привет! Хочу '+ITEMS[it]+', кожа '+COLORS[co][0]+(w?', талия '+w+' см':'')+'.';
  t+=inDuo?' Как в посте: Дуо на 70–80 см, 195 Byn. Есть в наличии?':' Подскажете цену и что сейчас есть в наличии?';
  msg.value=t;
  tagStrap.style.setProperty('--lc',COLORS[co][1]);
}
form.addEventListener('change',upd);waist.addEventListener('input',upd);
function copy(){
  var t=msg.value;
  function ok(){hint.textContent='Скопировано. Вставьте текст в чат с Катей.'}
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(ok,fb);else fb();
  function fb(){msg.select();try{D.execCommand('copy');ok()}catch(e){hint.textContent='Выделите текст и скопируйте вручную.'}}
}
$('#copy').addEventListener('click',copy);
$('#openDm').addEventListener('click',copy);
$$('[data-pick]').forEach(function(b){b.addEventListener('click',function(){
  var r=form.querySelector('input[name=item][value='+b.dataset.pick+']');if(r){r.checked=true;upd()}
  $('#kupit').scrollIntoView({behavior:rm?'auto':'smooth'});
})});
upd();

/* ---------- small motion ---------- */
var fine=matchMedia('(pointer:fine)').matches;
if(fine&&!rm)$$('.magnet').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)'});
  b.addEventListener('pointerleave',function(){b.style.transform=''});
});
var par=$$('[data-par]'), dock=$('#dock');

/* ---------- loop ---------- */
var heroVisible=true;
new IntersectionObserver(function(es){heroVisible=es[0].isIntersecting},{rootMargin:'100px'}).observe(hero);
function loop(t){
  var y=scrollY;vel+=((y-lastY)-vel)*.25;lastY=y;
  if(window.__cat)window.__cat.vel=vel;
  if(heroVisible||pS<1){
    p=progress();
    var np=pS+(p-pS)*.16; if(Math.abs(p-np)<.001)np=p;
    if(np!==pS){pS=np;apply()}
    if(!R.classList.contains('gl')&&heroVisible)stepFringe(t);
  }
  if(!phone&&par.length)par.forEach(function(e){var r=e.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50)return;var c=(r.top+r.height/2-innerHeight/2);e.style.translate='0 '+(c*parseFloat(e.dataset.par)).toFixed(1)+'px'});
  dock.classList.toggle('on',y>hero.offsetTop+hero.offsetHeight-80&&y<D.documentElement.scrollHeight-innerHeight*1.6);
  requestAnimationFrame(loop);
}

/* ---------- WebGL fringe (desktop only) ---------- */
function hasGL(){try{var c=D.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){return false}}
function loadGL(){
  if(rm||phone||!fine||!hasGL())return;
  window.__cat={stage:stage,strapL:strapL,strapR:strapR,vel:0,canvas:$('.fringe-gl')};
  var s=D.createElement('script');s.type='module';s.src='gl.js';D.body.appendChild(s);
}

/* ---------- init ---------- */
setVh();lastW=innerWidth;
fit();buildFringe();
if(rm){pS=1;apply(true);stage.classList.add('snapped')}
(D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve()).then(function(){fit();initNotes()});
var rt;
addEventListener('resize',function(){
  if(innerWidth===lastW)return; lastW=innerWidth;
  clearTimeout(rt);rt=setTimeout(function(){setVh();fit();buildFringe();if(!rm)prepNotes()},150);
});
requestAnimationFrame(loop);
loadGL();
})();
