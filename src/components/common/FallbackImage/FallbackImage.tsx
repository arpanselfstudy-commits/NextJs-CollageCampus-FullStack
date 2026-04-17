'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

const FALLBACK_SRC = '/image-fallback.svg'

type FallbackImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null
  fallbackSrc?: string
}

export default function FallbackImage({ src, fallbackSrc = FALLBACK_SRC, alt, ...props }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
