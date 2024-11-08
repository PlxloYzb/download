// src/app/api/download/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: '请提供姓名' },
        { status: 400 }
      );
    }

    const fileName = `${name}.png`;
    const filePath = path.join(process.cwd(), 'public', 'images', fileName);

    try {
      // 检查文件是否存在
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '二维码文件不存在' },
        { status: 404 }
      );
    }

    // 生成临时下载URL
    const downloadUrl = `/api/download/${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      message: '下载授权成功',
      downloadUrl,
    });
  } catch (error) {
    console.error('Download request error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}