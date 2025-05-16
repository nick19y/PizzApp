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
  Button,
  Divider,
  Pressable
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

// Dados do usuário
const userData = {
  id: 1,
  name: "Nícolas de Godoi",
  email: "godoi.nic.nic@gmail.com",
  address: "Rua teste",
  phone: "(15) 991718913",
  role: "admin"
};

// Componente para item da lista de perfil
const ProfileListItem = ({ icon, label, value }) => (
  <Box py={2}>
    <HStack space={3} alignItems="center">
      <Box bg={`${colors.primary}10`} p={2} borderRadius="lg">
        <Icon as={Ionicons} name={icon} size="md" color={colors.primary} />
      </Box>
      <VStack>
        <Text fontWeight="medium" color={colors.dark}>{value}</Text>
        <Text fontSize="xs" color={colors.grayText}>{label}</Text>
      </VStack>
    </HStack>
  </Box>
);

export default function Profile() {
  return (
    <VStack flex={1} bg={colors.light} safeArea>
      {/* Header */}
      {/* <Box bg={colors.dark} p={6} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="md" color="white">Perfil</Heading>
          <Icon as={Ionicons} name="settings-outline" size="md" color="white" />
        </HStack>
      </Box> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Box>
          <Box 
            bg={colors.dark} 
            height={100} 
            position="absolute" 
            top={0} 
            left={0} 
            right={0}
          />
          
          <Box px={6} pt={16} pb={6}>
            <VStack 
              bg="white" 
              borderRadius="xl" 
              p={6} 
              alignItems="center"
              shadow={2}
            >
              <Avatar 
                size="xl" 
                source={{ uri: "https://via.placeholder.com/150" }}
                borderWidth={4}
                borderColor="white"
                mt={-16}
                shadow={6}
              />
              
              <VStack space={1} alignItems="center" mt={4}>
                <Heading size="md" color={colors.dark}>{userData.name}</Heading>
                <Text color={colors.grayText} fontSize="sm">{userData.email}</Text>
                
                <HStack space={2} mt={3}>
                  <Button
                    size="sm"
                    bg={colors.primary}
                    _pressed={{ bg: colors.primary+"e0" }}
                    leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" color="white" />}
                    borderRadius="lg"
                  >
                    Editar Perfil
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor={colors.primary}
                    _text={{ color: colors.primary }}
                    leftIcon={<Icon as={Ionicons} name="share-social-outline" size="sm" color={colors.primary} />}
                    borderRadius="lg"
                  >
                    Compartilhar
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Box>
        
        {/* Informações do usuário */}
        <Box p={6} bg="white" mt={4} borderTopWidth={1} borderBottomWidth={1} borderColor="gray.100">
          <Heading size="sm" color={colors.dark} mb={4}>INFORMAÇÕES PESSOAIS</Heading>
          
          <ProfileListItem 
            icon="mail-outline" 
            label="Email" 
            value={userData.email} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="call-outline" 
            label="Telefone" 
            value={userData.phone} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="location-outline" 
            label="Endereço" 
            value={userData.address} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="person-circle-outline" 
            label="Tipo de Conta" 
            value={userData.role === "admin" ? "Administrador" : "Cliente"} 
          />
        </Box>
        
        {/* Configurações e Preferências */}
        <Box p={6} bg="white" mt={4} borderTopWidth={1} borderBottomWidth={1} borderColor="gray.100">
          <Heading size="sm" color={colors.dark} mb={4}>CONFIGURAÇÕES</Heading>
          
          <Pressable py={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={3} alignItems="center">
                <Box bg={`${colors.primary}10`} p={2} borderRadius="lg">
                  <Icon as={Ionicons} name="notifications-outline" size="md" color={colors.primary} />
                </Box>
                <Text fontWeight="medium" color={colors.dark}>Notificações</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
          
          <Divider my={2} />
          
          <Pressable py={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={3} alignItems="center">
                <Box bg={`${colors.primary}10`} p={2} borderRadius="lg">
                  <Icon as={Ionicons} name="card-outline" size="md" color={colors.primary} />
                </Box>
                <Text fontWeight="medium" color={colors.dark}>Formas de Pagamento</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
          
          <Divider my={2} />
          
          <Pressable py={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={3} alignItems="center">
                <Box bg={`${colors.primary}10`} p={2} borderRadius="lg">
                  <Icon as={Ionicons} name="shield-checkmark-outline" size="md" color={colors.primary} />
                </Box>
                <Text fontWeight="medium" color={colors.dark}>Privacidade e Segurança</Text>
              </HStack>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" />
            </HStack>
          </Pressable>
        </Box>

        {/* Logout Button */}
        <Box p={6} mt={4} mb={6}>
          <Button 
            variant="outline" 
            borderColor={colors.primary}
            _text={{ color: colors.primary }}
            leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" color={colors.primary} />}
            _pressed={{
              bg: `${colors.primary}10`
            }}
          >
            Sair da conta
          </Button>
          
          <Text fontSize="xs" color={colors.grayText} textAlign="center" mt={6}>
            Versão do aplicativo: 1.0.0
          </Text>
        </Box>
      </ScrollView>
    </VStack>
  );
}