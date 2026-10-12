"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

const catalog = require("./js/catalog.js");
const engine = require("./js/sim-core.js");

const ROOT = __dirname;
const sim = new engine.Simulator(catalog);

const HTTPS_PORT = Number(process.env.HTTPS_PORT || 8443);
const HTTP_PORT = Number(process.env.HTTP_PORT || 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

function sendJson(res, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

function sendText(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const resolved = path.resolve(ROOT, "." + urlPath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) {
      sendText(res, 404, "404 Not Found: " + urlPath);
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(resolved).pipe(res);
  });
}

function handler(req, res) {
  const urlPath = req.url.split("?")[0];

  if (urlPath === "/api/state") {
    sendJson(res, sim.tickAndSnapshotAll());
    return;
  }

  if (urlPath === "/api/catalog") {
    sendJson(res, {
      name: catalog.name,
      version: catalog.version,
      modules: catalog.modules.map((mod) => ({
        key: mod.key,
        label: mod.label,
        icon: mod.icon,
        accent: mod.accent,
        category: mod.category,
        zone: mod.zone,
        ident: mod.ident
      }))
    });
    return;
  }

  if (urlPath === "/api/health") {
    sendJson(res, { ok: true, ts: Date.now(), module: catalog.name });
    return;
  }

  serveStatic(req, res);
}

function localAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach((name) => {
    (nets[name] || []).forEach((net) => {
      if (net.family === "IPv4" && !net.internal) out.push(net.address);
    });
  });
  return out;
}

function banner(scheme, port) {
  const host = scheme === "https" ? "https" : "http";
  console.log("");
  console.log("  " + catalog.name + " v" + catalog.version + " — WebAR Monitoring Infrastruktur IT");
  console.log("  ------------------------------------------------------------------");
  console.log("  Desktop   : " + host + "://localhost:" + port);
  if (scheme === "https") {
    console.log("  HP (HTTPS): " + host + "://<IP-PC>:" + port + "   (terima sertifikat self-signed)");
  } else {
    console.log("  HP        : kamera butuh HTTPS. Jalankan 'npm install' lalu 'npm start' lagi.");
  }
  localAddresses().forEach((ip) => {
    console.log("  LAN       : " + host + "://" + ip + ":" + port);
  });
  console.log("");
  console.log("  Endpoint  : /index.html  /preview.html  /ars.html  /marker.html");
  console.log("  API       : /api/state  /api/catalog  /api/health");
  console.log("  Hentikan  : Ctrl + C");
  console.log("");
}

function reportError(err) {
  if (err && err.code === "EADDRINUSE") {
    console.error("Port sudah dipakai proses lain. Set PORT lain, contoh: set HTTP_PORT=8090 && npm start");
  } else {
    console.error(err);
  }
  process.exit(1);
}

let selfsigned = null;
try {
  selfsigned = require("selfsigned");
} catch (err) {
  selfsigned = null;
}

const CERT_DAYS = 825;

const CERT_DIR = process.env.CERT_DIR || path.join(ROOT, "certs");
const CERT_FILE = path.join(CERT_DIR, "cert.pem");
const KEY_FILE = path.join(CERT_DIR, "key.pem");

function loadLocalCertificate() {
  try {
    if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
      return { key: fs.readFileSync(KEY_FILE), cert: fs.readFileSync(CERT_FILE) };
    }
  } catch (err) {
    console.warn("Gagal membaca sertifikat di " + CERT_DIR + ": " + err.message);
  }
  return null;
}

async function generateCertificate() {
  const altNames = [
    { type: 2, value: "localhost" },
    { type: 7, ip: "127.0.0.1" },
    { type: 7, ip: "::1" }
  ];
  localAddresses().forEach((ip) => altNames.push({ type: 7, ip: ip }));
  const notBefore = new Date();
  const notAfter = new Date(notBefore.getTime() + CERT_DAYS * 24 * 60 * 60 * 1000);

  return selfsigned.generate([{ name: "commonName", value: "localhost" }], {
    keySize: 2048,
    algorithm: "sha256",
    notBeforeDate: notBefore,
    notAfterDate: notAfter,
    extensions: [
      { name: "basicConstraints", cA: false },
      { name: "keyUsage", digitalSignature: true, keyEncipherment: true },
      { name: "subjectAltName", altNames: altNames }
    ]
  });
}

function startHttp() {
  const server = http.createServer(handler);
  server.on("error", reportError);
  server.listen(HTTP_PORT, () => banner("http", HTTP_PORT));
}

async function startHttps() {
  let credentials = loadLocalCertificate();
  let source = "sertifikat lokal (" + path.relative(ROOT, CERT_DIR) + ")";

  if (!credentials) {
    if (!selfsigned || typeof selfsigned.generate !== "function") {
      console.log("Modul 'selfsigned' belum terpasang dan tidak ada certs/cert.pem.");
      console.log("Jalankan 'npm install' untuk HTTPS self-signed, atau 'npm run cert' untuk sertifikat mkcert.\n");
      startHttp();
      return;
    }
    try {
      const pems = await generateCertificate();
      credentials = { key: pems.private, cert: pems.cert };
      source = "self-signed (browser akan minta konfirmasi)";
    } catch (err) {
      console.warn("Gagal membuat sertifikat self-signed (" + err.message + "), memakai HTTP biasa.");
      startHttp();
      return;
    }
  }

  const httpsServer = https.createServer({ key: credentials.key, cert: credentials.cert }, handler);
  httpsServer.on("error", reportError);
  httpsServer.listen(HTTPS_PORT, () => {
    banner("https", HTTPS_PORT);
    console.log("  Sertifikat: " + source);
    if (source.indexOf("self-signed") === 0) {
      console.log("  Agar tanpa peringatan browser: jalankan 'npm run cert' (butuh mkcert).\n");
    } else {
      console.log("  Jika masih ada peringatan, jalankan sekali: mkcert -install\n");
    }
  });

  const httpServer = http.createServer(handler);
  httpServer.on("error", reportError);
  httpServer.listen(HTTP_PORT, () => {
    console.log("  HTTP " + HTTP_PORT + " (localhost saja - aman untuk kamera desktop) aktif.\n");
  });
}

startHttps();
