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
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { format } from "date-fns";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import { useEffect } from "react";

export default function Availability() {
  const router = useRouter();
  const routerQuery = router.query;

  useEffect(() => {
    if (!!routerQuery.type) {
      router.push("/");
    }
  }, []);

  const bookingSearch = {
    type: routerQuery.type,
    departure_date: String(routerQuery.departure_date),
    return_date: String(routerQuery.return_date),
    origin: routerQuery.origin,
    destination: routerQuery.destination,
    passengers: {
      adults: routerQuery["passengers.adults"],
      children: routerQuery["passengers.children"],
      babies: routerQuery["passengers.babies"],
    },
  };

  const bookingsResult = [
    {
      cost: 1041.21,
    },
    {
      cost: 1588.9,
    },
    {
      cost: 1700,
    },
  ];

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  const handlePurchase = async (cost: number) => {
    try {
      const response = await api.post("/purchase", {
        type: bookingSearch.type,
        cost,
      });

      const { sessionId } = response.data;

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({
        sessionId,
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Flex w="100vw" h="100vh" p="4" justify="center" alignItems="center">
      <Flex
        width="100%"
        maxWidth={900}
        bg="gray.50"
        // p="8"
        borderRadius={8}
        flexDir="column"
      >
        <Stack bg="gray.100" p="8" borderRadius="md">
          <Flex direction="column">
            <Stack alignItems="center" spacing="10" direction="row">
              <Stack alignItems="center" spacing="4" direction="row">
                <Box>
                  <Heading size="sm" pb="1">
                    Origem
                  </Heading>
                  <Text>{bookingSearch.origin}</Text>
                </Box>
                <ArrowForwardIcon h={5} w={5} />
                <Box>
                  <Heading size="sm" pb="1">
                    Destino
                  </Heading>
                  <Text>{bookingSearch.destination}</Text>
                </Box>
              </Stack>
              <Stack alignItems="center" spacing="8" direction="row">
                <Box>
                  <Heading size="sm">Ida</Heading>
                  <Text>{formatDate(bookingSearch.departure_date)}</Text>
                </Box>
                <Box>
                  <Heading size="sm">Volta</Heading>
                  <Text>{formatDate(bookingSearch.return_date)}</Text>
                </Box>
              </Stack>
              <Stack alignItems="center" spacing="4" direction="row">
                <Box>
                  <Heading size="sm">Passageiros</Heading>
                  <Text>
                    {Number(bookingSearch.passengers.adults) +
                      Number(bookingSearch.passengers.children) +
                      Number(bookingSearch.passengers.babies)}
                  </Text>
                </Box>
              </Stack>
            </Stack>
          </Flex>
        </Stack>
        <Stack divider={<StackDivider borderColor="gray.200" />}>
          {bookingsResult.map((b, index) => (
            <Flex
              key={index}
              p="4"
              justifyContent="space-between"
              align="center"
            >
              <Box>
                <Heading size="md">Total</Heading>
                <Text>
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(b.cost)}
                </Text>
              </Box>
              <Box>
                <Button
                  colorScheme="blue"
                  onClick={() => handlePurchase(b.cost)}
                >
                  Realizar pedido
                </Button>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Flex>
  );
}
