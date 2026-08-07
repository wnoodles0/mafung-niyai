import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const OLD = "https://cdn.mafangniyai.com";
const NEW = "https://pub-a8e1f5b82bd84939ad4532a9e65e6321.r2.dev";

console.log(`\n🔄  อัปเดต Firestore URLs\n    ${OLD}\n    → ${NEW}\n`);

// Update novels
const novelsSnap = await db.collection("novels").get();
let novelCount = 0;
for (const doc of novelsSnap.docs) {
  const data = doc.data();
  const updates = {};
  if (data.coverUrl?.startsWith(OLD))  updates.coverUrl  = data.coverUrl.replace(OLD, NEW);
  if (data.bannerUrl?.startsWith(OLD)) updates.bannerUrl = data.bannerUrl.replace(OLD, NEW);
  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date().toISOString();
    await doc.ref.update(updates);
    console.log(`  ✅  Novel "${data.title}" — อัปเดต ${Object.keys(updates).length} field`);
    novelCount++;
  }
}

// Update chapters
const chaptersSnap = await db.collection("chapters").get();
let chapterCount = 0;
for (const doc of chaptersSnap.docs) {
  const data = doc.data();
  const updates = {};
  if (data.audioUrl?.startsWith(OLD)) updates.audioUrl = data.audioUrl.replace(OLD, NEW);
  if (Object.keys(updates).length > 0) {
    await doc.ref.update(updates);
    chapterCount++;
    console.log(`  ✅  Chapter "${data.title}"`);
  }
}

console.log(`\n✅  เสร็จสิ้น! อัปเดต ${novelCount} นิยาย + ${chapterCount} ตอน`);
process.exit(0);
