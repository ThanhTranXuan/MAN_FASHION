
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';

import PropTypes from 'prop-types';
import React from 'react';

import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function AuthIllustration(props) {
  const { children, illustrationBackground } = props;
  const navigate = useNavigate();
  const pageBg = useColorModeValue('fashion.pageBg', 'navy.900');
  const backColor = useColorModeValue('#111827', 'white');
  const orbBg = useColorModeValue('rgba(249,115,22,0.24)', 'rgba(253,186,116,0.12)');
  const backgroundOverlay = useColorModeValue(
    'linear-gradient(90deg, rgba(246,240,232,0.94) 0%, rgba(246,240,232,0.82) 48%, rgba(246,240,232,0.68) 100%)',
    'linear-gradient(90deg, rgba(11,20,55,0.96) 0%, rgba(11,20,55,0.88) 52%, rgba(11,20,55,0.76) 100%)',
  );

  return (
    <Flex position="relative" h="max-content" minH="100vh" bg={pageBg} overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        bgImage={`url(${illustrationBackground})`}
        bgSize="cover"
        bgPosition="center"
        opacity={0.42}
        filter="saturate(0.92)"
      />
      <Box position="absolute" inset={0} bg={backgroundOverlay} />
      <Box
        position="absolute"
        top="-160px"
        right="-120px"
        w="420px"
        h="420px"
        borderRadius="full"
        bg={orbBg}
        filter="blur(8px)"
      />
      <Flex
        h={{
          sm: 'initial',
          md: 'unset',
          lg: 'auto',
          xl: 'auto',
        }}
        w="100%"
        maxW={{ base: '100%', md: '1180px' }}
        mx="auto"
        px={{ base: 0, md: 6, xl: 0 }}
        ps={{ xl: 0 }}
        justifyContent="start"
        direction="column"
        position="relative"
        zIndex={1}
      >
        <Flex
          align="center"
          ps={{ base: '25px', lg: '0px' }}
          pt="50px"
          w="fit-content"
          onClick={() => navigate('/user/home')}
          _hover={{ cursor: 'pointer' }}
        >
          <Icon
            as={FaChevronLeft}
            me="12px"
            h="13px"
            w="8px"
            color={backColor}
          />
          <Text ms="0px" fontSize="md" color={backColor} fontWeight="800">
            Về trang chủ
          </Text>
        </Flex>
        {children}
        <Box
          display="none"
          h="100%"
          minH="100vh"
          w={{ lg: '50vw', '2xl': '44vw' }}
          position="absolute"
          right="0px"
        >
          <Flex w="100%" h="100%" position="relative">
            <Flex
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              bg="linear-gradient(135deg, #0B0B0B 0%, #111827 52%, #F97316 100%)"
              borderBottomLeftRadius={{ lg: '120px', xl: '200px' }}
              zIndex={0}
            />

            <Flex
              position="absolute"
              top={200}
              left={200}
              w="50%"
              h="50%"
              bgImage={`url(${illustrationBackground})`}
              bgSize="cover"
              bgPosition="center"
              zIndex={1}
              justify="center"
              align="end"
              display={{ lg: 'none', xl: 'flex' }}
            />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}


AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;
