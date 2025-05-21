import React, { useEffect, useState } from "react";
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
  useToast,
  Spinner
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../../axios-client";

// Interfaces para tipagem
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  time: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface OrderItemProps {
  order: Order;
  onPress: () => void;
}

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b"
};

// Dados de exemplo para pedidos (como fallback)
const orderData: Order[] = [
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
const OrderItem: React.FC<OrderItemProps> = ({ order, onPress }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Em preparação":
        return colors.primary;
      case "Em entrega":
        return "#0284c7"; // blue
      case "Entregue":
        return "#16a34a"; // green
      case "Pendente":
        return "#7c3aed"; // purple
      case "Cancelado":
        return "#ef4444"; // red
      default:
        return colors.grayText;
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case "Em preparação":
        return `${colors.primary}20`;
      case "Em entrega":
        return "#0284c720";
      case "Entregue":
        return "#16a34a20";
      case "Pendente":
        return "#7c3aed20";
      case "Cancelado":
        return "#ef444420";
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
          {order.items && order.items.map((item, index) => (
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

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Função para mapear status do backend para o frontend
  const mapOrderStatus = (status: string): string => {
    const statusMap = {
      'pending': 'Pendente',
      'processing': 'Em preparação',
      'shipped': 'Em entrega',
      'delivered': 'Entregue',
      'canceled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Função para formatar a data
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Formatar para pt-BR com mês abreviado
    const month = date.toLocaleString('pt-BR', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // Função para formatar a hora
  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get('/orders');
        console.log("Resposta completa:", response.data);
        
        // Verifica se os dados têm o formato correto
        if (response.data && response.data.data && response.data.data.data) {
          // Acessa o array de pedidos na estrutura paginada
          const apiOrders = response.data.data.data;
          
          // Formatar dados da API para o formato que o componente espera
          const formattedOrders = apiOrders.map(order => ({
            id: order.id.toString(),
            date: formatDate(order.created_at),
            time: formatTime(order.created_at),
            status: mapOrderStatus(order.status),
            total: parseFloat(order.total_amount),
            items: order.item_orders ? order.item_orders.map(io => ({
              name: io.item ? io.item.name : 'Item indisponível',
              quantity: io.quantity || 0,
              price: parseFloat(io.unit_price) || 0
            })) : []
          }));
          
          setOrders(formattedOrders);
          console.log("Pedidos formatados:", formattedOrders);
        } else {
          console.warn("Formato inesperado da API, usando dados de exemplo");
          setOrders(orderData);
        }
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        // Em caso de erro, usa os dados de exemplo
        setOrders(orderData);
        
        toast.show({
          description: "Usando dados de exemplo para visualização",
          status: "info",
          placement: "top",
          duration: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Use os dados da API se disponíveis, caso contrário use os dados de exemplo
  const displayOrders = orders || [];
  
  const filteredOrders = activeTab === "active" 
    ? displayOrders.filter(order => order.status !== "Entregue") 
    : displayOrders;

  const handleOrderPress = (order: Order): void => {
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
        {isLoading ? (
          <Center flex={1} py={10}>
            <Spinner size="lg" color={colors.primary} />
            <Text mt={4} color={colors.dark}>Carregando pedidos...</Text>
          </Center>
        ) : filteredOrders.length > 0 ? (
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
              {activeTab === "active" 
                ? "Você não tem pedidos ativos no momento."
                : "Você ainda não fez nenhum pedido."
              }
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
};

export default Orders;