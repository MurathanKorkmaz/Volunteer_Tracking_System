const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 🔁 Ortak işlem fonksiyonu: Taşı, Sil, Yayına Al
async function archiveAndPublishHandler() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const eventCol = db.collection(`events/${year}/${month}`);
  const eventDocs = await eventCol.listDocuments();

  for (const docRef of eventDocs) {
    const docSnap = await docRef.get();
    const data = docSnap.data();

    // 1️⃣ eventPublish === "1" ➜ Taşı ve Sil
    if (data.eventPublish === "1") {
      const destRef = db.doc(`pastEvents/${year}/${month}/${docRef.id}`);
      await destRef.set(data);

      const collections = await docRef.listCollections();

      // Alt koleksiyonları taşı
      for (const subCol of collections) {
        const subDocs = await subCol.listDocuments();
        for (const subDocRef of subDocs) {
          const subDocSnap = await subDocRef.get();
          await destRef.collection(subCol.id).doc(subDocSnap.id).set(subDocSnap.data());
        }
      }

      // Alt koleksiyonları sil
      for (const subCol of collections) {
        const subDocs = await subCol.listDocuments();
        for (const subDocRef of subDocs) {
          await subDocRef.delete();
        }
      }

      // Ana dokümanı sil
      await docRef.delete();
    }

    // 2️⃣ eventPublish === "0" ➜ Sadece 1 yap
    else if (data.eventPublish === "0") {
      await docRef.update({ eventPublish: "1" });
    }
  }

  console.log("✅ İşlem tamamlandı: 1 olanlar taşındı ve silindi, 0 olanlar yayına alındı.");
}

// 🟢 MANUEL TETİKLEYİCİ (Tarayıcıdan çalıştırmak için)
exports.runNowArchive = onRequest(async (req, res) => {
  await archiveAndPublishHandler();
  res.send("🟢 Manuel: Taşıma, silme ve yayına alma işlemleri yapıldı.");
});

// ⏰ ZAMANLAYICI — Saat 00:42'de otomatik çalışacak
exports.scheduledArchiveAndPublish = onSchedule(
  {
    schedule: '50 18 * * 6',   // Her Cumartesi 18:50'de çalışacak
    timeZone: 'Europe/Istanbul',
  },
  async () => {
    await archiveAndPublishHandler();
  }
);

