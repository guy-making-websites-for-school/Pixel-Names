
const nameInput = document.getElementById("nameInput");
const generateBtn = document.getElementById("generateBtn");
const resultsContainer = document.getElementById("results");
const fullscreen = document.getElementById("fullscreen");

let results = [];
let selectedIndex = -1;

// LANGUAGE CONVERTERS

function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function arabicName(name) {
  const map = {
    a: "ا", b: "ب", c: "ك", d: "د", e: "ي",
    f: "ف", g: "ج", h: "ه", i: "ي", j: "ج",
    k: "ك", l: "ل", m: "م", n: "ن", o: "و",
    p: "ب", q: "ق", r: "ر", s: "س", t: "ت",
    u: "و", v: "ف", w: "و", x: "كس", y: "ي",
    z: "ز"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

function japaneseName(name) {
  const map = {
    a: "ア", b: "ブ", c: "ク", d: "ド", e: "エ",
    f: "フ", g: "グ", h: "ハ", i: "イ", j: "ジ",
    k: "カ", l: "ル", m: "ム", n: "ン", o: "オ",
    p: "プ", q: "ク", r: "ル", s: "ス", t: "ト",
    u: "ウ", v: "ヴ", w: "ワ", x: "クス", y: "ヤ",
    z: "ズ"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

function koreanName(name) {
  const map = {
    a: "아", b: "브", c: "크", d: "드", e: "에",
    f: "프", g: "그", h: "흐", i: "이", j: "지",
    k: "크", l: "르", m: "므", n: "느", o: "오",
    p: "프", q: "크", r: "르", s: "스", t: "트",
    u: "우", v: "브", w: "우", x: "क्स", y: "야",
    z: "즈"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

function chineseName(name) {
  const map = {
    a: "阿", b: "布", c: "克", d: "德", e: "艾",
    f: "弗", g: "格", h: "赫", i: "伊", j: "杰",
    k: "凯", l: "尔", m: "姆", n: "恩", o: "欧",
    p: "普", q: "奇", r: "尔", s: "斯", t: "特",
    u: "乌", v: "维", w: "威", x: "克斯", y: "伊",
    z: "兹"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

function russianName(name) {
  const map = {
    a: "а", b: "б", c: "к", d: "д", e: "е",
    f: "ф", g: "г", h: "х", i: "и", j: "дж",
    k: "к", l: "л", m: "м", n: "н", o: "о",
    p: "п", q: "к", r: "р", s: "с", t: "т",
    u: "у", v: "в", w: "в", x: "кс", y: "й",
    z: "з"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

function thaiName(name) {
  const map = {
    a: "อะ", b: "บ", c: "ค", d: "ด", e: "เอ",
    f: "ฟ", g: "ก", h: "ฮ", i: "อิ", j: "จ",
    k: "ก", l: "ล", m: "ม", n: "น", o: "โอ",
    p: "พ", q: "ค", r: "ร", s: "ส", t: "ท",
    u: "อุ", v: "ว", w: "ว", x: "กซ", y: "ย",
    z: "ซ"
  };

  return name.toLowerCase().split("").map(char =>
    map[char] || (char === " " ? " " : char)
  ).join("");
}

// Turkish and Portuguese use the Latin alphabet.
// These keep the original spelling of the name.

function turkishName(name) {
  return name;
}

function portugueseName(name) {
  return name;
}

// ALL NINE LANGUAGES

const languages = [
  {
    name: "English",
    native: "English",
    note: "Original name",
    convert: name => name
  },
  {
    name: "Arabic",
    native: "العربية",
    note: "Approximate Arabic transliteration",
    convert: arabicName
  },
  {
    name: "Japanese",
    native: "日本語",
    note: "Approximate Japanese-style transliteration",
    convert: japaneseName
  },
  {
    name: "Korean",
    native: "한국어",
    note: "Approximate Korean-style transliteration",
    convert: koreanName
  },
  {
    name: "Chinese",
    native: "中文",
    note: "Approximate Chinese character rendering",
    convert: chineseName
  },
  {
    name: "Russian",
    native: "Русский",
    note: "Approximate Russian transliteration",
    convert: russianName
  },
  {
    name: "Thai",
    native: "ภาษาไทย",
    note: "Approximate Thai-style transliteration",
    convert: thaiName
  },
  {
    name: "Turkish",
    native: "Türkçe",
    note: "Turkish uses the Latin alphabet",
    convert: turkishName
  },
  {
    name: "Portuguese",
    native: "Português",
    note: "Portuguese uses the Latin alphabet",
    convert: portugueseName
  }
];

// PIXEL ART DRAWING

function drawPixelArt(canvas, text) {
  const ctx = canvas.getContext("2d");

  const width = 900;
  const height = 400;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#0a1426";
  ctx.fillRect(0, 0, width, height);

  // Pixel background pattern

  ctx.fillStyle = "#142744";

  for (let x = 0; x < width; x += 30) {
    for (let y = 0; y < height; y += 30) {
      if ((x + y) % 60 === 0) {
        ctx.fillRect(x, y, 5, 5);
      }
    }
  }

  // Draw the name

  let fontSize = 100;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "auto";

  do {
    ctx.font = `bold ${fontSize}px monospace`;

    if (ctx.measureText(text).width <= width - 80) {
      break;
    }

    fontSize -= 4;
  } while (fontSize > 20);

  ctx.shadowColor = "#00cfff";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#65eaff";

  ctx.fillText(text, width / 2, height / 2);

  ctx.shadowBlur = 0;

  // Pixel decorations

  ctx.fillStyle = "#a855f7";

  for (let i = 0; i < 20; i++) {
    const x = (i * 97 + 31) % width;
    const y = (i * 53 + 17) % height;

    ctx.fillRect(x, y, 6, 6);
  }
}

// DOWNLOAD CANVAS

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");

  link.download = filename + ".png";
  link.href = canvas.toDataURL("image/png");

  link.click();
}

// GENERATE RESULTS

function generateNames() {
  const name = cleanName(nameInput.value);

  if (!name) {
    alert("Please enter your name first!");
    return;
  }

  results = languages.map(language => ({
    language: language.name,
    native: language.native,
    text: language.convert(name),
    note: language.note
  }));

  resultsContainer.innerHTML = "";

  results.forEach((result, index) => {
    const card = document.createElement("div");
    card.className = "language-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      "Open " + result.language + " in fullscreen"
    );

    const heading = document.createElement("h3");
    heading.textContent = result.language;

    const native = document.createElement("p");
    native.className = "native";
    native.textContent = result.native;

    const nameText = document.createElement("p");
    nameText.className = "name-preview";
    nameText.textContent = result.text;

    const canvas = document.createElement("canvas");
    drawPixelArt(canvas, result.text);

    const downloadButton = document.createElement("button");
    downloadButton.className = "card-download";
    downloadButton.textContent = "Download PNG";

    downloadButton.addEventListener("click", event => {
      event.stopPropagation();
      downloadCanvas(canvas, result.language + "-Pixel-Name");
    });

    // EVERY LANGUAGE CARD OPENS FULLSCREEN

    card.addEventListener("click", () => {
      openFullscreen(index);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFullscreen(index);
      }
    });

    card.appendChild(heading);
    card.appendChild(native);
    card.appendChild(nameText);
    card.appendChild(canvas);
    card.appendChild(downloadButton);

    resultsContainer.appendChild(card);
  });
}

// FULLSCREEN FUNCTION

function openFullscreen(index) {
  const result = results[index];

  if (!result) return;

  selectedIndex = index;

  document.getElementById("fullLanguage").textContent =
    result.language + " — " + result.native;

  document.getElementById("fullName").textContent =
    result.text;

  document.getElementById("fullNote").textContent =
    result.note;

  drawPixelArt(
    document.getElementById("fullArt"),
    result.text
  );

  fullscreen.classList.add("active");
  document.body.style.overflow = "hidden";
}

// CLOSE FULLSCREEN

function closeFullscreen() {
  fullscreen.classList.remove("active");
  document.body.style.overflow = "";
  selectedIndex = -1;
}

// Close when clicking the background

fullscreen.addEventListener("click", event => {
  if (event.target === fullscreen) {
    closeFullscreen();
  }
});

// Close with Escape key

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && fullscreen.classList.contains("active")) {
    closeFullscreen();
  }
});

// FULLSCREEN DOWNLOAD BUTTON

document.getElementById("fullDownload").addEventListener("click", () => {
  if (selectedIndex === -1) return;

  const result = results[selectedIndex];

  downloadCanvas(
    document.getElementById("fullArt"),
    result.language + "-Pixel-Name"
  );
});

// DOWNLOAD ALL NAMES

document.getElementById("downloadAll").addEventListener("click", () => {
  if (results.length === 0) {
    alert("Generate your names first!");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = results.length * 180 + 50;

  ctx.fillStyle = "#0a1426";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  results.forEach((result, index) => {
    const y = index * 180 + 45;

    ctx.fillStyle = "#65eaff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(result.language + ":", 30, y);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px monospace";
    ctx.fillText(result.text, 30, y + 55);
  });

  downloadCanvas(canvas, "All-Pixel-Names");
});

// BUTTON EVENTS

generateBtn.addEventListener("click", generateNames);

nameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    generateNames();
  }
});

// BACKGROUND PIXELS

const backgroundPixels = document.getElementById("backgroundPixels");

for (let i = 0; i < 35; i++) {
  const pixel = document.createElement("div");

  pixel.style.position = "absolute";
  pixel.style.width = "5px";
  pixel.style.height = "5px";
  pixel.style.background = "#65eaff";
  pixel.style.opacity = Math.random() * 0.25;
  pixel.style.left = Math.random() * 100 + "%";
  pixel.style.top = Math.random() * 100 + "%";

  backgroundPixels.appendChild(pixel);
}
