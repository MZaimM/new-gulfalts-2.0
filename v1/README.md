# Gulfalts — Website V1

Prototipe lima section pertama: hero, about, statistik, cerita scroll imersif, dan portofolio. Layout mengikuti screenshot referensi yang diberikan; warna, tipografi, copy, dan proyek mengikuti `../GULFALTS-DESIGN.md`.

## Menjalankan lokal

```bash
cd v1
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite. Untuk mengecek versi produksi, jalankan `npm run build` dan `npm run preview`.

## Hero video scrub

Hero memakai video yang digerakkan scroll: posisi scroll memetakan `currentTime` video, bukan diputar sendiri.

- Sumber mentah ada di `media-src/hero-video-scrub.mp4` (tidak ikut ter-build).
- Aset yang dipakai halaman di-encode all-keyframe (`-g 1`) supaya seek-nya instan:

```bash
ffmpeg -i media-src/hero-video-scrub.mp4 -an -vf "scale=w=1440:h=810:flags=lanczos" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 27 \
  -g 1 -keyint_min 1 -sc_threshold 0 -x264-params "no-scenecut=1:bframes=0:ref=1" \
  -movflags +faststart public/assets/hero-scrub.mp4
```

  Varian `hero-scrub-sm.mp4` (960x540, crf 29) dipakai di layar < 768px, dan `hero-poster.jpg` jadi frame pertama sekaligus fallback.
- Desktop: hero di-pin selama 4 layar — 2,5 layar untuk video, sisanya melipat frame terakhir ke tile tengah section About (`.about` ditarik satu layar ke atas lewat class `has-hero-scrub`).
- Mobile: pin 1,9 layar, hanya scrub tanpa lipatan.
- `prefers-reduced-motion: reduce`: video tidak diunduh sama sekali, hero berhenti di poster.

## Konten

- Gambar dan logo lokal berada di `public/assets/`.
- Angka portofolio mengacu pada situs Gulfalts yang ditautkan langsung di section statistik.
- Angka dalam cerita *Why Dubai* ditautkan ke sumber Dubai Department of Economy and Tourism, Dubai Chamber of Commerce, dan Government of Dubai.
- Dua kartu proyek menuju halaman Dubai Creative Park dan Dubai Fintech District pada situs Gulfalts.

## Portfolio (Dubai Creative Park & Dubai Fintech District)

Layout mengikuti section kategori di floema.com: rail kiri (nomor `01 / 02` + label), garis horizontal selebar layar, tag proyek, headline, statistik, CTA, dan kartu kecil di kanan bawah untuk pindah proyek.

- Background: `DCP-sample.mp4` dan `DFD-Sample.mp4` (muted, loop). Video hanya diputar saat terlihat, mulai di-buffer satu layar sebelum section masuk. Poster (`dcp-poster.jpg`, `dfd-poster.jpg`) dan thumbnail kartu diambil dari frame video.
- Desktop/tablet (≥768px lebar dan ≥620px tinggi): section di-pin sekitar 2,5 layar; slide Fintech District menyapu naik dari bawah (clip-path) di atas Creative Park, dengan garis progres di sepanjang garis horizontal.
- Mobile, layar pendek, dan `prefers-reduced-motion`: dua slide ditumpuk biasa, masing-masing setinggi layar; statistik jadi daftar baris. Dengan reduced motion, video tidak diputar dan hanya poster yang tampil.
- Kartu "Up next / Previous" muncul mulai 1360×760.

## Two destinations (grid venue)

Section putih setelah portfolio, layout mengikuti grid "Our services" (foto, kartu, foto, kartu). Kartu abu-abu muda berisi nomor, nama, tag, detail singkat, dan CTA ke halaman venue.

- Hover (atau fokus keyboard) pada foto maupun kartu memicu efek liquid ala archline.framer.website: shader WebGL di `src/liquid-hover.js` melelehkan foto utama ke foto alternatif lewat noise field. Kanvas hanya me-render selama transisi berjalan.
- Gambar sementara: Creative Park `creative-park.avif` → `padel.avif`, Fintech District `fintech.avif` → `interior-dfd.jpg`. Ganti dua `<img>` di dalam `.venue-media` untuk memakai foto final.
- ≥1200px: 4 kolom. 768–1199px: satu venue per baris (foto + kartu). <768px: foto di atas kartu, CTA selebar kartu. Di layar sentuh (tanpa hover), foto berganti sendiri setiap 3,6 detik selama terlihat.
- Tanpa WebGL: crossfade CSS. Dengan `prefers-reduced-motion`: tidak ada shader, pergantian langsung.

## Footer

Layout mengikuti footer di gulf-landing.pages.dev/v1: newsletter, kolom Navigate / Our Venue / Connect, wordmark besar (`gulfalts-wordmark-white.svg`), dan baris copyright.

- Transisi: footer `position: fixed` di belakang `main` (opaque, `z-index: 1`). `.footer-spacer` setelah `main` disamakan tingginya dengan footer lewat ResizeObserver, jadi halaman "terangkat" dan membuka footer.
- Kalau footer lebih tinggi dari `100svh` (mis. HP landscape), footer pindah ke alur normal (`.is-static`) supaya semua isinya tetap bisa di-scroll.
- Fokus keyboard yang masuk ke footer langsung menggulung halaman ke paling bawah.
- Newsletter belum tersambung ke layanan apa pun: email valid membuka email ke info@gulfalts.com. Ganti handler di `src/main.js` saat endpoint (Mailchimp, HubSpot, dll.) sudah ada.
- Link Careers, Thesis, Blog, dan venue mengarah ke halaman di gulfalts.com; The firm ke `#about`; Contact ke email.
