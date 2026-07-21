/* ══════════════════════════════════════════════════════════════
   drone-anim.js — 조립되면서 완성되고, 끝나면 날아오르는 드론 그림
   쓰는 법:
     var D = DroneAnim.mount(document.getElementById("box"), {layout:"pixhawk"});
     D.part("frame", true);   // 부품을 하나 붙인다 (뿅 하고 나타남)
     D.part("m1", true);      // 모터 1번
     D.spin(2);               // 0=정지 1=공회전 2=전속
     D.takeoff();             // 이륙 연출
   layout: "pixhawk"(ArduPilot 쿼드X) | "multiwii"(아두이노)
   ══════════════════════════════════════════════════════════════ */
(function(){
"use strict";

var CSS = `
.dz{position:relative;width:100%;max-width:340px;margin:0 auto;aspect-ratio:11/10;overflow:hidden}
.dz svg{width:100%;height:100%;display:block;overflow:visible}
.dz .craft{transition:transform 2.6s cubic-bezier(.42,0,.9,.55)}
.dz .shadow{transition:transform 2.6s ease-in, opacity 2.6s ease-in;transform-box:fill-box;transform-origin:center}

/* 아직 안 붙인 부품 */
.dz .dp{opacity:.11;transition:opacity .35s;transform-box:fill-box;transform-origin:center}
.dz .dp.on{opacity:1;animation:dzpop .45s cubic-bezier(.34,1.56,.64,1)}
@keyframes dzpop{0%{transform:scale(.55);opacity:0}70%{transform:scale(1.14)}100%{transform:scale(1);opacity:1}}

/* 프로펠러 회전 */
.dz .prop{transform-box:fill-box;transform-origin:center;animation:dzspin 1s linear infinite;animation-play-state:paused}
.dz .prop.ccw{animation-direction:reverse}
.dz.sp1 .prop.on{animation-play-state:running;animation-duration:.7s}
.dz.sp2 .prop.on{animation-play-state:running;animation-duration:.14s}
@keyframes dzspin{to{transform:rotate(360deg)}}
.dz .disc{opacity:0;transition:opacity .5s}
.dz.sp2 .dp.on .disc{opacity:.22}

/* 호버링 흔들림 */
.dz.hover .craft{animation:dzbob 2.4s ease-in-out infinite}
@keyframes dzbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

/* 이륙 */
.dz.takeoff .craft{transform:translateY(-460px) scale(1.22) rotate(-7deg);animation:none}
.dz.takeoff .shadow{transform:scale(.15);opacity:0}
.dz .puff{opacity:0}
.dz.takeoff .puff{animation:dzpuff 1.5s ease-out forwards}
@keyframes dzpuff{0%{opacity:.5;transform:scale(.4)}100%{opacity:0;transform:scale(2.6)}}

.dz .cap{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:12px;font-weight:800;
  color:#9db0d6;transition:.3s}
.dz.done .cap{color:#34d399}

/* 어지러움을 느끼는 학생 배려 — 회전·흔들림을 끄고 상태만 색으로 보여 준다 */
@media (prefers-reduced-motion: reduce){
  .dz .prop,.dz .craft,.dz .dp.on,.dz .puff{animation:none !important}
  .dz .craft,.dz .shadow{transition:none}
  .dz.sp2 .dp.on .disc{opacity:.22}
  .dz.takeoff .craft{transform:translateY(-460px)}
}
`;

/* 모터 자리 (FC마다 번호 규칙이 다르다) */
var LAYOUT = {
  pixhawk:  { 1:["FR","ccw"], 2:["RL","ccw"], 3:["FL","cw"], 4:["RR","cw"] },
  multiwii: { 1:["FL","cw"],  2:["FR","ccw"], 3:["RR","cw"], 4:["RL","ccw"] }
};
var POS = { FL:[46,48], FR:[174,48], RL:[46,152], RR:[174,152] };
var CW_COLOR="#fbbf24", CCW_COLOR="#22d3ee";

function svgFor(layout){
  var map = LAYOUT[layout] || LAYOUT.pixhawk;
  var arms="", motors="", props="", wires="";
  [1,2,3,4].forEach(function(n){
    var pos=map[n][0], dir=map[n][1], p=POS[pos], x=p[0], y=p[1];
    var col = dir==="cw" ? CW_COLOR : CCW_COLOR;
    arms += '<line class="dp dp-frame" x1="110" y1="100" x2="'+x+'" y2="'+y+'" stroke="#2b436f" stroke-width="10" stroke-linecap="round"/>';
    motors += '<g class="dp dp-m'+n+'">'
      + '<circle cx="'+x+'" cy="'+y+'" r="12" fill="#16213c" stroke="#3d5588" stroke-width="2"/>'
      + '<circle cx="'+x+'" cy="'+y+'" r="5" fill="#5b7bb5"/>'
      + '<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="10" font-weight="900" fill="#eaf1ff">'+n+'</text>'
      + '</g>';
    props += '<g class="dp dp-p'+n+'">'
      + '<circle class="disc" cx="'+x+'" cy="'+y+'" r="30" fill="'+col+'"/>'
      + '<g class="prop '+dir+'" >'
      +   '<ellipse cx="'+x+'" cy="'+y+'" rx="30" ry="4.6" fill="'+col+'" opacity=".92"/>'
      +   '<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="#0b1220"/>'
      + '</g></g>';
    wires += '<line class="dp dp-wire" x1="110" y1="100" x2="'+x+'" y2="'+y+'" stroke="'+col+'" stroke-width="2.4" stroke-dasharray="4 4" opacity=".85"/>';
  });

  return ''
  + '<svg viewBox="0 0 220 200" role="img" aria-label="조립 중인 드론">'
  +   '<ellipse class="shadow" cx="110" cy="186" rx="46" ry="8" fill="#000" opacity=".45"/>'
  +   '<circle class="puff" cx="110" cy="182" r="30" fill="#7aa7e8" opacity="0"/>'
  +   '<g class="craft">'
  +     arms
  +     '<g class="dp dp-skid">'
  +       '<line x1="76" y1="128" x2="76" y2="150" stroke="#2b436f" stroke-width="6" stroke-linecap="round"/>'
  +       '<line x1="144" y1="128" x2="144" y2="150" stroke="#2b436f" stroke-width="6" stroke-linecap="round"/>'
  +       '<line x1="64" y1="150" x2="88" y2="150" stroke="#1d3157" stroke-width="6" stroke-linecap="round"/>'
  +       '<line x1="132" y1="150" x2="156" y2="150" stroke="#1d3157" stroke-width="6" stroke-linecap="round"/>'
  +     '</g>'
  +     '<rect class="dp dp-frame" x="86" y="76" width="48" height="48" rx="10" fill="#1e3a68" stroke="#38bdf8" stroke-width="1.6"/>'
  +     '<polygon class="dp dp-frame" points="110,64 117,75 103,75" fill="#fbbf24"/>'
  +     wires
  +     '<rect class="dp dp-fc" x="94" y="80" width="32" height="20" rx="4" fill="#0ea5e9"/>'
  +     '<text class="dp dp-fc" x="110" y="94" text-anchor="middle" font-size="9" font-weight="900" fill="#04283d">FC</text>'
  +     '<rect class="dp dp-batt" x="94" y="104" width="32" height="15" rx="3" fill="#a855f7"/>'
  +     '<text class="dp dp-batt" x="110" y="115" text-anchor="middle" font-size="8" font-weight="900" fill="#2a0a45">BATT</text>'
  +     '<g class="dp dp-gps"><line x1="130" y1="74" x2="136" y2="62" stroke="#5b7bb5" stroke-width="2"/>'
  +       '<circle cx="137" cy="59" r="6" fill="#34d399"/></g>'
  +     '<g class="dp dp-tele"><rect x="78" y="102" width="9" height="14" rx="2" fill="#fb7185"/>'
  +       '<line x1="82" y1="102" x2="82" y2="92" stroke="#fb7185" stroke-width="2"/></g>'
  +     '<g class="dp dp-rx"><rect x="133" y="102" width="9" height="14" rx="2" fill="#c4b5fd"/>'
  +       '<line x1="137" y1="102" x2="137" y2="92" stroke="#c4b5fd" stroke-width="2"/></g>'
  +     motors
  +     props
  +   '</g>'
  + '</svg>';
}

var injected=false;
function inject(){
  if(injected) return; injected=true;
  var s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
}

function mount(box, opts){
  inject();
  opts=opts||{};
  var layout=opts.layout||"pixhawk";
  box.classList.add("dz");
  box.innerHTML = svgFor(layout) + '<div class="cap">'+(opts.caption||"부품을 하나씩 붙여 보자")+'</div>';

  var api={
    el:box,
    part:function(name,on){
      var nodes=box.querySelectorAll(".dp-"+name);
      Array.prototype.forEach.call(nodes,function(n){
        if(on===false) n.classList.remove("on"); else n.classList.add("on");
      });
      // 프로펠러 회전자에도 on 을 옮겨 준다
      Array.prototype.forEach.call(box.querySelectorAll(".dp.on .prop"),function(p){ p.classList.add("on") });
      return api;
    },
    caption:function(t){ var c=box.querySelector(".cap"); if(c) c.textContent=t; return api },
    spin:function(level){
      box.classList.remove("sp1","sp2","hover");
      if(level===1) box.classList.add("sp1");
      if(level>=2) box.classList.add("sp2","hover");
      return api;
    },
    done:function(){ box.classList.add("done"); return api },
    takeoff:function(cb){
      box.classList.add("sp2","done");
      box.classList.remove("hover");
      setTimeout(function(){
        box.classList.add("takeoff");
        if(cb) setTimeout(cb,2600);
      },400);
      return api;
    },
    land:function(){ box.classList.remove("takeoff"); return api },
    reset:function(){
      box.classList.remove("sp1","sp2","hover","takeoff","done");
      Array.prototype.forEach.call(box.querySelectorAll(".dp.on"),function(n){ n.classList.remove("on") });
      return api;
    }
  };
  return api;
}

window.DroneAnim={ mount:mount };
})();
