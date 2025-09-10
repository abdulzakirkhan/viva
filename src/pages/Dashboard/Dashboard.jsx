import { ArrowDown, ArrowUp } from "../../assets/svgs";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Tooltip, Legend
} from "chart.js";
import { Bar, Doughnut, Chart } from "react-chartjs-2";
import { ChartBar, HotSellingPackagePie, Loader } from "../../Components";
import { logOut } from "../../redux/auth/authSlice";
import { useSelector } from "react-redux";
import { useGetAllUsersKpisQuery, useGetKpisWeeklySeriesQuery } from "../../redux/analyticsModule/analyticsModuleApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

/* ----------- helpers (Chart.js) ----------- */

// Spark bar (mini) – one dark column + rest violet, no axes/grid/labels
const sparkData = (series = [], highlightIndex = 3) => ({
  labels: series.map((_, i) => i + 1),
  datasets: [
    {
      data: series,
      backgroundColor: series.map((_, i) => (i === highlightIndex ? "#1F2937" : "#8B5CF6")),
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 8,
    },
  ],
});
const sparkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false, grid: { display: false }, ticks: { display: false } },
    y: { display: false, grid: { display: false }, ticks: { display: false } },
  },
};

// const comboData = {
//   labels: months,
//   datasets: [
//     {
//       type: "bar",
//       label: "Bars",
//       data: [28,22,30,18,26,14,10,80,20,65,12,32],
//       backgroundColor: "#E0E7FF",
//       borderRadius: 10,
//       borderSkipped: false,
//     },
//     {
//       type: "line",
//       label: "Line",
//       data: [40,20,48,60,15,10,80,50,72,48,20,42],
//       borderColor: "#7C3AED",
//       pointRadius: 0,
//       borderWidth: 4,
//       tension: 0.4,
//     },
//   ],
// };

// const comboOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
//   scales: {
//     x: {
//       grid: { display: false },
//       ticks: { color: "#9CA3AF" },
//     },
//     y: {
//       suggestedMax: 90,
//       ticks: { color: "#9CA3AF", stepSize: 10 },
//       grid: { color: "#EEF2FF" },
//     },
//   },
// };

// Doughnut (Hot Selling Package)
const pieData = {
  labels: ["Enterprise", "Pro", "Plus"],
  datasets: [
    {
      data: [181, 68, 70],
      backgroundColor: ["#8B5CF6", "#E5E7EB", "#FACC15"],
      borderWidth: 0,
    },
  ],
};
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "left", labels: { boxWidth: 10 } },
    tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}` } },
  },
  cutout: 70, // inner radius
};

/* ---------- small components ---------- */
const Card = ({ children }) => (
  <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    {children}
  </div>
);

const KpiCard = ({ title, subtitle, value, delta, up, data, highlightIndex = 3 }) => {
  return (

    <Card>
      <div className="flex flex-col">
        <div className="h-24">
          <p className="text-sm font-semibold text-[#9C4EDC]">{title}</p>
          {subtitle && <p className="text-md font-semibold text-gray-900/80 -mt-0.5">{subtitle}</p>}
          <div className="mt-3 text-4xl font-semibold text-gray-900 leading-none">{value}</div>
        </div>

        <div className={`flex items-baseline ${!delta && "justify-end"} justify-between`}>
          {delta && (
            <div
              className={`flex gap-1 items-center text-sm font-medium ${
                up ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {up ? <img src={ArrowUp} alt="" /> : <img src={ArrowDown} alt="" />}
              <span className="text-lg">{delta}</span>
            </div>
          )}

          {/* sparkline */}
          <div className="relative w-28 h-20">
            <Bar data={sparkData(data, highlightIndex)} options={sparkOptions} />
          </div>
        </div>
      </div>
    </Card>
  )
};





/* ---------- page ---------- */
export default function Dashboard() {

  const { data, error, isLoading } = useGetAllUsersKpisQuery();
  const { data: weeklyData, error: weeklyError, isLoading: weeklyLoading } = useGetKpisWeeklySeriesQuery();



  const active =data?.active;
  const blocked =data?.blocked;
  const cancelled =data?.cancelled;
  const inactive = data?.inactive;
  const scheduledCancel= data?.scheduledCancel;
  // const active =data?.active

  const activeData =weeklyData?.active;
  const cancelledData =weeklyData?.cancelled;
  const inactiveData =weeklyData?.inactive;
  const scheduledCancelData =weeklyData?.scheduledCancel;
  const kpis = [
    { title: "Total Active user", subtitle: "(Subscribed)", value: active?.total, delta: active?.wowDeltaPct + "%", up:  active?.wowDeltaPct > 0, data: activeData },
    { title: "Total non Active user", subtitle: "(Not Subscribed)", value: inactive?.total, delta: inactive?.wowDeltaPct + "%", up: scheduledCancel?.wowDeltaPct > 0, data: inactiveData },
    { title: "Scheduled Cancel", subtitle: "", value: scheduledCancel?.total, delta: scheduledCancel?.wowDeltaPct + "%", up: scheduledCancel?.wowDeltaPct > 0, data: scheduledCancelData },
    { title: "Cancel Subscription", subtitle: "", value: cancelled?.total, delta: cancelled?.wowDeltaPct + "%", up: cancelled?.wowDeltaPct > 0, data: cancelledData},
  ];

  if(isLoading || weeklyLoading){
    return <Loader />
  }

  return (
    <main className="min-h-screen px-4 py-6 lg:px-8 bg-[#F5F7F9] dark:bg-gray-950">
      {/* KPI row */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5 mt-6">
        <div className="xl:col-span-3">

          <ChartBar />
        </div>
        <div className="xl:col-span-2">
          <HotSellingPackagePie />
        </div>
      </section>
    </main>
  );
}
