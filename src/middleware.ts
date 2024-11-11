import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 检查是否访问管理员页面
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 排除登录页面
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 验证管理员session
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 