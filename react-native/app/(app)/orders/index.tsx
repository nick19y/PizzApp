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
  Spinner,
  Modal,
  AlertDialog
} from "native-base";
import { RefreshControl } from "react-native"; // Importar do react-native em vez do native-base
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from 'expo-router';
import axiosClient from "../../../axios-client";

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

interface OrderItemProps {
  order: Order;
  onPress: () => void;
  onReorder?: () => void;
  onConfirmDelivery?: (orderId: string) => void; // Nova prop para confirmar entrega
}

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b",
  success: "#16a34a",
  warning: "#eab308",
  danger: "#ef4444",
  info: "#0284c7"
};

// Componente para cada item de pedido
const OrderItemCard: React.FC<OrderItemProps> = ({ order, onPress, onReorder, onConfirmDelivery }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending":
        return colors.warning;
      case "processing":
        return colors.primary;
      case "shipped":
        return colors.info;
      case "delivered":
        return colors.success;
      case "canceled":
        return colors.danger;
      default:
        return colors.grayText;
    }
  };

  const getStatusBgColor = (status: string): string => {
    const baseColor = getStatusColor(status);
    return baseColor + "20";
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = { // Adicionar tipagem explícita
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      canceled: 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getPaymentMethodLabel = (method: string): string => {
    const paymentMap: Record<string, string> = { // Adicionar tipagem explícita
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX'
    };
    return paymentMap[method] || method;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit', 
      minute: '2-digit'
    });
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
          <Text fontWeight="bold" fontSize="md" color={colors.dark}>
            Pedido #{order.id}
          </Text>
          <Badge 
            bg={statusBgColor}
            py={1}
            px={2}
            rounded="md"
          >
            <Text fontSize="xs" fontWeight="medium" color={statusColor}>
              {getStatusLabel(order.status)}
            </Text>
          </Badge>
        </HStack>
        
        <HStack justifyContent="space-between" mb={3}>
          <VStack space={1}>
            <Text fontSize="xs" color={colors.grayText}>
              {formatDate(order.created_at)} • {formatTime(order.created_at)}
            </Text>
            <Text fontSize="xs" color={colors.grayText}>
              {getPaymentMethodLabel(order.payment_method)}
            </Text>
          </VStack>
          <VStack alignItems="flex-end" space={1}>
            <Text fontWeight="bold" color={colors.primary} fontSize="md">
              R$ {parseFloat(order.total_amount.toString()).toFixed(2).replace('.', ',')}
            </Text>
            {order.item_orders && (
              <Text fontSize="xs" color={colors.grayText}>
                {order.item_orders.length} {order.item_orders.length === 1 ? 'item' : 'itens'}
              </Text>
            )}
          </VStack>
        </HStack>
        
        <Divider mb={3} />
        
        {/* Itens do pedido */}
        <VStack space={1} mb={3}>
          {order.item_orders && order.item_orders.slice(0, 3).map((item, index) => (
            <HStack key={index} justifyContent="space-between">
              <Text fontSize="sm" color={colors.dark} flex={1}>
                {item.quantity}x {item.item?.name || 'Item indisponível'}
                {item.size && (
                  <Text fontSize="xs" color={colors.grayText}>
                    {' '}({item.size === 'small' ? 'P' : item.size === 'medium' ? 'M' : 'G'})
                  </Text>
                )}
              </Text>
              <Text fontSize="sm" color={colors.grayText}>
                R$ {parseFloat(item.subtotal.toString()).toFixed(2).replace('.', ',')}
              </Text>
            </HStack>
          ))}
          {order.item_orders && order.item_orders.length > 3 && (
            <Text fontSize="xs" color={colors.grayText} textAlign="center">
              +{order.item_orders.length - 3} {order.item_orders.length - 3 === 1 ? 'item' : 'itens'}
            </Text>
          )}
        </VStack>

        {/* Endereço de entrega (se houver) */}
        {order.delivery_address && (
          <Box mb={3}>
            <Text fontSize="xs" color={colors.grayText} numberOfLines={2}>
              <Icon as={Ionicons} name="location-outline" size="xs" />
              {' '}{order.delivery_address}
            </Text>
          </Box>
        )}
        
        {/* Botões de ação - ATUALIZADOS */}
        <HStack space={2}>
          {order.status === "delivered" ? (
            <Button 
              flex={1}
              size="sm" 
              variant="outline"
              leftIcon={<Icon as={Ionicons} name="repeat" size="sm" color={colors.primary} />}
              borderColor={colors.primary}
              _text={{ color: colors.primary }}
              onPress={onReorder}
            >
              Pedir novamente
            </Button>
          ) : order.status !== "canceled" ? (
            <Button 
              flex={1}
              size="sm" 
              bg={colors.success}
              _pressed={{ bg: colors.success + "e0" }}
              leftIcon={<Icon as={Ionicons} name="checkmark-circle" size="sm" color="white" />}
              onPress={() => onConfirmDelivery && onConfirmDelivery(order.id)}
            >
              Marcar como Entregue
            </Button>
          ) : (
            <Button 
              flex={1}
              size="sm" 
              variant="outline"
              leftIcon={<Icon as={Ionicons} name="repeat" size="sm" color={colors.primary} />}
              borderColor={colors.primary}
              _text={{ color: colors.primary }}
              onPress={onReorder}
            >
              Fazer novamente
            </Button>
          )}
        </HStack>
      </Box>
    </Pressable>
  );
};

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const toast = useToast();

  // Função para atualizar status do pedido para "delivered" - MOVIDA PARA O COMPONENTE PRINCIPAL
  const updateOrderStatus = async (orderId: string) => {
    try {
      setIsLoading(true);
      
      console.log(`Atualizando status do pedido ${orderId} para "delivered"`);
      
      const response = await axiosClient.put(`/orders/${orderId}/status`, {
        status: 'delivered'
      });
      
      console.log("Status atualizado com sucesso:", response.data);
      
      // Atualizar o estado local
      setOrders((prevOrders: Order[]) => 
        prevOrders.map((order: Order) => 
          order.id === orderId 
            ? { ...order, status: 'delivered' }
            : order
        )
      );
      
      toast.show({
        description: "✅ Pedido marcado como entregue!",
        placement: "top",
        duration: 3000
      });
      
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      
      let errorMessage = "Erro ao atualizar status do pedido";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Pedido não encontrado";
      } else if (error.response?.status === 403) {
        errorMessage = "Você não tem permissão para atualizar este pedido";
      }
      
      toast.show({
        description: errorMessage,
        placement: "top",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para confirmar entrega (com diálogo de confirmação) - MOVIDA PARA O COMPONENTE PRINCIPAL
  const confirmDelivery = (orderId: string) => {
    // Aqui você pode adicionar um AlertDialog se quiser confirmação
    updateOrderStatus(orderId);
  };

  // Função para buscar pedidos
  const fetchOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await axiosClient.get('/orders');
      console.log("Resposta da API:", response.data);
      
      // Verificar estrutura da resposta
      let ordersData = [];
      if (response.data?.success && response.data?.data?.data) {
        // Estrutura paginada
        ordersData = response.data.data.data;
      } else if (response.data?.data) {
        // Estrutura simples com array direto
        ordersData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        // Array direto
        ordersData = response.data;
      }
      
      setOrders(ordersData);
      console.log("Pedidos carregados:", ordersData.length);
      
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      toast.show({
        description: "Erro ao carregar pedidos. Tente novamente.",
        placement: "top", // Remover propriedade status
        duration: 3000
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Usar useFocusEffect para recarregar dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  // Função para refresh dos dados
  const onRefresh = () => {
    fetchOrders(true);
  };

  // Filtrar pedidos baseado na aba ativa
  const filteredOrders = activeTab === "active" 
    ? orders.filter(order => !['delivered', 'canceled'].includes(order.status.toLowerCase())) 
    : orders;

  // Função para mostrar detalhes do pedido
  const handleOrderPress = (order: Order): void => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Função para refazer pedido
  const handleReorder = (order: Order): void => {
    if (order.item_orders && order.item_orders.length > 0) {
      // Preparar itens para reorder
      const reorderItems = order.item_orders.map(item => ({
        item_id: item.item.id,
        itemName: item.item.name,
        size: item.size as 'small' | 'medium' | 'large',
        quantity: item.quantity,
        special_instructions: item.special_instructions
      }));

      // Navegar para CreateOrder com os itens
      router.push({
        pathname: '/orders/create',
        params: { reorderItems: JSON.stringify(reorderItems) }
      });
    } else {
      // Se não houver itens, navegar para CreateOrder vazio
      router.push('/orders/create');
    }
  };

  // Função para criar novo pedido
  const handleCreateOrder = (): void => {
    router.push('/orders/create');
  };

  // Função para formatar data completa
  const formatFullDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <HStack space={3}>
          <Pressable onPress={onRefresh}>
            <Icon as={Ionicons} name="refresh-outline" size="md" color="white" />
          </Pressable>
          <Pressable onPress={handleCreateOrder}>
            <Icon as={Ionicons} name="add-circle-outline" size="md" color="white" />
          </Pressable>
        </HStack>
      </HStack>
      
      {/* Tabs */}
      <HStack px={6} py={4} space={4} bg="white" shadow={1}>
        <Pressable onPress={() => setActiveTab("all")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "all" ? colors.primary : "transparent"} pb={1}>
            <Text color={activeTab === "all" ? colors.primary : colors.grayText} fontWeight={activeTab === "all" ? "bold" : "normal"}>
              Todos ({orders.length})
            </Text>
          </Box>
        </Pressable>
        <Pressable onPress={() => setActiveTab("active")}>
          <Box borderBottomWidth={2} borderBottomColor={activeTab === "active" ? colors.primary : "transparent"} pb={1}>
            <Text color={activeTab === "active" ? colors.primary : colors.grayText} fontWeight={activeTab === "active" ? "bold" : "normal"}>
              Ativos ({orders.filter(order => !['delivered', 'canceled'].includes(order.status.toLowerCase())).length})
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <Center flex={1} py={10}>
            <Spinner size="lg" color={colors.primary} />
            <Text mt={4} color={colors.dark}>Carregando pedidos...</Text>
          </Center>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderItemCard 
              key={order.id} 
              order={order} 
              onPress={() => handleOrderPress(order)}
              onReorder={() => handleReorder(order)}
              onConfirmDelivery={confirmDelivery} // Passar a função de confirmar entrega
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
              _pressed={{ bg: colors.primary + "e0" }}
              leftIcon={<Icon as={Ionicons} name="pizza" size="sm" />}
              onPress={handleCreateOrder}
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
          _pressed={{ bg: colors.primary + "e0" }}
          onPress={handleCreateOrder}
        >
          <Icon as={Ionicons} name="add" color="white" size="md" />
        </Pressable>
      </Box>

      {/* Modal de Detalhes do Pedido */}
      <Modal isOpen={showOrderDetails} onClose={() => setShowOrderDetails(false)} size="xl">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            Pedido #{selectedOrder?.id || 'Carregando...'}
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              {selectedOrder ? (
                <>
                  {/* Status */}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold">Status:</Text>
                    <Badge 
                      bg={selectedOrder.status === 'delivered' ? colors.success + '20' : colors.warning + '20'}
                      px={2}
                      py={1}
                      rounded="md"
                    >
                      <Text 
                        fontSize="sm" 
                        color={selectedOrder.status === 'delivered' ? colors.success : colors.warning}
                        fontWeight="medium"
                      >
                        {selectedOrder.status === 'pending' ? 'Pendente' :
                         selectedOrder.status === 'processing' ? 'Processando' :
                         selectedOrder.status === 'shipped' ? 'Enviado' :
                         selectedOrder.status === 'delivered' ? 'Entregue' :
                         selectedOrder.status === 'canceled' ? 'Cancelado' : selectedOrder.status}
                      </Text>
                    </Badge>
                  </HStack>

                  {/* Informações Gerais */}
                  <VStack space={2}>
                    <HStack justifyContent="space-between">
                      <Text color={colors.grayText}>Data:</Text>
                      <Text fontWeight="medium">{formatFullDate(selectedOrder.created_at)}</Text>
                    </HStack>
                    
                    <HStack justifyContent="space-between">
                      <Text color={colors.grayText}>Total:</Text>
                      <Text fontWeight="bold" color={colors.primary} fontSize="lg">
                        R$ {parseFloat(selectedOrder.total_amount.toString()).toFixed(2).replace('.', ',')}
                      </Text>
                    </HStack>

                    <HStack justifyContent="space-between">
                      <Text color={colors.grayText}>Pagamento:</Text>
                      <Text fontWeight="medium">
                        {selectedOrder.payment_method === 'cash' ? 'Dinheiro' :
                         selectedOrder.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                         selectedOrder.payment_method === 'debit_card' ? 'Cartão de Débito' :
                         selectedOrder.payment_method === 'pix' ? 'PIX' : selectedOrder.payment_method}
                      </Text>
                    </HStack>

                    {selectedOrder.contact_phone && (
                      <HStack justifyContent="space-between">
                        <Text color={colors.grayText}>Telefone:</Text>
                        <Text fontWeight="medium">{selectedOrder.contact_phone}</Text>
                      </HStack>
                    )}
                  </VStack>

                  {/* Endereço de Entrega */}
                  {selectedOrder.delivery_address && (
                    <VStack space={2}>
                      <Text fontWeight="bold">Endereço de Entrega:</Text>
                      <Text fontSize="sm" color={colors.grayText}>
                        {selectedOrder.delivery_address}
                      </Text>
                    </VStack>
                  )}

                  {/* Itens do Pedido */}
                  <VStack space={2}>
                    <Text fontWeight="bold">Itens do Pedido:</Text>
                    {selectedOrder.item_orders?.map((item, index) => (
                      <Box key={index} borderWidth={1} borderColor="gray.200" borderRadius="md" p={3}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                          <VStack flex={1} space={1}>
                            <Text fontWeight="medium">{item.item?.name || 'Item indisponível'}</Text>
                            <Text fontSize="sm" color={colors.grayText}>
                              Tamanho: {item.size === 'small' ? 'P' : item.size === 'medium' ? 'M' : 'G'} • 
                              Qtd: {item.quantity}
                            </Text>
                            {item.special_instructions && (
                              <Text fontSize="xs" color={colors.grayText} italic>
                                {item.special_instructions}
                              </Text>
                            )}
                          </VStack>
                          <VStack alignItems="flex-end">
                            <Text fontSize="sm" color={colors.grayText}>
                              R$ {parseFloat(item.unit_price.toString()).toFixed(2).replace('.', ',')} un.
                            </Text>
                            <Text fontWeight="bold" color={colors.primary}>
                              R$ {parseFloat(item.subtotal.toString()).toFixed(2).replace('.', ',')}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>

                  {/* Observações */}
                  {selectedOrder.notes && (
                    <VStack space={2}>
                      <Text fontWeight="bold">Observações:</Text>
                      <Text fontSize="sm" color={colors.grayText}>
                        {selectedOrder.notes}
                      </Text>
                    </VStack>
                  )}
                </>
              ) : (
                <Center py={4}>
                  <Spinner size="lg" color={colors.primary} />
                  <Text mt={2} color={colors.grayText}>Carregando detalhes...</Text>
                </Center>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button>Fechar</Button>
              <Button 
                disabled={!selectedOrder}
                onPress={() => {
                  setShowOrderDetails(false);
                  if (selectedOrder) {
                    handleReorder(selectedOrder);
                  }
                }}
              >
                Pedir Novamente
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

export default Orders;