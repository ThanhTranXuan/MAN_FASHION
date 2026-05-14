import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdCategory,
  MdShoppingCart,
  MdAssignmentReturn,
  MdLocalOffer,
  MdArticle,
  MdDashboard,
  MdChat,
} from 'react-icons/md';
import { FaUsersCog, FaUserTie } from 'react-icons/fa';
import { BsBoxSeam } from 'react-icons/bs';

// Admin Imports
import MainDashboard from 'views/admin/default';
import UserPage from 'views/admin/users';
import EmployeePage from 'views/admin/employees';
import CategoryPage from 'views/admin/categories';
import ProductPage from 'views/admin/products';
import CouponPage from 'views/admin/coupons';
import BlogPage from 'views/admin/blogs';
import OrderPage from 'views/admin/orders';
import ReturnPage from 'views/admin/returns';
import ChatPage from 'views/admin/chat';

// User Imports
import Home from 'views/user/home';
import Profile from 'views/user/profile';
import ProductList from 'views/user/product';
import ProductDetail from 'views/user/product/detail';
import Order from 'views/user/order';
import BlogListPage from 'views/user/blog';
import BlogDetailPage from 'views/user/blog/detail';
import ResultPage from 'views/user/order/ResultPage';

// Auth Imports
import SignIn from 'views/auth/signIn';
import SignUp from 'views/auth/signUp';
import CheckEmailNotice from 'views/auth/checkEmailNotice';
import ResetPassword from 'views/auth/resetPassword';
import ForgotPassword from 'views/auth/forgotPassword';

const routes = [
  // ================== ADMIN ROUTES ==================
  {
    name: 'Bảng Điều Khiển',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdDashboard} w="20px" h="20px" color="inherit" />,
    component: <MainDashboard />,
    adminOnly: true, // 👈 chỉ ADMIN thấy
  },
  {
    name: 'Quản Lý Người Dùng',
    layout: '/admin',
    path: '/user-management',
    icon: <Icon as={FaUsersCog} w="20px" h="20px" color="inherit" />,
    component: <UserPage />,
    adminOnly: true,
  },
  {
    name: 'Quản Lý Nhân Viên',
    layout: '/admin',
    path: '/employee-management',
    icon: <Icon as={FaUserTie} w="20px" h="20px" color="inherit" />,
    component: <EmployeePage />,
    adminOnly: true,
  },
  {
    name: 'Quản Lý Danh Mục',
    layout: '/admin',
    path: '/category-management',
    icon: <Icon as={MdCategory} w="20px" h="20px" color="inherit" />,
    component: <CategoryPage />,
  },
  {
    name: 'Quản Lý Sản Phẩm',
    layout: '/admin',
    path: '/product-management',
    icon: <Icon as={BsBoxSeam} w="20px" h="20px" color="inherit" />,
    component: <ProductPage />,
  },
  {
    name: 'Quản Lý Đơn Hàng',
    layout: '/admin',
    path: '/order-management',
    icon: <Icon as={MdShoppingCart} w="20px" h="20px" color="inherit" />,
    component: <OrderPage />,
  },
  {
    name: 'Quản Lý Hoàn Trả',
    layout: '/admin',
    path: '/return-management',
    icon: <Icon as={MdAssignmentReturn} w="20px" h="20px" color="inherit" />,
    component: <ReturnPage />,
  },
  {
    name: 'Quản Lý Mã Giảm Giá',
    layout: '/admin',
    path: '/coupon-management',
    icon: <Icon as={MdLocalOffer} w="20px" h="20px" color="inherit" />,
    component: <CouponPage />,
    adminOnly: true,
  },
  {
    name: 'Quản Lý Bài Viết',
    layout: '/admin',
    path: '/blog-management',
    icon: <Icon as={MdArticle} w="20px" h="20px" color="inherit" />,
    component: <BlogPage />,
    adminOnly: true,
  },
  {
    name: 'Hỗ Trợ Chat',
    layout: '/admin',
    path: '/chat-support',
    icon: <Icon as={MdChat} w="20px" h="20px" color="inherit" />,
    component: <ChatPage />,
  },

  // ================== USER ROUTES ==================
  {
    name: 'Home',
    layout: '/user',
    path: '/home',
    component: <Home />,
  },
  {
    name: 'Hồ Sơ',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Blog',
    layout: '/user',
    path: '/blog',
    component: <BlogListPage />,
  },
  {
    name: 'Blog Detail',
    layout: '/user',
    path: '/blog/detail/:slug',
    component: <BlogDetailPage />,
  },
  {
    name: 'Product List',
    layout: '/user',
    path: '/product',
    component: <ProductList />,
  },
  {
    name: 'Product List',
    layout: '/user',
    path: '/product/:categorySlug',
    component: <ProductList />,
  },
  {
    name: 'Product Detail',
    layout: '/user',
    path: '/product/detail/:slug',
    component: <ProductDetail />,
  },
  {
    name: 'Payment',
    layout: '/user',
    path: '/payment',
    component: <Order />,
  },

  {
    name: 'Order Result',
    layout: '/user',
    path: '/order/result',
    component: <ResultPage />
  },

  // ================== AUTH ROUTES ==================
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    component: <SignIn />,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    component: <SignUp />,
  },
  {
    name: 'Forgot Password',
    layout: '/auth',
    path: '/forgot-password',
    component: <ForgotPassword />,
  },
  {
    name: 'Check Email',
    layout: '/auth',
    path: '/check-email',
    component: <CheckEmailNotice />,
  },
  {
    name: 'Reset Password',
    layout: '/auth',
    path: '/reset-password',
    component: <ResetPassword />,
  },
];

export default routes;
