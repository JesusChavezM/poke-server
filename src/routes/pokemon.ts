import { getPokemonByName } from '@/api/getPokemonByname';
import { getPokemonList } from '@/api/getPokemonList';
import { Router } from 'express';

const router = Router();
// TODO: implement other API routes (e.g. list, create, update, delete)
router.get('/', getPokemonList);
router.get('/:name', getPokemonByName);

export default router;
