import { fetchPokemonByName } from '../services/pokemonService';
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResult } from '../utils/apiResponse';

export const getPokemonByName = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.params.name || '')
    .trim()
    .toLowerCase();
  if (!name) {
    return sendResult(res, {
      status: 400,
      title: 'Bad Request',
      message: 'name required',
      data: null,
    });
  }

  const result = await fetchPokemonByName(name, { includeEvolutions: true });
  return sendResult(res, result);
});
