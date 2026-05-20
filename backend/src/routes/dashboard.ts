import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireTenant, TenantRequest } from '../middleware/tenant';
import prisma from '../lib/prisma';

const router = Router({ mergeParams: true });

// GET /api/tenants/:slug/dashboard
router.get('/', authenticate, requireTenant(), async (req: TenantRequest, res: Response) => {
  const tenantId = req.tenant!.id;

  try {
    const projects = await prisma.project.findMany({
      where: { tenantId },
      include: { _count: { select: { tasks: true } }, tasks: { select: { done: true } } },
    });

    const total = projects.length;
    const byStatus = {
      ON_TRACK: 0,
      AT_RISK: 0,
      DELAYED: 0,
      COMPLETED: 0,
      PAUSED: 0,
    };

    let totalHealth = 0;
    let totalBudget = 0;
    let usedBudget = 0;

    for (const p of projects) {
      byStatus[p.status]++;
      totalHealth += p.healthScore;
      totalBudget += p.budgetTotal || 0;
      usedBudget += p.budgetUsed || 0;
    }

    const avgHealth = total > 0 ? Math.round(totalHealth / total) : 0;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Projetos com prazo nos próximos 30 dias (não concluídos)
    const upcomingDeadlines = projects
      .filter(
        (p) =>
          p.deadline &&
          p.status !== 'COMPLETED' &&
          p.deadline >= now &&
          p.deadline <= thirtyDaysFromNow
      )
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        deadline: p.deadline,
        status: p.status,
        progress: p.progress,
        priority: p.priority,
        daysLeft: Math.ceil((new Date(p.deadline!).getTime() - now.getTime()) / 86400000),
      }));

    // Alertas: projetos DELAYED ou AT_RISK com health score baixo, ou com prazo vencido
    const alerts = projects
      .filter(
        (p) =>
          p.status !== 'COMPLETED' &&
          p.status !== 'PAUSED' &&
          (p.status === 'DELAYED' ||
            p.status === 'AT_RISK' ||
            p.healthScore < 60 ||
            (p.deadline && p.deadline < now))
      )
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        healthScore: p.healthScore,
        priority: p.priority,
        deadline: p.deadline,
        isOverdue: p.deadline ? p.deadline < now : false,
      }));

    // Projetos com tarefas pendentes vencidas
    const tasksOverview = projects.reduce(
      (acc, p) => {
        acc.total += p._count.tasks;
        acc.done += p.tasks.filter((t) => t.done).length;
        return acc;
      },
      { total: 0, done: 0 }
    );

    res.json({
      kpis: {
        total,
        atRisk: byStatus.AT_RISK,
        delayed: byStatus.DELAYED,
        completed: byStatus.COMPLETED,
        avgHealth,
        totalBudget,
        usedBudget,
        budgetUtilization: totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0,
      },
      byStatus,
      upcomingDeadlines,
      alerts,
      tasks: tasksOverview,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao calcular dashboard' });
  }
});

export default router;
