"""
Asisten Belajar - Build with Gemma AI Hackathon 2026
Backend FastAPI: menyediakan API ke Gemma + menyajikan frontend statis.

Menjalankan file ini akan langsung menjalankan backend DAN frontend
dalam satu proses (satu perintah saja), supaya mudah untuk pemula:

    uvicorn main:app --reload

Lalu buka http://localhost:8000 di browser.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai

load_dotenv()

MODEL_NAME = "gemma-4-31b-it"  # model Gemma 4 terbaru (dense 31B) via Gemini API

app = FastAPI(title="Asisten Belajar API")


def get_client() -> genai.Client:
    """Membuat client Gemini API dari GEMINI_API_KEY di file .env."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY belum diatur. Cek file .env kamu.",
        )
    return genai.Client(api_key=api_key)


def ask_gemma(prompt: str) -> str:
    """Mengirim prompt ke Gemma dan mengembalikan teks jawabannya."""
    client = get_client()
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gagal menghubungi Gemma: {e}")


# ------------------------------------------------------------------
# Skema request
# ------------------------------------------------------------------
class ChatRequest(BaseModel):
    question: str


class SummarizeRequest(BaseModel):
    text: str
    length: str = "Sedang"


class StudyPlanRequest(BaseModel):
    topic: str
    days: int = 7
    hours_per_day: int = 2
    level: str = "Pemula"


class QuizRequest(BaseModel):
    topic: str
    count: int = 5
    quiz_type: str = "Pilihan Ganda"


# ------------------------------------------------------------------
# Endpoint API — 4 fitur utama
# ------------------------------------------------------------------
@app.post("/api/chat")
def chat(req: ChatRequest):
    prompt = (
        "Kamu adalah asisten belajar yang ramah untuk siswa/mahasiswa Indonesia. "
        "Jawab pertanyaan berikut dengan bahasa yang sederhana, jelas, dan beri contoh "
        f"jika perlu. Gunakan format markdown.\n\nPertanyaan: {req.question}"
    )
    return {"answer": ask_gemma(prompt)}


@app.post("/api/summarize")
def summarize(req: SummarizeRequest):
    prompt = (
        f"Ringkas materi berikut dengan tingkat kedetailan '{req.length}'. "
        "Gunakan poin-poin (bullet points) markdown agar mudah dipahami siswa.\n\n"
        f"Materi:\n{req.text}"
    )
    return {"result": ask_gemma(prompt)}


@app.post("/api/study-plan")
def study_plan(req: StudyPlanRequest):
    prompt = (
        f"Buatkan rencana belajar terstruktur untuk topik '{req.topic}' selama "
        f"{req.days} hari, dengan alokasi {req.hours_per_day} jam belajar per hari. "
        f"Level pengguna saat ini: {req.level}. Buat dalam format tabel markdown harian "
        "(Hari, Fokus Materi, Aktivitas) dan tambahkan tips belajar di akhir."
    )
    return {"result": ask_gemma(prompt)}


@app.post("/api/quiz")
def quiz(req: QuizRequest):
    prompt = (
        f"Buatkan {req.count} soal latihan tipe '{req.quiz_type}' tentang topik "
        f"'{req.topic}' untuk siswa. Ikuti format markdown berikut dengan SANGAT ketat:\n\n"
        "- Setiap soal diawali format '**Soal N.** <pertanyaan>' (N = nomor urut).\n"
        "- Jika tipe soal Pilihan Ganda/Campuran: setiap pilihan jawaban (A, B, C, D, E) "
        "WAJIB ditulis sebagai baris list markdown terpisah, contoh:\n"
        "  - A. <isi pilihan>\n"
        "  - B. <isi pilihan>\n"
        "  (dan seterusnya, SATU pilihan per baris, JANGAN digabung dalam satu paragraf "
        "dengan pertanyaan atau pilihan lain).\n"
        "- Setelah SEMUA soal selesai dibuat, tambahkan heading persis '## Kunci Jawaban' "
        "di baris tersendiri (tanpa teks tambahan pada baris itu), lalu di bawahnya daftar "
        "jawaban benar tiap nomor beserta penjelasan singkat."
    )
    return {"result": ask_gemma(prompt)}


# ------------------------------------------------------------------
# Sajikan frontend statis (index.html, style.css, script.js)
# Diletakkan PALING BAWAH agar tidak menimpa route /api/*
# ------------------------------------------------------------------
app.mount("/", StaticFiles(directory="static", html=True), name="static")
