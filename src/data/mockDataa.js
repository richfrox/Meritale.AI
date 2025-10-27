export const mockUsers = [
  {
    id: 1,
    email: "pengawas.pusat@gov.id",
    password: "admin123",
    role: "pengawas_pusat",
    id_instansi: null,
    nama: "Admin Pusat"
  },
  {
    id: 2,
    email: "pengawas.internal@kemenA.id",
    password: "admin123",
    role: "pengawas_internal",
    id_instansi: 1,
    nama: "Pengawas Kementerian A"
  }
];

export const mockInstansi = [
  { id: 1, instansi: "Kementerian A" },
  { id: 2, instansi: "Kementerian B" },
  { id: 3, instansi: "Kementerian C" },
  { id: 4, instansi: "Badan A" },
  { id: 5, instansi: "Badan B" },
  { id: 6, instansi: "Badan C" },
  { id: 7, instansi: "Lembaga A" },
  { id: 8, instansi: "Lembaga B" },
  { id: 9, instansi: "Lembaga C" },
  { id: 10, instansi: "Pemda A" },
  { id: 11, instansi: "Pemda B" },
  { id: 12, instansi: "Pemda C" }
];

export const mockJabatan = [
  { id: 1, jabatan: "Kepala" },
  { id: 2, jabatan: "Deputi" },
  { id: 3, jabatan: "Direktur" },
  { id: 4, jabatan: "Staf" }
];

export const mockInstansiUker = [
  { id: 1, id_instansi: 1, uker: "Uker A" },
  { id: 2, id_instansi: 1, uker: "Uker B" },
  { id: 3, id_instansi: 1, uker: "Uker C" },
  { id: 4, id_instansi: 2, uker: "Uker A" },
  { id: 5, id_instansi: 2, uker: "Uker B" },
  { id: 6, id_instansi: 2, uker: "Uker C" },
  { id: 7, id_instansi: 3, uker: "Uker A" },
  { id: 8, id_instansi: 3, uker: "Uker B" },
  { id: 9, id_instansi: 3, uker: "Uker C" }
];

export const mockPegawai = [
  {
    nip: "199001012015011001",
    nama: "Budi Santoso",
    gender: "L",
    id_jabatan: 1,
    pangkat: "IV/c - Pembina Utama Muda",
    tmt_pangkat: "2020-01-01",
    id_instansi_uker: 1,
    tmt_diangkat_pns: "2015-01-01",
    email: "budi.santoso@kemenA.id",
    telepon: "081234567890",
    skill: "Manajemen Strategis, Kepemimpinan",
    minat: "Pengembangan SDM, Inovasi",
    sertifikasi: "PIM II, ISO 9001"
  },
  {
    nip: "199102022016012002",
    nama: "Siti Nurhaliza",
    gender: "P",
    id_jabatan: 2,
    pangkat: "IV/b - Pembina Tingkat I",
    tmt_pangkat: "2019-06-01",
    id_instansi_uker: 2,
    tmt_diangkat_pns: "2016-01-01",
    email: "siti.nurhaliza@kemenA.id",
    telepon: "081234567891",
    skill: "Analisis Kebijakan, Komunikasi",
    minat: "Reformasi Birokrasi, Digitalisasi",
    sertifikasi: "PIM III, Six Sigma"
  },
  {
    nip: "199203032017011003",
    nama: "Ahmad Fauzi",
    gender: "L",
    id_jabatan: 3,
    pangkat: "III/d - Penata Tingkat I",
    tmt_pangkat: "2021-04-01",
    id_instansi_uker: 3,
    tmt_diangkat_pns: "2017-01-01",
    email: "ahmad.fauzi@kemenA.id",
    telepon: "081234567892",
    skill: "Perencanaan Program, Monitoring",
    minat: "Data Analytics, Project Management",
    sertifikasi: "PMP, ITIL"
  },
  {
    nip: "199304042018012004",
    nama: "Dewi Lestari",
    gender: "P",
    id_jabatan: 4,
    pangkat: "III/c - Penata",
    tmt_pangkat: "2022-01-01",
    id_instansi_uker: 1,
    tmt_diangkat_pns: "2018-01-01",
    email: "dewi.lestari@kemenA.id",
    telepon: "081234567893",
    skill: "Administrasi, Arsip Digital",
    minat: "Teknologi Informasi, Pelayanan Publik",
    sertifikasi: "Microsoft Office Specialist"
  },
  {
    nip: "199405052019011005",
    nama: "Rudi Hartono",
    gender: "L",
    id_jabatan: 3,
    pangkat: "III/d - Penata Tingkat I",
    tmt_pangkat: "2023-01-01",
    id_instansi_uker: 4,
    tmt_diangkat_pns: "2019-01-01",
    email: "rudi.hartono@kemenB.id",
    telepon: "081234567894",
    skill: "Keuangan Negara, Audit",
    minat: "Good Governance, Anti Korupsi",
    sertifikasi: "Certified Internal Auditor"
  }
];

export const mockPendidikan = [
  { id: 1, pendidikan: "S3", skor: 20 },
  { id: 2, pendidikan: "S2", skor: 16 },
  { id: 3, pendidikan: "S1/D4", skor: 10 },
  { id: 4, pendidikan: "D3", skor: 8 },
  { id: 5, pendidikan: "D2", skor: 4 }
];

export const mockPegawaiPendidikan = [
  { id: 1, nip: "199001012015011001", id_pendidikan: 2, jurusan: "Administrasi Publik", univ: "Universitas Indonesia", tahun: 2012 },
  { id: 2, nip: "199102022016012002", id_pendidikan: 2, jurusan: "Ilmu Pemerintahan", univ: "Universitas Gadjah Mada", tahun: 2013 },
  { id: 3, nip: "199203032017011003", id_pendidikan: 3, jurusan: "Manajemen", univ: "Institut Teknologi Bandung", tahun: 2014 },
  { id: 4, nip: "199304042018012004", id_pendidikan: 3, jurusan: "Ilmu Komunikasi", univ: "Universitas Padjadjaran", tahun: 2015 },
  { id: 5, nip: "199405052019011005", id_pendidikan: 2, jurusan: "Akuntansi", univ: "Universitas Airlangga", tahun: 2016 }
];

export const mockPenghargaan = [
  { id: 1, penghargaan: "Penghargaan Internasional", skor: 10 },
  { id: 2, penghargaan: "Penghargaan Nasional", skor: 7 },
  { id: 3, penghargaan: "Penghargaan Instansional", skor: 4 }
];

export const mockPegawaiPenghargaan = [
  { id: 1, nip: "199001012015011001", id_penghargaan: 2, nama_penghargaan: "Satya Lencana Karya Satya XX Tahun", tahun: 2020 },
  { id: 2, nip: "199102022016012002", id_penghargaan: 3, nama_penghargaan: "Pegawai Teladan Kementerian", tahun: 2021 },
  { id: 3, nip: "199203032017011003", id_penghargaan: 3, nama_penghargaan: "Inovasi Terbaik", tahun: 2022 }
];

export const mockRekamJejak = [
  { id: 1, gugustugas: "Satgas Internasional", skor: 10 },
  { id: 2, gugustugas: "Satgas Nasional", skor: 8 },
  { id: 3, gugustugas: "Satgas Instansional", skor: 6 },
  { id: 4, gugustugas: "PLT/PLH", skor: 4 },
  { id: 5, gugustugas: "Katim", skor: 3 }
];

export const mockPegawaiRekamJejak = [
  { id: 1, nip: "199001012015011001", id_rekamjejak: 2, keterangan: "Satgas Reformasi Birokrasi Nasional", tahun: 2019 },
  { id: 2, nip: "199001012015011001", id_rekamjejak: 4, keterangan: "PLH Direktur Perencanaan", tahun: 2021 },
  { id: 3, nip: "199102022016012002", id_rekamjejak: 3, keterangan: "Satgas Digitalisasi Kementerian", tahun: 2020 },
  { id: 4, nip: "199203032017011003", id_rekamjejak: 5, keterangan: "Ketua Tim Monitoring Evaluasi", tahun: 2022 }
];

export const mockKinerjaKompetensi = [
  { id: 1, nip: "199001012015011001", nilai_kinerja: 18, nilai_kompetensipotensi: 17, tahun: 2023 },
  { id: 2, nip: "199102022016012002", nilai_kinerja: 17, nilai_kompetensipotensi: 16, tahun: 2023 },
  { id: 3, nip: "199203032017011003", nilai_kinerja: 16, nilai_kompetensipotensi: 15, tahun: 2023 },
  { id: 4, nip: "199304042018012004", nilai_kinerja: 15, nilai_kompetensipotensi: 14, tahun: 2023 },
  { id: 5, nip: "199405052019011005", nilai_kinerja: 16, nilai_kompetensipotensi: 15, tahun: 2023 }
];

export const mockRiwayatJabatan = [
  { id: 1, nip: "199001012015011001", jabatan: "Staf Perencanaan", tmt: "2015-01-01" },
  { id: 2, nip: "199001012015011001", jabatan: "Kepala Seksi", tmt: "2017-06-01" },
  { id: 3, nip: "199001012015011001", jabatan: "Kepala Bidang", tmt: "2020-01-01" },
  { id: 4, nip: "199102022016012002", jabatan: "Staf Analisis", tmt: "2016-01-01" },
  { id: 5, nip: "199102022016012002", jabatan: "Deputi Bidang Kebijakan", tmt: "2019-06-01" }
];