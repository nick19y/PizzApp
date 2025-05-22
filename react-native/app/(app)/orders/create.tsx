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
  Input,
  TextArea,
  Select,
  CheckIcon,
  Modal,
  FormControl,
  IconButton,
  Alert
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from 'expo-router';
import axiosClient from "../../../axios-client";

// Interfaces para tipagem
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price_small: number;
  price_medium: number;
  price_large: number;
  category: string;
  image?: string;
}

interface OrderItem {
  item_id: number;
  itemName: string;
  size: 'small' | 'medium' | 'large';
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

interface OrderData {
  delivery_address: string;
  contact_phone: string;
  notes?: string;
  delivery_time?: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix';
  items: {
    item_id: number;
    size: string;
    quantity: number;
    special_instructions?: string;
  }[];
}

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b",
  success: "#16a34a",
  danger: "#ef4444"
};

const CreateOrder: React.FC = () => {
  const params = useLocalSearchParams();
  const reorderItems = params.reorderItems ? JSON.parse(params.reorderItems as string) : null;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Sistema de tamanhos dos itens (como no React)
  const [itemSizes, setItemSizes] = useState<Record<number, 'small' | 'medium' | 'large'>>({});
  
  // Form data
  const [formData, setFormData] = useState({
    delivery_address: '',
    contact_phone: '',
    notes: '',
    delivery_time: '',
    payment_method: 'cash' as 'cash' | 'credit_card' | 'debit_card' | 'pix'
  });

  const toast = useToast();

  // Métodos de pagamento
  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' }
  ];

  // Função para formatar telefone automaticamente
  const formatPhoneNumber = (phone: string): string => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Aplica a máscara (xx) xxxxx-xxxx
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Handler para mudança no telefone
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setFormData({...formData, contact_phone: formatted});
  };

  // Buscar itens do menu
  const fetchMenuItems = async () => {
    setIsLoadingItems(true);
    try {
      const response = await axiosClient.get('/items');
      console.log("=== DEBUG API RESPONSE ===");
      console.log("Response completa:", response);
      console.log("Response.data:", response.data);
      console.log("Primeiro item:", response.data[0] || response.data.data?.[0]);
      console.log("Estrutura do primeiro item:", JSON.stringify(response.data[0] || response.data.data?.[0], null, 2));
      
      const items = response.data.data || response.data;
      console.log("Items processados:", items);
      setMenuItems(items);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      toast.show({
        description: "Erro ao carregar itens do menu",
        placement: "top"
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    
    // Se houver itens para reorder, carregá-los
    if (reorderItems && reorderItems.length > 0) {
      const reorderOrderItems: OrderItem[] = reorderItems.map((item: any) => ({
        item_id: item.item_id,
        itemName: item.itemName,
        size: item.size,
        quantity: item.quantity,
        unit_price: 0, // Será calculado quando os menuItems estiverem carregados
        special_instructions: item.special_instructions
      }));
      
      setSelectedItems(reorderOrderItems);
      
      toast.show({
        description: "Itens do pedido anterior carregados",
        placement: "top"
      });
    }
  }, [reorderItems]);

  // Effect para calcular preços quando menuItems são carregados e há itens de reorder
  useEffect(() => {
    if (menuItems.length > 0 && selectedItems.length > 0 && selectedItems[0].unit_price === 0) {
      const updatedItems = selectedItems.map(selectedItem => {
        const menuItem = menuItems.find(item => item.id === selectedItem.item_id);
        if (menuItem) {
          const unit_price = getPriceBySize(menuItem, selectedItem.size);
          return { ...selectedItem, unit_price };
        }
        return selectedItem;
      });
      setSelectedItems(updatedItems);
    }
  }, [menuItems]);

  // Função para obter preço baseado no tamanho - VERSÃO CORRIGIDA
  const getPriceBySize = (item: MenuItem, size: 'small' | 'medium' | 'large'): number => {
    if (!item) {
      console.log("❌ Item não fornecido para getPriceBySize");
      return 0;
    }
    
    console.log(`🔍 Obtendo preço para item ${item.name}, tamanho ${size}`);
    console.log(`Preços disponíveis:`, {
      small: item.price_small,
      medium: item.price_medium,
      large: item.price_large
    });
    
    let price = 0;
    switch (size) {
      case 'small': 
        price = parseFloat(String(item.price_small)) || 0;
        break;
      case 'medium': 
        price = parseFloat(String(item.price_medium)) || 0;
        break;
      case 'large': 
        price = parseFloat(String(item.price_large)) || 0;
        break;
      default: 
        price = parseFloat(String(item.price_small)) || 0;
    }
    
    console.log(`💰 Preço calculado: ${price}`);
    return price;
  };

  // Função para formatar preço
  const formatPrice = (price: number | string | undefined | null): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
    const safePrice = isNaN(numPrice) ? 0 : numPrice;
    return safePrice.toFixed(2).replace('.', ',');
  };

  // Função para obter label do tamanho
  const getSizeLabel = (size: 'small' | 'medium' | 'large'): string => {
    switch (size) {
      case 'small': return 'P';
      case 'medium': return 'M';
      case 'large': return 'G';
      default: return 'P';
    }
  };

  // Função para mudar tamanho de um item (como no React)
  const handleSizeChange = (itemId: number, size: 'small' | 'medium' | 'large') => {
    console.log(`🔄 Mudando tamanho do item ${itemId} para ${size}`);
    setItemSizes(prev => ({
      ...prev,
      [itemId]: size,
    }));
  };

  // Função para adicionar item diretamente (como no React)
  const handleAddItem = (item: MenuItem) => {
    console.log(`➕ Adicionando item:`, item);
    const selectedSize = itemSizes[item.id] || 'small';
    console.log(`Tamanho selecionado: ${selectedSize}`);
    
    // Determinar o preço baseado no tamanho selecionado
    const unit_price = getPriceBySize(item, selectedSize);
    console.log(`Preço unitário calculado: ${unit_price}`);
    
    // Verificar se o item já existe no carrinho com o mesmo tamanho
    const existingItemIndex = selectedItems.findIndex(
      i => i.item_id === item.id && i.size === selectedSize
    );
    
    if (existingItemIndex !== -1) {
      // Se já existe, aumentar a quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
      console.log(`✅ Quantidade aumentada para item existente`);
    } else {
      // Se não existe, adicionar novo item
      const newItem: OrderItem = {
        item_id: item.id,
        itemName: item.name,
        size: selectedSize,
        quantity: 1,
        unit_price,
        special_instructions: ''
      };
      
      console.log(`➕ Novo item criado:`, newItem);
      setSelectedItems(prev => [...prev, newItem]);
    }

    toast.show({
      description: "Item adicionado ao pedido",
      placement: "top"
    });
  };

  // Abrir modal para adicionar item com customização
  const openAddItemModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setSelectedSize('small');
    setQuantity(1);
    setSpecialInstructions('');
    setShowModal(true);
  };

  // Adicionar item via modal com customização
  const addItemToOrderViaModal = () => {
    if (!selectedMenuItem) return;

    const unit_price = getPriceBySize(selectedMenuItem, selectedSize);
    
    // Verificar se o item já existe no carrinho com o mesmo tamanho
    const existingItemIndex = selectedItems.findIndex(
      item => item.item_id === selectedMenuItem.id && item.size === selectedSize
    );

    if (existingItemIndex !== -1) {
      // Se já existe, atualizar quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += quantity;
      if (specialInstructions) {
        updatedItems[existingItemIndex].special_instructions = specialInstructions;
      }
      setSelectedItems(updatedItems);
    } else {
      // Se não existe, adicionar novo item
      const newItem: OrderItem = {
        item_id: selectedMenuItem.id,
        itemName: selectedMenuItem.name,
        size: selectedSize,
        quantity: quantity,
        unit_price: unit_price,
        special_instructions: specialInstructions || undefined
      };
      setSelectedItems([...selectedItems, newItem]);
    }

    setShowModal(false);
    toast.show({
      description: "Item adicionado ao pedido",
      placement: "top"
    });
  };

  // Remover item do pedido
  const handleRemoveItem = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
    toast.show({
      description: "Item removido do pedido",
      placement: "top"
    });
  };

  // Atualizar quantidade do item
  const handleUpdateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = newQuantity;
    setSelectedItems(updatedItems);
  };

  // Atualizar instruções especiais
  const handleSpecialInstructionsChange = (index: number, instructions: string) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, special_instructions: instructions } : item
    ));
  };

  // Calcular total do pedido
  const calculateTotal = (): number => {
    const total = selectedItems.reduce((sum, item) => {
      const itemTotal = (item.unit_price || 0) * item.quantity;
      console.log(`Item ${item.itemName}: ${item.unit_price} x ${item.quantity} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    console.log(`💰 Total calculado: ${total}`);
    return total;
  };

  // Validar formulário
  const validateForm = (): boolean => {
    if (!formData.contact_phone.trim()) {
      toast.show({
        description: "Telefone é obrigatório",
        placement: "top"
      });
      return false;
    }

    if (selectedItems.length === 0) {
      toast.show({
        description: "Adicione pelo menos um item ao pedido",
        placement: "top"
      });
      return false;
    }

    return true;
  };

  // Submeter pedido - VERSÃO CORRIGIDA
  const submitOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Preparar os dados exatamente como no React
      const orderData: OrderData = {
        delivery_address: formData.delivery_address,
        contact_phone: formData.contact_phone,
        notes: formData.notes || undefined,
        delivery_time: formData.delivery_time || undefined,
        payment_method: formData.payment_method,
        items: selectedItems.map(item => ({
          item_id: item.item_id,
          size: item.size,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined
        }))
      };

      console.log("=== DEBUG PEDIDO ===");
      console.log("Dados sendo enviados:", JSON.stringify(orderData, null, 2));
      console.log("URL:", "/orders");
      console.log("Método:", "POST");
      
      // Tentar primeiro a rota padrão para usuários autenticados
      console.log("Tentando criar pedido via /orders...");
      const response = await axiosClient.post('/orders', orderData);
      
      console.log("✅ Pedido criado com sucesso:", response.data);
      
      toast.show({
        description: "Pedido criado com sucesso!",
        placement: "top",
        duration: 3000
      });
      
      // Navegar de volta para a lista de pedidos
      router.back();
      
    } catch (error: any) {
      console.error("❌ Erro ao criar pedido:", error);
      
      // Log detalhado do erro
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);
        
        // Mostrar erro específico se disponível
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error ||
                           `Erro ${error.response.status}: ${error.response.statusText}`;
        
        toast.show({
          description: errorMessage,
          placement: "top",
          duration: 5000
        });
      } else if (error.request) {
        console.error("Erro de rede:", error.request);
        toast.show({
          description: "Erro de conexão. Verifique sua internet.",
          placement: "top"
        });
      } else {
        console.error("Erro:", error.message);
        toast.show({
          description: "Erro inesperado. Tente novamente.",
          placement: "top"
        });
      }
    } finally {
      setIsLoading(false);
    }
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
        <HStack space={3} alignItems="center">
          <Pressable onPress={() => router.back()}>
            <Icon as={Ionicons} name="arrow-back-outline" size="md" color="white" />
          </Pressable>
          <Heading size="md" color="white">
            {reorderItems ? "Refazer Pedido" : "Criar Pedido"}
          </Heading>
        </HStack>
        <Icon as={Ionicons} name="receipt-outline" size="md" color="white" />
      </HStack>

      <ScrollView 
        flex={1} 
        px={4} 
        pt={4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Dados do Pedido */}
        <Box bg="white" borderRadius="lg" p={4} mb={4} shadow={1}>
          <Heading size="sm" mb={4} color={colors.dark}>
            <Icon as={Ionicons} name="information-circle-outline" size="sm" mr={2} />
            Dados do Pedido
          </Heading>
          
          <VStack space={4}>
            <FormControl isRequired>
              <FormControl.Label>Telefone</FormControl.Label>
              <Input
                placeholder="(11) 99999-9999"
                value={formData.contact_phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={15}
                h={12}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Endereço de Entrega</FormControl.Label>
              <Input
                placeholder="Endereço completo"
                value={formData.delivery_address}
                onChangeText={(text) => setFormData({...formData, delivery_address: text})}
                h={12}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Método de Pagamento</FormControl.Label>
              <Select
                selectedValue={formData.payment_method}
                onValueChange={(value) => setFormData({...formData, payment_method: value as any})}
                _selectedItem={{
                  bg: colors.primary + "20",
                  endIcon: <CheckIcon size="5" />
                }}
                h={12}
                fontSize="md"
              >
                {paymentMethods.map(method => (
                  <Select.Item key={method.value} label={method.label} value={method.value} />
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormControl.Label>Data e Hora de Entrega (Opcional)</FormControl.Label>
              <Input
                placeholder="Ex: 2024-12-25T18:30"
                value={formData.delivery_time}
                onChangeText={(text) => setFormData({...formData, delivery_time: text})}
                h={12}
              />
              <Text fontSize="xs" color={colors.grayText} mt={1}>
                Formato: AAAA-MM-DDTHH:MM
              </Text>
            </FormControl>

            <FormControl>
              <FormControl.Label>Observações</FormControl.Label>
              <TextArea
                placeholder="Observações sobre o pedido (opcional)"
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                h={20}
                totalLines={3}
                autoCompleteType="off"
                tvParallaxProperties={{}}
                onTextInput={() => {}}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Debug Info - Remover em produção */}
        {__DEV__ && (
          <Box bg="yellow.100" borderRadius="lg" p={4} mb={4}>
            <Text fontWeight="bold" mb={2}>Debug Info:</Text>
            <Text fontSize="xs">Items: {selectedItems.length}</Text>
            <Text fontSize="xs">Menu Items: {menuItems.length}</Text>
            <Text fontSize="xs">Total: R$ {calculateTotal().toFixed(2)}</Text>
            <Text fontSize="xs">Telefone: {formData.contact_phone}</Text>
            {selectedItems.length > 0 && (
              <Text fontSize="xs">Primeiro item unit_price: {selectedItems[0].unit_price}</Text>
            )}
          </Box>
        )}

        {/* Itens Selecionados */}
        <Box bg="white" borderRadius="lg" p={4} mb={4} shadow={1}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>
              <Icon as={Ionicons} name="list-outline" size="sm" mr={2} />
              Itens do Pedido
            </Heading>
            {selectedItems.length > 0 && (
              <Badge bg={colors.primary} rounded="md" px={2} py={1}>
                <Text color="white" fontWeight="bold" fontSize="sm">
                  R$ {calculateTotal().toFixed(2).replace('.', ',')}
                </Text>
              </Badge>
            )}
          </HStack>

          {selectedItems.length > 0 ? (
            <VStack space={3}>
              {selectedItems.map((item, index) => (
                <Box key={index} borderWidth={1} borderColor="gray.200" borderRadius="md" p={3}>
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack flex={1} space={2}>
                      <Text fontWeight="bold" color={colors.dark}>{item.itemName}</Text>
                      <Text fontSize="sm" color={colors.grayText}>
                        Tamanho: {getSizeLabel(item.size)} • 
                        R$ {formatPrice(item.unit_price)}
                      </Text>
                      {item.special_instructions && (
                        <Text fontSize="xs" color={colors.grayText} italic>
                          {item.special_instructions}
                        </Text>
                      )}
                      <HStack space={2} alignItems="center">
                        <IconButton
                          icon={<Icon as={Ionicons} name="remove" color={colors.primary} />}
                          size="sm"
                          onPress={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        />
                        <Text fontWeight="bold" fontSize="lg">{item.quantity}</Text>
                        <IconButton
                          icon={<Icon as={Ionicons} name="add" color={colors.primary} />}
                          size="sm"
                          onPress={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                        />
                      </HStack>
                      {/* Campo para instruções especiais */}
                      <Input
                        placeholder="Instruções especiais (opcional)"
                        value={item.special_instructions || ''}
                        onChangeText={(text) => handleSpecialInstructionsChange(index, text)}
                        fontSize="sm"
                        h={10}
                      />
                    </VStack>
                    <VStack alignItems="flex-end" space={2}>
                      <Text fontWeight="bold" color={colors.primary} fontSize="lg">
                        R$ {((item.unit_price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </Text>
                      <IconButton
                        icon={<Icon as={Ionicons} name="trash-outline" color={colors.danger} />}
                        size="sm"
                        onPress={() => handleRemoveItem(index)}
                      />
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Center py={8}>
              <Icon as={Ionicons} name="basket-outline" size="4xl" color={colors.grayText} mb={2} />
              <Text color={colors.grayText}>Nenhum item adicionado</Text>
              <Text fontSize="sm" color={colors.grayText}>Adicione itens do cardápio abaixo</Text>
            </Center>
          )}
        </Box>

        {/* Menu de Itens - Sistema igual ao React */}
        <Box bg="white" borderRadius="lg" p={4} mb={4} shadow={1}>
          <Heading size="sm" mb={4} color={colors.dark}>
            <Icon as={Ionicons} name="restaurant-outline" size="sm" mr={2} />
            Adicionar Itens
          </Heading>

          {isLoadingItems ? (
            <Center py={8}>
              <Spinner size="lg" color={colors.primary} />
              <Text mt={2} color={colors.grayText}>Carregando cardápio...</Text>
            </Center>
          ) : menuItems.length > 0 ? (
            <VStack space={4}>
              {menuItems.map((item) => (
                <Box key={item.id} borderWidth={1} borderColor="gray.200" borderRadius="md" p={4}>
                  <VStack space={3}>
                    {/* Header do item */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <Text fontWeight="bold" color={colors.dark} fontSize="md">{item.name}</Text>
                        <Text fontSize="sm" color={colors.grayText} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Preços por tamanho */}
                    <HStack space={4} justifyContent="space-around" py={2}>
                      <VStack alignItems="center">
                        <Text fontSize="xs" color={colors.grayText} fontWeight="bold">Pequeno</Text>
                        <Text fontSize="sm" color={colors.primary} fontWeight="bold">
                          R$ {formatPrice(item.price_small)}
                        </Text>
                      </VStack>
                      <VStack alignItems="center">
                        <Text fontSize="xs" color={colors.grayText} fontWeight="bold">Médio</Text>
                        <Text fontSize="sm" color={colors.primary} fontWeight="bold">
                          R$ {formatPrice(item.price_medium)}
                        </Text>
                      </VStack>
                      <VStack alignItems="center">
                        <Text fontSize="xs" color={colors.grayText} fontWeight="bold">Grande</Text>
                        <Text fontSize="sm" color={colors.primary} fontWeight="bold">
                          R$ {formatPrice(item.price_large)}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Controles do item */}
                    <VStack space={3}>
                      {/* Seletor de tamanho */}
                      <Select
                        selectedValue={itemSizes[item.id] || 'small'}
                        onValueChange={(value) => handleSizeChange(item.id, value as any)}
                        _selectedItem={{
                          bg: colors.primary + "20",
                          endIcon: <CheckIcon size="4" />
                        }}
                        fontSize="md"
                        h={12}
                        placeholder="Selecione o tamanho"
                      >
                        <Select.Item 
                          label={`Pequeno - R$ ${formatPrice(item.price_small)}`} 
                          value="small" 
                        />
                        <Select.Item 
                          label={`Médio - R$ ${formatPrice(item.price_medium)}`} 
                          value="medium" 
                        />
                        <Select.Item 
                          label={`Grande - R$ ${formatPrice(item.price_large)}`} 
                          value="large" 
                        />
                      </Select>

                      {/* Botões de ação */}
                      <HStack space={2} justifyContent="space-between">
                        <Button 
                          flex={1}
                          bg={colors.primary}
                          _pressed={{ bg: colors.primary + "d0" }}
                          _text={{ color: "white", fontWeight: "bold" }}
                          onPress={() => handleAddItem(item)}
                          leftIcon={<Icon as={Ionicons} name="add" size="sm" color="white" />}
                          h={12}
                        >
                          Adicionar
                        </Button>
                        <IconButton
                          icon={<Icon as={Ionicons} name="settings-outline" color={colors.primary} />}
                          size="md"
                          onPress={() => openAddItemModal(item)}
                          bg="white"
                          borderWidth={1}
                          borderColor={colors.primary}
                          _pressed={{ bg: colors.primary + "20" }}
                        />
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Center py={8}>
              <Text color={colors.grayText}>Nenhum item disponível</Text>
            </Center>
          )}
        </Box>
      </ScrollView>

      {/* Botão Finalizar Pedido Fixo */}
      {selectedItems.length > 0 && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTopWidth={1}
          borderTopColor="gray.200"
          p={4}
          safeAreaBottom
        >
          <VStack space={2}>
            {/* Resumo do pedido */}
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontSize="sm" color={colors.grayText}>
                  {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={colors.dark}>
                  Total: R$ {calculateTotal().toFixed(2).replace('.', ',')}
                </Text>
              </VStack>
              <Icon as={Ionicons} name="receipt-outline" size="lg" color={colors.primary} />
            </HStack>
            
            <Button
              bg={colors.primary}
              _pressed={{ bg: colors.primary + "d0" }}
              size="lg"
              h={14}
              leftIcon={<Icon as={Ionicons} name="checkmark-circle" size="md" color="white" />}
              onPress={submitOrder}
              isLoading={isLoading}
              isLoadingText="Criando pedido..."
              _text={{ fontSize: "md", fontWeight: "bold" }}
            >
              Finalizar Pedido
            </Button>
          </VStack>
        </Box>
      )}

      {/* Modal Adicionar Item com Customização */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Personalizar Item</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              {selectedMenuItem ? (
                <>
                  <VStack space={2}>
                    <Text fontWeight="bold" fontSize="lg">{selectedMenuItem.name}</Text>
                    <Text fontSize="sm" color={colors.grayText}>
                      {selectedMenuItem.description}
                    </Text>
                  </VStack>

                  <FormControl>
                    <FormControl.Label>Tamanho</FormControl.Label>
                    <Select
                      selectedValue={selectedSize}
                      onValueChange={(value) => setSelectedSize(value as any)}
                      _selectedItem={{
                        bg: colors.primary + "20",
                        endIcon: <CheckIcon size="5" />
                      }}
                      h={12}
                      fontSize="md"
                    >
                      <Select.Item 
                        label={`Pequeno - R$ ${formatPrice(selectedMenuItem.price_small)}`} 
                        value="small" 
                      />
                      <Select.Item 
                        label={`Médio - R$ ${formatPrice(selectedMenuItem.price_medium)}`} 
                        value="medium" 
                      />
                      <Select.Item 
                        label={`Grande - R$ ${formatPrice(selectedMenuItem.price_large)}`} 
                        value="large" 
                      />
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Quantidade</FormControl.Label>
                    <HStack space={3} alignItems="center" justifyContent="center">
                      <IconButton
                        icon={<Icon as={Ionicons} name="remove" />}
                        size="md"
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        bg={colors.primary + "20"}
                        _pressed={{ bg: colors.primary + "40" }}
                      />
                      <Text fontWeight="bold" fontSize="2xl" minW="12" textAlign="center">
                        {quantity}
                      </Text>
                      <IconButton
                        icon={<Icon as={Ionicons} name="add" />}
                        size="md"
                        onPress={() => setQuantity(quantity + 1)}
                        bg={colors.primary + "20"}
                        _pressed={{ bg: colors.primary + "40" }}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Instruções Especiais</FormControl.Label>
                    <TextArea
                      placeholder="Ex: sem cebola, massa fina..."
                      value={specialInstructions}
                      onChangeText={setSpecialInstructions}
                      h={20}
                      totalLines={3}
                      autoCompleteType="off"
                      tvParallaxProperties={{}}
                      onTextInput={() => {}}
                    />
                  </FormControl>

                  <Box bg={colors.primary + "10"} p={4} borderRadius="md" borderWidth={1} borderColor={colors.primary + "30"}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold" fontSize="md">Subtotal:</Text>
                      <Text fontWeight="bold" color={colors.primary} fontSize="lg">
                        R$ {(getPriceBySize(selectedMenuItem, selectedSize) * quantity).toFixed(2).replace('.', ',')}
                      </Text>
                    </HStack>
                  </Box>
                </>
              ) : (
                <Center py={4}>
                  <Spinner size="lg" color={colors.primary} />
                  <Text mt={2} color={colors.grayText}>Carregando item...</Text>
                </Center>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button 
                variant="ghost" 
                colorScheme="blueGray" 
                onPress={() => setShowModal(false)}
                _text={{ fontSize: "md" }}
              >
                Cancelar
              </Button>
              <Button 
                bg={colors.primary} 
                onPress={addItemToOrderViaModal} 
                disabled={!selectedMenuItem}
                _text={{ fontSize: "md", fontWeight: "bold" }}
                _pressed={{ bg: colors.primary + "d0" }}
              >
                Adicionar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

export default CreateOrder;