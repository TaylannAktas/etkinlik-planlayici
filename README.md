# Etkinlik Planlayıcı

Birden fazla bölümün haftalık ders programını tek bir aylık takvimde görmeyi sağlayan basit bir web sitesi.

- **Ders Programı modu:** Sol menüden bir ya da birden fazla ders programı seçilir; dersler sağdaki aylık takvimde (Pazartesi–Cuma) küçük etkinlikler olarak görünür. Takvimde bir güne tıklayınca o günün saatlik programı altta açılır.
- **Program ekleme/düzenleme:** "Ders programı ekle" ile boş bir haftalık takvim açılır. Bir gün sütununda saatleri sürükleyerek seçip ders adını (ve isteğe bağlı derslik) yazarsın, en sonda **Kaydet**. Kayıtlı programlar "Düzenle" ile değiştirilebilir ya da silinebilir.
- **Sınav Programı modu:** Henüz yapılmadı.

## Çalıştırma

Hiçbir bağımlılık ve build adımı yok; düz HTML + CSS + JavaScript.

```bash
git clone https://github.com/TaylannAktas/etkinlik-planlayici.git
cd etkinlik-planlayici
```

Sonra `index.html` dosyasını tarayıcıda açman yeterli. Yerel bir sunucu tercih edersen:

```bash
python -m http.server 8000
# ya da: npx serve .
```

ve http://localhost:8000 adresine git.

## Bilinmesi gerekenler

- **Veriler tarayıcıda tutulur** (`localStorage`). Başka bir tarayıcıda veya bilgisayarda programlar görünmez; tarayıcı verisi silinirse kaybolur.
- **Ders saatleri** `app.js` dosyasının en üstünde ayarlanır (varsayılan: 09:30'da başlayan 50 dakikalık 10 ders saati, son ders 18:30):

  ```js
  const FIRST_SLOT = { h: 9, m: 30 };
  const SLOT_COUNT = 10;
  const SLOT_MINUTES = 50;
  ```

  Dersler slot numarasıyla kaydedildiği için `FIRST_SLOT` değiştirilirse kayıtlı programlar da kayar.

- **Hazır programlar** `programlar.js` dosyasında durur (şu an: CMPE 1 Reg., CMPE 2 Reg., EE 1 Reg., EE 2 Reg.). Siteyi ilk açan herkese bir kez eklenir; kullanıcı sonradan düzenleyip silebilir, silinen geri gelmez. Yeni hazır program eklemek için dosyadaki örneği kopyalayıp benzersiz bir `id` vermek yeterli.

## Yayın

Site GitHub Pages'te yayında: https://taylannaktas.github.io/etkinlik-planlayici/ — `main` dalına her push'ta otomatik güncellenir.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa yapısı |
| `style.css` | Görünüm (açık/koyu tema otomatik) |
| `app.js` | Takvim, düzenleyici ve kayıt mantığı |
