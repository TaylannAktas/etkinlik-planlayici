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
  {
    id: 'hazir-cmpe-2-reg',
    name: 'CMPE 2 Reg.',
    color: '#0891b2',
    entries: [
      // Pazartesi
      ders('Pzt', 1, 3, 'CMPE251-SEC-01', 'Müh. 1017', 'Güzin Türkmen'),
      ders('Pzt', 4, 6, 'ENG201-SEC-01', 'Müh. 2019', 'Staff'),
      ders('Pzt', 5, 6, 'MATH275-SEC-02', 'Müh. B1014', 'Fatih Sulak'),
      ders('Pzt', 7, 8, 'MATH275-SEC-01', 'Müh. 1029', 'Burcu Gulmez Temur'),
      // Salı
      ders('Sal', 1, 3, 'CMPE225-SEC-01', 'Müh. 1019', 'Erhan Gokcay'),
      ders('Sal', 5, 7, 'TURK201-SEC-03', 'İşletme Z09 RB', 'Gokce Ulus'),
      ders('Sal', 5, 7, 'CMPE251-SEC-04', 'Müh. B1003', 'Davut Culha'),
      // Çarşamba
      ders('Çar', 1, 2, 'MATH275-SEC-02', 'Müh. 1029', 'Fatih Sulak'),
      ders('Çar', 3, 5, 'ENG201-SEC-02', 'Müh. 2027', 'Staff'),
      ders('Çar', 3, 4, 'MATH275-SEC-01', 'Müh. 1029', 'Burcu Gulmez Temur'),
      ders('Çar', 6, 8, 'CMPE251-SEC-05', 'Müh. 1017', 'Davut Culha'),
      // Perşembe
      ders('Per', 1, 3, 'CMPE226-SEC-01', 'Müh. 1009', 'Tuncay Terzioğlu'),
      ders('Per', 4, 5, 'EE203-SEC-02', 'Müh.Lab.L 3023', 'İrfan Alan'),
      ders('Per', 6, 8, 'TURK201-SEC-02', 'İşletme Z09 RB', 'Staff'),
      // Cuma
      ders('Cum', 1, 3, 'EE203-SEC-02', 'Müh. 1024', 'İrfan Alan'),
      ders('Cum', 5, 6, 'EE203-SEC-02', 'Müh.Lab.L 3023', 'İrfan Alan'),
      ders('Cum', 7, 8, 'CMPE225-SEC-01', 'Müh.Lab.L 3009', 'Erhan Gokcay'),
      ders('Cum', 7, 8, 'CMPE225-SEC-01', 'Müh.Lab.L 3013', 'Erhan Gokcay'),
    ],
  },
  {
    id: 'hazir-ee-1-reg',
    name: 'EE 1 Reg.',
    color: '#ea580c',
    entries: [
      // Pazartesi
      ders('Pzt', 1, 2, 'CMPE113-SEC-03', 'Müh. 2017', 'Ali Yazıcı'),
      ders('Pzt', 3, 4, 'ENG101-SEC-07', 'Müh. 2023', 'Staff'),
      ders('Pzt', 5, 5, 'CHE105-SEC-08', 'Müh. 1003'),
      ders('Pzt', 5, 5, 'CHE105-SEC-09', 'Müh. 1009'),
      ders('Pzt', 5, 5, 'CHE105-SEC-10', 'Müh. 2003'),
      ders('Pzt', 6, 6, 'PHYS101-SEC-05', 'Müh. B1008', 'Staff'),
      // Salı
      ders('Sal', 1, 2, 'HIST101-SEC-05', 'UZAKTAN', 'Gunseli Gumusel'),
      ders('Sal', 1, 2, 'CHE105-SEC-08', 'Müh. 1003', 'Seha Tirkes'),
      ders('Sal', 1, 2, 'CHE105-SEC-09', 'Müh. 1009', 'Salih Ertan'),
      ders('Sal', 1, 2, 'CHE105-SEC-10', 'Müh. 2003', 'Seniz Ozalp Yaman'),
      ders('Sal', 3, 4, 'EE103-SEC-01', 'Müh. 1029', 'Sedat Sünter'),
      ders('Sal', 5, 6, 'CMPE113-SEC-03', 'Müh.Lab.L 3009', 'Ali Yazıcı'),
      ders('Sal', 5, 6, 'CMPE113-SEC-03', 'Müh.Lab.L 3013', 'Ali Yazıcı'),
      ders('Sal', 7, 8, 'MATH151-SEC-02', 'Müh. B1008', 'Fatma Güler Eroğlu'),
      // Çarşamba
      ders('Çar', 1, 2, 'ENG101-SEC-06', 'Müh. 2025', 'Staff'),
      ders('Çar', 1, 2, 'ENG101-SEC-07', 'Müh. 2023', 'Staff'),
      ders('Çar', 3, 4, 'MATH151-SEC-02', 'Müh. B1008', 'Fatma Güler Eroğlu'),
      ders('Çar', 5, 6, 'PHYS101-SEC-05', 'Müh. 2023', 'Staff'),
      ders('Çar', 7, 9, 'CHE105-SEC-08', 'Müh.Lab.B3024', 'Seha Tirkes'),
      ders('Çar', 7, 9, 'PHYS101-SEC-05', 'Müh.Lab.B2016', 'Staff'),
      // Perşembe
      ders('Per', 1, 3, 'CHE105-SEC-09', 'Müh.Lab.B3024', 'Salih Ertan'),
      ders('Per', 1, 2, 'ENG101-SEC-06', 'Müh. B1006', 'Staff'),
      ders('Per', 4, 6, 'CHE105-SEC-10', 'Müh.Lab.B3024', 'Seniz Ozalp Yaman'),
      ders('Per', 4, 5, 'EE103-SEC-01', 'Müh.Lab.B2015', 'Sedat Sünter'),
      ders('Per', 7, 8, 'HIST111-SEC-01', 'UZAKTAN', 'Gunseli Gumusel'),
      // Cuma
      ders('Cum', 1, 2, 'MATH151-SEC-02', 'Müh. B1012', 'Fatma Güler Eroğlu'),
      ders('Cum', 3, 4, 'EE103-SEC-01', 'Müh.Lab.B2015', 'Sedat Sünter'),
      ders('Cum', 6, 8, 'HIST221-SEC-02', 'UZAKTAN', 'Hazal Saral Barbaros'),
    ],
  },
  {
    id: 'hazir-ee-2-reg',
    name: 'EE 2 Reg.',
    color: '#16a34a',
    entries: [
      // Pazartesi
      ders('Pzt', 1, 3, 'EE203-SEC-01', 'Müh. 1024', 'İrfan Alan'),
      ders('Pzt', 5, 6, 'EE203-SEC-01', 'Müh.Lab.B2015', 'İrfan Alan'),
      ders('Pzt', 7, 8, 'EE203-SEC-01', 'Müh.Lab.B2015', 'İrfan Alan'),
      // Salı
      ders('Sal', 1, 2, 'EE209-SEC-01', 'Müh. B1012', 'Serhat Karap'),
      ders('Sal', 3, 4, 'MATH276-SEC-01', 'Müh. B1014', 'Emel Yıldırım Kavgacı'),
      ders('Sal', 5, 7, 'TURK201-SEC-03', 'İşletme Z09 RB', 'Gokce Ulus'),
      // Çarşamba
      ders('Çar', 1, 2, 'EE209-SEC-01', 'Müh.Lab.B2015', 'Serhat Karap'),
      ders('Çar', 3, 4, 'EE209-SEC-01', 'Müh.Lab.B2015', 'Serhat Karap'),
      ders('Çar', 5, 6, 'MATH276-SEC-01', 'Müh. B1014', 'Emel Yıldırım Kavgacı'),
      // Perşembe
      ders('Per', 1, 2, 'EE209-SEC-01', 'Müh. 1029', 'Serhat Karap'),
      ders('Per', 6, 8, 'TURK201-SEC-02', 'İşletme Z09 RB', 'Staff'),
      ders('Per', 6, 8, 'ENG201-SEC-06', 'Müh. 2025', 'Staff'),
      ders('Per', 6, 8, 'ENG201-SEC-07', 'Müh. B1015', 'Staff'),
      // Cuma
      ders('Cum', 1, 3, 'EE213-SEC-01', 'Müh. 1029', 'Reşat Özgür Doruk'),
    ],
  },
];
