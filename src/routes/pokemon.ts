import { getPokemonByName } from '../api/getPokemonByname';
import { getPokemonList } from '../api/getPokemonList';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getPokemonList);
router.get('/:name', getPokemonByName);

export default router;
