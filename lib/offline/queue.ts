import { openDB } from 'idb'
import { ObservationType } from '@/lib/utils/observation-types'

export interface QueueItem {
  id?: number
  type: ObservationType
  description: string
  severity: number
  lat: number
  lng: number
  photoBlob?: ArrayBuffer
  photoMimeType?: string
  photoFileName?: string
  createdAt: string
}

async function getDB() {
  return openDB('survey-queue', 1, {
    upgrade(db) {
      db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true })
    },
  })
}

export async function addToQueue(item: Omit<QueueItem, 'id'>): Promise<void> {
  const db = await getDB()
  await db.add('pending', item)
}

export async function getQueue(): Promise<QueueItem[]> {
  const db = await getDB()
  return db.getAll('pending')
}

export async function clearItem(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('pending', id)
}

export async function getQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count('pending')
}
