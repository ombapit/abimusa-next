import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  article: {
    id: number
    title: string
    description: string
    slug: string
    publishedAt: string
    cover?: {
      alternativeText: string
      formats?: {
        thumbnail: {
          url: string
        }
      }
    }
    blocks: [{
      body: string
    }]
  }
}

export default function NewsCard({ article }: Props) {
  const { title, slug, publishedAt, cover, blocks } = article
  const imageUrl = cover?.formats?.thumbnail?.url
  const fullImageUrl = imageUrl?.startsWith('http')
    ? imageUrl
    : `https://api.abimusaalasyari.my.id${imageUrl}`

  return (
    <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-full md:w-[32%]">
      {imageUrl && (
        <div className="w-1/3">
          <Link href={`/berita/${slug}`}>
            <div className="w-full relative h-full">
              <Image
                src={fullImageUrl}
                alt={title}
                fill
                style={{ objectFit: 'cover' }} // atau 'cover' sesuai kebutuhan
              />
            </div>
          </Link>
        </div>
      )}
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            <Link href={`/berita/${slug}`}>{title}</Link>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-700 mt-2 line-clamp-3">            
            {blocks[0].body}
          </p>
        </div>
      </div>
    </div>
  )
}