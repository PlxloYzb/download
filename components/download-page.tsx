'use client';
import React, { useState, useEffect } from 'react';

const DownloadPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [error, setError] = useState('');

  // 组件加载时从 localStorage 读取已下载文件列表
  useEffect(() => {
    const downloaded = localStorage.getItem('downloadedFiles');
    if (downloaded) {
      setDownloadedFiles(JSON.parse(downloaded));
    }
  }, []);

  const handleDownload = () => {
    // 检查文件是否已经下载过
    if (downloadedFiles.includes(name)) {
      setError(`${name}.png 已经被下载过了`);
      return;
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.href = `/images/${name}.png`;
    link.download = `${name}.png`;
    
    // 添加错误处理
    const handleError = () => {
      setError(`${name}.png 文件不存在`);
      link.removeEventListener('error', handleError);
    };
    
    // 检查文件是否存在
    fetch(link.href)
      .then(response => {
        if (!response.ok) {
          throw new Error('File not found');
        }
        return response.blob();
      })
      .then(() => {
        // 文件存在，执行下载
        link.click();
        
        // 更新已下载文件列表
        const newDownloadedFiles = [...downloadedFiles, name];
        setDownloadedFiles(newDownloadedFiles);
        localStorage.setItem('downloadedFiles', JSON.stringify(newDownloadedFiles));
        
        // 关闭模态框并清空输入
        setShowModal(false);
        setName('');
        setError('');
      })
      .catch(() => {
        setError(`${name}.png 文件不存在`);
      });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <button 
        onClick={() => {
          setShowModal(true);
          setError('');
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        点击下载
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">请输入您的姓名</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="请输入姓名"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleDownload}
                disabled={!name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;