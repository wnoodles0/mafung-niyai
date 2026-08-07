import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const OLD_IDS = ["chapter-1785935995778", "chapter-1785995473525", "chapter-1785995729158", "novel-1785935843118"];

for (const id of OLD_IDS) {
  await db.collection("chapters").doc(id).delete().catch(() => {});
  await db.collection("novels").doc(id).delete().catch(() => {});
}

console.log("✅ Cleanup old mock/duplicate docs completed");
process.exit(0);
