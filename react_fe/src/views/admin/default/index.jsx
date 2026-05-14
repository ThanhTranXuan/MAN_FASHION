import React, { useEffect, useState } from 'react';
import {
  Box,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Button,
  Flex,
} from '@chakra-ui/react';
import {
  MdAttachMoney,
  MdShoppingCart,
  MdPeople,
  MdWork,
  MdInventory,
  MdCategory,
  MdDownload, // icon export
} from 'react-icons/md';
import IconBox from 'components/icons/IconBox';
import MiniStatistics from 'components/card/MiniStatistics';
import TotalRevenue from 'views/admin/default/components/TotalRevenue';
import TotalCustomers from 'views/admin/default/components/TotalCustomers';
import TopProductsTable from 'views/admin/default/components/TopProductsTable';
import EmployeeStanding from 'views/admin/default/components/EmployeeStanding';
import ReportService from 'services/ReportService';
import { formatCompact } from 'utils/FormatHelper';
import { useAppToast } from 'utils/ToastHelper'; // 🔥 dùng ToastHelper

export default function UserReports() {
  const brandColor = useColorModeValue('brand.500', 'white');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const toast = useAppToast(); // 🔥 thay cho useToast

  // ⚡ State
  const [overview, setOverview] = useState(null);

  const [revenueSummary, setRevenueSummary] = useState(null);
  const [customerSummary, setCustomerSummary] = useState(null);

  const [revenueTrend, setRevenueTrend] = useState([]);
  const [customerTrend, setCustomerTrend] = useState([]);

  const [topProducts, setTopProducts] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);

  // 🔥 loading state cho export
  const [exporting, setExporting] = useState(false);

  // ⚙️ Load Data
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [
          overviewRes,
          revenueSummaryRes,
          customerSummaryRes,
          revenueTrendRes,
          customerTrendRes,
          topProductsRes,
          topEmployeesRes,
        ] = await Promise.all([
          ReportService.getOverview(),
          ReportService.getRevenueSummary(),
          ReportService.getCustomerSummary(),
          ReportService.getRevenueTrend(),
          ReportService.getCustomerTrend(),
          ReportService.getTopProductsMonthly(),
          ReportService.getTopEmployeesMonthly(),
        ]);

        setOverview(overviewRes.data);
        setRevenueSummary(revenueSummaryRes.data);
        setCustomerSummary(customerSummaryRes.data);
        setRevenueTrend(revenueTrendRes.data);
        setCustomerTrend(customerTrendRes.data);
        setTopProducts(topProductsRes.data);
        setTopEmployees(topEmployeesRes.data);
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
        toast.error('Tải bảng điều khiển thất bại. Vui lòng thử lại sau.');
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🧾 Handler export PDF
  const handleExportPdf = async () => {
    try {
      setExporting(true);

      // Nếu muốn chọn tháng/năm riêng, truyền { month, year } vào đây
      const res = await ReportService.exportMonthlyRevenuePdf();

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      link.href = url;
      link.download = `monthly-revenue-${month}-${year}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Báo cáo doanh thu đã được tải xuống.');
    } catch (err) {
      console.error('❌ Failed to export PDF:', err);
      toast.error('Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      {/* Header + nút export */}
      <Flex justify="flex-end" mb="10px">
        <Button
          leftIcon={<MdDownload />}
          colorScheme="brand"
          variant="solid"
          size="sm"
          onClick={handleExportPdf}
          isLoading={exporting}
          loadingText="Đang xuất..."
          color="white"
        >
          Xuất PDF Doanh Thu
        </Button>
      </Flex>

      {/* 🧭 1️⃣ Tổng quan */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, '2xl': 6 }}
        gap="20px"
        mb="20px"
      >
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdAttachMoney} color={brandColor} />
              }
            />
          }
          name="Tổng Doanh Thu"
          value={`${formatCompact(overview?.totalRevenue || 0)} ₫`}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon
                  w="32px"
                  h="32px"
                  as={MdShoppingCart}
                  color={brandColor}
                />
              }
            />
          }
          name="Tổng Đơn Hàng"
          value={overview?.totalOrders || 0}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdPeople} color={brandColor} />}
            />
          }
          name="Khách Hàng Mới"
          value={overview?.totalCustomers || 0}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdWork} color={brandColor} />}
            />
          }
          name="Nhân Viên"
          value={overview?.totalEmployees || 0}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdInventory} color={brandColor} />
              }
            />
          }
          name="Sản Phẩm"
          value={overview?.totalProducts || 0}
        />

        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={
                <Icon w="32px" h="32px" as={MdCategory} color={brandColor} />
              }
            />
          }
          name="Danh Mục"
          value={overview?.totalCategories || 0}
        />
      </SimpleGrid>

      {/* 💰 2️⃣ Doanh thu + Khách hàng */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px" mb="20px">
        <TotalRevenue summary={revenueSummary} trend={revenueTrend} />
        <TotalCustomers summary={customerSummary} trend={customerTrend} />
      </SimpleGrid>

      {/* 📊 3️⃣ Top Products + Top Employees */}
      <SimpleGrid
        columns={{ base: 1, md: 5 }}
        gap="20px"
        mb="20px"
        alignItems="stretch"
      >
        {/* 🛍 TOP PRODUCTS - chiếm 2/3 */}
        <Box h="100%" gridColumn={{ base: 'span 1', md: 'span 3' }}>
          <TopProductsTable products={topProducts} />
        </Box>

        {/* 👷 TOP EMPLOYEES - chiếm 1/3 */}
        <Box h="100%" gridColumn={{ base: 'span 1', md: 'span 2' }}>
          <EmployeeStanding employees={topEmployees} />
        </Box>
      </SimpleGrid>
    </Box>
  );
}
