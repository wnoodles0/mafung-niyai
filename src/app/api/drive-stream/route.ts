import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('id');
  const directUrl = searchParams.get('url');

  if (!fileId && !directUrl) {
    return new NextResponse('Missing id or url parameter', { status: 400 });
  }

  try {
    let fetchUrl = '';
    if (fileId) {
      fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    } else if (directUrl) {
      fetchUrl = directUrl;
    }

    // Fetch the audio stream from Google Drive or remote source
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      // Fallback try with uc?id= format
      if (fileId) {
        const fallbackRes = await fetch(`https://drive.google.com/uc?id=${fileId}&export=open`);
        if (fallbackRes.ok && fallbackRes.body) {
          const headers = new Headers();
          headers.set('Content-Type', 'audio/mpeg');
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=3600');
          return new NextResponse(fallbackRes.body as any, {
            status: 200,
            headers,
          });
        }
      }
      return new NextResponse('Failed to fetch audio stream', { status: response.status });
    }

    // Forward stream headers
    const headers = new Headers();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    
    // Ensure content type is audio/mpeg if Google Drive sends octet-stream
    if (contentType.includes('html')) {
      // Google Drive confirmation page for large files
      // Extract confirmation code if present or try direct drive content CDN
      if (fileId) {
        const directCdnRes = await fetch(`https://lh3.googleusercontent.com/d/${fileId}`);
        if (directCdnRes.ok && directCdnRes.body) {
          headers.set('Content-Type', 'audio/mpeg');
          headers.set('Accept-Ranges', 'bytes');
          headers.set('Cache-Control', 'public, max-age=3600');
          return new NextResponse(directCdnRes.body as any, {
            status: 200,
            headers,
          });
        }
      }
      return new NextResponse('Google Drive file is private or requires permission', { status: 403 });
    }

    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(response.body as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Audio stream proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
