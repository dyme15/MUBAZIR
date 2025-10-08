import { getDonasi, getUsers, getUserById, updateDonasiStatus } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
  // =====================
  // Proteksi Admin
  // =====================
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Akses ditolak! Hanya admin yang dapat membuka halaman ini.");
    window.location.href = "login.html";
    return;
  }
  document.getElementById("namaDashboard").textContent = currentUser.nama || "Admin";

  // =====================
  // Ambil data donasi & pengguna
  // =====================
  let donasiData = await getDonasi();
  const allUsers = await getUsers();

  // =====================
  // Fungsi badge status
  // =====================
  function getStatusBadge(status) {
    switch (status) {
      case "pending":
        return `<span class="badge bg-warning text-dark"><i class="bi bi-clock"></i> Pending</span>`;
      case "approved":
        return `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Disetujui</span>`;
      case "rejected":
        return `<span class="badge bg-danger"><i class="bi bi-x-circle"></i> Ditolak</span>`;
      case "Diambil":
        return `<span class="badge bg-info"><i class="bi bi-qr-code"></i> Diambil</span>`;
      default:
        return `<span class="badge bg-secondary">Tidak Diketahui</span>`;
    }
  }

  // =====================
  // Tombol aksi Setujui/Tolak
  // =====================
  function getActionButtons(donasi) {
    if (donasi.status === "pending") {
      return `
        <button class="btn btn-sm btn-success set-status-btn me-1" data-id="${donasi.id}" data-status="approved">
          <i class="bi bi-check-lg"></i> Setujui
        </button>
        <button class="btn btn-sm btn-outline-danger set-status-btn" data-id="${donasi.id}" data-status="rejected">
          <i class="bi bi-x-lg"></i> Tolak
        </button>`;
    } else {
      return `<span class="small">${donasi.status === "approved" ? "Disetujui" : donasi.status === "rejected" ? "Ditolak" : donasi.status}</span>`;
    }
  }

  // =====================
  // Load tabel verifikasi
  // =====================
  async function loadVerifikasiTable() {
    const tbody = document.getElementById("verifikasiTableBody");
    tbody.innerHTML = "";

    for (const donasi of donasiData) {
      let namaDonatur = "Tidak diketahui";
      if (donasi.donaturId) {
        const user = await getUserById(donasi.donaturId);
        if (user?.nama) namaDonatur = user.nama;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${namaDonatur}</td>
        <td>${donasi.kategori || "-"}</td>
        <td>${donasi.jumlah || 0} ${donasi.satuan || ""}</td>
        <td>${donasi.masaKadaluarsa || "-"}</td>
        <td>${donasi.lokasi || "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary view-photo-btn" data-bs-toggle="modal"
            data-bs-target="#fotoModal" data-foto-url="${donasi.foto || 'assets/img/default-food.jpg'}">
            <i class="bi bi-image"></i> Lihat
          </button>
        </td>
        <td>${getStatusBadge(donasi.status)}</td>
        <td>${getActionButtons(donasi)}</td>
      `;
      tbody.appendChild(tr);
    }

    // =====================
    // Event tombol set status
    // =====================
    document.querySelectorAll(".set-status-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const statusBaru = e.currentTarget.getAttribute("data-status");

        try {
          await updateDonasiStatus(id, statusBaru);
          alert(`Status donasi berhasil diubah menjadi ${statusBaru.toUpperCase()}`);
          // refresh tabel
          donasiData = await getDonasi();
          await loadVerifikasiTable();
        } catch (err) {
          console.error("Gagal update status:", err);
          alert("Terjadi kesalahan saat update status.");
        }
      });
    });

    // =====================
    // Event view photo
    // =====================
    document.querySelectorAll(".view-photo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const fotoUrl = e.currentTarget.getAttribute("data-foto-url");
        document.getElementById("modalImage").src = fotoUrl;
      });
    });
  }

  await loadVerifikasiTable();

  // =====================
  // Monitoring total donasi & pengguna
  // =====================
  document.getElementById("totalDonasi").textContent = donasiData.length;
  document.getElementById("totalPengguna").textContent = allUsers.length;

  // =====================
  // Sidebar toggle
  // =====================
  document.getElementById("toggleSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("content").classList.toggle("expanded");
  });

  // =====================
  // Navigasi section
  // =====================
  document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll("#sidebar .nav-link").forEach((l) => l.classList.remove("active"));
      document.querySelectorAll(".page-section").forEach((sec) => sec.classList.remove("active"));
      link.classList.add("active");
      const sectionId = link.getAttribute("data-section");
      document.getElementById(sectionId).classList.add("active");
    });
  });

  // =====================
  // Logout
  // =====================
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
});
