import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  ScrollView,
  Heading,
  Icon,
  Pressable,
  Badge,
  Divider,
  Center,
  Button,
  FlatList,
  Avatar,
  useToast
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Dados de exemplo para pedidos
const orderData = [
  {
    id: "1001",
    date: "13 Abr, 2025",
    time: "19:30",
    status: "Em entrega",
    total: 42.97,
    items: [
      { name: "Pepperoni", quantity: 1, price: 12.99 },
      { name: "Suprema", quantity: 2, price: 14.99 }
    ]
  },
  {
    id: "1000",
    date: "10 Abr, 2025",
    time: "20:15",
    status: "Entregue",
    total: 25.98,
    items: [
      { name: "Margherita", quantity: 1, price: 10.99 },
      { name: "Vegetariana", quantity: 1, price: 11.99 },
      { name: "Refrigerante", quantity: 1, price: 3.00 }
    ]
  },
  {
    id: "999",
    date: "02 Abr, 2025",
    time: "18:45",
    status: "Entregue",
    total: 34.97,
    items: [
      { name: "Havaiana", quantity: 1, price: 13.99 },
      { name: "Pepperoni", quantity: 1, price: 12.99 },
      { name: "Palitos de Alho", quantity: 1, price: 7.99 }
    ]
  }
];

// Componente para cada item de pedido
const OrderItem = ({ order, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Em preparação":
        return "amber";
      case "Em entrega":
        return "blue";
      case "Entregue":
        return "green";
      default:
        return "gray";
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <Pressable onPress={onPress}>
      <Box 
        bg="white" 
        shadow={1}
        borderRadius="lg"
        mb={4}
        p={4}
      >
        <HStack justifyContent="space-between" mb={2}>
          <Text fontWeight="bold" fontSize="md">Pedido #{order.id}</Text>
          <Badge 
            colorScheme={statusColor} 
            variant="subtle" 
            rounded="md"
          >
            <Text fontSize="xs" fontWeight="medium" color={`${statusColor}.800`}>
              {order.status}
            </Text>
          </Badge>
        </HStack>
        
        <HStack justifyContent="space-between" mb={3}>
          <Text fontSize="sm" color="gray.500">
            {order.date} • {order.time}
          </Text>
          <Text fontWeight="bold" color="red.500">
            R${order.total.toFixed(2)}
          </Text>
        </HStack>
        
        <Divider mb={3} />
        
        <VStack space={1}>
          {order.items.map((item, index) => (
            <HStack key={index} justifyContent="space-between">
              <Text fontSize="sm">
                {item.quantity}x {item.name}
              </Text>
              <Text fontSize="sm">
                R${(item.quantity * item.price).toFixed(2)}
              </Text>
            </HStack>
          ))}
        </VStack>
        
        {order.status === "Entregue" ? (
          <Button 
            mt={3} 
            size="sm" 
            variant="subtle"
            leftIcon={<Icon as={Ionicons} name="repeat" size="sm" />}
          >
            Pedir novamente
          </Button>
        ) : (
          <Button 
            mt={3} 
            size="sm" 
            colorScheme="red"
            leftIcon={<Icon as={Ionicons} name="locate" size="sm" />}
          >
            Rastrear pedido
          </Button>
        )}
      </Box>
    </Pressable>
  );
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const toast = useToast();

  const filteredOrders = activeTab === "active" 
    ? orderData.filter(order => order.status !== "Entregue") 
    : orderData;

  const handleOrderPress = (order) => {
    toast.show({
      description: `Detalhes do pedido #${order.id}`,
      placement: "top"
    });
  };

  return (
    <VStack flex={1} bg="gray.50" safeArea>
      {/* Header */}
      <HStack px={6} pt={4} pb={2} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Meus Pedidos</Heading>
        <Icon as={Ionicons} name="search" size="md" color="gray.500" />
      </HStack>
      
      {/* Tabs */}
      <HStack px={6} py={4} space={4}>
        <Pressable onPress={() => setActiveTab("all")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "all" ? "red.500" : "transparent"} pb={1}>
            <Text color={activeTab === "all" ? "red.500" : "gray.500"} fontWeight={activeTab === "all" ? "bold" : "normal"}>
              Todos
            </Text>
          </Box>
        </Pressable>
        <Pressable onPress={() => setActiveTab("active")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "active" ? "red.500" : "transparent"} pb={1}>
            <Text color={activeTab === "active" ? "red.500" : "gray.500"} fontWeight={activeTab === "active" ? "bold" : "normal"}>
              Ativos
            </Text>
          </Box>
        </Pressable>
      </HStack>
      
      {/* Order List */}
      <ScrollView 
        flex={1} 
        px={6} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onPress={() => handleOrderPress(order)}
            />
          ))
        ) : (
          <Center flex={1} py={10}>
            <Icon as={Ionicons} name="fast-food-outline" size="5xl" color="gray.300" />
            <Text mt={4} fontSize="md" color="gray.500" textAlign="center">
              Você ainda não tem pedidos ativos.
            </Text>
            <Button mt={4} colorScheme="red" leftIcon={<Icon as={Ionicons} name="pizza" size="sm" />}>
              Fazer um pedido
            </Button>
          </Center>
        )}
      </ScrollView>
      
      {/* Add New Order Button */}
      <Box position="absolute" bottom={10} right={6}>
        <Pressable 
          bg="red.500" 
          shadow={3}
          borderRadius="full" 
          p={4}
          onPress={() => {
            toast.show({
              description: "Redirecionando para novo pedido",
              placement: "top"
            });
          }}
        >
          <Icon as={Ionicons} name="add" color="white" size="md" />
        </Pressable>
      </Box>
    </VStack>
  );
}