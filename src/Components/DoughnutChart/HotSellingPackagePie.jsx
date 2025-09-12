import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useGetPackagesSubscribersPieChartQuery } from "../../redux/packagesModule/packagesModuleApi";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ---------- utils for text contrast ---------- */
const hexToRgb = (hex) => {
  const m = hex.replace("#", "");
  const v = parseInt(
    m.length === 3 ? m.split("").map((c) => c + c).join("") : m,
    16
  );
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};
const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const n = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
};

/* ---------- plugin: show % inside slices ---------- */
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
      if (pct < 10) return;
      const percentageLabel = `${pct}%`;

      const color = ds.backgroundColor[i];
      const dark = luminance(color) > 0.7;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dark ? "#111827" : "#FFFFFF";
      ctx.font = "600 13px Inter, ui-sans-serif, system-ui";
      ctx.fillText(percentageLabel, x, y);
      ctx.restore();
    });
  },
};

export default function HotSellingPackagePie() {
  const { data: pieChartData } = useGetPackagesSubscribersPieChartQuery();

  const groups = pieChartData?.groups || [];
  const labels = groups.map((g) => g.displayLabel);
  const values = groups.map((g) => g.count);
  const colors = ["#8B5CF6", "#E5E7EB", "#FACC15", "#22D3EE", "#F87171"];

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 0,
        },
      ],
    }),
    [labels, values]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // hide default legend
      },
    }),
    []
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700">
        Hot Selling Package
      </h3>

      {/* Custom Legend */}
      <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        {groups.map((g, i) => (
          <div key={g.key} className="flex items-center space-x-2">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-gray-700">{g.displayLabel}</span>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="relative h-[285px]">
        <Pie data={data} options={options} plugins={[insideLabels]} />
      </div>
    </div>
  );
}
