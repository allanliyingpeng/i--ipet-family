// 将图片 URI 转换为 base64
export const imageUriToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // 去掉 data:image/xxx;base64, 前缀
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// 将 base64 转换为 data URI
export const base64ToDataUri = (base64: string, mimeType = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`;
};
