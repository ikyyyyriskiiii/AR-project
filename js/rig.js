(function () {
  "use strict";

  if (typeof AFRAME === "undefined") return;

  var STATUS_COLOR = { ok: "#34d399", warn: "#f59e0b", crit: "#f43f5e" };
  var CARD_W = 1.7;
  var CARD_H = 1.1333;
  var CARD_Y = 1.2655;
  var CHASSIS_MAT = "metalness: 0.25; roughness: 0.55; opacity: 0.85; transparent: true";
  var FLAT = "shader: flat; opacity: 0.95; transparent: true";

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] != null) node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function box(parent, w, h, d, x, y, z, cls, color, material) {
    parent.appendChild(el("a-box", {
      width: w,
      height: h,
      depth: d,
      position: x + " " + y + " " + z,
      class: cls || null,
      material: "color: " + color + "; " + (material || FLAT)
    }));
  }

  function cyl(parent, radius, height, x, y, z, cls, color, material) {
    parent.appendChild(el("a-cylinder", {
      radius: radius,
      height: height,
      position: x + " " + y + " " + z,
      class: cls || null,
      material: "color: " + color + "; " + (material || FLAT)
    }));
  }

  function sphere(parent, radius, x, y, z, cls, color, material) {
    parent.appendChild(el("a-sphere", {
      radius: radius,
      position: x + " " + y + " " + z,
      class: cls || null,
      material: "color: " + color + "; " + (material || FLAT)
    }));
  }

  function ring(parent, inner, outer, rot, cls, color) {
    parent.appendChild(el("a-entity", {
      geometry: "primitive: ring; radiusInner: " + inner + "; radiusOuter: " + outer + "; segmentsTubular: 64",
      rotation: rot,
      class: cls || null,
      material: "color: " + color + "; shader: flat; opacity: 0.8; transparent: true"
    }));
  }

  var SHAPES = {
    server: function (g, accent, status) {
      box(g, 0.4, 0.42, 0.32, 0, 0, 0, "chassis", accent, CHASSIS_MAT);
      [-0.13, 0, 0.13].forEach(function (y) { box(g, 0.3, 0.07, 0.03, 0, y, 0.17, "led", status); });
      box(g, 0.44, 0.03, 0.36, 0, 0.225, 0, null, "#e2e8f0", "shader: flat; opacity: 0.5; transparent: true");
      box(g, 0.44, 0.02, 0.36, 0, -0.222, 0, null, "#020617", "shader: flat; opacity: 0.8; transparent: true");
    },
    router: function (g, accent, status) {
      box(g, 0.62, 0.11, 0.34, 0, -0.05, 0, "chassis", accent, CHASSIS_MAT);
      [-0.22, -0.07, 0.07, 0.22].forEach(function (x) {
        cyl(g, 0.012, 0.3, x, 0.15, -0.1, null, "#e2e8f0", "shader: flat; opacity: 0.45; transparent: true");
      });
      [-0.18, -0.06, 0.06, 0.18].forEach(function (x) { box(g, 0.04, 0.02, 0.02, x, 0.02, 0.17, "led", status); });
      box(g, 0.5, 0.02, 0.2, 0, -0.12, 0, null, "#020617", "shader: flat; opacity: 0.8; transparent: true");
    },
    storage: function (g, accent, status) {
      box(g, 0.44, 0.46, 0.34, 0, 0, 0, "chassis", accent, CHASSIS_MAT);
      for (var i = 0; i < 5; i += 1) {
        var y = -0.16 + i * 0.08;
        box(g, 0.38, 0.055, 0.03, 0, y, 0.175, null, "#0f172a");
        box(g, 0.03, 0.03, 0.02, 0.16, y, 0.19, "led", status);
      }
    },
    iot: function (g, accent, status) {
      cyl(g, 0.14, 0.09, 0, -0.12, 0, "chassis", accent, CHASSIS_MAT);
      sphere(g, 0.09, 0, -0.02, 0, "led", status, "shader: flat; opacity: 0.55; transparent: true");
      cyl(g, 0.009, 0.26, 0.09, 0.1, 0, null, "#e2e8f0", "shader: flat; opacity: 0.45; transparent: true");
      sphere(g, 0.022, 0.09, 0.24, 0, "led", status);
      box(g, 0.05, 0.012, 0.012, -0.05, -0.14, 0.135, "led", status);
    },
    database: function (g, accent, status) {
      [-0.14, 0, 0.14].forEach(function (y) {
        cyl(g, 0.17, 0.11, 0, y, 0, "chassis", accent, CHASSIS_MAT);
        box(g, 0.06, 0.02, 0.02, 0.11, y, 0.15, "led", status);
      });
      cyl(g, 0.175, 0.02, 0, -0.21, 0, null, "#020617", "shader: flat; opacity: 0.8; transparent: true");
    },
    power: function (g, accent, status) {
      box(g, 0.36, 0.42, 0.3, 0, 0, 0, "chassis", accent, CHASSIS_MAT);
      box(g, 0.1, 0.28, 0.02, -0.08, 0, 0.16, "led", status);
      [0, 0.05, 0.1].forEach(function (y) { box(g, 0.06, 0.025, 0.02, 0.09, y, 0.16, "led", status); });
      box(g, 0.44, 0.03, 0.34, 0, 0.225, 0, null, "#e2e8f0", "shader: flat; opacity: 0.5; transparent: true");
    },
    workstation: function (g, accent, status) {
      box(g, 0.44, 0.28, 0.03, 0, 0.08, 0, "chassis", accent, CHASSIS_MAT);
      box(g, 0.38, 0.22, 0.01, 0, 0.08, 0.02, "led", status, "shader: flat; opacity: 0.85; transparent: true");
      box(g, 0.05, 0.12, 0.05, 0, -0.08, 0, null, "#94a3b8");
      box(g, 0.24, 0.02, 0.14, 0, -0.15, 0.02, null, "#94a3b8");
    },
    overview: function (g, accent, status) {
      sphere(g, 0.17, 0, 0, 0, "chassis", accent, "shader: flat; opacity: 0.32; transparent: true");
      sphere(g, 0.175, 0, 0, 0, null, accent, "wireframe: true; shader: flat; opacity: 0.45; transparent: true");
      ring(g, 0.22, 0.235, "0 0 0", "led", status);
      ring(g, 0.24, 0.252, "90 0 0", "led", status);
      sphere(g, 0.03, 0.26, 0.06, 0, "led", status);
      sphere(g, 0.026, -0.2, -0.14, 0.1, "led", status);
    },
    laptop: function (g, accent, status) {
      box(g, 0.5, 0.02, 0.34, 0, -0.14, 0.02, "chassis", accent, CHASSIS_MAT);
      [-0.2, -0.24, -0.28].forEach(function (y, i) {
        box(g, 0.48, 0.004, 0.02, 0, -0.13, -0.1 + i * 0.06, null, "#1e293b");
      });
      box(g, 0.5, 0.32, 0.02, 0, 0.03, -0.15, "chassis", accent, CHASSIS_MAT);
      box(g, 0.45, 0.27, 0.008, 0, 0.03, -0.135, "led", status, "shader: flat; opacity: 0.8; transparent: true");
      cyl(g, 0.02, 0.02, 0.2, -0.1, 0.05, "led", status);
    },
    phone: function (g, accent, status) {
      box(g, 0.22, 0.46, 0.03, 0, 0, 0, "chassis", accent, CHASSIS_MAT);
      box(g, 0.19, 0.4, 0.008, 0, 0, 0.02, "led", status, "shader: flat; opacity: 0.8; transparent: true");
      box(g, 0.07, 0.012, 0.006, 0, 0.21, 0.022, null, "#0b1220");
      cyl(g, 0.012, 0.012, 0, -0.24, 0, null, "#64748b");
    },
    tablet: function (g, accent, status) {
      box(g, 0.36, 0.48, 0.025, 0, 0, 0, "chassis", accent, CHASSIS_MAT);
      box(g, 0.32, 0.43, 0.008, 0, 0, 0.017, "led", status, "shader: flat; opacity: 0.8; transparent: true");
      cyl(g, 0.012, 0.012, 0, 0.21, 0.019, null, "#64748b");
    },
    printer: function (g, accent, status) {
      box(g, 0.46, 0.24, 0.36, 0, -0.06, 0, "chassis", accent, CHASSIS_MAT);
      box(g, 0.42, 0.14, 0.3, 0, 0.13, -0.02, "chassis", accent, CHASSIS_MAT);
      box(g, 0.34, 0.05, 0.02, 0, -0.07, 0.18, null, "#0f172a");
      box(g, 0.3, 0.05, 0.02, 0.06, -0.07, 0.185, "led", status);
      box(g, 0.3, 0.2, 0.008, 0.16, 0.05, 0.16, null, "#e2e8f0", "shader: flat; opacity: 0.85; transparent: true");
      box(g, 0.3, 0.2, 0.008, 0.16, 0.05, 0.17, "led", status, "shader: flat; opacity: 0.25; transparent: true");
    },
    cctv: function (g, accent, status) {
      box(g, 0.1, 0.06, 0.1, -0.18, 0.18, 0, null, "#94a3b8");
      cyl(g, 0.03, 0.22, -0.13, 0.08, 0, null, "#94a3b8", "shader: flat; opacity: 0.9; transparent: true");
      cyl(g, 0.11, 0.4, 0.08, -0.06, 0, "chassis", accent, CHASSIS_MAT);
      sphere(g, 0.085, 0.3, -0.06, 0, "led", status, "shader: flat; opacity: 0.75; transparent: true");
      ring(g, 0.09, 0.11, "0 90 0", "led", status);
      box(g, 0.06, 0.01, 0.06, -0.1, -0.06, 0, "led", status);
    },
    ap: function (g, accent, status) {
      cyl(g, 0.24, 0.05, 0, 0.06, 0, "chassis", accent, CHASSIS_MAT);
      ring(g, 0.19, 0.21, "-90 0 0", "led", status);
      ring(g, 0.13, 0.15, "-90 0 0", "led", status);
      cyl(g, 0.05, 0.03, 0, -0.02, 0, null, "#0f172a");
      box(g, 0.05, 0.012, 0.012, 0, 0.09, 0.12, "led", status);
    }
  };

  AFRAME.registerComponent("device-model", {
    schema: {
      module: { type: "string", default: "server" },
      status: { type: "string", default: "ok" },
      accent: { type: "string", default: "#22d3ee" }
    },
    init: function () {
      this.build();
    },
    update: function (oldData) {
      if (!oldData) return;
      if (oldData.module !== this.data.module) {
        this.build();
      } else if (oldData.status !== this.data.status || oldData.accent !== this.data.accent) {
        this.recolor();
      }
    },
    build: function () {
      this.el.innerHTML = "";
      var shape = SHAPES[this.data.module] || SHAPES.server;
      shape(this.el, this.data.accent, STATUS_COLOR[this.data.status] || STATUS_COLOR.ok);
      this.recolor();
    },
    recolor: function () {
      var statusColor = STATUS_COLOR[this.data.status] || STATUS_COLOR.ok;
      var accent = this.data.accent;
      Array.prototype.forEach.call(this.el.querySelectorAll(".led"), function (node) {
        node.setAttribute("material", "color", statusColor);
      });
      Array.prototype.forEach.call(this.el.querySelectorAll(".chassis"), function (node) {
        node.setAttribute("material", "color", accent);
      });
    }
  });

  AFRAME.registerComponent("it-rig", {
    schema: {
      module: { type: "string", default: "server" },
      slot: { type: "string", default: "A" },
      status: { type: "string", default: "ok" },
      accent: { type: "string", default: "#22d3ee" }
    },
    init: function () {
      var accent = this.data.accent;
      var status = STATUS_COLOR[this.data.status] || STATUS_COLOR.ok;

      this.pad = el("a-entity", {
        geometry: "primitive: circle; radius: 1.0; segments: 64",
        rotation: "-90 0 0",
        position: "0 0.002 0",
        material: "color: " + accent + "; opacity: 0.12; transparent: true; shader: flat"
      });
      this.el.appendChild(this.pad);

      this.halo = el("a-entity", {
        geometry: "primitive: torus; radius: 0.62; radiusTubular: 0.014; segmentsRadial: 8; segmentsTubular: 64",
        rotation: "-90 0 0",
        position: "0 0.03 0",
        material: "color: " + status + "; opacity: 0.85; transparent: true; shader: flat"
      });
      this.el.appendChild(this.halo);

      this.haloOuter = el("a-entity", {
        geometry: "primitive: torus; radius: 0.82; radiusTubular: 0.008; segmentsRadial: 6; segmentsTubular: 64",
        rotation: "-90 0 0",
        position: "0 0.02 0",
        animation: "property: rotation; from: -90 0 0; to: -90 360 0; dur: 14000; loop: true; easing: linear",
        material: "color: " + accent + "; opacity: 0.4; transparent: true; shader: flat"
      });
      this.el.appendChild(this.haloOuter);

      this.device = el("a-entity", {
        position: "0 0.30 0",
        animation: "property: rotation; from: 0 0 0; to: 0 360 0; dur: 26000; loop: true; easing: linear"
      });
      this.device.setAttribute("device-model", {
        module: this.data.module,
        status: this.data.status,
        accent: this.data.accent
      });
      this.el.appendChild(this.device);

      this.el.appendChild(el("a-entity", {
        geometry: "primitive: cylinder; radius: 0.006; height: 0.24",
        position: "0 0.63 0",
        material: "color: " + accent + "; opacity: 0.45; transparent: true; shader: flat"
      }));

      this.el.appendChild(el("a-plane", {
        width: 1.8,
        height: 1.23,
        position: "0 " + CARD_Y + " -0.014",
        material: "color: #020617; opacity: 0.9; transparent: true; shader: flat"
      }));

      this.card = el("a-plane", {
        width: CARD_W,
        height: CARD_H,
        position: "0 " + CARD_Y + " 0",
        material: "shader: flat; transparent: true; opacity: 1"
      });
      this.card.setAttribute("datacard", "module", this.data.module);
      this.el.appendChild(this.card);

      this.applyPulse();
    },
    update: function (oldData) {
      if (!oldData) return;
      if (oldData.module !== this.data.module) {
        this.card.setAttribute("datacard", "module", this.data.module);
        this.device.setAttribute("device-model", "module", this.data.module);
      }
      if (oldData.status !== this.data.status) {
        this.device.setAttribute("device-model", "status", this.data.status);
      }
      if (oldData.accent !== this.data.accent) {
        this.pad.setAttribute("material", "color", this.data.accent);
        this.haloOuter.setAttribute("material", "color", this.data.accent);
        this.device.setAttribute("device-model", "accent", this.data.accent);
      }
      this.recolor();
      this.applyPulse();
    },
    recolor: function () {
      this.halo.setAttribute("material", "color", STATUS_COLOR[this.data.status] || STATUS_COLOR.ok);
    },
    applyPulse: function () {
      var status = this.data.status;
      var color = STATUS_COLOR[status] || STATUS_COLOR.ok;
      this.halo.setAttribute("material", "color", color);

      if (status === "ok") {
        this.halo.removeAttribute("animation__pulse");
        this.halo.removeAttribute("animation__color");
        this.halo.setAttribute("scale", "1 1 1");
        return;
      }

      this.halo.setAttribute("animation__pulse", {
        property: "scale",
        from: "1 1 1",
        to: "1.22 1.22 1.22",
        dir: "alternate",
        dur: status === "crit" ? 620 : 1100,
        loop: true,
        easing: "easeInOutSine"
      });

      if (status === "crit") {
        this.halo.setAttribute("animation__color", {
          property: "material.color",
          from: "#f43f5e",
          to: "#7f1d1d",
          dir: "alternate",
          dur: 620,
          loop: true,
          easing: "easeInOutSine"
        });
      } else {
        this.halo.removeAttribute("animation__color");
      }
    },
    setModule: function (key) {
      this.el.setAttribute("it-rig", "module", key);
    },
    setStatus: function (health, accent) {
      var data = { status: health };
      if (accent) data.accent = accent;
      this.el.setAttribute("it-rig", data);
    },
    redrawCard: function (opts) {
      var component = this.card.components.datacard;
      if (!component) return;
      if (opts) {
        if (opts.source) component.opts.source = opts.source;
        if (opts.clock) component.opts.clock = opts.clock;
      }
      component.redraw();
    }
  });
})();
