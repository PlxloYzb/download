// 生成设备指纹
export function generateDeviceId(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    navigator.platform,
  ];

  // 使用设备信息生成唯一标识
  const deviceString = components.join('|');
  return btoa(deviceString).replace(/[^a-zA-Z0-9]/g, '');
} 