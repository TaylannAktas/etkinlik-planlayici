// Hazır ders programları: siteyi ilk açan herkese bir kez eklenir.
// Kullanıcı sonradan düzenleyebilir ya da silebilir; silinen program geri gelmez.
// Yeni bir program eklerken benzersiz bir id ver.
//
// ders(gün, ilkSaat, sonSaat, ad, derslik, öğretimÜyesi)
//   gün: 'Pzt' | 'Sal' | 'Çar' | 'Per' | 'Cum'
//   ilkSaat / sonSaat: programdaki ders saati numarası (1 = 09:30, 2 = 10:30 … 9 = 17:30), sonSaat dahil
const GUN = { Pzt: 0, Sal: 1, Çar: 2, Per: 3, Cum: 4 };
const ders = (gun, ilk, son, name, room = '', teacher = '') => ({ day: GUN[gun], start: ilk - 1, end: son, name, room, teacher });

window.HAZIR_PROGRAMLAR = [
  {
    id: 'hazir-cmpe-1-reg',
    name: 'CMPE 1 Reg.',
    color: '#7c3aed',
    entries: [
      // Pazartesi
      ders('Pzt', 1, 2, 'CHE105-SEC-01', 'Müh. 1003', 'Seniz Ozalp Yaman'),
      ders('Pzt', 1, 2, 'CHE105-SEC-02', 'Müh. 2015', 'Atilla Cihaner'),
      ders('Pzt', 1, 2, 'CHE105-SEC-03', 'Müh. 2015', 'Salih Ertan'),
      ders('Pzt', 1, 2, 'CHE105-SEC-04', 'Müh. 2015', 'Murat Kaya'),
      ders('Pzt', 4, 4, 'CMPE109-SEC-01', 'Müh.Lab.LAB Z1030', 'Gökçen Tonbul'),
      ders('Pzt', 4, 4, 'CMPE109-SEC-01', 'Müh.Lab.L 3013', 'Gökçen Tonbul'),
      ders('Pzt', 5, 6, 'ENG101-SEC-01', 'Müh. 2025', 'Staff'),
      ders('Pzt', 5, 6, 'ENG101-SEC-02', 'Müh. 2023', 'Staff'),
      ders('Pzt', 7, 8, 'CMPE113-SEC-01', 'Müh. 2017', 'Ali Yazıcı'),
      // Salı
      ders('Sal', 1, 2, 'CMPE113-SEC-01', 'Müh.Lab.L 3009', 'Ali Yazıcı'),
      ders('Sal', 1, 2, 'CMPE113-SEC-01', 'Müh.Lab.L 3013', 'Ali Yazıcı'),
      ders('Sal', 3, 3, 'CHE105-SEC-01', 'Müh. 1003', 'Seniz Ozalp Yaman'),
      ders('Sal', 3, 3, 'CHE105-SEC-02', 'Müh. 2015', 'Atilla Cihaner'),
      ders('Sal', 3, 3, 'CHE105-SEC-03', 'Müh. 2015', 'Salih Ertan'),
      ders('Sal', 3, 3, 'CHE105-SEC-04', 'Müh. 2015', 'Murat Kaya'),
      ders('Sal', 5, 6, 'MATH151-SEC-01', 'Müh. B1008', 'Fatma Güler Eroğlu'),
      ders('Sal', 5, 6, 'MATH151-SEC-03', 'Müh. B1010', 'Serdar Ay'),
      ders('Sal', 7, 9, 'CHE105-SEC-02', 'Müh.Lab.B3024', 'Atilla Cihaner'),
      // Çarşamba
      ders('Çar', 1, 2, 'MATH151-SEC-01', 'Müh. B1008', 'Fatma Güler Eroğlu'),
      ders('Çar', 1, 2, 'MATH151-SEC-03', 'Müh. B1010', 'Serdar Ay'),
      ders('Çar', 3, 3, 'PHYS101-SEC-01', 'Müh. 1025', 'Staff'),
      ders('Çar', 4, 6, 'CHE105-SEC-01', 'Müh.Lab.B3024', 'Seniz Ozalp Yaman'),
      ders('Çar', 4, 6, 'PHYS101-SEC-01', 'Müh.Lab.B2016', 'Staff'),
      ders('Çar', 7, 8, 'ENG101-SEC-01', 'Müh. 2025', 'Staff'),
      ders('Çar', 7, 8, 'ENG101-SEC-02', 'Müh. 2023', 'Staff'),
      // Perşembe
      ders('Per', 1, 2, 'HIST101-SEC-08', 'UZAKTAN', 'Gunseli Gumusel'),
      ders('Per', 3, 4, 'CMPE109-SEC-01', 'Müh. B1014', 'Gökçen Tonbul'),
      ders('Per', 5, 6, 'PHYS101-SEC-01', 'Müh. 1003', 'Staff'),
      ders('Per', 7, 8, 'HIST111-SEC-01', 'UZAKTAN', 'Gunseli Gumusel'),
      ders('Per', 7, 9, 'CHE105-SEC-04', 'Müh.Lab.B3024', 'Murat Kaya'),
      // Cuma
      ders('Cum', 1, 2, 'MATH151-SEC-01', 'Müh. B1010', 'Fatma Güler Eroğlu'),
      ders('Cum', 5, 6, 'MATH151-SEC-03', 'Müh. B1010', 'Serdar Ay'),
      ders('Cum', 7, 9, 'CHE105-SEC-03', 'Müh.Lab.B3024', 'Salih Ertan'),
    ],
  },
];
