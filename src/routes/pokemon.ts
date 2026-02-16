import { getPokemonByName } from '@/api/pokemon';
import { Router } from 'express';

const router = Router();
// TODO: implement other API routes (e.g. list, create, update, delete)
router.get('/:name', getPokemonByName);

export default router;
