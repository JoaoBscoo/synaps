import { Response, NextFunction } from 'express';
import { Role, Tenant, TenantUser } from '@prisma/client';
import { AuthRequest } from './auth';
import prisma from '../lib/prisma';

export interface TenantRequest extends AuthRequest {
  tenant?: Tenant;
  tenantUser?: TenantUser;
}

const ROLE_HIERARCHY: Record<Role, number> = {
  CLIENT: 0,
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export function requireTenant(minRole?: Role) {
  return async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: 'Slug do workspace não informado' });
      return;
    }

    try {
      const tenantUser = await prisma.tenantUser.findFirst({
        where: {
          userId: req.userId!,
          tenant: { slug },
        },
        include: { tenant: true },
      });

      if (!tenantUser) {
        res.status(403).json({ error: 'Acesso negado a este workspace' });
        return;
      }

      if (minRole && ROLE_HIERARCHY[tenantUser.role] < ROLE_HIERARCHY[minRole]) {
        res.status(403).json({ error: 'Permissões insuficientes para esta ação' });
        return;
      }

      req.tenant = (tenantUser as TenantUser & { tenant: Tenant }).tenant as Tenant;
      req.tenantUser = tenantUser;
      next();
    } catch (err) {
      console.error('Erro no middleware de tenant:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}
