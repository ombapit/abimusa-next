'use client'

import React, { useEffect, useState } from 'react'
import NewsCard from './NewsCard'

interface Article {
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

export default function ListBerita() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://api.abimusaalasyari.my.id/api/articles?sort=publishedAt:desc&populate=*')
      .then((res) => res.json())
      .then((data) => setArticles(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center py-4">Loading...</p>
  if (error) return <p className="text-center text-red-500 py-4">Error: {error} News</p>

  return (
    <div className="relative mt-4">
      <h1 className="text-center font-bold text-2xl">Berita</h1>
      <div className="flex flex-wrap gap-4 p-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
    </div>
  );
}