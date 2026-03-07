import React from "react";
import ReactApexChart from "react-apexcharts";

export default function PieChart({ chartData }) {
  if (!chartData) return null;

  // 🧩 Nhận cả hai kiểu input: array hoặc object
  let series = [];
  let labels = [];

  if (Array.isArray(chartData)) {
    // Trường hợp là mảng {categoryName, revenue}
    series = chartData.map((d) => d.revenue);
    labels = chartData.map((d) => d.categoryName);
  } else if (chartData.datasets && chartData.labels) {
    // Trường hợp là object (Chart.js style)
    series = chartData.datasets[0].data;
    labels = chartData.labels;
  } else {
    return null; // fallback nếu dữ liệu không hợp lệ
  }

  const chartOptions = {
    chart: {
      type: "pie",
      toolbar: { show: false },
    },
    labels,
    legend: {
      position: "bottom",
      labels: { colors: "#A0AEC0" },
    },
    dataLabels: {
      formatter: (val, opts) => {
        const label = opts.w.globals.labels[opts.seriesIndex];
        const value = series[opts.seriesIndex]?.toFixed(2) || 0;
        return `${label}: $${value}`;
      },
      style: { fontSize: "12px" },
    },
    tooltip: {
      y: { formatter: (val) => `$${val.toFixed(2)}` },
    },
    colors: ["#3182CE", "#E53E3E", "#ECC94B"],
    stroke: { width: 1 },
  };

  return (
    <ReactApexChart
      options={chartOptions}
      series={series}
      type="pie"
      width="100%"
      height="300"
    />
  );
}
