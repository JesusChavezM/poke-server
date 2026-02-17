import { sendResult } from '../utils/apiResponse';
import { fetchPokemonList } from '../services/pokemonListService';
import { asyncHandler } from '../utils/asyncHandler';
import type { Request, Response } from 'express';

export const getPokemonList = asyncHandler(async (req: Request, res: Response) => {
  const rawLimit = req.query.limit;
  const rawOffset = req.query.offset;

  const limit = rawLimit ? Number(rawLimit) : 20;
  const offset = rawOffset ? Number(rawOffset) : 0;

  if (Number.isNaN(limit) || Number.isNaN(offset)) {
    return sendResult(res, {
      status: 400,
      title: 'Bad Request',
      message: 'limit and offset must be numbers',
      data: null,
    });
  }

  const result = await fetchPokemonList(limit, offset);
  return sendResult(res, result);
});
