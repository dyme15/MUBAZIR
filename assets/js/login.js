import { 
  getAdmin, 
  getDonatur, 
  tambahDonatur 
} from "./database.js";

// =====================
// Toggle Login / Register (Flip 3D)
// =====================
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const formTitle = document.getElementById("form-title"); // hanya untuk sisi depan
const toggleLink = document.getElementById("toggle-link");       // link di sisi login
const toggleLinkBack = document.getElementById("toggle-link-back"); // link di sisi register
const toggleText = document.getElementById("toggle-text");       // teks kecil di sisi login
const authCard = document.querySelector(".auth-card");

function flipToRegister() {
  authCard.classList.add("flipped");
  if (formTitle) formTitle.textContent = "Login"; // tetap jaga konsistensi sisi depan
  if (toggleText) toggleText.textContent = "Belum punya akun?";
  if (toggleLink) toggleLink.textContent = "Daftar di sini";
}

function flipToLogin() {
  authCard.classList.remove("flipped");
  if (formTitle) formTitle.textContent = "Login";
  if (toggleText) toggleText.textContent = "Belum punya akun?";
  if (toggleLink) toggleLink.textContent = "Daftar di sini";
}

if (toggleLink) {
  toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    flipToRegister();
  });
}

if (toggleLinkBack) {
  toggleLinkBack.addEventListener("click", (e) => {
    e.preventDefault();
    flipToLogin();
  });
}

// =====================
// LOGIN
// =====================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();

  if (!email || !password) {
    alert("Email dan password harus diisi!");
    return;
  }

  try {
    // cek admin dulu
    const adminData = await getAdmin();
    const adminList = Object.entries(adminData || {});
    const adminMatch = adminList.find(([id, data]) => 
      data.email === email && data.password === password
    );

    if (adminMatch) {
      const [id, data] = adminMatch;
      localStorage.setItem("user", JSON.stringify({
        role: "admin",
        id,
        nama: data.nama,
        email: data.email
      }));
      alert("Login sebagai Admin berhasil!");
      window.location.href = "admin.html";
      return;
    }

    // cek donatur
    const donaturData = await getDonatur();
    const donaturList = Object.entries(donaturData || {});
    const donaturMatch = donaturList.find(([id, data]) => 
      data.email === email && data.password === password
    );

    if (donaturMatch) {
      const [id, data] = donaturMatch;
      localStorage.setItem("user", JSON.stringify({
        role: "donatur",
        id,
        nama: data.nama,
        email: data.email
      }));
      alert("Login Donatur berhasil!");
      window.location.href = "donatur.html";
      return;
    }

    alert("Email atau password salah!");
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat login.");
  }
});

// =====================
// REGISTER DONATUR
// =====================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("emailRegister").value.trim();
  const noHp = document.getElementById("noHp").value.trim();
  const password = document.getElementById("passwordRegister").value.trim();

  if (!nama || !email || !noHp || !password) {
    alert("Semua field harus diisi!");
    return;
  }

  try {
    const donaturData = await getDonatur();
    const emailExists = Object.values(donaturData || {}).some(d => d.email === email);

    if (emailExists) {
      alert("Email sudah terdaftar, silakan gunakan email lain!");
      return;
    }

    await tambahDonatur({
      nama,
      email,
      no_hp: noHp,
      password,
      poin: 0,
      level: "Pemula",
      role: "donatur",
      createdAt: new Date().toISOString()
    });

    alert("Registrasi berhasil! Silakan login.");
    flipToLogin();
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat registrasi.");
  }
});

// =====================
// LOGOUT (untuk dashboard)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
});

// =====================
// PROTEKSI HALAMAN DASHBOARD
// =====================
function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function requireDonatur() {
  const user = getCurrentUser();
  if (!user || user.role !== "donatur") {
    alert("Anda harus login sebagai Donatur untuk mengakses halaman ini!");
    window.location.href = "login.html";
  }
  return user;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    alert("Anda harus login sebagai Admin untuk mengakses halaman ini!");
    window.location.href = "login.html";
  }
  return user;
}

window.auth = {
  getCurrentUser,
  requireDonatur,
  requireAdmin
};
