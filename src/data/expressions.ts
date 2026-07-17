export type ExpressionCategory =
  | "Etika"
  | "Persatuan"
  | "Keluarga"
  | "Musyawarah"
  | "Kerja Keras"
  | "Mawas Diri"
  | "Spiritual";

export type ExpressionType = "Pe'olili" | "Bhitarandoka" | "Pepatah";

export type ExpressionItem = {
  id: string;
  ungkapanTolaki: string;
  artiIndonesia: string;
  maknaSingkat: string;
  konteks: string;
  kategori: ExpressionCategory;
  jenis: ExpressionType;
  sumber: string;
};

export const expressionItems: ExpressionItem[] = [
  {
    id: "iamo-u-ehe-mondoiehe",
    ungkapanTolaki: "Iamo u ehe mondoiehe ine suere ndono.",
    artiIndonesia: "Jangan suka berbuat semena-mena terhadap orang lain.",
    maknaSingkat:
      "Mengajarkan penghormatan pada martabat orang lain dalam pergaulan.",
    konteks: "Cocok dipakai saat membahas sopan santun dan batas tindakan.",
    kategori: "Etika",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "iamo-u-teroraroramba",
    ungkapanTolaki: "Iamo u teroraroramba.",
    artiIndonesia: "Jangan suka merampas hak orang lain.",
    maknaSingkat:
      "Menekankan keadilan, hak, dan tanggung jawab sosial dalam hidup bersama.",
    konteks: "Bisa dipakai untuk materi etika, kejujuran, dan kepemilikan.",
    kategori: "Etika",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "piarai-raimu",
    ungkapanTolaki: "Piarai raimu, pombeotooriamino ariamu.",
    artiIndonesia:
      "Peliharalah sikap dan tindakanmu sebagai tanda bangsa yang beradab.",
    maknaSingkat:
      "Sikap pribadi dianggap mencerminkan asal-usul, martabat, dan adab.",
    konteks: "Bagus untuk pembuka materi karakter dan tata krama.",
    kategori: "Etika",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "mombeku-saramasiako",
    ungkapanTolaki: "Mombeku saramasiako meosa manusia.",
    artiIndonesia: "Saling mencintai sesama manusia.",
    maknaSingkat:
      "Nilai kasih, empati, dan hubungan baik menjadi dasar hidup sosial.",
    konteks: "Bisa muncul dalam tema persaudaraan dan hubungan antarmanusia.",
    kategori: "Persatuan",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "ehe-nudulu-mepokoaso",
    ungkapanTolaki: "Ehe nudulu mepokoaso.",
    artiIndonesia: "Mau berkumpul dan bersatu.",
    maknaSingkat:
      "Kebersamaan dipandang sebagai kekuatan dalam menyelesaikan urusan.",
    konteks: "Cocok untuk materi gotong royong dan persatuan komunitas.",
    kategori: "Persatuan",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "taa-mombopo-kiikii",
    ungkapanTolaki: "Taa mombopo kiikii.",
    artiIndonesia: "Tidak memperlihatkan kemewahan yang dimiliki.",
    maknaSingkat:
      "Mengajarkan kerendahan hati dan tidak pamer dalam kehidupan sosial.",
    konteks: "Bisa dipakai saat membahas kesederhanaan dan sikap diri.",
    kategori: "Mawas Diri",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "mesida-ronga-mandara",
    ungkapanTolaki: "Mesida ronga mandara.",
    artiIndonesia: "Rajin dan cekatan dalam bekerja.",
    maknaSingkat:
      "Kerja yang baik bukan hanya tekun, tetapi juga tanggap dan terampil.",
    konteks: "Cocok untuk latihan nilai kerja keras dan tanggung jawab.",
    kategori: "Kerja Keras",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "mekooloi-posipole",
    ungkapanTolaki: "Mekooloi posipole, wonua ari ine pasipole dawo.",
    artiIndonesia:
      "Mendahulukan kepentingan umum di atas kepentingan pribadi.",
    maknaSingkat:
      "Kepentingan bersama ditempatkan lebih tinggi daripada ego pribadi.",
    konteks: "Relevan untuk tema kepemimpinan, warga, dan kerja komunitas.",
    kategori: "Persatuan",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "taa-mombo-paraaako",
    ungkapanTolaki: "Taa mombo paraaako ponaa ine suere ndono.",
    artiIndonesia: "Tidak memaksakan pendapat pada orang lain.",
    maknaSingkat:
      "Dialog dan penghormatan pendapat menjadi bagian dari tata sosial.",
    konteks: "Cocok untuk materi diskusi sehat dan musyawarah.",
    kategori: "Musyawarah",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "ano-siwowokipona",
    ungkapanTolaki: "Ano siwowokipona ai amba mokalakai.",
    artiIndonesia: "Satukan pendapat kalian, baru melaksanakannya.",
    maknaSingkat:
      "Keputusan sebaiknya lahir dari kesepahaman, bukan tindakan terburu-buru.",
    konteks: "Bagus untuk menjelaskan musyawarah sebelum bekerja.",
    kategori: "Musyawarah",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "au-pewowa-tambo",
    ungkapanTolaki: "Au pewowa tambo iamu u pelomba-lomba.",
    artiIndonesia: "Lewatilah pintu, jangan melalui jendela.",
    maknaSingkat:
      "Melakukan sesuatu sebaiknya melalui cara yang pantas dan benar.",
    konteks: "Bisa dipakai untuk menasihati agar tidak mencari jalan curang.",
    kategori: "Etika",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "mepoindi-mororo",
    ungkapanTolaki: "Mepoindi mororo lalu ine ombu sameena.",
    artiIndonesia: "Berpegang teguh pada Tuhan yang sebenarnya.",
    maknaSingkat:
      "Menunjukkan nilai spiritual dan pegangan moral dalam kehidupan.",
    konteks: "Cocok untuk materi nilai religius dan keyakinan.",
    kategori: "Spiritual",
    jenis: "Pe'olili",
    sumber: "Wikikutip",
  },
  {
    id: "topelemba-todagaii",
    ungkapanTolaki: "Topelemba todagaii karendo, topetulura todagaii pondundo.",
    artiIndonesia: "Berjalan peliharalah kaki, berbicara peliharalah mulut.",
    maknaSingkat:
      "Hati-hati dalam tindakan dan ucapan karena keduanya membawa akibat.",
    konteks: "Sangat cocok untuk materi komunikasi santun.",
    kategori: "Mawas Diri",
    jenis: "Bhitarandoka",
    sumber: "Wikikutip",
  },
  {
    id: "tunuopo-hulomu",
    ungkapanTolaki: "Tunuopo hulomu, kikiyi hulamu.",
    artiIndonesia: "Bercermin dahulu baru mencela orang lain.",
    maknaSingkat:
      "Mengajak introspeksi sebelum menilai kekurangan orang lain.",
    konteks: "Bisa dipakai untuk pelajaran kritik diri dan rendah hati.",
    kategori: "Mawas Diri",
    jenis: "Bhitarandoka",
    sumber: "Wikikutip",
  },
  {
    id: "sambepe-pinokolako",
    ungkapanTolaki: "Sambepe no pinokolako ono ate puteki pena moraha.",
    artiIndonesia:
      "Musyawarah dilaksanakan berdasarkan hati nurani yang tulus ikhlas.",
    maknaSingkat:
      "Musyawarah bukan sekadar bicara bersama, tetapi perlu ketulusan.",
    konteks: "Cocok untuk tema adat, mufakat, dan penyelesaian masalah.",
    kategori: "Musyawarah",
    jenis: "Bhitarandoka",
    sumber: "Wikikutip",
  },
  {
    id: "ehe-mombe-kasudoako",
    ungkapanTolaki: "Ehe mombe kasudoako, pariaman meohai mambo.",
    artiIndonesia:
      "Perbuatan saling menolong adalah pedoman ikatan kekeluargaan.",
    maknaSingkat:
      "Tolong-menolong dipandang sebagai perekat keluarga dan komunitas.",
    konteks: "Bagus untuk materi gotong royong dan keluarga.",
    kategori: "Keluarga",
    jenis: "Bhitarandoka",
    sumber: "Wikikutip",
  },
  {
    id: "taa-mosiwa-siwa",
    ungkapanTolaki: "Taa mosiwa-siwa toono meohai.",
    artiIndonesia: "Tidak membeda-bedakan di antara saudara dan keluarga.",
    maknaSingkat:
      "Mengajarkan perlakuan yang adil terhadap keluarga dan kerabat.",
    konteks: "Cocok untuk membahas relasi keluarga dan keadilan.",
    kategori: "Keluarga",
    jenis: "Bhitarandoka",
    sumber: "Wikikutip",
  },
  {
    id: "lamo-u-ehe",
    ungkapanTolaki: "Lamo u ehe mondoiehe ine suere ndono.",
    artiIndonesia: "Jangan suka berbuat semena-mena terhadap orang lain.",
    maknaSingkat:
      "Peribahasa ini menekankan kendali diri dalam memperlakukan sesama.",
    konteks: "Contoh peribahasa yang dikenalkan Balai Bahasa Sultra.",
    kategori: "Etika",
    jenis: "Pepatah",
    sumber: "Balai Bahasa Sultra",
  },
  {
    id: "sangga-sanggai",
    ungkapanTolaki: "Sangga-sanggai olutumu pekiki inesamba.",
    artiIndonesia: "Berpikir sebelum bertindak.",
    maknaSingkat:
      "Sebelum melakukan sesuatu, seseorang perlu menimbang dampaknya matang-matang.",
    konteks: "Dikenal sebagai ungkapan Tolaki Mekongga dan semboyan Kolaka.",
    kategori: "Mawas Diri",
    jenis: "Pepatah",
    sumber: "Arus Jurnal Sosial dan Humaniora",
  },
];

export const expressionCategories: ExpressionCategory[] = [
  "Etika",
  "Persatuan",
  "Keluarga",
  "Musyawarah",
  "Kerja Keras",
  "Mawas Diri",
  "Spiritual",
];

export const expressionSources = [
  {
    label: "Wikikutip - Peribahasa Tolaki",
    url: "https://id.wikiquote.org/wiki/Peribahasa_Tolaki",
  },
  {
    label: "Balai Bahasa Sulawesi Tenggara - Tambaru Peribahasa Tolaki",
    url: "https://balaibahasasultra.kemendikdasmen.go.id/tambaru-peribahasa-dari-bahasa-tolaki/",
  },
  {
    label: "Arus Jurnal Sosial dan Humaniora - Ungkapan Peribahasa Tolaki Mekongga",
    url: "https://jurnal.ardenjaya.com/index.php/ajsh/article/view/348",
  },
];
