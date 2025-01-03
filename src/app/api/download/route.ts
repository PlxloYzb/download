// src/app/api/download/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import db from '@/lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
  });
}

export async function POST(request: Request) {
  try {
    const { name, deviceId } = await request.json();

    if (!name || !deviceId) {
      return NextResponse.json(
        { success: false, message: '请提供完整信息' },
        { status: 400 }
      );
    }

    const existingDownload = db
      .prepare('SELECT * FROM downloads WHERE name = ?')
      .get(name);

    if (existingDownload) {
      return NextResponse.json(
        { success: false, message: '该姓名已经下载过二维码' },
        { status: 403 }
      );
    }

    const fileName = `${encodeURIComponent(name)}.png`;
    const filePath = path.join(process.cwd(), 'public', 'images', decodeURIComponent(fileName));

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '二维码文件不存在' },
        { status: 404 }
      );
    }

    db.prepare(
      'INSERT INTO downloads (name, device_id, timestamp) VALUES (?, ?, ?)'
    ).run(name, deviceId, Date.now());

    // 修改下载 URL 路径
    const downloadUrl = `/images/${fileName}`;

    const response = NextResponse.json({
      success: true,
      message: '下载授权成功',
      downloadUrl,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

    return response;
  } catch (error) {
    console.error('Download request error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}