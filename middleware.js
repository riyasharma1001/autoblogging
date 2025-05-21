import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Add redirect for old bulk upload path
  if (request.nextUrl.pathname === '/admin/bulkUpload') {
    return NextResponse.redirect(new URL('/admin/posts/bulk-upload', request.url));
  }
  
  // Handle special file requests
  if (request.nextUrl.pathname === '/robots.txt') {
    return NextResponse.rewrite(new URL('/api/robots.txt', request.url));
  }
  
  if (request.nextUrl.pathname === '/sitemap.xml') {
    return NextResponse.rewrite(new URL('/api/sitemap.xml', request.url));
  }
  
  if (request.nextUrl.pathname === '/ads.txt') {
    return NextResponse.rewrite(new URL('/api/ads.txt', request.url));
  }

  // Track post views
  if (request.nextUrl.pathname.startsWith('/post/')) {
    try {
      const slug = request.nextUrl.pathname.split('/').pop();
      const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

      // Call the analytics API
      await fetch(`${request.nextUrl.origin}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, userAgent }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/bulkUpload',
    '/post/:path*',
    '/robots.txt',
    '/sitemap.xml',
    '/ads.txt'
  ]
};