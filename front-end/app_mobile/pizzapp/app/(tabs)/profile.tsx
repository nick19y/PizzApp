import React from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Avatar,
  ScrollView,
  Heading,
  Icon,
  Pressable,
  Divider,
  Button
} from "native-base";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Sample order history data
const orderHistory = [
  {
    id: "PED-1234",
    date: "12 de abril de 2025",
    total: 27.98,
    items: ["1x Pepperoni", "1x Suprema"],
    status: "Entregue"
  },
  {
    id: "PED-1187",
    date: "3 de abril de 2025",
    total: 14.99,
    items: ["1x Havaiana", "1x Pão de Alho"],
    status: "Entregue"
  },
  {
    id: "PED-1142",
    date: "28 de março de 2025",
    total: 32.47,
    items: ["1x Vegetariana", "1x Amante de Carne", "1x Coca-Cola"],
    status: "Entregue"
  }
];

export default function Profile() {
  return (
    <VStack flex={1} bg="white" safeArea>
      {/* Header */}
      <HStack px={6} pt={4} pb={4} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Perfil</Heading>
        <Icon as={Ionicons} name="settings-outline" size="md" color="gray.700" />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Box px={6} py={4}>
          <HStack space={4} alignItems="center">
            <Avatar 
              size="xl" 
              source={{ uri: "https://via.placeholder.com/150" }}
              borderWidth={3}
              borderColor="red.500"
            />
            <VStack space={1}>
              <Heading size="md">João Silva</Heading>
              <Text color="gray.500">joao.silva@exemplo.com</Text>
              <HStack alignItems="center" space={1} mt={1}>
                <Icon as={Ionicons} name="location" size="xs" color="gray.500" />
                <Text color="gray.500" fontSize="sm">Rua Principal, 123, Cidade</Text>
              </HStack>
              <Button
                variant="outline"
                size="sm"
                mt={2}
                leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" />}
                _text={{ color: "red.500" }}
                borderColor="red.500"
              >
                Editar Perfil
              </Button>
            </VStack>
          </HStack>
        </Box>

        <Divider my={2} />

        {/* Account Options */}
        <VStack px={6} py={2} space={4}>
          <Heading size="sm" mb={2}>Conta</Heading>
          
          <Pressable>
            <HStack alignItems="center" justifyContent="space-between" py={2}>
              <HStack space={3} alignItems="center">
                <Box bg="blue.100" p={2} borderRadius="md">
                  <Icon as={Ionicons} name="card-outline" size="sm" color="blue.600" />
                </Box>
                <Text fontWeight="medium">Métodos de Pagamento</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
          
          <Pressable>
            <HStack alignItems="center" justifyContent="space-between" py={2}>
              <HStack space={3} alignItems="center">
                <Box bg="green.100" p={2} borderRadius="md">
                  <Icon as={Ionicons} name="location-outline" size="sm" color="green.600" />
                </Box>
                <Text fontWeight="medium">Endereços de Entrega</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
          
          <Pressable>
            <HStack alignItems="center" justifyContent="space-between" py={2}>
              <HStack space={3} alignItems="center">
                <Box bg="purple.100" p={2} borderRadius="md">
                  <Icon as={Ionicons} name="notifications-outline" size="sm" color="purple.600" />
                </Box>
                <Text fontWeight="medium">Notificações</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
        </VStack>

        <Divider my={2} />

        {/* Order History */}
        <VStack px={6} py={2}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm">Histórico de Pedidos</Heading>
            <Text color="red.500" fontWeight="bold">Ver todos</Text>
          </HStack>

          {orderHistory.map((order) => (
            <Pressable key={order.id} mb={4}>
              <Box 
                bg="gray.50" 
                borderRadius="lg" 
                p={4}
                borderWidth={1}
                borderColor="gray.200"
              >
                <HStack justifyContent="space-between" mb={2}>
                  <Text fontWeight="bold">{order.id}</Text>
                  <Text 
                    fontWeight="bold" 
                    color={
                      order.status === "Entregue" ? "green.600" : 
                      order.status === "Processando" ? "amber.600" : "gray.600"
                    }
                  >
                    {order.status}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500" mb={2}>{order.date}</Text>
                <Divider mb={2} />
                <VStack space={1}>
                  {order.items.map((item, index) => (
                    <Text key={index} fontSize="sm">{item}</Text>
                  ))}
                </VStack>
                <Divider my={2} />
                <HStack justifyContent="space-between">
                  <Text fontWeight="medium">Total:</Text>
                  <Text fontWeight="bold">R${order.total.toFixed(2)}</Text>
                </HStack>
                <Button
                  variant="ghost"
                  size="sm"
                  mt={2}
                  leftIcon={<Icon as={Ionicons} name="reload-outline" size="sm" color="red.500" />}
                  _text={{ color: "red.500" }}
                >
                  Pedir Novamente
                </Button>
              </Box>
            </Pressable>
          ))}
        </VStack>

        {/* Logout Button */}
        <Box px={6} py={6}>
          <Button 
            variant="outline" 
            colorScheme="red"
            leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" />}
          >
            Sair
          </Button>
        </Box>
      </ScrollView>
    </VStack>
  );
}