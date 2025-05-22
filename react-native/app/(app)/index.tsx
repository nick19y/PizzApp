import React, { useEffect, useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Image,
  ScrollView,
  Heading,
  Icon,
  Pressable,
  Badge,
  Button,
  Center,
  useTheme,
  Spinner,
  useToast
} from "native-base";
import { RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import axiosClient from "../../axios-client";

// Interfaces para tipagem
interface OrderItem {
  id: number;
  item: {
    id: number;
    name: string;
  };
  size: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
  payment_method: string;
  delivery_time?: string;
  item_orders?: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteItem: string;
  pendingOrders: number;
}

const Home: React.FC = () => {
  const theme = useTheme();
  const toast = useToast();
  
  // Estados para dados dinâmicos
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItem: '',
    pendingOrders: 0
  });
  
  // Cores customizadas para combinar com o tema web
  const colors = {
    primary: "#f97316", // Orange - cor de destaque
    dark: "#1e293b", // Dark blue - cor do header
    light: "#ffffff",
    grayBg: "#f8fafc",
    grayText: "#64748b",
    success: "#16a34a",
    warning: "#ea580c",
    inProgress: "#ea580c"
  };

  // Função para buscar pedidos e estatísticas
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await axiosClient.get('/orders');
      console.log("Resposta da API Home:", response.data);
      
      // Verificar estrutura da resposta
      let ordersData = [];
      if (response.data?.success && response.data?.data?.data) {
        ordersData = response.data.data.data;
      } else if (response.data?.data) {
        ordersData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      // Filtrar pedidos mais recentes (últimos 3)
      const sortedOrders = ordersData
        .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      setRecentOrders(sortedOrders);
      
      // Calcular estatísticas do usuário
      const stats = calculateUserStats(ordersData);
      setUserStats(stats);
      
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      toast.show({
        description: "Erro ao carregar dados. Tente novamente.",
        placement: "top",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para calcular estatísticas do usuário
  const calculateUserStats = (orders: Order[]): UserStats => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        favoriteItem: 'Nenhum ainda',
        pendingOrders: 0
      };
    }

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
    const pendingOrders = orders.filter(order => !['delivered', 'canceled'].includes(order.status.toLowerCase())).length;
    
    // Encontrar item mais pedido
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.item_orders?.forEach(item => {
        const itemName = item.item?.name || 'Item indisponível';
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
      });
    });
    
    const favoriteItem = Object.keys(itemCounts).length > 0 
      ? Object.entries(itemCounts).reduce((a, b) => itemCounts[a[0]] > itemCounts[b[0]] ? a : b)[0]
      : 'Nenhum ainda';

    return {
      totalOrders,
      totalSpent,
      favoriteItem,
      pendingOrders
    };
  };

  // Usar useFocusEffect para recarregar dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  // Função para refresh dos dados
  const onRefresh = () => {
    fetchDashboardData(true);
  };

  // Função para obter cor do status
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return colors.warning;
      case "processing":
        return colors.primary;
      case "shipped":
        return colors.inProgress;
      case "delivered":
        return colors.success;
      case "canceled":
        return "#ef4444";
      default:
        return colors.grayText;
    }
  };

  // Função para obter label do status
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      processing: 'Preparando',
      shipped: 'A caminho',
      delivered: 'Entregue',
      canceled: 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Função para navegar para criar pedido
  const handleCreateOrder = (): void => {
    router.push('/orders/create');
  };

  // Função para navegar para todos os pedidos
  const handleViewAllOrders = (): void => {
    router.push('/orders');
  };

  // Função para ver detalhes do pedido
  const handleOrderPress = (order: Order): void => {
    router.push({
      pathname: '/orders',
      params: { selectedOrderId: order.id }
    });
  };

  return (
    <VStack flex={1} bg={colors.light} safeArea>
      {/* Header */}
      <HStack 
        px={6} 
        py={4} 
        bg={colors.dark} 
        justifyContent="space-between" 
        alignItems="center"
        shadow={2}
      >
        <HStack space={2} alignItems="center">
          <Icon as={Ionicons} name="pizza-outline" size="md" color={colors.primary} />
          <Heading size="md" color="white">PizzApp</Heading>
        </HStack>
        <Pressable onPress={onRefresh}>
          <Icon as={Ionicons} name="refresh-outline" size="md" color="white" />
        </Pressable>
      </HStack>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Banner Principal */}
        <Box mx={6} mt={4} mb={6}>
          <Box
            bg={colors.grayBg}
            borderRadius="lg"
            overflow="hidden"
            shadow={2}
          >
            <VStack space={4} p={6}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack space={1} width="60%">
                  <Heading size="md" color={colors.dark}>Bem-vindo ao PizzApp!</Heading>
                  <Text fontSize="sm" color={colors.grayText}>
                    As melhores pizzas da cidade, do forno direto para sua casa.
                  </Text>
                  
                  <Button 
                    mt={4}
                    bg={colors.primary} 
                    _pressed={{ bg: colors.warning }}
                    borderRadius="md" 
                    py={2} 
                    startIcon={<Icon as={Ionicons} name="pizza-outline" color="white" size="sm" />}
                    onPress={handleCreateOrder}
                  >
                    Fazer Pedido
                  </Button>
                </VStack>
                
                <Image 
                  source={{ uri: "/api/placeholder/120/120" }}
                  alt="Pizza"
                  size="md"
                  borderRadius="full"
                />
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* Estatísticas do Usuário */}
        {!isLoading && userStats.totalOrders > 0 && (
          <VStack px={6} mb={6}>
            <Heading size="sm" color={colors.dark} mb={4}>SUAS ESTATÍSTICAS</Heading>
            
            <HStack space={3} justifyContent="space-between">
              <VStack 
                flex={1}
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Text fontSize="xl" fontWeight="bold" color={colors.primary}>
                  {userStats.totalOrders}
                </Text>
                <Text fontSize="xs" color={colors.grayText} textAlign="center">
                  Pedidos
                </Text>
              </VStack>
              
              {/* <VStack 
                flex={1}
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Text fontSize="md" fontWeight="bold" color={colors.success}>
                  R$ {userStats.totalSpent.toFixed(0)}
                </Text>
                <Text fontSize="xs" color={colors.grayText} textAlign="center">
                  Total gasto
                </Text>
              </VStack> */}
              
              <VStack 
                flex={1}
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Text fontSize="xl" fontWeight="bold" color={colors.warning}>
                  {userStats.pendingOrders}
                </Text>
                <Text fontSize="xs" color={colors.grayText} textAlign="center">
                  Ativos
                </Text>
              </VStack>
            </HStack>
            
            {userStats.favoriteItem !== 'Nenhum ainda' && (
              <Box mt={3} bg="white" borderRadius="lg" p={4} shadow={1}>
                <Text fontSize="xs" color={colors.grayText} mb={1}>Seu favorito:</Text>
                <Text fontSize="sm" fontWeight="bold" color={colors.dark}>
                  {userStats.favoriteItem}
                </Text>
              </Box>
            )}
          </VStack>
        )}

        {/* Pedidos Recentes */}
        <VStack px={6} mb={6}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>PEDIDOS RECENTES</Heading>
            <Pressable onPress={handleViewAllOrders}>
              <Text color={colors.primary} fontWeight="medium" fontSize="xs">Ver todos</Text>
            </Pressable>
          </HStack>

          {isLoading ? (
            <Center bg="white" py={8} borderRadius="lg" shadow={1}>
              <Spinner size="lg" color={colors.primary} />
              <Text color={colors.grayText} mt={2}>Carregando pedidos...</Text>
            </Center>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <Pressable key={order.id} mb={3} onPress={() => handleOrderPress(order)}>
                <Box 
                  bg="white" 
                  borderRadius="lg" 
                  p={4}
                  borderWidth={1}
                  borderColor="gray.100"
                  shadow={1}
                >
                  <HStack justifyContent="space-between" mb={2}>
                    <VStack>
                      <Text fontWeight="bold" fontSize="md" color={colors.dark}>
                        Pedido #{order.id}
                      </Text>
                      <Text fontSize="xs" color={colors.grayText}>
                        {formatDate(order.created_at)}
                      </Text>
                    </VStack>
                    <VStack alignItems="flex-end">
                      <Badge 
                        bg={`${getStatusColor(order.status)}20`}
                        px={2} 
                        py={1}
                        borderRadius="md"
                      >
                        <Text color={getStatusColor(order.status)} fontWeight="medium" fontSize="xs">
                          {getStatusLabel(order.status)}
                        </Text>
                      </Badge>
                      <Text fontWeight="bold" color={colors.primary} fontSize="sm" mt={1}>
                        R$ {parseFloat(order.total_amount.toString()).toFixed(2).replace('.', ',')}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {order.item_orders && order.item_orders.length > 0 && (
                    <HStack space={2} alignItems="center" mt={2}>
                      <Icon as={Ionicons} name="fast-food-outline" color={colors.grayText} size="xs" />
                      <Text fontSize="xs" color={colors.grayText}>
                        {order.item_orders.length} {order.item_orders.length === 1 ? 'item' : 'itens'}
                        {order.item_orders[0]?.item?.name && ` • ${order.item_orders[0].item.name}`}
                        {order.item_orders.length > 1 && ` +${order.item_orders.length - 1} mais`}
                      </Text>
                    </HStack>
                  )}
                </Box>
              </Pressable>
            ))
          ) : (
            <Center bg={colors.grayBg} py={8} borderRadius="lg">
              <Icon as={Ionicons} name="fast-food-outline" size="4xl" color="gray.300" />
              <Text color={colors.grayText} mt={2}>
                Você não tem pedidos ainda
              </Text>
              <Button 
                mt={4}
                variant="outline"
                borderColor={colors.primary}
                _text={{ color: colors.primary }}
                onPress={handleCreateOrder}
              >
                Fazer seu primeiro pedido
              </Button>
            </Center>
          )}
        </VStack>

        {/* Categorias de Menu */}
        <VStack px={6} mb={6}>
          <Heading size="sm" color={colors.dark} mb={4}>CATEGORIAS</Heading>
          
          <HStack space={3} justifyContent="space-between">
            <Pressable flex={1}>
              <VStack 
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Center 
                  bg={`${colors.primary}10`} 
                  p={3} 
                  borderRadius="full" 
                  mb={2}
                >
                  <Icon as={Ionicons} name="pizza-outline" color={colors.primary} size="md" />
                </Center>
                <Text fontWeight="medium" fontSize="xs" color={colors.dark}>Pizzas</Text>
              </VStack>
            </Pressable>
            
            <Pressable flex={1}>
              <VStack 
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Center 
                  bg={`${colors.primary}10`} 
                  p={3} 
                  borderRadius="full" 
                  mb={2}
                >
                  <Icon as={Ionicons} name="cafe-outline" color={colors.primary} size="md" />
                </Center>
                <Text fontWeight="medium" fontSize="xs" color={colors.dark}>Bebidas</Text>
              </VStack>
            </Pressable>
            
            <Pressable flex={1}>
              <VStack 
                alignItems="center" 
                bg="white" 
                borderRadius="lg" 
                p={4}
                shadow={1}
              >
                <Center 
                  bg={`${colors.primary}10`} 
                  p={3} 
                  borderRadius="full" 
                  mb={2}
                >
                  <Icon as={Ionicons} name="ice-cream-outline" color={colors.primary} size="md" />
                </Center>
                <Text fontWeight="medium" fontSize="xs" color={colors.dark}>Sobremesas</Text>
              </VStack>
            </Pressable>
          </HStack>
        </VStack>

        {/* Promoções */}
        {/* <VStack px={6} mb={10}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>PROMOÇÕES</Heading>
          </HStack>
          
          <Pressable mb={4} onPress={handleCreateOrder}>
            <Box
              bg="white"
              p={4}
              borderRadius="lg"
              shadow={1}
              borderWidth={1}
              borderColor="gray.100"
            >
              <HStack alignItems="center" space={3}>
                <Center bg={`${colors.primary}10`} p={3} borderRadius="lg">
                  <Icon as={Ionicons} name="calendar-outline" size="md" color={colors.primary} />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" color={colors.dark}>Terça de Desconto</Text>
                  <Text fontSize="xs" color={colors.grayText}>20% de desconto em todas as pizzas</Text>
                </VStack>
                <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
              </HStack>
            </Box>
          </Pressable>
          
          <Pressable onPress={handleCreateOrder}>
            <Box
              bg="white"
              p={4}
              borderRadius="lg"
              shadow={1}
              borderWidth={1}
              borderColor="gray.100"
            >
              <HStack alignItems="center" space={3}>
                <Center bg={`${colors.primary}10`} p={3} borderRadius="lg">
                  <Icon as={Ionicons} name="gift-outline" size="md" color={colors.primary} />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" color={colors.dark}>Programa Fidelidade</Text>
                  <Text fontSize="xs" color={colors.grayText}>
                    {userStats.totalOrders >= 10 
                      ? `Parabéns! Você já fez ${userStats.totalOrders} pedidos` 
                      : `Faltam ${Math.max(0, 10 - userStats.totalOrders)} pedidos para a próxima recompensa`
                    }
                  </Text>
                </VStack>
                <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
              </HStack>
            </Box>
          </Pressable>
        </VStack> */}
      </ScrollView>
    </VStack>
  );
};

export default Home;