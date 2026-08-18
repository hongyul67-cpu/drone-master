/* ══════════════════════════════════════════════════════════════
   lesson.js — 드론 제작 이론 차시 공용 엔진
   각 차시 파일은 데이터만 넘기면 화면·게임·채점·제출이 만들어진다.

   Lesson.start({
     tag:"드론 제작 · 1차시", name:"드론 개요", sub:"...", logo:"🛩️",
     tool:"드론 1차시 드론 개요",          // 결과 수집 시트 탭 이름
     steps:[
       {key:"learn", ico:"📖", label:"배우기", type:"cards", intro:"…", data:[ {i,n,d:[]} ]},
       {key:"g1",    ico:"🎯", label:"분류",   type:"sort",  data:{bins:[], items:[{t,bin}]}},
       {key:"g2",    ico:"🔗", label:"매칭",   type:"match", data:[{k,a}]},
       {key:"g3",    ico:"✅", label:"고르기", type:"pick",  data:[{t,ok}]},
       {key:"g4",    ico:"🔢", label:"순서",   type:"seq",   data:["…"]},
       {key:"quiz",  ico:"✍️", label:"학습지", type:"quiz",  data:[{q,a:[],c:0,x:"해설"}]}
     ]
   })
   ══════════════════════════════════════════════════════════════ */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function el(tag,cls,html){var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function say(sel,cls,txt){var e=$(sel); if(!e)return; e.className="msg "+(cls||""); e.textContent=txt}

var CFG, START=Date.now(), MISS={}, ORDER=[], QUIZ_RESULT=null, FPD=null, CLEARED={};

function start(cfg){
  CFG=cfg; ORDER=cfg.steps.map(function(s){return s.key});
  cfg.steps.forEach(function(s){ MISS[s.key]=0 });
  document.title=cfg.name+" · 드론 제작";
  // 수업 모드(?mode=class): 교사가 앞에 띄우는 큰 화면. 같은 데이터를 슬라이드로 보여 준다.
  if(window.ClassMode && ClassMode.isClass()){ ClassMode.fromLesson(cfg); return }
  var wrap=el("div","wrap");
  document.body.appendChild(wrap);

  var head=el("header","top",
    '<div class="logo">'+(cfg.logo||"🚁")+'</div><div>'+
    '<div class="t1">'+cfg.tag+'</div><div class="t2">'+cfg.name+'</div>'+
    '<div class="t3">'+(cfg.sub||"")+'</div></div>');
  // 교사용 — 같은 내용을 교실 앞 화면(큰 글씨 슬라이드)으로 띄운다
  var toClass=el("button","btn classbtn","🎓 수업용");
  toClass.title="교실 앞 화면에 띄우는 큰 글씨 슬라이드로 전환";
  toClass.addEventListener("click",function(){ ClassMode.open() });
  head.appendChild(toClass);
  wrap.appendChild(head);

  // 진행을 그림으로 — 드론이 활주로를 따라가며 고도를 올린다
  var fp=el("div","flightpath",
    '<div class="fp-sun"></div><div class="fp-cloud c1"></div><div class="fp-cloud c2"></div>'+
    '<div class="fp-ground"></div><div class="fp-path"></div>'+
    '<div class="fp-marks"></div><div class="fp-drone" id="fpDrone"></div>'+
    '<div class="fp-pct"><b>0</b>%</div>');
  wrap.appendChild(fp);
  var marks=$(".fp-marks",fp);
  cfg.steps.forEach(function(s,i){
    var m=el("i","fp-mark"); m.dataset.k=s.key;
    m.style.left=(6+i*(88/Math.max(1,cfg.steps.length-1)))+"%";
    m.title=s.label; marks.appendChild(m);
  });
  if(window.DroneAnim){
    FPD=DroneAnim.mount($("#fpDrone",fp),{layout:"pixhawk",caption:""});
    ["frame","skid","batt","m1","m2","m3","m4","fc","wire","gps","tele","rx","p1","p2","p3","p4"]
      .forEach(function(p){ FPD.part(p,true) });
  }else{
    $("#fpDrone",fp).innerHTML='<div class="fp-emoji">🚁</div>';
  }

  // 점수 · 콤보 HUD
  var hudRow=el("div","hudrow");
  wrap.appendChild(hudRow);
  if(window.FX) FX.hud(hudRow);

  var nav=el("div","steps");
  nav.style.gridTemplateColumns="repeat("+cfg.steps.length+",1fr)";
  cfg.steps.forEach(function(s,i){
    var b=el("div","step"+(i===0?" on":" locked"),
      '<span class="ico">'+s.ico+'</span><span class="lb">'+s.label+'</span>');
    b.dataset.go=s.key;
    b.addEventListener("click",function(){ if(!b.classList.contains("locked")) go(s.key) });
    nav.appendChild(b);
  });
  wrap.appendChild(nav);

  cfg.steps.forEach(function(s,i){
    var sec=el("section","panel"+(i===0?" show":""));
    sec.id="p-"+s.key;
    wrap.appendChild(sec);
    BUILD[s.type](sec,s,i);
  });

  wrap.appendChild(el("div","foot","드론 제작 학습도구 · "+cfg.tag));
}

/* ── 단계 이동 ── */
function go(key){
  $$(".panel").forEach(function(p){p.classList.remove("show")});
  var t=$("#p-"+key); if(t) t.classList.add("show");
  $$(".step").forEach(function(s){ s.classList.toggle("on", s.dataset.go===key) });
  window.scrollTo({top:0,behavior:"smooth"});
}
function unlock(key){ var s=$('.step[data-go="'+key+'"]'); if(s) s.classList.remove("locked") }
function mark(key){ var s=$('.step[data-go="'+key+'"]'); if(s) s.classList.add("done") }
function clearStep(step,i){
  if(CLEARED[step.key]) return;
  CLEARED[step.key]=true;
  mark(step.key);
  var next=CFG.steps[i+1];
  if(next){ unlock(next.key); var b=$("#next-"+step.key); if(b) b.disabled=false; }
  progress();
  if(step.type==="quiz"||step.type==="probe") return;   // 학습지·탐구는 자체 결과 연출이 있다
  var miss=MISS[step.key]||0;
  var stars=window.FX?FX.starsFor(miss):3;
  var line = miss===0 ? "한 번도 틀리지 않았다. 완벽하다!"
           : (miss<=2 ? "거의 완벽했다. 틀린 부분만 다시 보자."
           : "끝까지 해냈다. 틀렸던 부분을 한 번 더 확인하자.");
  setTimeout(function(){
    if(!window.FX) return;
    FX.banner({
      icon: stars===3?"🏆":(stars===2?"🎉":"👍"),
      title: step.label+" 클리어!",
      sub: line+"<br><span style='color:#22d3ee;font-weight:800'>실수 "+miss+"회 · 최고 콤보 x"+FX.best()+"</span>",
      stars: stars,
      btn: next ? (next.ico+" "+next.label+" 하러 가기") : "결과 보기",
      onClose: function(){ if(next) go(next.key) }
    });
  },380);
}

/* 진행을 드론 고도로 보여 준다 */
function progress(){
  var total=CFG.steps.length, done=Object.keys(CLEARED).length;
  var p=done/total;
  var d=$("#fpDrone"); if(!d) return;
  d.style.left=(6+p*88)+"%";
  d.style.bottom=(12+p*54)+"%";
  var pct=$(".fp-pct b"); if(pct && window.FX) FX.countUp(pct,Math.round(p*100),500);
  else if(pct) pct.textContent=Math.round(p*100);
  CFG.steps.forEach(function(s){
    var m=$('.fp-mark[data-k="'+s.key+'"]'); if(m) m.classList.toggle("on",!!CLEARED[s.key]);
  });
  if(FPD) FPD.spin(p>=1?2:(p>0?1:0));
  if(p>=1){
    var fp=$(".flightpath"); if(fp) fp.classList.add("done");
    if(FPD) setTimeout(function(){ FPD.takeoff() },600);
  }
}
function navBar(sec,step,i,nextLabel){
  var bar=el("div","nav");
  if(i>0){
    var prev=CFG.steps[i-1];
    var pb=el("button","btn bigbtn ghost","← "+prev.label);
    pb.addEventListener("click",function(){ go(prev.key) });
    bar.appendChild(pb);
  }
  var next=CFG.steps[i+1];
  if(next){
    var nb=el("button","btn bigbtn",(nextLabel||(next.ico+" "+next.label+" →")));
    nb.id="next-"+step.key; nb.disabled=true;
    nb.addEventListener("click",function(){ if(!nb.disabled) go(next.key) });
    bar.appendChild(nb);
  }
  sec.appendChild(bar);
}

/* ══════════ 화면 종류별 생성기 ══════════ */
var BUILD={};

/* 배우기 — 카드를 모두 눌러야 통과 */
BUILD.cards=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'📖 '+step.label+' <span class="pill">먼저 정답부터</span>'));
  card.appendChild(el("p","lead",step.intro||"카드를 눌러 내용을 확인하자. 모두 확인하면 다음으로 넘어갈 수 있다."));
  var box=el("div","cards"); card.appendChild(box);
  var detail=el("div","detail",'<h4>👆 카드를 눌러보자</h4><p style="margin:0;font-size:13.5px;color:var(--sub)">눌러야 다음 단계가 열린다.</p>');
  card.appendChild(detail);
  var bar=el("div","bar",'<i></i>'); card.appendChild(bar);
  sec.appendChild(card);

  step.data.forEach(function(p){
    var c=el("div","lc",'<div class="ci">'+p.i+'</div><div class="cn">'+p.n+'</div>');
    c.addEventListener("click",function(){
      var fresh=!c.classList.contains("seen");
      c.classList.add("seen");
      detail.innerHTML='<h4>'+p.i+' '+p.n+'</h4><ul><li>'+p.d.join("</li><li>")+'</li></ul>';
      detail.classList.remove("pop"); void detail.offsetWidth; detail.classList.add("pop");
      if(fresh && window.FX){ FX.punch(c); FX.burst(c,{color:"#38bdf8",n:6,dist:38}); FX.sound("up"); }
      var n=$$(".lc.seen",box).length;
      $("i",bar).style.width=(n/step.data.length*100)+"%";
      if(n>=step.data.length) clearStep(step,i);
    });
    box.appendChild(c);
  });
  navBar(sec,step,i);
};

/* 분류 — 항목을 알맞은 통에 넣기 */
BUILD.sort=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'🎯 '+step.label+' <span class="pill">항목 → 통</span>'));
  card.appendChild(el("p","lead",step.intro||"위에서 항목을 하나 고르고, 알맞은 통을 누르자."));
  var opts=el("div","opts"); card.appendChild(opts);
  var bins=el("div","bins"); card.appendChild(bins);
  var msg=el("div","msg"); msg.id="m-"+step.key; card.appendChild(msg);
  if(step.hint) card.appendChild(el("div","hint",step.hint));
  sec.appendChild(card);

  var picked=null, left=step.data.items.length;
  shuffle(step.data.items.slice()).forEach(function(it){
    var b=el("button","btn opt",it.t);
    b.addEventListener("click",function(){
      $$(".opt",opts).forEach(function(o){o.classList.remove("sel")});
      b.classList.add("sel"); picked=it; picked._btn=b;
      say("#m-"+step.key,"",it.t+" 선택 — 알맞은 통을 누르세요");
    });
    opts.appendChild(b);
  });
  step.data.bins.forEach(function(bn){
    var d=el("div","bin",'<div class="bt">'+bn+'</div>');
    d.addEventListener("click",function(){
      if(!picked){ say("#m-"+step.key,"no","먼저 위에서 항목을 고르세요"); return }
      if(picked.bin===bn){
        var chip=el("div","bi",picked.t); d.appendChild(chip);
        picked._btn.classList.add("used"); picked=null; left--;
        if(window.FX) FX.ok(chip);
        say("#m-"+step.key,"ok","맞다!"+(left?" 남은 것 "+left+"개":""));
        if(left===0){ say("#m-"+step.key,"ok","🎉 분류 완료!"); clearStep(step,i) }
      }else{
        MISS[step.key]++;
        if(window.FX) FX.no(d);
        say("#m-"+step.key,"no","여기가 아니다. 다시 생각해 보자.");
      }
    });
    bins.appendChild(d);
  });
  navBar(sec,step,i);
};

/* 매칭 — 왼쪽 항목에 알맞은 설명 붙이기 */
BUILD.match=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'🔗 '+step.label+' <span class="pill">줄 → 설명</span>'));
  card.appendChild(el("p","lead",step.intro||"왼쪽 줄을 누르고, 아래에서 알맞은 설명을 고르자."));
  var rows=el("div","rows"); card.appendChild(rows);
  var opts=el("div","opts"); card.appendChild(opts);
  var msg=el("div","msg"); msg.id="m-"+step.key; card.appendChild(msg);
  if(step.hint) card.appendChild(el("div","hint",step.hint));
  sec.appendChild(card);

  var pick=null, left=step.data.length;
  step.data.forEach(function(r,idx){
    var d=el("div","row",'<span class="rk">'+r.k+'</span><span class="rv">? 눌러서 선택</span>');
    d.dataset.i=idx;
    d.addEventListener("click",function(){
      if(d.classList.contains("ok")) return;
      $$(".row",rows).forEach(function(o){o.classList.remove("sel")});
      d.classList.add("sel"); pick=idx;
      say("#m-"+step.key,"",r.k+" 선택 — 설명을 고르세요");
    });
    rows.appendChild(d);
  });
  shuffle(step.data.map(function(r){return r.a})).forEach(function(a){
    var b=el("button","btn opt",a);
    b.addEventListener("click",function(){
      if(pick===null){ say("#m-"+step.key,"no","먼저 위에서 항목을 고르세요"); return }
      var r=step.data[pick], d=$('.row[data-i="'+pick+'"]',rows);
      if(r.a===a){
        d.classList.remove("sel"); d.classList.add("ok"); $(".rv",d).textContent=a;
        b.classList.add("used"); pick=null; left--;
        if(window.FX) FX.ok(d);
        say("#m-"+step.key,"ok","맞다!"+(left?" 남은 것 "+left+"개":""));
        if(left===0){ say("#m-"+step.key,"ok","🎉 전부 연결했다!"); clearStep(step,i) }
      }else{
        MISS[step.key]++;
        if(window.FX) FX.no(d);
        say("#m-"+step.key,"no",r.k+"의 설명이 아니다.");
      }
    });
    opts.appendChild(b);
  });
  navBar(sec,step,i);
};

/* 고르기 — 맞는 설명만 켜기 */
BUILD.pick=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'✅ '+step.label+' <span class="pill">맞는 것만</span>'));
  card.appendChild(el("p","lead",step.intro||"아래에서 <b>맞는 설명만</b> 눌러서 켜자. 틀린 것을 켜면 실수로 기록된다."));
  var box=el("div","checks"); card.appendChild(box);
  var msg=el("div","msg"); msg.id="m-"+step.key; card.appendChild(msg);
  if(step.hint) card.appendChild(el("div","hint",step.hint));
  sec.appendChild(card);

  var need=step.data.filter(function(c){return c.ok}).length;
  shuffle(step.data.slice()).forEach(function(c){
    var d=el("div","chk",'<span class="box">✓</span><span>'+c.t+'</span>');
    d.addEventListener("click",function(){
      if(d.classList.contains("on")) return;
      if(c.ok){
        d.classList.add("on");
        if(window.FX) FX.ok(d);
        say("#m-"+step.key,"ok",c.why||"맞는 설명이다!");
        if($$(".chk.on",box).length===need){ say("#m-"+step.key,"ok","🎉 맞는 것을 모두 찾았다!"); clearStep(step,i) }
      }else{
        MISS[step.key]++;
        if(window.FX) FX.no(d);
        say("#m-"+step.key,"no",c.why||"이건 틀린 설명이다.");
      }
    });
    box.appendChild(d);
  });
  navBar(sec,step,i);
};

/* 순서 — 차례대로 누르기 */
BUILD.seq=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'🔢 '+step.label+' <span class="pill">순서대로 탭</span>'));
  card.appendChild(el("p","lead",step.intro||"순서대로 눌러 보자. 틀리면 처음부터 다시 시작한다."));
  var slots=el("div","seq"); card.appendChild(slots);
  var opts=el("div","opts"); card.appendChild(opts);
  var msg=el("div","msg"); msg.id="m-"+step.key; card.appendChild(msg);
  if(step.hint) card.appendChild(el("div","hint",step.hint));
  sec.appendChild(card);

  var cur=0, n=step.data.length;
  function draw(){
    slots.innerHTML="";
    for(var k=0;k<n;k++){
      slots.appendChild(el("div","seqslot"+(k<cur?" filled":""),
        '<span class="no">'+(k+1)+'</span><span>'+(k<cur?step.data[k]:"…")+'</span>'));
    }
  }
  draw();
  shuffle(step.data.slice()).forEach(function(t){
    var b=el("button","btn opt",t);
    b.addEventListener("click",function(){
      if(t===step.data[cur]){
        b.classList.add("used"); cur++; draw();
        if(window.FX){
          var filled=$$(".seqslot.filled",slots);
          FX.ok(filled[filled.length-1]||b);
        }
        if(cur>=n){ say("#m-"+step.key,"ok","🎉 순서 완벽!"); clearStep(step,i) }
        else say("#m-"+step.key,"ok","맞다! 다음 순서는? ("+cur+"/"+n+")");
      }else{
        MISS[step.key]++; cur=0; draw();
        $$(".opt",opts).forEach(function(o){o.classList.remove("used")});
        if(window.FX) FX.no(slots);
        say("#m-"+step.key,"no","순서가 아니다. 처음부터 다시.");
      }
    });
    opts.appendChild(b);
  });
  navBar(sec,step,i);
};

/* 직접 만드는 화면 — 차시 파일이 render 함수를 넘긴다 */
BUILD.custom=function(sec,step,i){
  step.render(sec,{
    el:el, shuffle:shuffle, say:say,
    done:function(){ clearStep(step,i) },
    miss:function(){ MISS[step.key]++ },
    nav:function(){ navBar(sec,step,i) },
    ok:function(node){ if(window.FX) FX.ok(node) },
    bad:function(node){ MISS[step.key]++; if(window.FX) FX.no(node) }
  });
};

/* 탐구 보고서 — 조사해서 항목별로 쓰고, 임시저장 + 온라인 제출 (시험과 별개) */
BUILD.probe=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'🔎 '+step.label+' <span class="pill">조사해서 쓰기</span>'));
  card.appendChild(el("p","lead",step.intro||"시험이 아니다! 직접 찾아보고 조사해서 정리해 보자."));

  var g='<div class="pg-h">📌 이번 과제</div>'+(step.topic||"관심 있는 주제를 조사해 정리해 보자.");
  if(step.keywords && step.keywords.length){
    g+='<div class="pg-h" style="margin-top:11px">🔍 이렇게 찾아보자</div>검색창에 아래 같은 말을 넣어 보면 자료가 잘 나온다.'+
       '<div class="pg-kw">'+step.keywords.map(function(k){return '<span>'+k+'</span>'}).join("")+'</div>';
  }
  card.appendChild(el("div","pguide",g));

  var fbox=el("div"); card.appendChild(fbox);
  var helper=el("div","phelper","각 칸을 채우면 자동으로 임시저장된다."); card.appendChild(helper);
  var submit=el("button","btn bigbtn gold","📤 선생님께 제출"); submit.style.cssText="width:100%;margin-top:4px;display:none"; card.appendChild(submit);
  var clr=el("button","btn bigbtn ghost","🗑️ 전부 지우기"); clr.style.cssText="width:100%;margin-top:8px"; card.appendChild(clr);
  var rcHint=el("div","phelper",""); rcHint.style.marginTop="8px"; card.appendChild(rcHint);
  sec.appendChild(card);

  var tip=$("#pSavedTip"); if(!tip){ tip=el("div","psaved","임시저장됨"); tip.id="pSavedTip"; document.body.appendChild(tip); }

  var fields=(step.fields&&step.fields.length)?step.fields:[
    {k:"subject",label:"조사한 대상",tip:"무엇을 조사했는지 (이름·종류 등)",min:8,short:true},
    {k:"content",label:"조사한 내용",tip:"찾아본 내용을 정리해 쓰자",min:30},
    {k:"learned",label:"새로 알게 된 점",tip:"조사 전에는 몰랐던 것. '왜 그런지'까지 쓰면 좋다",min:25},
    {k:"src",label:"참고한 자료(출처)",tip:"사용한 웹사이트나 책 이름",min:4,short:true}
  ];
  var PKEY="drone_probe_"+(CFG.id||CFG.name)+"_"+step.key;
  var hasRC=!!(window.ResultCollector&&ResultCollector.config&&ResultCollector.config.endpoint);
  var probeDone=false, saveT;
  function pel(k){ return $("#pb_"+step.key+"_"+k) }
  function grow(t){ if(t&&t.tagName==="TEXTAREA"){ t.style.height="auto"; t.style.height=Math.max(80,t.scrollHeight)+"px" } }
  function allFilled(){ return fields.every(function(f){ var e=pel(f.k); return e && e.value.trim().length>=f.min }) }
  function saveP(){
    clearTimeout(saveT);
    saveT=setTimeout(function(){
      var d={}; fields.forEach(function(f){ var e=pel(f.k); if(e) d[f.k]=e.value });
      try{ localStorage.setItem(PKEY,JSON.stringify(d)); tip.classList.add("show"); setTimeout(function(){tip.classList.remove("show")},900) }catch(e){}
    },400);
  }

  fields.forEach(function(f){
    var wrap=el("div","pf");
    var input=f.short?('<input id="pb_'+step.key+'_'+f.k+'" placeholder="여기에 쓰세요">')
                     :('<textarea id="pb_'+step.key+'_'+f.k+'" placeholder="여기에 쓰세요"></textarea>');
    wrap.innerHTML='<div class="pfl">'+f.label+'<span class="pfr">*</span></div>'+
      '<div class="pft">'+(f.tip||"")+'</div>'+input+
      '<div class="pfc" id="pc_'+step.key+'_'+f.k+'">0자 (권장 '+f.min+'자 이상)</div>';
    fbox.appendChild(wrap);
    var t=pel(f.k), c=$("#pc_"+step.key+"_"+f.k);
    t.addEventListener("input",function(){
      var n=t.value.trim().length, was=c.classList.contains("ok");
      c.textContent=n+"자 (권장 "+f.min+"자 이상)"; c.className="pfc"+(n>=f.min?" ok":"");
      if(!was&&n>=f.min&&window.FX){ FX.burst(c,{color:"#34d399",n:7,dist:40}); FX.punch(c); FX.sound("up") }
      grow(t); saveP();
      if(!probeDone && allFilled()){
        probeDone=true; clearStep(step,i);
        if(window.FX) FX.banner({icon:"🔎",title:"탐구 보고서 완성!",
          sub:"조사한 내용을 잘 정리했다.<br>아래 <b>제출</b> 버튼으로 선생님께 보내자",
          stars:false, btn:"좋아요 👍", onClose:function(){ submit.scrollIntoView({behavior:"smooth",block:"center"}) }});
      }
    });
  });

  // 불러오기 (자동 임시저장 복원)
  (function(){
    var raw=null; try{ raw=localStorage.getItem(PKEY) }catch(e){}
    if(!raw) return; var d; try{ d=JSON.parse(raw) }catch(e){ return }
    fields.forEach(function(f){
      var e=pel(f.k); if(e && d[f.k]!=null){ e.value=d[f.k];
        var n=e.value.trim().length, c=$("#pc_"+step.key+"_"+f.k);
        c.textContent=n+"자 (권장 "+f.min+"자 이상)"; c.className="pfc"+(n>=f.min?" ok":""); grow(e); }
    });
    if(allFilled()){ probeDone=true; CLEARED[step.key]=false; clearStep(step,i); }
  })();

  submit.style.display="block";
  if(!hasRC) rcHint.textContent="※ 지금 링크로는 제출이 되지 않는다. 선생님이 준 제출용 링크(?rc=…)로 열면 보낼 수 있다. 작성은 지금 그대로 이어 가자.";

  submit.textContent="📤 [탐구보고서] 결과 제출";
  submit.addEventListener("click",function(){
    var missing=fields.filter(function(f){ var e=pel(f.k); return !e || e.value.trim().length<(f.short?3:15) });
    if(missing.length){ helper.textContent="아직 덜 쓴 칸이 있다: "+missing.map(function(f){return f.label}).join(", "); return; }
    var body=fields.map(function(f){ return "["+f.label+"] "+pel(f.k).value.trim().replace(/\s+/g," ") }).join("  //  ");
    if(body.length>4000) body=body.slice(0,4000)+"…(줄임)";
    var filled=fields.filter(function(f){ return pel(f.k).value.trim().length>0 }).length;
    if(window.FX) FX.sound("clear");
    RCPart.submit((CFG.name||"드론")+" — 탐구보고서", {
      correct:filled,total:fields.length,wrong:body,
      labels:{correct:"작성한 항목",total:"전체 항목",rate:"작성률(%)",wrong:"탐구 내용"}
    }, ["자료를 찾아 스스로 정리함"]);
  });
  clr.addEventListener("click",function(){
    if(!confirm("작성한 탐구보고서를 전부 지울까? 되돌릴 수 없다.")) return;
    try{ localStorage.removeItem(PKEY) }catch(e){}
    probeDone=false;
    fields.forEach(function(f){
      var e=pel(f.k); if(e){ e.value=""; if(e.tagName==="TEXTAREA") e.style.height="80px" }
      var c=$("#pc_"+step.key+"_"+f.k); if(c){ c.textContent="0자 (권장 "+f.min+"자 이상)"; c.className="pfc" }
    });
    helper.textContent="각 칸을 채우면 자동으로 임시저장된다.";
  });

  navBar(sec,step,i);
};

/* 학습지 — 객관식 + 단답, 자동 채점 + 제출 */
BUILD.quiz=function(sec,step,i){
  var card=el("div","card");
  card.appendChild(el("div","sectitle",'✍️ '+step.label+' <span class="pill">자동 채점</span>'));
  card.appendChild(el("p","lead",step.intro||"문제를 풀고 <b>채점하기</b>를 누르자."));
  var banner=el("div","score");
  banner.style.display="none";
  banner.innerHTML='<div><b class="s1">0</b><span>점수</span></div>'+
                   '<div><b class="s2">0</b><span>맞힌 문제</span></div>'+
                   '<div><b class="s3">0분</b><span>걸린 시간</span></div>';
  card.appendChild(banner);
  var list=el("div"); card.appendChild(list);

  var picked={};
  step.data.forEach(function(item,qi){
    var q=el("div","q");
    q.dataset.i=qi;
    q.appendChild(el("div","qh",'<span class="no">'+(qi+1)+'</span>'+item.q));
    if(item.a){
      // 보기 순서를 섞는다 (정답이 늘 같은 자리에 오지 않도록)
      var order=shuffle(item.a.map(function(_,k){return k}));
      item._order=order;
      var ans=el("div","ans");
      order.forEach(function(orig){
        var b=el("button","btn a",item.a[orig]);
        b.addEventListener("click",function(){
          $$(".a",ans).forEach(function(x){x.classList.remove("sel")});
          b.classList.add("sel"); picked[qi]=orig;
        });
        ans.appendChild(b);
      });
      q.appendChild(ans);
    }else{
      var inp=el("input","short"); inp.type="text"; inp.placeholder="답을 쓰세요";
      inp.addEventListener("input",function(){ picked[qi]=inp.value });
      q.appendChild(inp);
    }
    q.appendChild(el("div","exp",""));
    list.appendChild(q);
  });

  var grade=el("button","btn bigbtn gold","📝 채점하기");
  grade.style.width="100%"; grade.style.marginTop="6px";
  card.appendChild(grade);
  var after=el("div","nav"); after.style.display="none"; card.appendChild(after);
  var retry=el("button","btn bigbtn ghost","🔄 다시 풀기");
  retry.addEventListener("click",function(){ location.reload() });
  after.appendChild(retry);
  var submit=el("button","btn bigbtn","📤 선생님께 제출");
  submit.style.display="none"; after.appendChild(submit);
  var toReport=el("button","btn bigbtn ghost","📝 보고서 쓰러 가기");
  toReport.addEventListener("click",function(){
    var rc=new URLSearchParams(location.search).get("rc");
    location.href="report.html"+(rc?"?rc="+encodeURIComponent(rc):"");
  });
  after.appendChild(toReport);
  sec.appendChild(card);

  grade.addEventListener("click",function(){
    if(grade.disabled) return;
    grade.disabled=true; grade.textContent="채점 중…";
    var correct=0, wrong=[], wrongNote=[], qi=0;
    banner.style.display="grid";
    $(".s1",banner).textContent="0"; $(".s2",banner).textContent="0 / "+step.data.length;
    $(".s3",banner).textContent="–";
    // 한 문항씩 차례로 판정한다 (한 번에 다 보여 주면 밋밋하다)
    (function judge(){
      if(qi>=step.data.length){ finish(); return }
      var item=step.data[qi], q=$('.q[data-i="'+qi+'"]',list), ok;
      if(item.a){ ok = picked[qi]===item.c; }
      else {
        var v=String(picked[qi]||"").replace(/\s/g,"").toLowerCase();
        ok = (item.c||[]).some(function(c){ return String(c).replace(/\s/g,"").toLowerCase()===v });
      }
      q.classList.remove("right","wrong");
      q.classList.add(ok?"right":"wrong");
      var right = item.a ? item.a[item.c] : (item.c||[])[0];
      $(".exp",q).innerHTML = (ok?"⭕ 정답! ":"❌ 정답: <b>"+right+"</b> — ") + (item.x||"");
      if(ok){
        correct++;
        if(window.FX){ FX.punch(q); FX.burst(q,{n:7,dist:44}); FX.sound("up"); }
      }else{
        wrong.push(qi+1);
        // 무엇을 틀렸는지 남긴다 (규약 §1 ②)
        wrongNote.push({no:qi+1, q:item.q||"",
          pick: item.a ? item.a[picked[qi]] : String(picked[qi]==null?"":picked[qi]),
          ans: right});
        if(window.FX) FX.shake(q);
      }
      // 맞힌 개수는 "n / 총" 형식이라 카운트업을 걸면 형식이 깨진다. 최종 점수만 카운트업한다.
      $(".s2",banner).textContent=correct+" / "+step.data.length;
      if(window.FX) FX.punch($(".s2",banner));
      qi++;
      setTimeout(judge,190);
    })();

    function finish(){
      var score=Math.round(correct/step.data.length*100);
      var mins=Math.max(1,Math.round((Date.now()-START)/60000));
      if(window.FX) FX.countUp($(".s1",banner),score,900); else $(".s1",banner).textContent=score;
      $(".s3",banner).textContent=mins+"분";
      after.style.display="flex";
      grade.style.display="none";
      QUIZ_RESULT={mode:(CFG.name||"드론")+" — 학습지 퀴즈",
                   score:score,correct:correct,total:step.data.length,
                   wrong:(window.RCPart?RCPart.descs(wrongNote):wrong),
                   durationSec:Math.round((Date.now()-START)/1000)};
      /* 랭킹전 — 학습지 채점이 끝나면 RP 정산 (드론 도구들이 계급을 공유) */
      if(window.RankKit) RankKit.award(score, QUIZ_RESULT.mode);
      try{
        localStorage.setItem("drone_lesson_"+(CFG.id||CFG.name),
          JSON.stringify({name:CFG.name,score:score,correct:correct,total:step.data.length,at:new Date().toISOString()}));
      }catch(e){}
      // 제출 버튼은 ?rc= 링크가 아니어도 항상 보인다 (규약 §1 ③)
      if(window.RCPart){
        submit.style.display="block";
        RCPart.mount(submit, {
          id:"rcQuiz", className:"btn", label:"학습지 퀴즈",
          part:(CFG.name||"드론")+" — 학습지 퀴즈",
          extra:[(CFG.name||"드론")+" 학습 내용 확인"],
          payload:function(){ return QUIZ_RESULT }
        });
      }
      CLEARED[step.key]=false; clearStep(step,i);   // 진행 드론을 끝까지 올린다
      var rank = score>=95?"S":(score>=85?"A":(score>=70?"B":(score>=50?"C":"D")));
      var stars = score>=95?3:(score>=75?2:(score>=50?1:0));
      // 학습지 점수만큼 계급 점수(RP)를 준다 + 내 최고 기록 갱신
      var rec=null, rk=null;
      if(window.FX){
        FX.addRP(Math.round(score*1.5));
        rec=FX.record("lesson_"+(CFG.id||CFG.name), score);
        rk=FX.rank();
      }
      setTimeout(function(){
        if(!window.FX) return;
        FX.banner({
          icon: rank==="S"?"👑":(rank==="A"?"🏆":(rank==="B"?"🎉":"💪")),
          title: rank+" 등급 · "+score+"점",
          sub: step.data.length+"문제 중 <b>"+correct+"문제</b> 정답"+
               (wrong.length?"<br><span style='color:#fb7185'>틀린 문제 "+wrong.join(", ")+"번 — 아래 해설을 꼭 읽자</span>"
                            :"<br><span style='color:#34d399'>전부 맞혔다! 완벽하다</span>")+
               (rec&&rec.isNew?"<br><span style='color:#fbbf24;font-weight:800'>🎯 내 최고 기록 갱신! (이전 "+rec.prev+"점)</span>":"")+
               (rk?"<br><span style='color:"+rk.color+";font-weight:800'>"+rk.emoji+" "+rk.name+"</span>"
                   +(rk.next?"<span style='color:#9db0d6'> · "+rk.next+"까지 "+rk.need+"점</span>":"")
                :""),
          stars: stars,
          btn: "해설 보기 →",
          onClose: function(){ banner.scrollIntoView({behavior:"smooth",block:"center"}) }
        });
      },700);
    }
  });
};

window.Lesson={ start:start, go:go };
})();
