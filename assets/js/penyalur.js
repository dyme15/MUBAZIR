// 🔍 Search: hanya cek "jenis" & "lokasi"
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {
  const keyword = this.value.toLowerCase();

  const posts = document.querySelectorAll("#postContainer .col-lg-6");
  posts.forEach(post => {
    const feedBody = post.querySelector(".feed-body");
    const paragraphs = feedBody ? feedBody.querySelectorAll("p") : [];

    const donatur = post.querySelector(".feed-header h5")?.innerText.toLowerCase() || "";
    const jenis   = paragraphs[0]?.innerText.toLowerCase() || "";
    const jumlah  = paragraphs[1]?.innerText.toLowerCase() || "";
    const lokasi  = paragraphs[2]?.innerText.toLowerCase() || "";
    const kategoriAttr = post.getAttribute("data-kategori")?.toLowerCase() || "";

    // cari judul kategori dari section
    let kategoriTitle = "";
    const kategoriSection = document.querySelector(`#${kategoriAttr} h2`);
    if (kategoriSection) {
      kategoriTitle = kategoriSection.innerText.toLowerCase();
    }

    // cek apakah keyword ada di donatur, jenis, jumlah, lokasi, atau kategori
    const match = 
      donatur.includes(keyword) ||
      jenis.includes(keyword) ||
      jumlah.includes(keyword) ||
      lokasi.includes(keyword) ||
      kategoriAttr.includes(keyword) ||
      kategoriTitle.includes(keyword);

    post.style.display = match ? "" : "none";
  });
});

// 🖼️ Fungsi untuk aktifkan galeri thumbnail
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

// 📌 Setelah DOM siap
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi galeri di feed utama
  document.querySelectorAll(".feed-gallery").forEach(initGallery);

  // Clone card dari feed utama ke kategori
  const posts = document.querySelectorAll("#postContainer .col-lg-6");
  posts.forEach(post => {
    const kategori = post.getAttribute("data-kategori");
    if (kategori) {
      const target = document.querySelector(`#${kategori} .row`);
      if (target) {
        const clone = post.cloneNode(true);
        target.appendChild(clone);

        // aktifkan galeri untuk hasil clone
        const cloneGallery = clone.querySelector(".feed-gallery");
        if (cloneGallery) initGallery(cloneGallery);
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // cari semua tombol "Ambil Donasi"
  const ambilButtons = document.querySelectorAll(".btn-ambil");

  ambilButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // ambil id dari parent card
      const post = btn.closest(".col-lg-6");
      const postId = post.getAttribute("data-id");

      // redirect ke halaman klaim.html dengan query param
      if (postId) {
        window.location.href = `klaim.html?post_id=${postId}`;
      } else {
        alert("Donasi tidak valid.");
      }
    });
  });
});

  document.addEventListener("DOMContentLoaded", () => {
    const loginStatus = localStorage.getItem("isDonaturLogin");
    const btnDonasi = document.getElementById("btnDonasi");

    btnDonasi.addEventListener("click", () => {
      if (loginStatus === "true") {
        window.location.href = "dashboard_donatur.html";
      } else {
        window.location.href = "login_donatur.html";
      }
    });
  });


