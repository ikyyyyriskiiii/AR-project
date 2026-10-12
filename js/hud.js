(function (root) {
  "use strict";

  var HEALTH = { ok: "#34d399", warn: "#f59e0b", crit: "#f43f5e" };
  var HEALTH_TEXT = { ok: "HEALTHY", warn: "WARNING", crit: "CRITICAL" };

  var audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try {
        audioCtx = new Ctx();
      } catch (err) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function beep(times) {
    var ctx = ensureAudio();
    if (!ctx) return;
    var start = ctx.currentTime;
    for (var i = 0; i < times; i += 1) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      var at = start + i * 0.24;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.07, at + 0.02);
      gain.gain.linearRampToValueAtTime(0, at + 0.17);
      osc.start(at);
      osc.stop(at + 0.19);
    }
  }

  function clockText() {
    return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function countsOf(snap) {
    if (snap.counts) return snap.counts;
    var counts = { ok: 0, warn: 0, crit: 0 };
    (snap.metrics || []).forEach(function (metric) {
      if (counts[metric.status] != null) counts[metric.status] += 1;
    });
    return counts;
  }

  function sparkPoints(values) {
    if (!values || values.length < 2) return "";
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    if (max - min < 1e-6) {
      min -= 1;
      max += 1;
    }
    var step = 100 / (values.length - 1);
    return values
      .map(function (v, i) {
        var y = 22 - ((v - min) / (max - min)) * 20;
        return (i * step).toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  }

  function buildMeta(metaEl, snap) {
    var counts = countsOf(snap);
    var need = counts.warn + counts.crit;
    metaEl.innerHTML =
      '<span class="tag">' + snap.category + "</span><br>" +
      snap.ident + "<br>" + snap.zone + "<br>" +
      "Kondisi: <b style=\"color:" + (HEALTH[snap.health] || HEALTH.ok) + "\">" +
      (HEALTH_TEXT[snap.health] || "-") + "</b>" +
      (need > 0
        ? ' &middot; <b style="color:' + HEALTH.warn + '">' + need + " perlu perhatian</b>"
        : "");
  }

  function buildRows(rowsEl, snap) {
    rowsEl.innerHTML = "";
    return snap.metrics.map(function (metric) {
      var row = document.createElement("div");
      row.className = "row";
      var spark = metric.static ? "" : '<svg class="spark" viewBox="0 0 100 24" preserveAspectRatio="none"><polyline points=""></polyline></svg>';
      var bar = metric.static ? "" : '<div class="track"><div class="fill"></div></div>';
      row.innerHTML =
        '<div class="top"><span class="label">' + metric.label + "</span>" +
        '<span class="value"><span class="v"></span> <span class="u"></span></span></div>' +
        spark + bar;
      rowsEl.appendChild(row);
      return row;
    });
  }

  function updateRows(rowEls, snap) {
    snap.metrics.forEach(function (metric, i) {
      var row = rowEls[i];
      if (!row) return;
      row.querySelector(".value").className = "value " + (metric.static ? "" : metric.status);
      row.querySelector(".u").textContent = metric.unit || "";
      var vEl = row.querySelector(".v");
      if (metric.static) {
        vEl.textContent = metric.display;
        return;
      }
      var arrow = metric.trend === "up" ? " \u25B2" : metric.trend === "down" ? " \u25BC" : "";
      vEl.textContent = metric.display + arrow;

      var fill = row.querySelector(".fill");
      if (fill) {
        fill.className = "fill " + metric.status;
        fill.style.width = (metric.pct != null ? metric.pct : 0) + "%";
      }
      var line = row.querySelector(".spark polyline");
      if (line) {
        line.setAttribute("points", sparkPoints(metric.history));
        line.style.stroke = HEALTH[metric.status] || "#22d3ee";
      }
    });
  }

  function buildRail(railEl, modules, onSelect, activeKey) {
    modules.forEach(function (mod) {
      var btn = document.createElement("button");
      btn.className = "mod";
      btn.dataset.key = mod.key;
      btn.innerHTML =
        (mod.icon ? '<span class="ico">' + mod.icon + "</span>" : "") +
        '<span class="name">' + mod.label + "</span>" +
        '<span class="badge"></span>';
      btn.addEventListener("click", function () {
        onSelect(mod.key);
      });
      railEl.appendChild(btn);
    });
    markRail(railEl, activeKey);
  }

  function markRail(railEl, activeKey) {
    Array.prototype.forEach.call(railEl.querySelectorAll(".mod"), function (btn) {
      btn.classList.toggle("active", btn.dataset.key === activeKey);
    });
  }

  function setRailHealth(railEl, state) {
    var modules = state && state.modules ? state.modules : {};
    Array.prototype.forEach.call(railEl.querySelectorAll(".mod"), function (btn) {
      var snap = modules[btn.dataset.key];
      if (snap) btn.dataset.health = snap.health;
    });
  }

  function setAlarmButton(btn, on) {
    btn.textContent = "Alarm: " + (on ? "ON" : "OFF");
    btn.classList.toggle("active", on);
  }

  function loadAlarm() {
    try {
      return localStorage.getItem("aritops.alarm") === "1";
    } catch (err) {
      return false;
    }
  }

  function saveAlarm(on) {
    try {
      localStorage.setItem("aritops.alarm", on ? "1" : "0");
    } catch (err) {
      /* ignore */
    }
  }

  root.ARITOPS = root.ARITOPS || {};
  root.ARITOPS.HUD = {
    HEALTH: HEALTH,
    HEALTH_TEXT: HEALTH_TEXT,
    clockText: clockText,
    countsOf: countsOf,
    sparkPoints: sparkPoints,
    buildMeta: buildMeta,
    buildRows: buildRows,
    updateRows: updateRows,
    buildRail: buildRail,
    markRail: markRail,
    setRailHealth: setRailHealth,
    setAlarmButton: setAlarmButton,
    loadAlarm: loadAlarm,
    saveAlarm: saveAlarm,
    ensureAudio: ensureAudio,
    beep: beep
  };
})(typeof self !== "undefined" ? self : this);
