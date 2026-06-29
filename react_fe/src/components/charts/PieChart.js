import React from "react";
import ReactApexChart from "react-apexcharts";

export default function PieChart({ chartData }) {
  if (!chartData) return null;


  let series = [];
  let labels = [];

  if (Array.isArray(chartData)) {

    series = chartData.map((d) => d.revenue);
    labels = chartData.map((d) => d.categoryName);
  } else if (chartData.datasets && chartData.labels) {

    series = chartData.datasets[0].data;
    labels = chartData.labels;
  } else {
    return null;
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
        const value = series[opts.seriesIndex] || 0;
        return `${label}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}`;
      },
      style: { fontSize: "12px" },
    },
    tooltip: {
      y: { formatter: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) },
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
