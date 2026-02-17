import { getFromPokeApi } from '../lib/apiClient';
import type { ApiResult } from '../types/api';
import type { PaginatedList, PokemonListItem } from '../types/pokemon';

type PokemonTypeEntry = { slot?: number; type?: { name?: string; url?: string } };
type PokemonDetailData = {
  id?: number;
  types?: Array<PokemonTypeEntry>;
};

const extractPokemonIdFromUrl = (url?: string): number | undefined => {
  if (!url) return undefined;
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? Number(m[1]) : undefined;
};

const buildArtworkUrl = (id?: number): string =>
  id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` : '';

export async function fetchPokemonList(limit = 20, offset = 0): Promise<ApiResult<PaginatedList<PokemonListItem>>> {
  const upstreamResponse = await getFromPokeApi<PaginatedList<PokemonListItem>>(`/pokemon?limit=${limit}&offset=${offset}`);

  if (!(upstreamResponse.status >= 200 && upstreamResponse.status < 300 && upstreamResponse.data)) {
    const status = upstreamResponse.status ?? 502;
    return {
      status,
      title: upstreamResponse.title ?? 'Upstream Error',
      message: upstreamResponse.message ?? 'Error',
      data: null,
    };
  }

  const normalizedResults = upstreamResponse.data.results.map(item => {
    const id = (item as any).id ?? extractPokemonIdFromUrl(item.url);
    return { ...item, id, artwork: buildArtworkUrl(id) } as PokemonListItem;
  });

  const detailPromises = normalizedResults.map(item => (item.id ? getFromPokeApi<PokemonDetailData>(`/pokemon/${item.id}`) : Promise.resolve(null)));

  const settledDetails = await Promise.allSettled(detailPromises);

  const enrichedResults = normalizedResults.map((item, idx) => {
    const settled = settledDetails[idx];
    let primaryType: string | undefined;

    if (settled?.status === 'fulfilled' && settled.value) {
      const detailResponse = settled.value as ApiResult<PokemonDetailData> | null;
      if (detailResponse && detailResponse.status >= 200 && detailResponse.status < 300 && detailResponse.data) {
        const typesArray = detailResponse.data.types;
        if (Array.isArray(typesArray) && typesArray.length > 0) {
          const first = typesArray[0];
          if (first && first.type && typeof first.type.name === 'string') {
            primaryType = first.type.name;
          }
        }
      }
    }

    return { ...item, primaryType };
  });

  return {
    status: 200,
    title: 'OK',
    message: '',
    data: {
      count: upstreamResponse.data.count,
      next: upstreamResponse.data.next ?? null,
      previous: upstreamResponse.data.previous ?? null,
      results: enrichedResults,
    },
  };
}
