// Hook pour les categories publiques.
// Source unique : GET /categories?type=VENTE (backend) avec cache module-level
// pour eviter de refetcher a chaque mount d'ecran.

import { useEffect, useState } from 'react';

import {
  publicCategoriesApi,
  type PublicCategoryNode,
  type ListingType,
} from '@/lib/api';

// Cache module : la premiere fetch est partagee entre tous les ecrans.
const cache: Partial<Record<ListingType, PublicCategoryNode[]>> = {};
const inflight: Partial<Record<ListingType, Promise<PublicCategoryNode[]>>> = {};

async function getOrFetch(type: ListingType): Promise<PublicCategoryNode[]> {
  if (cache[type]) return cache[type]!;
  if (!inflight[type]) {
    inflight[type] = publicCategoriesApi.tree(type)
      .then((tree) => {
        cache[type] = tree;
        return tree;
      })
      .catch((err) => {
        console.warn('categories fetch failed', err);
        return [];
      })
      .finally(() => {
        delete inflight[type];
      });
  }
  return inflight[type]!;
}

/** Hook lecture seule : renvoie l'arbre des categories + loading. */
export function useCategories(type: ListingType = 'VENTE') {
  const [categories, setCategories] = useState<PublicCategoryNode[]>(
    cache[type] ?? [],
  );
  const [loading, setLoading] = useState(!cache[type]);

  useEffect(() => {
    let alive = true;
    if (cache[type]) {
      setCategories(cache[type]!);
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrFetch(type).then((tree) => {
      if (alive) {
        setCategories(tree);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [type]);

  return { categories, loading };
}

/** Aplatit l'arbre en liste de feuilles (utile pour le picker de creation). */
export function flattenLeaves(tree: PublicCategoryNode[]): PublicCategoryNode[] {
  const out: PublicCategoryNode[] = [];
  function walk(nodes: PublicCategoryNode[]) {
    for (const n of nodes) {
      if (n.isLeaf) out.push(n);
      if (n.children?.length) walk(n.children);
    }
  }
  walk(tree);
  return out;
}
