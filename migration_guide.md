# 📦 คู่มือใช้งาน Migration Script
## Google Drive → Firebase Storage

> Script อยู่ที่: `e:\เว็บนิยายเสียง\scripts\migrate-to-firebase\`

---

## ขั้นตอนที่ 1 — ดาวน์โหลด Firebase Admin SDK Key

1. เปิด **[Firebase Console](https://console.firebase.google.com)** → เลือก Project `my-auth-app-107d1`
2. คลิก **⚙️ Project Settings** (รูปเฟือง ด้านซ้ายบน)
3. เลือกแท็บ **"Service accounts"**
4. คลิกปุ่ม **"Generate new private key"** (สีน้ำเงิน)
5. ยืนยัน → ไฟล์ JSON จะดาวน์โหลดอัตโนมัติ
6. **เปลี่ยนชื่อไฟล์เป็น `firebase-admin.json`**
7. วางไฟล์ในโฟลเดอร์ `e:\เว็บนิยายเสียง\scripts\migrate-to-firebase\`

---

## ขั้นตอนที่ 2 — วางไฟล์ Google OAuth Credentials

1. นำไฟล์ `credentials.json` (OAuth 2.0 Client ID) ที่มีอยู่แล้ว
2. วางในโฟลเดอร์ `e:\เว็บนิยายเสียง\scripts\migrate-to-firebase\`

> [!IMPORTANT]
> ตรวจสอบว่าไฟล์ `credentials.json` มีรูปแบบ `installed` หรือ `web` ด้านใน
> Script รองรับทั้งสองรูปแบบ

---

## ขั้นตอนที่ 3 — ตั้งค่า Folder ID

1. เปิด Google Drive → ไปที่ Folder ที่เก็บไฟล์นิยาย
2. ดู URL → คัดลอก ID ส่วนท้าย เช่น:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           นี่คือ Folder ID
   ```
3. เปิดไฟล์ `migrate.js` แก้ไขบรรทัดนี้:
   ```js
   const DRIVE_FOLDER_ID = "วางFolderIDที่นี่";
   //                       ↑ แทนที่ด้วย ID ที่คัดลอกมา
   ```

---

## ขั้นตอนที่ 4 — ติดตั้ง Dependencies

เปิด PowerShell หรือ Terminal แล้วรันคำสั่ง:

```bash
cd "e:\เว็บนิยายเสียง\scripts\migrate-to-firebase"
npm install
```

---

## ขั้นตอนที่ 5 — รัน Script

```bash
npm run migrate
```

**ครั้งแรก** — Script จะขอสิทธิ์ Google Drive:
1. Script จะพิมพ์ URL ยาว ๆ ออกมา
2. เปิด URL นั้นในเบราว์เซอร์
3. เลือกบัญชี Google ที่เป็นเจ้าของ Drive → คลิก "อนุญาต"
4. คัดลอก Authorization Code จากหน้าเว็บ
5. วาง Code กลับใน Terminal แล้วกด Enter

**ครั้งถัดไป** — Script จะใช้ Token ที่บันทึกไว้ ไม่ต้องทำซ้ำ

---

## ผลลัพธ์ที่จะได้

Script จะสร้างไฟล์ผลลัพธ์ 2 ไฟล์ในโฟลเดอร์เดียวกัน:

| ไฟล์ | รายละเอียด |
|------|-----------|
| `migration-result-YYYY-MM-DD.json` | ข้อมูลครบทุกไฟล์ รวมถึงไฟล์ที่ Error |
| `migration-result-YYYY-MM-DD.csv` | เปิดด้วย Excel ได้เลย มี URL เก่า → URL ใหม่ |

**ตัวอย่าง Output ที่จะแสดงบน Terminal:**

```
✅  อัปโหลดสำเร็จ : 15 ไฟล์
❌  ล้มเหลว       : 0 ไฟล์

🔗  Firebase Storage URLs ใหม่:

  📁 cover-novel-001.jpg
     Drive   : https://drive.google.com/file/d/1AbcD.../view
     Firebase: https://storage.googleapis.com/my-auth-app-107d1.firebasestorage.app/novels/images/cover-novel-001.jpg

  📁 chapter-001.mp3
     Drive   : https://drive.google.com/file/d/2EfgH.../view
     Firebase: https://storage.googleapis.com/my-auth-app-107d1.firebasestorage.app/novels/audio/chapter-001.mp3
```

---

## โครงสร้างไฟล์ใน Firebase Storage

```
my-auth-app-107d1.firebasestorage.app/
└── novels/
    ├── images/       ← รูปภาพปกนิยาย
    │   ├── cover-001.jpg
    │   └── ...
    └── audio/        ← ไฟล์เสียง MP3
        ├── chapter-001.mp3
        └── ...
```

---

## หลังจากได้ Firebase URLs แล้ว

นำ URL ใหม่ไปอัปเดตในหน้า Admin Panel ของเว็บนิยาย:
- `https://mafangniyai.vercel.app/admin`
- แก้ไข URL ของแต่ละนิยาย/ตอน ให้ใช้ Firebase Storage URL แทน Google Drive URL

> [!TIP]
> ไฟล์ CSV ที่ได้จาก Script สะดวกมากสำหรับการ Track การเปลี่ยน URL ครับ

---

## แก้ไขปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|-------|---------|
| `ไม่พบ credentials.json` | วางไฟล์ในโฟลเดอร์ migrate-to-firebase |
| `ไม่พบ firebase-admin.json` | ทำตามขั้นตอนที่ 1 |
| `invalid_grant` (Token หมดอายุ) | ลบไฟล์ `token.json` แล้วรันใหม่ |
| ไฟล์อัปโหลดได้แต่ URL ไม่แสดงรูป | เปิด Firebase Storage → ตรวจสอบ Rules ว่าอนุญาต `read` สำหรับ public |
