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
  // Para compatibilidade com o formato do React
  specific_details?: {
    item_id: number;
    name: string;
    description: string;
  };
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

  // Buscar itens do menu
  const fetchMenuItems = async () => {
    setIsLoadingItems(true);
    try {
      const response = await axiosClient.get('/items');
      console.log("Itens do menu carregados:", response.data);
      setMenuItems(response.data);
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
        special_instructions: item.special_instructions,
        specific_details: {
          item_id: item.item_id,
          name: item.itemName,
          description: ''
        }
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

  // Função para obter preço baseado no tamanho
  const getPriceBySize = (item: MenuItem, size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return item.price_small;
      case 'medium': return item.price_medium;
      case 'large': return item.price_large;
      default: return item.price_small;
    }
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
    setItemSizes(prev => ({
      ...prev,
      [itemId]: size,
    }));
  };

  // Função para adicionar item diretamente (como no React)
  const handleAddItem = (item: MenuItem) => {
    const selectedSize = itemSizes[item.id] || 'small';
    
    // Determinar o preço baseado no tamanho selecionado
    const unit_price = getPriceBySize(item, selectedSize);
    
    // Verificar se o item já existe no carrinho com o mesmo tamanho
    const existingItemIndex = selectedItems.findIndex(
      i => i.item_id === item.id && i.size === selectedSize
    );
    
    if (existingItemIndex !== -1) {
      // Se já existe, aumentar a quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Se não existe, adicionar novo item
      const newItem: OrderItem = {
        item_id: item.id,
        itemName: item.name,
        size: selectedSize,
        quantity: 1,
        unit_price,
        special_instructions: '',
        specific_details: {
          item_id: item.id,
          name: item.name,
          description: item.description
        }
      };
      
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
        special_instructions: specialInstructions || undefined,
        specific_details: {
          item_id: selectedMenuItem.id,
          name: selectedMenuItem.name,
          description: selectedMenuItem.description
        }
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
    return selectedItems.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);
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

  // Submeter pedido
  const submitOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
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
          special_instructions: item.special_instructions
        }))
      };

      console.log("Enviando pedido:", orderData);
      const response = await axiosClient.post('/orders', orderData);
      
      toast.show({
        description: "Pedido criado com sucesso!",
        placement: "top",
        duration: 3000
      });

      console.log("Pedido criado:", response.data);
      
      // Navegar de volta para a lista de pedidos
      router.back();
      
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.show({
        description: "Erro ao criar pedido. Tente novamente.",
        placement: "top"
      });
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
        contentContainerStyle={{ paddingBottom: 20 }}
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
                placeholder="(00) 00000-0000"
                value={formData.contact_phone}
                onChangeText={(text) => setFormData({...formData, contact_phone: text})}
                keyboardType="phone-pad"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Endereço de Entrega</FormControl.Label>
              <Input
                placeholder="Endereço completo"
                value={formData.delivery_address}
                onChangeText={(text) => setFormData({...formData, delivery_address: text})}
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
              >
                {paymentMethods.map(method => (
                  <Select.Item key={method.value} label={method.label} value={method.value} />
                ))}
              </Select>
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

        {/* Itens Selecionados */}
        <Box bg="white" borderRadius="lg" p={4} mb={4} shadow={1}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>
              <Icon as={Ionicons} name="list-outline" size="sm" mr={2} />
              Itens do Pedido
            </Heading>
            {selectedItems.length > 0 && (
              <Badge bg={colors.primary} rounded="md">
                <Text color="white" fontWeight="bold">
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
                    <VStack flex={1} space={1}>
                      <Text fontWeight="bold" color={colors.dark}>{item.itemName}</Text>
                      <Text fontSize="sm" color={colors.grayText}>
                        Tamanho: {getSizeLabel(item.size)} • 
                        R$ {item.unit_price.toFixed(2).replace('.', ',')}
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
                        <Text fontWeight="bold">{item.quantity}</Text>
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
                        h={8}
                      />
                    </VStack>
                    <VStack alignItems="flex-end" space={1}>
                      <Text fontWeight="bold" color={colors.primary}>
                        R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
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
            <VStack space={3}>
              {menuItems.map((item) => (
                <Box key={item.id} borderWidth={1} borderColor="gray.200" borderRadius="md" p={3}>
                  <VStack space={3}>
                    {/* Header do item */}
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <Text fontWeight="bold" color={colors.dark}>{item.name}</Text>
                        <Text fontSize="sm" color={colors.grayText} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Preços por tamanho */}
                    <HStack space={3} justifyContent="space-between">
                      <Text fontSize="xs" color={colors.grayText}>
                        P: R$ {item.price_small.toFixed(2).replace('.', ',')}
                      </Text>
                      <Text fontSize="xs" color={colors.grayText}>
                        M: R$ {item.price_medium.toFixed(2).replace('.', ',')}
                      </Text>
                      <Text fontSize="xs" color={colors.grayText}>
                        G: R$ {item.price_large.toFixed(2).replace('.', ',')}
                      </Text>
                    </HStack>

                    {/* Controles do item */}
                    <HStack space={2} alignItems="center" justifyContent="space-between">
                      {/* Seletor de tamanho */}
                      <Select
                        flex={1}
                        selectedValue={itemSizes[item.id] || 'small'}
                        onValueChange={(value) => handleSizeChange(item.id, value as any)}
                        _selectedItem={{
                          bg: colors.primary + "20",
                          endIcon: <CheckIcon size="3" />
                        }}
                        fontSize="sm"
                        h={8}
                      >
                        <Select.Item 
                          label={`Pequeno - R$ ${item.price_small.toFixed(2).replace('.', ',')}`} 
                          value="small" 
                        />
                        <Select.Item 
                          label={`Médio - R$ ${item.price_medium.toFixed(2).replace('.', ',')}`} 
                          value="medium" 
                        />
                        <Select.Item 
                          label={`Grande - R$ ${item.price_large.toFixed(2).replace('.', ',')}`} 
                          value="large" 
                        />
                      </Select>

                      {/* Botões de ação */}
                      <HStack space={1}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          borderColor={colors.primary}
                          _text={{ color: colors.primary }}
                          onPress={() => handleAddItem(item)}
                        >
                          Adicionar
                        </Button>
                        <IconButton
                          icon={<Icon as={Ionicons} name="settings-outline" color={colors.primary} />}
                          size="sm"
                          onPress={() => openAddItemModal(item)}
                        />
                      </HStack>
                    </HStack>
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

        {/* Botão Finalizar Pedido */}
        {selectedItems.length > 0 && (
          <Button
            bg={colors.primary}
            _pressed={{ bg: colors.primary + "e0" }}
            size="lg"
            leftIcon={<Icon as={Ionicons} name="checkmark-circle" size="sm" />}
            onPress={submitOrder}
            isLoading={isLoading}
            isLoadingText="Criando pedido..."
          >
            Finalizar Pedido - R$ {calculateTotal().toFixed(2).replace('.', ',')}
          </Button>
        )}
      </ScrollView>

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
                    >
                      <Select.Item 
                        label={`Pequeno - R$ ${selectedMenuItem.price_small.toFixed(2).replace('.', ',')}`} 
                        value="small" 
                      />
                      <Select.Item 
                        label={`Médio - R$ ${selectedMenuItem.price_medium.toFixed(2).replace('.', ',')}`} 
                        value="medium" 
                      />
                      <Select.Item 
                        label={`Grande - R$ ${selectedMenuItem.price_large.toFixed(2).replace('.', ',')}`} 
                        value="large" 
                      />
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Quantidade</FormControl.Label>
                    <HStack space={3} alignItems="center">
                      <IconButton
                        icon={<Icon as={Ionicons} name="remove" />}
                        size="sm"
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      />
                      <Text fontWeight="bold" fontSize="lg">{quantity}</Text>
                      <IconButton
                        icon={<Icon as={Ionicons} name="add" />}
                        size="sm"
                        onPress={() => setQuantity(quantity + 1)}
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

                  <Box bg={colors.grayBg} p={3} borderRadius="md">
                    <HStack justifyContent="space-between">
                      <Text fontWeight="bold">Subtotal:</Text>
                      <Text fontWeight="bold" color={colors.primary}>
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
              <Button variant="ghost" colorScheme="blueGray" onPress={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button bg={colors.primary} onPress={addItemToOrderViaModal} disabled={!selectedMenuItem}>
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