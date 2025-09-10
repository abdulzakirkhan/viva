// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";

// const sample = [
//   { name: "Transaction", value: 181, color: "#7C3AED" }, // purple
//   { name: "Desserts", value: 70,  color: "#D6B25E" },    // gold
//   { name: "Sides",     value: 68,  color: "#E5E7EB" },   // light gray
// ];

// function Card({ children, title }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
      
//       {children}
//     </div>
//   );
// }

// export default function HotSellingPackageChart({
//   data = sample,
//   title = "Hot Selling Package",
// }) {
//   const RAD = Math.PI / 180;

//   // Choose a readable label color for each slice
//   const textFillFor = (hex) => {
//     if (!hex) return "#111827";
//     const c = hex.replace("#", "");
//     const r = parseInt(c.substring(0, 2), 16);
//     const g = parseInt(c.substring(2, 4), 16);
//     const b = parseInt(c.substring(4, 6), 16);
//     // perceived luminance
//     const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
//     return L < 150 ? "#FFFFFF" : "#111827";
//   };

//   // Custom label renderer (keeps label within the slice)
//   const renderLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percent,
//     index,
//   }) => {
//     const r = innerRadius + (outerRadius - innerRadius) * 0.55; // move a bit inward to avoid clipping
//     const x = cx + r * Math.cos(-midAngle * RAD);
//     const y = cy + r * Math.sin(-midAngle * RAD);

//     const name = data[index].name;
//     const value = data[index].value;
//     const pct = Math.round(percent * 100);
//     const fill = textFillFor(data[index].color);

//     return (
//       <text
//         x={x}
//         y={y}
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={11}
//         fill={fill}
//       >
//         <tspan x={x} y={y} fontWeight="600">
//           {name}
//         </tspan>
//         <tspan x={x} dy="1.1em" fill={fill === "#FFFFFF" ? "#F9FAFB" : "#6B7280"}>
//           {value} ({pct}%)
//         </tspan>
//       </text>
//     );
//   };

//   return (
//     <Card title={title}>
//       <div className="h-72 relative">
//         {/* soft background glow like the mock */}
//         <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-gray-100 pointer-events-none" />
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             {/* subtle drop shadow behind pie */}
//             <defs>
//               <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
//                 <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
//                 <feOffset in="blur" dx="0" dy="4" result="offset" />
//                 <feMerge>
//                   <feMergeNode in="offset" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//             </defs>

//             <Pie
//               data={data}
//               dataKey="value"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               innerRadius={0}      // solid pie (not donut) like your screenshot
//               outerRadius={95}
//               paddingAngle={2}
//               startAngle={90}      // rotate so the big purple sits on the right-ish
//               endAngle={-270}
//               labelLine={false}
//               label={renderLabel}
//               isAnimationActive={false}
//               stroke="#FFFFFF"
//               strokeWidth={2}
//               filter="url(#pieShadow)"
//             >
//               {data.map((entry, i) => (
//                 <Cell key={`cell-${i}`} fill={entry.color} />
//               ))}
//             </Pie>

//             <Tooltip
//               formatter={(v, n) => [`${v}`, n]}
//               contentStyle={{
//                 borderRadius: 12,
//                 border: "1px solid #E5E7EB",
//               }}
//             />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// }


// HotSellingPackageChart.jsx  (react-chartjs-2 v5.3.0)

import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ---------- utils (text contrast) ---------- */
const hexToRgb = (hex) => {
  const m = hex.replace("#", "");
  const v = parseInt(m.length === 3 ? m.split("").map(c => c + c).join("") : m, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};
const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const n = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
};

/* ---------- plugin: labels inside slices (scoped) ---------- */
const insideLabels = {
  id: "insideLabels",
  afterDatasetDraw(chart, args) {
    if (!["pie", "doughnut"].includes(chart.config.type) || args.index !== 0) return;

    const ds = chart.data.datasets?.[0];
    const meta = chart.getDatasetMeta(0);
    if (!ds || !meta?.data?.length) return;

    const total = ds.data.reduce((a, b) => a + b, 0);
    const { ctx } = chart;

    meta.data.forEach((arc, i) => {
      const { x, y } = arc.getCenterPoint();
      const value = ds.data[i];
      const pct = Math.round((value / total) * 100);
      const label = chart.data.labels[i];
      const color = ds.backgroundColor[i];
      const dark = luminance(color) > 0.7;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dark ? "#111827" : "#FFFFFF"; // gray-900 or white
      // title
      ctx.font = "600 12px Inter, ui-sans-serif, system-ui";
      ctx.fillText(label, x, y - 8);
      // value + pct (slightly lighter on light slices)
      ctx.font = "600 11px Inter, ui-sans-serif, system-ui";
      ctx.fillStyle = dark ? "#6B7280" : "#F9FAFB"; // gray-500 vs near-white
      ctx.fillText(`${value} (${pct}%)`, x, y + 8);
      ctx.restore();
    });
  },
};

/* ---------- sample data (same as your Recharts example) ---------- */
const sample = [
  { name: "Transaction", value: 181, color: "#7C3AED" }, // purple
  { name: "Desserts",    value: 70,  color: "#D6B25E" }, // gold
  { name: "Sides",       value: 68,  color: "#E5E7EB" }, // light gray
];

function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
      {children}
    </div>
  );
}

export default function HotSellingPackageChart({
  data = sample,
  title = "Hot Selling Package",
}) {
  const labels = data.map(d => d.name);
  const values = data.map(d => d.value);
  const colors = data.map(d => d.color);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#FFFFFF",
        borderWidth: 2,     // white stroke like Recharts example
        spacing: 2,         // slight gap between slices (px)
        // hoverOffset: 4,  // optional hover pop-out
      },
    ],
  }), [labels, values, colors]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // Rotate so the biggest slice (first item) starts on the right (≈Recharts startAngle=90)
    rotation: Math.PI / 2,       // 90°
    circumference: 2 * Math.PI,  // full circle
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = values.reduce((a, b) => a + b, 0);
            const v = ctx.parsed;
            const pct = Math.round((v / total) * 100);
            return ` ${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  }), [values]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>

      <div className="relative h-72">
        {/* soft background glow like your mock */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-gray-100 pointer-events-none" />
        {/* pie (plugin only on this chart) */}
        <Pie data={chartData} options={options} plugins={[insideLabels]} />
      </div>
    </Card>
  );
}
