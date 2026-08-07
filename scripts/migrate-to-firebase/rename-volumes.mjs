import fs from "fs";
import admin from "firebase-admin";

const svc = JSON.parse(fs.readFileSync("./firebase-admin.json","utf8"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const NOVEL_ID = "thaep-sian-maha-tao-anan";

// Map chapterNumber → Volume display name + episode range
const VOLUME_MAP = {
  1:  { vol: 1,  range: "1-5"    },
  2:  { vol: 2,  range: "6-10"   },
  3:  { vol: 3,  range: "11-15"  },
  4:  { vol: 4,  range: "16-20"  },
  5:  { vol: 5,  range: "21-25"  },
  6:  { vol: 6,  range: "26-30"  },
  7:  { vol: 7,  range: "31-35"  },
  8:  { vol: 8,  range: "36-40"  },
  9:  { vol: 9,  range: "41-45"  },
  10: { vol: 10, range: "46-50"  },
  11: { vol: 11, range: "51-55"  },
  12: { vol: 12, range: "56-60"  },
  13: { vol: 13, range: "61-65"  },
  14: { vol: 14, range: "66-70"  },
  15: { vol: 15, range: "71-75"  },
  16: { vol: 16, range: "76-80"  },
  17: { vol: 17, range: "81-85"  },
  18: { vol: 18, range: "86-90"  },
  19: { vol: 19, range: "91-95"  },
};

console.log("\n📚  กำลังเปลี่ยนชื่อตอนเป็นระบบ Volume...\n");

const chaptersSnap = await db.collection("chapters")
  .where("novelId", "==", NOVEL_ID).get();

for (const doc of chaptersSnap.docs) {
  const data = doc.data();
  const vol = VOLUME_MAP[data.chapterNumber];
  if (!vol) continue;

  const newTitle = `เล่ม ${vol.vol} (ตอนที่ ${vol.range})`;
  await doc.ref.update({
    title: newTitle,
    volumeNumber: vol.vol,
    episodeRange: vol.range,
    isFree: true,          // ทุกเล่มฟรีก่อน
    updatedAt: new Date().toISOString(),
  });
  console.log(`  ✅  ch${data.chapterNumber}: ${newTitle}`);
}

console.log("\n🎉  เสร็จสิ้น! อัปเดตชื่อทุกเล่มเรียบร้อย");
process.exit(0);
