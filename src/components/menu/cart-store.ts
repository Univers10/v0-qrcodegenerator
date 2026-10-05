"use client"

import { useCallback, useSyncExternalStore } from "react"

export type CartLine = {
  /** Clé unique : produit + déclinaison + options choisies */
  key: string
  itemId: string
  variantId: string | null
  choiceIds: string[]
  quantity: number
}

const EMPTY: CartLine[] = []
const cache = new Map<string, CartLine[]>()
const listeners = new Map<string, Set<() => void>>()

const storageKey = (scope: string) => `qrc:cart:${scope}`

function read(scope: string, persist: boolean): CartLine[] {
  if (cache.has(scope)) return cache.get(scope)!
  let lines: CartLine[] = []
  if (persist) {
    try {
      const raw = localStorage.getItem(storageKey(scope))
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : []
      if (Array.isArray(parsed)) lines = parsed.filter((l) => l && typeof l.itemId === "string" && l.quantity > 0)
    } catch {
      /* stockage indisponible : panier en mémoire */
    }
  }
  cache.set(scope, lines)
  return lines
}

function write(scope: string, persist: boolean, lines: CartLine[]) {
  cache.set(scope, lines)
  if (persist) {
    try {
      if (lines.length) localStorage.setItem(storageKey(scope), JSON.stringify(lines))
      else localStorage.removeItem(storageKey(scope))
    } catch {
      /* ignoré */
    }
  }
  listeners.get(scope)?.forEach((l) => l())
}

export function lineKey(itemId: string, variantId: string | null, choiceIds: string[]) {
  return [itemId, variantId ?? "-", ...[...choiceIds].sort()].join("|")
}

/**
 * Panier d'un menu. En page publique il est conservé dans le navigateur (le client peut recharger la page) ;
 * dans les aperçus intégrés, il reste en mémoire.
 */
export function useCart(scope: string, persist: boolean) {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!listeners.has(scope)) listeners.set(scope, new Set())
      listeners.get(scope)!.add(listener)
      return () => listeners.get(scope)?.delete(listener)
    },
    [scope],
  )
  const lines = useSyncExternalStore(
    subscribe,
    () => read(scope, persist),
    () => EMPTY,
  )

  const add = useCallback(
    (itemId: string, variantId: string | null, choiceIds: string[], quantity: number) => {
      const key = lineKey(itemId, variantId, choiceIds)
      const current = read(scope, persist)
      const existing = current.find((l) => l.key === key)
      write(
        scope,
        persist,
        existing
          ? current.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l))
          : [...current, { key, itemId, variantId, choiceIds, quantity }],
      )
    },
    [scope, persist],
  )

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      const current = read(scope, persist)
      write(
        scope,
        persist,
        quantity <= 0 ? current.filter((l) => l.key !== key) : current.map((l) => (l.key === key ? { ...l, quantity: Math.min(50, quantity) } : l)),
      )
    },
    [scope, persist],
  )

  const clear = useCallback(() => write(scope, persist, []), [scope, persist])

  return { lines, add, setQuantity, clear }
}
