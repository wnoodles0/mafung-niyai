import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(fs.readFileSync("./firebase-admin.json", "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "my-auth-app-107d1.firebasestorage.app",
});

const bucket = admin.storage().bucket();
const OLD_PREFIX = "novels/";
const NEW_PREFIX = "เทพเซียน มหาเต๋าอนันต์/";

async function main() {
  console.log(`\n📂  กำลังย้ายไฟล์จาก "${OLD_PREFIX}" → "${NEW_PREFIX}"\n`);

  const [files] = await bucket.getFiles({ prefix: OLD_PREFIX });
  if (files.length === 0) {
    console.log("⚠️  ไม่พบไฟล์ใน", OLD_PREFIX);
    return;
  }

  console.log(`พบ ${files.length} ไฟล์ — กำลังย้าย...\n`);

  const results = [];
  for (const file of files) {
    const oldPath = file.name;
    const newPath = NEW_PREFIX + oldPath.slice(OLD_PREFIX.length);
    process.stdout.write(`  ${oldPath.split("/").pop()} ... `);
    try {
      // Copy to new path
      await file.copy(bucket.file(newPath));
      // Make new file public
      await bucket.file(newPath).makePublic();
      // Delete old file
      await file.delete();
      const newUrl = `https://storage.googleapis.com/my-auth-app-107d1.firebasestorage.app/${encodeURIComponent(newPath).replace(/%2F/g,"/")}`;
      results.push({ file: oldPath.split("/").pop(), newPath, newUrl });
      process.stdout.write("✅\n");
    } catch (err) {
      process.stdout.write(`❌ ${err.message}\n`);
    }
  }

  console.log(`\n✅  ย้ายสำเร็จ ${results.length} ไฟล์\n`);
  console.log("🔗  Firebase URLs ใหม่:\n");
  results.forEach(r => {
    console.log(`  📁 ${r.file}`);
    console.log(`     ${r.newUrl}\n`);
  });

  // Save result
  fs.writeFileSync("./rename-result.json", JSON.stringify(results, null, 2), "utf8");
  console.log("📄  บันทึกผลลัพธ์ที่: rename-result.json");
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
