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

// ⏰ ZAMANLAYICI — Saat 18:50'de otomatik çalışacak (her Cumartesi)
exports.scheduledArchiveAndPublish = onSchedule(
  {
    schedule: '50 18 * * 6',
    timeZone: 'Europe/Istanbul',
  },
  async () => {
    await archiveAndPublishHandler();
  }
);

// 🔹 Katılım Puanları Kopyalama ve Sıfırlama Görevi — Her ayın 1’i saat 14:00
exports.copyMonthlyRatings = onSchedule(
  {
    schedule: '0 14 1 * *', // Her ayın 1’i saat 14:00
    timeZone: 'Europe/Istanbul',
  },
  async () => {
    const now = new Date();
    const year = now.getFullYear().toString();       // örn: "2025"
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // örn: "06"

    const guestsSnapshot = await db.collection('guests').get();

    for (const doc of guestsSnapshot.docs) {
      const guestId = doc.id;
      const guestData = doc.data();

      // 🔹 Mevcut değerleri al
      const name = guestData.name || "İsimsiz";
      const rating = guestData.rating || "0";
      const ratingCounter = guestData.ratingCounter || "0";
      const turnout = guestData.turnout || "0";

      // 🔹 pointsReports altına yaz
      await db
        .collection('pointsReports')
        .doc(year)
        .collection(month)
        .doc(guestId)
        .set({
          name,
          rating,
          ratingCounter,
          turnout
        });

      // 🔹 guests altındaki puanları sıfırla
      await db
        .collection('guests')
        .doc(guestId)
        .update({
          rating: "0",
          ratingCounter: "0",
          turnout: "0"
        });
    }

    console.log(`✅ ${year}/${month} ➜ Puanlar kopyalandı ve sıfırlandı.`);
  }
);
