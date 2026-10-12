(function (root, factory) {
  var engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  } else {
    root.ARITOPS = root.ARITOPS || {};
    root.ARITOPS.Simulator = engine.Simulator;
    root.ARITOPS.statusOf = engine.statusOf;
    root.ARITOPS.severity = engine.severity;
    root.ARITOPS.formatValue = engine.formatValue;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SEVERITY = { ok: 0, warn: 1, crit: 2 };
  var HISTORY_MAX = 48;

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function statusOf(value, field) {
    if (field.warn == null && field.crit == null) return "ok";
    if (field.invert) {
      if (field.crit != null && value <= field.crit) return "crit";
      if (field.warn != null && value <= field.warn) return "warn";
      return "ok";
    }
    if (field.crit != null && value >= field.crit) return "crit";
    if (field.warn != null && value >= field.warn) return "warn";
    return "ok";
  }

  function severity(status) {
    return SEVERITY[status] != null ? SEVERITY[status] : 0;
  }

  function formatValue(value, field) {
    var decimals = field.decimals || 0;
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  }

  function Simulator(catalog) {
    this.name = catalog.name;
    this.version = catalog.version;
    this.modules = catalog.modules;
    this.historyMax = HISTORY_MAX;
    this.state = {};
    var self = this;
    this.modules.forEach(function (mod) {
      var bucket = {};
      mod.fields.forEach(function (field) {
        if (field.value != null) return;
        var start = field.base + rand(-field.jitter, field.jitter) * 0.5;
        bucket[field.key] = { current: start, previous: null, history: [start] };
      });
      self.state[mod.key] = bucket;
    });
    for (var i = 0; i < HISTORY_MAX; i += 1) this.tick();
  }

  Simulator.prototype.tick = function () {
    var self = this;
    this.modules.forEach(function (mod) {
      var bucket = self.state[mod.key];
      mod.fields.forEach(function (field) {
        if (field.value != null) return;
        var cell = bucket[field.key];
        cell.previous = cell.current;
        cell.current += (field.base - cell.current) * 0.18 + rand(-field.jitter, field.jitter);
        if (field.min != null) cell.current = Math.max(field.min, cell.current);
        if (field.max != null) cell.current = Math.min(field.max, cell.current);
        cell.history.push(cell.current);
        if (cell.history.length > HISTORY_MAX) cell.history.shift();
      });
    });
  };

  Simulator.prototype.metric = function (field, bucket) {
    if (field.value != null) {
      return {
        key: field.key,
        label: field.label,
        display: field.value,
        static: true,
        status: "ok",
        pct: null,
        trend: "flat",
        history: null
      };
    }
    var cell = bucket[field.key];
    var value = cell.current;
    var pct = null;
    if (field.min != null && field.max != null && field.max !== field.min) {
      pct = Math.max(0, Math.min(100, ((value - field.min) / (field.max - field.min)) * 100));
    }
    var trend = "flat";
    if (cell.previous != null) {
      var delta = value - cell.previous;
      if (delta > 0.0005) trend = "up";
      else if (delta < -0.0005) trend = "down";
    }
    return {
      key: field.key,
      label: field.label,
      unit: field.unit || "",
      display: formatValue(value, field),
      static: false,
      status: statusOf(value, field),
      pct: pct,
      trend: trend,
      min: field.min,
      max: field.max,
      history: cell.history.slice()
    };
  };

  Simulator.prototype.healthOf = function (metrics) {
    var worst = "ok";
    metrics.forEach(function (metric) {
      if (severity(metric.status) > severity(worst)) worst = metric.status;
    });
    return worst;
  };

  Simulator.prototype.countByStatus = function (metrics) {
    var counts = { ok: 0, warn: 0, crit: 0 };
    metrics.forEach(function (metric) {
      if (counts[metric.status] != null) counts[metric.status] += 1;
    });
    return counts;
  };

  Simulator.prototype.snapshot = function (key) {
    var mod = null;
    for (var i = 0; i < this.modules.length; i += 1) {
      if (this.modules[i].key === key) mod = this.modules[i];
    }
    if (!mod) return null;
    var bucket = this.state[mod.key];
    var self = this;
    var metrics = mod.fields.map(function (field) {
      return self.metric(field, bucket);
    });
    return {
      key: mod.key,
      label: mod.label,
      icon: mod.icon,
      accent: mod.accent,
      category: mod.category,
      zone: mod.zone,
      ident: mod.ident,
      metrics: metrics,
      health: self.healthOf(metrics),
      counts: self.countByStatus(metrics)
    };
  };

  Simulator.prototype.snapshotAll = function () {
    var self = this;
    var out = {};
    this.modules.forEach(function (mod) {
      out[mod.key] = self.snapshot(mod.key);
    });
    return { ts: Date.now(), modules: out };
  };

  Simulator.prototype.tickAndSnapshotAll = function () {
    this.tick();
    return this.snapshotAll();
  };

  return {
    Simulator: Simulator,
    statusOf: statusOf,
    severity: severity,
    formatValue: formatValue,
    HISTORY_MAX: HISTORY_MAX
  };
});
