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
  Divider,
  Center,
  Link,
  useToast
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Informações da pizzaria
const pizzariaInfo = {
  nome: "Pizza Delícia",
  descricao: "Servindo as melhores pizzas artesanais desde 2010. Nossos ingredientes são frescos e selecionados para garantir sabor e qualidade em cada mordida.",
  endereco: "Rua Principal, 123 - Centro",
  cidade: "São Paulo, SP",
  cep: "01234-567",
  telefone: "(11) 5555-1234",
  whatsapp: "(11) 98765-4321",
  email: "contato@pizzadelicia.com",
  horario: {
    segunda: "17:00 - 23:00",
    terca: "17:00 - 23:00",
    quarta: "17:00 - 23:00",
    quinta: "17:00 - 23:00",
    sexta: "17:00 - 00:00",
    sabado: "12:00 - 00:00",
    domingo: "12:00 - 22:00"
  },
  redesSociais: {
    instagram: "@pizzadelicia",
    facebook: "PizzaDeliciaOficial",
    twitter: "@pizza_delicia"
  }
};

// Componente para cada informação de contato
const ContactInfo = ({ icon, label, value, onPress }) => (
  <Pressable onPress={onPress}>
    <HStack space={3} alignItems="center" py={3}>
      <Center bg="red.100" p={3} borderRadius="full">
        <Icon as={Ionicons} name={icon} size="md" color="red.500" />
      </Center>
      <VStack flex={1}>
        <Text fontSize="sm" color="gray.500">{label}</Text>
        <Text fontWeight="medium">{value}</Text>
      </VStack>
      <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
    </HStack>
  </Pressable>
);

export default function About() {
  const toast = useToast();
  
  const handleContactPress = (type, value) => {
    toast.show({
      description: `Abrindo ${type}: ${value}`,
      placement: "top"
    });
  };

  return (
    <VStack flex={1} bg="white" safeArea>
      {/* Header */}
      <Box position="relative" height={200}>
        <Image 
          source={{ uri: "https://via.placeholder.com/600x300" }}
          alt="Pizzaria"
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={200}
        />
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          height={200} 
          bg="rgba(0,0,0,0.4)"
        />
        <VStack 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          p={6} 
          space={1}
        >
          <Heading color="white" size="xl">{pizzariaInfo.nome}</Heading>
          <HStack space={2} alignItems="center">
            <Icon as={Ionicons} name="star" color="yellow.400" size="xs" />
            <Text color="white" fontWeight="bold">4.8</Text>
            <Text color="white">(1.2k avaliações)</Text>
          </HStack>
        </VStack>
      </Box>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sobre nós */}
        <VStack p={6} space={4}>
          <Heading size="md">Sobre nós</Heading>
          <Text fontSize="sm" color="gray.600">
            {pizzariaInfo.descricao}
          </Text>
          
          <Divider my={2} />
          
          {/* Informações de contato */}
          <Heading size="md" mb={2}>Informações de contato</Heading>
          
          <ContactInfo 
            icon="location" 
            label="Endereço" 
            value={`${pizzariaInfo.endereco}, ${pizzariaInfo.cidade}`}
            onPress={() => handleContactPress("mapa", pizzariaInfo.endereco)}
          />
          
          <Divider ml={14} />
          
          <ContactInfo 
            icon="call" 
            label="Telefone" 
            value={pizzariaInfo.telefone}
            onPress={() => handleContactPress("telefone", pizzariaInfo.telefone)}
          />
          
          <Divider ml={14} />
          
          <ContactInfo 
            icon="logo-whatsapp" 
            label="WhatsApp" 
            value={pizzariaInfo.whatsapp}
            onPress={() => handleContactPress("whatsapp", pizzariaInfo.whatsapp)}
          />
          
          <Divider ml={14} />
          
          <ContactInfo 
            icon="mail" 
            label="Email" 
            value={pizzariaInfo.email}
            onPress={() => handleContactPress("email", pizzariaInfo.email)}
          />
          
          <Divider my={2} />
          
          {/* Horário de funcionamento */}
          <Heading size="md" mb={4}>Horário de funcionamento</Heading>
          
          <VStack space={2}>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Segunda</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.segunda}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Terça</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.terca}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Quarta</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.quarta}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Quinta</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.quinta}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Sexta</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.sexta}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Sábado</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.sabado}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text color="gray.600">Domingo</Text>
              <Text fontWeight="medium">{pizzariaInfo.horario.domingo}</Text>
            </HStack>
          </VStack>
          
          <Divider my={2} />
          
          {/* Redes sociais */}
          <Heading size="md" mb={4}>Redes sociais</Heading>
          
          <HStack space={4} justifyContent="center">
            <Pressable 
              onPress={() => handleContactPress("instagram", pizzariaInfo.redesSociais.instagram)}
            >
              <Center bg="red.500" p={4} borderRadius="full">
                <Icon as={Ionicons} name="logo-instagram" size="md" color="white" />
              </Center>
            </Pressable>
            
            <Pressable 
              onPress={() => handleContactPress("facebook", pizzariaInfo.redesSociais.facebook)}
            >
              <Center bg="red.500" p={4} borderRadius="full">
                <Icon as={Ionicons} name="logo-facebook" size="md" color="white" />
              </Center>
            </Pressable>
            
            <Pressable 
              onPress={() => handleContactPress("twitter", pizzariaInfo.redesSociais.twitter)}
            >
              <Center bg="red.500" p={4} borderRadius="full">
                <Icon as={Ionicons} name="logo-twitter" size="md" color="white" />
              </Center>
            </Pressable>
          </HStack>
        </VStack>
      </ScrollView>
      
      {/* Botão de fazer pedido */}
      <Box p={6} bg="white" shadow={5}>
        <Pressable 
          bg="red.500" 
          py={3.5}
          borderRadius="lg"
          _pressed={{ bg: "red.600" }}
          onPress={() => {
            toast.show({
              description: "Redirecionando para cardápio",
              placement: "top"
            });
          }}
        >
          <Center>
            <Text color="white" fontWeight="bold" fontSize="md">Fazer Pedido</Text>
          </Center>
        </Pressable>
      </Box>
    </VStack>
  );
}