import { tambahDonasi, updateDonasiStatus, listenDonasiByUser } from "./database.js";

// Tidak perlu import jsQR karena kita pakai CDN di HTML

let currentDonasiId = null;

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "donatur") {
    window.location.replace("login.html");
    return;
  }
  const userId = user.id;

  // Set info user
  document.getElementById("namaSidebar").textContent = user.nama;
  document.getElementById("namaDashboard").textContent = user.nama;
  document.getElementById("donaturEmail").textContent = user.email;

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  // Sidebar toggle
  document.getElementById("toggleSidebar")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("content").classList.toggle("expanded");
  });

  // Navigasi sidebar
  document.querySelectorAll("#sidebar .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll("#sidebar .nav-link").forEach(l => l.classList.remove("active"));
      document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
      link.classList.add("active");
      const sectionId = link.getAttribute("data-section");
      if (sectionId) document.getElementById(sectionId).classList.add("active");
    });
  });

  const formDonasi = document.getElementById("formDonasi");
  const hasilDonasiEl = document.getElementById("hasilDonasi");
  const scanBtn = document.getElementById("scanBtn");
  const scanResultEl = document.getElementById("scanResult");
  const qrFileInput = document.getElementById("qrFileInput");
  const tbody = document.getElementById("riwayatTableBody");

  // =====================
  // Submit donasi baru
  // =====================
  if (formDonasi) {
    formDonasi.addEventListener("submit", async e => {
      e.preventDefault();

      const kategori = document.getElementById("kategoriDonasi").value;
      const namaDonasi = document.getElementById("namaDonasi").value;
      const jumlah = document.getElementById("jumlahDonasi").value;
      const satuan = document.getElementById("satuanDonasi").value;
      const masaKadaluarsa = document.getElementById("masaKadaluarsa").value;
      const lokasi = document.getElementById("lokasi").value;
      const fotoInput = document.getElementById("fotoDonasi");

      let fotoBase64 = "";
      if (fotoInput?.files && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async ev => {
          fotoBase64 = ev.target.result;
          await simpanDonasi();
        };
        reader.readAsDataURL(fotoInput.files[0]);
      } else {
        await simpanDonasi();
      }

      async function simpanDonasi() {
        try {
          const data = {
            kategori,
            nama: namaDonasi,
            jumlah,
            satuan,
            masaKadaluarsa,
            lokasi,
            status: "pending",
            donaturId: user.id,
            foto: fotoBase64,
            tanggal: new Date().toISOString()
          };

          const donasiId = await tambahDonasi(data);
          currentDonasiId = donasiId;

          // tampilkan hasil donasi
          document.getElementById("hasilKategori").textContent = kategori;
          document.getElementById("hasilNama").textContent = namaDonasi;
          document.getElementById("hasilJumlah").textContent = jumlah + " " + satuan;
          document.getElementById("hasilKadaluarsa").textContent = masaKadaluarsa + " Jam";
          document.getElementById("hasilLokasi").textContent = lokasi;

          scanResultEl.classList.add("d-none");
          scanBtn.classList.add("d-none");

          formDonasi.classList.add("d-none");
          hasilDonasiEl.classList.remove("d-none");

          alert("✅ Donasi berhasil dibuat dan menunggu verifikasi admin.");
        } catch (err) {
          console.error(err);
          alert("Gagal menyimpan donasi. Coba lagi.");
        }
      }
    });
  }

  // =====================
  // Scan QR
  // =====================
  if (scanBtn && qrFileInput) {
    scanBtn.addEventListener("click", () => {
      scanResultEl.classList.add("d-none");
      qrFileInput.click();
    });

    qrFileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file || !currentDonasiId) return;

      const reader = new FileReader();
      reader.onload = async ev => {
        const img = new Image();
        img.src = ev.target.result;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // jsQR tersedia dari CDN
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (!code) return alert("QR code tidak terbaca.");

          try {
            const qrData = JSON.parse(code.data);

            // Validasi QR
            if (qrData.donasiId !== currentDonasiId) {
              return alert("QR code ini tidak sesuai dengan donasi Anda.");
            }

            await updateDonasiStatus(currentDonasiId, "Diambil");

            scanResultEl.classList.remove("d-none", "alert-info", "alert-danger");
            scanResultEl.classList.add("alert-success");
            scanResultEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> Donasi berhasil diambil.`;

            scanBtn.classList.add("d-none");
            alert("✅ Donasi ditandai telah diambil!");
          } catch (err) {
            console.error(err);
            alert("QR code tidak valid.");
          }
        };
      };
      reader.readAsDataURL(file);
    });
  }

  // =====================
  // Riwayat & logika tampil form / scan
  // =====================
  if (tbody) {
    tbody.innerHTML = "<tr><td colspan='4'>⏳ Memuat...</td></tr>"; // ubah colspan jadi 4 karena kolom bukti dihapus

    listenDonasiByUser(userId, data => {
      tbody.innerHTML = "";

      if (!data || data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>Belum ada donasi dari Anda.</td></tr>";
        formDonasi.classList.remove("d-none");
        hasilDonasiEl.classList.add("d-none");
        scanBtn.classList.add("d-none");
        currentDonasiId = null;
        return;
      }

      const aktifDonasi = data.find(d => d.status === "pending" || d.status === "approved");

      if (aktifDonasi) {
        currentDonasiId = aktifDonasi.id;
        formDonasi.classList.add("d-none");
        hasilDonasiEl.classList.remove("d-none");

        document.getElementById("hasilKategori").textContent = aktifDonasi.kategori;
        document.getElementById("hasilNama").textContent = aktifDonasi.nama;
        document.getElementById("hasilJumlah").textContent = aktifDonasi.jumlah + " " + aktifDonasi.satuan;
        document.getElementById("hasilKadaluarsa").textContent = aktifDonasi.masaKadaluarsa + " Jam";
        document.getElementById("hasilLokasi").textContent = aktifDonasi.lokasi;

        scanBtn.classList.toggle("d-none", aktifDonasi.status !== "approved");
      } else {
        currentDonasiId = null;
        formDonasi.classList.remove("d-none");
        hasilDonasiEl.classList.add("d-none");
        scanBtn.classList.add("d-none");
      }

      // Update riwayat tanpa kolom bukti
      data.forEach(donasi => {
        const tr = document.createElement("tr");

        const statusBadgeClass =
          donasi.status === "pending" ? "bg-warning" :
          donasi.status === "approved" ? "bg-success" :
          donasi.status === "rejected" ? "bg-danger" :
          donasi.status === "Diambil" ? "bg-primary" : "bg-secondary";

        tr.innerHTML = `
          <td>${donasi.nama || "-"}</td>
          <td>${donasi.jumlah || 0} ${donasi.satuan || ""}</td>
          <td>${donasi.lokasi || "-"}</td>
          <td><span class="badge ${statusBadgeClass}">${donasi.status || "-"}</span></td>
        `;
        tbody.appendChild(tr);
      });
    });
  }
});
