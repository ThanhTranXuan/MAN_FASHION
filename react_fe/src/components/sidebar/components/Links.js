/* eslint-disable */
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Text,
  Circle,
  useColorModeValue,
} from '@chakra-ui/react';

import { useNotification } from 'contexts/NotificationContext';
import { useChat } from 'contexts/ChatContext';

export function SidebarLinks(props) {
  const { routes } = props;
  let location = useLocation();

  const { hasNewOrder, hasNewReturn } = useNotification();
  const { hasNewChat } = useChat(); // 🔴 NEW

  let activeColor = useColorModeValue('gray.700', 'white');
  let activeIcon = useColorModeValue('brand.500', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('brand.500', 'brand.400');

  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.category) {
        return (
          <>
            <Text
              fontSize={'md'}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{ sm: '10px', xl: '16px' }}
              pt="18px"
              pb="12px"
              key={index}
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </>
        );
      }

      if (route.layout !== '/admin') return null;

      // ================================
      // BADGE LOGIC
      // ================================
      const isOrderRoute = route.path === '/order-management';
      const isReturnRoute = route.path === '/return-management';

      // 👉 tùy path chat của bạn: '/chat', '/chat-support', ...
      const isChatRoute =
        route.path === '/chat' || route.path === '/chat-support';

      const showBadge =
        (isOrderRoute && hasNewOrder) ||
        (isReturnRoute && hasNewReturn) ||
        (isChatRoute && hasNewChat);

      return (
        <NavLink key={index} to={route.layout + route.path}>
          <Box>
            <HStack
              spacing={activeRoute(route.path) ? '22px' : '26px'}
              py="5px"
              ps="10px"
              position="relative"
            >
              <Flex w="100%" alignItems="center">
                {/* ICON */}
                <Box
                  color={
                    activeRoute(route.path.toLowerCase())
                      ? activeIcon
                      : textColor
                  }
                  me="18px"
                  display="flex"
                >
                  {route.icon}
                </Box>

                {/* LABEL */}
                <Text
                  me="auto"
                  color={
                    activeRoute(route.path.toLowerCase())
                      ? activeColor
                      : textColor
                  }
                  fontWeight={activeRoute(route.path) ? 'bold' : 'normal'}
                >
                  {route.name}
                </Text>

                {/* 🔥 BADGE */}
                {showBadge && (
                  <Circle size="10px" bg="brand.400" mr="8px" mb="12px" />
                )}
              </Flex>

              <Box
                h="36px"
                w="4px"
                bg={
                  activeRoute(route.path.toLowerCase())
                    ? brandColor
                    : 'transparent'
                }
                borderRadius="5px"
              />
            </HStack>
          </Box>
        </NavLink>
      );
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;
