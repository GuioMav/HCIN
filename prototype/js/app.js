/* Recipe Finder prototype - shared behaviour and page scripts */
(function () {
  "use strict";
  var D = window.RF_DATA;

  /* ---------- storage (wrapped so the prototype still works if storage is blocked) ---------- */
  var mem = {};
  function load(key, fallback) {
    try { var v = localStorage.getItem("rf_" + key); if (v !== null) return JSON.parse(v); } catch (e) { if (key in mem) return mem[key]; }
    return fallback;
  }
  function save(key, value) {
    mem[key] = value;
    try { localStorage.setItem("rf_" + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
  var DAY = 86400000;
  var defaults = {
    pantry: [
      { name: "bread", added: Date.now() - 5 * DAY },
      { name: "egg", added: Date.now() - 2 * DAY },
      { name: "rice", added: Date.now() - 9 * DAY },
      { name: "onion", added: Date.now() - 3 * DAY },
      { name: "cheese", added: Date.now() - 1 * DAY },
      { name: "baked beans", added: Date.now() - 12 * DAY }
    ],
    saved: ["mug-omelette", "tuna-pasta"],
    recent: ["pap-chakalaka", "egg-fried-rice"],
    cooked: 3,
    settings: { text: "normal", contrast: false, motion: false },
    hintDone: false,
    reminderDone: false
  };
  function get(key) { return load(key, defaults[key]); }

  /* ---------- settings applied on every page ---------- */
  function applySettings() {
    var s = get("settings"), h = document.documentElement;
    h.classList.toggle("text-large", s.text === "large");
    h.classList.toggle("text-xlarge", s.text === "xlarge");
    h.classList.toggle("contrast", !!s.contrast);
    h.classList.toggle("reduce-motion", !!s.motion);
  }
  applySettings();

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function icon(id, cls) { return '<svg class="icon ' + (cls || "") + '" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) {
    s = String(s).toLowerCase().trim().replace(/\s+/g, " ");
    var map = { eggs: "egg", onions: "onion", tomatoes: "tomato", carrots: "carrot", bananas: "banana", noodles: "2-minute noodles", beans: "baked beans", "maize": "maize meal", "mealie meal": "maize meal", pap: "maize meal", wraps: "tortilla wrap", wrap: "tortilla wrap", chicken: "cooked chicken", mayo: "mayonnaise", peas: "frozen peas", veg: "frozen mixed veg", "mixed veg": "frozen mixed veg" };
    return map[s] || s;
  }
  function byId(id) { return D.recipes.filter(function (r) { return r.id === id; })[0]; }
  function rands(n) { return "R" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ""); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function daysAgo(t) { var d = Math.round((Date.now() - t) / DAY); return d === 0 ? "added today" : d === 1 ? "added yesterday" : "added " + d + " days ago"; }

  function match(recipe, have) {
    var needed = recipe.ingredients.filter(function (i) { return D.staples.indexOf(i.key) === -1; });
    var got = needed.filter(function (i) { return have.indexOf(i.key) !== -1; });
    var missing = needed.filter(function (i) { return have.indexOf(i.key) === -1; });
    return { have: got.length, total: needed.length, missing: missing };
  }

  /* ---------- toast with optional undo ---------- */
  var toastTimer;
  function toast(msg, undoFn) {
    var wrap = $("#toast");
    clearTimeout(toastTimer);
    wrap.innerHTML = '<div class="toast">' + icon("check") + "<span>" + esc(msg) + "</span>" + (undoFn ? '<button type="button" id="undo-btn">Undo</button>' : "") + "</div>";
    if (undoFn) $("#undo-btn").addEventListener("click", function () { undoFn(); wrap.innerHTML = ""; });
    toastTimer = setTimeout(function () { wrap.innerHTML = ""; }, 6000);
  }
  window.RF_toast = toast;

  function updateSavedBadge() {
    var b = $("#saved-count"); if (b) { var n = get("saved").length; b.textContent = n; b.setAttribute("aria-label", plural(n, "saved recipe")); }
  }
  updateSavedBadge();

  function toggleSave(id, btn) {
    var saved = get("saved"), r = byId(id), on = saved.indexOf(id) === -1;
    if (on) saved.push(id); else saved = saved.filter(function (x) { return x !== id; });
    save("saved", saved); updateSavedBadge();
    if (btn) setSaveBtn(btn, on);
    toast(on ? r.name + " saved to My Kitchen" : r.name + " removed from saved recipes", function () {
      var s = get("saved");
      if (on) s = s.filter(function (x) { return x !== id; }); else s.push(id);
      save("saved", s); updateSavedBadge(); if (btn) setSaveBtn(btn, !on);
    });
  }
  function setSaveBtn(btn, on) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    var full = btn.dataset.full === "1";
    btn.innerHTML = icon(on ? "heart-fill" : "heart") + (full ? (on ? "Saved" : "Save recipe") : (on ? "Saved" : "Save"));
  }

  function card(r, have, opts) {
    opts = opts || {};
    var m = have ? match(r, have) : null, saved = get("saved").indexOf(r.id) !== -1;
    var matchHtml = "";
    if (m) {
      matchHtml = m.missing.length === 0
        ? '<span class="match full">' + icon("check") + "You have everything</span>"
        : '<span class="match part">' + icon("alert") + "You have " + m.have + " of " + m.total + "</span>" +
          '<span class="missing">Missing: ' + esc(m.missing.map(function (i) { return i.key; }).join(", ")) + "</span>";
    }
    return '<article class="card">' +
      '<button type="button" class="save-btn" data-save="' + r.id + '" aria-pressed="' + saved + '" aria-label="Save ' + esc(r.name) + '">' + icon(saved ? "heart-fill" : "heart") + (saved ? "Saved" : "Save") + "</button>" +
      '<img src="' + r.img + '" alt="' + esc(r.alt) + '" width="400" height="230">' +
      '<div class="card-body">' +
      '<h3><a href="recipe.html?id=' + r.id + '">' + esc(r.name) + "</a></h3>" + matchHtml +
      '<div class="meta"><span>' + icon("clock") + r.time + " min</span><span>" + icon("coin") + rands(r.cost) + " per serving</span><span>" + icon("chef") + r.difficulty + "</span><span>" + icon(r.equipment[0]) + D.equipment[r.equipment[0]] + "</span></div>" +
      (opts.social ? '<span class="social-proof">' + icon("users") + "Cooked by " + r.cookedThisWeek + " IIE students this week</span>" : "") +
      "</div></article>";
  }
  function wireSaveButtons(root) {
    $all("[data-save]", root).forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); toggleSave(b.dataset.save, b); });
    });
  }

  /* ---------- modal ---------- */
  var lastFocus;
  function openModal(id) {
    lastFocus = document.activeElement;
    var m = $("#" + id); m.classList.add("open");
    var f = m.querySelector("button, a, input, select, textarea"); if (f) f.focus();
  }
  function closeModal(m) { m.classList.remove("open"); if (lastFocus) lastFocus.focus(); }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-close]"); if (c) closeModal(c.closest(".modal-backdrop"));
    if (e.target.classList && e.target.classList.contains("modal-backdrop")) closeModal(e.target);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var m = $(".modal-backdrop.open"); if (m) closeModal(m); }
  });

  /* =========================================================
     HOME
     ========================================================= */
  function initHome() {
    var chosen = [];
    var input = $("#ingredient-input"), chips = $("#chips"), findBtn = $("#find-btn"), why = $("#find-why");
    function render() {
      chips.innerHTML = chosen.length ? chosen.map(function (c) {
        return '<span class="chip">' + esc(c) + '<button type="button" aria-label="Remove ' + esc(c) + '" data-rm="' + esc(c) + '">' + icon("x") + "</button></span>";
      }).join("") : '<span class="chips-empty">No ingredients added yet</span>';
      $all("[data-rm]", chips).forEach(function (b) { b.addEventListener("click", function () { chosen = chosen.filter(function (x) { return x !== b.dataset.rm; }); render(); input.focus(); }); });
      findBtn.disabled = chosen.length === 0;
      why.textContent = chosen.length === 0 ? "Add at least one ingredient to search." : "Ready: " + plural(chosen.length, "ingredient") + " added.";
      $("#ing-count").textContent = plural(chosen.length, "ingredient") + " added";
    }
    function add(v) {
      v = norm(v); if (!v) return;
      if (chosen.indexOf(v) === -1) chosen.push(v);
      input.value = ""; render();
    }
    $("#add-ing").addEventListener("click", function () { add(input.value); input.focus(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(input.value); } });
    $("#use-pantry").addEventListener("click", function () {
      get("pantry").forEach(function (p) { if (chosen.indexOf(p.name) === -1) chosen.push(p.name); });
      render(); toast("Added " + plural(get("pantry").length, "item") + " from your saved pantry");
    });
    var range = $("#budget"), out = $("#budget-out");
    function rangeText() { out.textContent = "R" + range.value; range.setAttribute("aria-valuetext", "Up to " + range.value + " rand per serving"); }
    range.addEventListener("input", rangeText); rangeText();

    $("#search-form").addEventListener("submit", function (e) {
      e.preventDefault(); if (!chosen.length) return;
      var eq = $all('input[name="eq"]:checked').map(function (x) { return x.value; });
      var q = "ing=" + encodeURIComponent(chosen.join(",")) + "&eq=" + eq.join(",") + "&time=" + $("#time").value + "&cost=" + range.value;
      location.href = "results.html?" + q;
    });

    // first-visit hint (learnability)
    var hint = $("#first-hint");
    if (get("hintDone")) hint.hidden = true;
    $("#hint-ok").addEventListener("click", function () { save("hintDone", true); hint.hidden = true; input.focus(); });

    // system-initiated reminder (responding)
    var rem = $("#reminder");
    var old = get("pantry").filter(function (p) { return p.name === "bread"; })[0];
    if (!old || get("reminderDone")) rem.hidden = true;
    $("#rem-no").addEventListener("click", function () { save("reminderDone", true); rem.hidden = true; toast("Okay, we won't remind you about the bread again"); });

    var pop = D.recipes.slice().sort(function (a, b) { return b.cookedThisWeek - a.cookedThisWeek; }).slice(0, 4);
    $("#popular").innerHTML = pop.map(function (r) { return card(r, null, { social: true }); }).join("");
    wireSaveButtons($("#popular"));

    $all("[data-meal]").forEach(function (b) {
      b.addEventListener("click", function () { location.href = "results.html?meal=" + b.dataset.meal + "&eq=stove,microwave,kettle,none&time=60&cost=30"; });
    });

    chosen = ["egg", "rice", "onion"]; // demo state so the prototype opens ready to try
    if (location.hash === "#empty") chosen = [];
    render();
  }

  /* =========================================================
     RESULTS
     ========================================================= */
  function initResults() {
    var p = new URLSearchParams(location.search);
    var have = (p.get("ing") || "").split(",").filter(Boolean).map(norm);
    var meal = p.get("meal");
    var state = {
      eq: (p.get("eq") || "stove,microwave").split(",").filter(Boolean),
      time: +(p.get("time") || 30), cost: +(p.get("cost") || 20),
      sort: "match", onlyFull: false, meal: meal
    };
    $all('input[name="f-eq"]').forEach(function (c) { c.checked = state.eq.indexOf(c.value) !== -1; c.addEventListener("change", function () { state.eq = $all('input[name="f-eq"]:checked').map(function (x) { return x.value; }); draw(); }); });
    $all("[data-time]").forEach(function (b) {
      b.setAttribute("aria-pressed", +b.dataset.time === state.time ? "true" : "false");
      b.addEventListener("click", function () { state.time = +b.dataset.time; $all("[data-time]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); draw(); });
    });
    var cr = $("#f-cost"), co = $("#f-cost-out");
    cr.value = state.cost;
    function costText() { co.textContent = "R" + cr.value; cr.setAttribute("aria-valuetext", "Up to " + cr.value + " rand"); }
    cr.addEventListener("input", function () { state.cost = +cr.value; costText(); draw(); }); costText();
    $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; draw(); });
    $("#only-full").addEventListener("change", function (e) { state.onlyFull = e.target.checked; draw(); });

    $("#summary-ings").innerHTML = have.length ? have.map(function (h) { return '<span class="chip plain">' + esc(h) + "</span>"; }).join("") : '<span class="chip plain">' + esc(meal || "All recipes") + "</span>";

    function draw() {
      var list = D.recipes.filter(function (r) {
        if (state.meal && r.meal !== state.meal) return false;
        if (!r.equipment.some(function (e) { return state.eq.indexOf(e) !== -1; })) return false;
        if (r.time > state.time || r.cost > state.cost) return false;
        if (have.length) { var m = match(r, have); if (m.have === 0) return false; if (state.onlyFull && m.missing.length) return false; }
        return true;
      });
      list.sort(function (a, b) {
        if (state.sort === "time") return a.time - b.time;
        if (state.sort === "cost") return a.cost - b.cost;
        if (!have.length) return b.rating - a.rating;
        var ma = match(a, have), mb = match(b, have);
        return (ma.missing.length - mb.missing.length) || (mb.have / mb.total - ma.have / ma.total);
      });
      $("#result-count").textContent = list.length ? "Showing " + plural(list.length, "recipe") + " you can make" : "No recipes found";
      var grid = $("#results");
      if (!list.length) {
        grid.className = "";
        grid.innerHTML = '<div class="panel empty"><img class="art" src="img/kettle-noodles.svg" alt=""><h2>Nothing matches all of that yet</h2>' +
          '<p class="muted">That is usually the time limit or budget. Try one of these:</p>' +
          '<div class="actions-row" style="justify-content:center"><button class="btn btn-secondary" type="button" id="relax-time">Allow up to 45 minutes</button>' +
          '<button class="btn btn-secondary" type="button" id="relax-cost">Raise budget to R25</button>' +
          '<a class="btn btn-ghost" href="helper.html">Ask the Kitchen Helper</a></div></div>';
        $("#relax-time").addEventListener("click", function () { state.time = 45; $all("[data-time]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.time === "45" ? "true" : "false"); }); draw(); });
        $("#relax-cost").addEventListener("click", function () { state.cost = 25; cr.value = 25; costText(); draw(); });
        return;
      }
      grid.className = "cards";
      grid.innerHTML = list.map(function (r) { return card(r, have.length ? have : null); }).join("");
      wireSaveButtons(grid);
    }
    draw();
    try { save("lastSearch", location.search); } catch (e) {}
  }

  /* =========================================================
     RECIPE DETAILS
     ========================================================= */
  function initRecipe() {
    var id = new URLSearchParams(location.search).get("id") || "egg-fried-rice";
    var r = byId(id) || D.recipes[0];
    var have = get("pantry").map(function (p) { return p.name; });
    var servings = 1;
    document.title = r.name + " | Recipe Finder";
    var rec = get("recent").filter(function (x) { return x !== r.id; }); rec.unshift(r.id); save("recent", rec.slice(0, 6));

    $("#r-crumb").textContent = r.name;
    $("#r-name").textContent = r.name;
    $("#r-desc").textContent = r.desc;
    $("#r-img").src = r.img; $("#r-img").alt = r.alt;
    $("#r-rating").innerHTML = '<span class="stars" aria-hidden="true">★★★★★</span> <b>' + r.rating + '</b> out of 5 <span class="muted">(' + r.reviews + " reviews)</span>";
    $("#r-social").innerHTML = icon("users") + "Cooked by " + r.cookedThisWeek + " IIE students this week";
    $("#r-time").textContent = r.time + " min";
    $("#r-diff").textContent = r.difficulty;
    $("#r-eq").textContent = D.equipment[r.equipment[0]];
    $("#start-cook").href = "cook.html?id=" + r.id;

    var saveBtn = $("#r-save"); saveBtn.dataset.save = r.id; saveBtn.dataset.full = "1";
    setSaveBtn(saveBtn, get("saved").indexOf(r.id) !== -1);
    saveBtn.addEventListener("click", function () { toggleSave(r.id, saveBtn); });

    function fmt(q) { var v = q * servings; if (v === 0.25) return "¼"; if (v === 0.5) return "½"; if (v === 0.75) return "¾"; return (Math.round(v * 100) / 100).toString(); }
    function drawIngredients() {
      $("#serv-out").textContent = servings;
      $("#serv-minus").disabled = servings <= 1;
      $("#serv-plus").disabled = servings >= 6;
      $("#r-cost").textContent = rands(r.cost * servings);
      $("#cost-label").textContent = servings === 1 ? "per serving" : "for " + servings + " servings";
      var needCount = 0;
      $("#ing-list").innerHTML = r.ingredients.map(function (i) {
        var basic = D.staples.indexOf(i.key) !== -1, got = have.indexOf(i.key) !== -1;
        if (!basic && !got) needCount++;
        var st = basic ? '<span class="ing-status basic">Basic</span>' : got ? '<span class="ing-status have">' + icon("check") + "You have this</span>" : '<span class="ing-status need">' + icon("cart") + "Need to buy</span>";
        return "<li><span><b>" + fmt(i.qty) + (i.unit ? " " + esc(i.unit) : "") + "</b> " + esc(i.name) + "</span>" + st + "</li>";
      }).join("");
      $("#need-summary").textContent = needCount === 0 ? "You have everything for this recipe." : "You need to buy " + plural(needCount, "item") + ".";
      var toBuy = r.ingredients.filter(function (i) { return D.staples.indexOf(i.key) === -1 && have.indexOf(i.key) === -1; });
      $("#shop-row").hidden = toBuy.length === 0;
      $("#shop-wa").href = "https://wa.me/?text=" + encodeURIComponent("Shopping list for " + r.name.toLowerCase() + " (" + plural(servings, "serving") + "): " + toBuy.map(function (i) { return fmt(i.qty) + (i.unit ? " " + i.unit : "") + " " + i.name; }).join(", "));
    }
    $("#serv-minus").addEventListener("click", function () { if (servings > 1) { servings--; drawIngredients(); } });
    $("#serv-plus").addEventListener("click", function () { if (servings < 6) { servings++; drawIngredients(); } });
    drawIngredients();

    $("#steps-preview").innerHTML = r.steps.map(function (s) { return "<li>" + esc(s.text) + "</li>"; }).join("");

    var reviews = load("reviews_" + r.id, D.seedReviews[r.id] || []);
    function drawReviews() {
      $("#review-list").innerHTML = reviews.length ? reviews.map(function (v) {
        return '<div class="review"><div class="review-head"><div class="who"><span class="avatar" aria-hidden="true">' + esc(v.name.charAt(0)) + "</span><div><b>" + esc(v.name) + '</b><div class="small muted">' + esc(v.detail) + "</div></div></div>" +
          '<div class="small"><span class="stars" aria-hidden="true">' + "★★★★★".slice(0, v.rating) + '</span><span class="visually-hidden">' + v.rating + " out of 5 stars</span> " + esc(v.date) + "</div></div><p style=\"margin:8px 0 0\">" + esc(v.text) + "</p></div>";
      }).join("") : '<p class="muted">No tips yet. Be the first to share one.</p>';
    }
    drawReviews();

    // star input
    var stars = $all('input[name="stars"]');
    function paintStars() { var v = 0; stars.forEach(function (s) { if (s.checked) v = +s.value; }); stars.forEach(function (s) { s.nextElementSibling.classList.toggle("on", +s.value <= v); }); }
    stars.forEach(function (s) { s.addEventListener("change", function () { paintStars(); $("#star-error").hidden = true; }); });
    $("#review-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = 0; stars.forEach(function (s) { if (s.checked) v = +s.value; });
      var txt = $("#review-text").value.trim();
      var err = $("#star-error");
      if (!v) { err.hidden = false; err.querySelector("span").textContent = "Please choose a star rating before posting. Tap a star from 1 to 5."; stars[0].focus(); return; }
      reviews.unshift({ name: "You", detail: "IIE student", rating: v, date: "Today", text: txt || "(No comment, just a rating)" });
      save("reviews_" + r.id, reviews); drawReviews();
      e.target.reset(); paintStars();
      toast("Thanks! Your review is posted");
    });

    // share
    $("#r-share").addEventListener("click", function () { openModal("share-modal"); });
    $("#share-title").textContent = "Share " + r.name;
    var link = "https://recipefinder.example/r/" + r.id;
    $("#share-link").value = link;
    $("#wa-share").href = "https://wa.me/?text=" + encodeURIComponent("Try this: " + r.name + " (" + r.time + " min, about " + rands(r.cost) + ") " + link);
    $("#copy-link").addEventListener("click", function () {
      try { navigator.clipboard.writeText(link); } catch (e) {}
      $("#copy-status").textContent = "Link copied. You can paste it in any chat.";
    });

    // cook together
    $("#r-together").addEventListener("click", function () { openModal("together-modal"); });
    function drawInvite() {
      var people = +$("#people").value, t = $("#cook-time").value;
      var each = rands(r.cost * people / people);
      $("#invite-preview").textContent = "Hey! I'm making " + r.name.toLowerCase() + " at " + t + " in the res kitchen. It's about " + each + " each if we cook for " + people + ". Bring what you have from the list and let's eat together.";
      $("#invite-wa").href = "https://wa.me/?text=" + encodeURIComponent($("#invite-preview").textContent);
    }
    $("#people").addEventListener("change", drawInvite); $("#cook-time").addEventListener("change", drawInvite); drawInvite();
  }

  /* =========================================================
     COOK MODE
     ========================================================= */
  function initCook() {
    var p = new URLSearchParams(location.search);
    var r = byId(p.get("id") || "egg-fried-rice") || D.recipes[0];
    var i = Math.min(+(p.get("step") || 1) - 1, r.steps.length);
    var timer = null, left = 0;
    document.title = "Cooking: " + r.name + " | Recipe Finder";
    $("#c-name").textContent = r.name;
    $("#c-back").href = "recipe.html?id=" + r.id;
    function fmt(s) { var m = Math.floor(s / 60), x = s % 60; return m + ":" + (x < 10 ? "0" : "") + x; }
    function stopTimer() { clearInterval(timer); timer = null; }
    function draw() {
      stopTimer();
      var box = $("#cook-box");
      if (i >= r.steps.length) { finish(); return; }
      var s = r.steps[i];
      $("#c-progress").style.width = ((i + 1) / r.steps.length * 100) + "%";
      $("#c-progress-text").textContent = "Step " + (i + 1) + " of " + r.steps.length;
      box.innerHTML = '<div class="step-card"><div class="step-num">Step ' + (i + 1) + " of " + r.steps.length + '</div><p class="step-text" id="step-text" tabindex="-1">' + esc(s.text) + "</p>" +
        (s.timer ? '<div class="timer"><span class="time" id="t-display" aria-live="off">' + fmt(s.timer * 60) + '</span><button class="btn btn-secondary" type="button" id="t-btn">' + icon("timer") + "Start " + s.timer + "-minute timer</button><span class=\"small muted\" id=\"t-status\" role=\"status\"></span></div>" : "") +
        '<div class="cook-nav"><button class="btn btn-ghost btn-lg" type="button" id="prev"' + (i === 0 ? " disabled" : "") + ">" + icon("arrow-left") + "Previous step</button>" +
        '<button class="btn btn-primary btn-lg" type="button" id="next">' + (i === r.steps.length - 1 ? "Finish cooking" + icon("check") : "Next step" + icon("arrow-right")) + "</button></div></div>";
      $("#prev").addEventListener("click", function () { if (i > 0) { i--; draw(); $("#step-text").focus(); } });
      $("#next").addEventListener("click", function () { i++; draw(); var t = $("#step-text"); if (t) t.focus(); });
      if (s.timer) {
        left = s.timer * 60;
        $("#t-btn").addEventListener("click", function () {
          if (timer) { stopTimer(); this.innerHTML = icon("timer") + "Resume timer"; $("#t-status").textContent = "Timer paused"; return; }
          var btn = this; btn.innerHTML = icon("timer") + "Pause timer"; $("#t-status").textContent = "Timer running. We'll tell you when it's done.";
          timer = setInterval(function () {
            left--; $("#t-display").textContent = fmt(Math.max(left, 0));
            if (left <= 0) { stopTimer(); $("#t-status").textContent = "Time's up! Move on when you're ready."; btn.innerHTML = icon("check") + "Done"; }
          }, 1000);
        });
      }
    }
    function finish() {
      var n = get("cooked") + 1; save("cooked", n);
      $("#c-progress").style.width = "100%";
      $("#c-progress-text").textContent = "All steps done";
      var colors = ["#A83A1D", "#2B6436", "#F2B33D", "#E07B39", "#6BA34A"], conf = "";
      for (var k = 0; k < 28; k++) conf += '<i style="left:' + (k * 3.6) + "%;background:" + colors[k % 5] + ";animation-delay:" + (k % 7) * 0.12 + 's"></i>';
      $("#cook-box").innerHTML = '<div class="step-card done"><div class="confetti" aria-hidden="true">' + conf + '</div><div class="big-check">' + icon("check", "big") + '</div>' +
        '<h1 tabindex="-1" id="done-h">You did it! Enjoy your ' + esc(r.name.toLowerCase()) + ".</h1>" +
        '<p class="muted">That\'s ' + plural(n, "meal") + " you've cooked with Recipe Finder this month.</p>" +
        '<div class="saved-money">' + icon("coin") + "About R" + (n * 45 - Math.round(n * r.cost)) + " less than buying takeaways for those meals</div>" +
        '<p>How did it go? Your tip could help another student.</p><div class="actions-row" style="justify-content:center"><a class="btn btn-primary" href="recipe.html?id=' + r.id + '#review-form">Rate and leave a tip</a><a class="btn btn-ghost" href="index.html">Find another recipe</a></div></div>';
      $("#done-h").focus();
    }
    draw();
  }

  /* =========================================================
     KITCHEN HELPER (conversing)
     ========================================================= */
  function initHelper() {
    var log = $("#chat-log"), form = $("#chat-form"), input = $("#chat-input");
    function add(who, html) {
      var d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    function mini(r) { return '<a class="mini-card" href="recipe.html?id=' + r.id + '"><img src="' + r.img + '" alt=""><span><b>' + esc(r.name) + '</b><br><span class="small muted">' + r.time + " min · " + rands(r.cost) + " · " + D.equipment[r.equipment[0]] + "</span></span></a>"; }
    function reply(text) {
      var t = text.toLowerCase(), list = [], say = "";
      if (/soy|substitut|instead|don.?t have|no /.test(t) && /soy/.test(t)) {
        say = "No soy sauce is fine. Use a little salt with a teaspoon of chutney or tomato sauce. It won't taste the same, but it still works. A few students mention this in the reviews too.";
      } else if (/kettle/.test(t)) { list = D.recipes.filter(function (r) { return r.equipment.indexOf("kettle") !== -1 || r.equipment.indexOf("none") !== -1; }); say = "With just a kettle you can make these:"; }
      else if (/microwave/.test(t)) { list = D.recipes.filter(function (r) { return r.equipment.indexOf("microwave") !== -1 || r.equipment.indexOf("none") !== -1; }); say = "These work with a microwave:"; }
      else if (/cheap|budget|money|broke|r\d+/.test(t)) { list = D.recipes.slice().sort(function (a, b) { return a.cost - b.cost; }).slice(0, 3); say = "Here are the cheapest ones right now, per serving:"; }
      else if (/quick|fast|minutes|class|late/.test(t)) { list = D.recipes.filter(function (r) { return r.time <= 10; }); say = "These take 10 minutes or less:"; }
      else if (/protein|egg|filling/.test(t)) { list = D.recipes.filter(function (r) { return r.ingredients.some(function (i) { return /egg|tuna|chicken|baked beans/.test(i.key); }); }).slice(0, 3); say = "For something more filling, try one of these. They have eggs, tuna, chicken or beans:"; }
      else { say = "I'm not sure I understood that. I can help with what to cook using a kettle or microwave, cheap meals, quick meals, or swapping an ingredient. You can also tap one of the suggestions below."; }
      var typing = document.createElement("div"); typing.className = "typing"; typing.textContent = "Kitchen Helper is typing..."; log.appendChild(typing);
      setTimeout(function () { typing.remove(); add("bot", "<p style=\"margin:0\">" + esc(say) + "</p>" + list.map(mini).join("")); }, 600);
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) { input.focus(); return; } add("user", esc(v)); input.value = ""; reply(v); });
    $all("[data-q]").forEach(function (b) { b.addEventListener("click", function () { add("user", esc(b.textContent)); reply(b.textContent); }); });
    // opening conversation so the screen is not empty
    add("bot", "<p style=\"margin:0\">Hi! Tell me what you have or what you can cook with, and I'll suggest something. For example: \"I only have a kettle and R15\".</p>");
    if (location.hash !== "#fresh") {
      add("user", "I only have a kettle and some noodles. What can I make?");
      var r = byId("kettle-noodles"), o = byId("overnight-oats");
      add("bot", "<p style=\"margin:0\">With a kettle and noodles, this one is a good fit. If you have frozen peas and cheese it gets a lot better:</p>" + mini(r) + "<p style=\"margin:10px 0 0\">For tomorrow's breakfast you could also try this. It needs no cooking at all:</p>" + mini(o));
      add("user", "I don't have soy sauce for the fried rice");
      add("bot", "<p style=\"margin:0\">No soy sauce is fine. Use a little salt with a teaspoon of chutney or tomato sauce. It won't taste the same, but it still works.</p>");
    }
  }

  /* =========================================================
     MY KITCHEN
     ========================================================= */
  function initKitchen() {
    var tabs = $all('[role="tab"]');
    function select(t) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
      try { history.replaceState(null, "", "#" + t.id.replace("tab-", "")); } catch (e) {}
    }
    tabs.forEach(function (t, n) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { var nt = tabs[(n + k + tabs.length) % tabs.length]; select(nt); nt.focus(); }
      });
    });
    var start = $("#tab-" + (location.hash.slice(1) || "pantry")); if (start) select(start);

    function drawPantry() {
      var pantry = get("pantry");
      $("#pantry-count").textContent = plural(pantry.length, "item");
      $("#pantry-list").innerHTML = pantry.length ? pantry.map(function (p, n) {
        var d = Math.round((Date.now() - p.added) / DAY), old = d >= 5;
        return "<li><b>" + esc(p.name) + '</b><span class="age' + (old ? " old" : "") + '">' + (old ? icon("alert") + " " : "") + daysAgo(p.added) + '</span><button class="icon-btn" type="button" data-pr="' + n + '" aria-label="Remove ' + esc(p.name) + ' from pantry">' + icon("trash") + "</button></li>";
      }).join("") : '<li style="grid-column:1/-1;justify-content:center" class="muted">Your pantry is empty. Add what you have so searches are quicker next time.</li>';
      $all("[data-pr]").forEach(function (b) {
        b.addEventListener("click", function () {
          var list = get("pantry"), n = +b.dataset.pr, item = list[n];
          list.splice(n, 1); save("pantry", list); drawPantry();
          toast(item.name + " removed from your pantry", function () { var l = get("pantry"); l.splice(n, 0, item); save("pantry", l); drawPantry(); });
        });
      });
      $("#clear-pantry").disabled = pantry.length === 0;
    }
    $("#pantry-add").addEventListener("submit", function (e) {
      e.preventDefault(); var v = norm($("#pantry-input").value); var err = $("#pantry-err");
      if (!v) { err.hidden = false; $("#pantry-input").setAttribute("aria-invalid", "true"); $("#pantry-input").focus(); return; }
      err.hidden = true; $("#pantry-input").removeAttribute("aria-invalid");
      var l = get("pantry"); if (!l.some(function (p) { return p.name === v; })) l.push({ name: v, added: Date.now() });
      save("pantry", l); $("#pantry-input").value = ""; drawPantry(); toast(v + " added to your pantry");
    });
    $("#clear-pantry").addEventListener("click", function () { openModal("confirm-modal"); });
    $("#confirm-clear").addEventListener("click", function () {
      var backup = get("pantry"); save("pantry", []); drawPantry(); closeModal($("#confirm-modal"));
      toast("Pantry cleared", function () { save("pantry", backup); drawPantry(); });
    });
    drawPantry();

    function drawSaved() {
      var s = get("saved").map(byId).filter(Boolean);
      $("#saved-grid").innerHTML = s.length ? s.map(function (r) { return card(r); }).join("") : '<p class="muted">Nothing saved yet. Tap Save on any recipe to keep it here.</p>';
      $all("[data-save]", $("#saved-grid")).forEach(function (b) {
        b.addEventListener("click", function (e) { e.preventDefault(); toggleSave(b.dataset.save, b); setTimeout(drawSaved, 50); });
      });
      var rc = get("recent").map(byId).filter(Boolean);
      $("#recent-grid").innerHTML = rc.map(function (r) { return card(r); }).join("");
      wireSaveButtons($("#recent-grid"));
    }
    var origToast = toast;
    drawSaved();
    $("#stat-cooked").textContent = get("cooked");
    $("#stat-saved").textContent = get("saved").length;
    $("#stat-pantry").textContent = get("pantry").length;
  }

  /* =========================================================
     SETTINGS
     ========================================================= */
  function initSettings() {
    var s = get("settings");
    $all('input[name="text"]').forEach(function (r) { r.checked = r.value === s.text; r.addEventListener("change", function () { s.text = r.value; commit("Text size changed to " + r.parentNode.textContent.trim().toLowerCase()); }); });
    [["contrast", "High contrast"], ["motion", "Reduce motion"]].forEach(function (pair) {
      var c = $("#" + pair[0]), st = $("#" + pair[0] + "-state");
      c.checked = !!s[pair[0]]; st.textContent = c.checked ? "On" : "Off";
      c.addEventListener("change", function () { s[pair[0]] = c.checked; st.textContent = c.checked ? "On" : "Off"; commit(pair[1] + (c.checked ? " turned on" : " turned off")); });
    });
    function commit(msg) { save("settings", s); applySettings(); toast(msg + ". Saved for every page."); }
    $("#show-hints").addEventListener("click", function () { save("hintDone", false); save("reminderDone", false); toast("Tips will show again on the Home page"); });
  }

  var page = document.body.dataset.page;
  ({ home: initHome, results: initResults, recipe: initRecipe, cook: initCook, helper: initHelper, kitchen: initKitchen, settings: initSettings }[page] || function () {})();
})();
