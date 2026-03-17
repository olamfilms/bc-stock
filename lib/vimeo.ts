export interface VimeoMetadata {
  title: string
  duration: number
  thumbnail: string | null
  width: number
  height: number
}

interface VimeoPictureSize {
  width: number
  height: number
  link: string
  link_with_play_button: string
}

interface VimeoApiResponse {
  name: string
  duration: number
  width: number
  height: number
  pictures: {
    sizes: VimeoPictureSize[]
  }
}

export async function fetchVimeoMetadata(vimeoId: string): Promise<VimeoMetadata> {
  // Use vumbnail.com for thumbnails — no API key required
  const thumbnail = `https://vumbnail.com/${vimeoId}.jpg`

  return {
    title: '',
    duration: 0,
    thumbnail,
    width: 1280,
    height: 720,
  }
}
