import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const NOVEL_ID = "thaep-sian-maha-tao-anan";
const R2_URL   = "https://pub-a8e1f5b82bd84939ad4532a9e65e6321.r2.dev";
const NOW      = new Date().toISOString();

// New chapters to add (51 to 95)
const newChapters = [
  { num: 11, title: "ตอนที่ 51-55", file: "51-55.mp3" },
  { num: 12, title: "ตอนที่ 56-60", file: "56-60.mp3" },
  { num: 13, title: "ตอนที่ 61-65", file: "61-65.mp3" },
  { num: 14, title: "ตอนที่ 66-70", file: "66-70.mp3" },
  { num: 15, title: "ตอนที่ 71-75", file: "71-75.mp3" },
  { num: 16, title: "ตอนที่ 76-80", file: "76-80.mp3" },
  { num: 17, title: "ตอนที่ 81-85", file: "81-85.mp3" },
  { num: 18, title: "ตอนที่ 86-90", file: "86-90.mp3" },
  { num: 19, title: "ตอนที่ 91-95", file: "91-95.mp3" },
];

console.log("\n🚀  กำลังเพิ่มตอนใหม่ใน Firestore...\n");

for (const c of newChapters) {
  const chapterId = `${NOVEL_ID}-ch${c.num}`;
  const audioUrl  = `${R2_URL}/เทพเซียน มหาเต๋าอนันต์/audio/${c.file}`;
  
  await db.collection("chapters").doc(chapterId).set({
    id: chapterId,
    novelId: NOVEL_ID,
    chapterNumber: c.num,
    title: c.title,
    audioUrl: audioUrl,
    duration: 0,
    releasedAt: NOW,
    views: 0,
  });
  console.log(`  ✅  [ch${c.num}] ${c.title} → ${c.file}`);
}

// Update totalChapters to 19
await db.collection("novels").doc(NOVEL_ID).update({
  totalChapters: 19,
  updatedAt: NOW,
});

console.log(`\n🎉  สำเร็จ! เพิ่ม 9 ตอนใหม่ เรียบร้อย (รวมทั้งหมด 19 ตอน)`);
process.exit(0);
