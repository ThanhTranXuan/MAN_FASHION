
import React from 'react';
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
}  from '@chakra-ui/react';


export default function Footer() {
  const textColor = useColorModeValue('gray.400', 'white');
  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems={{
        base: 'center',
        xl: 'start',
      }}
      justifyContent="space-between"
      px={{ base: '30px', md: '50px' }}
      py="30px"
    >
      <Text
        color={textColor}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        mb={{ base: '20px', xl: '0px' }}
      >
        {' '}
        &copy; {1900 + new Date().getYear()}
        <Text as="span" fontWeight="500" ms="4px">
          Trendify
        </Text>
      </Text>
      <List display="flex">
        <ListItem




        >
          <Link
            fontWeight="500"
            color={textColor}
            href="mailto:trendify.store.vn@gmail.com"
          >
            Hỗ Trợ
          </Link>
        </ListItem>
        {



























}
      </List>
    </Flex>
  );
}
