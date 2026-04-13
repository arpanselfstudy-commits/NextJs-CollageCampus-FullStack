/**
 * Uploads a file directly to Cloudinary using an unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName) throw new Error('Missing Cloudinary env var: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!uploadPreset) throw new Error('Missing Cloudinary env var: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  let response: Response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch (err) {
    throw new Error(`Network error during Cloudinary upload: ${err instanceof Error ? err.message : String(err)}`)
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Cloudinary upload failed with status ${response.status}`)
  }

  return data.secure_url as string
}
