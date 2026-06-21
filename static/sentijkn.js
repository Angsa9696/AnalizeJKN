/* ============================================================
   SentiJKN — JavaScript
   Charts, TF-IDF bars, dan logika inferensi kalimat
   ============================================================ */

/* ---- Hitung Persentase untuk Pie Chart (Dinamis dari JSON) ---- */
const totalUlasan = dynamicData.dataset.total;
const persenPos = ((dynamicData.dataset.positif / totalUlasan) * 100).toFixed(
  1,
);
const persenNeg = ((dynamicData.dataset.negatif / totalUlasan) * 100).toFixed(
  1,
);

/* ---- Chart: Pie Distribusi ---- */
new Chart(document.getElementById("pieChart"), {
  type: "doughnut",
  data: {
    labels: ["Positif", "Negatif"],
    datasets: [
      {
        data: [persenPos, persenNeg], // Memasukkan data persentase dinamis
        backgroundColor: ["#639922", "#E24B4A"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  },
});

/* ---- Chart: Bar Akurasi ---- */
new Chart(document.getElementById("accChart"), {
  type: "bar",
  data: {
    labels: ["Accuracy", "Precision", "Recall", "F1-Score"],
    datasets: [
      {
        label: "SVM",
        data: [
          // Struktur JSON baru & konversi string "0.95" menjadi 95.0
          dynamicData.metrics.svm.accuracy,
          parseFloat(dynamicData.metrics.svm.report.avg.precision) * 100,
          parseFloat(dynamicData.metrics.svm.report.avg.recall) * 100,
          parseFloat(dynamicData.metrics.svm.report.avg.f1) * 100,
        ],
        backgroundColor: "rgba(24,95,165,0.85)",
        borderRadius: 5,
      },
      {
        label: "Naive Bayes",
        data: [
          // Struktur JSON baru & konversi string "0.80" menjadi 80.0
          dynamicData.metrics.nb.accuracy,
          parseFloat(dynamicData.metrics.nb.report.avg.precision) * 100,
          parseFloat(dynamicData.metrics.nb.report.avg.recall) * 100,
          parseFloat(dynamicData.metrics.nb.report.avg.f1) * 100,
        ],
        backgroundColor: "rgba(29,158,117,0.85)",
        borderRadius: 5,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: 70,
        max: 100,
        ticks: {
          font: { size: 11 },
          callback: (v) => v + "%",
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
        },
      },
    },
  },
});

/* ---- TF-IDF Dynamic Bars (Diambil dari Python/JSON) ---- */
// Mengambil variabel dynamicData yang sudah disisipkan di file HTML
const TFIDF_POS = dynamicData.tfidf_data.pos;
const TFIDF_NEG = dynamicData.tfidf_data.neg;

function renderTfidfBars(data, containerId, color) {
  if (!data || data.length === 0) return;
  const max = data[0].v; // Kata pertama pasti punya nilai tertinggi
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = data
    .map(
      (d) => `
    <div class="tfidf-row">
      <span class="tfidf-word">${d.w}</span>
      <div class="tfidf-bar-wrap">
        <div class="tfidf-bar" style="width:${Math.round((d.v / max) * 100)}%;background:${color}"></div>
      </div>
      <span class="tfidf-val">${d.v.toFixed(3)}</span>
    </div>
  `,
    )
    .join("");
}

renderTfidfBars(TFIDF_POS, "tfidf-pos", "#639922"); // Grafik Positif (Hijau)
renderTfidfBars(TFIDF_NEG, "tfidf-neg", "#E24B4A"); // Grafik Negatif (Merah)

/* ---- NLP Utilities ---- */
const STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "ini",
  "itu",
  "juga",
  "dengan",
  "untuk",
  "tidak",
  "ada",
  "saya",
  "kita",
  "sudah",
  "akan",
  "bisa",
  "atau",
  "pada",
  "sih",
  "aja",
  "banget",
  "sangat",
  "lebih",
  "nih",
  "loh",
  "deh",
  "kok",
  "ya",
  "ga",
  "gak",
  "enggak",
  "nggak",
  "tapi",
  "aku",
  "kamu",
  "dia",
  "mereka",
  "dalam",
  "oleh",
  "karena",
  "setelah",
  "namun",
  "seperti",
  "kalau",
  "jika",
  "mau",
  "sering",
  "masih",
  "lagi",
  "biar",
  "selalu",
  "cuma",
  "kayak",
  "jadi",
  "punya",
  "harus",
  "buat",
  "sama",
  "kalo",
  "udah",
  "lalu",
  "terus",
  "gimana",
  "belum",
  "pernah",
  "semua",
  "setiap",
  "sangat",
  "sangat",
  "banyak",
  "sekali",
  "sangat",
  "paling",
  "sekarang",
  "saat",
  "waktu",
  "bisa",
  "hanya",
  "ada",
  "satu",
]);

function simpleClean(text) {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function simpleStem(word) {
  const prefixes = [
    "me",
    "di",
    "ter",
    "ke",
    "se",
    "pe",
    "ber",
    "mem",
    "men",
    "meng",
    "pem",
    "pen",
    "peng",
  ];
  const suffixes = ["kan", "an", "i", "nya", "lah", "kah"];
  let result = word;
  for (const s of suffixes) {
    if (result.endsWith(s) && result.length - s.length > 2) {
      result = result.slice(0, -s.length);
      break;
    }
  }
  for (const p of prefixes) {
    if (result.startsWith(p) && result.length - p.length > 2) {
      result = result.slice(p.length);
      break;
    }
  }
  return result;
}

/* ---- TF-IDF Compute (simplified) ---- */
const IDF_MOCK = {
  bantu: 2.1,
  mudah: 2.3,
  guna: 2.5,
  nyaman: 2.8,
  rapi: 2.7,
  update: 2.4,
  fitur: 1.9,
  antri: 2.2,
  faskes: 2.6,
  error: 2.0,
  loading: 2.6,
  lama: 1.8,
  lambat: 2.9,
  gagal: 3.1,
  susah: 2.7,
  crash: 3.4,
  bug: 3.2,
  responsif: 2.8,
};

function computeTFIDF(terms) {
  const freq = {};
  terms.forEach((t) => {
    freq[t] = (freq[t] || 0) + 1;
  });
  const N = terms.length || 1;

  return Object.entries(freq)
    .map(([w, c]) => {
      const tf = c / N;
      const idf =
        IDF_MOCK[w] !== undefined
          ? IDF_MOCK[w]
          : parseFloat((1.5 + Math.random() * 1.5).toFixed(2));
      return { w, v: parseFloat((tf * idf).toFixed(3)) };
    })
    .sort((a, b) => b.v - a.v)
    .slice(0, 8);
}

/* ---- Sentiment Scoring ---- */
const POS_WORDS = [
  "bantu",
  "bagus",
  "mudah",
  "baik",
  "senang",
  "puas",
  "cepat",
  "nyaman",
  "rapi",
  "hebat",
  "mantap",
  "keren",
  "oke",
  "aktif",
  "berfungsi",
  "guna",
  "antri",
  "fitur",
  "update",
  "responsif",
  "praktis",
  "canggih",
  "lengkap",
  "mudah",
];

const NEG_WORDS = [
  "error",
  "lama",
  "lambat",
  "rusak",
  "gagal",
  "susah",
  "buruk",
  "parah",
  "jelek",
  "kecewa",
  "masalah",
  "bug",
  "crash",
  "lemot",
  "lelet",
  "loading",
  "tidak",
  "gabisa",
  "trouble",
  "hang",
  "eror",
  "lag",
];

function scoreText(words) {
  let pos = 0,
    neg = 0;
  words.forEach((w) => {
    if (POS_WORDS.some((p) => w.includes(p))) pos++;
    if (NEG_WORDS.some((n) => w.includes(n))) neg++;
  });
  return { pos, neg, total: words.length };
}

function classify(score) {
  const { pos, neg, total } = score;
  if (total === 0) return { label: "Positif", conf: 55 };
  if (pos >= neg) {
    const c = Math.min(95, 58 + Math.round((pos / (pos + neg + 0.1)) * 37));
    return { label: "Positif", conf: c };
  }
  const c = Math.min(95, 58 + Math.round((neg / (pos + neg + 0.1)) * 37));
  return { label: "Negatif", conf: c };
}

/* ---- Color Map ---- */
const COLOR_MAP = {
  Positif: {
    text: "#3B6D11",
    bg: "rgba(234,243,222,0.5)",
    border: "rgba(59,109,17,0.3)",
  },
  Negatif: {
    text: "#A32D2D",
    bg: "rgba(252,235,235,0.5)",
    border: "rgba(163,45,45,0.3)",
  },
};

const BAR_COLOR = {
  Positif: "#639922",
  Negatif: "#E24B4A",
};

/* ---- Main Analyze Function ---- */
/* ---- Main Analyze Function (Terhubung ke Flask) ---- */
async function analyzeKalimat() {
  const raw = document.getElementById("inputKalimat").value.trim();
  if (!raw) {
    document.getElementById("inputKalimat").focus();
    return;
  }

  // Hide result, show loading
  document.getElementById("hasilKlasifikasi").style.display = "none";
  const ld = document.getElementById("loadingDots");
  ld.style.display = "flex";

  try {
    // Memanggil API Flask
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: raw }),
    });

    const result = await response.json();

    if (response.ok) {
      ld.style.display = "none";

      // --- Preprocessing dari Backend ---
      document.getElementById("ppCleansing").textContent =
        result.preprocessing.cleansing || "(kosong)";
      document.getElementById("ppCase").textContent =
        result.preprocessing.case_folding || "(kosong)";
      document.getElementById("ppToken").textContent =
        result.preprocessing.tokenizing || "(kosong)";
      document.getElementById("ppStop").textContent =
        result.preprocessing.stopword || "(kosong)";
      document.getElementById("ppStem").textContent =
        result.preprocessing.stemming || "(kosong)";

      // --- Render SVM ---
      const svmC = COLOR_MAP[result.svm.label];
      const svmLabelEl = document.getElementById("svmLabel");
      svmLabelEl.textContent = result.svm.label;
      svmLabelEl.style.color = svmC.text;
      document.getElementById("svmBox").style.borderColor = svmC.border;
      document.getElementById("svmBox").style.background = svmC.bg;
      document.getElementById("svmConf").textContent =
        `Confidence: ${result.svm.conf}%`;
      const svmBar = document.getElementById("svmBar");
      svmBar.style.width = result.svm.conf + "%";
      svmBar.style.background = BAR_COLOR[result.svm.label];

      // --- Render NB ---
      const nbC = COLOR_MAP[result.nb.label];
      const nbLabelEl = document.getElementById("nbLabel");
      nbLabelEl.textContent = result.nb.label;
      nbLabelEl.style.color = nbC.text;
      document.getElementById("nbBox").style.borderColor = nbC.border;
      document.getElementById("nbBox").style.background = nbC.bg;
      document.getElementById("nbConf").textContent =
        `Confidence: ${result.nb.conf}%`;
      const nbBar = document.getElementById("nbBar");
      nbBar.style.width = result.nb.conf + "%";
      nbBar.style.background = BAR_COLOR[result.nb.label];

      // --- TF-IDF input ---
      const tfidfData = result.tfidf;
      const tfidfEl = document.getElementById("tfidfInput");

      if (tfidfData.length === 0) {
        tfidfEl.innerHTML =
          '<p style="font-size:13px;color:#9aa0a6;font-style:italic">Tidak ada kata bermakna setelah preprocessing.</p>';
      } else {
        const max = tfidfData[0].v;
        tfidfEl.innerHTML = tfidfData
          .map(
            (d) => `
          <div class="tfidf-row">
            <span class="tfidf-word">${d.w}</span>
            <div class="tfidf-bar-wrap">
              <div class="tfidf-bar" style="width:${Math.round((d.v / max) * 100)}%;background:#185FA5"></div>
            </div>
            <span class="tfidf-val">${d.v.toFixed(3)}</span>
          </div>
        `,
          )
          .join("");
      }

      document.getElementById("hasilKlasifikasi").style.display = "block";
      document
        .getElementById("hasilKlasifikasi")
        .scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      alert("Terjadi kesalahan: " + result.error);
      ld.style.display = "none";
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Gagal terhubung ke server.");
    ld.style.display = "none";
  }
}
/* ---- Allow Enter+Ctrl to submit ---- */
document
  .getElementById("inputKalimat")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      analyzeKalimat();
    }
  });

/* ---- Tanggal Real-time Navbar ---- */
function tampilkanTanggal() {
  const dateEl = document.getElementById("realtime-date");
  if (!dateEl) return;

  const hariIni = new Date();

  // Opsi format tanggal: memunculkan nama hari, tanggal, bulan, dan tahun penuh
  const opsi = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  // Gunakan 'id-ID' agar tanggal otomatis diterjemahkan ke format Bahasa Indonesia
  const tanggalFormat = hariIni.toLocaleDateString("id-ID", opsi);

  dateEl.textContent = tanggalFormat;
}

// Jalankan fungsi saat file JS dimuat
tampilkanTanggal();
