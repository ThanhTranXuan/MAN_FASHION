
import React, { useState, useEffect } from 'react';
import { Box, Portal, useDisclosure } from '@chakra-ui/react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Sidebar from 'components/sidebar/Sidebar.js';
import Navbar from 'components/navbar/NavbarAdmin.js';
import Footer from 'components/footer/FooterAdmin.js';
import { SidebarContext } from 'contexts/SidebarContext';
import routes from 'routes.js';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import { AnimatePresence, motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Dashboard(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useAppToast();
  const { user, isAuthenticated, loadingUser } = useUser();
  const [accessibleRoutes, setAccessibleRoutes] = useState([]);




  useEffect(() => {
    if (loadingUser) return;

    if (!isAuthenticated || !user) {
      toast.warning('Please sign in first.');
      navigate('/auth/sign-in', { replace: true });
      return;
    }

    const roleName = user.roleName || user.role?.name;

    if (!['ADMIN', 'EMPLOYEE'].includes(roleName)) {
      toast.error(
        'Access denied. You do not have permission to access the admin panel.',
      );
      navigate('/user', { replace: true });
      return;
    }

    const employeeAllowed = [
      '/category-management',
      '/product-management',
      '/order-management',
      '/return-management',
      '/coupon-management',
      '/chat-support',
      '/review-management',
    ];

    const filtered = routes.filter((r) => {
      if (r.layout !== '/admin') return false;
      if (r.hideInSidebar) return false;

      if (roleName === 'ADMIN') return true;
      if (roleName === 'EMPLOYEE') return employeeAllowed.includes(r.path);

      return false;
    });

    setAccessibleRoutes(filtered);
  }, [user, isAuthenticated, loadingUser, navigate, toast]);




  const getActiveRoute = (routes, pathname) => {
    for (let route of routes) {
      if (route.collapse || route.category) {
        const active = getActiveRoute(route.items, pathname);
        if (active) return active;
      } else if (route.layout + route.path === pathname) {
        return route;
      }
    }
    return null;
  };

  const activeRoute = getActiveRoute(routes, location.pathname);




  const getRoutesComponents = (routes) =>
    routes.map((route, key) => {
      if (route.layout === '/admin') {
        return <Route path={route.path} element={route.component} key={key} />;
      }
      if (route.collapse || route.category) {
        return getRoutesComponents(route.items);
      }
      return null;
    });




  return (
    <Box>
      <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
        <Sidebar
          routes={accessibleRoutes}
          display="none"
          {...rest}
        />

        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflowX="hidden"
          overflowY="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc(100% - 280px)' }}
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText="Trendify Admin"
                brandText={activeRoute?.name || 'Dashboard'}
                secondary={activeRoute?.secondary || false}
                message={activeRoute?.messageNavbar || ''}
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          <AnimatePresence mode="wait" initial={false}>
            <MotionBox
              key={location.pathname}
              mx="auto"
              p={{ base: '12px', sm: '16px', md: '24px' }}
              pt={{ base: '124px', sm: '116px', md: '104px' }}
              minH="calc(100vh - 120px)"
              maxW="100%"
              sx={{ overflowAnchor: 'none' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                {getRoutesComponents(accessibleRoutes)}
                <Route
                  path="/"
                  element={
                    (user?.roleName || user?.role?.name) === 'EMPLOYEE' ? (
                      <Navigate to="/admin/order-management" replace />
                    ) : (
                      <Navigate to="/admin/default" replace />
                    )
                  }
                />
              </Routes>
            </MotionBox>
          </AnimatePresence>

          <Footer />
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
