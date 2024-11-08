// src/app/api/download/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

type Props = {
  params: {
    filename: string;
  };
};

export async function GET(
  request: NextRequest,
  props: Props  // 使用正确的类型定义
) {
  try {
    // 确保正确解码文件名
    const filename = decodeURIComponent(props.params.filename);
    const filePath = path.join(process.cwd(), 'public', 'images', filename);

    try {
      const fileBuffer = await readFile(filePath);
      
      // 使用 Buffer 转换为二进制数据
      const binaryData = Buffer.from(fileBuffer);

      return new NextResponse(binaryData, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
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