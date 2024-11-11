'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface DownloadRecord {
  name: string;
  deviceId: string;
  timestamp: number;
}

export default function AdminDashboard() {
  const [records, setRecords] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nameToDelete, setNameToDelete] = useState('');
  const router = useRouter();

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/records');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('获取记录失败');
      }
      const data = await response.json();
      setRecords(data.records);
    } catch (error) {
      console.error('获取记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleLogout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => router.push('/admin/login'));
  };

  const toggleExpand = (index: number) => {
    const newExpandedIds = new Set(expandedIds);
    if (expandedIds.has(index)) {
      newExpandedIds.delete(index);
    } else {
      newExpandedIds.add(index);
    }
    setExpandedIds(newExpandedIds);
  };

  const handleClearRecords = async () => {
    if (!window.confirm('确定要清空所有下载记录吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/records/clear', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('清空记录失败');
      }

      // 广播清空记录的消息
      const broadcastChannel = new BroadcastChannel('download_records');
      broadcastChannel.postMessage({ type: 'CLEAR_RECORDS' });
      
      // 刷新记录列表
      await fetchRecords();
    } catch (error) {
      console.error('清空记录失败:', error);
      alert('清空记录失败，请重试');
    }
  };

  const handleDeleteRecord = async () => {
    if (!nameToDelete.trim()) {
      alert('请输入姓名');
      return;
    }

    try {
      const response = await fetch('/api/admin/records/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToDelete }),
      });

      if (!response.ok) {
        throw new Error('删除记录失败');
      }

      // 广播删除记录的消息
      const broadcastChannel = new BroadcastChannel('download_records');
      broadcastChannel.postMessage({ 
        type: 'DELETE_RECORD',
        name: nameToDelete
      });
      
      // 刷新记录列表
      await fetchRecords();
      setShowDeleteModal(false);
      setNameToDelete('');
    } catch (error) {
      console.error('删除记录失败:', error);
      alert('删除记录失败，请重试');
    }
  };

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">下载记录管理</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              删除指定记录
            </button>
            <button
              onClick={handleClearRecords}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              清空记录
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded">
              <h3 className="font-bold">总下载次数</h3>
              <p className="text-2xl">{records.length}</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <h3 className="font-bold">今日下载</h3>
              <p className="text-2xl">
                {records.filter(r => 
                  new Date(r.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded">
              <h3 className="font-bold">独立设备数</h3>
              <p className="text-2xl">
                {new Set(records.map(r => r.deviceId)).size}
              </p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">姓名</th>
                <th className="p-3 text-left">设备ID</th>
                <th className="p-3 text-left">下载时间</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{record.name}</td>
                  <td className="p-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {expandedIds.has(index) 
                        ? record.deviceId 
                        : record.deviceId.slice(0, 16) + '...'}
                      <button
                        onClick={() => toggleExpand(index)}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        {expandedIds.has(index) ? '收起' : '展开'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 删除记录的模态框 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">删除指定记录</h2>
              <input
                type="text"
                value={nameToDelete}
                onChange={(e) => setNameToDelete(e.target.value)}
                placeholder="请输入要删除的姓名"
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setNameToDelete('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteRecord}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 