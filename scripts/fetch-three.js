// Unduh Three.js r128 ke www/ supaya APK jalan offline.
const fs = require('fs');
const path = require('path');
const url = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const out = path.join(__dirname, '..', 'www', 'three.min.js');

if (fs.existsSync(out) && fs.statSync(out).size > 100000) {
  console.log('three.min.js sudah ada, dilewati.');
  process.exit(0);
}
fetch(url)
  .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then((t) => {
    if (t.length < 100000) throw new Error('file terlalu kecil');
    fs.writeFileSync(out, t);
    console.log('three.min.js terunduh (' + t.length + ' byte)');
  })
  .catch((e) => { console.error('Gagal unduh Three.js:', e.message); process.exit(1); });
