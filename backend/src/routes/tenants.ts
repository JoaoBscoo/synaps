import { Router, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireTenant, TenantRequest } from '../middleware/tenant';
import { sendInviteEmail } from '../services/email';
import prisma from '../lib/prisma';

const router = Router();

// Sanitizar slug: minúsculas, hífens, sem caracteres especiais
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// POST /api/tenants — criar workspace
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    slug: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, slug } = parsed.data;
  const finalSlug = sanitizeSlug(slug || name);

  try {
    const existing = await prisma.tenant.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      res.status(409).json({ error: `O slug "${finalSlug}" já está em uso` });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug: finalSlug,
        users: {
          create: { userId: req.userId!, role: Role.OWNER },
        },
      },
      include: { users: true },
    });

    res.status(201).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar workspace' });
  }
});

// GET /api/tenants/:slug — dados do workspace
router.get('/:slug', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  res.json({
    ...req.tenant,
    role: req.tenantUser?.role,
  });
});

// PATCH /api/tenants/:slug — atualizar workspace (OWNER)
router.patch('/:slug', authenticate, requireTenant(Role.OWNER), async (req: TenantRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).max(80).optional(),
    logoUrl: z.string().url().optional().nullable(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const updated = await prisma.tenant.update({
      where: { id: req.tenant!.id },
      data: parsed.data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar workspace' });
  }
});

// GET /api/tenants/:slug/members — listar membros
router.get('/:slug/members', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  try {
    const members = await prisma.tenantUser.findMany({
      where: { tenantId: req.tenant!.id },
      include: { user: true },
      orderBy: { user: { name: 'asc' } },
    });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
});

// POST /api/tenants/:slug/invite — enviar convite
router.post('/:slug/invite', authenticate, requireTenant(Role.OWNER), async (req: TenantRequest, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    role: z.enum(['OWNER', 'EDITOR', 'VIEWER', 'CLIENT']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, role } = parsed.data;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    const invite = await prisma.invite.create({
      data: {
        tenantId: req.tenant!.id,
        email,
        role: role as Role,
        expiresAt,
      },
    });

    const inviter = await prisma.user.findUnique({ where: { id: req.userId! } });
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${invite.token}`;

    await sendInviteEmail({
      to: email,
      tenantName: req.tenant!.name,
      inviterName: inviter?.name || 'Alguém',
      role,
      inviteUrl,
    });

    res.status(201).json({ ok: true, invite: { id: invite.id, email, role, expiresAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
});

// PATCH /api/tenants/:slug/members/:id — alterar role
router.patch('/:slug/members/:id', authenticate, requireTenant(Role.OWNER), async (req: TenantRequest, res: Response) => {
  const schema = z.object({
    role: z.enum(['EDITOR', 'VIEWER', 'CLIENT']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { id } = req.params;

  try {
    // Não permitir alterar o próprio role
    const target = await prisma.tenantUser.findFirst({
      where: { id, tenantId: req.tenant!.id },
    });

    if (!target) {
      res.status(404).json({ error: 'Membro não encontrado' });
      return;
    }

    if (target.userId === req.userId) {
      res.status(403).json({ error: 'Você não pode alterar seu próprio papel' });
      return;
    }

    const updated = await prisma.tenantUser.update({
      where: { id },
      data: { role: parsed.data.role as Role },
      include: { user: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar papel do membro' });
  }
});

// DELETE /api/tenants/:slug/members/:id — remover membro
router.delete('/:slug/members/:id', authenticate, requireTenant(Role.OWNER), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const target = await prisma.tenantUser.findFirst({
      where: { id, tenantId: req.tenant!.id },
    });

    if (!target) {
      res.status(404).json({ error: 'Membro não encontrado' });
      return;
    }

    if (target.userId === req.userId) {
      res.status(403).json({ error: 'Você não pode remover a si mesmo do workspace' });
      return;
    }

    await prisma.tenantUser.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

// POST /api/tenants/invite/accept/:token — aceitar convite
router.post('/invite/accept/:token', authenticate, async (req: AuthRequest, res: Response) => {
  const { token } = req.params;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { tenant: true },
    });

    if (!invite) {
      res.status(404).json({ error: 'Convite não encontrado' });
      return;
    }

    if (invite.usedAt) {
      res.status(410).json({ error: 'Este convite já foi utilizado' });
      return;
    }

    if (new Date() > invite.expiresAt) {
      res.status(410).json({ error: 'Este convite expirou' });
      return;
    }

    // Verificar se já é membro
    const existing = await prisma.tenantUser.findUnique({
      where: { userId_tenantId: { userId: req.userId!, tenantId: invite.tenantId } },
    });

    if (existing) {
      res.status(409).json({ error: 'Você já é membro deste workspace', slug: invite.tenant.slug });
      return;
    }

    await prisma.$transaction([
      prisma.tenantUser.create({
        data: { userId: req.userId!, tenantId: invite.tenantId, role: invite.role },
      }),
      prisma.invite.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ ok: true, slug: invite.tenant.slug, tenantName: invite.tenant.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao aceitar convite' });
  }
});

// GET /api/tenants/invite/:token — info do convite (público)
router.get('/invite/:token', async (req, res: Response) => {
  const { token } = req.params;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { tenant: { select: { name: true, slug: true, logoUrl: true } } },
    });

    if (!invite) {
      res.status(404).json({ error: 'Convite não encontrado' });
      return;
    }

    if (invite.usedAt || new Date() > invite.expiresAt) {
      res.status(410).json({ error: 'Convite expirado ou já utilizado' });
      return;
    }

    res.json({
      email: invite.email,
      role: invite.role,
      tenant: invite.tenant,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar convite' });
  }
});

export default router;
