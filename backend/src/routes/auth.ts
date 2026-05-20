import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../lib/passport';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const token = generateToken(user.id);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Microsoft OAuth desativado temporariamente
// router.get('/microsoft', passport.authenticate('microsoft', { session: false } as object));
// router.get(
//   '/microsoft/callback',
//   passport.authenticate('microsoft', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` } as object),
//   (req: Request, res: Response) => {
//     const user = req.user as { id: string };
//     const token = generateToken(user.id);
//     res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
//   }
// );

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        tenants: {
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'Logout realizado com sucesso' });
});

export default router;
