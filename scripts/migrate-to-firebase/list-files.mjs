import fs from "fs";
import { google } from "googleapis";

const creds = JSON.parse(fs.readFileSync("./credentials.json","utf8"));
const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(JSON.parse(fs.readFileSync("./token.json","utf8")));

const drive = google.drive({ version: "v3", auth: oAuth2Client });

const res = await drive.files.list({
  q: `'1ROW8iX1rWOmLRVPNlJ8cCLmCj9CScpCO' in parents and trashed = false`,
  fields: "files(id, name, mimeType, size)",
  pageSize: 100,
});

console.log("\n📂 รายการไฟล์ทั้งหมดใน Folder:\n");
res.data.files.forEach((f, i) => {
  const size = f.size ? (parseInt(f.size)/1024/1024).toFixed(2)+"MB" : "N/A";
  console.log(`${i+1}. ${f.name}`);
  console.log(`   MIME: ${f.mimeType}`);
  console.log(`   Size: ${size}`);
  console.log(`   ID  : ${f.id}\n`);
});
