"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CERT_DIR = path.join(ROOT, "certs");
const CERT_FILE = path.join(CERT_DIR, "cert.pem");
const KEY_FILE = path.join(CERT_DIR, "key.pem");

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

function mkcertAvailable() {
  try {
    execFileSync("mkcert", ["-help"], { stdio: "ignore" });
    return true;
  } catch (err) {
    return err && err.status != null;
  }
}

function instructions() {
  console.log("");
  console.log("  mkcert tidak ditemukan.");
  console.log("  ------------------------------------------------------------------");
  console.log("  Pilihan A - pakai mkcert (sertifikat dipercaya browser):");
  console.log("    Windows : choco install mkcert   (atau: scoop install mkcert)");
  console.log("    macOS   : brew install mkcert");
  console.log("    Linux   : sudo apt install mkcert  (atau lihat dokumentasi mkcert)");
  console.log("    lalu    : mkcert -install   (sekali saja, memasang CA lokal)");
  console.log("    akhirnya: npm run cert");
  console.log("");
  console.log("  Pilihan B - tanpa sertifikat, pakai tunnel HTTPS siap pakai:");
  console.log("    npm start");
  console.log("    cloudflared tunnel --url http://localhost:8080");
  console.log("    buka URL https://... yang ditampilkan (dipakai untuk kamera di HP).");
  console.log("");
  console.log("  Pilihan C - biarkan self-signed (browser minta konfirmasi sekali):");
  console.log("    npm start");
  console.log("");
  process.exitCode = 1;
}

if (!mkcertAvailable()) {
  instructions();
} else {
  const hosts = ["localhost", "127.0.0.1", "::1"].concat(localAddresses());
  fs.mkdirSync(CERT_DIR, { recursive: true });
  try {
    execFileSync(
      "mkcert",
      ["-cert-file", CERT_FILE, "-key-file", KEY_FILE].concat(hosts),
      { stdio: "inherit" }
    );
    console.log("");
    console.log("  Sertifikat dibuat untuk: " + hosts.join(", "));
    console.log("  Disimpan di: " + path.relative(ROOT, CERT_DIR));
    console.log("");
    console.log("  Jika browser masih menampilkan peringatan, jalankan sekali: mkcert -install");
    console.log("");
  } catch (err) {
    console.error("Gagal membuat sertifikat dengan mkcert: " + err.message);
    process.exitCode = 1;
  }
}
