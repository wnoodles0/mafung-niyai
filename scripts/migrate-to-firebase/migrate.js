import fs from "fs";
import path from "path";
import http from "http";
import { google } from "googleapis";
import admin from "firebase-admin";

// ═══════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════
const DRIVE_FOLDER_ID = "1NEHLSCF-sfWlyQAAc0uvB5A1s1nhcrkf";
const FIREBASE_SERVICE_ACCOUNT_PATH = "./firebase-admin.json";
const FIREBASE_STORAGE_BUCKET = "my-auth-app-107d1.firebasestorage.app";
const STORAGE_PREFIX = "novels";
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const TOKEN_PATH = "./token.json";
const CREDENTIALS_PATH = "./credentials.json";
const OAUTH_PORT = 9999; // Local callback server port

// ═══════════════════════════════════════════════════════════════════
//  GOOGLE OAUTH — Auto-capture redirect (no manual copy-paste)
// ═══════════════════════════════════════════════════════════════════
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌  ไม่พบ credentials.json");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
}

async function getAuthClient() {
  const creds = loadCredentials();
  const { client_secret, client_id } = creds.installed || creds.web;
  const redirectUri = `http://localhost:${OAUTH_PORT}`;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    // Auto-refresh if expired
    oAuth2Client.on("tokens", (newToken) => {
      const merged = { ...token, ...newToken };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
    });
    return oAuth2Client;
  }

  return await getNewTokenAuto(oAuth2Client);
}

function getNewTokenAuto(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    // Start local callback server
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.end(`<h2>❌ Error: ${error}</h2><p>ปิดหน้าต่างนี้ได้</p>`);
          server.close();
          return reject(new Error(`OAuth error: ${error}`));
        }

        if (!code) {
          res.end("<h2>กำลังรอ...</h2>");
          return;
        }

        res.end(`
          <html><body style="font-family:sans-serif;text-align:center;padding:40px">
          <h2 style="color:green">✅ อนุญาตสำเร็จแล้ว!</h2>
          <p>ปิดหน้าต่างนี้ได้ แล้วดูผลลัพธ์ใน Terminal</p>
          </body></html>
        `);

        server.close();

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log("✅  บันทึก Token สำเร็จ!\n");
        resolve(oAuth2Client);
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(OAUTH_PORT, () => {
      console.log("\n🔐  กรุณาเปิด URL นี้ในเบราว์เซอร์เพื่ออนุญาตการเข้าถึง Google Drive:\n");
      console.log("   ", authUrl, "\n");
      console.log("⏳  รอการอนุญาตจาก Google... (จะดำเนินการต่ออัตโนมัติหลังอนุญาต)\n");

      // Try to open browser automatically on Windows
      import("child_process").then(({ exec }) => {
        exec(`start "" "${authUrl}"`);
      }).catch(() => {});
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌  Port ${OAUTH_PORT} ถูกใช้งานอยู่ กรุณาปิดโปรแกรมอื่นที่ใช้ Port นี้`);
      }
      reject(err);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
//  FIREBASE ADMIN
// ═══════════════════════════════════════════════════════════════════
function initFirebase() {
  if (!fs.existsSync(FIREBASE_SERVICE_ACCOUNT_PATH)) {
    console.error("❌  ไม่พบ firebase-admin.json");
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: FIREBASE_STORAGE_BUCKET,
  });
  return admin.storage().bucket();
}

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════
function getFileCategory(mimeType, name) {
  if (mimeType?.startsWith("image/")) return "images";
  if (mimeType?.startsWith("audio/") || /\.(mp3|m4a|ogg|wav|aac|flac)$/i.test(name || "")) return "audio";
  return "other";
}

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
}

// ═══════════════════════════════════════════════════════════════════
//  MIGRATION CORE
// ═══════════════════════════════════════════════════════════════════
async function listDriveFiles(drive) {
  const allFiles = [];
  let pageToken;
  console.log(`\n📂  กำลังดึงรายการไฟล์จาก Folder: ${DRIVE_FOLDER_ID}\n`);
  do {
    const res = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, size)",
      pageSize: 100,
      pageToken,
    });
    allFiles.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return allFiles;
}

async function downloadAndUpload(drive, bucket, file) {
  const category = getFileCategory(file.mimeType, file.name);
  const safeName = sanitizeFileName(file.name);
  const destPath = `${STORAGE_PREFIX}/${category}/${safeName}`;

  const driveRes = await drive.files.get(
    { fileId: file.id, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    const bucketFile = bucket.file(destPath);
    const writeStream = bucketFile.createWriteStream({
      metadata: {
        contentType: file.mimeType || "application/octet-stream",
        cacheControl: "public, max-age=31536000",
      },
      public: true,
    });
    driveRes.data.pipe(writeStream)
      .on("finish", () => {
        resolve({
          driveFileName: file.name,
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`,
          firebaseUrl: `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/${destPath}`,
          category,
          storagePath: destPath,
        });
      })
      .on("error", reject);
  });
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║   Google Drive → Firebase Storage Migrator ║");
  console.log("╚════════════════════════════════════════════╝");

  const authClient = await getAuthClient();
  const drive = google.drive({ version: "v3", auth: authClient });
  const bucket = initFirebase();

  const files = await listDriveFiles(drive);
  if (files.length === 0) {
    console.log("⚠️   ไม่พบไฟล์ใน Folder นี้");
    return;
  }

  const toMigrate = files.filter((f) => getFileCategory(f.mimeType, f.name) !== "other");
  const skipped = files.length - toMigrate.length;

  console.log(`📊  พบไฟล์ทั้งหมด ${files.length} ไฟล์`);
  console.log(`    🖼️  รูปภาพ : ${files.filter(f => getFileCategory(f.mimeType, f.name) === "images").length}`);
  console.log(`    🎵  เสียง  : ${files.filter(f => getFileCategory(f.mimeType, f.name) === "audio").length}`);
  console.log(`    📄  ข้าม   : ${skipped} ไฟล์\n`);

  const results = [];
  const errors = [];

  for (let i = 0; i < toMigrate.length; i++) {
    const file = toMigrate[i];
    process.stdout.write(`[${i + 1}/${toMigrate.length}]  ${file.name} ... `);
    try {
      const r = await downloadAndUpload(drive, bucket, file);
      results.push(r);
      process.stdout.write("✅\n");
    } catch (err) {
      errors.push({ file: file.name, error: err.message });
      process.stdout.write(`❌ ${err.message}\n`);
    }
  }

  // Save results
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = `./migration-result-${ts}.json`;
  const csvPath  = `./migration-result-${ts}.csv`;

  fs.writeFileSync(jsonPath, JSON.stringify({ migratedAt: new Date().toISOString(), results, errors }, null, 2), "utf8");
  const csvRows = ["ชื่อไฟล์,ประเภท,Google Drive URL,Firebase Storage URL",
    ...results.map(r => `"${r.driveFileName}","${r.category}","${r.driveUrl}","${r.firebaseUrl}"`)];
  fs.writeFileSync(csvPath, "\uFEFF" + csvRows.join("\n"), "utf8");

  console.log("\n╔════════════════════╗");
  console.log("║       ผลลัพธ์       ║");
  console.log("╚════════════════════╝");
  console.log(`✅  สำเร็จ : ${results.length} ไฟล์`);
  console.log(`❌  ล้มเหลว: ${errors.length} ไฟล์`);
  console.log(`\n📄  บันทึกที่: ${path.resolve(jsonPath)}`);
  console.log(`📊  CSV ที่  : ${path.resolve(csvPath)}\n`);
  console.log("🔗  Firebase URLs ใหม่:\n");
  results.forEach(r => {
    console.log(`  📁 ${r.driveFileName}`);
    console.log(`     ${r.firebaseUrl}\n`);
  });
  if (errors.length) {
    console.log("⚠️  ไฟล์ที่ล้มเหลว:");
    errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
}

main().catch(err => {
  console.error("\n❌  เกิดข้อผิดพลาด:", err.message);
  process.exit(1);
});
