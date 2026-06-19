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
import BarChart from 'components/charts/BarChart';
import { MdOutlineCalendarToday } from 'react-icons/md';

export default function TotalCustomers({ summary, trend }) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const barColor = useColorModeValue('#14B8A6', '#38BDF8');
  const isDark = useColorModeValue(false, true);

  const { series, options } = useMemo(() => {
    if (!trend || trend.length === 0) {
      return {
        series: [{ name: 'Khách hàng mới', data: [] }],
        options: { xaxis: { categories: [] } },
      };
    }

    const labels = trend.map((d) => `${d.month}/${d.year.toString().slice(2)}`);
    const customers = trend.map((d) => d.value);

    return {
      series: [{ name: 'Khách hàng mới', data: customers }],
      options: {
        chart: {
          type: 'bar',
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '42%',
            borderRadius: 6,
          },
        },
        dataLabels: { enabled: false },
        colors: [barColor],
        xaxis: {
          categories: labels,
          labels: { style: { colors: textColorSecondary } },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          tickAmount: 4,
          labels: {
            style: { colors: textColorSecondary },
            formatter: (val) => {
              if (val === null || val === undefined || isNaN(val)) return '';
              return Math.round(Number(val)).toLocaleString('vi-VN');
            },
          },
        },
        grid: { borderColor: gridColor, strokeDashArray: 4 },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          y: {
            formatter: (val) =>
              `${Math.round(Number(val || 0)).toLocaleString('vi-VN')} khách hàng`,
          },
        },
      },
    };
  }, [trend, barColor, textColorSecondary, gridColor, isDark]);

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
          colorScheme={summary.growthCount >= 0 ? 'green' : 'red'}
          borderRadius="full"
          px="3"
          py="1"
        >
          {summary.growthCount >= 0 ? '+' : ''}
          {summary.growthCount} mới
        </Badge>
      </Flex>

      <Text color={textColor} fontSize="34px" fontWeight="700">
        {summary.currentNewCustomers?.toLocaleString('vi-VN') || 0}
      </Text>
      <Text color={textColorSecondary} fontSize="sm" mb="20px">
        Khách hàng mới trong tháng
      </Text>

      <Box minH="220px" w="full">
        <BarChart chartData={series} chartOptions={options} height={260} />
      </Box>
    </Card>
  );
}
