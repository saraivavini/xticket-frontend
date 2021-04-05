import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Stack,
  Text,
  Heading,
  StackDivider,
  Button,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useEffect } from "react";

export default function CheckoutSuccess() {
  const router = useRouter();
  const routerQuery = router.query;

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 5000);
  }, []);

  return (
    <Flex w="100vw" h="100vh" p="4" justify="center" alignItems="center">
      <Flex
        width={480}
        bg="gray.50"
        p="8"
        borderRadius={8}
        flexDir="column"
        alignItems="center"
        justify="center"
      >
        <CheckCircleIcon color="green" w={16} h={16} mb="6" />
        <Heading size="lg" mb="4">
          Pagamento Confirmado!
        </Heading>
        <Text color="gray.600">
          Você será redirecionado para a página inicial em alguns segundos...
        </Text>
      </Flex>
    </Flex>
  );
}
