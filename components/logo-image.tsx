"use client"

import Image from "next/image"
import { useState } from "react"

export function LogoImage() {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">GMDC</div>
  }

  return (
    <Image
      src="/images/gmdc-logo.png"
      alt="GMDC Logo"
      fill
      className="object-contain"
      onError={() => setImageError(true)}
    />
  )
}
