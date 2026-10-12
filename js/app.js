(function () {
  "use strict";

  var catalog = window.ARITOPS_CATALOG;
  var A = window.ARITOPS;
  if (!catalog || !A || !A.Simulator || !A.HUD) return;

  var HUD = A.HUD;
  var sim = new A.Simulator(catalog);
  A.sim = sim;
  A.state = sim.tickAndSnapshotAll();

  var order = catalog.modules.map(function (m) { return m.key; });
  var source = "SIM";
  var activeSlot = "A";
  var groupFilter = "all";
  var alarmOn = false;
  var lastHealth = {};

  var slots = {
    A: { module: "server", found: false, rig: null, chip: null, chipText: null },
    B: { module: "laptop", found: false, rig: null, chip: null, chipText: null }
  };
  var slotOrder = ["A", "B"];

  var els = {
    rail: document.getElementById("rail"),
    groupRail: document.getElementById("groupRail"),
    slotSeg: document.getElementById("slotSeg"),
    panel: document.getElementById("panel"),
    panelTitle: document.getElementById("panelTitle"),
    panelMeta: document.getElementById("panelMeta"),
    rows: document.getElementById("rows"),
    hint: document.getElementById("hint"),
    overlay: document.getElementById("overlay"),
    overlayWhy: document.getElementById("overlayWhy"),
    chipSource: document.getElementById("chipSource"),
    chipSourceText: document.getElementById("chipSourceText"),
    chipPerf: document.getElementById("chipPerf"),
    chipPerfText: document.getElementById("chipPerfText")
  };

  var scene = document.querySelector("a-scene");
  var rowEls = [];

  slotOrder.forEach(function (key) {
    slots[key].chip = document.getElementById("chip" + key);
    slots[key].chipText = document.getElementById("chip" + key + "Text");
  });

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
    HUD.markRail(els.groupRail, groupFilter);
  }

  function rebuildRail() {
    els.rail.innerHTML = "";
    HUD.buildRail(els.rail, modulesInGroup(), function (key) {
      selectModule(key);
    }, slots[activeSlot].module);
    HUD.markRail(els.rail, slots[activeSlot].module);
    HUD.setRailHealth(els.rail, A.state);
  }

  function setActiveSlot(slotKey) {
    activeSlot = slotKey;
    Array.prototype.forEach.call(els.slotSeg.querySelectorAll("button"), function (btn) {
      btn.classList.toggle("active", btn.dataset.slot === slotKey);
    });
    rebuildRail();
    applySnapshot(true);
  }

  function selectModule(moduleKey) {
    if (order.indexOf(moduleKey) === -1) return;
    slots[activeSlot].module = moduleKey;
    var group = moduleOf(moduleKey).group;
    if (groupFilter !== "all" && group !== groupFilter) {
      groupFilter = group;
      HUD.markRail(els.groupRail, groupFilter);
      rebuildRail();
    } else {
      HUD.markRail(els.rail, moduleKey);
    }
    applySnapshot(true);
  }

  function moduleOf(key) {
    for (var i = 0; i < catalog.modules.length; i += 1) {
      if (catalog.modules[i].key === key) return catalog.modules[i];
    }
    return catalog.modules[0];
  }

  function snapshotFor(slotKey) {
    return A.state.modules[slots[slotKey].module] || null;
  }

  function rigOf(slotKey) {
    var entity = slots[slotKey].rig;
    return entity && entity.components["it-rig"] ? entity.components["it-rig"] : null;
  }

  function applySnapshot(forcePanel) {
    els.chipSourceText.textContent = source === "LIVE" ? "LIVE BACKEND" : "LOCAL SIM";
    els.chipSource.className = "chip " + (source === "LIVE" ? "live" : "sim");

    slotOrder.forEach(function (slotKey) {
      var slot = slots[slotKey];
      var snap = snapshotFor(slotKey);
      if (!snap) return;

      var rig = rigOf(slotKey);
      if (rig) {
        if (rig.data.module !== slot.module) rig.setModule(slot.module);
        rig.setStatus(snap.health, snap.accent);
        rig.redrawCard({ source: source, clock: HUD.clockText() });
      }

      if (!slot.found) {
        slot.chip.className = "chip";
        slot.chipText.textContent = "RAK " + slotKey + ": tidak terlihat";
      } else {
        slot.chip.className = "chip " + snap.health;
        slot.chipText.textContent = "RAK " + slotKey + ": " + (HUD.HEALTH_TEXT[snap.health] || "-");
      }

      var alertKey = slotKey + ":" + slot.module;
      if (snap.health === "crit" && lastHealth[alertKey] !== "crit" && alarmOn) HUD.beep(2);
      lastHealth[alertKey] = snap.health;
    });

    HUD.setRailHealth(els.rail, A.state);

    var activeSnap = snapshotFor(activeSlot);
    if (activeSnap) {
      if (forcePanel || !rowEls.length) {
        els.panelTitle.textContent = activeSnap.icon + "  " + activeSnap.label;
        HUD.buildMeta(els.panelMeta, activeSnap);
        rowEls = HUD.buildRows(els.rows, activeSnap);
      }
      HUD.updateRows(rowEls, activeSnap);
    }
  }

  function localTick() {
    A.state = sim.tickAndSnapshotAll();
  }

  function fetchLive() {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 2500);
    fetch("api/state", { cache: "no-store", signal: controller ? controller.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        clearTimeout(timer);
        if (!data || !data.modules) throw new Error("payload tidak valid");
        A.state = data;
        source = "LIVE";
      })
      .catch(function () {
        clearTimeout(timer);
        source = "SIM";
        localTick();
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

  function initSceneRefs() {
    slotOrder.forEach(function (slotKey) {
      slots[slotKey].rig = document.getElementById("rig" + slotKey);
      var rig = rigOf(slotKey);
      if (rig) rig.setModule(slots[slotKey].module);
    });
    applySnapshot(true);
  }

  function showOverlay(message) {
    els.overlayWhy.textContent = message;
    els.overlay.classList.add("show");
  }

  function checkCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showOverlay("Perangkat atau browser ini tidak mendukung akses kamera.");
      return;
    }
    var isSecure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!isSecure) {
      showOverlay("Halaman dibuka pada " + location.protocol + "//" + location.host + " \u2014 kamera hanya diizinkan pada HTTPS atau localhost.");
      return;
    }
    setTimeout(function () {
      var video = document.querySelector("video");
      if (!video || video.readyState < 2) {
        showOverlay("Kamera belum aktif. Izinkan akses kamera ketika browser meminta.");
      }
    }, 9000);
  }

  function bindMarkers() {
    slotOrder.forEach(function (slotKey) {
      var marker = document.getElementById("marker" + slotKey);
      if (!marker) return;
      marker.addEventListener("markerFound", function () {
        slots[slotKey].found = true;
        els.hint.classList.add("hidden");
        setActiveSlot(slotKey);
      });
      marker.addEventListener("markerLost", function () {
        slots[slotKey].found = false;
        var anyFound = slotOrder.some(function (k) { return slots[k].found; });
        if (!anyFound) els.hint.classList.remove("hidden");
        applySnapshot();
      });
    });
  }

  function bindUi() {
    document.getElementById("btnPanel").addEventListener("click", function () {
      els.panel.classList.toggle("open");
    });
    document.getElementById("btnClose").addEventListener("click", function () {
      els.panel.classList.remove("open");
    });
    document.getElementById("btnAlarm").addEventListener("click", function () {
      setAlarm(!alarmOn);
    });
    Array.prototype.forEach.call(els.slotSeg.querySelectorAll("button"), function (btn) {
      btn.addEventListener("click", function () { setActiveSlot(btn.dataset.slot); });
    });
    document.addEventListener("keydown", function (event) {
      var index = parseInt(event.key, 10);
      if (index >= 1 && index <= modulesInGroup().length) selectModule(modulesInGroup()[index - 1].key);
      if (event.key === "d" || event.key === "D") els.panel.classList.toggle("open");
      if (event.key === "a" || event.key === "A") setAlarm(!alarmOn);
      if (event.key === "x" || event.key === "X") setActiveSlot(activeSlot === "A" ? "B" : "A");
    });
  }

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
  bindUi();
  bindMarkers();
  els.panelTitle.textContent = A.state.modules[slots[activeSlot].module].icon + "  " + A.state.modules[slots[activeSlot].module].label;
  HUD.buildMeta(els.panelMeta, A.state.modules[slots[activeSlot].module]);
  rowEls = HUD.buildRows(els.rows, A.state.modules[slots[activeSlot].module]);
  applySnapshot();

  if (HUD.loadAlarm()) setAlarm(true);

  if (scene.hasLoaded) initSceneRefs();
  else scene.addEventListener("loaded", initSceneRefs);

  setTimeout(checkCamera, 1200);
  setTimeout(fetchLive, 1500);

  setInterval(function () {
    if (source === "LIVE") fetchLive();
    else {
      localTick();
      applySnapshot();
    }
  }, 1500);

  setInterval(function () {
    if (source !== "LIVE") fetchLive();
  }, 6000);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) applySnapshot();
  });

  requestAnimationFrame(fpsLoop);
})();
