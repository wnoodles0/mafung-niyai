import fs from "fs";
import { google } from "googleapis";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import admin from "firebase-admin";

// ── Config ──────────────────────────────────────────────
const FOLDER_ID    = "1NEHLSCF-sfWlyQAAc0uvB5A1s1nhcrkf";
const NOVEL_ID     = "thaep-sian-maha-tao-anan";
const NOVEL_FOLDER = "เทพเซียน มหาเต๋าอนันต์";
const R2_BUCKET    = "mafangniyai-cdn";
const R2_URL       = "https://pub-a8e1f5b82bd84939ad4532a9e65e6321.r2.dev";
const NEW_FILES    = ["41+45.mp3", "46+50.mp3"];

// Chapter mapping: filename → { number, title }
const CHAPTER_MAP = {
  "41+45.mp3": { number: 9,  title: "ตอนที่ 41-45" },
  "46+50.mp3": { number: 10, title: "ตอนที่ 46-50" },
};

// ── Init Google Drive ────────────────────────────────────
const creds = JSON.parse(fs.readFileSync("./credentials.json","utf8"));
const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("./token.json","utf8")));
const drive = google.drive({ version: "v3", auth: oAuth2Client });

// ── Init R2 ──────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: "https://dc09a7fdf968cd7ee748dd3ff3752224.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4ceeac96b52037b34ff4dc5a3b0e0c29",
    secretAccessKey: "395e1ac0ad004417ddcf50f126e23471c257b8f95494d01ddda590289249b8c8",
  },
});

// ── Init Firebase ────────────────────────────────────────
const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

// ── Main ─────────────────────────────────────────────────
console.log("\n🚀  เพิ่มตอนใหม่: เทพเซียน มหาเต๋าอนันต์\n");

// 1. List Drive folder
const res = await drive.files.list({
  q: `'${FOLDER_ID}' in parents and trashed = false`,
  fields: "files(id, name, mimeType)",
  pageSize: 200,
});
const allFiles = res.data.files || [];
const filesToMigrate = allFiles.filter(f => NEW_FILES.includes(f.name));

if (filesToMigrate.length === 0) {
  console.log("⚠️  ไม่พบไฟล์ใหม่");
  process.exit(0);
}

// 2. Download from Drive & Upload to R2
const results = [];
for (let i = 0; i < filesToMigrate.length; i++) {
  const file = filesToMigrate[i];
  const storagePath = `${NOVEL_FOLDER}/audio/${file.name}`;
  process.stdout.write(`[${i+1}/${filesToMigrate.length}]  ${file.name} (Download→Upload) ... `);

  const driveRes = await drive.files.get(
    { fileId: file.id, alt: "media" },
    { responseType: "arraybuffer" }
  );

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: storagePath,
    Body: Buffer.from(driveRes.data),
    ContentType: "audio/mpeg",
    CacheControl: "public, max-age=31536000",
  }));

  const audioUrl = `${R2_URL}/${storagePath}`;
  results.push({ file: file.name, audioUrl, storagePath });
  process.stdout.write("✅\n");
}

// 3. Add chapters to Firestore
console.log("\n📝  เพิ่มตอนใน Firestore...\n");
const NOW = new Date().toISOString();

for (const r of results) {
  const ch = CHAPTER_MAP[r.file];
  const chapterId = `${NOVEL_ID}-ch${ch.number}`;
  await db.collection("chapters").doc(chapterId).set({
    id: chapterId,
    novelId: NOVEL_ID,
    chapterNumber: ch.number,
    title: ch.title,
    audioUrl: r.audioUrl,
    duration: 0,
    releasedAt: NOW,
    views: 0,
  });
  console.log(`  ✅  ${ch.title} → ${r.audioUrl}`);
}

// 4. Update totalChapters on novel
const currentTotal = 8 + results.length;
await db.collection("novels").doc(NOVEL_ID).update({
  totalChapters: currentTotal,
  updatedAt: NOW,
});

console.log(`\n🎉  เสร็จสิ้น!`);
console.log(`    เพิ่ม ${results.length} ตอนใหม่ (รวมทั้งหมด ${currentTotal} ตอน)`);
console.log(`    🔗  https://mafangniyai.vercel.app/novels/${NOVEL_ID}`);
process.exit(0);
