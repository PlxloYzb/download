import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import type { NextRequest } from 'next/server';

// 修改类型定义
type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    if (!params?.filename) {
      return NextResponse.json(
        { success: false, message: '文件名无效' },
        { status: 400 }
      );
    }

    const filename = decodeURIComponent(params.filename);
    const filePath = path.join(process.cwd(), 'public', 'images', filename);

    try {
      const fileBuffer = await readFile(filePath);

      const response = new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      return response;
    } catch (error) {
      console.error('File read error:', error);
      return NextResponse.json(
        { success: false, message: '文件读取失败' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, message: '下载失败' },
      { status: 500 }
    );
  }
}
