import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { fullMenuCategories, fullMenuItems, type FullMenuItem } from './fullMenu'

export type MenuItem = FullMenuItem & {
  id: string
  description: string
  available: boolean
  revision: number
}
const sourceItems: MenuItem[] = fullMenuItems.map((item) => ({
  ...item,
  id: item.sku,
  description: item.sourceDescriptionExact || item.displayDescriptionDraft,
  available: true,
  revision: 0,
}))
const sourceOrder = new Map(fullMenuItems.map((item, index) => [item.sku, index]))
export function useMenu(includeInactive = false) {
  const [items, setItems] = useState(sourceItems)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    if (!db) return
    const source = includeInactive
      ? collection(db, 'menu')
      : query(collection(db, 'menu'), where('active', '==', true))
    return onSnapshot(
      source,
      { includeMetadataChanges: true },
      (snapshot) => {
        setItems(
          snapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }) as MenuItem)
            .sort(
              (a, b) =>
                fullMenuCategories.findIndex((category) => category.id === a.categoryId) -
                  fullMenuCategories.findIndex((category) => category.id === b.categoryId) ||
                a.sortOrder - b.sortOrder ||
                (sourceOrder.get(a.sku) ?? Number.MAX_SAFE_INTEGER) -
                  (sourceOrder.get(b.sku) ?? Number.MAX_SAFE_INTEGER) ||
                a.sku.localeCompare(b.sku),
            ),
        )
        setConnected(!snapshot.metadata.fromCache)
        setError('')
      },
      (error) => {
        setError(error.message)
        setConnected(false)
      },
    )
  }, [includeInactive])
  return { items, error, connected }
}
