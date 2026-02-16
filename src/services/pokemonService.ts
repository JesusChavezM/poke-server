import { getFromPokeApi } from 'src/lib/apiClient';
import type { ApiResult } from 'src/types/api';

export type SimplifiedPokemon = {
  id: number;
  name: string;
  sprites: Record<string, any>;
  types: Array<string>;
  stats: Array<{ name: string; base: number }>;
  abilities: Array<string>;
};

export async function fetchPokemonByName(name: string): Promise<ApiResult<SimplifiedPokemon>> {
  const raw = await getFromPokeApi<any>(`/pokemon/${encodeURIComponent(name)}`);

  const status = (raw as ApiResult<any>)?.status ?? 502;

  const success =
    typeof status === 'number' &&
    status >= 200 &&
    status < 300 &&
    (raw as ApiResult<any>)?.data != null;

  if (!success) {
    return {
      status,
      title: status === 404 ? 'Not Found' : ((raw as ApiResult<any>)?.title ?? 'Upstream Error'),
      message: (raw as ApiResult<any>)?.message ?? 'Error from PokeAPI',
      data: null,
    };
  }
  const payload: SimplifiedPokemon = {
    id: raw.data.id,
    name: raw.data.name,
    sprites: raw.data.sprites ?? {},
    types: raw.data.types?.map((t: any) => t.type.name) ?? [],
    stats: raw.data.stats?.map((s: any) => ({ name: s.stat.name, base: s.base_stat })) ?? [],
    abilities: raw.data.abilities?.map((a: any) => a.ability.name) ?? [],
  };

  return {
    status: 200,
    title: 'OK',
    message: 'Pokemon fetched successfully',
    data: payload,
  };
}
