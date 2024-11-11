// src/app/api/download/[filename]/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import type { NextRequest } from 'next/server';

// 修正 RouteContext 类型定义
type Params = {
  params: {
    filename: string;
  };
};

// 添加 OPTIONS 方法处理 CORS 预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
  });
}

// 修正 GET 处理器的参数类型
export async function GET(
  _request: NextRequest,
  { params }: Params  // 使用正确的类型
) {
  try {
    const { filename } = params;
    if (!filename) {
      return NextResponse.json(
        { success: false, message: '文件名无效' },
        { status: 400 }
      );
    }

    const decodedFilename = decodeURIComponent(filename);
    const filePath = path.join(process.cwd(), 'public', 'images', decodedFilename);

    try {
      const fileBuffer = await readFile(filePath);

      const response = new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(decodedFilename)}`,
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
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