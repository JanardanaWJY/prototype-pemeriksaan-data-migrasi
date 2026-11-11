# Prototipe Pemeriksaan Data Migrasi

Prototipe interaktif untuk mendemonstrasikan pembuatan acuan, pemeriksaan Excel, dashboard hasil, riwayat, dan pembagian akses. Tampilan mengikuti wireframe yang disepakati: navy, biru, latar abu muda, kartu dan tabel dengan ukuran mengikuti konten.

## Menjalankan demo

Buka situs melalui GitHub Pages setelah workflow **Test and deploy prototype** selesai. Jika penerbitan otomatis belum dapat mengaktifkan Pages, buka **Settings → Pages → Source: GitHub Actions**, lalu jalankan ulang workflow dari tab Actions.

Untuk menjalankan di komputer sendiri:

```sh
python -m http.server 8080
```

Buka `http://localhost:8080`. Jalankan melalui HTTP; jangan membuka `index.html` langsung sebagai `file://`, karena aplikasi memakai JavaScript modules. Tidak diperlukan instalasi paket untuk menjalankan situs.

## Skenario presentasi

1. Mulai sebagai **Rina**. Buka **Acuan** untuk melihat acuan terbit.
2. Pilih **Buat Acuan**. Coba manual, impor template XLSX, atau salin acuan. Ubah field/aturan, simpan draf, validasi, dan submit untuk menerbitkan.
3. Buka **Pemeriksaan → Pemeriksaan Baru → Gunakan Data Contoh**. Pilih Data Aset versi 1 dan mulai.
4. Hasil contoh: **4 baris**, **2 perlu perbaikan**, **2 memenuhi aturan**, **8/10 isian wajib terisi**. Lihat pratinjau data dan acuan pada halaman terpisah.
5. Telusuri temuan, unduh laporan XLSX, lalu buat BA PDF atau DOCX.
6. Bagikan pemeriksaan kepada **Budi**. Ganti pengguna melalui pemilih di kiri bawah, lalu buka **Dibagikan kepada Saya**.
7. Dari hasil yang dibagikan, buat pemeriksaan baru dengan input sama atau mengganti file/acuan. Hasil menjadi milik pemeriksa baru dan kembali privat.
8. Ganti ke **Admin** untuk mencoba pengelolaan akun. Admin tidak otomatis melihat hasil privat milik pengguna lain.

Tombol **Panduan demo** menyediakan langkah singkat dan reset data. Akun awal: `rina`, `budi`, `admin`, masing-masing dengan password `demo123`. Pemilih akun disediakan untuk memudahkan presentasi.

## Halaman dan interaksi

- Daftar acuan terbit dan draf saya, pencarian serta pagination.
- Tiga metode pembuatan acuan; editor field; parameter aturan; validasi dan konfirmasi publikasi.
- Acuan terbit, versi terdahulu, salin, unduh Excel, dan ubah acuan oleh pemilik. Publikasi perubahan menaikkan versi otomatis; salinan menjadi acuan baru versi 1.
- Daftar pemeriksaan dengan tab kepemilikan, tanggal, acuan, hasil, dan pencarian. Ringkasan mengikuti filter.
- Unggah XLSX, pilihan sheet/header, pratinjau, dan pemilihan acuan tanpa pemasangan kolom.
- Simulasi proses, hasil berdasarkan input yang benar-benar diperiksa, durasi, grafik, temuan, dan kondisi belum dapat dinilai.
- Pratinjau file dan versi acuan pemeriksaan pada halaman terpisah.
- Pengaturan Privat / Pengguna tertentu / Semua pengguna sistem.
- Pemeriksaan baru berdasarkan riwayat, dengan empat pilihan input.
- Template acuan XLSX, data contoh XLSX, laporan XLSX, BA PDF dan DOCX yang langsung diunduh.
- Akun pengguna, nonaktif/aktif, reset password demo, dan halaman masuk.

## Perhitungan dan batas prototipe

Aturan yang dijalankan: keberadaan kolom, wajib isi, tipe data, nol, batas angka, daftar nilai, keunikan satu field, serta wajib isi bersyarat berdasarkan satu field penentu. Nama kolom dicocokkan secara tepat setelah spasi awal/akhir dihapus. Nilai daftar bersifat case-sensitive. Angka desimal menggunakan titik. Tanggal mengikuti format pada acuan.

Baris bermasalah dihitung sekali meskipun mempunyai beberapa temuan. Angka kelengkapan adalah sel wajib terisi / sel yang diketahui wajib. Nol tetap terisi. Saat field penentu kosong atau tidak valid, kewajiban bersyarat belum dimasukkan ke penyebut dan dicatat sebagai kondisi belum dapat dinilai. Baris tersebut perlu diperbaiki. Kolom tambahan dicatat sebagai temuan tingkat kolom, bukan temuan tiap baris.

Hasil dengan versi acuan, sheet, header, dan isi data identik dikelompokkan; hanya yang terbaru ditampilkan di daftar, sedangkan riwayat kelompok tetap dapat dibuka. Pengelompokan hanya menggunakan hasil yang boleh diakses pengguna aktif. Tidak tersedia fitur membandingkan dua pemeriksaan.

Ini frontend untuk demonstrasi, **belum sistem produksi**. Akun, akses, dan penyimpanan disimulasikan di browser melalui localStorage/sessionStorage. Tidak ada autentikasi server, penyimpanan bersama, atau pembagian hasil antarperangkat. Jangan gunakan data rahasia atau password sungguhan. Batas kapasitas penyimpanan mengikuti browser; file besar mungkin hanya bertahan selama sesi.

Pembaca XLSX mendukung nilai sel, shared strings, inline strings, serta tanggal Excel umum. Formula menggunakan nilai cache yang tersimpan oleh Excel; prototipe tidak menghitung ulang formula. Format tanggal 1904, macro, file terenkripsi, formula tanpa cache, dan file sangat besar bukan sasaran demo. Unggahan dibatasi 15 MB. Baris data yang seluruhnya kosong diabaikan; nomor baris asli dipertahankan. File asli yang diunggah dipertahankan untuk unduhan; contoh bawaan direkonstruksi sebagai XLSX.

Durasi pemeriksaan baru menunjukkan waktu simulasi browser, bukan tolok ukur performa backend. Durasi historis pada contoh merupakan data ilustrasi. BA adalah contoh dokumen yang mengambil ringkasan hasil dan identitas pemeriksa; file BA tidak disimpan dalam riwayat aplikasi. PDF memakai font Latin standar.

## Pengujian

```sh
npm test
```

Tes mencakup angka contoh wireframe, kolom hilang, dua dependensi bersyarat, nol, duplikat, posisi baris Excel, validasi konfigurasi, tanggal, akses admin, dan pengelompokan input identik.

## Struktur

- `index.html`, `styles.css`: kerangka dan tampilan responsif.
- `app.js`: halaman, navigasi, formulir, dan simulasi keadaan aplikasi.
- `engine.js`: aturan, perhitungan, hak akses, dan data contoh.
- `files.js`: baca/tulis XLSX serta pembuatan BA.
- `vendor/`: JSZip dan pdf-lib beserta lisensinya; tidak memakai CDN saat demo.
- `.github/workflows/pages.yml`: pengujian dan penerbitan GitHub Pages.
