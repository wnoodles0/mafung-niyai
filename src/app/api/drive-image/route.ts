import { NextRequest, NextResponse } from "next/server";

const IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];

async function tryFetch(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) return null;
    return res;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("id");

  if (!fileId) {
    return new NextResponse("Missing id parameter", { status: 400 });
  }

  // Try multiple Google Drive image URL formats in order of reliability
  const candidates = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h1066-p-k-no-nu`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
  ];

  let imageResponse: Response | null = null;
  for (const url of candidates) {
    imageResponse = await tryFetch(url);
    if (imageResponse) break;
  }

  if (!imageResponse || !imageResponse.body) {
    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
      302
    );
  }

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const mimeType =
    IMAGE_CONTENT_TYPES.find((t) => contentType.startsWith(t)) || "image/jpeg";

  const headers = new Headers();
  headers.set("Content-Type", mimeType);
  headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");

  const contentLength = imageResponse.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(imageResponse.body as any, {
    status: 200,
    headers,
  });
}
