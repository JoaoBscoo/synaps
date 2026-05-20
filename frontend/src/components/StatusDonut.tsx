import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardData, Status, STATUS_LABELS, STATUS_COLORS } from '../types';

interface StatusDonutProps {
  byStatus: DashboardData['byStatus'];
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.06) return null;
  const x = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
  const y = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e2e8f0" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StatusDonut({ byStatus }: StatusDonutProps) {
  const data = (Object.entries(byStatus) as [Status, number][])
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status],
      value: count,
      color: STATUS_COLORS[status],
    }));

  if (data.length === 0) {
    return (
      <div className="card h-64 flex items-center justify-center">
        <p className="text-muted text-sm">Nenhum projeto ainda</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-[--text] mb-4">Distribuição por Status</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1520',
              border: '1px solid rgba(99,179,237,0.12)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(value: number) => [value, 'Projetos']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
