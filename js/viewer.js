(function () {
  "use strict";

  var catalog = window.ARITOPS_CATALOG;
  var A = window.ARITOPS;
  if (!catalog || !A || !A.Simulator || !A.HUD) return;

  var HUD = A.HUD;
  var sim = new A.Simulator(catalog);
  A.sim = sim;
  A.state = sim.tickAndSnapshotAll();

  var current = "server";
  var groupFilter = "all";
  var source = "SIM";
  var alarmOn = false;
  var lastHealth = {};

  var els = {
    rail: document.getElementById("rail"),
    groupRail: document.getElementById("groupRail"),
    panel: document.getElementById("panel"),
    panelTitle: document.getElementById("panelTitle"),
    panelMeta: document.getElementById("panelMeta"),
    rows: document.getElementById("rows"),
    chipSource: document.getElementById("chipSource"),
    chipSourceText: document.getElementById("chipSourceText"),
    chipPerf: document.getElementById("chipPerf"),
    chipPerfText: document.getElementById("chipPerfText")
  };

  var scene = document.querySelector("a-scene");
  var rigEl = document.getElementById("rig");
  var rowEls = [];

  function modulesInGroup() {
    if (groupFilter === "all") return catalog.modules;
    return catalog.modules.filter(function (mod) { return mod.group === groupFilter; });
  }

  function buildGroupRail() {
    var defs = [{ key: "all", label: "Semua", icon: "\u2705" }].concat(catalog.groups);
    HUD.buildRail(els.groupRail, defs, function (key) {
      groupFilter = key;
      HUD.markRail(els.groupRail, key);
      rebuildRail();
    }, groupFilter);
  }

  function rebuildRail() {
    els.rail.innerHTML = "";
    HUD.buildRail(els.rail, modulesInGroup(), function (key) {
      selectModule(key);
    }, current);
    HUD.markRail(els.rail, current);
    HUD.setRailHealth(els.rail, A.state);
  }

  function selectModule(key) {
    current = key;
    var group = moduleOf(key).group;
    if (groupFilter !== "all" && group !== groupFilter) {
      groupFilter = group;
      HUD.markRail(els.groupRail, groupFilter);
      rebuildRail();
    } else {
      HUD.markRail(els.rail, key);
    }
    applySnapshot(true);
  }

  function moduleOf(key) {
    for (var i = 0; i < catalog.modules.length; i += 1) {
      if (catalog.modules[i].key === key) return catalog.modules[i];
    }
    return catalog.modules[0];
  }

  function rig() {
    return rigEl && rigEl.components["it-rig"] ? rigEl.components["it-rig"] : null;
  }

  function applySnapshot(forcePanel) {
    var snap = A.state.modules[current];
    if (!snap) return;

    els.chipSourceText.textContent = source === "LIVE" ? "LIVE BACKEND" : "LOCAL SIM";
    els.chipSource.className = "chip " + (source === "LIVE" ? "live" : "sim");

    var component = rig();
    if (component) {
      if (component.data.module !== current) component.setModule(current);
      component.setStatus(snap.health, snap.accent);
      component.redrawCard({ source: source, clock: HUD.clockText() });
    }

    HUD.setRailHealth(els.rail, A.state);

    var alertKey = "preview:" + current;
    if (snap.health === "crit" && lastHealth[alertKey] !== "crit" && alarmOn) HUD.beep(2);
    lastHealth[alertKey] = snap.health;

    if (forcePanel || !rowEls.length) {
      els.panelTitle.textContent = snap.icon + "  " + snap.label;
      HUD.buildMeta(els.panelMeta, snap);
      rowEls = HUD.buildRows(els.rows, snap);
    }
    HUD.updateRows(rowEls, snap);
  }

  function fetchLive() {
    fetch("api/state", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.modules) throw new Error("payload tidak valid");
        A.state = data;
        source = "LIVE";
      })
      .catch(function () {
        source = "SIM";
        A.state = sim.tickAndSnapshotAll();
      })
      .then(function () {
        applySnapshot();
      });
  }

  function setAlarm(on) {
    alarmOn = on;
    HUD.setAlarmButton(document.getElementById("btnAlarm"), on);
    if (on) {
      HUD.ensureAudio();
      HUD.beep(1);
    }
    HUD.saveAlarm(on);
  }

  function initRefs() {
    rigEl = document.getElementById("rig");
    var component = rig();
    if (component) component.setModule(current);
    applySnapshot(true);
  }

  document.getElementById("btnPanel").addEventListener("click", function () {
    els.panel.classList.toggle("open");
  });
  document.getElementById("btnClose").addEventListener("click", function () {
    els.panel.classList.remove("open");
  });
  document.getElementById("btnAlarm").addEventListener("click", function () {
    setAlarm(!alarmOn);
  });
  document.addEventListener("keydown", function (event) {
    var index = parseInt(event.key, 10);
    if (index >= 1 && index <= modulesInGroup().length) selectModule(modulesInGroup()[index - 1].key);
    if (event.key === "d" || event.key === "D") els.panel.classList.toggle("open");
    if (event.key === "a" || event.key === "A") setAlarm(!alarmOn);
  });

  var frames = 0;
  var lastFps = performance.now();
  function fpsLoop() {
    frames += 1;
    var now = performance.now();
    if (now - lastFps >= 1000) {
      els.chipPerfText.textContent = frames + " FPS";
      els.chipPerf.className = "chip " + (frames >= 24 ? "ok" : "warn");
      frames = 0;
      lastFps = now;
    }
    requestAnimationFrame(fpsLoop);
  }

  buildGroupRail();
  rebuildRail();
  els.panelTitle.textContent = A.state.modules[current].icon + "  " + A.state.modules[current].label;
  HUD.buildMeta(els.panelMeta, A.state.modules[current]);
  rowEls = HUD.buildRows(els.rows, A.state.modules[current]);
  applySnapshot();

  if (HUD.loadAlarm()) setAlarm(true);

  if (scene.hasLoaded) initRefs();
  else scene.addEventListener("loaded", initRefs);

  setInterval(function () {
    if (source === "LIVE") fetchLive();
    else {
      A.state = sim.tickAndSnapshotAll();
      applySnapshot();
    }
  }, 1500);

  setTimeout(fetchLive, 1500);
  requestAnimationFrame(fpsLoop);
})();
