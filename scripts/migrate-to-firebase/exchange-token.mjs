import fs from "fs";
import { google } from "googleapis";

const creds = JSON.parse(fs.readFileSync("./credentials.json", "utf8"));
const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const CODE = "4/0AXEQxIBim77-0_Z5JsxmAMAPF9kq3JxjyWzPcjHiTpJUyz5Vx-xDwhaWwGmtZn083-C1PQ";

oAuth2Client.getToken(CODE, (err, token) => {
  if (err) {
    console.error("❌ Token exchange failed:", err.message);
    process.exit(1);
  }
  fs.writeFileSync("./token.json", JSON.stringify(token, null, 2));
  console.log("✅ Token saved! Access:", token.access_token?.slice(0, 20) + "...");
  process.exit(0);
});
