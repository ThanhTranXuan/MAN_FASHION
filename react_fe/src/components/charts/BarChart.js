import React from 'react';
import Chart from 'react-apexcharts';

const BarChart = ({ chartData = [], chartOptions = {}, height = 260 }) => (
  <Chart
    options={chartOptions}
    series={chartData}
    type="bar"
    width="100%"
    height={height}
  />
);

export default BarChart;
