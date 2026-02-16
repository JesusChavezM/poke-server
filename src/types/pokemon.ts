// src/types/pokemon.ts
export type PokemonListItem = {
  name: string;
  url: string;
  id?: number;
};

export type PaginatedList<T> = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Array<T>;
};
