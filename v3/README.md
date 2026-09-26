# Gulfalts — Website V3 · iterasi pertama dari V2

Homepage sinematik "From Space to Destination". Warna, tipografi, dan aturan komponen mengikuti `../GULFALTS-DESIGN.md`. Aset diambil dari `../video concept` (video) dan `../Website Material` (gambar).


## Menjalankan lokal

```bash
cd v3
npm install
npm run dev        # http://127.0.0.1:5175
npm run build      # typecheck + build ke dist/
npm run preview    # http://127.0.0.1:4175
npm run media      # render ulang semua video + gambar (butuh ffmpeg)
```

## Perubahan dari V2

| # | Section | V3 |
|---|---|---|
| 2 | H02 Dubai arrival | Video diganti `video concept/DFD/scene1&2.mp4` (awan → pesisir Dubai → Al Quoz → Fintech District). 1080p, marker di gedung DFD |
| 3 | H03 Brand spectrum | Montage video diganti tumpukan still HD (AVIF/JPEG responsif, crop 9:16 khusus mobile) yang cross-fade per cue |
| 4 | H04 The firm | Seluruh teks rata tengah, scrim lebih kuat |
| 5 | H05 Dubai Creative Park | Gambar potret `Block 5 Padel - side.png` + metrik 160,000+ sq ft & 54 spaces + satu CTA |
| 6–7 | H06 journey, H07 snapshot | Dihapus |
| 8 | H08 Dubai Fintech District | Match cut diganti feature seperti H05 (dicerminkan) dengan copy DFD, 50,000 sq ft & 65 units |
| 9 | H09 journey, H10 snapshot | Dihapus |
| 10 | H11 Our approach | Video diganti `video concept/DCP/DCP-Video.mp4` (32 dtk), 1080p, cue disesuaikan |
| 11 | H12 curation | Dihapus; H13 Our destinations dipertahankan |
| 11 | H13 Our destinations | Video diganti `video concept/DFD/Scene-2.mp4` (7,7 dtk pertama, diputar mundur: situs DFD → Al Quoz → pesisir Dubai). Marker di Al Quoz dengan label di kiri titik |

## Peta chapter

| ID | Chapter | Media |
|---|---|---|
| H01 | Brand reveal | Autoplay (v00) |
| H02 | Dubai arrival | Scrub, v01 — 1920×1080 / 608×1080, ±5 MB / 2 MB |
| H03 | Brand spectrum | Sequence still HD (4 frame) |
| H04 | The firm | Autoplay loop (v00) |
| H05 | Dubai Creative Park | Static feature |
| H08 | Dubai Fintech District | Static feature (mirrored) |
| H11 | Our approach | Scrub, v01 — 1920×1080 / 608×1080, ±12 MB / 4 MB |
| H13 | Our destinations | Scrub mundur, v01 — 1920×1080 / 608×1080, ±5 MB / 2 MB + directory |
| H14 | Next destination + footer | Static |

Kode chapter mengikuti story map, jadi H06/H07, H09/H10, dan H12 memang tidak ada.

## Encoding media

- **Video scrub**: H.264, GOP 1 detik tanpa B-frame, denoise ringan (`hqdn3d`) untuk membuang grain render. Tetap tajam di layar penuh, jauh lebih ringan dari all-intra (DCP 41 MB → 12 MB desktop / 4 MB mobile). AV1 dan HEVC sudah dicoba dan justru lebih besar untuk footage ini.
- **Mobile**: crop native 608×1080 dari master 1080p (tanpa upscale). Marker H02 punya koordinat `xMobile` sendiri karena crop-nya bergeser.
- **Gambar**: `scripts/build-images.mjs` (sharp) → AVIF + mozjpeg di beberapa lebar; `<picture>` memilih ukuran sesuai layar.

## Struktur

```text
v3/
├── index.html                  header, menu, footer (V1) + slot <!-- homepage:sections -->
├── vite.config.ts              plugin yang merender H01–H14 ke HTML statis saat dev/build
├── scripts/build-media.sh      video v01 + salinan aset V2 yang dipakai; build-images.mjs untuk still
├── public/media/{video,posters,images}  aset (v01 = footage produksi, v00 = placeholder dari V2)
└── src/
    ├── content/                homepage.ts (chapter, media, cue, copy), destinations.ts, types.ts
    ├── sections/               renderer per babak: opening, creative-park, fintech-district, ecosystem
    ├── components/             shell chapter (scrub/sequence/autoplay), destination-feature, responsive-image, logo, site chrome, reveals
    ├── lib/                    media-loader (state machine), scroll-scrub (engine), viewport
    ├── styles/                 tokens, global, site-chrome, chapters, sections
    └── main.ts
```

Semua copy, statistik, marker, dan CTA adalah HTML statis (dirender saat build dari `src/content`), jadi bisa dirayapi dan dibaca screen reader tanpa video.

## Cara kerja chapter

- **Sequence (H03)**: track yang sama dengan scrub, tapi panggungnya tumpukan `<picture>`; frame milik cue aktif diberi `.is-current` dan cross-fade, dengan push-in halus lewat `transform`.
- **Scrub**: `chapter_track` (tinggi = `track` × vh) berisi `chapter_sticky` yang `position: sticky`. Posisi scroll → progress 0–1 → `currentTime` video. Scroll native tidak pernah dibajak (Lenis hanya menghaluskan wheel).
- **Overlay**: `data-show="a-b"` tampil saat progress di rentang a–b; `data-cue="id"` tampil hanya saat cue itu aktif; `data-cue-mark` diberi penekanan saat cue aktif.
- **Join (dissolve)**: chapter dengan `joinPrevious: true` (H03, H13) naik ke bawah ekor chapter sebelumnya dan fade-in di atasnya selama `--join` (60vh desktop, 40vh mobile), jadi tidak ada hard cut. Chapter sebelumnya menyelesaikan ceritanya dulu, lalu copy-nya menyingkir.
- **State media**: `idle → loading → ready → active ⇄ paused`, gagal → `error → fallback` (poster tetap tampil). Terlihat di atribut `data-state` tiap section.
- **Loading**: tidak ada video yang dimuat saat page load selain H01 dan chapter berikutnya. Video lain mulai buffer satu layar sebelum masuk, atau saat chapter sebelumnya sudah lewat 55%.
- **Autoplay**: diputar hanya saat terlihat, dijeda saat keluar. H01 hanya diputar sekali.
- **Mobile (<768px)**: file 608×1080 terpisah, track lebih pendek, HUD diringkas, satu safe area teks di bawah.
- **Reduced motion**: tanpa pinning, tanpa scrub, tanpa video. Setiap chapter tampil sebagai poster + seluruh copy; H11 menjadi urutan still frame, H03 menampilkan frame pertamanya.

## Mengganti media

1. Taruh master baru di `../video concept` atau `../Website Material`, lalu sesuaikan `scripts/build-media.sh` / `scripts/build-images.mjs`.
2. `npm run media`.
3. Di `src/content/homepage.ts` perbarui versi, `duration`, dan `cues[].at` (timecode ÷ durasi). Panjang scroll lewat `track.desktop` / `track.mobile`.

## Data

Angka di H05/H08 diambil dari brief V3 (September 2026) dan ditandai `confirmed`. Angka yang diubah ke `'unconfirmed'` di `src/content/destinations.ts` otomatis tampil dengan penanda **"To be confirmed"**.

- Copy singkat V8 District dan Motor Garten masih "Details to be confirmed".
- Posisi marker H13 bersifat indikatif: footage adalah render bergaya, jadi titik ditempatkan di koridor Al Quoz (antara Palm Jumeirah dan The World, di pedalaman), bukan koordinat survei. Di layar landscape frame di-anchor kanan (`object-position: 100%`) agar cluster tidak tertutup panel; di mobile marker disembunyikan karena tertutup directory.
- Belum ada halaman "semua destination" di gulfalts.com; `allDestinationsUrl` sementara mengarah ke homepage gulfalts.com.

## QA dev

Tambahkan `?at=<chapter-id>:<progress>` di URL dev untuk langsung melompat ke titik tertentu, misalnya `/?at=h11-raw-to-destination:0.5`.
