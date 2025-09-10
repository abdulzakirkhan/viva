import { useMemo, useState, useEffect } from "react";
import { Chart } from "react-chartjs-2";
import { getCurrentDate, getDateNDaysAgo } from "../../helper";
import { useGetDailyUserQuery } from "../../redux/analyticsModule/analyticsModuleApi";

export default function ChartBar() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [from, setFrom] = useState(getDateNDaysAgo(7));
  const [to, setTo] = useState(getCurrentDate());
  
  // Fetch data - this hook must always be called unconditionally
  const { data, error, isLoading, isFetching, refetch } = useGetDailyUserQuery({
    from: from,
    to: to
  });

  // Format data after the hook
  const labels = useMemo(() => 
    data?.days?.map(d => new Date(d).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    })) || [], 
    [data]
  );

  const bars = data?.counts || [];
  const line = data?.counts || [];
  const hi = useMemo(() => 
    bars.length > 0 ? bars.indexOf(Math.max(...bars)) : -1, 
    [bars]
  );

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        type: "bar",
        order: 1,
        data: bars,
        borderSkipped: false,
        barThickness: 16,
        borderRadius: 12,
        backgroundColor: (ctx) => {
          const { chart, dataIndex } = ctx;
          if (!chart.chartArea) return "rgba(124,58,237,.2)";
          if (dataIndex === hi) {
            const { top, bottom } = chart.chartArea;
            const g = chart.ctx.createLinearGradient(0, top, 0, bottom);
            g.addColorStop(0, "#4C1D95");
            g.addColorStop(1, "#7C3AED");
            return g;
          }
          return "rgba(124,58,237,.20)";
        },
      },
      {
        type: "line",
        order: 2,
        data: line,
        borderColor: "rgba(124,58,237,.22)",
        borderWidth: 3,
        tension: 0.4,
        cubicInterpolationMode: "monotone",
        pointRadius: (ctx) => (ctx.dataIndex === hi ? 3 : 0),
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#7C3AED",
        pointBorderWidth: 2,
      },
    ],
  }), [labels, bars, line, hi]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9CA3AF" } },
      y: { 
        suggestedMax: bars.length > 0 ? Math.max(...bars) + 5 : 10, 
        ticks: { color: "#9CA3AF", stepSize: 5 }, 
        grid: { color: "#EEF2FF", drawBorder: false } 
      },
    },
  }), [bars]);

  const today = new Date().toISOString().split("T")[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00Z").toISOString();
  };

  // Handle loading and error states in the render, not with early returns
  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart data</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center mb-3 justify-between">
        <h3 className="text-gray-700 font-medium">User Activity (Daily)</h3>
        <div className="flex items-center gap-2">
          <div className="felx flex-col">
            <label htmlFor="starDate">From</label>
            <input
              id="starDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setFrom(formatDate(e.target.value));
              }}
              className="w-full rounded-lg border border-gray-300 py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="felx flex-col">
            <label htmlFor="endDate">To</label>
            <input
              id="endDate"
              type="date"
              max={today}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setTo(formatDate(e.target.value));
              }}
              className="w-full rounded-lg border border-gray-300 py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="h-80">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
}