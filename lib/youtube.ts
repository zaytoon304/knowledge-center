// يستخرج معرّف فيديو يوتيوب من رابط (watch؟v=، youtu.be/، أو embed/) — يرجّع فاضي لو الرابط مش يوتيوب
export function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : "";
}

export function youtubeThumbUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
