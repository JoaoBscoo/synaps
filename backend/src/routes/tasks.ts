import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Verificar que o usuário tem acesso ao projeto via tenant
async function verifyProjectAccess(
  projectId: string,
  userId: string
): Promise<{ hasAccess: boolean; canEdit: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tenant: {
        include: {
          users: { where: { userId } },
        },
      },
    },
  });

  if (!project) return { hasAccess: false, canEdit: false };

  const membership = project.tenant.users[0];
  if (!membership) return { hasAccess: false, canEdit: false };

  const canEdit = ['OWNER', 'EDITOR'].includes(membership.role);
  return { hasAccess: true, canEdit };
}

// POST /api/projects/:id/tasks
router.post('/:id/tasks', authenticate, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    title: z.string().min(1).max(200),
    dueDate: z.string().datetime().optional().nullable(),
    assignee: z.string().max(100).optional().nullable(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { id: projectId } = req.params;
  const { hasAccess, canEdit } = await verifyProjectAccess(projectId, req.userId!);

  if (!hasAccess) { res.status(404).json({ error: 'Projeto não encontrado' }); return; }
  if (!canEdit) { res.status(403).json({ error: 'Permissões insuficientes' }); return; }

  try {
    const task = await prisma.task.create({
      data: {
        projectId,
        title: parsed.data.title,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        assignee: parsed.data.assignee ?? undefined,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    title: z.string().min(1).max(200).optional(),
    done: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assignee: z.string().max(100).optional().nullable(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) { res.status(404).json({ error: 'Tarefa não encontrada' }); return; }

    const { hasAccess, canEdit } = await verifyProjectAccess(task.projectId, req.userId!);
    if (!hasAccess) { res.status(404).json({ error: 'Tarefa não encontrada' }); return; }
    if (!canEdit) { res.status(403).json({ error: 'Permissões insuficientes' }); return; }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) { res.status(404).json({ error: 'Tarefa não encontrada' }); return; }

    const { hasAccess, canEdit } = await verifyProjectAccess(task.projectId, req.userId!);
    if (!hasAccess) { res.status(404).json({ error: 'Tarefa não encontrada' }); return; }
    if (!canEdit) { res.status(403).json({ error: 'Permissões insuficientes' }); return; }

    await prisma.task.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover tarefa' });
  }
});

export default router;
