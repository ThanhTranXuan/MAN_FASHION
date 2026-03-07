import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
} from '@chakra-ui/react';

export default function Detail({ isOpen, onClose, blog, textColor, bgColor }) {
  return (
    <Modal isOpen={isOpen} isCentered onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>{blog?.title}</ModalHeader>
        <ModalBody>
          <Box
            dangerouslySetInnerHTML={{ __html: blog?.content || '' }}
            sx={{
              color: textColor,
              lineHeight: 1.6,
              img: { maxW: '100%', borderRadius: 'md', my: 2 },
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
