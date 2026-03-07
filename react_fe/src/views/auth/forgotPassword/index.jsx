// views/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import AuthService from 'services/AuthService';

function ForgotPassword() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const toast = useAppToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.warning('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      await AuthService.forgotPassword(email);
      toast.success('Password reset email sent!');
      navigate('/auth/check-email');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="70vh"
        alignItems="center"
        justifyContent="flex-start"
        flexDirection="column"
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '5vh' }}
      >
        <Box>
          <Heading color={textColor} fontSize="32px" mb="10px">
            Forgot Password
          </Heading>
          <Text color={textColorSecondary} mb="24px">
            Enter your email address and we’ll send you a link to reset your
            password.
          </Text>

          <FormControl>
            <FormLabel color={textColor}>Email</FormLabel>
            <Input
              type="email"
              placeholder="mail@example.com"
              mb="24px"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={loading}
            />

            <Button
              w="100%"
              variant="brand"
              onClick={handleForgotPassword}
              isLoading={loading}
              loadingText="Sending..."
              spinner={<Spinner size="sm" />}
            >
              Send Reset Link
            </Button>
          </FormControl>
        </Box>
      </Flex>
    </DefaultAuth>
  );
}

export default ForgotPassword;
