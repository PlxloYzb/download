import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { success: false, message: '请提供姓名' },
        { status: 400 }
      );
    }

    // 从数据库中删除指定记录
    const result = db.prepare('DELETE FROM downloads WHERE name = ?').run(name);

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, message: '未找到指定记录' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '记录已删除',
      name
    });
  } catch (error) {
    console.error('删除记录失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 