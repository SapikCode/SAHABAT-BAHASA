# Product Requirements Document

## Chatbot Pintar Edukasi Bahasa dan Budaya Tolaki

Versi: 0.1  
Platform: Web Application  
Tech Stack Rencana: Next.js, Supabase, OpenRouter, DeepSeek V4 Flash, OpenAI Embeddings

## 1. Ringkasan Produk

Chatbot Pintar Tolaki adalah aplikasi web edukatif yang membantu pengguna belajar bahasa Tolaki dan mengenal budaya lokal melalui percakapan interaktif, materi kosakata, ungkapan, pepatah, cerita budaya, video animasi, serta latihan kuis.

Fokus utama aplikasi adalah menghadirkan pengalaman belajar yang mudah diakses, ramah untuk pemula, dan tetap menghormati konteks budaya Tolaki. Halaman utama aplikasi adalah chatbot, sehingga pengguna dapat langsung bertanya, belajar, menerjemahkan, atau meminta penjelasan dalam bahasa Tolaki.

## 2. Tujuan Produk

1. Menyediakan chatbot edukatif yang mampu menjawab pertanyaan tentang bahasa Tolaki dan budaya Tolaki.
2. Membantu pengguna mempelajari kosakata Tolaki sehari-hari secara terstruktur.
3. Mengenalkan ungkapan, pepatah, dan nilai budaya lokal Tolaki.
4. Menyediakan materi cerita dan budaya berbasis konten klien, termasuk video animasi.
5. Menghadirkan latihan kuis interaktif dengan review jawaban.
6. Menyimpan progres belajar pengguna melalui sistem login.

## 3. Target Pengguna

1. Pelajar atau mahasiswa yang ingin belajar bahasa Tolaki.
2. Masyarakat umum yang ingin mengenal bahasa dan budaya Tolaki.
3. Komunitas lokal yang ingin melestarikan bahasa daerah.
4. Guru, pengajar, atau fasilitator budaya yang membutuhkan media belajar digital.
5. Pengguna diaspora atau generasi muda Tolaki yang ingin belajar kembali bahasa lokal.

## 4. Ruang Lingkup Produk

### Termasuk Dalam Scope

- Web app berbasis Next.js.
- Halaman utama berupa chatbot.
- Menu pembelajaran:
  - Kosakata
  - Ungkapan dan Pepatah
  - Cerita dan Budaya
  - Latihan Kuis
  - Profil dan Kemajuan
- Login pengguna menggunakan Supabase Auth.
- Penyimpanan progress kuis untuk pengguna login.
- Integrasi model AI via OpenRouter.
- Model utama rencana: DeepSeek V4 Flash.
- Embedding data pengetahuan menggunakan OpenAI Embeddings.
- Vector database menggunakan Supabase pgvector.
- Konten budaya dan video berasal dari materi klien.

### Di Luar Scope Awal

- Mobile app native.
- Pembayaran/subscription.
- Sertifikat belajar resmi.
- Admin panel kompleks.
- Voice recognition atau text-to-speech.
- Moderasi komunitas atau forum diskusi.

## 5. Struktur Navigasi

Halaman utama aplikasi adalah chatbot.

Rute utama:

```text
/                 Chatbot utama
/kosakata         Belajar kosakata sehari-hari
/ungkapan         Ungkapan, pepatah, dan nilai budaya
/cerita-budaya    Cerita, budaya, dan video animasi
/kuis             Latihan kuis
/profil           Profil dan kemajuan belajar
/login            Login/register
```

## 6. Fitur Utama

### 6.1 Chatbot Utama

Deskripsi:
Halaman utama aplikasi berupa chatbot pintar yang dapat membantu pengguna belajar bahasa Tolaki dan memahami konteks budaya.

Kemampuan utama:

- Menjawab pertanyaan tentang arti kata Tolaki.
- Membantu menerjemahkan kata atau kalimat sederhana.
- Memberikan contoh penggunaan kosakata.
- Menjelaskan ungkapan, pepatah, dan makna budaya.
- Mengarahkan pengguna ke materi belajar terkait.
- Menjawab dengan gaya edukatif, sopan, dan mudah dipahami.

Kebutuhan sistem:

- Menggunakan OpenRouter sebagai API gateway model AI.
- Model utama rencana: DeepSeek V4 Flash.
- Menggunakan retrieval dari Supabase Vector DB untuk data kamus, kosakata, ungkapan, dan materi budaya.
- Menggunakan OpenAI Embeddings untuk embedding dokumen pengetahuan.
- Jawaban chatbot harus memprioritaskan data yang tersedia di knowledge base.
- Jika data tidak ditemukan, chatbot harus menyampaikan keterbatasan dengan sopan.

Contoh interaksi:

```text
User: Apa arti "aahua"?
Bot: "aahua" berarti "sumur" dalam bahasa Indonesia. Contoh: "ano inau petuha butu sala i -" yang berarti "dia pergi turun menuju jalan ke sumur".
```

### 6.2 Kosakata

Deskripsi:
Halaman untuk belajar kosakata bahasa Tolaki sehari-hari secara terstruktur.

Konten:

- Kata Tolaki.
- Arti Indonesia.
- Contoh kalimat Tolaki.
- Terjemahan contoh kalimat.
- Kategori kosakata, misalnya:
  - Rumah
  - Keluarga
  - Alam
  - Makanan
  - Aktivitas harian
  - Sapaan
  - Benda sekitar

Fitur:

- Pencarian kosakata.
- Filter berdasarkan kategori.
- Kartu kosakata.
- Tombol "tanyakan ke chatbot" untuk membahas kata tertentu.

### 6.3 Ungkapan dan Pepatah

Deskripsi:
Halaman untuk menggali ungkapan, pepatah, dan nilai budaya lokal Tolaki.

Konten:

- Ungkapan atau pepatah Tolaki.
- Arti literal.
- Makna budaya.
- Konteks penggunaan.
- Nilai budaya yang terkandung.

Fitur:

- Daftar ungkapan dan pepatah.
- Detail makna.
- Kategori nilai budaya, misalnya:
  - Kebersamaan
  - Hormat kepada orang tua
  - Gotong royong
  - Adat dan kesopanan
  - Nasihat hidup
- Integrasi chatbot untuk penjelasan lebih lanjut.

### 6.4 Cerita dan Budaya

Deskripsi:
Halaman materi budaya yang menampilkan cerita, narasi lokal, dan video animasi dari klien.

Konten:

- Cerita rakyat atau cerita budaya.
- Materi adat dan tradisi.
- Video animasi edukatif.
- Teks pendamping atau ringkasan materi.
- Kosakata penting dari cerita.

Fitur:

- Daftar materi cerita dan budaya.
- Pemutar video.
- Ringkasan materi.
- Tombol diskusi dengan chatbot terkait cerita.
- Materi dapat berasal dari file/video yang disediakan klien.

Catatan:
Untuk MVP, konten dapat dikelola secara manual dari database atau file seed. Admin panel dapat direncanakan pada fase berikutnya.

### 6.5 Latihan Kuis

Deskripsi:
Halaman kuis interaktif untuk menguji pemahaman pengguna.

Bentuk kuis:

- Pilihan ganda.
- Mencocokkan kata dengan arti.
- Melengkapi arti kosakata.
- Memilih terjemahan yang benar.
- Kuis pemahaman cerita atau budaya.

Fitur:

- Pertanyaan bertahap seperti pengalaman aplikasi kuis.
- Skor akhir.
- Review jawaban benar dan salah.
- Penjelasan singkat setelah kuis.
- Simpan skor jika pengguna login.
- Pengguna non-login tetap bisa mengerjakan kuis, tetapi progress tidak disimpan.

Aturan progress:

- Jika user login, skor kuis disimpan ke Supabase.
- Data yang disimpan:
  - User ID
  - ID kuis
  - Skor
  - Jumlah jawaban benar
  - Jumlah pertanyaan
  - Waktu pengerjaan
  - Tanggal selesai

### 6.6 Profil dan Kemajuan

Deskripsi:
Halaman untuk melihat perkembangan belajar pengguna.

Kebutuhan login:

- Pengguna harus login untuk menyimpan dan melihat progress.
- Jika belum login, halaman menampilkan ajakan login/register.

Fitur:

- Informasi profil pengguna.
- Riwayat kuis.
- Skor rata-rata.
- Jumlah kuis selesai.
- Progress berdasarkan kategori.
- Rekomendasi belajar berikutnya.

Contoh metrik:

- Total kuis selesai.
- Skor tertinggi.
- Skor rata-rata.
- Kategori terkuat.
- Kategori yang perlu ditingkatkan.

## 7. User Flow

### 7.1 Flow Pengguna Baru

1. Pengguna membuka aplikasi.
2. Pengguna masuk ke halaman chatbot utama.
3. Pengguna dapat langsung bertanya tanpa login.
4. Pengguna membuka menu kosakata, ungkapan, cerita budaya, atau kuis.
5. Jika ingin menyimpan progress, pengguna diminta login.

### 7.2 Flow Belajar Kosakata

1. Pengguna membuka menu Kosakata.
2. Pengguna mencari atau memilih kategori.
3. Pengguna membaca kata, arti, dan contoh kalimat.
4. Pengguna dapat bertanya ke chatbot tentang kata tersebut.

### 7.3 Flow Kuis

1. Pengguna membuka menu Latihan Kuis.
2. Pengguna memilih paket kuis.
3. Sistem menampilkan soal satu per satu.
4. Pengguna menjawab soal.
5. Sistem menampilkan skor akhir.
6. Sistem menampilkan review jawaban.
7. Jika login, skor disimpan ke progress.

### 7.4 Flow Profil

1. Pengguna membuka Profil dan Kemajuan.
2. Jika belum login, sistem menampilkan CTA login.
3. Jika sudah login, sistem menampilkan riwayat dan statistik belajar.

## 8. Kebutuhan AI dan RAG

### 8.1 Knowledge Base

Sumber data pengetahuan:

- Kamus Tolaki-Indonesia.
- Dataset kosakata.
- Dataset ungkapan dan pepatah.
- Materi cerita dan budaya dari klien.
- Transkrip atau ringkasan video budaya jika tersedia.

Format dokumen RAG:

```text
Judul/Kata: ...
Kategori: ...
Isi: ...
Contoh Tolaki: ...
Terjemahan Indonesia: ...
Sumber: ...
```

### 8.2 Embedding

Rencana:

- Menggunakan OpenAI Embeddings untuk membuat representasi vektor dari dokumen pengetahuan.
- Setiap entri kosakata atau materi pendek menjadi satu dokumen.
- Materi panjang seperti cerita budaya dapat dipecah menjadi beberapa chunk.

### 8.3 Vector Database

Rencana:

- Menggunakan Supabase dengan pgvector.
- Menyimpan:
  - `content`
  - `embedding`
  - `metadata`
  - `source`
  - `category`
  - `created_at`

Contoh metadata:

```json
{
  "type": "dictionary_entry",
  "kata_tolaki": "aahua",
  "arti_indonesia": "sumur",
  "category": "kosakata",
  "source": "kamus_tolaki"
}
```

### 8.4 Chat Completion

Rencana:

- Menggunakan OpenRouter untuk memanggil model chat.
- Model utama: DeepSeek V4 Flash.
- Prompt sistem harus mengarahkan AI untuk:
  - Mengajar dengan bahasa sederhana.
  - Menggunakan data RAG sebagai sumber utama.
  - Tidak mengarang istilah budaya jika tidak ada data.
  - Menjawab dalam bahasa Indonesia, dengan contoh Tolaki jika relevan.
  - Bisa menggunakan bahasa Tolaki secara terbatas berdasarkan data.

## 9. Kebutuhan Autentikasi

Provider:

- Supabase Auth.

Metode login awal:

- Email dan password.
- Opsi Google login dapat dipertimbangkan jika dibutuhkan.

Kebutuhan:

- User dapat menggunakan chatbot tanpa login.
- User harus login untuk menyimpan progress kuis.
- User harus login untuk melihat profil dan kemajuan.

## 10. Kebutuhan Database

Tabel awal yang disarankan:

### users_profile

- `id`
- `user_id`
- `display_name`
- `created_at`
- `updated_at`

### vocabulary_entries

- `id`
- `kata_tolaki`
- `arti_indonesia`
- `kalimat_tolaki`
- `kalimat_indonesia`
- `category`
- `source`
- `created_at`

### cultural_expressions

- `id`
- `title`
- `tolaki_text`
- `meaning`
- `cultural_value`
- `usage_context`
- `category`
- `created_at`

### cultural_stories

- `id`
- `title`
- `description`
- `content`
- `video_url`
- `thumbnail_url`
- `category`
- `created_at`

### quizzes

- `id`
- `title`
- `description`
- `category`
- `difficulty`
- `created_at`

### quiz_questions

- `id`
- `quiz_id`
- `question`
- `options`
- `correct_answer`
- `explanation`
- `created_at`

### quiz_attempts

- `id`
- `user_id`
- `quiz_id`
- `score`
- `correct_count`
- `total_questions`
- `answers`
- `completed_at`

### documents

- `id`
- `content`
- `metadata`
- `embedding`
- `source`
- `category`
- `created_at`

## 11. Non-Functional Requirements

### Performance

- Halaman utama chatbot harus dapat dimuat cepat.
- Retrieval RAG harus merespons dalam waktu wajar.
- Video budaya perlu lazy loading.

### Security

- API key OpenRouter dan OpenAI tidak boleh terekspos ke client.
- Semua panggilan AI dilakukan melalui server route Next.js.
- Progress user hanya bisa diakses oleh user pemilik data.
- Gunakan Row Level Security Supabase untuk data user.

### Reliability

- Jika API AI gagal, sistem menampilkan pesan fallback.
- Jika retrieval tidak menemukan data, chatbot harus menjawab secara aman.
- Kuis tetap bisa berjalan tanpa AI.

### Accessibility

- UI harus mudah dibaca.
- Tombol dan menu jelas.
- Konten video sebaiknya memiliki ringkasan teks.

## 12. MVP

### Fitur MVP

- Halaman chatbot utama.
- RAG dari data kosakata/kamus.
- Halaman Kosakata.
- Halaman Ungkapan dan Pepatah versi daftar sederhana.
- Halaman Cerita dan Budaya dengan video/materi statis.
- Halaman Kuis pilihan ganda.
- Review jawaban kuis.
- Login Supabase.
- Simpan progress kuis.
- Halaman Profil dan Kemajuan sederhana.

### Fitur Fase Berikutnya

- Admin panel untuk kelola konten.
- Text-to-speech bahasa Tolaki jika memungkinkan.
- Mode belajar harian.
- Badge atau gamification.
- Rekomendasi belajar otomatis.
- Multi-level kuis.
- Analytics penggunaan.

## 13. Acceptance Criteria

1. Pengguna dapat membuka aplikasi dan langsung menggunakan chatbot di halaman utama.
2. Chatbot dapat menjawab pertanyaan kosakata berdasarkan knowledge base.
3. Pengguna dapat melihat daftar kosakata dan mencari kata.
4. Pengguna dapat membaca ungkapan, pepatah, dan penjelasan budaya.
5. Pengguna dapat menonton atau membuka materi cerita dan budaya dari klien.
6. Pengguna dapat mengerjakan kuis dan melihat review jawaban.
7. Pengguna non-login dapat mengerjakan kuis tanpa menyimpan progress.
8. Pengguna login dapat menyimpan skor kuis.
9. Pengguna login dapat melihat profil dan kemajuan belajar.
10. API key AI aman di server dan tidak tampil di browser.

## 14. Risiko dan Catatan

1. Kualitas jawaban chatbot sangat bergantung pada kualitas data knowledge base.
2. Bahasa Tolaki memiliki konteks lokal, sehingga validasi dari ahli atau pihak klien tetap penting.
3. OCR atau data kamus dapat memiliki typo kecil, sehingga perlu proses review bertahap.
4. Model AI tidak boleh dibiarkan mengarang istilah budaya tanpa dasar.
5. Materi video dan budaya perlu disiapkan klien dalam format yang jelas.

## 15. Pertanyaan Terbuka

1. Apakah klien menyediakan daftar kategori kosakata resmi?
2. Apakah klien menyediakan materi ungkapan dan pepatah lengkap?
3. Apakah video budaya akan disimpan di Supabase Storage, YouTube, atau platform lain?
4. Apakah chatbot diharapkan bisa menjawab penuh dalam bahasa Tolaki atau cukup edukasi dalam bahasa Indonesia dengan contoh Tolaki?
5. Apakah perlu admin panel pada fase MVP?
6. Apakah kuis dibuat manual oleh admin atau dapat digenerate dari dataset?
7. Apakah ada standar penulisan bahasa Tolaki yang harus diikuti?

