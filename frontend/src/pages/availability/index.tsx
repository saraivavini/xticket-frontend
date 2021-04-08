import React, { useState } from "react";
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
import { backendApi } from "../../services/backend-api";

export default function Availability() {
  const router = useRouter();
  const routerQuery = router.query;

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  useEffect(() => {
    const departure_date =
      !!routerQuery.departure_date &&
      format(new Date(String(routerQuery.departure_date)), "yyyy-MM-dd");
    const return_date =
      !!routerQuery.return_date &&
      routerQuery.return_date != "null" &&
      format(new Date(String(routerQuery.return_date)), "yyyy-MM-dd");

    if (routerQuery.formType === "AIRFARE") {
      backendApi
        .get(`airfares/availability`, {
          params: {
            type: routerQuery.type,
            departure_date,
            return_date: !!return_date ? return_date : departure_date,
            origin: routerQuery.origin,
            destination: routerQuery.destination,
            "passengers[adults]": routerQuery["passengers.adults"] || 0,
            "passengers[children]": routerQuery["passengers.children"] || 0,
            "passengers[babies]": routerQuery["passengers.babies"] || 0,
          },
        })
        .then((resp) => {
          const result = resp.data.map((item) => {
            return {
              firm: item.firm,
              price: item.price,
            };
          });

          setBookingsResult(result);
        })
        .catch((error) => console.log(error.message));
    } else if (routerQuery.formType === "ACCOMMODATIONS") {
      backendApi
        .get(`accommodations/availability`, {
          params: {
            departure_date,
            return_date: !!return_date ? return_date : departure_date,
            destination: routerQuery.destination,
            bedrooms_number: routerQuery.bedroom_number,
            "guests[adults]": routerQuery["passengers.adults"] || 0,
            "guests[children]": routerQuery["passengers.children"] || 0,
            "guests[babies]": routerQuery["passengers.babies"] || 0,
          },
        })
        .then((resp) => {
          const result = resp.data.map((item) => {
            return {
              firm: item.firm || "",
              price: item.price,
            };
          });

          setBookingsResult(result);
        })
        .catch((error) => console.log(error.message));
    }
  }, []);

  const bookingSearch = {
    formType: routerQuery.formType,
    type: routerQuery.type,
    departure_date:
      !!routerQuery.departure_date && String(routerQuery.departure_date),
    return_date: !!routerQuery.return_date && String(routerQuery.return_date),
    origin: routerQuery.origin,
    destination: routerQuery.destination,
    bedroom_number: routerQuery.bedroom_number,
    passengers: {
      adults: routerQuery["passengers.adults"] || 0,
      children: routerQuery["passengers.children"] || 0,
      babies: routerQuery["passengers.babies"] || 0,
    },
  };

  const [bookingsResult, setBookingsResult] = useState([]);

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
        <Stack bg="gray.100" p="8" borderRadius="md" alignItems="center">
          <Flex direction="column">
            <Stack alignItems="center" spacing="10" direction="row">
              <Stack alignItems="center" spacing="4" direction="row">
                {bookingSearch.formType === "AIRFARE" && (
                  <>
                    <Box>
                      <Heading size="sm" pb="1">
                        Origem
                      </Heading>
                      <Text>{bookingSearch.origin}</Text>
                    </Box>
                    <ArrowForwardIcon h={5} w={5} />
                  </>
                )}
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
                  <Text>
                    {!!bookingSearch.departure_date &&
                      formatDate(bookingSearch.departure_date)}
                  </Text>
                </Box>
                {(bookingSearch.type === "IDA_E_VOLTA" ||
                  bookingSearch.formType === "ACCOMMODATIONS") && (
                  <Box>
                    <Heading size="sm">Volta</Heading>
                    <Text>
                      {!!bookingSearch.return_date &&
                        formatDate(bookingSearch.return_date)}
                    </Text>
                  </Box>
                )}
              </Stack>
              <Stack alignItems="center" spacing="4" direction="row">
                <Box>
                  <Heading size="sm">
                    {bookingSearch.formType === "AIRFARE"
                      ? "Passageiros"
                      : "Hospedes"}
                  </Heading>
                  <Text>
                    {Number(bookingSearch.passengers.adults) +
                      Number(bookingSearch.passengers.children) +
                      Number(bookingSearch.passengers.babies)}
                  </Text>
                </Box>
                {bookingSearch.formType === "ACCOMMODATIONS" &&
                  bookingSearch.bedroom_number && (
                    <Box>
                      <Heading size="sm">Quartos</Heading>
                      <Text>{Number(bookingSearch.bedroom_number)}</Text>
                    </Box>
                  )}
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
                {/* <Heading size="md"></Heading> */}
                <Text>{String(b.firm).toUpperCase()}</Text>
              </Box>
              <Stack direction={["column", "row"]} spacing="16">
                <Box>
                  <Heading size="md">Total</Heading>
                  <Text>
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(b.price)}
                  </Text>
                </Box>
                <Box>
                  <Button
                    colorScheme="blue"
                    onClick={() => handlePurchase(b.price)}
                  >
                    Realizar pedido
                  </Button>
                </Box>
              </Stack>
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Flex>
  );
}
