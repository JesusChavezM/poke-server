import { Router } from 'express';
import { verifyGoogleToken } from '../auth/verifyGoogleToken';
import { User } from '../models/User';
import { createSession } from '../auth/createSession';

const router = Router();

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleToken(idToken);

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

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

    res.json({
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Auth failed' });
  }
});

export default router;
