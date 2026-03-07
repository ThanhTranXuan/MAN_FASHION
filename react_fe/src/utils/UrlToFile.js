export async function urlToFile(url, filename = 'image.jpg') {
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = url.split('.').pop().split('?')[0];
  return new File([blob], `${filename}.${ext}`, { type: blob.type });
}
