<div align="center">

# 📚 Asisten Belajar

### Teman belajar kamu, kapan saja — ditenagai Gemma AI

*Satu aplikasi, empat cara belajar lebih cerdas: tanya jawab, ringkas materi, rencana belajar, dan kuis latihan.*

![Gemma](https://img.shields.io/badge/Model-Gemma%204%20(31B)-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Build with Gemma AI Hackathon 2026**

</div>

---

## ✨ Kenapa Asisten Belajar?

Siswa Indonesia sering harus buka banyak aplikasi berbeda cuma untuk belajar: satu untuk nanya, satu untuk ringkas catatan, satu lagi untuk bikin jadwal, dan cari soal latihan sendiri secara manual. **Asisten Belajar menyatukan semuanya dalam satu tempat**, dengan Gemma yang menjawab dalam Bahasa Indonesia yang natural — bukan hasil translate kaku.

## 🚀 Fitur Utama

| | Fitur | Yang bisa kamu lakukan |
|---|---|---|
| 💬 | **Tanya Jawab** | Tanya konsep apa pun, dijawab sederhana + contoh, format markdown rapi |
| 📝 | **Ringkas Materi** | Tempel catatan/artikel panjang → ringkasan poin-poin, level detail bisa diatur |
| 🗓️ | **Rencana Belajar** | Isi topik + hari + jam belajar → jadwal harian otomatis dalam bentuk tabel |
| ❓ | **Kuis Latihan** | Soal otomatis sesuai topik, **kunci jawaban tersembunyi** sampai diklik 🔒 |

**Bonus:** rumus matematika (`$\int u\,dv$`, dsb.) dirender otomatis jadi notasi matematika sungguhan lewat KaTeX — bukan teks mentah.

## 🖼️ Cuplikan Aplikasi
![[1.png|388]]
![[2.png|394]]
![[3.png|398]]
![[4.png|398]]
## 🛠️ Tech Stack

- **Model AI**: Gemma 4 (`gemma-4-31b-it`) via Gemini API
- **Backend**: FastAPI + Pydantic — satu proses untuk API *dan* frontend
- **Frontend**: HTML/CSS/JS murni (tanpa build step) — `marked.js` untuk markdown, `KaTeX` untuk rumus

## ⚡ Cara Menjalankan

```bash
# 1. Clone repo ini
git clone <URL_REPO_INI>
cd <nama-folder>

# 2. (Opsional) buat virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Siapkan API key
cp .env.example .env
# lalu edit .env, isi GEMINI_API_KEY dengan key kamu
# (dapatkan gratis di https://aistudio.google.com/apikey)

# 5. Jalankan 🚀
uvicorn main:app --reload
```

Buka **http://localhost:8000** — satu perintah ini langsung menjalankan backend **dan** frontend sekaligus.

> ⚠️ **Jangan pernah commit file `.env` asli ke GitHub.** Sudah otomatis diabaikan lewat `.gitignore` — gunakan `.env.example` sebagai contoh format saja.

## 📁 Struktur Proyek

```
.
├── main.py             # Backend FastAPI + endpoint API ke Gemma
├── requirements.txt    # Dependencies Python
├── .env.example         # Contoh format API key (aman di-commit)
├── .gitignore
└── static/
    ├── index.html
    ├── style.css
    └── script.js
```

## 🗺️ Rencana Pengembangan

- [ ] Memory chat multi-turn
- [ ] Upload file (PDF/foto catatan) untuk diringkas
- [ ] Kuis otomatis dari hasil ringkasan (chaining)
- [ ] Tracking progres belajar

---

<div align="center">

Dibuat dengan 🖤 untuk **Build with Gemma AI Hackathon 2026**

</div>
