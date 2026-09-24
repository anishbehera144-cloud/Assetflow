"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsItem = {
  name: string;
  available: number;
  assigned: number;
  repair: number;
  total: number;
};

type AssetAnalyticsProps = {
  categories: AnalyticsItem[];
  departments: AnalyticsItem[];
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0f17]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-semibold text-white">
        {label}
      </p>

      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-8 text-[11px]"
          >
            <span className="text-slate-500">
              {item.name}
            </span>

            <span className="font-semibold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetAnalytics({
  categories,
  departments,
}: AssetAnalyticsProps) {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">

      {/* Assets by Category */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white">
            Assets by Category
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Inventory distribution across asset categories
          </p>
        </div>

        <div className="h-[320px] w-full">
          {categories.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              No category data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={categories}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: "rgba(255,255,255,0.025)",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "10px",
                    color: "#64748b",
                  }}
                />

                <Bar
                  dataKey="available"
                  name="Available"
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="assigned"
                  name="Assigned"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="repair"
                  name="Repair"
                  fill="#fbbf24"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Assets by Department */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white">
            Assets by Department
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Current inventory distribution across departments
          </p>
        </div>

        <div className="h-[320px] w-full">
          {departments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              No department data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={departments}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 10,
                  left: 15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={85}
                  tick={{
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: "rgba(255,255,255,0.025)",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "10px",
                    color: "#64748b",
                  }}
                />

                <Bar
                  dataKey="available"
                  name="Available"
                  fill="#22d3ee"
                  radius={[0, 4, 4, 0]}
                />

                <Bar
                  dataKey="assigned"
                  name="Assigned"
                  fill="#34d399"
                  radius={[0, 4, 4, 0]}
                />

                <Bar
                  dataKey="repair"
                  name="Repair"
                  fill="#fbbf24"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}