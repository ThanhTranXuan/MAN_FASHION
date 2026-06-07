import React, { useEffect, useState } from 'react';
import { HStack, Button, Input, useColorModeValue } from '@chakra-ui/react';
import { useAppToast } from 'utils/ToastHelper';

function Pagination({ page, totalPages, onPageChange, isDisabled = false }) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(page + 1);
  const toast = useAppToast();

  const activeColor = useColorModeValue('brand.500', 'navy.700');

  useEffect(() => {
    setInputValue(page + 1);
  }, [page]);

  const pageNumbers = [];
  const delta = 2;

  let start = Math.max(1, page + 1 - delta);
  let end = Math.min(totalPages, page + 1 + delta);

  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const handleGoToPage = () => {
    if (isDisabled) return;
    const n = Number(inputValue);
    if (n >= 1 && n <= totalPages) {
      onPageChange(n - 1);
      setShowInput(false);
    } else {
      toast.error('Invalid page number');
    }
  };

  const handlePageChange = (nextPage) => {
    if (isDisabled || nextPage === page) return;
    onPageChange(nextPage);
  };

  return (
    <HStack
      spacing={2}
      justify="center"
      mt={4}
      flexWrap="wrap"
      rowGap={2}
      px={{ base: 2, md: 0 }}
    >
      {/* Prev */}
      {page > 0 && (
        <Button size="sm" isDisabled={isDisabled} onClick={() => handlePageChange(page - 1)}>
          &lt;
        </Button>
      )}

      {/* First page */}
      {start > 1 && (
        <>
          <Button size="sm" isDisabled={isDisabled} onClick={() => handlePageChange(0)}>
            1
          </Button>
          {start > 2 && (
            <Button size="sm" isDisabled={isDisabled} onClick={() => setShowInput(true)}>
              ...
            </Button>
          )}
        </>
      )}

      {/* Page numbers around current page */}
      {pageNumbers.map((p) => (
        <Button
          key={p}
          size="sm"
          bg={p === page + 1 ? activeColor : 'transparent'}
          isDisabled={isDisabled}
          onClick={() => handlePageChange(p - 1)}
          color={p === page + 1 ? 'white' : 'grey.500'}
        >
          {p}
        </Button>
      ))}

      {/* Last page */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <Button size="sm" isDisabled={isDisabled} onClick={() => setShowInput(true)}>
              ...
            </Button>
          )}
          <Button size="sm" isDisabled={isDisabled} onClick={() => handlePageChange(totalPages - 1)}>
            {totalPages}
          </Button>
        </>
      )}

      {/* Next */}
      {page < totalPages - 1 && (
        <Button size="sm" isDisabled={isDisabled} onClick={() => handlePageChange(page + 1)}>
          &gt;
        </Button>
      )}

      {/* Input for ... */}
      {showInput && (
        <Input
          size="sm"
          w="50px"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGoToPage();
          }}
          onBlur={() => setShowInput(false)}
        />
      )}
    </HStack>
  );
}

export default Pagination;
