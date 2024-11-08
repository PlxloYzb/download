// src/app/api/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      console.log('Missing name in request');
      return NextResponse.json(
        { success: false, message: '请提供文件名' },
        { status: 400 }
      );
    }

    const fileName = `${name}.png`;
    const filePath = path.join(process.cwd(), 'public', 'images', fileName);

    try {
      console.log('Attempting to delete file:', filePath);
      await unlink(filePath);
      console.log('File deleted successfully');
      
      return NextResponse.json({
        success: true,
        message: '文件删除成功'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      return NextResponse.json(
        { success: false, message: '文件删除失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}