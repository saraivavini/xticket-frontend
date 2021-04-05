import {
  Flex,
  Button,
  Stack,
  Radio,
  RadioGroup,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Slide,
  SlideFade,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NumberInput } from "../components/Form/NumberInput";
import { Input } from "../components/Form/Input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface AirFaresAvailabilityFormData {
  formType: "AIRFARE" | "ACCOMMODATIONS";
  type: "SOMENTE_IDA" | "IDA_E_VOLTA";
  origin?: string;
  destination: string;
  departure_date: Date;
  return_date?: Date;
  bedroom_number?: string;
  passengers: {
    adults: number;
    children: number;
    babies: number;
  };
}

const airFareAvailabilityFormSchema = yup.object().shape({
  formType: yup.string().required(),
  type: yup.string().when("formType", {
    is: (formType) => {
      return !!formType && formType === "AIRFARE";
    },
    then: yup.string().required("Campo obrigatório"),
  }),
  destination: yup.string().required("Campo obrigatório"),
  origin: yup.string().when("formType", {
    is: (formType) => {
      return !!formType && formType === "AIRFARE";
    },
    then: yup.string().required("Campo obrigatório"),
  }),
  departure_date: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .required("Campo obrigatório"),
  return_date: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .when(["type", "departure_date"], {
      is: (type, departure_date) => {
        return type === "IDA_E_VOLTA" && !!departure_date;
      },
      then: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .min(yup.ref("departure_date"), "Data de retorno inválida")
        .required("Campo obrigatório"),
    }),
  passengers: yup.object().shape({
    adults: yup.string(),
    children: yup.string(),
    babies: yup.string(),
  }),
  bedroom_number: yup.string().when("formType", {
    is: (formType) => {
      return !!formType && formType === "ACCOMMODATIONS";
    },
    then: yup.string().required("Campo obrigatório"),
  }),
});

export default function Home() {
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(airFareAvailabilityFormSchema),
  });
  const router = useRouter();

  const [airfareType, setAirfareType] = useState("IDA_E_VOLTA");
  const [formType, setFormType] = useState("AIRFARE");

  console.log(errors);

  console.log(getValues());

  useEffect(() => {
    setValue("type", airfareType);
    setValue("return_date", "");
  }, [airfareType]);

  useEffect(() => {
    setValue("formType", formType);
  }, [formType]);

  const handleSearchAirFaresAvailability: SubmitHandler<AirFaresAvailabilityFormData> = (
    data
  ) => {
    console.log(data);

    router.push({
      pathname: "/availability",
      query: {
        type: data.type,
        origin: data.origin,
        destination: data.destination,
        departure_date: String(data.departure_date),
        return_date: String(data.return_date),
        bedroom_number: data.bedroom_number,
        "passengers.adults": data.passengers.adults,
        "passengers.children": data.passengers.children,
        "passengers.babies": data.passengers.babies,
        formType: data.formType,
      },
    });
  };

  const renderForm = (formType: "AIRFARE" | "ACCOMMODATIONS") => {
    return (
      <>
        {formType === "AIRFARE" && (
          <RadioGroup
            value={airfareType}
            {...register("type")}
            onChange={(newValue) => setAirfareType(newValue)}
            mb="4"
          >
            <Stack direction={["column", "row"]} spacing="8">
              <Radio value="IDA_E_VOLTA">Ida e volta</Radio>
              <Radio value="SOMENTE_IDA">Somente ida</Radio>
            </Stack>
          </RadioGroup>
        )}
        <Stack spacing="6">
          <Stack direction={["column", "row"]} spacing="4">
            {formType === "AIRFARE" && (
              <Input
                name="origin"
                label="Origem"
                error={errors.origin}
                {...register("origin")}
              />
            )}
            <Input
              name="destination"
              label="Destino"
              error={errors.destination}
              {...register("destination")}
            />
            {formType === "ACCOMMODATIONS" && (
              <NumberInput
                name="bedroom_number"
                label="Número de quartos"
                defaultValue={1}
                min={1}
                max={6}
                {...register("bedroom_number")}
              />
            )}
          </Stack>
          <Stack direction={["column", "row"]} spacing="4">
            <Input
              type="date"
              name="departure_date"
              label="Data de partida"
              error={errors.departure_date}
              {...register("departure_date")}
            />
            {(airfareType === "IDA_E_VOLTA" ||
              formType === "ACCOMMODATIONS") && (
              <Input
                type="date"
                name="return_date"
                label="Data de retorno"
                error={errors.return_date}
                {...register("return_date")}
              />
            )}
          </Stack>
          <Stack direction={["column", "row"]} spacing="8">
            <NumberInput
              name="passengers.adults"
              label="Adultos"
              defaultValue={1}
              min={1}
              {...register("passengers.adults")}
            />
            <NumberInput
              name="passengers.children"
              label="Crianças"
              min={0}
              defaultValue={0}
              {...register("passengers.children")}
            />
            <NumberInput
              name="passengers.babies"
              label="Bebês"
              min={0}
              defaultValue={0}
              {...register("passengers.babies")}
            />
          </Stack>
          <Button
            type="submit"
            mt="6"
            colorScheme="yellow"
            isLoading={isSubmitting}
            onClick={handleSubmit(handleSearchAirFaresAvailability)}
          >
            Buscar
          </Button>
        </Stack>
      </>
    );
  };

  return (
    <Flex w="100vw" h="100vh" justify="center" alignItems="center">
      <Flex
        width="100%"
        maxWidth={600}
        bg="gray.50"
        p="8"
        borderRadius={8}
        flexDir="column"
      >
        <Tabs
          isFitted
          variant="line"
          isLazy
          onChange={(index) => {
            clearErrors();
            reset(
              index === 0 && {
                type: "IDA_E_VOLTA",
              }
            );

            setFormType(index === 0 ? "AIRFARE" : "ACCOMMODATIONS");
          }}
        >
          <TabList>
            <Tab>Passagem aérea</Tab>
            <Tab>Hospedagem</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SlideFade in={formType === "AIRFARE"} offsetX="30px" offsetY="0">
                {renderForm("AIRFARE")}
              </SlideFade>
            </TabPanel>
            <TabPanel>
              <SlideFade
                in={formType === "ACCOMMODATIONS"}
                offsetX="30px"
                offsetY="0"
              >
                {renderForm("ACCOMMODATIONS")}
              </SlideFade>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Flex>
  );
}
