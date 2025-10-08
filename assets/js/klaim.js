import { getDonasi, getUserById, tambahKlaimDenganValidasi } from "./database.js";

// Ambil donasiId dari query param
const urlParams = new URLSearchParams(window.location.search);
const donasiId = urlParams.get("donasiId");

let fotoBase64 = "";

// Elemen DOM
const fotoInput = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");
const klaimForm = document.getElementById("klaimForm");
const klaimResult = document.getElementById("klaimResult");

// Info donasi & penyalur
const infoNamaDonasi = document.getElementById("infoNamaDonasi");
const infoJumlah = document.getElementById("infoJumlah");
const infoLokasi = document.getElementById("infoLokasi");
const infoNamaDonatur = document.getElementById("infoNamaDonatur");
const infoHpDonatur = document.getElementById("infoHpDonatur");

// Hasil klaim (donasi + penyalur)
const resNamaDonasi = document.getElementById("resNamaDonasi");
const resJumlah = document.getElementById("resJumlah");
const resLokasi = document.getElementById("resLokasi");
const resNamaDonatur = document.getElementById("resNamaDonatur");
const resHpDonatur = document.getElementById("resHpDonatur");

// Hasil klaim (penerima)
const resNama = document.getElementById("resNama");
const resHp = document.getElementById("resHp");
const resInstansi = document.getElementById("resInstansi");
const resAlamat = document.getElementById("resAlamat");
const resFasilitas = document.getElementById("resFasilitas");
const resCatatan = document.getElementById("resCatatan");
const resFoto = document.getElementById("resFoto");
const batasWaktu = document.getElementById("batasWaktu");
const qrContainer = document.getElementById("qrcode");
const downloadQR = document.getElementById("downloadQR");

// =====================
// Load Data Donasi & Penyalur
// =====================
async function loadDonasiInfo() {
  if (!donasiId) return alert("Donasi tidak valid.");

  const donasi = await getDonasi(donasiId);
  if (!donasi) return alert("Donasi tidak ditemukan.");

  // Ambil data penyalur
  let namaDonatur = "Tidak Diketahui";
  let hpDonatur = "-";
  let donaturId = null;
  if (donasi.donaturId) {
    const donatur = await getUserById(donasi.donaturId);
    if (donatur) {
      namaDonatur = donatur.nama || namaDonatur;
      hpDonatur = donatur.hp || "-";
      donaturId = donatur.id;
    }
  }

  // Tampilkan info donasi & penyalur di form
  infoNamaDonasi.textContent = donasi.nama || "Nama Donasi Tidak Ditemukan";
  infoJumlah.textContent = `${donasi.jumlah || 0} ${donasi.satuan || ""}`;
  infoLokasi.textContent = donasi.lokasi || "-";
  infoNamaDonatur.textContent = namaDonatur;
  infoHpDonatur.textContent = hpDonatur;

  // Simpan juga untuk hasil klaim nanti
  resNamaDonasi.textContent = donasi.nama || "Nama Donasi Tidak Ditemukan";
  resJumlah.textContent = `${donasi.jumlah || 0} ${donasi.satuan || ""}`;
  resLokasi.textContent = donasi.lokasi || "-";
  resNamaDonatur.textContent = namaDonatur;
  resHpDonatur.textContent = hpDonatur;

  // Simpan donaturId untuk QR
  klaimForm.dataset.donaturId = donaturId;
}

// =====================
// Preview Foto Penerima
// =====================
fotoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    fotoBase64 = e.target.result;
    previewFoto.src = fotoBase64;
    previewFoto.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// =====================
// Submit Form Klaim
// =====================
klaimForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value;
  const hp = document.getElementById("hp").value;
  const instansi = document.getElementById("instansi").value || "-";
  const alamat = document.getElementById("alamat").value;
  const fasilitatorPendamping = document.getElementById("fasilitatorPendamping").value;
  const catatan = document.getElementById("catatan").value || "-";

  const klaimData = {
    nama,
    hpPenerima: hp,
    instansi,
    alamat,
    fasilitatorPendamping,
    catatan,
    foto: fotoBase64
  };

  try {
    // Simpan klaim
    const klaimKey = await tambahKlaimDenganValidasi(donasiId, klaimData);

    const expireTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Tampilkan hasil klaim (penerima)
    resNama.textContent = nama;
    resHp.textContent = hp;
    resInstansi.textContent = instansi;
    resAlamat.textContent = alamat;
    resFasilitas.textContent = fasilitatorPendamping;
    resCatatan.textContent = catatan;
    resFoto.src = fotoBase64;

    batasWaktu.innerHTML = `⏳ Batas pengambilan: <strong>${expireTime.toLocaleTimeString("id-ID",{hour:'2-digit',minute:'2-digit'})}</strong>`;

    // QR Code (include klaimKey, donasiId, donaturId)
    const donaturId = klaimForm.dataset.donaturId;
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: JSON.stringify({ donasiId, klaimKey, donaturId }),
      width: 200,
      height: 200
    });

    setTimeout(() => {
      const canvas = qrContainer.querySelector("canvas");
      if (canvas) downloadQR.href = canvas.toDataURL("image/png");
    }, 500);

    klaimForm.style.display = "none";
    klaimResult.style.display = "block";

  } catch (err) {
    console.error(err);
    alert(err.message || "Terjadi kesalahan saat klaim donasi.");
  }
});

// =====================
// Inisialisasi
// =====================
loadDonasiInfo();
