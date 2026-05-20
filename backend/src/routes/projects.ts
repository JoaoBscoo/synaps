import { Router, Response } from 'express';
import { z } from 'zod';
import { Role, Status, Priority } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { requireTenant, TenantRequest } from '../middleware/tenant';
import prisma from '../lib/prisma';

const router = Router({ mergeParams: true });

const projectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(Status).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime().optional().nullable(),
  budgetTotal: z.number().positive().optional().nullable(),
  budgetUsed: z.number().min(0).optional().nullable(),
  responsible: z.string().max(100).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  clientName: z.string().max(120).optional().nullable(),
  clientEmail: z.string().email().optional().nullable(),
  tags: z.array(z.string()).optional(),
  priority: z.nativeEnum(Priority).optional(),
});

// GET /api/tenants/:slug/projects
router.get('/', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  const { status, priority, search } = req.query;

  try {
    const projects = await prisma.project.findMany({
      where: {
        tenantId: req.tenant!.id,
        ...(status ? { status: status as Status } : {}),
        ...(priority ? { priority: priority as Priority } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } },
                { clientName: { contains: search as string, mode: 'insensitive' } },
                { responsible: { contains: search as string, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { done: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// POST /api/tenants/:slug/projects
router.post('/', authenticate, requireTenant(Role.EDITOR), async (req: TenantRequest, res: Response) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    // Gerar código único PRJ-XXX
    const count = await prisma.project.count({ where: { tenantId: req.tenant!.id } });
    const code = `PRJ-${String(count + 1).padStart(3, '0')}`;

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        code,
        tenantId: req.tenant!.id,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
});

// GET /api/tenants/:slug/projects/:id
router.get('/:id', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, tenantId: req.tenant!.id }, // isolamento multi-tenant
      include: {
        tasks: { orderBy: { dueDate: 'asc' } },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
});

// PATCH /api/tenants/:slug/projects/:id
router.patch('/:id', authenticate, requireTenant(Role.EDITOR), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  const parsed = projectSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    // Verificar que o projeto pertence ao tenant
    const existing = await prisma.project.findFirst({
      where: { id, tenantId: req.tenant!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    // Registrar auditoria para campos relevantes
    const auditActions: { action: string; oldValue: string; newValue: string }[] = [];

    if (parsed.data.status && parsed.data.status !== existing.status) {
      auditActions.push({ action: 'changed_status', oldValue: existing.status, newValue: parsed.data.status });
    }
    if (parsed.data.progress !== undefined && parsed.data.progress !== existing.progress) {
      auditActions.push({ action: 'updated_progress', oldValue: String(existing.progress), newValue: String(parsed.data.progress) });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...parsed.data,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : parsed.data.deadline,
      },
    });

    // Salvar logs de auditoria
    if (auditActions.length > 0) {
      await prisma.auditLog.createMany({
        data: auditActions.map((a) => ({
          projectId: id,
          userId: req.userId!,
          ...a,
        })),
      });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

// DELETE /api/tenants/:slug/projects/:id
router.delete('/:id', authenticate, requireTenant(Role.OWNER), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.project.findFirst({
      where: { id, tenantId: req.tenant!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
});

// GET /api/tenants/:slug/projects/:id/logs
router.get('/:id/logs', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, tenantId: req.tenant!.id },
    });

    if (!project) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }

    const logs = await prisma.auditLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Buscar nomes dos usuários
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    res.json(
      logs.map((log) => ({
        ...log,
        user: userMap[log.userId] || null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

export default router;
