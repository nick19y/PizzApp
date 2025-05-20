import React from "react";
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
  IPressableProps
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Interfaces para tipagem
interface OngoingOrder {
  id: string;
  date: string;
  status: string;
  estimatedTime: string;
}

interface LucideIconProps {
  name: string;
  color: string;
  size: string | number;
}

// Dados simulados de pedidos em andamento
const ongoingOrders: OngoingOrder[] = [
  {
    id: "PED-1234",
    date: "16 de maio de 2025",
    status: "Em preparo",
    estimatedTime: "20 min"
  }
];

// Componente personalizado para ícones consistentes com Lucide
const LucideIcon: React.FC<LucideIconProps> = ({ name, color, size }) => {
  // Mapeamento de ícones do Lucide para Ionicons
  const iconMap: Record<string, string> = {
    "pizza": "pizza-outline",
    "cart": "cart-outline",
    "time": "time-outline",
    "navigate": "navigate-circle-outline",
    "food": "fast-food-outline",
    "calendar": "calendar-outline",
    "gift": "gift-outline",
    "chevron-forward": "chevron-forward",
  };

  return (
    <Icon as={Ionicons} name={iconMap[name] || name} size={size} color={color} />
  );
};

const Home: React.FC = () => {
  const theme = useTheme();
  
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

  return (
    <VStack flex={1} bg={colors.light} safeArea>
      {/* Header inspirado no web app */}
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
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
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
                  >
                    Fazer Pedido
                  </Button>
                </VStack>
                
                <Image 
                  source={{ uri: "https://via.placeholder.com/200" }}
                  alt="Pizza"
                  size="md"
                  borderRadius="full"
                />
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* Pedidos em Andamento */}
        <VStack px={6} mb={6}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>PEDIDOS EM ANDAMENTO</Heading>
            <Pressable>
              <Text color={colors.primary} fontWeight="medium" fontSize="xs">Ver todos</Text>
            </Pressable>
          </HStack>

          {ongoingOrders.length > 0 ? (
            ongoingOrders.map((order) => (
              <Pressable key={order.id} mb={4}>
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
                      <Text fontWeight="bold" fontSize="md" color={colors.dark}>{order.id}</Text>
                      <Text fontSize="xs" color={colors.grayText}>{order.date}</Text>
                    </VStack>
                    <Center 
                      bg={`${colors.primary}10`}  
                      px={3} 
                      py={1}
                      borderRadius="full"
                    >
                      <Text color={colors.primary} fontWeight="medium" fontSize="xs">
                        {order.status}
                      </Text>
                    </Center>
                  </HStack>
                  
                  <HStack space={2} alignItems="center" mt={2}>
                    <Icon as={Ionicons} name="time-outline" color={colors.grayText} size="xs" />
                    <Text fontSize="xs" color={colors.grayText}>
                      Tempo estimado: <Text fontWeight="bold" color={colors.dark}>{order.estimatedTime}</Text>
                    </Text>
                  </HStack>
                  
                  <Button
                    variant="ghost"
                    leftIcon={<Icon as={Ionicons} name="navigate-circle-outline" color={colors.primary} size="sm" />}
                    _text={{ color: colors.primary, fontSize: "xs" }}
                    mt={2}
                    size="sm"
                  >
                    Acompanhar Pedido
                  </Button>
                </Box>
              </Pressable>
            ))
          ) : (
            <Center bg={colors.grayBg} py={8} borderRadius="lg">
              <Icon as={Ionicons} name="fast-food-outline" size="4xl" color="gray.300" />
              <Text color={colors.grayText} mt={2}>
                Você não tem pedidos em andamento
              </Text>
              <Button 
                mt={4}
                variant="outline"
                borderColor={colors.primary}
                _text={{ color: colors.primary }}
              >
                Fazer um Pedido
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
        <VStack px={6} mb={10}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="sm" color={colors.dark}>PROMOÇÕES</Heading>
            <Pressable>
              <Text color={colors.primary} fontWeight="medium" fontSize="xs">Ver todas</Text>
            </Pressable>
          </HStack>
          
          <Pressable mb={4}>
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
          
          <Pressable>
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
                  <Text fontWeight="bold" color={colors.dark}>Fidelidade</Text>
                  <Text fontSize="xs" color={colors.grayText}>Acumule pontos e ganhe pizzas grátis</Text>
                </VStack>
                <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
              </HStack>
            </Box>
          </Pressable>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default Home;