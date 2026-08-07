import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const BASE = "https://storage.googleapis.com/my-auth-app-107d1.firebasestorage.app/เทพเซียน มหาเต๋าอนันต์";
const NOVEL_ID = "thaep-sian-maha-tao-anan";

await db.collection("novels").doc(NOVEL_ID).update({
  coverUrl: `${BASE}/images/ChatGPT Image 5 ส.ค. 2569 20_16_39.png`,
  bannerUrl: `${BASE}/images/ChatGPT Image 6 ส.ค. 2569 13_22_23.png`,
  updatedAt: new Date().toISOString(),
});

console.log("✅  เปลี่ยนรูปปกเป็นภาพ 5 ส.ค. สำเร็จแล้วครับ!");
process.exit(0);
