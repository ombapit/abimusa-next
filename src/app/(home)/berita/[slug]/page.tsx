import { notFound } from 'next/navigation'
import { marked } from 'marked'

interface Params {
  slug: string
}

async function getArticle(slug: string) {
  const res = await fetch(`https://api.abimusaalasyari.my.id/api/articles?filters[slug][$eq]=${slug}&populate=*`, {
    next: { revalidate: 60 }, // ISR (opsional)
  })
  const json = await res.json()
  const item = json.data?.[0]
  if (!item) return null

  const { title, description, publishedAt, cover, blocks } = item
  return {
    title,
    description,
    publishedAt,
    image: cover?.formats?.medium?.url
      ? `https://api.abimusaalasyari.my.id${cover?.formats?.medium?.url}`
      : null,
    content: blocks[0].body
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const resolvedParams = await params
  const article = await getArticle(resolvedParams.slug)
  if (!article) return notFound()

  const htmlContent = marked(article.content)

  return (
    <main className="max-w-3xl mx-auto p-4 mt-15">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <p className="text-gray-500 mb-4">
        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </p>

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-auto mb-4"
        />
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </main>
  )
}
