import React, { forwardRef, ForwardRefRenderFunction } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  NumberInputProps as ChakraInputProps,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
} from "@chakra-ui/react";

interface IncrementInputProps extends ChakraInputProps {
  name: string;
  label?: string;
}

const NumberInputBase: ForwardRefRenderFunction<
  HTMLInputElement,
  IncrementInputProps
> = ({ name, label, onChange, ...rest }, ref) => {
  return (
    <FormControl>
      {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <HStack maxW="320px">
        <ChakraNumberInput id={name} name={name} variant="filled" {...rest}>
          <NumberInputField ref={ref} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </ChakraNumberInput>
      </HStack>
    </FormControl>
  );
};

export const NumberInput = forwardRef(NumberInputBase);
