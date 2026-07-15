// ------------------------------------------------------------------
// Asisten Belajar - logika frontend
// Semua request dikirim ke backend FastAPI di endpoint /api/*
// ------------------------------------------------------------------

const API_BASE = ""; // kosong = pakai origin yang sama (backend menyajikan frontend juga)

// ---------- Switch tab ----------
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const tabsNav = document.querySelector(".tabs");
const tabIndicator = document.querySelector(".tab-indicator");
const tabOrder = Array.from(tabButtons).map((b) => b.dataset.tab);
let currentTabIndex = 0;

function moveIndicatorTo(btn) {
  if (!tabIndicator) return;
  const navRect = tabsNav.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  const width = btnRect.width * 0.6;
  const left = btnRect.left - navRect.left + (btnRect.width - width) / 2;
  tabIndicator.style.width = `${width}px`;
  tabIndicator.style.transform = `translateX(${left}px)`;
  tabIndicator.classList.add("ready");
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const newIndex = tabOrder.indexOf(btn.dataset.tab);
    const direction = newIndex > currentTabIndex ? "16px" : "-16px";
    currentTabIndex = newIndex;

    tabButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    tabPanels.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const panel = document.getElementById(`tab-${btn.dataset.tab}`);
    panel.style.setProperty("--slide-from", direction);
    panel.classList.add("active");

    moveIndicatorTo(btn);
  });
});

// Posisikan indikator saat halaman pertama kali dimuat & saat ukuran layar berubah
window.addEventListener("load", () => {
  const activeBtn = document.querySelector(".tab-btn.active");
  if (activeBtn) moveIndicatorTo(activeBtn);
});
window.addEventListener("resize", () => {
  const activeBtn = document.querySelector(".tab-btn.active");
  if (activeBtn) moveIndicatorTo(activeBtn);
});

// ---------- Helper: panggil API backend ----------
async function callApi(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Terjadi kesalahan tak terduga.");
  }
  return data;
}

// Mengubah teks (markdown + LaTeX) dari Gemma menjadi HTML siap tampil.
// Rumus LaTeX ($...$ dan $$...$$) "diamankan" dulu sebelum diproses marked.js,
// supaya karakter seperti _ dan ^ di dalamnya tidak salah ditafsir sebagai sintaks markdown.
function renderMarkdown(text) {
  const mathStore = [];
  const stash = (raw, displayMode) => {
    mathStore.push({ raw, displayMode });
    return `%%MATH${mathStore.length - 1}%%`;
  };

  const safeText = text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => stash(expr.trim(), true))
    .replace(/\$([^\$\n]+?)\$/g, (_, expr) => stash(expr.trim(), false));

  let html = window.marked ? marked.parse(safeText) : safeText.replace(/\n/g, "<br>");

  mathStore.forEach((m, idx) => {
    let rendered = m.raw;
    if (window.katex) {
      try {
        rendered = katex.renderToString(m.raw, {
          throwOnError: false,
          displayMode: m.displayMode,
        });
      } catch (e) {
        rendered = m.raw;
      }
    }
    html = html.replace(`%%MATH${idx}%%`, rendered);
  });

  return html;
}

// Mencari heading "Kunci Jawaban" dalam hasil kuis, lalu membungkus
// seluruh isi setelahnya ke dalam <details> agar tersembunyi sampai diklik.
function wrapAnswerKey(container) {
  const headings = container.querySelectorAll("h1, h2, h3");
  let keyHeading = null;
  headings.forEach((h) => {
    if (!keyHeading && /kunci\s*jawaban/i.test(h.textContent)) {
      keyHeading = h;
    }
  });
  if (!keyHeading) return;

  const details = document.createElement("details");
  details.className = "answer-key";
  const summary = document.createElement("summary");
  summary.textContent = "Lihat Kunci Jawaban & Pembahasan";
  details.appendChild(summary);

  const nodesToMove = [];
  let node = keyHeading;
  while (node) {
    nodesToMove.push(node);
    node = node.nextElementSibling;
  }
  nodesToMove.forEach((n) => details.appendChild(n));
  container.appendChild(details);
}

// ---------- TAB 1: Tanya Jawab ----------
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");

function addBubble(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = role === "assistant" ? renderMarkdown(text) : text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubble;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  const emptyState = chatLog.querySelector(".chat-empty");
  if (emptyState) emptyState.remove();

  addBubble(question, "user");
  chatInput.value = "";

  const loadingBubble = addBubble('<span class="spinner"></span>Gemma sedang berpikir...', "assistant");
  loadingBubble.classList.add("loading");

  try {
    const data = await callApi("/api/chat", { question });
    loadingBubble.classList.remove("loading");
    loadingBubble.innerHTML = renderMarkdown(data.answer);
  } catch (err) {
    loadingBubble.classList.remove("loading");
    loadingBubble.innerHTML = `<span class="error-text">⚠️ ${err.message}</span>`;
  }
});

// ---------- TAB 2: Ringkas Materi ----------
const summarizeBtn = document.getElementById("summarize-btn");
const summarizeResult = document.getElementById("summarize-result");

summarizeBtn.addEventListener("click", async () => {
  const text = document.getElementById("summarize-input").value.trim();
  const length = document.getElementById("summarize-length").value;

  if (!text) {
    alert("Tempel dulu materinya ya.");
    return;
  }

  setLoading(summarizeBtn, true, "Meringkas...");
  summarizeResult.innerHTML = '<span class="spinner"></span>Gemma sedang meringkas...';

  try {
    const data = await callApi("/api/summarize", { text, length });
    summarizeResult.innerHTML = renderMarkdown(data.result);
  } catch (err) {
    summarizeResult.innerHTML = `<span class="error-text">⚠️ ${err.message}</span>`;
  } finally {
    setLoading(summarizeBtn, false, "Ringkas Sekarang");
  }
});

// ---------- TAB 3: Rencana Belajar ----------
const planBtn = document.getElementById("plan-btn");
const planResult = document.getElementById("plan-result");

planBtn.addEventListener("click", async () => {
  const topic = document.getElementById("plan-topic").value.trim();
  const days = parseInt(document.getElementById("plan-days").value, 10) || 7;
  const hours_per_day = parseInt(document.getElementById("plan-hours").value, 10) || 2;
  const level = document.getElementById("plan-level").value;

  if (!topic) {
    alert("Isi dulu topik yang mau dipelajari.");
    return;
  }

  setLoading(planBtn, true, "Menyusun...");
  planResult.innerHTML = '<span class="spinner"></span>Gemma sedang menyusun rencana belajar...';

  try {
    const data = await callApi("/api/study-plan", { topic, days, hours_per_day, level });
    planResult.innerHTML = renderMarkdown(data.result);
  } catch (err) {
    planResult.innerHTML = `<span class="error-text">⚠️ ${err.message}</span>`;
  } finally {
    setLoading(planBtn, false, "Buatkan Rencana Belajar");
  }
});

// ---------- TAB 4: Kuis Latihan ----------
const quizBtn = document.getElementById("quiz-btn");
const quizResult = document.getElementById("quiz-result");

quizBtn.addEventListener("click", async () => {
  const topic = document.getElementById("quiz-topic").value.trim();
  const count = parseInt(document.getElementById("quiz-count").value, 10) || 5;
  const quiz_type = document.getElementById("quiz-type").value;

  if (!topic) {
    alert("Isi dulu topik kuisnya.");
    return;
  }

  setLoading(quizBtn, true, "Membuat soal...");
  quizResult.innerHTML = '<span class="spinner"></span>Gemma sedang membuat soal...';

  try {
    const data = await callApi("/api/quiz", { topic, count, quiz_type });
    quizResult.innerHTML = renderMarkdown(data.result);
    wrapAnswerKey(quizResult);
  } catch (err) {
    quizResult.innerHTML = `<span class="error-text">⚠️ ${err.message}</span>`;
  } finally {
    setLoading(quizBtn, false, "Buat Kuis");
  }
});

// ---------- Helper: state tombol loading ----------
function setLoading(btn, isLoading, label) {
  btn.disabled = isLoading;
  btn.textContent = label;
}
