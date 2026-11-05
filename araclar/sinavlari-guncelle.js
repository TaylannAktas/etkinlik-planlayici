// Atılım arasınav programı sayfalarından seçili derslerin sınavlarını çekip sinavlar.js'i yeniden yazar.
// Kullanım (repo kökünden):  node araclar/sinavlari-guncelle.js
// Bağımlılık yok, Node 18+ yeterli.
const fs = require('fs');
const path = require('path');

const KAYNAK = 'https://dersprogramiyukle.atilim.edu.tr/20262027guzarasinav';
const SAYFALAR = ['muh', 'servis', 'fef', 'isletme']; // fakülte klasörleri; tablo index_files/sheet001.htm içinde

// Takip edilen dersler: [ders kodu, takvimde görünecek ad]
const DERSLER = [
  ['CMPE113', 'Bilgisayar Programlama I'],
  ['HIST101', 'Atatürk İlkeleri ve İnkılâp Tarihi I'],
  ['HIST111', 'Atatürk İlkeleri ve İnkılâp Tarihi I (İng.)'],
  ['PHYS101', 'Genel Fizik I'],
  ['ENG101', 'Akademik İngilizce I'],
  ['CMPE109', 'Hesaplamanın Temelleri'],
  ['MATH151', 'Kalkülüs I'],
  ['MATH152', 'Kalkülüs II'],
  ['CHE105', 'Genel Kimya'],
  ['MATH275', 'Lineer Cebir'],
  ['ENG201', 'Akademik İngilizce III'],
  ['ISE261', 'İş ve e-Ticaret'],
  ['CMPE251', 'Ayrık Hesaplamalı Yapılar'],
  ['CMPE225', 'Nesne Tabanlı Programlama'],
  ['SE221', 'Yazılım Gereksinim Mühendisliği'],
  ['EE203', 'Sayısal Devreler'],
  ['HIST201', 'Uygarlık Tarihi'],
  ['HIST221', 'Uygarlık Tarihi (İng.)'],
  ['EE103', 'Elektrik ve Elektronik Mühendisliğine Giriş'],
  ['MATH276', 'Diferansiyel Denklemler'],
  ['EE209', 'Devre Analizi I'],
  ['EE213', 'Olasılık ve Rastgele Süreçler'],
];
// Listede olup sınav programında bulunamayan dersler (sitede bilgi olarak gösterilir)
const BULUNAMAYAN = ['Kariyer Planlama', 'Üniversite Hayatına Giriş'];

const AYLAR = { ocak: 1, şubat: 2, mart: 3, nisan: 4, mayıs: 5, haziran: 6, temmuz: 7, ağustos: 8, eylül: 9, ekim: 10, kasım: 11, aralık: 12 };
const pad = (n) => String(n).padStart(2, '0');

const decode = (s) => s
  .replace(/<br[^>]*>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/\s+/g, ' ').trim();

function rows(html) {
  return html.split(/<tr[^>]*>/i).slice(1).map((r) => r.split(/<td/i).slice(1).map((c) => decode('<td' + c)));
}

function parseDate(s) {
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  m = s.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (m && AYLAR[m[2].toLocaleLowerCase('tr')]) return `${m[3]}-${pad(AYLAR[m[2].toLocaleLowerCase('tr')])}-${pad(m[1])}`;
  return null;
}
const parseTime = (s) => (s.match(/^(\d{1,2})[:.](\d{2})/) || []).slice(1).map((x, i) => (i ? x : pad(x))).join(':');

// "01".."28" → "01–28", boşluklar varsa "01–02, 04–05"
function compressSections(list) {
  const nums = [...new Set(list)].map(Number).sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < nums.length; i++) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    parts.push(j > i ? `${pad(nums[i])}–${pad(nums[j])}` : pad(nums[i]));
    i = j;
  }
  return parts.join(', ');
}

async function main() {
  const wanted = new Map(DERSLER);
  const groups = new Map();
  for (const sayfa of SAYFALAR) {
    const url = `${KAYNAK}/${sayfa}/index_files/sheet001.htm`;
    const res = await fetch(url);
    if (!res.ok) { console.warn(`! ${url} → ${res.status}, atlandı`); continue; }
    for (const cells of rows(await res.text())) {
      const i = cells.findIndex((c) => /^[A-Z]{2,5} ?\d{3}\b/.test(c));
      if (i < 0) continue;
      const m = cells[i].match(/^([A-Z]{2,5}) ?(\d{3})(?:-(?:SEC-)?(\d+))?/);
      const code = m[1] + m[2];
      if (!wanted.has(code)) continue;
      const title = cells[i + 1].replace(/\s*SEC-\d+$/i, '');
      const rooms = cells[i + 2];
      const date = parseDate(cells[i + 3]);
      if (!date) { console.warn(`! Tarih okunamadı: ${cells.join(' | ')}`); continue; }
      const start = parseTime(cells[i + 4] || '');
      const end = parseTime(cells[i + 5] || '');
      const key = [code, title, date, start, end].join('|');
      if (!groups.has(key)) groups.set(key, { code, course: wanted.get(code), title, date, start, end, secRooms: new Map() });
      const g = groups.get(key);
      const sec = m[3] ? pad(+m[3]) : '';
      const prev = g.secRooms.get(sec);
      const merged = [...new Set(`${prev ? prev + ',' : ''}${rooms}`.split(',').map((r) => r.trim()).filter(Boolean))];
      g.secRooms.set(sec, merged.join(', '));
    }
  }

  const exams = [...groups.values()].map((g) => {
    // aynı derslikleri paylaşan şubeleri birleştir
    const byRooms = new Map();
    for (const [sec, rooms] of g.secRooms) {
      if (!byRooms.has(rooms)) byRooms.set(rooms, []);
      if (sec) byRooms.get(rooms).push(sec);
    }
    return {
      code: g.code, course: g.course, title: g.title, date: g.date, start: g.start, end: g.end,
      sections: compressSections([...g.secRooms.keys()].filter(Boolean)),
      rooms: [...byRooms].map(([rooms, secs]) => ({ sections: compressSections(secs), rooms })),
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.code.localeCompare(b.code));

  const found = new Set(exams.map((e) => e.code));
  const missing = [...BULUNAMAYAN, ...DERSLER.filter(([c]) => !found.has(c)).map(([, n]) => n)];

  const out = `// Bu dosya araclar/sinavlari-guncelle.js ile üretildi; elle düzenleme yerine script'i çalıştır.
// Kaynak: ${KAYNAK}/{${SAYFALAR.join(',')}}  ·  Güncelleme: ${new Date().toISOString().slice(0, 10)}
window.SINAV_KAYNAK = ${JSON.stringify(KAYNAK + '/muh/')};
window.SINAV_DERSLER = ${JSON.stringify(DERSLER.filter(([c]) => found.has(c)), null, 0)};
window.SINAV_BULUNAMAYAN = ${JSON.stringify(missing)};
window.SINAVLAR = ${JSON.stringify(exams, null, 1)};
`;
  fs.writeFileSync(path.join(__dirname, '..', 'sinavlar.js'), out);
  console.log(`${exams.length} sınav yazıldı (${found.size}/${DERSLER.length} ders). Bulunamayan: ${missing.join(', ') || '-'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
