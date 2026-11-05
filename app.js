// ---- Ayarlar: ders saatleri farklıysa burayı değiştir ----
// Dikkat: dersler slot numarasıyla kaydedilir; FIRST_SLOT değişirse kayıtlı programlar da kayar.
const FIRST_SLOT = { h: 9, m: 30 }; // ilk dersin başlangıcı
const SLOT_COUNT = 10;              // 09:30, 10:30 … 18:30
const SLOT_MINUTES = 50;            // bir ders saatinin süresi

const ALL_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const ALL_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const DAYS = ALL_DAYS.slice(0, 5);
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const PALETTE = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777'];
const STORE_KEY = 'ep.programs';
const SEL_KEY = 'ep.selected';
const SEEN_KEY = 'ep.hazirEklenen'; // eklenmiş hazır programların id'leri
const MODE_KEY = 'ep.mod';
const EXAM_HIDDEN_KEY = 'ep.sinavGizli'; // sınav modunda gizlenen ders kodları
const MAX_CHIPS = 3;
const MAX_DOTS = 6;
const SHORT_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
const mobileQuery = window.matchMedia('(max-width: 760px)');
const isMobile = () => mobileQuery.matches;
const HINT_DESKTOP = 'Bir gün sütununda saatleri sürükleyerek seç, sonra ders adını yaz. Var olan bir derse tıklayarak düzenleyebilir ya da silebilirsin.';
const HINT_MOBILE = 'Dersin başladığı saate, sonra bittiği saate dokun. Tek saatlik ders için aynı saate iki kez dokun. Var olan derse dokunarak düzenleyebilirsin.';

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
const slotStart = (i) => fmt(FIRST_SLOT.h * 60 + FIRST_SLOT.m + i * 60);
const slotEnd = (i) => fmt(FIRST_SLOT.h * 60 + FIRST_SLOT.m + i * 60 + SLOT_MINUTES);
const rangeText = (e) => `${slotStart(e.start)}–${slotEnd(e.end - 1)}`;
const info = (...parts) => parts.filter(Boolean).join(' · ');
const weekdayIndex = (d) => (d.getDay() + 6) % 7; // Pazartesi = 0
const sameDay = (a, b) => a.toDateString() === b.toDateString();

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* depolama kapalıysa sessizce geç */ }
}

// Program: { id, name, color, entries: [{ id, day (0-4), start, end (slot, end hariç), name, room, teacher }] }
let programs = load(STORE_KEY, []);
let selected = new Set(load(SEL_KEY, programs.map((p) => p.id)));

// programlar.js'deki hazır programları her tarayıcıya bir kez ekle
const seen = new Set(load(SEEN_KEY, []));
for (const p of window.HAZIR_PROGRAMLAR || []) {
  if (seen.has(p.id)) continue;
  if (!programs.some((x) => x.id === p.id)) {
    programs.push({ ...p, entries: p.entries.map((e) => ({ ...e, id: uid() })) });
    selected.add(p.id);
  }
  seen.add(p.id);
}
store(STORE_KEY, programs);
store(SEL_KEY, [...selected]);
store(SEEN_KEY, [...seen]);

// Aynı saatlere düşen dersleri yan yana şeritlere yerleştirir: Map(ders → { lane, n })
function layoutLanes(list) {
  const pos = new Map();
  const sorted = [...list].sort((a, b) => a.start - b.start || a.end - b.end);
  let cluster = [], ends = [], clusterEnd = -1;
  const flush = () => { for (const e of cluster) pos.get(e).n = ends.length; cluster = []; ends = []; };
  for (const e of sorted) {
    if (e.start >= clusterEnd) flush();
    let lane = ends.findIndex((end) => end <= e.start);
    if (lane < 0) { lane = ends.length; ends.push(0); }
    ends[lane] = e.end;
    pos.set(e, { lane, n: 1 });
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  }
  flush();
  return pos;
}
let viewMonth = startOfMonth(new Date());
let selectedDay = nearestWeekday(new Date());

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function nearestWeekday(d) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (r.getDay() === 6) r.setDate(r.getDate() + 2);
  if (r.getDay() === 0) r.setDate(r.getDate() + 1);
  return r;
}

function eventsFor(date) {
  const wd = weekdayIndex(date);
  const out = [];
  for (const p of programs) {
    if (!selected.has(p.id)) continue;
    for (const e of p.entries) if (e.day === wd) out.push({ ...e, program: p });
  }
  return out.sort((a, b) => a.start - b.start || a.end - b.end);
}

// ---------------- Sol menü ----------------
function renderSidebar() {
  const ul = $('program-list');
  ul.innerHTML = '';
  $('empty-programs').hidden = programs.length > 0;
  for (const p of programs) {
    const li = document.createElement('li');
    li.className = 'program-item';
    li.style.setProperty('--c', p.color);
    li.innerHTML = '<label><input type="checkbox"><span class="swatch"></span><span class="pname"></span></label><button class="btn small" aria-label="Düzenle"><span class="long">Düzenle</span><span class="short">✎</span></button>';
    const cb = li.querySelector('input');
    cb.checked = selected.has(p.id);
    cb.onchange = () => {
      if (cb.checked) selected.add(p.id); else selected.delete(p.id);
      store(SEL_KEY, [...selected]);
      renderCalendar();
    };
    li.querySelector('.swatch').style.background = p.color;
    li.querySelector('.pname').textContent = p.name;
    li.querySelector('label').title = p.name;
    li.querySelector('button').onclick = () => openEditor(p);
    ul.append(li);
  }
}

// ---------------- Aylık takvim (iki mod da kullanır) ----------------
// eventsOf(gün) → [{ color, label, title }]; cols: haftada kaç gün (5 = Pzt–Cum, 6 = Pzt–Cmt)
function buildMonth({ grid, titleEl, month, cols, selectedDay: sel, eventsOf, onPick }) {
  titleEl.textContent = `${MONTHS[month.getMonth()]} ${month.getFullYear()}`;
  grid.innerHTML = '';
  grid.style.setProperty('--cols', cols);
  for (let i = 0; i < cols; i++) {
    grid.insertAdjacentHTML('beforeend', `<div class="dow"><span class="long">${ALL_DAYS[i]}</span><span class="short">${ALL_SHORT[i]}</span></div>`);
  }

  const start = new Date(month);
  start.setDate(1 - weekdayIndex(month));
  if (weekdayIndex(month) >= cols) start.setDate(start.getDate() + 7); // ay gösterilmeyen bir günde başlıyorsa
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const today = new Date();

  for (const week = new Date(start); week <= last; week.setDate(week.getDate() + 7)) {
    for (let i = 0; i < cols; i++) {
      const day = new Date(week);
      day.setDate(week.getDate() + i);
      const cell = document.createElement('button');
      cell.className = 'day-cell';
      cell.classList.toggle('other', day.getMonth() !== month.getMonth());
      cell.classList.toggle('today', sameDay(day, today));
      cell.classList.toggle('selected', sameDay(day, sel));
      cell.innerHTML = `<span class="date-num">${day.getDate()}</span>`;

      const evs = eventsOf(day);
      for (const e of evs.slice(0, MAX_CHIPS)) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.style.setProperty('--c', e.color);
        chip.textContent = e.label;
        chip.title = e.title;
        cell.append(chip);
      }
      if (evs.length > MAX_CHIPS) cell.insertAdjacentHTML('beforeend', `<span class="more">+${evs.length - MAX_CHIPS} daha</span>`);
      if (evs.length) { // telefonda etiket yerine renkli noktalar
        const dots = document.createElement('span');
        dots.className = 'dots';
        for (const e of evs.slice(0, MAX_DOTS)) {
          const dot = document.createElement('i');
          dot.style.background = e.color;
          dots.append(dot);
        }
        cell.append(dots);
      }

      cell.onclick = () => onPick(day);
      grid.append(cell);
    }
  }
}

function renderMonth() {
  buildMonth({
    grid: $('month-grid'), titleEl: $('month-title'), month: viewMonth, cols: 5, selectedDay,
    eventsOf: (day) => eventsFor(day).map((e) => ({
      color: e.program.color,
      label: `${slotStart(e.start)} ${e.name}`,
      title: info(e.name, rangeText(e), e.room, e.teacher, e.program.name),
    })),
    onPick: (day) => { selectedDay = day; renderCalendar(); },
  });
}

// ---------------- Seçilen günün saatlik programı ----------------
function renderDay() {
  $('day-title').textContent = selectedDay.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const g = $('day-grid');
  g.innerHTML = '';
  g.style.setProperty('--slots', SLOT_COUNT);
  for (let i = 0; i < SLOT_COUNT; i++) {
    g.insertAdjacentHTML('beforeend', `<div class="time" style="grid-row:${i + 1}">${slotStart(i)}</div><div class="line" style="grid-row:${i + 1}"></div>`);
  }

  const evs = eventsFor(selectedDay);
  $('day-empty').hidden = evs.length > 0;

  const pos = layoutLanes(evs);
  const track = document.createElement('div');
  track.className = 'track';
  track.style.gridRow = `1 / ${SLOT_COUNT + 1}`;
  for (const e of evs) {
    const b = document.createElement('div');
    b.className = 'event';
    b.style.setProperty('--c', e.program.color);
    b.style.top = `calc(${e.start} * var(--row))`;
    b.style.height = `calc(${e.end - e.start} * var(--row) - 4px)`;
    const { lane, n } = pos.get(e);
    b.style.left = `${(lane * 100) / n}%`;
    b.style.width = `calc(${100 / n}% - 4px)`;
    b.innerHTML = '<strong></strong><span></span>';
    b.querySelector('strong').textContent = e.name;
    b.querySelector('span').textContent = info(rangeText(e), e.room, e.teacher, e.program.name);
    b.title = info(e.name, rangeText(e), e.room, e.teacher, e.program.name);
    track.append(b);
  }
  g.append(track);

  // Telefon için liste görünümü
  const list = $('day-list');
  list.innerHTML = '';
  for (const e of evs) {
    const li = document.createElement('li');
    li.style.setProperty('--c', e.program.color);
    li.innerHTML = `<span class="t">${slotStart(e.start)}<br>${slotEnd(e.end - 1)}</span><div><strong></strong><span></span></div>`;
    li.querySelector('strong').textContent = e.name;
    li.querySelector('div span').textContent = info(e.room, e.teacher, e.program.name);
    list.append(li);
  }
}

function renderCalendar() { renderMonth(); renderDay(); }

// ---------------- Ders programı düzenleyici ----------------
let draft = null;        // düzenlenen programın kopyası
let isNew = false;
let sel = null;          // { day, a, b } seçili hücre aralığı
let editingEntry = null; // tıklanıp düzenlenen ders
let dragging = false;
let editDay = 0;         // telefonda düzenleyicide gösterilen gün
let tapStart = null;     // telefonda ilk dokunulan saat { day, s }
let lastPointer = 'mouse';

function setHint(warning) {
  const h = $('hint');
  h.classList.toggle('warn', !!warning);
  if (warning) h.textContent = warning;
  else if (tapStart) h.textContent = `Başlangıç ${slotStart(tapStart.s)}. Şimdi dersin bittiği saate dokun.`;
  else h.textContent = isMobile() ? HINT_MOBILE : HINT_DESKTOP;
}

function renderDayTabs() {
  const tabs = $('day-tabs');
  tabs.innerHTML = '';
  DAYS.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.classList.toggle('active', i === editDay);
    const count = draft.entries.filter((e) => e.day === i).length;
    b.innerHTML = `${SHORT_DAYS[i]}${count ? `<small>${count}</small>` : ''}`;
    b.onclick = () => { editDay = i; tapStart = null; closeEntryForm(); };
    tabs.append(b);
  });
}

function openEditor(p) {
  isNew = !p;
  editDay = Math.min(weekdayIndex(selectedDay), 4);
  tapStart = null;
  draft = p ? structuredClone(p) : { id: uid(), name: '', color: PALETTE[programs.length % PALETTE.length], entries: [] };
  $('program-name').value = draft.name;
  $('program-name').classList.remove('invalid');
  $('program-color').value = draft.color;
  $('delete-program').hidden = isNew;
  resetDeleteButton();
  closeEntryForm();
  $('editor').hidden = false;
  $('program-name').focus();
}

function closeEditor() {
  $('editor').hidden = true;
  draft = null;
}

function renderWeek() {
  const single = isMobile(); // telefonda tek gün sütunu
  const days = single ? [editDay] : [0, 1, 2, 3, 4];
  const col = (d) => (single ? 2 : d + 2);
  const g = $('week-grid');
  g.innerHTML = '<div></div>';
  g.classList.toggle('single', single);
  g.style.setProperty('--slots', SLOT_COUNT);
  if (!single) DAYS.forEach((d, i) => g.insertAdjacentHTML('beforeend', `<div class="wh" style="grid-column:${i + 2}">${d}</div>`));
  for (let s = 0; s < SLOT_COUNT; s++) {
    g.insertAdjacentHTML('beforeend', `<div class="time" style="grid-row:${s + 2}">${slotStart(s)}</div>`);
    for (const d of days) {
      g.insertAdjacentHTML('beforeend', `<div class="cell" data-day="${d}" data-slot="${s}" style="grid-row:${s + 2};grid-column:${col(d)}"></div>`);
    }
  }
  const pos = new Map();
  for (const d of days) layoutLanes(draft.entries.filter((e) => e.day === d)).forEach((v, k) => pos.set(k, v));
  for (const e of draft.entries) {
    if (!days.includes(e.day)) continue;
    const b = document.createElement('div');
    b.className = 'block';
    b.classList.toggle('editing', editingEntry === e);
    b.style.gridColumn = col(e.day);
    const { lane, n } = pos.get(e);
    if (n > 1) { // çakışan şubeler yan yana
      b.style.justifySelf = 'start';
      b.style.width = `calc(${100 / n}% - 4px)`;
      b.style.marginLeft = `calc(${(lane * 100) / n}% + 2px)`;
    }
    b.title = info(e.name, rangeText(e), e.room, e.teacher);
    b.style.gridRow = `${e.start + 2} / ${e.end + 2}`;
    b.style.setProperty('--c', draft.color);
    b.innerHTML = '<strong></strong><span></span>';
    b.querySelector('strong').textContent = e.name;
    b.querySelector('span').textContent = info(rangeText(e), e.room, e.teacher);
    b.onclick = () => { tapStart = null; openEntryForm(e); };
    g.append(b);
  }
  paintSel();
  renderDayTabs();
  setHint();
}

function paintSel() {
  const lo = sel ? Math.min(sel.a, sel.b) : -1;
  const hi = sel ? Math.max(sel.a, sel.b) : -1;
  for (const c of $('week-grid').querySelectorAll('.cell')) {
    const on = sel && +c.dataset.day === sel.day && +c.dataset.slot >= lo && +c.dataset.slot <= hi;
    c.classList.toggle('sel', !!on);
  }
}

function finishSelection() {
  const start = Math.min(sel.a, sel.b);
  const end = Math.max(sel.a, sel.b) + 1;
  const clash = draft.entries.some((e) => e.day === sel.day && e.start < end && start < e.end);
  if (clash) { sel = null; paintSel(); setHint('Seçtiğin saatlerde zaten bir ders var.'); return; }
  sel = { day: sel.day, a: start, b: end - 1 };
  openEntryForm(null);
}

function openEntryForm(entry) {
  editingEntry = entry;
  if (entry) sel = null;
  const r = entry ?? { day: sel.day, start: sel.a, end: sel.b + 1 };
  $('entry-range').textContent = `${DAYS[r.day]} ${rangeText(r)}`;
  $('entry-name').value = entry?.name ?? '';
  $('entry-room').value = entry?.room ?? '';
  $('entry-teacher').value = entry?.teacher ?? '';
  $('entry-submit').textContent = entry ? 'Güncelle' : 'Ekle';
  $('entry-delete').hidden = !entry;
  $('entry-form').hidden = false;
  renderWeek();
  $('entry-name').focus();
}

function closeEntryForm() {
  sel = null;
  tapStart = null;
  editingEntry = null;
  $('entry-form').hidden = true;
  if (draft) renderWeek();
}

function resetDeleteButton() {
  const b = $('delete-program');
  b.textContent = 'Programı sil';
  b.dataset.armed = '';
}

function saveDraft() {
  const name = $('program-name').value.trim();
  if (!name) {
    $('program-name').classList.add('invalid');
    $('program-name').focus();
    return;
  }
  draft.name = name;
  draft.color = $('program-color').value;
  const i = programs.findIndex((p) => p.id === draft.id);
  if (i >= 0) programs[i] = draft; else { programs.push(draft); selected.add(draft.id); }
  store(STORE_KEY, programs);
  store(SEL_KEY, [...selected]);
  closeEditor();
  renderSidebar();
  renderCalendar();
}

function deleteDraft() {
  const b = $('delete-program');
  if (!b.dataset.armed) { // ilk tıklamada onay iste
    b.dataset.armed = '1';
    b.textContent = 'Emin misin? Tekrar tıkla';
    return;
  }
  programs = programs.filter((p) => p.id !== draft.id);
  selected.delete(draft.id);
  store(STORE_KEY, programs);
  store(SEL_KEY, [...selected]);
  closeEditor();
  renderSidebar();
  renderCalendar();
}

// ---------------- Olaylar ----------------
function setMode(mode) {
  document.querySelectorAll('.mode').forEach((x) => x.classList.toggle('active', x.dataset.mode === mode));
  $('ders-mode').hidden = mode !== 'ders';
  $('sinav-mode').hidden = mode !== 'sinav';
  store(MODE_KEY, mode);
}
document.querySelectorAll('.mode').forEach((btn) => { btn.onclick = () => setMode(btn.dataset.mode); });

const shiftMonth = (n) => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + n, 1); renderMonth(); };
$('prev-month').onclick = () => shiftMonth(-1);
$('next-month').onclick = () => shiftMonth(1);

// Telefonda takvimi sağa/sola kaydırınca ay değişir
function onSwipe(el, fn) {
  let touchStart = null;
  el.addEventListener('touchstart', (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) fn(dx < 0 ? 1 : -1);
  });
}
onSwipe($('month-grid'), shiftMonth);

mobileQuery.addEventListener('change', () => { if (draft) { tapStart = null; closeEntryForm(); } });
$('today').onclick = () => { viewMonth = startOfMonth(new Date()); selectedDay = nearestWeekday(new Date()); renderCalendar(); };

$('add-program').onclick = () => openEditor(null);
$('cancel-edit').onclick = closeEditor;
$('save-program').onclick = saveDraft;
$('delete-program').onclick = deleteDraft;
$('program-name').oninput = () => $('program-name').classList.remove('invalid');
$('program-color').oninput = () => { draft.color = $('program-color').value; renderWeek(); };

const week = $('week-grid');
week.addEventListener('pointerdown', (e) => {
  lastPointer = e.pointerType;
  if (e.pointerType === 'touch') return; // dokunmatikte seçim iki dokunuşla (click) yapılır
  const c = e.target.closest('.cell');
  if (!c) return;
  e.preventDefault();
  if (c.hasPointerCapture?.(e.pointerId)) c.releasePointerCapture(e.pointerId); // dokunmatikte sürükleme için
  dragging = true;
  editingEntry = null;
  $('entry-form').hidden = true;
  sel = { day: +c.dataset.day, a: +c.dataset.slot, b: +c.dataset.slot };
  renderWeek();
});
week.addEventListener('pointerover', (e) => {
  if (!dragging) return;
  const c = e.target.closest('.cell');
  if (!c || +c.dataset.day !== sel.day) return;
  sel.b = +c.dataset.slot;
  paintSel();
});
week.addEventListener('click', (e) => {
  if (lastPointer !== 'touch') return;
  const c = e.target.closest('.cell');
  if (!c) return;
  const day = +c.dataset.day;
  const s = +c.dataset.slot;
  if (!tapStart || tapStart.day !== day) { // ilk dokunuş: başlangıç
    editingEntry = null;
    $('entry-form').hidden = true;
    tapStart = { day, s };
    sel = { day, a: s, b: s };
    renderWeek();
    return;
  }
  sel = { day, a: tapStart.s, b: s }; // ikinci dokunuş: bitiş
  tapStart = null;
  setHint();
  finishSelection();
});
window.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;
  finishSelection();
});

$('entry-form').onsubmit = (e) => {
  e.preventDefault();
  const name = $('entry-name').value.trim();
  if (!name) return;
  const room = $('entry-room').value.trim();
  const teacher = $('entry-teacher').value.trim();
  if (editingEntry) Object.assign(editingEntry, { name, room, teacher });
  else draft.entries.push({ id: uid(), day: sel.day, start: sel.a, end: sel.b + 1, name, room, teacher });
  closeEntryForm();
};
$('entry-cancel').onclick = closeEntryForm;
$('entry-delete').onclick = () => {
  draft.entries = draft.entries.filter((x) => x !== editingEntry);
  closeEntryForm();
};

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || $('editor').hidden) return;
  if (!$('entry-form').hidden) closeEntryForm(); else closeEditor();
});

// ================= Sınav programı modu =================
// Veri sinavlar.js'den gelir (araclar/sinavlari-guncelle.js ile üretilir).
const EXAMS = window.SINAVLAR || [];
const EXAM_COURSES = window.SINAV_DERSLER || [];
const EXAM_PALETTE = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777', '#4f46e5', '#0d9488', '#be123c', '#65a30d', '#7c3aed', '#c2410c', '#0369a1', '#a21caf'];
const examColor = new Map(EXAM_COURSES.map(([code], i) => [code, EXAM_PALETTE[i % EXAM_PALETTE.length]]));
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const examTime = (e) => (e.start ? `${e.start}–${e.end}` : 'Saat belirtilmemiş');
const EXAM_COLS = EXAMS.some((e) => fromIso(e.date).getDay() === 0) ? 7 : 6; // pazar sınavı yoksa Pzt–Cmt

let hiddenCourses = new Set(load(EXAM_HIDDEN_KEY, []));
let exViewMonth = startOfMonth(new Date());
let exSelectedDay = (() => { // bugün gösterilmeyen bir günse sonraki pazartesi
  const d = new Date(); d.setHours(0, 0, 0, 0);
  while (weekdayIndex(d) >= EXAM_COLS) d.setDate(d.getDate() + 1);
  return d;
})();

const examsOn = (day) => { const k = isoDate(day); return EXAMS.filter((e) => e.date === k && !hiddenCourses.has(e.code)); };

function renderExamSidebar() {
  const ul = $('exam-course-list');
  ul.innerHTML = '';
  for (const [code, name] of EXAM_COURSES) {
    const li = document.createElement('li');
    li.className = 'program-item noedit';
    li.style.setProperty('--c', examColor.get(code));
    li.innerHTML = '<label><input type="checkbox"><span class="swatch"></span><span class="pname"></span><small class="code"></small></label>';
    const cb = li.querySelector('input');
    cb.checked = !hiddenCourses.has(code);
    cb.onchange = () => {
      if (cb.checked) hiddenCourses.delete(code); else hiddenCourses.add(code);
      store(EXAM_HIDDEN_KEY, [...hiddenCourses]);
      renderExams();
    };
    li.querySelector('.swatch').style.background = examColor.get(code);
    li.querySelector('.pname').textContent = name;
    li.querySelector('.code').textContent = code;
    li.querySelector('label').title = `${name} (${code})`;
    ul.append(li);
  }
}

function examItem(e) {
  const li = document.createElement('li');
  li.style.setProperty('--c', examColor.get(e.code));
  li.innerHTML = '<span class="t"></span><div><strong></strong><span class="sub"></span></div>';
  li.querySelector('.t').innerHTML = e.start ? `${e.start}<br>${e.end}` : 'Saat<br>yok';
  li.querySelector('strong').textContent = e.course;
  li.querySelector('.sub').textContent = info(e.code, e.title, e.sections && `Şube ${e.sections}`);
  const div = li.querySelector('div');
  for (const r of e.rooms) {
    const line = document.createElement('span');
    line.textContent = e.rooms.length > 1 && r.sections ? `Şube ${r.sections}: ${r.rooms}` : `Derslik: ${r.rooms}`;
    div.append(line);
  }
  return li;
}

function renderExams() {
  buildMonth({
    grid: $('ex-month-grid'), titleEl: $('ex-month-title'), month: exViewMonth, cols: EXAM_COLS, selectedDay: exSelectedDay,
    eventsOf: (day) => examsOn(day).map((e) => ({
      color: examColor.get(e.code),
      label: `${e.start || ''} ${e.code}`.trim(),
      title: info(e.course, e.title, examTime(e)),
    })),
    onPick: (day) => { exSelectedDay = day; renderExams(); },
  });

  $('ex-day-title').textContent = exSelectedDay.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const list = $('ex-day-list');
  list.innerHTML = '';
  const evs = examsOn(exSelectedDay);
  for (const e of evs) list.append(examItem(e));

  // Boş günde sıradaki sınava atlama düğmesi
  const empty = $('ex-day-empty');
  empty.hidden = evs.length > 0;
  empty.innerHTML = '';
  if (!evs.length) {
    const key = isoDate(exSelectedDay);
    const next = EXAMS.find((e) => e.date > key && !hiddenCourses.has(e.code));
    empty.append('Bu gün sınav yok.');
    if (next) {
      const b = document.createElement('button');
      b.className = 'link';
      b.textContent = `Sıradaki: ${fromIso(next.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} · ${next.course}`;
      b.onclick = () => { exSelectedDay = fromIso(next.date); exViewMonth = startOfMonth(exSelectedDay); renderExams(); };
      empty.append(' ', b);
    }
  }
}

function setAllCourses(visible) {
  hiddenCourses = new Set(visible ? [] : EXAM_COURSES.map(([c]) => c));
  store(EXAM_HIDDEN_KEY, [...hiddenCourses]);
  renderExamSidebar();
  renderExams();
}
$('ex-all').onclick = () => setAllCourses(true);
$('ex-none').onclick = () => setAllCourses(false);
const shiftExamMonth = (n) => { exViewMonth = new Date(exViewMonth.getFullYear(), exViewMonth.getMonth() + n, 1); renderExams(); };
$('ex-prev').onclick = () => shiftExamMonth(-1);
$('ex-next').onclick = () => shiftExamMonth(1);
$('ex-today').onclick = () => { exViewMonth = startOfMonth(new Date()); exSelectedDay = new Date(new Date().setHours(0, 0, 0, 0)); renderExams(); };
onSwipe($('ex-month-grid'), shiftExamMonth);

const missing = window.SINAV_BULUNAMAYAN || [];
$('ex-source').innerHTML = '';
if (missing.length) $('ex-source').append(`Sınavı bulunamayan dersler: ${missing.join(', ')}. `);
if (window.SINAV_KAYNAK) {
  const a = document.createElement('a');
  a.href = window.SINAV_KAYNAK; a.target = '_blank'; a.rel = 'noopener';
  a.textContent = 'Kaynak: Atılım arasınav programı';
  $('ex-source').append(a);
}

renderSidebar();
renderCalendar();
renderExamSidebar();
renderExams();
setMode(load(MODE_KEY, 'ders') === 'sinav' ? 'sinav' : 'ders');
