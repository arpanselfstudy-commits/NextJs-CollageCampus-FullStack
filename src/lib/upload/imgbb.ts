const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? ''

export async function uploadToImgBB(file: File): Promise<string> {
  if (!IMGBB_API_KEY) throw new Error('IMGBB_API_KEY not set in .env.local')

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Image upload failed')

  const json = await res.json()
  return json.data.url as string
}
