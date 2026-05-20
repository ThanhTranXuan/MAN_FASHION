import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import LineChart from 'components/charts/LineChart';
import { MdOutlineCalendarToday } from 'react-icons/md';
import { formatCurrencyVND, formatCompact } from 'utils/FormatHelper';

export default function TotalRevenue({ summary, trend }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'navy.800');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const lineColor = useColorModeValue('#7551FF', '#422AFB');

  // 👇 cho biết đang dark / light để truyền sang Apex
  const isDark = useColorModeValue(false, true);

  const { series, options } = useMemo(() => {
    if (!trend || trend.length === 0)
      return {
        series: [{ name: 'Doanh thu', data: [] }],
        options: { xaxis: { categories: [] } },
      };

    const labels = trend.map((d) => `${d.month}/${d.year.toString().slice(2)}`);
    const revenues = trend.map((d) => d.value);

    return {
      series: [{ name: 'Doanh thu', data: revenues }],
      options: {
        chart: {
          type: 'line',
          toolbar: { show: false },
          zoom: { enabled: false },
          foreColor: textColorSecondary, // màu chữ mặc định cho chart
        },
        stroke: { curve: 'smooth', width: 3 },
        colors: [lineColor],
        xaxis: {
          categories: labels,
          labels: { style: { colors: textColorSecondary } },
          // tắt cái tooltip nhỏ dưới trục X nếu thấy vướng
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          tickAmount: 4,
          labels: {
            style: { colors: textColorSecondary },
            formatter: (val) => {
              if (val === null || val === undefined || isNaN(val)) return '';
              return formatCompact(Number(val));
            },
          },
        },
        grid: { borderColor: gridColor, strokeDashArray: 4 },
        tooltip: {
          theme: isDark ? 'dark' : 'light', // 🔥 tooltip chuyển đúng theme
          style: {
            fontSize: '12px',
            color: isDark ? '#F7FAFC' : '#1A202C', // màu chữ trong tooltip
          },
          y: {
            formatter: (val) => formatCurrencyVND(val),
          },
        },
        markers: {
          size: revenues.length <= 1 ? 6 : 4,
          hover: { size: 6 },
        },
      },
    };
  }, [trend, lineColor, textColorSecondary, gridColor, isDark]);

  if (!summary || !trend || trend.length === 0) {
    return (
      <Card justify="center" align="center" h="260px">
        <Text color="gray.500">Không có dữ liệu</Text>
      </Card>
    );
  }

  return (
    <Card w="100%" h="full" p="20px">
      <Flex justify="space-between" align="center" mb="10px">
        <Button
          bg={boxBg}
          fontSize="sm"
          fontWeight="500"
          color={textColorSecondary}
          borderRadius="7px"
          leftIcon={<MdOutlineCalendarToday />}
        >
          6 tháng gần đây
        </Button>
        <Badge
          colorScheme={summary.growthRate >= 0 ? 'green' : 'red'}
          borderRadius="full"
          px="3"
          py="1"
        >
          {summary.growthRate >= 0 ? '+' : ''}
          {summary.growthRate.toFixed(1)}%
        </Badge>
      </Flex>

      <Text color={textColor} fontSize="34px" fontWeight="700">
        {formatCurrencyVND(summary.currentMonthRevenue || 0)}
      </Text>
      <Text color={textColorSecondary} fontSize="sm" mb="20px">
        Doanh thu tháng này
      </Text>

      <Box minH="220px" w="full">
        <LineChart series={series} options={options} />
      </Box>
    </Card>
  );
}
