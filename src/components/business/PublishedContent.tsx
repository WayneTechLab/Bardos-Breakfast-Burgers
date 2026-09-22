import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

export function PublishedContent() {
  const [content, setContent] = useState<{ id: string; headline: string; body: string }[]>([])
  useEffect(() => {
    if (!db) return
    return onSnapshot(
      query(collection(db, 'content'), where('published', '==', true)),
      (snap) =>
        setContent(
          snap.docs.map((doc) => ({
            id: doc.id,
            headline: String(doc.data().headline),
            body: String(doc.data().body),
          })),
        ),
      () => setContent([]),
    )
  }, [])
  return (
    <>
      {content.map((item) => (
        <section key={item.id} id={`news-${item.id}`} lang="en" className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-bold">{item.headline}</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-stone-700">{item.body}</p>
        </section>
      ))}
    </>
  )
}
