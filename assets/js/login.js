import { getUserByEmail, tambahUser } from "./database.js";

// =====================
// Elemen DOM
// =====================
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authCard = document.querySelector(".auth-card");
const toggleLink = document.getElementById("toggle-link");
const toggleLinkBack = document.getElementById("toggle-link-back");

// =====================
// Animasi Flip Login/Register
// =====================
function flipToRegister() {
  authCard.classList.add("flipped");
}

function flipToLogin() {
  authCard.classList.remove("flipped");
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
    const user = await getUserByEmail(email);

    if (!user) {
      alert("Email tidak ditemukan!");
      return;
    }

    if (user.password !== password) {
      alert("Password salah!");
      return;
    }

    // Simpan ke localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      })
    );

    if (user.role === "admin") {
      alert("Login sebagai Admin berhasil!");
      window.location.href = "admin.html";
    } else {
      alert("Login sebagai Donatur berhasil!");
      window.location.href = "donatur.html";
    }
  } catch (err) {
    console.error("❌ Error saat login:", err);
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
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      alert("Email sudah terdaftar. Gunakan email lain!");
      return;
    }

    await tambahUser({
      nama,
      email,
      no_hp: noHp,
      password,
      poin: 0,
      level: "Pemula",
      role: "donatur",
      createdAt: new Date().toISOString(),
    });

    alert("Registrasi berhasil! Silakan login.");
    flipToLogin();
  } catch (err) {
    console.error("❌ Gagal registrasi:", err);
    alert("Terjadi kesalahan saat registrasi.");
  }
});

// =====================
// LOGOUT
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
    alert("Anda harus login sebagai Donatur!");
    window.location.href = "login.html";
  }
  return user;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    alert("Anda harus login sebagai Admin!");
    window.location.href = "login.html";
  }
  return user;
}

window.auth = {
  getCurrentUser,
  requireDonatur,
  requireAdmin,
};
