import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import admin from "firebase-admin";

// ── Config ──────────────────────────────────────────────
const R2_BUCKET = "mafangniyai-cdn";
const R2_URL    = "https://pub-a8e1f5b82bd84939ad4532a9e65e6321.r2.dev";
const NOVEL_ID  = "thaep-sian-maha-tao-anan";

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

// ── Standard Filename Generator Helper ──────────────────
// Returns format: "ep-001-005.mp3" or "cover-main.png" / "banner-main.png"
function getCleanFileName(oldKey) {
  const filename = oldKey.split("/").pop();

  if (oldKey.includes("/images/")) {
    if (filename.includes("20_16_39") || filename.includes("5 ส.ค.")) {
      return "cover-main.png";
    }
    if (filename.includes("13_22_23") || filename.includes("6 ส.ค.")) {
      return "banner-main.png";
    }
    return filename;
  }

  if (oldKey.includes("/audio/")) {
    // Standardize numbers e.g. "1+5.mp3" -> "ep-001-005.mp3", "51-55.mp3" -> "ep-051-055.mp3"
    const match = filename.match(/(\d+)[+_-](\d+)/);
    if (match) {
      const start = String(match[1]).padStart(3, "0");
      const end   = String(match[2]).padStart(3, "0");
      return `ep-${start}-${end}.mp3`;
    }
  }

  return filename;
}

async function main() {
  console.log("\n🧹  กำลังจัดระเบียบและเปลี่ยนชื่อไฟล์ใน Cloudflare R2 ให้เป็นมาตรฐาน...\n");

  const listRes = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET }));
  const objects = listRes.Contents || [];

  const urlUpdates = {};

  for (const item of objects) {
    const oldKey = item.Key;
    const pathParts = oldKey.split("/");
    const oldFileName = pathParts.pop();
    const folderPath  = pathParts.join("/"); // e.g. "เทพเซียน มหาเต๋าอนันต์/audio"

    const cleanFileName = getCleanFileName(oldKey);

    if (oldFileName === cleanFileName) {
      console.log(`  ⏩  ${oldFileName} (ชื่อเดิมดีอยู่แล้ว)`);
      continue;
    }

    const newKey = `${folderPath}/${cleanFileName}`;
    process.stdout.write(`  🔄  ${oldFileName}\n      ➔ ${cleanFileName} ... `);

    try {
      // 1. Copy to new clean object key
      await r2.send(new CopyObjectCommand({
        Bucket: R2_BUCKET,
        CopySource: `${R2_BUCKET}/${encodeURIComponent(oldKey).replace(/%2F/g, "/")}`,
        Key: newKey,
      }));

      // 2. Delete old object key
      await r2.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: oldKey,
      }));

      const oldUrl = `${R2_URL}/${oldKey}`;
      const newUrl = `${R2_URL}/${newKey}`;
      urlUpdates[oldUrl] = newUrl;

      process.stdout.write("✅\n");
    } catch (err) {
      process.stdout.write(`❌ ${err.message}\n`);
    }
  }

  // Update Firestore URLs
  console.log("\n📝  กำลังอัปเดตลิงก์ใหม่ลง Firestore Database...\n");

  // Update novel cover/banner
  const novelRef = db.collection("novels").doc(NOVEL_ID);
  const novelSnap = await novelRef.get();
  if (novelSnap.exists) {
    const data = novelSnap.data();
    const updates = {};
    if (urlUpdates[data.coverUrl]) updates.coverUrl = urlUpdates[data.coverUrl];
    if (urlUpdates[data.bannerUrl]) updates.bannerUrl = urlUpdates[data.bannerUrl];
    if (Object.keys(updates).length > 0) {
      await novelRef.update(updates);
      console.log("  ✅  อัปเดต URL รูปภาพนิยายแล้ว");
    }
  }

  // Update chapters audio URLs
  const chaptersSnap = await db.collection("chapters").where("novelId", "==", NOVEL_ID).get();
  let chCount = 0;
  for (const doc of chaptersSnap.docs) {
    const data = doc.data();
    if (urlUpdates[data.audioUrl]) {
      await doc.ref.update({ audioUrl: urlUpdates[data.audioUrl] });
      chCount++;
    }
  }
  console.log(`  ✅  อัปเดต URL เสียงสำหรับ ${chCount} ตอนเรียบร้อย`);

  console.log("\n🎉  เสร็จสิ้นการตั้งชื่อไฟล์ใหม่ใน Cloudflare R2 และอัปเดตหน้าเว็บเรียบร้อย!");
  process.exit(0);
}

main().catch(err => { console.error("❌", err); process.exit(1); });
