import { ArrowDown, ArrowUp } from "../../assets/svgs";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Tooltip, Legend
} from "chart.js";
import { Bar} from "react-chartjs-2";
import { ChartBar, HotSellingPackagePie, Loader, SubscriptionInsightsCard } from "../../Components";
import { useGetAllUsersKpisQuery, useGetKpisWeeklySeriesQuery } from "../../redux/analyticsModule/analyticsModuleApi";
import { useGetHighestAndlowestSubscribersPackageQuery } from "../../redux/packagesModule/packagesModuleApi";


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);


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
  const { data: highestLowestData, error: highestLowestError, isLoading: highestLowestLoading } = useGetHighestAndlowestSubscribersPackageQuery();


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

  const newData = highestLowestData?.highest || {}

  const lowest=highestLowestData?.lowest || {}


  if(isLoading || weeklyLoading || highestLowestLoading){
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



      {/* {highestLowestData} */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-6 mt-6">
        <div className="w-full lg:col-span-3">
          <SubscriptionInsightsCard highest={newData} title={"Most Subscribed Package"} />
        </div>
        <div className="w-full lg:col-span-3">
          <SubscriptionInsightsCard highest={lowest} title={"Least Subscribed Package"} />
        </div>
      </section>
    </main>
  );
}