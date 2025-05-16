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
  useToast
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b"
};

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
        return colors.primary;
      case "Em entrega":
        return "#0284c7"; // blue
      case "Entregue":
        return "#16a34a"; // green
      default:
        return colors.grayText;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Em preparação":
        return `${colors.primary}20`;
      case "Em entrega":
        return "#0284c720";
      case "Entregue":
        return "#16a34a20";
      default:
        return "gray.100";
    }
  };

  const statusColor = getStatusColor(order.status);
  const statusBgColor = getStatusBgColor(order.status);

  return (
    <Pressable onPress={onPress}>
      <Box 
        bg="white" 
        shadow={1}
        borderRadius="lg"
        mb={4}
        p={4}
        borderWidth={1}
        borderColor="gray.100"
      >
        <HStack justifyContent="space-between" mb={2}>
          <Text fontWeight="bold" fontSize="md" color={colors.dark}>Pedido #{order.id}</Text>
          <Badge 
            bg={statusBgColor}
            py={1}
            px={2}
            rounded="md"
          >
            <Text fontSize="xs" fontWeight="medium" color={statusColor}>
              {order.status}
            </Text>
          </Badge>
        </HStack>
        
        <HStack justifyContent="space-between" mb={3}>
          <Text fontSize="xs" color={colors.grayText}>
            {order.date} • {order.time}
          </Text>
          <Text fontWeight="bold" color={colors.primary}>
            R${order.total.toFixed(2)}
          </Text>
        </HStack>
        
        <Divider mb={3} />
        
        <VStack space={1}>
          {order.items.map((item, index) => (
            <HStack key={index} justifyContent="space-between">
              <Text fontSize="sm" color={colors.dark}>
                {item.quantity}x {item.name}
              </Text>
              <Text fontSize="sm" color={colors.grayText}>
                R${(item.quantity * item.price).toFixed(2)}
              </Text>
            </HStack>
          ))}
        </VStack>
        
        {order.status === "Entregue" ? (
          <Button 
            mt={3} 
            size="sm" 
            variant="outline"
            leftIcon={<Icon as={Ionicons} name="repeat" size="sm" color={colors.primary} />}
            borderColor={colors.primary}
            _text={{ color: colors.primary }}
          >
            Pedir novamente
          </Button>
        ) : (
          <Button 
            mt={3} 
            size="sm" 
            bg={colors.primary}
            _pressed={{ bg: colors.primary+"e0" }}
            leftIcon={<Icon as={Ionicons} name="locate" size="sm" color="white" />}
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
    <VStack flex={1} bg={colors.grayBg} safeArea>
      {/* Header */}
      <HStack 
        px={6} 
        pt={4} 
        pb={4} 
        bg={colors.dark}
        justifyContent="space-between" 
        alignItems="center"
      >
        <Heading size="md" color="white">Meus Pedidos</Heading>
        <Icon as={Ionicons} name="search" size="md" color="white" />
      </HStack>
      
      {/* Tabs */}
      <HStack px={6} py={4} space={4} bg="white" shadow={1}>
        <Pressable onPress={() => setActiveTab("all")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "all" ? colors.primary : "transparent"} pb={1}>
            <Text color={activeTab === "all" ? colors.primary : colors.grayText} fontWeight={activeTab === "all" ? "bold" : "normal"}>
              Todos
            </Text>
          </Box>
        </Pressable>
        <Pressable onPress={() => setActiveTab("active")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "active" ? colors.primary : "transparent"} pb={1}>
            <Text color={activeTab === "active" ? colors.primary : colors.grayText} fontWeight={activeTab === "active" ? "bold" : "normal"}>
              Ativos
            </Text>
          </Box>
        </Pressable>
      </HStack>
      
      {/* Order List */}
      <ScrollView 
        flex={1} 
        px={6} 
        pt={4}
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
            <Box 
              bg={`${colors.primary}10`}
              p={4}
              borderRadius="full"
              mb={4}
            >
              <Icon as={Ionicons} name="fast-food-outline" size="4xl" color={colors.primary} />
            </Box>
            <Text mt={2} fontSize="md" color={colors.dark} fontWeight="bold" textAlign="center">
              Nenhum pedido encontrado
            </Text>
            <Text mt={1} fontSize="sm" color={colors.grayText} textAlign="center">
              Você ainda não tem pedidos ativos.
            </Text>
            <Button 
              mt={4} 
              bg={colors.primary}
              _pressed={{ bg: colors.primary+"e0" }}
              leftIcon={<Icon as={Ionicons} name="pizza" size="sm" />}
            >
              Fazer um pedido
            </Button>
          </Center>
        )}
      </ScrollView>
      
      {/* Add New Order Button */}
      <Box position="absolute" bottom={10} right={6}>
        <Pressable 
          bg={colors.primary} 
          shadow={3}
          borderRadius="full" 
          p={4}
          _pressed={{ bg: colors.primary+"e0" }}
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