import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import admin from "firebase-admin";
import fs from "fs";

// ═══════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════
const R2_ACCOUNT_ID    = "dc09a7fdf968cd7ee748dd3ff3752224";
const R2_ACCESS_KEY_ID = "4ceeac96b52037b34ff4dc5a3b0e0c29";
const R2_SECRET_KEY    = "395e1ac0ad004417ddcf50f126e23471c257b8f95494d01ddda590289249b8c8";
const R2_BUCKET        = "mafangniyai-cdn";
const R2_PUBLIC_URL    = "https://cdn.mafangniyai.com"; // Custom domain

const FIREBASE_BUCKET  = "my-auth-app-107d1.firebasestorage.app";
const FIREBASE_OLD_URL = `https://storage.googleapis.com/${FIREBASE_BUCKET}`;

// ═══════════════════════════════════════════════════
//  INIT R2 (S3-compatible)
// ═══════════════════════════════════════════════════
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_KEY },
});

// ═══════════════════════════════════════════════════
//  INIT FIREBASE
// ═══════════════════════════════════════════════════
const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({
  credential: admin.credential.cert(svc),
  storageBucket: FIREBASE_BUCKET,
});
const storageBucket = admin.storage().bucket();
const db = admin.firestore();

// ═══════════════════════════════════════════════════
//  MIGRATE FILES: Firebase Storage → R2
// ═══════════════════════════════════════════════════
async function migrateFiles() {
  const [files] = await storageBucket.getFiles();
  if (files.length === 0) { console.log("⚠️  ไม่พบไฟล์ใน Firebase Storage"); return []; }

  console.log(`\n📦  พบ ${files.length} ไฟล์ใน Firebase Storage — เริ่มย้าย...\n`);
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = file.name;
    const fileName = filePath.split("/").pop();
    process.stdout.write(`[${i+1}/${files.length}]  ${fileName} ... `);

    try {
      // Download from Firebase Storage
      const [content] = await file.download();
      const [meta] = await file.getMetadata();
      const contentType = meta.contentType || "application/octet-stream";

      // Upload to R2
      await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: filePath,
        Body: content,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000",
      }));

      const newUrl = `${R2_PUBLIC_URL}/${filePath}`;
      const oldUrl = `${FIREBASE_OLD_URL}/${encodeURIComponent(filePath).replace(/%2F/g,"/")}`;
      results.push({ filePath, oldUrl, newUrl, contentType });
      process.stdout.write("✅\n");
    } catch (err) {
      process.stdout.write(`❌ ${err.message}\n`);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════
//  UPDATE FIRESTORE URLs
// ═══════════════════════════════════════════════════
async function updateFirestore(results) {
  if (results.length === 0) return;
  console.log("\n🔄  กำลังอัปเดต URL ใน Firestore...\n");

  // Build replacement map: oldUrl → newUrl
  const urlMap = {};
  results.forEach(r => { urlMap[r.oldUrl] = r.newUrl; });

  function replaceUrl(val) {
    if (typeof val !== "string") return val;
    for (const [old, nw] of Object.entries(urlMap)) {
      if (val === old || decodeURIComponent(val) === decodeURIComponent(old)) return nw;
      // Also handle encoded Thai chars
      if (val.includes("storage.googleapis.com")) {
        // Extract path after bucket name and match
        try {
          const decoded = decodeURIComponent(val);
          for (const [o, n] of Object.entries(urlMap)) {
            if (decoded === decodeURIComponent(o)) return n;
          }
        } catch {}
      }
    }
    return val;
  }

  // Update novels
  const novelsSnap = await db.collection("novels").get();
  let updatedNovels = 0;
  for (const docSnap of novelsSnap.docs) {
    const data = docSnap.data();
    const updates = {};
    if (data.coverUrl)  { const n = replaceUrl(data.coverUrl);  if (n !== data.coverUrl)  { updates.coverUrl  = n; } }
    if (data.bannerUrl) { const n = replaceUrl(data.bannerUrl); if (n !== data.bannerUrl) { updates.bannerUrl = n; } }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await docSnap.ref.update(updates);
      console.log(`  ✅  Novel "${data.title}" → อัปเดต ${Object.keys(updates).length} field`);
      updatedNovels++;
    }
  }

  // Update chapters
  const chaptersSnap = await db.collection("chapters").get();
  let updatedChapters = 0;
  for (const docSnap of chaptersSnap.docs) {
    const data = docSnap.data();
    const updates = {};
    if (data.audioUrl) { const n = replaceUrl(data.audioUrl); if (n !== data.audioUrl) { updates.audioUrl = n; } }
    if (Object.keys(updates).length > 0) {
      await docSnap.ref.update(updates);
      updatedChapters++;
    }
  }

  console.log(`\n  📚  อัปเดต Novels : ${updatedNovels} รายการ`);
  console.log(`  🎵  อัปเดต Chapters: ${updatedChapters} รายการ`);
}

// ═══════════════════════════════════════════════════
//  DELETE from Firebase Storage (after migration)
// ═══════════════════════════════════════════════════
async function deleteFromFirebase(results) {
  console.log("\n🗑️   กำลังลบไฟล์ออกจาก Firebase Storage...\n");
  for (const r of results) {
    try {
      await storageBucket.file(r.filePath).delete();
      console.log(`  ✅  ลบ ${r.filePath.split("/").pop()}`);
    } catch (err) {
      console.log(`  ⚠️  ลบไม่ได้: ${r.filePath.split("/").pop()} — ${err.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Firebase Storage → Cloudflare R2 Migrator   ║");
  console.log("╚══════════════════════════════════════════════╝");

  // Step 1: Migrate files
  const results = await migrateFiles();

  if (results.length === 0) { process.exit(0); }

  // Step 2: Update Firestore
  await updateFirestore(results);

  // Step 3: Delete from Firebase Storage
  await deleteFromFirebase(results);

  // Step 4: Save result log
  const ts = new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
  const log = { migratedAt: new Date().toISOString(), r2Bucket: R2_BUCKET, r2PublicUrl: R2_PUBLIC_URL, files: results };
  fs.writeFileSync(`./r2-migration-${ts}.json`, JSON.stringify(log, null, 2), "utf8");

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║                  สำเร็จ! ✅                  ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`\n✅  ย้ายไฟล์  : ${results.length} ไฟล์`);
  console.log(`📁  R2 Bucket : ${R2_BUCKET}`);
  console.log(`🌐  Public URL: ${R2_PUBLIC_URL}`);
  console.log(`\n🔗  ตัวอย่าง URL ใหม่:`);
  results.slice(0,3).forEach(r => console.log(`    ${r.newUrl}`));
  console.log(`\n📄  Log บันทึกที่: r2-migration-${ts}.json`);
  process.exit(0);
}

main().catch(e => { console.error("\n❌", e.message); process.exit(1); });
