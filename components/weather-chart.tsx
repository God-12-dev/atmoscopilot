"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Point { label: string; value: number; }
interface Props {
  label: string;
  data: Point[];
  color?: string;
  type?: "area" | "bar" | "line";
  unit?: string;
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-elevated text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value}{unit ?? ""}</p>
    </div>
  );
}

export function WeatherChart({ label, data, color = "#0693D6", type = "area", unit }: Props) {
  const ChartComponent = type === "bar" ? BarChart : type === "line" ? LineChart : AreaChart;
  const gridColor = "hsl(var(--chart-grid))";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={160}>
          <ChartComponent data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: color, strokeWidth: 1, opacity: 0.4 }} />
            {type === "area" && (
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${label})`}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color }}
              />
            )}
            {type === "bar" && (
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
            )}
            {type === "line" && (
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
