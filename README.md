# Penunggu Malam

Game horor 3D (Three.js r128, satu file `www/index.html`) dengan 3 map: rumah sakit 4 lantai (lift), kuburan, dan sekolah 2 lantai (tangga). Bisa jadi APK Android lewat Capacitor dan bisa mabar co-op lewat server WebSocket.

## Struktur

```
penunggu-malam/
├─ www/
│  ├─ index.html          # seluruh game + kode mabar
│  └─ config.js           # alamat server mabar (SERVER_URL)
├─ server/
│  ├─ server.js           # server WebSocket mabar (deploy ke Railway)
│  └─ package.json
├─ scripts/
│  └─ fetch-three.js      # unduh three.min.js agar APK jalan offline
├─ .github/workflows/
│  ├─ build-apk.yml       # build APK otomatis
│  └─ pages.yml           # hosting versi web di GitHub Pages
├─ capacitor.config.json
├─ package.json
└─ README.md
```

Folder `android/` dibuat otomatis oleh GitHub Actions (`npx cap add android`), jadi tidak perlu ada di repo.

## 1. Taruh di GitHub

```bash
cd penunggu-malam
git init && git add . && git commit -m "Penunggu Malam"
git branch -M main
git remote add origin https://github.com/USERNAME/penunggu-malam.git
git push -u origin main
```

## 2. Dapat APK

Setiap push ke `main`, workflow **Build APK** jalan otomatis (sekitar 5-8 menit).
Buka tab **Actions** → run terbaru → bagian **Artifacts** → unduh `penunggu-malam-apk` → pasang `app-debug.apk` di HP (izinkan "install dari sumber tidak dikenal").
Kalau kamu push tag, misalnya `git tag v1.0 && git push --tags`, APK juga terlampir di halaman **Releases**.

## 3. Aktifkan mabar (Railway)

1. Di Railway: **New Project** → **Deploy from GitHub repo** → pilih repo ini.
2. Di **Settings** service: set **Root Directory** ke `server`. Start command otomatis `npm start`.
3. Di tab **Networking** klik **Generate Domain**, misalnya `penunggu-malam-production.up.railway.app`.
4. Edit `www/config.js`:
   ```js
   window.SERVER_URL = 'wss://penunggu-malam-production.up.railway.app';
   ```
5. Commit dan push. APK baru otomatis terbuild dengan alamat server itu.

Cek server hidup: buka `https://domain-railway-kamu` di browser, harus muncul "Penunggu Malam server OK".

## 4. Cara mabar

1. Di menu, centang **Mabar online**, isi nama.
2. **Buat room:** kosongkan kode, pilih map. Kode room 5 huruf muncul di layar.
3. **Gabung:** isi kode room dari temanmu, lalu tekan map apa saja (map ikut room).
4. Maksimal 4 pemain. Benda yang diambil satu orang langsung hilang untuk semua, dan hitungannya dibagi bersama. Posisi teman tampil sebagai sosok berwarna dengan nama di atasnya.

Catatan: layout map sama untuk semua pemain di satu room (pakai seed yang sama). Sang Penunggu berjalan di sisi masing-masing pemain, jadi tiap orang punya hantunya sendiri.

## 5. Versi web (opsional)

Di **Settings → Pages**, pilih **Source: GitHub Actions**. Workflow **Deploy web** akan menaruh game di `https://USERNAME.github.io/penunggu-malam/`.

## Jalan lokal

```bash
npm install
npm run fetch-three
npm run dev          # buka alamat yang muncul
npm run server       # server mabar lokal di ws://localhost:8080
```
Untuk tes lokal, ubah `SERVER_URL` jadi `ws://localhost:8080`.

## Kontrol

WASD gerak · Mouse lihat · Shift lari · E aksi · F senter · 1-4 pilih lantai di lift. Di HP: joystick kiri, geser layar kanan untuk melihat, tombol AKSI / SENTER / LARI.
