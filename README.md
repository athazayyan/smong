# Smong — Platform Pembelajaran Mitigasi Bencana

Platform edukasi kebencanaan berbasis web untuk siswa SD–SMA. Dibangun dengan Next.js App Router.

## Menjalankan Proyek

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Fitur MitigaSee AR

**Rute:** `/siswa/mitigasee`

Prototipe AR berbasis web untuk menemukan titik kumpul/evakuasi terdekat. Fitur ini menjalankan **3 lapis AR secara bersamaan**:

| Lapis | Nama | Teknologi | Status Fallback |
|-------|------|-----------|-----------------|
| A | Beacon GPS | Three.js + `watchPosition` | Selalu tersedia jika GPS aktif |
| B | Panah Arah Surface-AR | WebXR Device API + hit-test | Dinonaktifkan graceful jika tidak didukung |
| C | Deteksi Objek Risiko | COCO-SSD (TensorFlow.js) | Retry otomatis jika gagal load |

### Cara Menggunakan

1. Buka `/siswa/mitigasee`
2. Tab **"Tambah Titik"** → tandai titik kumpul (GPS + foto + nama) → tersimpan di `localStorage`
3. Tab **"Daftar Titik"** → lihat semua titik tersimpan, hapus jika perlu
4. Tab **"Mode AR"** → tekan **Mulai AR** → 3 lapis berjalan bersamaan

### Browser yang Didukung

| Browser | Lapis A (Beacon) | Lapis B (Panah AR) | Lapis C (Deteksi) |
|---------|-----------------|-------------------|------------------|
| **Chrome Android** (ARCore) | ✅ | ✅ Full WebXR | ✅ |
| Chrome Desktop | ✅ | ⚠️ WebXR AR tidak didukung | ✅ |
| Firefox | ✅ | ❌ Tidak didukung | ✅ |
| Safari / iOS | ✅ | ❌ WebXR AR tidak didukung | ✅ |
| Browser lama (tanpa WebGL) | ❌ Tidak bisa diakses | ❌ | ❌ |

> **Penting:** WebXR `immersive-ar` dengan hit-test **hanya berjalan di Chrome Android** yang didukung ARCore. Di semua browser lain, Lapis B otomatis dinonaktifkan secara graceful — Lapis A dan C tetap berjalan. **Jangan asumsikan WebXR AR jalan di semua browser termasuk Safari/iOS.**

---

## Known Limitations

### Performa (3 Lapis Bersamaan)
- Menjalankan GPS tracking, Three.js render loop, WebXR session, dan COCO-SSD inference **secara bersamaan** membutuhkan perangkat dengan performa baik.
- Pada perangkat mid-range atau low-end, FPS bisa turun drastis. Aplikasi akan menampilkan peringatan non-blocking jika FPS < 15 selama 3 detik.
- COCO-SSD di-throttle ke 400ms per inference untuk mengurangi beban.
- Three.js render di-cap pada `devicePixelRatio` maksimal 2×.

### GPS & Lokasi
- Akurasi GPS di dalam gedung biasanya >50 meter — beacon mungkin tidak presisi.
- Indikator "Akurasi Rendah" muncul jika `coords.accuracy > 50m`.
- Posisi beacon divisualisasikan dalam radius 25m dari kamera untuk keterbacaan.

### localStorage
- Foto disimpan sebagai base64 di `localStorage` — **bukan solusi produksi**.
- Setiap foto dikompresi ke max 800px sebelum disimpan.
- Jika storage penuh, akan mencoba kompresi lebih kecil (480px) sebelum menampilkan error.

### WebXR
- Hit-test WebXR membutuhkan sesi `immersive-ar` yang **hanya tersedia di Chrome Android + ARCore**.
- Panah arah AR tidak akan muncul jika permukaan (lantai/jalan) belum terdeteksi — ini kondisi normal, bukan error.

---

## Struktur Fitur MitigaSee

```
src/features/mitigasee/
├── types/index.ts              # Shared TypeScript types
├── lib/
│   ├── storage.ts              # localStorage CRUD + kompresi foto
│   └── geo.ts                  # Haversine, bearing, GPS→Three.js XZ
├── hooks/
│   ├── useGeoWatch.ts          # GPS watchPosition dengan error handling
│   ├── useWebXR.ts             # WebXR session management
│   └── useArScene.ts           # Three.js scene lifecycle
└── components/
    ├── MitigaSeeArPage.tsx     # Orkestrasi utama
    ├── layers/
    │   ├── BeaconLayer.tsx     # Lapis A: Beacon GPS
    │   ├── SurfaceArrowLayer.tsx # Lapis B: Panah Surface-AR
    │   └── ObjectDetectionLayer.tsx # Lapis C: COCO-SSD
    ├── ui/
    │   ├── ErrorBoundary.tsx   # React ErrorBoundary
    │   ├── BrowserCompatCheck.tsx # Feature detection
    │   └── ArStatusHud.tsx     # FPS counter, jarak, status
    └── registration/
        ├── TitikKumpulRegistration.tsx # Form tambah titik
        └── TitikKumpulList.tsx         # Daftar & hapus titik
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **3D/AR:** Three.js, WebXR Device API
- **AI/ML:** TensorFlow.js, COCO-SSD (`lite_mobilenet_v2`)
- **Animasi:** Framer Motion
- **Storage:** localStorage (prototipe)
