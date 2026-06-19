import React, { useMemo } from 'react';
import { Box, Center, Text, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import BarChart from 'components/charts/BarChart';

export default function ProductCategorySummaryChart({ categories = [] }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const isDark = useColorModeValue(false, true);

  const { series, options } = useMemo(() => {
    const topCategories = [...categories]
      .sort((a, b) => (b.totalStock || 0) - (a.totalStock || 0))
      .slice(0, 6);

    return {
      series: [
        { name: 'Tồn kho', data: topCategories.map((item) => Number(item.totalStock || 0)) },
        { name: 'Sản phẩm', data: topCategories.map((item) => Number(item.productCount || 0)) },
      ],
      options: {
        chart: { type: 'bar', toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#F97316', '#14B8A6'],
        plotOptions: { bar: { columnWidth: '46%', borderRadius: 5 } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: topCategories.map((item) => item.categoryName || 'Khác'),
          labels: { rotate: -20, trim: true, style: { colors: textColorSecondary, fontSize: '11px' } },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          tickAmount: 4,
          labels: {
            style: { colors: textColorSecondary },
            formatter: (val) => Math.round(Number(val || 0)).toLocaleString('vi-VN'),
          },
        },
        grid: { borderColor: gridColor, strokeDashArray: 4 },
        legend: { position: 'top', labels: { colors: textColorSecondary } },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: { formatter: (val) => Math.round(Number(val || 0)).toLocaleString('vi-VN') },
        },
      },
    };
  }, [categories, gridColor, isDark, textColorSecondary]);

  if (!categories.length) {
    return (
      <Card justify="center" align="center" h="100%" minH="360px">
        <Center py={8}>
          <Text color="gray.500">Chưa có dữ liệu danh mục</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card w="100%" h="100%" p="20px">
      <Text color={textColor} fontSize="xl" fontWeight="700" mb="4px">
        Tồn kho theo danh mục
      </Text>
      <Text color={textColorSecondary} fontSize="sm" mb="16px">
        Số sản phẩm và tổng tồn kho của các danh mục đang bán
      </Text>
      <Box minH="300px" w="full">
        <BarChart chartData={series} chartOptions={options} height={320} />
      </Box>
    </Card>
  );
}
