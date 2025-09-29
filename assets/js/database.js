// database.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// =====================
// Konfigurasi Firebase
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyAbhEbYYwcVMJQwBXH9UPXDNiUr6Az1Cgs",
  authDomain: "mubazir-8d111.firebaseapp.com",
  projectId: "mubazir-8d111",
  storageBucket: "mubazir-8d111.firebasestorage.app",
  messagingSenderId: "392114414906",
  appId: "1:392114414906:web:a928cc58ae0242fef51c03",
  measurementId: "G-7D2D8ZWG2R",
  databaseURL: "https://mubazir-8d111-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================
//   ADMIN
// =====================
export async function tambahAdmin(data) {
  const newRef = push(ref(db, "admin"));
  await set(newRef, data);
  return newRef.key;
}

export async function getAdmin() {
  const snapshot = await get(child(ref(db), "admin"));
  return snapshot.exists() ? snapshot.val() : {};
}

export async function getAdminById(id) {
  const snapshot = await get(child(ref(db), `admin/${id}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// =====================
//   DONATUR
// =====================
export async function tambahDonatur(data) {
  const newRef = push(ref(db, "donatur"));
  await set(newRef, data);
  return newRef.key;
}

export async function getDonatur() {
  const snapshot = await get(child(ref(db), "donatur"));
  const data = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(data).map(([id, donatur]) => ({ id, ...donatur }));
}

export async function getDonaturById(id) {
  const snapshot = await get(child(ref(db), `donatur/${id}`));
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

// =====================
//   DONASI
// =====================
export async function tambahDonasi(data) {
  const newRef = push(ref(db, "donasi"));
  await set(newRef, {
    ...data,
    dibuat: new Date().toISOString()
  });
  return newRef.key;
}

// Mengembalikan array untuk loop mudah
export async function getDonasi() {
  const snapshot = await get(child(ref(db), "donasi"));
  const data = snapshot.exists() ? snapshot.val() : {};
  return Object.entries(data).map(([id, donasi]) => ({ id, ...donasi }));
}

export async function getDonasiById(id) {
  const snapshot = await get(child(ref(db), `donasi/${id}`));
  return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

// Dengarkan perubahan realtime pada donasi
export function listenDonasi(callback) {
  const donasiRef = ref(db, "donasi");
  onValue(donasiRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    // ubah ke array
    callback(Object.entries(data).map(([id, donasi]) => ({ id, ...donasi })));
  });
}

// =====================
//   KLAIM
// =====================
export async function tambahKlaim(donasiId, dataKlaim) {
  const newRef = push(ref(db, `klaim/${donasiId}`));
  await set(newRef, {
    ...dataKlaim,
    waktu: new Date().toISOString()
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

// Cek apakah nomor HP sudah klaim hari ini
export async function cekKlaimHariIni(noHp) {
  const today = new Date().toISOString().split("T")[0];
  const snapshot = await get(child(ref(db), `klaim_by_hp/${noHp}/${today}`));
  return snapshot.exists();
}

// Tambah klaim dengan validasi
export async function tambahKlaimDenganValidasi(donasiId, dataKlaim) {
  const today = new Date().toISOString().split("T")[0];
  const noHp = dataKlaim.hpPenerima;

  const sudahKlaim = await cekKlaimHariIni(noHp);
  if (sudahKlaim) throw new Error("Nomor HP ini sudah klaim hari ini. Maksimal 1x per hari.");

  const newRef = push(ref(db, `klaim/${donasiId}`));
  const klaimData = {
    ...dataKlaim,
    waktuKlaim: new Date().toISOString()
  };

  await set(newRef, klaimData);
  await set(ref(db, `klaim_by_hp/${noHp}/${today}`), { donasiId, klaimId: newRef.key });

  return newRef.key;
}
