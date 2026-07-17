# Chatbot Tolaki

Web app edukasi bahasa dan budaya Tolaki berbasis Next.js.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Isi environment di `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Chatbot Tolaki
```

3. Jalankan development server:

```bash
npm run dev
```

Untuk mencoba dari HP dalam WiFi yang sama, jalankan mode LAN:

```bash
npm run dev:lan
```

Lalu buka `http://IP-LAPTOP:3000` dari browser HP. Contoh:
`http://192.168.1.23:3000`.

## Routes Awal

- `/` - Chatbot utama
- `/kosakata` - Kosakata
- `/ungkapan` - Ungkapan dan Pepatah
- `/cerita-budaya` - Cerita dan Budaya
- `/kuis` - Latihan Kuis
- `/profil` - Profil dan Kemajuan
- `/login` - Login
