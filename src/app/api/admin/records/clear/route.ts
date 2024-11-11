import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 清空下载记录表
    db.prepare('DELETE FROM downloads').run();

    return NextResponse.json({
      success: true,
      message: '记录已清空',
      clearLocalStorage: true  // 添加标志，表示需要清空本地存储
    });
  } catch (error) {
    console.error('清空记录失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 