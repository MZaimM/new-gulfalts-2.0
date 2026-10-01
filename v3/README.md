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
| 1 | H01 Intro | Animasi logo baru (SVG mask, timeline dan easing dari `gulfalts-logo-reveal.html`; `components/logo.ts` + `reveals.ts`), background langsung frame pembuka scrub H02 (Teluk Arab), tagline "Dynamic Destinations" (title case), navbar tersembunyi sampai animasi logo selesai |
| 2 | H02 Dubai arrival | Video `video concept/homepage/gulfalts-new-intro.mp4` (Teluk Arab dan pesisir UAE → turun ke Dubai → menyusuri pesisir dari Palm ke Downtown). 1080p 30 fps, tanpa marker |
| 3 | H03 Brand spectrum | **Dihapus dari landing page.** Disimpan sebagai komponen HTML mandiri di `backups/brand-spectrum/` (lihat di bawah) |
| 4 | H04 The firm | Seluruh teks rata tengah, scrim lebih kuat. Masuk dengan wipe ala floema.com di atas frame akhir H02 |
| 4b | Our destinations | **Slider**: satu destinasi per slide di dalam lingkaran bercincin emas (DCP, DFD), panah kiri/kanan, tab 01/02, swipe, autoplay. Menggantikan portal dari `gulfalts-homepage-preview.html` |
| 5 | H05 Dubai Creative Park | Gambar potret `Block 5 Padel - side.png` + metrik 160,000+ sq ft & 54 spaces + satu CTA |
| 6–7 | H06 journey, H07 snapshot | Dihapus |
| 8 | H08 Dubai Fintech District | Match cut diganti feature seperti H05 (dicerminkan) dengan copy DFD, 50,000 sq ft & 65 units |
| 9 | H09 journey, H10 snapshot | Dihapus |
| 10 | H11 Our approach | Video diganti `video concept/DCP/DCP-Video.mp4` (32 dtk), 1080p, cue disesuaikan |
| 11 | H12 curation | Dihapus; H13 Our destinations dipertahankan |
| 11 | H13 Our destinations | Video `video concept/homepage/gulfalts-outro.mp4` (frame 0–141, diputar mundur: drone di atas Al Quoz → peta Dubai). Marker presisi dari pin Google Maps (lihat "Marker H13"), label berjejer di kiri dengan garis penghubung; hover/fokus marker (atau baris directory) membuka card detail: foto venue, nama, dan waktu tempuh |

## Style

Mengikuti style guide gulfalts.com (https://www.gulfalts.com/style/style-guide), menggantikan DM Sans dari `../GULFALTS-DESIGN.md`. Semua nilai ada di `src/styles/tokens.css`.

- **Typography**: heading Season Serif 400, line-height 1.2, tracking -0.01em (H1 63→40, H2 48→32, H3 40→28 px); body, nav, dan button Season Sans 300; eyebrow 12px/500/uppercase/1.2px; input form Guardian Sans.
- **Color**: `--primary-color` #101010, `--secondary-color` #4B4B4B, `--text-color` #FFF (teks di atas gelap), `--off-white` #F3E9E3, `--off-white-secondary` #E0D3CC, `--button-primary` #801B2B (hover #6B1624, pressed #5F1420).
- **Button**: pill 999px, 14px Season Sans Light, padding 12px 18px (16px di mobile), transisi 0.3s, selebar isinya (tidak full width di mobile). `.primary-button` = `.button.is-alternate` (burgundy), `.button` = putih untuk latar gelap (CTA "Inquire" di navbar), `.text-link` = `.button-view-more`.
- **Radius**: `--radius-sm` 8 · `--radius-input` 12 · `--radius-card` 16 (gambar feature, panel directory, card marker) · `--radius-pill` 999.
- **Font**: file WOFF2 di `public/fonts` (dari `../Font`). Season adalah versi **TRIAL**; lisensi webfont harus dibeli sebelum launch.

## Navigasi

- **Navbar**: minimalis dan transparan di seluruh halaman (logo, Destinations, Inquire, Menu) dengan gradasi tipis di atas footage. Di atas section terang (chapter `.is-static` di canvas off-white) berganti ke ink: logo gelap, tombol Inquire ink (`initHeaderTone` di `components/site-chrome.ts`).
- **Navbar desktop**: `Destinations ▾` (dropdown: Creative Park, Fintech District, All destinations) + tombol `Inquire`. Dropdown terbuka lewat hover, klik, atau keyboard (Arrow Down masuk ke daftar, Escape menutup); `Destinations` dan item submenu diberi `aria-current` saat section-nya terlihat.
- **Menu full-screen**: Home, Destinations, Our approach. `Destinations` (dan "All destinations" di dropdown) mendarat di H13 saat directory + marker sudah tampil (`anchorProgress: 0.85`).
- **The Firm** hanya ada di footer.
- **Contact drawer**: `Inquire` (navbar) dan `Contact` (footer) membuka panel putih dari kanan seperti gulfalts.com: Get in Touch, Contact Form (Full Name, Phone Number, Email Address, jenis inquiry dengan 5 opsi yang sama), Submit Inquiry. Validasi + state loading/berhasil/gagal ada. **Belum mengirim data**: `CONTACT_ENDPOINT` di `src/components/contact.ts` masih `null`, jadi setelah submit pengunjung diminta email ke info@gulfalts.com. Isi endpoint (mis. Netlify Forms atau backend lain) untuk mengaktifkan.

## Backup komponen

- `backups/brand-spectrum/index.html` — section "For work / For movement / For culture / For life" (H03) sebagai file HTML mandiri: CSS dan JS vanilla di dalam satu file, gambar HD di `images/`, font di `fonts/`. Buka langsung di browser, atau salin blok `<section class="bs">` beserta `<style>` dan `<script>`-nya ke halaman lain. Folder ini tidak ikut di-build maupun di-deploy.

## Our destinations (slider)

Markup di `components/destination-slider.ts`, perilaku di `components/slider.ts`, copy di `slider` (`src/content/homepage.ts`). Foto dari `../Website Material/portals/` dipotong kotak oleh `scripts/build-images.mjs` (`slide-*`; `node scripts/build-images.mjs slide-` merender ulang hanya job itu).

- **Autoplay** 7 dtk (`--slide-ms`): cincin emas terisi dari arah jam 12 dan segmen tab aktif ikut terisi; `animationend` pada cincin pindah ke slide berikutnya. Berhenti saat di-hover, saat ada fokus keyboard di dalam slider, saat section di luar layar, dan saat tab browser tersembunyi. Tanpa autoplay di reduced motion.
- **Navigasi**: panah, tab (Arrow Left/Right, Home, End), swipe di lingkaran. Klik foto atau CTA membesar lingkaran memenuhi layar lalu membuka halaman venue.
- Aksen emas (`--sand`, #d8b98f) mengikuti referensi, tidak ada di style guide gulfalts.com. Copy Fintech District (pilar dan kalimat) masih usulan, perlu konfirmasi klien.

## H13 marker card

Hover/fokus marker, atau hover baris directory, membuka card: titik membesar menjadi foto venue, nama dalam pill ink, dan waktu tempuh di card off-white dengan angka burgundy (warna style guide). Card terbuka ke bawah, atau ke atas (`.is-up`) bila tidak muat. Data di `commute` (`src/content/destinations.ts`): waktu tempuh Dubai Fintech District dari referensi klien; venue lain memakai angka yang sama sebagai nilai indikatif dan diberi label "To be confirmed" sampai Gulfalts mengirim angkanya.

## Peta chapter

| ID | Chapter | Media |
|---|---|---|
| H01 | Intro | Tanpa video: animasi logo port dari `gulfalts-logo-reveal.html` (ikon G ter-zoom → kotak membuka ke kanan menyingkap "Gulf" → lubang A-L-T-S; G dan ALTS transparan) di atas frame pembuka H02 (Teluk Arab). Scroll: logo slide out, lalu scrub H02 berjalan dari frame yang sama. Navbar baru muncul setelah animasi logo selesai |
| H02 | Dubai arrival | Scrub, v03 — 1920×1080 / 608×1080 @ 30 fps, 14,2 dtk, 5,0 MB / 2,0 MB (sumber 1920×1080, 21,4 MB) |
| H04 | The firm | Autoplay loop (v00) di track pendek; wipe dari bawah di atas frame akhir H02 |
| — | Our destinations | Static, slider DCP + DFD (`components/destination-slider.ts`, `components/slider.ts`) |
| H05 | Featured destinations | Static, dua kolom sama lebar yang sejajar (CSS subgrid), gambar 4:3. Tiap kolom punya id sendiri (`#h05-creative-park`, `#h08-fintech-district`) |
| H11 | Our approach | Scrub, v01 — 1920×1080 / 608×1080, ±12 MB / 4 MB |
| H13 | Our destinations | Scrub mundur, v02 — 1920×1080 / 608×1080, 4,9 MB / 1,9 MB (sumber 2560×1440, 20,9 MB) + directory |
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
├── scripts/build-media.sh      video v01–v03 + salinan aset V2 yang dipakai (`npm run media -- h02 h13` untuk sebagian); build-images.mjs untuk still
├── public/media/{video,posters,images}  aset (v03 = intro homepage baru, v02 = outro homepage, v01 = footage produksi, v00 = placeholder dari V2)
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

- **Scrub**: `chapter_track` (tinggi = `track` × vh) berisi `chapter_sticky` yang `position: sticky`. Posisi scroll → progress 0–1 → `currentTime` video. Scroll native tidak pernah dibajak (Lenis hanya menghaluskan wheel).
- **Overlay**: `data-show="a-b"` tampil saat progress di rentang a–b; `data-cue="id"` tampil hanya saat cue itu aktif; `data-cue-mark` diberi penekanan saat cue aktif.
- **Steps**: `data-steps="brand-out:0.2"` pada section → `.is-brand-out` saat progress melewati angka itu, plus event `chapter:step` (navbar ikut muncul bila pengunjung scroll sebelum animasi logo selesai).
- **Join (wipe)**: `joinStyle: 'wipe'` (H04) membuka chapter dari bawah ke atas dengan tepi tegas (`clip-path`), gambarnya naik ke posisi, sementara gambar chapter sebelumnya bergeser naik lebih cepat, sedikit membesar, dan meredup (`--exit`). Semua mengikuti scroll, seperti transisi koleksi di floema.com.
- **Join (dissolve)**: chapter dengan `joinPrevious: true` (H02, H13) naik ke bawah ekor chapter sebelumnya dan fade-in di atasnya selama `--join` (60vh desktop, 40vh mobile), jadi tidak ada hard cut. Chapter sebelumnya menyelesaikan ceritanya dulu, lalu copy-nya menyingkir.
- **State media**: `idle → loading → ready → active ⇄ paused`, gagal → `error → fallback` (poster tetap tampil). Terlihat di atribut `data-state` tiap section.
- **Loading**: saat page load hanya video H02 (scrub pertama, tepat di bawah intro) yang dimuat; gambar pertama yang tampil adalah frame pembukanya (poster JPEG 113 KB desktop / 31 KB mobile, di-preload). Video lain mulai buffer satu layar sebelum masuk, atau saat chapter sebelumnya sudah lewat 55%.
- **Autoplay**: diputar hanya saat terlihat, dijeda saat keluar.
- **Mobile (<768px)**: file 608×1080 terpisah, track lebih pendek, HUD diringkas, satu safe area teks di bawah.
- **Reduced motion**: tanpa pinning, tanpa scrub, tanpa video. Setiap chapter tampil sebagai poster + seluruh copy; H11 menjadi urutan still frame.

## Mengganti media

1. Taruh master baru di `../video concept` atau `../Website Material`, lalu sesuaikan `scripts/build-media.sh` / `scripts/build-images.mjs`.
2. `npm run media`.
3. Di `src/content/homepage.ts` perbarui versi, `duration`, dan `cues[].at` (timecode ÷ durasi). Panjang scroll lewat `track.desktop` / `track.mobile`.

## Data

Angka di H05/H08 diambil dari brief V3 (September 2026) dan ditandai `confirmed`. Angka yang diubah ke `'unconfirmed'` di `src/content/destinations.ts` otomatis tampil dengan penanda **"To be confirmed"**.

- V8 District dan Motor Garten memakai kategori dari gulfalts.com ("Specialized commercial facilities"); thumbnail dari render project di gulfalts.com (`../Website Material/gulfalts.com`).
- **Marker H13**: diletakkan di frame pertama outro (peta Dubai). Pin Google Maps tiap venue diproyeksikan ke frame itu lewat homografi yang dicocokkan ke jalan dan garis pantai OpenStreetMap (Sheikh Zayed Road, Al Khail Road dan interchange-nya, pantai Palm–Jumeirah Bay), akurat beberapa piksel di lebar 1920. Koordinat pin tercatat di `src/content/destinations.ts`. Kalau video outro dirender ulang dengan kamera berbeda, posisi harus dihitung ulang.
- Keempat venue berdekatan (V8 District dan Creative Park ±1,3 km), jadi titik tetap di posisi aslinya dan label disusun dalam satu kolom di kiri dengan garis penghubung (`spreadLabels` di `lib/scroll-scrub.ts`). Marker yang jatuh di bawah panel directory (`data-marker-avoid`) disembunyikan; panel dibuat lebih ramping (maks. 460px, 32vw) agar cluster tetap terlihat di layar 1280–1536px. Di layar landscape frame di-anchor kanan (`object-position: 100%`); di mobile marker disembunyikan karena tertutup directory.
- Belum ada halaman "semua destination" di gulfalts.com; `allDestinationsUrl` sementara mengarah ke homepage gulfalts.com.

## QA dev

Tambahkan `?at=<chapter-id>:<progress>` di URL dev untuk langsung melompat ke titik tertentu, misalnya `/?at=h11-raw-to-destination:0.5`.
