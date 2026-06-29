import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import MiniCalendar from "components/calendar/MiniCalendar";

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date) => {
  const selectedDate = Array.isArray(date) ? date[0] : date;
  if (!(selectedDate instanceof Date) || Number.isNaN(selectedDate.getTime())) return "";

  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DatePicker({ label, value, onChange, isRequired = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");


  let displayValue = "";
  if (value) {
    const parsed = parseLocalDate(value);
    if (parsed && !Number.isNaN(parsed.getTime())) {
      displayValue = parsed.toLocaleDateString("en-GB");
    }
  }


  const handleSelectDate = (date) => {
    const formatted = formatLocalDate(date);
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <FormControl isRequired={isRequired}>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        closeOnBlur
      >
        <PopoverTrigger>
          <InputGroup>
            <Input
              readOnly
              value={displayValue}
              placeholder="Select date"
              cursor="pointer"
              color={textColor}
              onClick={() => setIsOpen(true)}
            />
            <InputRightElement>
              <IconButton
                size="sm"
                icon={<CalendarIcon />}
                aria-label="Select date"
                onClick={() => setIsOpen(!isOpen)}
              />
            </InputRightElement>
          </InputGroup>
        </PopoverTrigger>

        <PopoverContent w="auto" border="none" boxShadow="xl" p={2}>
          <PopoverBody>
            <MiniCalendar
              value={parseLocalDate(value) || new Date()}
              onChange={handleSelectDate}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </FormControl>
  );
}
