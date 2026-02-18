import { Router } from 'express';
import { verifyGoogleToken } from '../auth/verifyGoogleToken';
import { User } from '../models/User';
import { createSession } from '../auth/createSession';

const router = Router();

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Missing idToken in body' });
    }

    // --- opcional: log temporal para depuración (muestra alg y kid) ---
    try {
      const [hdr] = idToken.split('.');
      const headerJson = JSON.parse(Buffer.from(hdr, 'base64').toString('utf8'));
      console.info('Incoming idToken header:', headerJson); // RS256 esperado
    } catch (e) {
      console.warn('Could not parse idToken header', e);
    }

    const payload = await verifyGoogleToken(idToken);

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Busca por googleId (sub)
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        lastLoginAt: new Date(),
      });
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    const sessionToken = createSession(user.id);

    return res.json({
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    // Diferencia entre errores esperados y errores de infra
    console.error('POST /api/auth/google error:', err);

    // fallback
    return res.status(500).json({ error: 'Auth failed' });
  }
});

export default router;
