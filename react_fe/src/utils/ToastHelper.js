import { useToast }  from '@chakra-ui/react';
import { useMemo } from 'react';

export const useAppToast = () => {
  const toast = useToast();

  return useMemo(() => {
    const translateMessage = (title) => {
      const messages = {
        'error.system.general': 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
        'product.variant.add.success': 'Thêm biến thể thành công',
        'product.variant.update.success': 'Cập nhật biến thể thành công',
        'product.variant.delete.success': 'Xóa biến thể thành công',
      };

      return messages[title] || title;
    };

    const show = (
      title,
      status = 'info',
      duration = 3000,
      position = 'bottom-right',
    ) => {
      toast({
        title: translateMessage(title),
        status,
        duration,
        isClosable: true,
        position,
      });
    };

    return {
      show,
      success: (title) => show(title, 'success'),
      error: (title) => show(title, 'error'),
      warning: (title) => show(title, 'warning'),
      info: (title) => show(title, 'info'),
    };
  }, [toast]);
};
