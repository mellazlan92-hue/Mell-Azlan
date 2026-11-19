# Panduan content @mellazlan

## Wajib untuk setiap Reels / TikTok
- **Letak watermark `@mellazlan`** (dua huruf L) dalam setiap video. Letak dalam safe zone,
  contohnya di atas kanan sebaris dengan label siri (lihat `#wm` dalam `template/board_a.html`).
- **Ikut safe zone Reels/TikTok** (kanvas 1080×1920): jangan letak teks atau ikon dalam
  ~250px atas, ~450px bawah, ~150px kanan dan ~60px kiri. Dalam template (720×1280 logik),
  kawasan selamat ialah x 40–620 dan y 150–980.

## Gaya
- Bahasa: Melayu santai, guna "saya" dan "anda" (bukan aku/kau).
- Jenis content: broad value (edukasi) dengan sentuhan personal (hook peribadi, tip sendiri, CTA komen).
- Hashtag: maksimum 3.
- Siri "OTAK KITA #n": design "buku nota pastel" (ungu #3d1f5c / #7b4bb7, merah jambu #e0578f,
  highlighter kuning), font Fredoka (tajuk) + Caveat (nota), ikon doodle, tiada pen marker.
  Jangan tiru gaya whiteboard marker kelabu dari video rujukan.

## Template animasi (`template/`)
- `board_a.html`: senarai elemen `S` (teks, ikon pop, highlighter, anak panah) ikut segmen suara,
  dua halaman dengan animasi selak muka surat.
- `render_a.js`: `node render_a.js prev` untuk preview + overlay safe zone, `node render_a.js full`
  untuk semua frame (30fps). Isi `SEGS` dengan masa ayat dari transkripsi suara
  (faster-whisper, `language='ms'`, `word_timestamps=True`).
- Cantum: `ffmpeg -framerate 30 -i fullA/f%05d.jpg -i suara.wav -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -shortest`.
- Audio suara sendiri: `highpass=f=80,afftdn=nf=-28,acompressor=threshold=-22dB:ratio=3,loudnorm=I=-14:TP=-1.5`.

## Publish
- Metricool brand "mellazlan" (blogId 7715073, zon waktu Asia/Kuala_Lumpur): Instagram, TikTok, Threads.
- Video untuk Metricool perlu link awam (Google Drive "anyone with link"); fail >3 MB tak boleh
  diupload terus dari sesi Claude, jadi minta pengguna upload ke Drive sendiri.
