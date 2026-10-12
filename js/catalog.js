(function (root, factory) {
  var catalog = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = catalog;
  } else {
    root.ARITOPS_CATALOG = catalog;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var groups = [
    { key: "infra", label: "Infrastruktur" },
    { key: "jaringan", label: "Jaringan" },
    { key: "perangkat", label: "Perangkat" },
    { key: "sensor", label: "Sensor & Keamanan" }
  ];

  var modules = [
    {
      key: "server",
      group: "infra",
      label: "Server Rack",
      icon: "\uD83D\uDDA5\uFE0F",
      accent: "#22d3ee",
      category: "Compute",
      zone: "Data Center \u2022 Rack A / U12",
      ident: "SRV-APP-01 \u2022 10.10.1.11",
      fields: [
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 46, jitter: 9, warn: 75, crit: 90 },
        { key: "ram", label: "RAM Usage", unit: "%", min: 0, max: 100, base: 63, jitter: 6, warn: 82, crit: 93 },
        { key: "disk", label: "Disk Usage", unit: "%", min: 0, max: 100, base: 71, jitter: 2, warn: 85, crit: 95 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 20, max: 95, base: 54, jitter: 3, warn: 72, crit: 84 },
        { key: "netIn", label: "Network In", unit: "Mbps", min: 0, max: 1000, base: 320, jitter: 60, warn: 820, crit: 940 },
        { key: "netOut", label: "Network Out", unit: "Mbps", min: 0, max: 1000, base: 180, jitter: 45, warn: 820, crit: 940 },
        { key: "load", label: "Load Average", unit: "", min: 0, max: 16, base: 2.4, jitter: 0.6, decimals: 2, warn: 10, crit: 14 },
        { key: "power", label: "Power Draw", unit: "W", min: 0, max: 800, base: 410, jitter: 30, warn: 650, crit: 760 },
        { key: "ramTotal", label: "Installed RAM", value: "128 GB DDR5 ECC" },
        { key: "os", label: "Operating System", value: "Ubuntu Server 22.04 LTS" },
        { key: "uptime", label: "Uptime", value: "87d 04h 12m" },
        { key: "services", label: "Core Services", value: "14 / 14 up" },
        { key: "containers", label: "Containers", value: "26 running" },
        { key: "backup", label: "Last Backup", value: "Today 02:00 \u2022 OK" }
      ]
    },
    {
      key: "router",
      group: "jaringan",
      label: "Core Router",
      icon: "\uD83D\uDCE1",
      accent: "#a78bfa",
      category: "Network",
      zone: "Data Center \u2022 Rack B / U02",
      ident: "RTR-CORE-01 \u2022 10.10.0.1",
      fields: [
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 34, jitter: 8, warn: 70, crit: 85 },
        { key: "mem", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 52, jitter: 5, warn: 80, crit: 92 },
        { key: "tputIn", label: "Throughput In", unit: "Mbps", min: 0, max: 2000, base: 640, jitter: 110, warn: 1600, crit: 1880 },
        { key: "tputOut", label: "Throughput Out", unit: "Mbps", min: 0, max: 2000, base: 410, jitter: 90, warn: 1600, crit: 1880 },
        { key: "clients", label: "Connected Clients", unit: "", min: 0, max: 2000, base: 486, jitter: 40, warn: 1600, crit: 1850 },
        { key: "latency", label: "Avg Latency", unit: "ms", min: 0, max: 200, base: 8, jitter: 4, decimals: 1, warn: 60, crit: 120 },
        { key: "loss", label: "Packet Loss", unit: "%", min: 0, max: 5, base: 0.2, jitter: 0.25, decimals: 2, warn: 1, crit: 3 },
        { key: "ports", label: "Port Utilization", value: "46 / 48 ports used" },
        { key: "uplinks", label: "Uplinks", value: "2 x 10G fiber \u2022 LACP" },
        { key: "vpn", label: "VPN Tunnels", value: "12 active" },
        { key: "uptime", label: "Uptime", value: "203d 07h" },
        { key: "firmware", label: "Firmware", value: "RouterOS 7.14.2" }
      ]
    },
    {
      key: "ap",
      group: "jaringan",
      label: "Access Point",
      icon: "\uD83D\uDCF6",
      accent: "#38bdf8",
      category: "Wireless",
      zone: "Gedung TRPL \u2022 Lantai 2 / Plafon",
      ident: "AP-LT2-07 \u2022 10.10.5.7",
      fields: [
        { key: "clients", label: "Clients Connected", unit: "", min: 0, max: 120, base: 38, jitter: 6, warn: 90, crit: 110 },
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 22, jitter: 6, warn: 70, crit: 85 },
        { key: "mem", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 48, jitter: 4, warn: 82, crit: 93 },
        { key: "chanUtil", label: "Channel Utilization", unit: "%", min: 0, max: 100, base: 44, jitter: 12, warn: 65, crit: 82 },
        { key: "tputDown", label: "Throughput Down", unit: "Mbps", min: 0, max: 1200, base: 280, jitter: 70, warn: 950, crit: 1120 },
        { key: "tputUp", label: "Throughput Up", unit: "Mbps", min: 0, max: 1200, base: 120, jitter: 40, warn: 950, crit: 1120 },
        { key: "latency", label: "Avg Latency", unit: "ms", min: 0, max: 120, base: 6, jitter: 3, decimals: 1, warn: 45, crit: 90 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 20, max: 90, base: 47, jitter: 3, warn: 70, crit: 80 },
        { key: "model", label: "Model", value: "UniFi U6-Pro" },
        { key: "ssid", label: "SSID", value: "TRPL-LAB (WPA3)" },
        { key: "band", label: "Band / Channel", value: "5 GHz \u2022 CH 36 (80 MHz)" },
        { key: "power", label: "Power", value: "PoE+ 802.3at \u2022 11 W" },
        { key: "uptime", label: "Uptime", value: "41d 12h" },
        { key: "firmware", label: "Firmware", value: "7.0.24" }
      ]
    },
    {
      key: "storage",
      group: "infra",
      label: "Storage / NAS",
      icon: "\uD83D\uDCBE",
      accent: "#34d399",
      category: "Storage",
      zone: "Data Center \u2022 Rack C / U20",
      ident: "NAS-BACKUP-01 \u2022 10.10.2.20",
      fields: [
        { key: "capUsed", label: "Capacity Used", unit: "%", min: 0, max: 100, base: 71, jitter: 1.2, warn: 85, crit: 94 },
        { key: "iops", label: "IOPS", unit: "", min: 0, max: 20000, base: 4200, jitter: 700, warn: 15000, crit: 18000 },
        { key: "read", label: "Read Speed", unit: "MB/s", min: 0, max: 1000, base: 320, jitter: 70, warn: 850, crit: 950 },
        { key: "write", label: "Write Speed", unit: "MB/s", min: 0, max: 1000, base: 210, jitter: 60, warn: 850, crit: 950 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 20, max: 80, base: 41, jitter: 2.5, warn: 60, crit: 70 },
        { key: "latency", label: "I/O Latency", unit: "ms", min: 0, max: 40, base: 3.2, jitter: 1.1, decimals: 1, warn: 15, crit: 28 },
        { key: "total", label: "Raw Capacity", value: "96 TB (12 x 8 TB)" },
        { key: "used", label: "Used Space", value: "68.4 TB" },
        { key: "raid", label: "RAID Level", value: "RAID-6 \u2022 2 disk redundancy" },
        { key: "disks", label: "Disk Health", value: "12 / 12 healthy" },
        { key: "snapshots", label: "Snapshots", value: "48 retained" },
        { key: "lastBackup", label: "Last Backup", value: "2 h ago \u2022 verified" }
      ]
    },
    {
      key: "database",
      group: "infra",
      label: "Database Cluster",
      icon: "\uD83D\uDDC4\uFE0F",
      accent: "#f472b6",
      category: "Data",
      zone: "Data Center \u2022 Rack A / U28",
      ident: "DB-PG-CLUSTER \u2022 10.10.3.30",
      fields: [
        { key: "qps", label: "Queries / sec", unit: "", min: 0, max: 30000, base: 8500, jitter: 1200, warn: 24000, crit: 28000 },
        { key: "conn", label: "Active Connections", unit: "", min: 0, max: 500, base: 142, jitter: 18, warn: 380, crit: 460 },
        { key: "replLag", label: "Replication Lag", unit: "ms", min: 0, max: 500, base: 42, jitter: 20, warn: 200, crit: 400 },
        { key: "cacheHit", label: "Cache Hit Ratio", unit: "%", min: 80, max: 100, base: 98.4, jitter: 0.5, decimals: 1, invert: true, warn: 95, crit: 90 },
        { key: "slow", label: "Slow Queries", unit: "", min: 0, max: 50, base: 3, jitter: 3, warn: 20, crit: 40 },
        { key: "tps", label: "Transactions / sec", unit: "", min: 0, max: 8000, base: 2100, jitter: 300, warn: 6500, crit: 7500 },
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 58, jitter: 8, warn: 80, crit: 92 },
        { key: "mem", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 74, jitter: 4, warn: 88, crit: 95 },
        { key: "engine", label: "Engine", value: "PostgreSQL 16.2" },
        { key: "topology", label: "Topology", value: "1 primary + 2 replica" },
        { key: "size", label: "Database Size", value: "2.4 TB" },
        { key: "backup", label: "Last Backup", value: "Yesterday 02:00 \u2022 OK" }
      ]
    },
    {
      key: "power",
      group: "infra",
      label: "UPS / Power",
      icon: "\uD83D\uDD0B",
      accent: "#f43f5e",
      category: "Facility",
      zone: "Data Center \u2022 Rack A / Bottom",
      ident: "UPS-RACK-A \u2022 APC Smart-UPS",
      fields: [
        { key: "load", label: "Output Load", unit: "%", min: 0, max: 100, base: 62, jitter: 4, warn: 80, crit: 92 },
        { key: "battery", label: "Battery Charge", unit: "%", min: 0, max: 100, base: 96, jitter: 1, invert: true, warn: 40, crit: 25 },
        { key: "runtime", label: "Runtime Left", unit: "min", min: 0, max: 120, base: 42, jitter: 3, invert: true, warn: 15, crit: 8 },
        { key: "inputV", label: "Input Voltage", unit: "V", min: 180, max: 260, base: 223, jitter: 3 },
        { key: "outputV", label: "Output Voltage", unit: "V", min: 180, max: 260, base: 220, jitter: 2 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 15, max: 70, base: 32, jitter: 2, warn: 50, crit: 60 },
        { key: "freq", label: "Frequency", unit: "Hz", min: 49, max: 51, base: 50, jitter: 0.05, decimals: 2 },
        { key: "status", label: "Status", value: "Online \u2022 Normal (green)" },
        { key: "lastTest", label: "Self Test", value: "5 days ago \u2022 Passed" },
        { key: "replace", label: "Battery Replace Due", value: "2027-03" },
        { key: "outlets", label: "Outlets", value: "16 monitored" }
      ]
    },
    {
      key: "overview",
      group: "infra",
      label: "DC Overview",
      icon: "\uD83D\uDCCA",
      accent: "#eab308",
      category: "Aggregate",
      zone: "All Zones \u2022 Global Dashboard",
      ident: "IT-OPS \u2022 Aggregate Monitor",
      fields: [
        { key: "online", label: "Assets Online", unit: "%", min: 0, max: 100, base: 96, jitter: 1, decimals: 1, invert: true, warn: 90, crit: 80 },
        { key: "alerts", label: "Open Alerts", unit: "", min: 0, max: 20, base: 3, jitter: 2, warn: 6, crit: 10 },
        { key: "offline", label: "Devices Offline", unit: "", min: 0, max: 30, base: 4, jitter: 2, warn: 8, crit: 12 },
        { key: "avgTemp", label: "Avg Room Temp", unit: "\u00B0C", min: 15, max: 45, base: 23.8, jitter: 0.8, decimals: 1, warn: 28, crit: 32 },
        { key: "powerTotal", label: "Total Power", unit: "kW", min: 0, max: 80, base: 42.5, jitter: 2.5, decimals: 1, warn: 65, crit: 74 },
        { key: "bandwidth", label: "Aggregate Bandwidth", unit: "Gbps", min: 0, max: 10, base: 3.4, jitter: 0.5, decimals: 1, warn: 8, crit: 9.2 },
        { key: "sla", label: "SLA Target", value: "99.95 %" },
        { key: "uptimeMTD", label: "Uptime MTD", value: "99.98 %" },
        { key: "tickets", label: "Open Tickets", value: "7 open \u2022 2 high" },
        { key: "assets", label: "Total Assets", value: "128 assets" },
        { key: "spare", label: "Spare Capacity", value: "CPU 38 % \u2022 Storage 28 %" }
      ]
    },
    {
      key: "laptop",
      group: "perangkat",
      label: "Laptop",
      icon: "\uD83D\uDCBB",
      accent: "#60a5fa",
      category: "Endpoint",
      zone: "Ruang Dosen \u2022 Meja 12",
      ident: "LAP-DSN-12 \u2022 Windows 11 Pro",
      fields: [
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 32, jitter: 12, warn: 80, crit: 93 },
        { key: "ram", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 58, jitter: 7, warn: 85, crit: 95 },
        { key: "disk", label: "Disk Usage", unit: "%", min: 0, max: 100, base: 64, jitter: 1.5, warn: 88, crit: 96 },
        { key: "battery", label: "Battery Level", unit: "%", min: 0, max: 100, base: 68, jitter: 2, invert: true, warn: 20, crit: 10 },
        { key: "batteryHealth", label: "Battery Health", unit: "%", min: 0, max: 100, base: 88, jitter: 0.4, invert: true, warn: 80, crit: 70 },
        { key: "temp", label: "CPU Temperature", unit: "\u00B0C", min: 25, max: 100, base: 54, jitter: 5, warn: 80, crit: 92 },
        { key: "netDown", label: "Download", unit: "Mbps", min: 0, max: 1000, base: 82, jitter: 30 },
        { key: "cycles", label: "Battery Cycles", unit: "", min: 0, max: 1200, base: 214, jitter: 0.5, warn: 800, crit: 1000 },
        { key: "user", label: "Pengguna", value: "dosen.trpl" },
        { key: "os", label: "Sistem Operasi", value: "Windows 11 Pro 23H2" },
        { key: "asset", label: "Nomor Aset", value: "AST-2024-0122" },
        { key: "encryption", label: "Enkripsi Disk", value: "BitLocker aktif" },
        { key: "mdm", label: "MDM", value: "Intune \u2022 compliant" },
        { key: "warranty", label: "Garansi", value: "s/d 2027-08" },
        { key: "lastSeen", label: "Terakhir Terlihat", value: "2 menit lalu" }
      ]
    },
    {
      key: "phone",
      group: "perangkat",
      label: "Smartphone",
      icon: "\uD83D\uDCF1",
      accent: "#818cf8",
      category: "Endpoint",
      zone: "Bagian Tata Usaha \u2022 Meja 3",
      ident: "HP-TU-08 \u2022 Android 14",
      fields: [
        { key: "battery", label: "Battery Level", unit: "%", min: 0, max: 100, base: 61, jitter: 3, invert: true, warn: 20, crit: 10 },
        { key: "batteryHealth", label: "Battery Health", unit: "%", min: 0, max: 100, base: 91, jitter: 0.3, invert: true, warn: 80, crit: 70 },
        { key: "storage", label: "Penyimpanan Terpakai", unit: "%", min: 0, max: 100, base: 72, jitter: 1.2, warn: 88, crit: 96 },
        { key: "ram", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 66, jitter: 5, warn: 88, crit: 95 },
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 28, jitter: 10, warn: 80, crit: 93 },
        { key: "temp", label: "Battery Temperature", unit: "\u00B0C", min: 20, max: 60, base: 33, jitter: 2, warn: 43, crit: 50 },
        { key: "signal", label: "Signal Kuat", unit: "dBm", min: -120, max: -50, base: -68, jitter: 5, invert: true, warn: -100, crit: -110 },
        { key: "netDown", label: "Download", unit: "Mbps", min: 0, max: 300, base: 46, jitter: 18 },
        { key: "user", label: "Pengguna", value: "staf.tu" },
        { key: "os", label: "Sistem Operasi", value: "Android 14 (One UI 6)" },
        { key: "asset", label: "Nomor Aset", value: "AST-2024-0308" },
        { key: "imei", label: "IMEI", value: "35\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022123 (disamarkan)" },
        { key: "mdm", label: "MDM", value: "Intune \u2022 enrolled" },
        { key: "patch", label: "Patch Keamanan", value: "2026-09-01" },
        { key: "apps", label: "Aplikasi Terkelola", value: "42 aplikasi" },
        { key: "lastSync", label: "Sinkron Terakhir", value: "5 menit lalu" }
      ]
    },
    {
      key: "tablet",
      group: "perangkat",
      label: "Tablet",
      icon: "\uD83D\uDCF2",
      accent: "#c084fc",
      category: "Endpoint",
      zone: "Lab TRPL \u2022 Lemari 2",
      ident: "TAB-LAB-04 \u2022 iPadOS 18",
      fields: [
        { key: "battery", label: "Battery Level", unit: "%", min: 0, max: 100, base: 84, jitter: 1.5, invert: true, warn: 20, crit: 10 },
        { key: "batteryHealth", label: "Battery Health", unit: "%", min: 0, max: 100, base: 94, jitter: 0.3, invert: true, warn: 80, crit: 70 },
        { key: "storage", label: "Penyimpanan Terpakai", unit: "%", min: 0, max: 100, base: 55, jitter: 1, warn: 88, crit: 96 },
        { key: "ram", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 51, jitter: 5, warn: 88, crit: 95 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 20, max: 60, base: 31, jitter: 2, warn: 43, crit: 50 },
        { key: "signal", label: "Signal Kuat", unit: "dBm", min: -120, max: -50, base: -58, jitter: 4, invert: true, warn: -100, crit: -110 },
        { key: "user", label: "Peminjam", value: "kelas.trpl.2a" },
        { key: "os", label: "Sistem Operasi", value: "iPadOS 18.1" },
        { key: "asset", label: "Nomor Aset", value: "AST-2024-0412" },
        { key: "mdm", label: "MDM", value: "Jamf \u2022 supervised" },
        { key: "apps", label: "Aplikasi Terkelola", value: "28 aplikasi" },
        { key: "lastSync", label: "Sinkron Terakhir", value: "26 menit lalu" }
      ]
    },
    {
      key: "printer",
      group: "perangkat",
      label: "Printer / MFP",
      icon: "\uD83D\uDDA8\uFE0F",
      accent: "#2dd4bf",
      category: "Peripheral",
      zone: "Gedung TRPL \u2022 Lantai 1 / Lorong",
      ident: "PRN-MFP-03 \u2022 10.20.4.13",
      fields: [
        { key: "tonerK", label: "Toner Hitam", unit: "%", min: 0, max: 100, base: 62, jitter: 0.8, invert: true, warn: 20, crit: 8 },
        { key: "tonerC", label: "Toner Cyan", unit: "%", min: 0, max: 100, base: 48, jitter: 0.8, invert: true, warn: 20, crit: 8 },
        { key: "tonerM", label: "Toner Magenta", unit: "%", min: 0, max: 100, base: 41, jitter: 0.8, invert: true, warn: 20, crit: 8 },
        { key: "tonerY", label: "Toner Kuning", unit: "%", min: 0, max: 100, base: 55, jitter: 0.8, invert: true, warn: 20, crit: 8 },
        { key: "queue", label: "Antrean Cetak", unit: "", min: 0, max: 30, base: 2, jitter: 2, warn: 12, crit: 22 },
        { key: "temp", label: "Fuser Temperature", unit: "\u00B0C", min: 20, max: 220, base: 158, jitter: 6, warn: 200, crit: 212 },
        { key: "paper", label: "Kertas Tray 1", unit: "%", min: 0, max: 100, base: 74, jitter: 1, invert: true, warn: 15, crit: 5 },
        { key: "pages", label: "Total Halaman", unit: "", min: 0, max: 400000, base: 128450, jitter: 0 },
        { key: "model", label: "Model", value: "Epson WorkForce Pro EM-C800" },
        { key: "ip", label: "Alamat IP", value: "10.20.4.13" },
        { key: "status", label: "Status", value: "Ready \u2022 idle" },
        { key: "duplex", label: "Duplex", value: "Aktif" },
        { key: "scanToMail", label: "Scan to E-mail", value: "Aktif" },
        { key: "lastService", label: "Servis Terakhir", value: "2026-06-12" }
      ]
    },
    {
      key: "workstation",
      group: "perangkat",
      label: "PC Workstation",
      icon: "\uD83D\uDDA5\uFE0F",
      accent: "#93c5fd",
      category: "Endpoint",
      zone: "Lab TRPL \u2022 Meja 14",
      ident: "WS-LAB-14 \u2022 Windows 11",
      fields: [
        { key: "cpu", label: "CPU Load", unit: "%", min: 0, max: 100, base: 38, jitter: 12, warn: 80, crit: 92 },
        { key: "ram", label: "Memory Usage", unit: "%", min: 0, max: 100, base: 61, jitter: 6, warn: 85, crit: 94 },
        { key: "gpu", label: "GPU Load", unit: "%", min: 0, max: 100, base: 27, jitter: 10, warn: 85, crit: 95 },
        { key: "disk", label: "Disk Usage", unit: "%", min: 0, max: 100, base: 68, jitter: 1.5, warn: 88, crit: 96 },
        { key: "temp", label: "CPU Temperature", unit: "\u00B0C", min: 25, max: 100, base: 52, jitter: 5, warn: 80, crit: 92 },
        { key: "netDown", label: "Download", unit: "Mbps", min: 0, max: 1000, base: 64, jitter: 25 },
        { key: "user", label: "Pengguna", value: "trpl.lab" },
        { key: "os", label: "Sistem Operasi", value: "Windows 11 Pro 23H2" },
        { key: "asset", label: "Nomor Aset", value: "AST-2023-0914" },
        { key: "antivirus", label: "Antivirus", value: "Defender \u2022 up to date" },
        { key: "patch", label: "Patch Terakhir", value: "3 hari lalu" },
        { key: "processes", label: "Proses Aktif", value: "284 proses" },
        { key: "uptime", label: "Uptime", value: "6d 11h" }
      ]
    },
    {
      key: "iot",
      group: "sensor",
      label: "IoT Sensor Node",
      icon: "\uD83C\uDF21\uFE0F",
      accent: "#f59e0b",
      category: "IoT",
      zone: "Ruang Server \u2022 Sensor Dinding 03",
      ident: "IOT-SENSOR-03 \u2022 ESP32",
      fields: [
        { key: "temperature", label: "Air Temperature", unit: "\u00B0C", min: 10, max: 60, base: 24.5, jitter: 1.2, decimals: 1, warn: 32, crit: 40 },
        { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, base: 48, jitter: 3, warn: 70, crit: 85 },
        { key: "co2", label: "CO2 Level", unit: "ppm", min: 300, max: 5000, base: 620, jitter: 60, warn: 1200, crit: 2000 },
        { key: "pm25", label: "PM2.5", unit: "\u00B5g/m\u00B3", min: 0, max: 200, base: 12, jitter: 4, warn: 55, crit: 100 },
        { key: "battery", label: "Battery", unit: "%", min: 0, max: 100, base: 78, jitter: 0.6, invert: true, warn: 25, crit: 12 },
        { key: "signal", label: "WiFi Signal", unit: "dBm", min: -95, max: -30, base: -62, jitter: 4, invert: true, warn: -80, crit: -88 },
        { key: "device", label: "Perangkat", value: "ESP32-WROOM-32E" },
        { key: "mqtt", label: "Topik MQTT", value: "itops/room/03/telemetry" },
        { key: "gateway", label: "Gateway", value: "GW-ESP-01 \u2022 online" },
        { key: "interval", label: "Interval Sampling", value: "5 s" },
        { key: "lastSeen", label: "Terakhir Kirim", value: "3 s lalu" },
        { key: "firmware", label: "Firmware", value: "v2.3.1" },
        { key: "powerSource", label: "Sumber Daya", value: "PoE + baterai Li-ion" }
      ]
    },
    {
      key: "cctv",
      group: "sensor",
      label: "Kamera CCTV",
      icon: "\uD83D\uDCF9",
      accent: "#fb7185",
      category: "Keamanan",
      zone: "Gedung TRPL \u2022 Pintu Masuk",
      ident: "CAM-ENTR-04 \u2022 10.30.1.24",
      fields: [
        { key: "bitrate", label: "Bitrate", unit: "Mbps", min: 0, max: 16, base: 6.4, jitter: 1.2, decimals: 1, warn: 13, crit: 15 },
        { key: "fps", label: "Frame Rate", unit: "fps", min: 0, max: 30, base: 25, jitter: 1.5, decimals: 0, invert: true, warn: 15, crit: 10 },
        { key: "storage", label: "Penyimpanan NVR", unit: "%", min: 0, max: 100, base: 78, jitter: 0.6, warn: 90, crit: 97 },
        { key: "temp", label: "Temperature", unit: "\u00B0C", min: 20, max: 85, base: 44, jitter: 2.5, warn: 65, crit: 75 },
        { key: "loss", label: "Packet Loss", unit: "%", min: 0, max: 10, base: 0.3, jitter: 0.3, decimals: 2, warn: 2, crit: 5 },
        { key: "motion", label: "Deteksi Gerak (hari ini)", unit: "", min: 0, max: 400, base: 62, jitter: 6, warn: 300, crit: 380 },
        { key: "uptime", label: "Uptime", unit: "hari", min: 0, max: 365, base: 54, jitter: 0.2, decimals: 1 },
        { key: "model", label: "Model", value: "Hikvision DS-2CD2143G2-I" },
        { key: "resolution", label: "Resolusi", value: "2560 \u00D7 1440 \u2022 4 MP" },
        { key: "nvr", label: "NVR", value: "NVR-01 \u2022 kanal 12" },
        { key: "retention", label: "Retensi Rekaman", value: "21 hari" },
        { key: "power", label: "Daya", value: "PoE 802.3af \u2022 7 W" },
        { key: "status", label: "Status", value: "Merekam normal" },
        { key: "lastMotion", label: "Gerak Terakhir", value: "4 menit lalu" }
      ]
    }
  ];

  return { name: "AR-ITOps", version: "1.1.0", groups: groups, modules: modules };
});
