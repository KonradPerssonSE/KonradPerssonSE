const $ = (sel) => document.querySelector(sel);

const state = {
  images: [],          // File[] selected or received
  currentImageUrl: "",
  rawText: "",
  contact: emptyContact(),
  db: loadDB(),
};

function emptyContact() {
  return {
    id: crypto.randomUUID(),
    firstName: "",
    lastName: "",
    phones: [{ type: "mobile", value: "" }],
    emails: [{ type: "main", value: "" }],
    org: "",
    title: "",
    note: "",
    sourceText: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* -------------------- Tabs -------------------- */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

function setTab(tab) {
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
  $("#tab-info").classList.toggle("hidden", tab !== "info");
  $("#tab-contacts").classList.toggle("hidden", tab !== "contacts");
  $("#tab-tool").classList.toggle("hidden", tab !== "tool");
}

/* -------------------- PWA -------------------- */
(async function initPWA() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      // ignore; app still works without SW (share-target requires it though)
    }
  }
})();

/* -------------------- DOM bindings -------------------- */
const el = {
  fileInput: $("#file-input"),
  cameraInput: $("#camera-input"),
  rawText: $("#raw-text"),
  status: $("#status"),

  firstName: $("#firstName"),
  lastName: $("#lastName"),
  phoneMobile: $("#phoneMobile"),
  emailMain: $("#emailMain"),
  org: $("#org"),
  title: $("#title"),
  note: $("#note"),

  imgPreview: $("#img-preview"),
  downloadArea: $("#download-area"),

  openaiKey: $("#openai-key"),
  rememberKey: $("#remember-key"),
  openaiModel: $("#openai-model"),
};

el.fileInput.addEventListener("change", (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;
  setImages(files);
});

el.cameraInput.addEventListener("change", (e) => {
  const files = [...(e.target.files || [])];
  if (!files.length) return;
  setImages(files);
});

el.rawText.addEventListener("input", () => {
  state.rawText = el.rawText.value;
});

/* Buttons */
$("#btn-ocr").addEventListener("click", runOCR);
$("#btn-structure").addEventListener("click", structureFromText);
$("#btn-save").addEventListener("click", saveCurrentToDB);

$("#btn-vcf").addEventListener("click", () => offerDownloadSingle("vcf"));
$("#btn-csv").addEventListener("click", () => offerDownloadSingle("csv"));
$("#btn-json").addEventListener("click", () => offerDownloadSingle("json"));
$("#btn-share").addEventListener("click", shareSingleContact);

$("#btn-export-all-vcf").addEventListener("click", exportAllVCF);
$("#btn-export-all-csv").addEventListener("click", exportAllCSV);
$("#btn-export-all-json").addEventListener("click", exportAllJSON);
$("#btn-wipe-db").addEventListener("click", wipeDB);

$("#btn-test-openai").addEventListener("click", testOpenAIKey);
$("#btn-speech").addEventListener("click", voiceToText);

/* -------------------- Share-target intake -------------------- */
(async function checkShareTarget() {
  const params = new URLSearchParams(location.search);
  const isShare = params.get("share-target") === "1";
  if (!isShare) return;

  setStatus("Received shared content. Loading…");
  try {
    const shareCache = await caches.open("share-target-cache");
    const keys = await shareCache.keys();

    const imgKeys = keys
      .map(r => new URL(r.url).pathname)
      .filter(p => p.includes("shared/") && !p.endsWith("/text"))
      .sort();

    const files = [];
    let idx = 0;
    for (const key of imgKeys) {
      const res = await shareCache.match(key);
      if (!res) continue;
      const blob = await res.blob();
      files.push(new File([blob], `shared-${idx++}.png`, { type: blob.type || "image/png" }));
    }

    const textRes = await shareCache.match("shared/text");
    if (textRes) {
      const t = await textRes.text();
      el.rawText.value = t;
      state.rawText = t;
    }

    if (files.length) {
      setImages(files);
      setTab("tool");
      setStatus(`Loaded ${files.length} shared image(s).`);
    } else if (state.rawText) {
      setTab("tool");
      setStatus(`Loaded shared text.`);
    } else {
      setStatus("Share received, but no usable image/text found.");
    }

    // Clean URL (nice UX)
    history.replaceState({}, "", "./");
  } catch (e) {
    setStatus("Could not read shared content (cache access failed).");
  }
})();

/* -------------------- Key storage -------------------- */
(function initKey() {
  const remembered = localStorage.getItem("share-to-struct.openaiKey") || "";
  if (remembered) {
    el.openaiKey.value = remembered;
    el.rememberKey.checked = true;
  }
  el.rememberKey.addEventListener("change", () => {
    if (el.rememberKey.checked) {
      localStorage.setItem("share-to-struct.openaiKey", el.openaiKey.value.trim());
    } else {
      localStorage.removeItem("share-to-struct.openaiKey");
    }
  });
  el.openaiKey.addEventListener("input", () => {
    if (el.rememberKey.checked) {
      localStorage.setItem("share-to-struct.openaiKey", el.openaiKey.value.trim());
    }
  });
})();

/* -------------------- Images & preview -------------------- */
function setImages(files) {
  state.images = files;
  if (state.currentImageUrl) URL.revokeObjectURL(state.currentImageUrl);
  state.currentImageUrl = URL.createObjectURL(files[0]);
  el.imgPreview.src = state.currentImageUrl;
  setStatus(`${files.length} image(s) ready. Run OCR.`);
}

/* -------------------- OCR -------------------- */
async function runOCR() {
  if (!state.images.length) {
    setStatus("Pick or share at least one image first.");
    return;
  }
  if (!window.Tesseract) {
    setStatus("Tesseract.js failed to load.");
    return;
  }

  setStatus("OCR running locally…");
  $("#btn-ocr").disabled = true;

  try {
    let fullText = "";
    for (let i = 0; i < state.images.length; i++) {
      const img = state.images[i];
      setStatus(`OCR ${i + 1}/${state.images.length}…`);
      const result = await Tesseract.recognize(img, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setStatus(`OCR ${i + 1}/${state.images.length}… ${(m.progress * 100).toFixed(0)}%`);
          }
        }
      });
      fullText += (result?.data?.text || "").trim() + "\n\n";
    }

    state.rawText = fullText.trim();
    el.rawText.value = state.rawText;
    setStatus("OCR complete. Now structure the text.");
  } catch (e) {
    setStatus("OCR failed (try a sharper screenshot / higher contrast).");
  } finally {
    $("#btn-ocr").disabled = false;
  }
}

/* -------------------- Structuring -------------------- */
async function structureFromText() {
  const text = (el.rawText.value || "").trim();
  if (!text) {
    setStatus("Paste text or run OCR first.");
    return;
  }

  setStatus("Structuring…");
  $("#btn-structure").disabled = true;

  // 1) Local heuristic parse (always available)
  let contact = heuristicParse(text);

  // 2) Optional OpenAI “clean & structure”
  const key = el.openaiKey.value.trim();
  if (key) {
    try {
      setStatus("Structuring with OpenAI (text only)…");
      contact = await openAIEnhance(key, el.openaiModel.value.trim() || "gpt-5.2", text, contact);
      setStatus("OpenAI enhancement done. Review the fields.");
    } catch (e) {
      setStatus("OpenAI enhancement failed. Using local guess.");
    }
  } else {
    setStatus("Structured with local guess. Review the fields.");
  }

  contact.sourceText = text;
  contact.updatedAt = new Date().toISOString();
  state.contact = contact;
  renderContactForm(contact);
  $("#btn-structure").disabled = false;
}

function heuristicParse(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
  const phoneRe = /(\+?\d[\d\s().-]{6,}\d)/g;

  const emails = [...new Set((text.match(emailRe) || []).map(e => e.trim()))];
  const phones = [...new Set((text.match(phoneRe) || [])
    .map(p => p.replace(/\s+/g, " ").trim())
    .map(p => p.replace(/[^\d+]/g, (ch) => ch === "+" ? "+" : ""))
  )].filter(Boolean);

  // Name guess: first line that doesn't look like phone/email
  let nameLine = lines.find(l => !l.includes("@") && !/\d{3,}/.test(l)) || "";
  nameLine = nameLine.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, " ").replace(/\s+/g, " ").trim();

  let firstName = "";
  let lastName = "";
  if (nameLine) {
    const parts = nameLine.split(" ").filter(Boolean);
    if (parts.length === 1) firstName = parts[0];
    if (parts.length >= 2) {
      lastName = parts.pop();
      firstName = parts.join(" ");
    }
  }

  const c = emptyContact();
  c.firstName = firstName;
  c.lastName = lastName;
  c.phones = [{ type: "mobile", value: phones[0] || "" }];
  c.emails = [{ type: "main", value: emails[0] || "" }];
  c.note = "";
  c.org = "";
  c.title = "";
  c.sourceText = text;
  return c;
}

function renderContactForm(c) {
  el.firstName.value = c.firstName || "";
  el.lastName.value = c.lastName || "";
  el.phoneMobile.value = c.phones?.[0]?.value || "";
  el.emailMain.value = c.emails?.[0]?.value || "";
  el.org.value = c.org || "";
  el.title.value = c.title || "";
  el.note.value = c.note || "";
}

/* Keep state.contact synced while editing */
["input","change"].forEach(evt => {
  $("#contact-form").addEventListener(evt, () => {
    state.contact.firstName = el.firstName.value.trim();
    state.contact.lastName = el.lastName.value.trim();
    state.contact.phones = [{ type: "mobile", value: el.phoneMobile.value.trim() }];
    state.contact.emails = [{ type: "main", value: el.emailMain.value.trim() }];
    state.contact.org = el.org.value.trim();
    state.contact.title = el.title.value.trim();
    state.contact.note = el.note.value.trim();
    state.contact.updatedAt = new Date().toISOString();
  });
});

/* -------------------- OpenAI (Responses API) -------------------- */
async function openAIEnhance(apiKey, model, ocrText, currentGuess) {
  // Responses API docs: /v1/responses (structured outputs supported) 7
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      phones: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: { type: "string" },
            value: { type: "string" }
          },
          required: ["type","value"]
        }
      },
      emails: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: { type: "string" },
            value: { type: "string" }
          },
          required: ["type","value"]
        }
      },
      org: { type: "string" },
      title: { type: "string" },
      note: { type: "string" }
    },
    required: ["firstName","lastName","phones","emails","org","title","note"]
  };

  const prompt =
`You are structuring contact data from OCR text.
Return ONLY JSON matching the schema.
Rules:
- Prefer OCR facts; do not invent.
- Normalize phone numbers cautiously; keep as-is if uncertain.
- If name unsure, leave blank fields rather than guessing.

OCR TEXT:
${ocrText}

CURRENT GUESS JSON:
${JSON.stringify({
  firstName: currentGuess.firstName,
  lastName: currentGuess.lastName,
  phones: currentGuess.phones,
  emails: currentGuess.emails,
  org: currentGuess.org,
  title: currentGuess.title,
  note: currentGuess.note
}, null, 2)}
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: { format: { type: "json_schema", name: "contact", schema } }
    })
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const data = await res.json();
  // Most convenient field: output_text in docs/examples 8
  const out = data.output_text || "";
  const enhanced = JSON.parse(out);

  const c = emptyContact();
  c.firstName = enhanced.firstName || "";
  c.lastName = enhanced.lastName || "";
  c.phones = (enhanced.phones && enhanced.phones.length) ? enhanced.phones : [{ type:"mobile", value:"" }];
  c.emails = (enhanced.emails && enhanced.emails.length) ? enhanced.emails : [{ type:"main", value:"" }];
  c.org = enhanced.org || "";
  c.title = enhanced.title || "";
  c.note = enhanced.note || "";
  c.sourceText = ocrText;
  return c;
}

async function testOpenAIKey() {
  const key = el.openaiKey.value.trim();
  if (!key) return setStatus("Add an API key first.");
  setStatus("Testing key…");
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${key}` },
      body: JSON.stringify({ model: el.openaiModel.value.trim() || "gpt-5.2", input: "Say OK." })
    });
    if (!res.ok) throw new Error("Bad key or blocked request.");
    setStatus("Key works.");
  } catch (e) {
    setStatus("Key test failed.");
  }
}

/* -------------------- Voice input -------------------- */
function voiceToText() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return setStatus("Speech recognition not supported in this browser.");
  const rec = new SR();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.onresult = (e) => {
    let t = "";
    for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
    el.rawText.value = (el.rawText.value + " " + t).trim();
    state.rawText = el.rawText.value;
  };
  rec.onerror = () => setStatus("Voice input error.");
  rec.onend = () => setStatus("Voice input stopped.");
  setStatus("Listening…");
  rec.start();
}

/* -------------------- Local DB -------------------- */
function loadDB() {
  try {
    return JSON.parse(localStorage.getItem("share-to-struct.db") || "[]");
  } catch {
    return [];
  }
}
function saveDB() {
  localStorage.setItem("share-to-struct.db", JSON.stringify(state.db));
}
function saveCurrentToDB() {
  // Ensure latest edits are captured
  $("#contact-form").dispatchEvent(new Event("change"));

  const c = structuredFromForm();
  if (!c.firstName && !c.lastName && !c.phones?.[0]?.value && !c.emails?.[0]?.value) {
    setStatus("Contact looks empty. Add at least name/phone/email.");
    return;
  }

  // Upsert
  const idx = state.db.findIndex(x => x.id === c.id);
  if (idx >= 0) state.db[idx] = c;
  else state.db.unshift(c);

  saveDB();
  renderDB();
  setStatus("Saved locally.");
  setTab("contacts");
}

function structuredFromForm() {
  const c = state.contact || emptyContact();
  c.firstName = el.firstName.value.trim();
  c.lastName = el.lastName.value.trim();
  c.phones = [{ type: "mobile", value: el.phoneMobile.value.trim() }];
  c.emails = [{ type: "main", value: el.emailMain.value.trim() }];
  c.org = el.org.value.trim();
  c.title = el.title.value.trim();
  c.note = el.note.value.trim();
  c.updatedAt = new Date().toISOString();
  return c;
}

/* -------------------- Rendering DB list -------------------- */
function renderDB() {
  const list = $("#contacts-list");
  list.innerHTML = "";

  if (!state.db.length) {
    list.innerHTML = `<div class="hint">No saved contacts yet.</div>`;
    return;
  }

  for (const c of state.db) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "(Unnamed)";
    const phone = c.phones?.[0]?.value || "";
    const email = c.emails?.[0]?.value || "";
    const meta = [phone, email, c.org].filter(Boolean).join(" · ");
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div><strong>${escapeHtml(name)}</strong></div>
      <div class="meta">${escapeHtml(meta || "—")}</div>
      <div class="actions">
        <button class="btn subtle" data-act="open" data-id="${c.id}">Open</button>
        <button class="btn subtle" data-act="vcf" data-id="${c.id}">vCard</button>
        <button class="btn subtle" data-act="csv" data-id="${c.id}">CSV</button>
        <button class="btn subtle" data-act="json" data-id="${c.id}">JSON</button>
        <button class="btn subtle" data-act="del" data-id="${c.id}">Delete</button>
      </div>
    `;
    list.appendChild(item);
  }

  list.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => handleDBAction(btn.dataset.act, btn.dataset.id));
  });
}

function handleDBAction(act, id) {
  const c = state.db.find(x => x.id === id);
  if (!c) return;

  if (act === "open") {
    state.contact = JSON.parse(JSON.stringify(c));
    renderContactForm(state.contact);
    el.rawText.value = state.contact.sourceText || "";
    state.rawText = el.rawText.value;
    setTab("tool");
    setStatus("Loaded saved contact. Edit + export.");
  }

  if (act === "del") {
    state.db = state.db.filter(x => x.id !== id);
    saveDB();
    renderDB();
    setStatus("Deleted.");
  }

  if (act === "vcf") downloadBlob(makeVCard(c), `${fileSafeName(c)}.vcf`, "text/vcard");
  if (act === "csv") downloadBlob(makeCSV([c]), `${fileSafeName(c)}.csv`, "text/csv");
  if (act === "json") downloadBlob(JSON.stringify(c, null, 2), `${fileSafeName(c)}.json`, "application/json");
}

function wipeDB() {
  if (!confirm("Delete local contacts DB on this device?")) return;
  state.db = [];
  saveDB();
  renderDB();
  setStatus("Local DB cleared.");
}

/* -------------------- Export helpers -------------------- */
function offerDownloadSingle(type) {
  const c = structuredFromForm();
  $("#download-area").innerHTML = "";

  if (type === "vcf") {
    const v = makeVCard(c);
    addDownloadLink(v, `${fileSafeName(c)}.vcf`, "text/vcard");
  }
  if (type === "csv") {
    const csv = makeCSV([c]);
    addDownloadLink(csv, `${fileSafeName(c)}.csv`, "text/csv");
  }
  if (type === "json") {
    const j = JSON.stringify(c, null, 2);
    addDownloadLink(j, `${fileSafeName(c)}.json`, "application/json");
  }
}

function exportAllVCF() {
  if (!state.db.length) return setStatus("No saved contacts.");
  const vcf = state.db.map(makeVCard).join("\n");
  downloadBlob(vcf, `share-to-struct-all.vcf`, "text/vcard");
}
function exportAllCSV() {
  if (!state.db.length) return setStatus("No saved contacts.");
  downloadBlob(makeCSV(state.db), `share-to-struct-all.csv`, "text/csv");
}
function exportAllJSON() {
  downloadBlob(JSON.stringify(state.db, null, 2), `share-to-struct-all.json`, "application/json");
}

function makeVCard(c) {
  // vCard 4.0 basics (RFC 6350) 9
  const fn = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  const n = `${escapeV(c.lastName)};${escapeV(c.firstName)};;;`;
  const tel = (c.phones?.[0]?.value || "").trim();
  const email = (c.emails?.[0]?.value || "").trim();

  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `UID:${c.id}`,
    `REV:${new Date(c.updatedAt || Date.now()).toISOString()}`
  ];

  if (fn) lines.push(`FN:${escapeV(fn)}`);
  if (c.firstName || c.lastName) lines.push(`N:${n}`);
  if (tel) lines.push(`TEL;TYPE=cell:${escapeV(tel)}`);
  if (email) lines.push(`EMAIL:${escapeV(email)}`);
  if (c.org) lines.push(`ORG:${escapeV(c.org)}`);
  if (c.title) lines.push(`TITLE:${escapeV(c.title)}`);
  if (c.note) lines.push(`NOTE:${escapeV(c.note)}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function makeCSV(contacts) {
  // Minimal Google-friendly CSV. For maximal compatibility, mirror Google’s template headers. 10
  const header = [
    "Name",
    "Given Name",
    "Family Name",
    "Phone 1 - Type",
    "Phone 1 - Value",
    "E-mail 1 - Type",
    "E-mail 1 - Value",
    "Organization 1 - Name",
    "Job Title 1 - Title",
    "Notes"
  ];

  const rows = contacts.map(c => {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
    return [
      name,
      c.firstName || "",
      c.lastName || "",
      "Mobile",
      (c.phones?.[0]?.value || ""),
      "Main",
      (c.emails?.[0]?.value || ""),
      c.org || "",
      c.title || "",
      c.note || ""
    ].map(csvCell).join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

function csvCell(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fileSafeName(c) {
  const base = ([c.firstName, c.lastName].filter(Boolean).join("-") || "contact").toLowerCase();
  return base.replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}

function addDownloadLink(text, filename, mime) {
  const a = document.createElement("a");
  const blob = new Blob([text], { type: mime });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.textContent = `Download ${filename}`;
  $("#download-area").appendChild(a);
}

function downloadBlob(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Share via Web Share API (Android Chrome supports sharing files in many cases) */
async function shareSingleContact() {
  const c = structuredFromForm();
  const vcf = makeVCard(c);
  const file = new File([vcf], `${fileSafeName(c)}.vcf`, { type: "text/vcard" });

  if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
    setStatus("Sharing not supported here. Use Get vCard → Download, then open/import.");
    offerDownloadSingle("vcf");
    return;
  }

  try {
    await navigator.share({ files: [file], title: "Contact vCard" });
    setStatus("Shared.");
  } catch {
    setStatus("Share cancelled.");
  }
}

/* -------------------- Utilities -------------------- */
function setStatus(msg) { el.status.textContent = msg; }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}
function escapeV(s) {
  // Basic vCard escaping
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/* Initial render */
renderDB();
setTab("info");
setStatus("Tip: Install the PWA to enable Share → Share to Struct.");