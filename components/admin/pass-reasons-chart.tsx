'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

type ReasonBucket = { label: string; count: number }

const chartConfig = {
  count: { label: 'Passes', color: 'var(--color-primary)' },
}

export function PassReasonsChart({ data }: { data: ReasonBucket[] }) {
  if (data.length === 0) return (
    <p className="text-sm text-muted-foreground py-4 text-center">No pass feedback recorded yet.</p>
  )
  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={130}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--muted)' }} />
        <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
