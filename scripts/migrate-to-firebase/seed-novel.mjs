import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const BASE = "https://storage.googleapis.com/my-auth-app-107d1.firebasestorage.app/เทพเซียน มหาเต๋าอนันต์";
const NOVEL_ID = "thaep-sian-maha-tao-anan";
const NOW = new Date().toISOString();

const novel = {
  id: NOVEL_ID,
  title: "เทพเซียน มหาเต๋าอนันต์",
  slug: NOVEL_ID,
  coverUrl: `${BASE}/images/ChatGPT Image 6 ส.ค. 2569 13_22_23.png`,
  bannerUrl: `${BASE}/images/ChatGPT Image 5 ส.ค. 2569 20_16_39.png`,
  author: "ไม่ทราบ",
  translator: "ไม่ทราบ",
  synopsis: "นิยายแนวเซียน เทพ มหาเต๋า แห่งอนันต์กาล",
  category: "เซียน / แฟนตาซี",
  tags: ["เซียน","เทพ","เต๋า","แฟนตาซี"],
  rating: 0,
  ratingCount: 0,
  viewCount: 0,
  favoriteCount: 0,
  isFeatured: true,
  isCompleted: false,
  totalChapters: 8,
  createdAt: NOW,
  updatedAt: NOW,
};

const chapters = [
  { num: 1, title: "ตอนที่ 1-5",   file: "1+5.mp3"   },
  { num: 2, title: "ตอนที่ 6-10",  file: "6+10.mp3"  },
  { num: 3, title: "ตอนที่ 11-15", file: "11+15.mp3" },
  { num: 4, title: "ตอนที่ 16-20", file: "16+20.mp3" },
  { num: 5, title: "ตอนที่ 21-25", file: "21+25.mp3" },
  { num: 6, title: "ตอนที่ 26-30", file: "26+30.mp3" },
  { num: 7, title: "ตอนที่ 31-35", file: "31+35.mp3" },
  { num: 8, title: "ตอนที่ 36-40", file: "36+40.mp3" },
].map(c => ({
  id: `${NOVEL_ID}-ch${c.num}`,
  novelId: NOVEL_ID,
  chapterNumber: c.num,
  title: c.title,
  audioUrl: `${BASE}/audio/${c.file}`,
  duration: 0,
  releasedAt: NOW,
  views: 0,
}));

async function main() {
  console.log("\n📚  กำลังเพิ่มนิยาย เทพเซียน มหาเต๋าอนันต์ ลง Firestore...\n");

  // Save novel
  await db.collection("novels").doc(NOVEL_ID).set(novel);
  console.log("✅  บันทึกข้อมูลนิยายสำเร็จ");

  // Save each chapter
  for (const ch of chapters) {
    await db.collection("chapters").doc(ch.id).set(ch);
    console.log(`✅  บันทึก ${ch.title}`);
  }

  console.log("\n🎉  เสร็จสมบูรณ์! นิยายพร้อมแสดงบนเว็บแล้วครับ");
  console.log(`\n🔗  ลิงก์นิยาย: https://mafangniyai.vercel.app/novels/${NOVEL_ID}`);
  process.exit(0);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
