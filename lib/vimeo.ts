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
  const token = process.env.VIMEO_ACCESS_TOKEN
  if (!token) {
    throw new Error('VIMEO_ACCESS_TOKEN is not set')
  }

  const response = await fetch(`https://api.vimeo.com/users/8880091/videos/${vimeoId}`, {
    headers: {
      Authorization: `bearer ${token}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Vimeo API error ${response.status}: ${errorText}`)
  }

  const data: VimeoApiResponse = await response.json()

  // Find the 1280-wide thumbnail or fall back to the largest available
  let thumbnail: string | null = null
  if (data.pictures?.sizes && data.pictures.sizes.length > 0) {
    const sizes = data.pictures.sizes
    const target = sizes.find((s) => s.width === 1280)
    if (target) {
      thumbnail = target.link
    } else {
      // Fall back to the largest width
      const largest = sizes.reduce((prev, curr) =>
        curr.width > prev.width ? curr : prev
      )
      thumbnail = largest.link
    }
  }

  return {
    title: data.name,
    duration: data.duration, // seconds
    thumbnail,
    width: data.width,
    height: data.height,
  }
}
