import { getFromPokeApi } from '../lib/apiClient';
import type { ApiResult } from '../types/api';

export type SimplifiedPokemonEvolutions = {
  id: number | null;
  name: string;
  sprite: string | null;
};

export type SimplifiedPokemon = {
  id: number;
  name: string;
  sprites: Record<string, any>;
  types: Array<string>;
  stats: Array<{ name: string; base: number }>;
  abilities: Array<string>;
  evolutions?: Array<SimplifiedPokemonEvolutions>;
};

export async function fetchPokemonByName(name: string, options?: { includeEvolutions?: boolean }): Promise<ApiResult<SimplifiedPokemon>> {
  const includeEvolutions = options?.includeEvolutions ?? true;
  const raw = await getFromPokeApi<any>(`/pokemon/${encodeURIComponent(name)}`);
  const status = (raw as ApiResult<any>)?.status ?? 502;
  const success = typeof status === 'number' && status >= 200 && status < 300 && (raw as ApiResult<any>)?.data != null;

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

  if (includeEvolutions) {
    try {
      const pokemonEvolutionsResponse = await fetchPokemonEvolution(String(payload.id ?? payload.name));
      if (pokemonEvolutionsResponse && pokemonEvolutionsResponse.data) {
        payload.evolutions = pokemonEvolutionsResponse.data.evolutions;
        return {
          status: 200,
          title: 'OK',
          message: 'Pokemon fetched successfully (with evolutions)',
          data: payload,
        };
      } else {
        return {
          status: 200,
          title: 'OK',
          message: 'Pokemon fetched, but failed to fetch evolutions',
          data: payload,
        };
      }
    } catch (err: any) {
      return {
        status: 200,
        title: 'OK',
        message: 'Pokemon fetched, but error fetching evolutions',
        data: payload,
      };
    }
  }

  return {
    status: 200,
    title: 'OK',
    message: 'Pokemon fetched successfully',
    data: payload,
  };
}

/**
 * This section is for the helpers for the evolutions
 */

function extractIdFromUrl(url?: string): number | null {
  if (!url) return null;
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

function flattenEvolutionChain(chain: any): Array<{ name: string; url: string }> {
  const out: Array<{ name: string; url: string }> = [];
  function walk(node: any) {
    if (!node) return;
    if (node.species) out.push({ name: node.species.name, url: node.species.url });
    if (Array.isArray(node.evolves_to) && node.evolves_to.length > 0) {
      node.evolves_to.forEach((child: any) => walk(child));
    }
  }
  walk(chain);
  return out;
}

const buildOfficialArtworkSpriteUrl = (id: number | null) =>
  id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png` : null;

async function fetchPokemonEvolution(idOrName: string): Promise<ApiResult<{ evolutions: Array<SimplifiedPokemonEvolutions> }>> {
  try {
    const speciesRes = await getFromPokeApi<any>(`/pokemon-species/${encodeURIComponent(idOrName)}`);
    const speciesStatus = (speciesRes as ApiResult<any>)?.status ?? 502;
    const speciesSuccess =
      typeof speciesStatus === 'number' && speciesStatus >= 200 && speciesStatus < 300 && (speciesRes as ApiResult<any>)?.data != null;

    if (!speciesSuccess) {
      return {
        status: speciesStatus,
        title: speciesStatus === 404 ? 'Not Found' : ((speciesRes as ApiResult<any>)?.title ?? 'Upstream Error'),
        message: (speciesRes as ApiResult<any>)?.message ?? 'Error fetching pokemon-species from PokeAPI',
        data: null,
      };
    }

    const speciesData = (speciesRes as ApiResult<any>).data;
    const evoChainUrl: string | undefined = speciesData?.evolution_chain?.url;

    if (!evoChainUrl) {
      const id = speciesData.id ?? extractIdFromUrl(speciesData?.url);
      const single = { id, name: speciesData.name, sprite: buildOfficialArtworkSpriteUrl(id) };
      return {
        status: 200,
        title: 'OK',
        message: 'No evolution chain',
        data: { evolutions: [single] },
      };
    }
    let evoPath = '';
    try {
      const u = new URL(evoChainUrl);
      evoPath = u.pathname.replace(/^\/+api\/v2/, '');
      if (!evoPath.startsWith('/')) evoPath = '/' + evoPath;
    } catch (e) {
      evoPath = evoChainUrl.replace(/^https?:\/\/[^/]+/, '');
      evoPath = evoPath.replace(/^\/+api\/v2/, '');
      if (!evoPath.startsWith('/')) evoPath = '/' + evoPath;
    }
    const evoRes = await getFromPokeApi<any>(evoPath);
    const evoStatus = (evoRes as ApiResult<any>)?.status ?? 502;
    const evoSuccess = typeof evoStatus === 'number' && evoStatus >= 200 && evoStatus < 300 && (evoRes as ApiResult<any>)?.data != null;

    if (!evoSuccess) {
      return {
        status: evoStatus,
        title: evoStatus === 404 ? 'Not Found' : ((evoRes as ApiResult<any>)?.title ?? 'Upstream Error'),
        message: (evoRes as ApiResult<any>)?.message ?? 'Error fetching evolution_chain from PokeAPI',
        data: null,
      };
    }

    const chain = (evoRes as ApiResult<any>).data.chain;
    const flat = flattenEvolutionChain(chain);
    const evolutions = flat.map(s => {
      const id = extractIdFromUrl(s.url);
      return { id, name: s.name, sprite: buildOfficialArtworkSpriteUrl(id) };
    });

    return {
      status: 200,
      title: 'OK',
      message: 'Evolutions fetched successfully',
      data: { evolutions },
    };
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const message = err?.response?.data?.message ?? err?.message ?? 'Internal error';
    return { status: status === 500 ? 500 : 502, title: 'Error', message, data: null };
  }
}
