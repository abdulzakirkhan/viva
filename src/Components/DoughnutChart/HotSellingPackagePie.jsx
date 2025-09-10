import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ---------- utils for text contrast ---------- */
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
    // Only for pie/doughnut & first dataset
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
      ctx.font = "600 12px Inter, ui-sans-serif, system-ui";
      ctx.fillText(label, x, y - 8);
      ctx.font = "600 11px Inter, ui-sans-serif, system-ui";
      ctx.fillText(`${value} (${pct}%)`, x, y + 8);
      ctx.restore();
    });
  },
};

export default function HotSellingPackagePie() {
  const labels = ["Enterprises", "Pro", "Plus"];
  const values = [181, 68, 70];
  const colors = ["#8B5CF6", "#E5E7EB", "#FACC15"]; // violet / light gray / yellow

  const data = useMemo(() => ({
    labels,
    datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
  }), []);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => {
            const total = values.reduce((a, b) => a + b, 0);
            const pct = Math.round((c.parsed / total) * 100);
            return ` ${c.label}: ${c.parsed} (${pct}%)`;
          },
        },
      },
    },
  }), []);

  // Hot Selling Package
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Hot Selling Package</h3>
      <div className="relative h-[355px]">
        {/* subtle glow like screenshot */}
        <div className="absolute right-6 bottom-6 w-24 h-24 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />
        {/* plugin only for this chart -> no effect on others */}
        <Pie data={data} options={options} plugins={[insideLabels]} />
      </div>
    </div>
  );
}