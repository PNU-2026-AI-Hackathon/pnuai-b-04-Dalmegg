import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { weeklyEnvironment } from '../mock/dashboard'

export function EnvironmentChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyEnvironment} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e9efec" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
          <YAxis domain={[20, 28]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 12px 30px rgb(15 23 42 / 0.08)' }}
            formatter={(value) => [`${value}°C`, '온도']}
          />
          <Area type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={3} fill="url(#temperatureFill)" activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
