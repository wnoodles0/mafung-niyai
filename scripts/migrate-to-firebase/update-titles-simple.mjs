import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const NOVEL_ID = "thaep-sian-maha-tao-anan";

console.log("\n📚  กำลังอัปเดตชื่อตอนเป็น 'เล่มที่ X' ใน Firestore...\n");

const chaptersSnap = await db.collection("chapters")
  .where("novelId", "==", NOVEL_ID).get();

for (const doc of chaptersSnap.docs) {
  const data = doc.data();
  const volNum = data.volumeNumber || data.chapterNumber;
  const newTitle = `เล่มที่ ${volNum}`;
  
  await doc.ref.update({
    title: newTitle,
    updatedAt: new Date().toISOString(),
  });
  console.log(`  ✅  ch${data.chapterNumber}: ${newTitle}`);
}

console.log("\n🎉  เสร็จสิ้น! อัปเดต Firestore เป็น 'เล่มที่ X' เรียบร้อย");
process.exit(0);
