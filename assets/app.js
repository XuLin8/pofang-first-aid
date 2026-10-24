/* ============================================================
   破防急救站 · app.js —— 便签墙记录逻辑
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 数据 ---------------- */
  var STORE_KEY = "pofang-wall-v1";

  var MOODS = [
    { id: "lei",   name: "泪目" },
    { id: "po",    name: "破大防" },
    { id: "yu",    name: "被治愈" },
    { id: "emo",   name: "emo了" },
    { id: "laobeng", name: "老绷家" },
    { id: "bao",   name: "包破防的" },
    { id: "tingquan", name: "听劝emo" },
    { id: "tiliao", name: "鹈鹕式微笑" },
    { id: "yi",    name: "意难平" },
    { id: "shang", name: "上头" },
    { id: "boli",  name: "玻璃心" },
    { id: "poti",  name: "破涕为笑" }
  ];

  var LV_TEXT = ["", "微微鼻酸", "眼眶湿润", "绷不住了", "泪流满面", "彻底破大防"];

  var SCENES = [
    /* 程序员专区（1024） */
    { t: "dev", s: "上线前三分钟，测试发来一句「你过来看一下」" },
    { t: "dev", s: "代码跑了四十分钟，报错定位在第 2 行" },
    { t: "dev", s: "产品经理说：这个需求很简单，怎么实现我不管" },
    { t: "dev", s: "线上炸了，群里所有人齐刷刷 @我" },
    { t: "dev", s: "git push -f 回车之后，才看见群里的 99+" },
    { t: "dev", s: "凌晨三点复现了那个玄学 bug，然后它自己好了" },
    { t: "dev", s: "删库跑路的命令就在手边，我忍住了" },
    { t: "dev", s: "code review 里轻轻一句「这里为什么这么写」" },
    { t: "dev", s: "改了一整天的 bug，是需求理解错了" },
    { t: "dev", s: "发际线和 deadline，总有一个在追赶我" },
    { t: "dev", s: "1024 这天，公司发的礼物是一张荣誉证书" },
    { t: "dev", s: "面试官微笑着问：说说你项目里最大的挑战" },
    /* 热梗专区 */
    { t: "meme", s: "刷到鹈鹕骑车，笑着笑着就哭了" },
    { t: "meme", s: "评论区清一色「老绷家」，原来绷不住的不止我一个" },
    { t: "meme", s: "他说「包的」，然后就没有然后了" },
    { t: "meme", s: "听劝，真的听劝，听完更 emo 了" },
    { t: "meme", s: "尊嘟假嘟，他说走的时候是尊嘟" },
    { t: "meme", s: "在小小的工位里面挖呀挖呀挖" },
    { t: "meme", s: "科目三跳完了，人生还是没有起色" },
    { t: "meme", s: "泰裤辣！可惜与我无关" },
    { t: "meme", s: "「你人还挺好的」——后半句我读懂了" },
    { t: "meme", s: "city 不 city？加班到 midnight 一点都不 city" },
    { t: "meme", s: "满级人类刷完了，我还是个青铜" },
    { t: "meme", s: "遥遥领先的是我的黑眼圈" },
    /* 经典专区 */
    { t: "std", s: "深夜单曲循环到第三遍，前奏一响眼眶就热了" },
    { t: "std", s: "重刷老番，OP 刚响起就绷不住了" },
    { t: "std", s: "爸妈突然发来一句「降温了，记得穿秋裤」" },
    { t: "std", s: "毕业合照里的人，现在很难凑齐了" },
    { t: "std", s: "游戏结局 CG 里，同伴对主角说了声再见" },
    { t: "std", s: "加班到楼下，夜风比平时冷了一点" },
    { t: "std", s: "猫把下巴搁在我膝盖上，喉咙呼噜呼噜的" },
    { t: "std", s: "陌生人帮我捡起了撒了一地的文件" },
    { t: "std", s: "体检报告出来了，第一次认真看了每一条" },
    { t: "std", s: "听到楼下小孩背古诗，是我小时候背过的那首" },
    { t: "std", s: "老歌随机播放，唱到那句歌词时刚好红灯" },
    { t: "std", s: "看到爷爷年轻时的照片，他也是个少年啊" },
    { t: "std", s: "朋友随口一句「有我在」，突然就绷不住" },
    { t: "std", s: "旧手机翻到 2019 年的跨年视频" },
    { t: "std", s: "剧里的配角下线了，弹幕齐刷「一路走好」" },
    { t: "std", s: "外卖备注写着「天冷，多装了份汤」" },
    { t: "std", s: "搬家时翻出高中同桌写的同学录" },
    { t: "std", s: "地铁上有人抱着吉他，唱了首很旧的民谣" },
    { t: "std", s: "深夜饿了，发现冰箱里冻着妈妈包的饺子" },
    { t: "std", s: "第一次一个人过生日，蜡烛还是点了" },
    { t: "std", s: "输球那晚，队友们谁都没先走" },
    { t: "std", s: "宠物医院的走廊里，它一直回头看我" },
    { t: "std", s: "弹幕满屏「爷青回」的时候" },
    { t: "std", s: "婚礼上爸爸把她的手交出去的那一秒" },
    { t: "std", s: "台风天里，便利店店员多给了把伞" },
    { t: "std", s: "第一次发现白头发，是在等红灯时照的车窗" },
    { t: "std", s: "高考结束那天的傍晚，晚霞特别好看" },
    { t: "std", s: "理想主义的句子在现实面前碰了一下" },
    { t: "std", s: "老师退休那天，黑板上写着「下课」" },
    { t: "std", s: "流浪猫被领养前的最后一张照片" },
    { t: "std", s: "练了很久的歌，终于唱给一个人听" },
    { t: "std", s: "旧友的婚礼上，我们像回到了教室后排" }
  ];
  var SCENE_TAG = { dev: "1024", meme: "热梗", std: "盲盒" };
  var SCENE_LABEL = { dev: "程序员节盲盒", meme: "热梗盲盒", std: "场景盲盒" };
  function sceneTag(n) { return SCENE_TAG[n.sceneType] || "盲盒"; }

  /* ---------------- 状态 ---------------- */
  var notes = [];
  var uid = 1;
  var wall = document.getElementById("wall");
  var isMobile = window.matchMedia("(max-width: 720px)");
  var canDrag = window.matchMedia("(pointer: fine)");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var detailId = null;

  function moodOf(id) { return MOODS.find(function (m) { return m.id === id; }) || MOODS[0]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad2(v) { return (v < 10 ? "0" : "") + v; }
  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "." + pad2(d.getMonth() + 1) + "." + pad2(d.getDate());
  }

  /* ---------------- 存储 ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        notes = JSON.parse(raw) || [];
        uid = notes.reduce(function (m, n) { return Math.max(m, n.id || 0); }, 0) + 1;
        return;
      }
    } catch (e) { /* ignore */ }
    seed();
    save();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(notes)); } catch (e) { /* ignore */ }
  }

  function seed() {
    var day = 86400000, now = Date.now();
    var demo = [
      { d: 0,  mood: "boli", lv: 3, text: "改到一半电脑蓝屏，十五页文档没了。蹲在工位上把自己骂了一遍，然后去接了杯热水。" },
      { d: 1,  mood: "yu",   lv: 4, text: "出租屋楼下，煎饼摊阿姨多塞了个蛋：「瘦了，多吃点。」站在风里差点没绷住。" },
      { d: 2,  mood: "lei",  lv: 3, scene: true, text: "单曲循环到第三遍，前奏一响眼眶就自动热了。音乐是最温柔的偷袭。" },
      { d: 4,  mood: "yi",   lv: 5, text: "游戏里养了三年的角色在结局说：「谢谢你陪我走到这里。」通关了，心也空了。" },
      { d: 6,  mood: "emo",  lv: 4, text: "深夜刷到爷爷年轻时的照片，他抱着小时候的我。原来他也曾是个意气风发的少年。" },
      { d: 8,  mood: "poti", lv: 2, text: "体重秤数字 +2，但今天的冰淇淋真的很好吃。好吧，破防，但明天再说。" }
    ];
    notes = demo.map(function (t, i) {
      return {
        id: i + 1, ts: now - t.d * day - (i + 1) * 3600000,
        mood: t.mood, lv: t.lv, text: t.text,
        scene: t.scene ? "深夜单曲循环到第三遍，前奏一响眼眶就热了" : "",
        sceneType: t.scene ? "std" : "",
        rot: Math.random() * 5 - 2.5,
        px: null, py: null
      };
    });
    uid = demo.length + 1;
  }

  /* ---------------- 便签渲染 ---------------- */
  function noteHTML(n, no) {
    var m = moodOf(n.mood);
    var ticks = "";
    for (var i = 1; i <= 5; i++) ticks += '<i class="' + (i <= n.lv ? "on" : "") + '"></i>';
    return '<i class="pin"></i>' +
      '<div class="eyebrow"><span class="no">NO.' + no + '</span><span>—</span><span class="mn">' + m.name + '</span>' +
      (n.scene ? '<span class="scene-tag">' + sceneTag(n) + '</span>' : "") + "</div>" +
      '<div class="txt">' + esc(n.text) + "</div>" +
      '<div class="meta"><span class="date">' + fmtDate(n.ts) + '</span><span class="lv">' + ticks + "</span></div>";
  }

  function buildEl(n, idx) {
    var el = document.createElement("article");
    el.className = "note";
    el.dataset.id = n.id;
    var rot = Math.max(-2.5, Math.min(2.5, n.rot || 0));
    el.style.setProperty("--rot", rot.toFixed(2) + "deg");
    el.style.zIndex = 10 + idx;
    el.innerHTML = noteHTML(n, String(idx + 1).padStart(3, "0"));
    return el;
  }

  /* 散落布局：按时间顺序做松散列排布 + 抖动 */
  function layout() {
    if (isMobile.matches) {
      notes.forEach(function (n) {
        var el = wall.querySelector('[data-id="' + n.id + '"]');
        if (el) { el.style.left = el.style.top = ""; }
      });
      return;
    }
    var sorted = notes.slice().sort(function (a, b) { return a.ts - b.ts; });
    var w = wall.clientWidth - 64;
    var colW = 280;
    var cols = Math.max(2, Math.min(5, Math.floor(w / colW)));
    var colX = [], colY = [];
    var top = 108;
    for (var c = 0; c < cols; c++) {
      colX.push(28 + (c * (w - 40)) / cols + (c % 2) * 14);
      colY.push(top + Math.random() * 20);
    }
    sorted.forEach(function (n, i) {
      var el = wall.querySelector('[data-id="' + n.id + '"]');
      if (!el) return;
      var h = el.offsetHeight || 180;
      if (n.px === null || n.px === undefined) {
        var col = colY.indexOf(Math.min.apply(null, colY));
        n.px = Math.round(colX[col] + Math.random() * 26);
        n.py = Math.round(colY[col] + Math.random() * 18);
        colY[col] += h + 34;
      }
      n.px = Math.max(4, Math.min(wall.clientWidth - 250, n.px));
      n.py = Math.max(top - 20, Math.min(wall.scrollHeight - 60, n.py));
      el.style.left = n.px + "px";
      el.style.top = n.py + "px";
      el.style.zIndex = 10 + i;
    });
  }

  function renderAll() {
    var sorted = notes.slice().sort(function (a, b) { return a.ts - b.ts; });
    wall.querySelectorAll(".note").forEach(function (el) { el.remove(); });
    var empty = wall.querySelector(".wall-empty");
    if (empty) empty.remove();
    if (!sorted.length) {
      wall.innerHTML = '<div class="wall-empty"><div class="big">墙上还没有便签</div>' +
        '<div class="sub">每一次破防都值得被看见。<br>点「记一笔破防」，把那一刻贴上来。</div>' +
        '<div class="hand">write it down, let it go</div></div>';
      updateStats();
      return;
    }
    var frag = document.createDocumentFragment();
    sorted.forEach(function (n, i) { frag.appendChild(buildEl(n, i)); });
    wall.appendChild(frag);
    layout();
    updateStats();
  }

  /* ---------------- 统计 ---------------- */
  function updateStats() {
    var elC = document.getElementById("stCount");
    var elA = document.getElementById("stAvg");
    var elM = document.getElementById("stMood");
    elC.textContent = notes.length;
    if (!notes.length) { elA.textContent = "–"; elM.textContent = "–"; drawSpark([]); return; }
    var avg = notes.reduce(function (s, n) { return s + n.lv; }, 0) / notes.length;
    elA.textContent = avg.toFixed(1);
    var cnt = {};
    notes.forEach(function (n) { cnt[n.mood] = (cnt[n.mood] || 0) + 1; });
    var top = MOODS.filter(function (m) { return cnt[m.id]; })
      .sort(function (a, b) { return cnt[b.id] - cnt[a.id]; })[0];
    elM.textContent = top ? top.name : "–";

    var day = 86400000, now = Date.now();
    var counts = [];
    for (var i = 6; i >= 0; i--) {
      var s = now - i * day, e = s + day;
      counts.push(notes.filter(function (n) { return n.ts >= s && n.ts < e; }).length);
    }
    drawSpark(counts);
  }

  function drawSpark(counts) {
    var svg = document.getElementById("stSpark");
    if (!svg) return;
    var max = Math.max.apply(null, counts.concat([1]));
    var pts = counts.map(function (c, i) {
      return (i * 92 / 6 + 2).toFixed(1) + "," + (23 - (c / max) * 19).toFixed(1);
    }).join(" ");
    var empty = counts.every(function (c) { return c === 0; });
    svg.innerHTML =
      '<polyline points="' + pts + '" fill="none" stroke="' +
      (empty ? "rgba(138,131,120,.5)" : "var(--accent)") +
      '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      counts.map(function (c, i) {
        return c ? '<circle cx="' + (i * 92 / 6 + 2).toFixed(1) + '" cy="' + (23 - (c / max) * 19).toFixed(1) + '" r="1.8" fill="var(--accent)"/>' : "";
      }).join("");
  }

  /* ---------------- 拖拽 ---------------- */
  var drag = null;
  wall.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".note");
    if (!el || !canDrag.matches || isMobile.matches) return;
    if (e.button !== 0) return;
    drag = { el: el, id: +el.dataset.id, sx: e.clientX, sy: e.clientY, ol: el.offsetLeft, ot: el.offsetTop, moved: false };
    el.setPointerCapture(e.pointerId);
  });
  wall.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; drag.el.classList.add("dragging"); }
    if (drag.moved) {
      var x = Math.max(8, Math.min(wall.clientWidth - 252, drag.ol + dx));
      var y = Math.max(88, Math.min(wall.scrollHeight - 40, drag.ot + dy));
      drag.el.style.left = x + "px";
      drag.el.style.top = y + "px";
    }
  });
  wall.addEventListener("pointerup", function (e) {
    if (!drag) return;
    var d = drag; drag = null;
    d.el.classList.remove("dragging");
    if (d.moved) {
      var n = notes.find(function (x) { return x.id === d.id; });
      if (n) { n.px = d.el.offsetLeft; n.py = d.el.offsetTop; save(); }
    } else {
      openDetail(d.id);
    }
  });
  wall.addEventListener("pointercancel", function () {
    if (!drag) return;
    drag.el.classList.remove("dragging");
    drag = null;
  });

  /* ---------------- 弹窗通用 ---------------- */
  function openSheet(id) {
    document.getElementById(id).hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeSheet(id) {
    document.getElementById(id).hidden = true;
    if (document.querySelector(".sheet:not([hidden])")) return;
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".sheet").forEach(function (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeSheet(sheet.id);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".sheet:not([hidden])").forEach(function (s) { closeSheet(s.id); });
  });

  /* ---------------- 记录弹窗 ---------------- */
  var form = { mood: null, lv: 2, scene: "", sceneType: "" };

  var chipsEl = document.getElementById("chips");
  MOODS.forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = m.name;
    b.dataset.mood = m.id;
    b.addEventListener("click", function () {
      form.mood = m.id;
      chipsEl.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c === b); });
    });
    chipsEl.appendChild(b);
  });

  var segsEl = document.getElementById("lvSegs");
  var segColors = [
    "rgba(229,72,77,0.3)", "rgba(229,72,77,0.48)", "rgba(229,72,77,0.66)",
    "rgba(229,72,77,0.84)", "#e5484d"
  ];
  for (var i = 1; i <= 5; i++) {
    (function (lv) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lv-seg";
      b.style.setProperty("--seg", segColors[lv - 1]);
      b.setAttribute("aria-label", "破防等级 " + lv);
      b.addEventListener("click", function () { setLv(lv); });
      segsEl.appendChild(b);
    })(i);
  }
  function setLv(lv) {
    form.lv = lv;
    segsEl.querySelectorAll(".lv-seg").forEach(function (s, i) { s.classList.toggle("on", i < lv); });
    document.getElementById("lvDesc").textContent = LV_TEXT[lv];
    document.getElementById("lvNum").textContent = lv + " / 5";
  }

  /* 场景盲盒 */
  var bb = document.getElementById("blindbox");
  var lastScene = -1;
  var is1024 = (new Date().getMonth() === 9 && new Date().getDate() === 24);
  function drawScene() {
    var idx;
    do { idx = Math.floor(Math.random() * SCENES.length); } while (idx === lastScene);
    /* 1024 当天：一半概率抽程序员专区 */
    if (is1024 && Math.random() < 0.5) {
      var devs = [];
      for (var i = 0; i < SCENES.length; i++) if (SCENES[i].t === "dev") devs.push(i);
      idx = devs[Math.floor(Math.random() * devs.length)];
    }
    lastScene = idx;
    form.scene = SCENES[idx].s;
    form.sceneType = SCENES[idx].t;
    document.getElementById("bbScene").textContent = "「" + SCENES[idx].s + "」";
    bb.classList.remove("flipped");
    void bb.offsetWidth;
    bb.classList.add("flipped");
  }
  document.getElementById("btnDraw").addEventListener("click", drawScene);
  document.getElementById("btnRedraw").addEventListener("click", drawScene);
  document.getElementById("btnUseScene").addEventListener("click", function () {
    var input = document.getElementById("inputText");
    if (!input.value.trim()) input.value = form.scene + "。";
    input.focus();
  });

  function openComposer() {
    form = { mood: null, lv: 2, scene: "", sceneType: "" };
    chipsEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("on"); });
    setLv(2);
    bb.classList.remove("flipped");
    document.getElementById("inputText").value = "";
    openSheet("composer");
    setTimeout(function () { document.getElementById("inputText").focus(); }, 250);
  }
  document.getElementById("btnNew").addEventListener("click", openComposer);
  document.getElementById("fab").addEventListener("click", openComposer);

  document.getElementById("btnSave").addEventListener("click", function () {
    var text = document.getElementById("inputText").value.trim();
    if (!text) { toast("写点什么吧，哪怕一句话"); document.getElementById("inputText").focus(); return; }
    if (!form.mood) { toast("选一种这次破防的情绪"); return; }
    var n = {
      id: uid++, ts: Date.now(), mood: form.mood, lv: form.lv, text: text,
      scene: bb.classList.contains("flipped") ? form.scene : "",
      sceneType: bb.classList.contains("flipped") ? form.sceneType : "",
      rot: Math.random() * 5 - 2.5,
      px: null, py: null
    };
    notes.push(n);
    save();
    closeSheet("composer");
    renderAll();
    var el = wall.querySelector('[data-id="' + n.id + '"]');
    if (el) {
      el.classList.add("just-pinned");
      el.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      var r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + 10, n.lv);
    }
    toast(pickToast(SAVE_TOASTS));
  });

  /* ---------------- 详情 ---------------- */
  function openDetail(id) {
    var n = notes.find(function (x) { return x.id === id; });
    if (!n) return;
    detailId = id;
    var m = moodOf(n.mood);
    var elMood = document.getElementById("dtMood");
    elMood.innerHTML = '<span class="dt-tag">NO.' + (notes.slice().sort(function (a, b) { return a.ts - b.ts; }).indexOf(n) + 1).toString().padStart(3, "0") + " — " + m.name + "</span>";
    var elScene = document.getElementById("dtScene");
    elScene.hidden = !n.scene;
    elScene.textContent = n.scene ? (SCENE_LABEL[n.sceneType] || "场景盲盒") + " ·「" + n.scene + "」" : "";
    document.getElementById("dtText").textContent = n.text;
    document.getElementById("dtDate").textContent = "贴于 " + fmtDate(n.ts);
    document.getElementById("dtLv").textContent = "破防等级 " + n.lv + " · " + LV_TEXT[n.lv];
    document.getElementById("dtPos").textContent = "破防不是脆弱，是心还活着";
    openSheet("detail");
  }

  document.getElementById("btnDelete").addEventListener("click", function () {
    if (detailId === null) return;
    notes = notes.filter(function (n) { return n.id !== detailId; });
    save();
    closeSheet("detail");
    renderAll();
    toast("便签已撕掉，这段破防翻篇了");
  });

  /* ---------------- 抽旧便签 ---------------- */
  document.getElementById("btnRecall").addEventListener("click", function () {
    if (!notes.length) { toast("墙上还没有便签，先记一笔吧"); return; }
    var n = notes[Math.floor(Math.random() * notes.length)];
    var el = wall.querySelector('[data-id="' + n.id + '"]');
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      el.classList.remove("just-pinned");
      void el.offsetWidth;
      el.classList.add("just-pinned");
    }
    openDetail(n.id);
    toast("从墙上抽到一张旧便签");
  });

  /* ---------------- 特效桥 ---------------- */
  function burst(x, y, lv) {
    if (reducedMotion.matches) return;
    var fl = document.getElementById("flash");
    if (lv >= 3) {
      fl.style.setProperty("--fx", (x / window.innerWidth * 100).toFixed(1) + "%");
      fl.style.setProperty("--fy", (y / window.innerHeight * 100).toFixed(1) + "%");
      fl.classList.remove("on");
      void fl.offsetWidth;
      fl.classList.add("on");
    }
    window.dispatchEvent(new CustomEvent("pofang:burst", { detail: { x: x, y: y, level: lv } }));
  }

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  var SAVE_TOASTS = [
    "已贴到墙上 · 心之碎片化作微光了",
    "老绷家又添一员，绷不住就贴上来",
    "贴好了 · 这一单破防，包处理的",
    "已上墙 · 鹈鹕骑着车替你把心事带走了",
    "贴好了 · 听劝，写下来的都会过去",
    "已收录 · 尊嘟，写出来就好多了"
  ];
  function pickToast(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* ---------------- resize ---------------- */
  var rz = null;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(layout, 180);
  });
  isMobile.addEventListener("change", function () { renderAll(); });

  /* ---------------- 启动 ---------------- */
  load();
  renderAll();
  if (is1024) {
    setTimeout(function () { toast("1024 程序员节快乐 · 代码无 bug，破防有出处"); }, 900);
  }
  /* 演示/截图钩子：?shot=composer|blindbox|detail|recall */
  var shotMode = new URLSearchParams(location.search).get("shot");
  if (shotMode === "composer") {
    setTimeout(function () {
      openComposer();
      document.getElementById("inputText").value = "上线前三分钟，测试发来一句「你过来看一下」。点开一看，是自己把配置文件改错了。";
      chipsEl.querySelector('[data-mood="laobeng"]').click();
      setLv(4);
    }, 400);
  } else if (shotMode === "blindbox") {
    setTimeout(function () {
      openComposer();
      drawScene();
      document.getElementById("inputText").value = "看到这条盲盒的瞬间就绷不住了，谁懂啊。";
      chipsEl.querySelector('[data-mood="po"]').click();
      setLv(5);
    }, 400);
  } else if (shotMode === "detail") {
    setTimeout(function () {
      var sorted = notes.slice().sort(function (a, b) { return b.ts - a.ts; });
      if (sorted.length) openDetail(sorted[0].id);
    }, 400);
  }
})();
