import { getDonasi, getUserById } from "./database.js";

let semuaDonasi = [];
let kategoriAktif = "all";

// =====================
// Load & Render Donasi
// =====================
async function loadDonasi() {
  semuaDonasi = await getDonasi();
  renderDonasi();
}

async function renderDonasi() {
  const postContainer = document.getElementById("postContainer");
  const judulFeed = document.getElementById("judulFeed");
  const searchKeyword = document.getElementById("searchInput").value.toLowerCase();

  postContainer.innerHTML = "";

  let filtered = semuaDonasi.filter(d => {
    const cocokStatus = d.status === "approved"; // hanya donasi disetujui
    const cocokKategori = kategoriAktif === "all" || d.kategori === kategoriAktif;
    const cocokSearch = Object.values(d).join(" ").toLowerCase().includes(searchKeyword);
    return cocokStatus && cocokKategori && cocokSearch;
  });

  const selectedItem = document.querySelector(`.dropdown-menu .dropdown-item[data-value="${kategoriAktif}"]`);
  judulFeed.textContent = selectedItem ? selectedItem.textContent : "Semua Donasi";

  const currentUserId = localStorage.getItem("donaturId"); // Ambil user login

  if (filtered.length === 0) {
    postContainer.innerHTML = "<p class='text-center text-muted'>Tidak ada donasi ditemukan.</p>";
    return;
  }

  for (const d of filtered) {
    // ===== Nama & No HP donatur
    let donaturNama = "Nama Donatur Tidak Ditemukan";
    let donaturHp = "-";

    if (d.donaturId) {
      try {
        const donatur = await getUserById(d.donaturId);
        if (donatur?.nama) donaturNama = donatur.nama;
        donaturHp = donatur?.no_hp || "-"; // <-- ambil no_hp
      } catch (err) {
        console.error("Error fetch donatur", err);
      }
    }

    const waktuPost = new Date(d.dibuat);
    const waktuKadaluarsa = new Date(waktuPost);
    waktuKadaluarsa.setHours(waktuKadaluarsa.getHours() + 3);
    const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' };
    const waktuKadaluarsaFormatted = new Intl.DateTimeFormat('id-ID', options).format(waktuKadaluarsa);

    const card = document.createElement("div");
    card.className = "col-lg-6";
    card.setAttribute("data-id", d.id);
    card.setAttribute("data-kategori", d.kategori || "");

    // Link Ambil Donasi
    const klaimLink = `klaim.html?donasiId=${d.id}${currentUserId ? `&donaturId=${currentUserId}` : ""}`;

    card.innerHTML = `
      <div class="feed-card position-relative">
        <div class="label-kadaluarsa">Kadaluarsa: ${waktuKadaluarsaFormatted} WIB</div>
        <div class="feed-gallery mb-2">
          <img src="${d.foto || 'assets/img/default-food.jpg'}" alt="${d.nama || 'Donasi'}" class="main-img w-100" style="border-radius:10px;">
        </div>
        <div class="feed-body">
          <p><strong>Nama Donasi:</strong> ${d.nama || "Nama Donasi Tidak Ditemukan"}</p>
          <p><strong>Jumlah:</strong> ${d.jumlah || 0} ${d.satuan || ""}</p>
          <p><strong>Lokasi:</strong> ${d.lokasi || "-"}</p>
          <p><strong>Donatur:</strong> ${donaturNama} (${donaturHp})</p>
        </div>
        <div class="feed-footer mt-2">
          <a href="${klaimLink}" class="btn btn-success btn-sm">Ambil Donasi</a>
        </div>
      </div>`;

    postContainer.appendChild(card);
  }

  // Init gallery thumbnails
  document.querySelectorAll(".feed-gallery").forEach(initGallery);
}

// =====================
// Gallery
// =====================
function initGallery(gallery) {
  const mainImg = gallery.querySelector(".main-img");
  const thumbs = gallery.querySelectorAll(".thumb");
  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
}

// =====================
// Search & Filter
// =====================
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

document.getElementById("searchInput").addEventListener("input", debounce(renderDonasi, 300));

document.querySelectorAll(".dropdown-menu .dropdown-item").forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    kategoriAktif = item.getAttribute("data-value");
    renderDonasi();
  });
});

// =====================
// Login check Donasi button
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const btnDonasi = document.getElementById("btnDonasi");
  const loginStatus = localStorage.getItem("isDonaturLogin");

  btnDonasi.addEventListener("click", () => {
    if (loginStatus === "true") {
      window.location.href = "donatur.html";
    } else {
      window.location.href = "login.html";
    }
  });
});

// =====================
// Start
// =====================
loadDonasi();
