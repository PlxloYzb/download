import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

interface DownloadRecord {
  name: string;
  deviceId: string;
  timestamp: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const records = db
      .prepare(
        'SELECT name, device_id as deviceId, timestamp FROM downloads ORDER BY timestamp DESC'
      )
      .all() as DownloadRecord[];

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('获取记录失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 