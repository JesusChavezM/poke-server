// src/services/pokemonListService.ts
import { getFromPokeApi } from 'src/lib/apiClient';
import type { ApiResult } from 'src/types/api';
import type { PaginatedList, PokemonListItem } from 'src/types/pokemon';

export async function fetchPokemonList(
  limit = 20,
  offset = 0
): Promise<ApiResult<PaginatedList<PokemonListItem>>> {
  const path = `/pokemon?limit=${limit}&offset=${offset}`;
  const raw = await getFromPokeApi<PaginatedList<PokemonListItem>>(path);

  if (!(raw.status >= 200 && raw.status < 300 && raw.data)) {
    const status = raw.status ?? 502;
    return {
      status,
      title: raw.title ?? 'Upstream Error',
      message: raw.message ?? 'Error',
      data: null,
    };
  }

  const resultsWithId = raw.data.results.map(item => {
    const match = (item.url || '').match(/\/pokemon\/(\d+)\/?$/);
    const id = match ? Number(match[1]) : undefined;
    return { ...item, id };
  });

  return {
    status: 200,
    title: 'OK',
    message: '',
    data: {
      count: raw.data.count,
      next: raw.data.next ?? null,
      previous: raw.data.previous ?? null,
      results: resultsWithId,
    },
  };
}
