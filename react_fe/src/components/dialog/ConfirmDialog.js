import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
}  from '@chakra-ui/react';


function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title || 'Xác Nhận'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{message || 'Bạn có chắc không?'}</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" opacity={0.6} mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme="brand"
            color={'white'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Xác Nhận
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ConfirmDialog;
