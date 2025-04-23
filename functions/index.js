const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 🔁 Ortak arşivleme işlemi
async function archivePublishedHandler() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const eventCol = db.collection(`events/${year}/${month}`);
  const eventDocs = await eventCol.listDocuments();

  for (const docRef of eventDocs) {
    const docSnap = await docRef.get();
    const data = docSnap.data();

    if (data.eventPublish === "1") {
      const destRef = db.doc(`pastEvents/${year}/${month}/${docRef.id}`);
      await destRef.set(data); // overwrite fields

      const collections = await docRef.listCollections();
      for (const subCol of collections) {
        const subDocs = await subCol.listDocuments();
        for (const subDocRef of subDocs) {
          const subDocSnap = await subDocRef.get();
          const subData = subDocSnap.data();

          await destRef
            .collection(subCol.id)
            .doc(subDocSnap.id)
            .set(subData); // overwrite subcollection docs
        }
      }

      await docRef.delete(); // orijinal belgeyi sil
    }
  }

  console.log("Yayındaki belgeler güncellenerek arşivlendi ve silindi.");
}

// 🕒 CUMARTESİ 15:10 — Zamanlanmış görev
exports.archivePublishedEvents = onSchedule(
  {
    schedule: '30 15 * * 6', // Cumartesi 15:10
    timeZone: 'Europe/Istanbul',
  },
  archivePublishedHandler
);

// 🟢 MANUEL tetikleme fonksiyonu (test için)
exports.runNowArchive = onRequest(async (req, res) => {
  await archivePublishedHandler();
  res.send("🟢 Manuel olarak arşivleme başarıyla tetiklendi.");
});

// 🕓 CUMARTESİ 16:00 — Yayın dışı olanları yayına al
exports.publishUnpublishedEvents = onSchedule(
  {
    schedule: '0 16 * * 6', // Cumartesi 16:00
    timeZone: 'Europe/Istanbul',
  },
  async () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const eventCol = db.collection(`events/${year}/${month}`);
    const eventDocs = await eventCol.listDocuments();

    for (const docRef of eventDocs) {
      const docSnap = await docRef.get();
      const data = docSnap.data();

      if (data.eventPublish === "0") {
        await docRef.update({ eventPublish: "1" });
      }
    }

    console.log("Yayında olmayan belgeler yayına alındı.");
  }
);
