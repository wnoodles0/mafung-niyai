import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: "https://dc09a7fdf968cd7ee748dd3ff3752224.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4ceeac96b52037b34ff4dc5a3b0e0c29",
    secretAccessKey: "395e1ac0ad004417ddcf50f126e23471c257b8f95494d01ddda590289249b8c8",
  },
});

const res = await r2.send(new ListObjectsV2Command({ Bucket: "mafangniyai-cdn" }));
console.log("\n📦 ไฟล์ทั้งหมดใน R2 Bucket (mafangniyai-cdn):\n");
(res.Contents || []).forEach((item, idx) => {
  console.log(`${idx + 1}. ${item.Key} (${(item.Size / 1024 / 1024).toFixed(2)} MB)`);
});
