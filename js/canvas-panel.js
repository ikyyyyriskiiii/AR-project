(function (root) {
  "use strict";

  var CARD_W = 1200;
  var CARD_H = 800;
  var PAD = 36;
  var COLORS = {
    ok: "#34d399",
    warn: "#f59e0b",
    crit: "#f43f5e",
    text: "#e2e8f0",
    muted: "#94a3b8",
    faint: "#64748b",
    track: "#1e293b",
    tile: "#0f1b2e",
    border: "rgba(148,163,184,0.16)"
  };
  var HEALTH_LABEL = { ok: "HEALTHY", warn: "WARNING", crit: "CRITICAL" };

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, fill) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function strokeRound(ctx, x, y, w, h, r, stroke, width) {
    roundRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width || 1;
    ctx.stroke();
  }

  function hexAlpha(hex, alpha) {
    var value = String(hex).replace("#", "");
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    var num = parseInt(value, 16);
    if (isNaN(num)) return "rgba(148,163,184," + alpha + ")";
    return "rgba(" + ((num >> 16) & 255) + "," + ((num >> 8) & 255) + "," + (num & 255) + "," + alpha + ")";
  }

  function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    var out = text;
    while (out.length > 1 && ctx.measureText(out + "\u2026").width > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + "\u2026";
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text).split(" ");
    var lines = [];
    var line = "";
    for (var i = 0; i < words.length; i += 1) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawSparkline(ctx, x, y, w, h, values, color) {
    if (!values || values.length < 2) return;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    if (max - min < 1e-6) {
      min -= 1;
      max += 1;
    }
    var pad = (max - min) * 0.18;
    min -= pad;
    max += pad;

    var stepX = w / (values.length - 1);
    function px(i) { return x + i * stepX; }
    function py(v) { return y + h - ((v - min) / (max - min)) * h; }

    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    for (var i = 1; i < values.length; i += 1) ctx.lineTo(px(i), py(values[i]));
    ctx.lineTo(px(values.length - 1), y + h);
    ctx.lineTo(px(0), y + h);
    ctx.closePath();
    ctx.fillStyle = hexAlpha(color, 0.15);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    for (i = 1; i < values.length; i += 1) ctx.lineTo(px(i), py(values[i]));
    ctx.strokeStyle = hexAlpha(color, 0.85);
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    var lastX = px(values.length - 1);
    var lastY = py(values[values.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function selectTiles(metrics) {
    var numeric = metrics.filter(function (m) { return !m.static; });
    var statics = metrics.filter(function (m) { return m.static; });
    var tiles = numeric.slice(0, 4).concat(statics.slice(0, 2));
    var pool = numeric.slice(4).concat(statics.slice(2));
    var i = 0;
    while (tiles.length < 6 && i < pool.length) {
      tiles.push(pool[i]);
      i += 1;
    }
    return tiles.slice(0, 6);
  }

  var TILE_H = 166;
  var TILE_GAP_Y = 16;
  var TILE_TOP = 218;

  function drawTile(ctx, x, y, w, h, metric) {
    var accent = COLORS[metric.status] || COLORS.ok;
    fillRound(ctx, x, y, w, h, 16, COLORS.tile);
    strokeRound(ctx, x, y, w, h, 16, metric.static ? COLORS.border : hexAlpha(accent, 0.28), 2);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = COLORS.muted;
    ctx.font = "600 24px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, metric.label.toUpperCase(), w - 88), x + 22, y + 34);

    var arrow = metric.trend === "up" ? "\u25B2" : metric.trend === "down" ? "\u25BC" : "\u2013";
    if (!metric.static) {
      ctx.textAlign = "right";
      ctx.fillStyle = metric.trend === "flat" ? COLORS.faint : COLORS.muted;
      ctx.font = "600 22px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(arrow, x + w - 22, y + 34);
      ctx.textAlign = "left";
    }

    if (metric.static) {
      ctx.fillStyle = COLORS.text;
      ctx.font = "700 32px 'Segoe UI', system-ui, sans-serif";
      var lines = wrapText(ctx, metric.display, w - 44);
      for (var i = 0; i < lines.length && i < 3; i += 1) {
        ctx.fillText(lines[i], x + 22, y + 84 + i * 40);
      }
      return;
    }

    ctx.fillStyle = metric.status === "ok" ? COLORS.text : accent;
    ctx.font = "700 46px 'Segoe UI', system-ui, sans-serif";
    var valueWidth = ctx.measureText(metric.display).width;
    ctx.fillText(metric.display, x + 22, y + 88);
    if (metric.unit) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "600 24px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(" " + metric.unit, x + 22 + valueWidth + 8, y + 88);
    }

    drawSparkline(ctx, x + 22, y + 100, w - 44, 38, metric.history, accent);

    var barX = x + 22;
    var barY = y + 148;
    var barW = w - 44;
    fillRound(ctx, barX, barY, barW, 8, 4, COLORS.track);
    if (metric.pct != null) {
      fillRound(ctx, barX, barY, Math.max(8, (barW * metric.pct) / 100), 8, 4, accent);
    }
  }

  function drawCard(ctx, W, H, snapshot, opts) {
    opts = opts || {};
    ctx.clearRect(0, 0, W, H);

    var gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#0c1830");
    gradient.addColorStop(1, "#070f1e");
    fillRound(ctx, 0, 0, W, H, 28, gradient);

    var alertColor = null;
    if (snapshot) {
      var counts = snapshot.counts;
      if (!counts) {
        counts = { warn: 0, crit: 0 };
        (snapshot.metrics || []).forEach(function (m) {
          if (m.status === "crit") counts.crit += 1;
          else if (m.status === "warn") counts.warn += 1;
        });
      }
      if (counts.crit > 0) alertColor = COLORS.crit;
      else if (counts.warn > 0) alertColor = COLORS.warn;
    }

    if (alertColor) {
      strokeRound(ctx, 1.5, 1.5, W - 3, H - 3, 28, hexAlpha(alertColor, 0.75), 4);
      strokeRound(ctx, 8, 8, W - 16, H - 16, 22, hexAlpha(alertColor, 0.18), 10);
    } else {
      strokeRound(ctx, 1, 1, W - 2, H - 2, 28, "rgba(148,163,184,0.22)", 3);
    }

    if (!snapshot) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = "600 40px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Menunggu data\u2026", W / 2, H / 2);
      ctx.textAlign = "left";
      return;
    }

    var accent = snapshot.accent || "#22d3ee";
    var health = snapshot.health || "ok";
    var healthColor = COLORS[health] || COLORS.ok;

    var strip = ctx.createLinearGradient(0, PAD, 0, PAD + 166);
    strip.addColorStop(0, accent);
    strip.addColorStop(1, hexAlpha(accent, 0.15));
    fillRound(ctx, PAD, PAD, 10, 166, 5, strip);

    var cx = PAD + 18 + 52;
    var cy = PAD + 18 + 52;
    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(accent, 0.16);
    ctx.fill();
    ctx.strokeStyle = hexAlpha(accent, 0.5);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "52px 'Segoe UI Emoji', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(snapshot.icon || "\u2699\uFE0F", cx, cy + 2);

    var textX = PAD + 18 + 120;
    var textMax = W - textX - 330;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 46px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, snapshot.label, textMax), textX, PAD + 54);
    ctx.fillStyle = COLORS.muted;
    ctx.font = "600 26px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, snapshot.ident, textMax), textX, PAD + 96);
    ctx.fillStyle = COLORS.faint;
    ctx.font = "500 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(fitText(ctx, snapshot.zone, textMax), textX, PAD + 134);

    var pillW = 210;
    var pillX = W - PAD - pillW;
    var pillY = PAD + 14;
    fillRound(ctx, pillX, pillY, pillW, 56, 28, hexAlpha(healthColor, 0.18));
    strokeRound(ctx, pillX, pillY, pillW, 56, 28, hexAlpha(healthColor, 0.7), 2);
    ctx.beginPath();
    ctx.arc(pillX + 34, pillY + 28, 9, 0, Math.PI * 2);
    ctx.fillStyle = healthColor;
    ctx.fill();
    ctx.fillStyle = healthColor;
    ctx.font = "700 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(HEALTH_LABEL[health] || "UNKNOWN", pillX + 56, pillY + 36);

    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.faint;
    ctx.font = "600 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(snapshot.category || "", W - PAD, PAD + 110);

    if (alertColor) {
      var need = (snapshot.counts ? snapshot.counts.warn : 0) + (snapshot.counts ? snapshot.counts.crit : 0);
      ctx.fillStyle = alertColor;
      ctx.font = "700 22px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText("\u26A0 " + need + " metrik perlu perhatian", W - PAD, PAD + 152);
    }
    ctx.textAlign = "left";

    ctx.strokeStyle = "rgba(148,163,184,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD, 208);
    ctx.lineTo(W - PAD, 208);
    ctx.stroke();

    var tiles = selectTiles(snapshot.metrics || []);
    var gapX = 24;
    var tileW = (W - PAD * 2 - gapX) / 2;
    for (var i = 0; i < tiles.length; i += 1) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      drawTile(ctx, PAD + col * (tileW + gapX), TILE_TOP + row * (TILE_H + TILE_GAP_Y), tileW, TILE_H, tiles[i]);
    }

    ctx.fillStyle = COLORS.faint;
    ctx.font = "600 22px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("AR-ITOps \u2022 Augmented Reality IT Infrastructure Monitoring", PAD, 786);

    var source = opts.source || "SIM";
    ctx.textAlign = "right";
    ctx.fillStyle = source === "LIVE" ? COLORS.ok : COLORS.warn;
    ctx.fillText(source === "LIVE" ? "\u25CF LIVE BACKEND" : "\u25CF LOCAL SIM", W - PAD - 180, 786);
    ctx.fillStyle = COLORS.faint;
    ctx.fillText(opts.clock || "", W - PAD, 786);
    ctx.textAlign = "left";
  }

  root.ARITOPS = root.ARITOPS || {};
  root.ARITOPS.drawCard = drawCard;
  root.ARITOPS.CARD_W = CARD_W;
  root.ARITOPS.CARD_H = CARD_H;

  if (typeof AFRAME !== "undefined") {
    AFRAME.registerComponent("datacard", {
      schema: { module: { type: "string", default: "server" } },
      init: function () {
        var el = this.el;
        var self = this;
        this.canvas = document.createElement("canvas");
        this.canvas.width = CARD_W;
        this.canvas.height = CARD_H;
        this.ctx = this.canvas.getContext("2d");
        this.texture = new THREE.CanvasTexture(this.canvas);
        if (THREE.SRGBColorSpace != null) this.texture.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding != null) this.texture.encoding = THREE.sRGBEncoding;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;
        this.opts = { source: "SIM", clock: "" };
        this.applyTexture = function () {
          var mesh = el.getObject3D("mesh");
          if (!mesh || !mesh.material) return;
          mesh.material.map = self.texture;
          mesh.material.transparent = true;
          mesh.material.needsUpdate = true;
        };
        el.addEventListener("object3dset", this.applyTexture);
        el.addEventListener("loaded", this.applyTexture);
        this.redraw();
      },
      redraw: function () {
        var snap = null;
        var state = root.ARITOPS.state;
        if (state && state.modules) snap = state.modules[this.data.module];
        if (!snap && root.ARITOPS.sim) snap = root.ARITOPS.sim.snapshot(this.data.module);
        drawCard(this.ctx, CARD_W, CARD_H, snap, this.opts);
        this.texture.needsUpdate = true;
        this.applyTexture();
      },
      update: function (oldData) {
        if (oldData && oldData.module !== this.data.module) this.redraw();
      },
      play: function () {
        this.redraw();
      }
    });
  }
})(typeof self !== "undefined" ? self : this);
