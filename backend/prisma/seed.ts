import { PrismaClient, Role, Status, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧠 Iniciando seed do Synaps...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.tenantUser.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  // Criar tenant de exemplo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Consultoria Nexus',
      slug: 'consultoria-nexus',
    },
  });

  // Criar usuários
  const owner = await prisma.user.create({
    data: {
      email: 'dono@nexus.com.br',
      name: 'Carlos Mendes',
      provider: 'google',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'gerente@nexus.com.br',
      name: 'Ana Paula Ferreira',
      provider: 'microsoft',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'analista@nexus.com.br',
      name: 'Ricardo Oliveira',
      provider: 'google',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ricardo',
    },
  });

  // Associar usuários ao tenant
  await prisma.tenantUser.createMany({
    data: [
      { userId: owner.id, tenantId: tenant.id, role: Role.OWNER },
      { userId: editor.id, tenantId: tenant.id, role: Role.EDITOR },
      { userId: viewer.id, tenantId: tenant.id, role: Role.VIEWER },
    ],
  });

  const now = new Date();
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000);

  // Criar 8 projetos realistas em português
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Migração para Cloud AWS',
        code: 'PRJ-001',
        description: 'Migração completa da infraestrutura on-premise para AWS, incluindo banco de dados, aplicações e pipelines CI/CD.',
        status: Status.ON_TRACK,
        progress: 65,
        healthScore: 82,
        deadline: addDays(90),
        budgetTotal: 280000,
        budgetUsed: 165000,
        responsible: 'Ana Paula Ferreira',
        category: 'Infraestrutura',
        clientName: 'Grupo Alfa Indústrias',
        clientEmail: 'ti@grupoalfa.com.br',
        tags: ['cloud', 'aws', 'devops'],
        priority: Priority.HIGH,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Implementação ERP SAP S/4HANA',
        code: 'PRJ-002',
        description: 'Implantação do SAP S/4HANA nos módulos FI, CO, MM e SD para substituição do sistema legado.',
        status: Status.AT_RISK,
        progress: 40,
        healthScore: 54,
        deadline: addDays(30),
        budgetTotal: 950000,
        budgetUsed: 620000,
        responsible: 'Carlos Mendes',
        category: 'ERP',
        clientName: 'Beta Distribuidora Ltda',
        clientEmail: 'projetos@betadist.com.br',
        tags: ['sap', 'erp', 'financeiro'],
        priority: Priority.CRITICAL,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Redesign do Portal do Cliente',
        code: 'PRJ-003',
        description: 'Redesign completo da experiência digital do portal de autoatendimento do cliente, com foco em UX e mobile-first.',
        status: Status.COMPLETED,
        progress: 100,
        healthScore: 100,
        deadline: addDays(-15),
        budgetTotal: 120000,
        budgetUsed: 115000,
        responsible: 'Ana Paula Ferreira',
        category: 'Design Digital',
        clientName: 'Omega Serviços S.A.',
        clientEmail: 'digital@omegaservicos.com.br',
        tags: ['ux', 'web', 'portal'],
        priority: Priority.MEDIUM,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Auditoria de Segurança LGPD',
        code: 'PRJ-004',
        description: 'Auditoria completa de conformidade com a Lei Geral de Proteção de Dados, incluindo mapeamento de dados e plano de ação.',
        status: Status.DELAYED,
        progress: 25,
        healthScore: 38,
        deadline: addDays(-10),
        budgetTotal: 85000,
        budgetUsed: 42000,
        responsible: 'Ricardo Oliveira',
        category: 'Compliance',
        clientName: 'Sigma Healthcare',
        clientEmail: 'compliance@sigmahc.com.br',
        tags: ['lgpd', 'segurança', 'compliance'],
        priority: Priority.CRITICAL,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Programa de Capacitação RH 2024',
        code: 'PRJ-005',
        description: 'Desenvolvimento e implementação de trilhas de aprendizagem para liderança, soft skills e competências técnicas.',
        status: Status.ON_TRACK,
        progress: 80,
        healthScore: 91,
        deadline: addDays(60),
        budgetTotal: 45000,
        budgetUsed: 36000,
        responsible: 'Ana Paula Ferreira',
        category: 'Recursos Humanos',
        clientName: 'Epsilon Corp',
        clientEmail: 'rh@epsiloncorp.com.br',
        tags: ['rh', 'treinamento', 'liderança'],
        priority: Priority.MEDIUM,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Integração CRM Salesforce',
        code: 'PRJ-006',
        description: 'Integração do Salesforce com o sistema de gestão financeira e automação do funil de vendas com pipelines personalizados.',
        status: Status.AT_RISK,
        progress: 55,
        healthScore: 61,
        deadline: addDays(21),
        budgetTotal: 160000,
        budgetUsed: 98000,
        responsible: 'Carlos Mendes',
        category: 'CRM',
        clientName: 'Zeta Soluções Financeiras',
        clientEmail: 'operacoes@zetafin.com.br',
        tags: ['salesforce', 'crm', 'vendas'],
        priority: Priority.HIGH,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Dashboard de Business Intelligence',
        code: 'PRJ-007',
        description: 'Desenvolvimento de dashboards estratégicos no Power BI com integração de múltiplas fontes de dados para tomada de decisão.',
        status: Status.PAUSED,
        progress: 30,
        healthScore: 70,
        deadline: addDays(120),
        budgetTotal: 75000,
        budgetUsed: 22000,
        responsible: 'Ricardo Oliveira',
        category: 'Business Intelligence',
        clientName: 'Theta Varejo Nacional',
        clientEmail: 'dados@thetavarejo.com.br',
        tags: ['bi', 'power-bi', 'analytics'],
        priority: Priority.LOW,
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id,
        name: 'Lançamento Produto Beta v2.0',
        code: 'PRJ-008',
        description: 'Estratégia de go-to-market e lançamento da versão 2.0 do produto SaaS, incluindo campanha de marketing e onboarding.',
        status: Status.ON_TRACK,
        progress: 90,
        healthScore: 95,
        deadline: addDays(7),
        budgetTotal: 55000,
        budgetUsed: 51000,
        responsible: 'Carlos Mendes',
        category: 'Produto',
        clientName: 'Iota Tech Startups',
        clientEmail: 'ceo@iotatech.com.br',
        tags: ['produto', 'saas', 'marketing'],
        priority: Priority.HIGH,
      },
    }),
  ]);

  // Criar tarefas para cada projeto
  const taskData = [
    // PRJ-001 - Migração AWS
    { projectId: projects[0].id, title: 'Auditoria da infraestrutura atual', done: true },
    { projectId: projects[0].id, title: 'Definição da arquitetura AWS', done: true },
    { projectId: projects[0].id, title: 'Migração do banco de dados RDS', done: true },
    { projectId: projects[0].id, title: 'Configuração de VPC e subnets', done: false, assignee: 'Ana Paula Ferreira' },
    { projectId: projects[0].id, title: 'Deploy das aplicações em ECS', done: false, assignee: 'Ricardo Oliveira' },
    { projectId: projects[0].id, title: 'Configuração de monitoramento CloudWatch', done: false },

    // PRJ-002 - SAP S/4HANA
    { projectId: projects[1].id, title: 'Blueprint e mapeamento de processos', done: true },
    { projectId: projects[1].id, title: 'Configuração módulo FI - Financeiro', done: true },
    { projectId: projects[1].id, title: 'Migração de dados legados', done: false, assignee: 'Carlos Mendes' },
    { projectId: projects[1].id, title: 'Testes de integração SAP', done: false },
    { projectId: projects[1].id, title: 'Treinamento de usuários-chave', done: false },

    // PRJ-004 - LGPD
    { projectId: projects[3].id, title: 'Mapeamento de dados pessoais', done: true },
    { projectId: projects[3].id, title: 'Análise de riscos de privacidade', done: false, assignee: 'Ricardo Oliveira' },
    { projectId: projects[3].id, title: 'Elaboração do plano de ação', done: false },
    { projectId: projects[3].id, title: 'Implementação de controles técnicos', done: false },

    // PRJ-008 - Lançamento
    { projectId: projects[7].id, title: 'Plano de comunicação finalizado', done: true },
    { projectId: projects[7].id, title: 'Landing page do produto publicada', done: true },
    { projectId: projects[7].id, title: 'Campanhas de email marketing', done: true },
    { projectId: projects[7].id, title: 'Webinar de lançamento gravado', done: true },
    { projectId: projects[7].id, title: 'Press release enviado para mídia', done: false, assignee: 'Carlos Mendes' },
  ];

  await prisma.task.createMany({ data: taskData });

  // Criar logs de auditoria
  await prisma.auditLog.createMany({
    data: [
      {
        projectId: projects[0].id,
        userId: editor.id,
        action: 'updated_progress',
        oldValue: '50',
        newValue: '65',
        createdAt: addDays(-2),
      },
      {
        projectId: projects[1].id,
        userId: owner.id,
        action: 'changed_status',
        oldValue: 'ON_TRACK',
        newValue: 'AT_RISK',
        createdAt: addDays(-1),
      },
      {
        projectId: projects[3].id,
        userId: owner.id,
        action: 'changed_status',
        oldValue: 'ON_TRACK',
        newValue: 'DELAYED',
        createdAt: addDays(-5),
      },
      {
        projectId: projects[7].id,
        userId: editor.id,
        action: 'updated_progress',
        oldValue: '85',
        newValue: '90',
        createdAt: addDays(-1),
      },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`   Tenant: ${tenant.name} (slug: ${tenant.slug})`);
  console.log(`   Usuários: ${owner.email} (OWNER), ${editor.email} (EDITOR), ${viewer.email} (VIEWER)`);
  console.log(`   Projetos: ${projects.length} projetos criados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
