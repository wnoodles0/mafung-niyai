import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

console.log("\n📚 Novels ใน Firestore:");
const novels = await db.collection("novels").get();
novels.forEach(d => {
  const n = d.data();
  console.log(`  - [${d.id}] ${n.title} | cover: ${n.coverUrl?.slice(0,60)}...`);
});

console.log(`\n🎵 Chapters ใน Firestore:`);
const chapters = await db.collection("chapters").get();
chapters.forEach(d => {
  const c = d.data();
  console.log(`  - [${d.id}] novelId:${c.novelId} | ${c.title} | audio: ${c.audioUrl?.slice(0,60)}...`);
});

process.exit(0);
