import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child,
  query,
  orderByChild,
  equalTo,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// =====================
// Konfigurasi Firebase
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyAbhEbYYwcVMJQwBXH9UPXDNiUr6Az1Cgs",
  authDomain: "mubazir-8d111.firebaseapp.com",
  projectId: "mubazir-8d111",
  storageBucket: "mubazir-8d111.appspot.com",
  messagingSenderId: "392114414906",
  appId: "1:392114414906:web:a928cc58ae0242fef51c03",
  measurementId: "G-7D2D8ZWG2R",
  databaseURL: "https://mubazir-8d111-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================
// AUTO-SEED ADMIN DEFAULT
// =====================
async function seedAdmin() {
  try {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);

    // Cek apakah admin sudah ada
    let adminSudahAda = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      adminSudahAda = Object.values(data).some(
        (u) => u.email === "admin@mubazir.com"
      );
    }

    // Jika belum ada admin
    if (!adminSudahAda) {
      const newRef = push(usersRef);
      await set(newRef, {
        nama: "Admin Utama",
        email: "admin@mubazir.com",
        password: "admin123",
        no_hp: "081234567890",
        role: "admin",
        createdAt: new Date().toISOString(),
      });
      console.log("✅ Admin default berhasil ditambahkan ke database.");
    } else {
      console.log("ℹ️ Admin default sudah ada, tidak ditambahkan ulang.");
    }
  } catch (err) {
    console.error("❌ Gagal membuat admin default:", err);
  }
}

// Jalankan otomatis saat load
seedAdmin();

// =====================
// USERS (Admin + Donatur)
// =====================
export async function tambahUser(data) {
  const newRef = push(ref(db, "users"));
  await set(newRef, data);
  return newRef.key;
}

export async function getUsers() {
  const snapshot = await get(child(ref(db), "users"));
  const data = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(data).map(([id, user]) => ({ id, ...user }));
}

export async function getUserById(id) {
  const snapshot = await get(child(ref(db), `users/${id}`));
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

export async function getUserByEmail(email) {
  const usersRef = ref(db, "users");
  const q = query(usersRef, orderByChild("email"), equalTo(email));
  const snapshot = await get(q);

  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  const [id, user] = Object.entries(data)[0];
  return { id, ...user };
}

// =====================
// DONASI
// =====================
export async function tambahDonasi(data) {
  const newRef = push(ref(db, "donasi"));
  await set(newRef, {
    ...data,
    status: data.status || "pending",
    dibuat: new Date().toISOString(),
  });
  return newRef.key;
}

export async function getDonasi() {
  const snapshot = await get(child(ref(db), "donasi"));
  const data = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(data).map(([id, donasi]) => ({ id, ...donasi }));
}

export async function getDonasiById(id) {
  const snapshot = await get(child(ref(db), `donasi/${id}`));
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

export function listenDonasiByUser(userId, callback) {
  const donasiRef = ref(db, "donasi");
  const donasiQuery = query(donasiRef, orderByChild("donaturId"), equalTo(userId));
  onValue(donasiQuery, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    const result = Object.entries(data).map(([id, donasi]) => ({ id, ...donasi }));
    callback(result);
  });
}

// =====================
// KLAIM
// =====================
export async function klaimDonasi(donasiId, klaimData) {
  const newRef = push(ref(db, `klaim/${donasiId}`));
  await set(newRef, {
    ...klaimData,
    waktuKlaim: new Date().toISOString(),
  });
  return newRef.key;
}

export async function getKlaimByDonasi(donasiId) {
  const snapshot = await get(child(ref(db), `klaim/${donasiId}`));
  const data = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(data).map(([id, klaim]) => ({ id, ...klaim }));
}

export async function getKlaimById(donasiId, klaimId) {
  const snapshot = await get(child(ref(db), `klaim/${donasiId}/${klaimId}`));
  return snapshot.exists() ? { id: klaimId, ...snapshot.val() } : null;
}

// =====================
// VALIDASI KLAIM HARIAN
// =====================
export async function cekKlaimHariIni(noHp) {
  const today = new Date().toISOString().split("T")[0];
  const snapshot = await get(child(ref(db), `klaim_by_hp/${noHp}/${today}`));
  return snapshot.exists();
}

export async function tambahKlaimDenganValidasi(donasiId, dataKlaim) {
  const today = new Date().toISOString().split("T")[0];
  const noHp = dataKlaim.hpPenerima;

  const sudahKlaim = await cekKlaimHariIni(noHp);
  if (sudahKlaim) throw new Error("Nomor HP ini sudah klaim hari ini. Maksimal 1x per hari.");

  const newRef = push(ref(db, `klaim/${donasiId}`));
  const klaimData = {
    ...dataKlaim,
    waktuKlaim: new Date().toISOString(),
  };

  await set(newRef, klaimData);
  await set(ref(db, `klaim_by_hp/${noHp}/${today}`), { donasiId, klaimId: newRef.key });

  return newRef.key;
}

// =====================
// UPDATE STATUS DONASI
// =====================
export async function updateDonasiStatus(donasiId, statusBaru) {
  const donasiRef = ref(db, `donasi/${donasiId}`);
  await update(donasiRef, { status: statusBaru });
  console.log(`✅ Status donasi ${donasiId} diperbarui menjadi ${statusBaru}`);
}
