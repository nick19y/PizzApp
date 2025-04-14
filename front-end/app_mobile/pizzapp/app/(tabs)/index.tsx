import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Image,
  ScrollView,
  Heading,
  Input,
  Icon,
  Pressable,
  Badge,
  Center,
  Divider,
  useToast
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Sample pizza data
const pizzas = [
  {
    id: 1,
    name: "Pepperoni",
    description: "Pizza clássica de pepperoni com queijo mussarela",
    price: 12.99,
    image: "https://via.placeholder.com/150",
    popular: true
  },
  {
    id: 2,
    name: "Margherita",
    description: "Tomates frescos, queijo mussarela e manjericão",
    price: 10.99,
    image: "https://via.placeholder.com/150",
    popular: false
  },
  {
    id: 3,
    name: "Suprema",
    description: "Carregada com pepperoni, calabresa, pimentão, azeitonas e cebolas",
    price: 14.99,
    image: "https://via.placeholder.com/150",
    popular: true
  },
  {
    id: 4,
    name: "Havaiana",
    description: "Presunto e abacaxi com queijo mussarela",
    price: 13.99,
    image: "https://via.placeholder.com/150",
    popular: false
  },
  {
    id: 5,
    name: "Vegetariana",
    description: "Cogumelos, pimentão, cebolas, azeitonas e tomates",
    price: 11.99,
    image: "https://via.placeholder.com/150",
    popular: false
  }
];

// Categories for pizza filtering
const categories = [
  "Todas",
  "Populares",
  "Vegetarianas",
  "Com Carne",
  "Especiais"
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [cart, setCart] = useState([]);
  const toast = useToast();

  const addToCart = (pizza) => {
    setCart([...cart, pizza]);
    toast.show({
      description: `${pizza.name} adicionada ao carrinho!`,
      duration: 2000,
      placement: "top"
    });
  };

  const filteredPizzas = selectedCategory === "Todas" 
    ? pizzas 
    : selectedCategory === "Populares" 
      ? pizzas.filter(pizza => pizza.popular) 
      : pizzas;

  return (
    <VStack flex={1} bg="white" safeArea>
      {/* Header */}
      <HStack px={6} pt={4} pb={2} justifyContent="space-between" alignItems="center">
        <VStack>
          <Text fontSize="sm" color="gray.500">Entregar em</Text>
          <HStack alignItems="center" space={1}>
            <Text fontSize="md" fontWeight="bold">Rua Principal, 123</Text>
            <Icon as={Ionicons} name="chevron-down" size="sm" color="red.500" />
          </HStack>
        </VStack>
        <Badge rounded="full" px={1} py={1} bg="red.100" alignSelf="flex-start">
          <Text color="red.500">{cart.length}</Text>
        </Badge>
      </HStack>

      {/* Search Bar */}
      <HStack px={6} py={2} space={2} alignItems="center">
        <Input
          flex={1}
          placeholder="Buscar pizzas..."
          borderRadius="full"
          bg="gray.100"
          py={2}
          px={4}
          InputLeftElement={
            <Icon as={Ionicons} name="search" size="sm" ml={3} color="gray.400" />
          }
        />
        <Icon as={Ionicons} name="options-outline" size="md" color="gray.700" />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          px={4} 
          py={4}
        >
          <HStack space={2}>
            {categories.map((category, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedCategory(category)}
              >
                <Box
                  py={2}
                  px={4}
                  bg={selectedCategory === category ? "red.500" : "gray.100"}
                  borderRadius="full"
                >
                  <Text
                    color={selectedCategory === category ? "white" : "gray.600"}
                    fontWeight={selectedCategory === category ? "bold" : "normal"}
                  >
                    {category}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>

        {/* Special Offer */}
        <Box mx={6} mb={6}>
          <Box
            bg="red.50"
            borderRadius="xl"
            p={4}
            overflow="hidden"
          >
            <HStack justifyContent="space-between">
              <VStack space={2} width="60%">
                <Box bg="red.500" alignSelf="flex-start" borderRadius="md" py={0.5} px={2}>
                  <Text color="white" fontSize="xs" fontWeight="bold">OFERTA ESPECIAL</Text>
                </Box>
                <Heading size="md">Compre 1 Leve 2</Heading>
                <Text fontSize="sm" color="gray.600">
                  Todas as segundas e terças em pizzas grandes
                </Text>
                <Pressable 
                  mt={2}
                  bg="red.500" 
                  borderRadius="lg" 
                  py={2} 
                  alignItems="center"
                  width="70%"
                >
                  <Text color="white" fontWeight="bold">Pedir Agora</Text>
                </Pressable>
              </VStack>
              <Center>
                <Image 
                  source={{ uri: "https://via.placeholder.com/150" }}
                  alt="Pizza da oferta especial"
                  size="lg"
                  borderRadius="full"
                />
              </Center>
            </HStack>
          </Box>
        </Box>

        {/* Popular Pizzas */}
        <VStack px={6} mb={6}>
          <HStack justifyContent="space-between" mb={4}>
            <Heading size="md">Pizzas Populares</Heading>
            <Text color="red.500" fontWeight="bold">Ver todas</Text>
          </HStack>

          {filteredPizzas.map((pizza) => (
            <Pressable key={pizza.id} mb={4} onPress={() => {}}>
              <HStack 
                bg="gray.50" 
                borderRadius="lg" 
                overflow="hidden" 
                shadow={1}
              >
                <Image 
                  source={{ uri: pizza.image }} 
                  alt={pizza.name}
                  size="md"
                  height={100}
                  width={100}
                />
                <VStack flex={1} p={3} justifyContent="space-between">
                  <VStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold" fontSize="md">{pizza.name}</Text>
                      {pizza.popular && (
                        <Box bg="amber.100" borderRadius="sm" py={0.5} px={1.5}>
                          <Text color="amber.700" fontSize="2xs">POPULAR</Text>
                        </Box>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt={1} numberOfLines={2}>
                      {pizza.description}
                    </Text>
                  </VStack>
                  <HStack justifyContent="space-between" alignItems="center" mt={2}>
                    <Text fontWeight="bold" color="red.500">R${pizza.price}</Text>
                    <Pressable 
                      bg="red.500" 
                      borderRadius="full" 
                      p={1.5}
                      onPress={() => addToCart(pizza)}
                    >
                      <Icon as={Ionicons} name="add" color="white" size="sm" />
                    </Pressable>
                  </HStack>
                </VStack>
              </HStack>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
}