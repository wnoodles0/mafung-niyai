import fs from "fs";
import { google } from "googleapis";

const creds = JSON.parse(fs.readFileSync("./credentials.json","utf8"));
const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("./token.json","utf8")));

const drive = google.drive({ version: "v3", auth: oAuth2Client });

const res = await drive.files.list({
  q: `'1NEHLSCF-sfWlyQAAc0uvB5A1s1nhcrkf' in parents and trashed = false`,
  fields: "files(id, name, mimeType, size)",
  pageSize: 200,
});

const ALREADY_MIGRATED = [
  "1+5.mp3","6+10.mp3","11+15.mp3","16+20.mp3","21+25.mp3",
  "26+30.mp3","31+35.mp3","36+40.mp3",
  "ChatGPT Image 5 ส.ค. 2569 20_16_39.png",
  "ChatGPT Image 6 ส.ค. 2569 13_22_23.png"
];

const allFiles = res.data.files || [];
const newFiles = allFiles.filter(f => !ALREADY_MIGRATED.includes(f.name));
const existing = allFiles.filter(f => ALREADY_MIGRATED.includes(f.name));

console.log(`\n📂  ไฟล์ทั้งหมดใน Folder: ${allFiles.length} ไฟล์`);
console.log(`✅  มีแล้วใน R2: ${existing.length} ไฟล์`);
console.log(`🆕  ไฟล์ใหม่: ${newFiles.length} ไฟล์\n`);

newFiles.forEach((f, i) => {
  const size = f.size ? (parseInt(f.size)/1024/1024).toFixed(1)+"MB" : "N/A";
  console.log(`  ${i+1}. ${f.name} (${f.mimeType} | ${size})`);
});
