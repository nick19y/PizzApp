import React, { useState } from "react";
import {
  VStack,
  Box,
  Heading,
  Text,
  FormControl,
  Input,
  Button,
  HStack,
  Icon,
  ScrollView,
  KeyboardAvoidingView,
  useToast,
  Pressable,
  Divider,
  Center,
  StatusBar,
  IToastProps
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform } from "react-native";

// Interfaces para tipagem
interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

// Interface personalizada para toast com as propriedades corrigidas
interface CustomToastProps extends Omit<IToastProps, 'placement'> {
  description: string;
  placement?: "top" | "bottom" | "top-right" | "top-left" | "bottom-left" | "bottom-right";
  // Removido o status, que não é uma propriedade válida em IToastProps
  title?: string;
  variant?: string;
  duration?: number;
  isClosable?: boolean;
}

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b"
};

const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const validateForm = (): boolean => {
    // Validação básica
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.show({
        description: "Por favor, preencha todos os campos obrigatórios",
        placement: "top",
        variant: "solid"
      });
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.show({
        description: "Por favor, informe um email válido",
        placement: "top",
        variant: "solid"
      });
      return false;
    }

    // Validação de telefone (opcional)
    if (formData.phone && !/^\([0-9]{2}\)\s[0-9]{8,9}$/.test(formData.phone)) {
      toast.show({
        description: "Formato de telefone inválido. Use (XX) XXXXXXXXX",
        placement: "top",
        variant: "solid"
      });
    }

    // Validação de senhas iguais
    if (formData.password !== formData.confirmPassword) {
      toast.show({
        description: "As senhas não coincidem",
        placement: "top",
        variant: "solid"
      });
      return false;
    }

    return true;
  };

  const handleRegister = (): void => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulação de cadastro
    setTimeout(() => {
      setIsLoading(false);
      
      // Aqui você implementaria a chamada real de API para registro
      toast.show({
        description: "Cadastro realizado com sucesso!",
        placement: "top",
        variant: "solid"
      });
      
      // Redirecionar para login após cadastro bem-sucedido
      router.replace("/login");
    }, 1500);
  };

  const navigateToLogin = (): void => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar backgroundColor={colors.dark} barStyle="light-content" />
      
      {/* Header fixo em toda a largura */}
      <Box 
        bg={colors.dark} 
        w="100%" 
        p={6} 
        safeAreaTop 
        shadow={4}
      >
        <Heading size="lg" color="white">Cadastro</Heading>
        <Text color="gray.300" mt={1}>Crie sua conta no PizzApp!</Text>
      </Box>
      
      <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        <VStack flex={1} px={6} py={6} bg="white" space={6}>
          {/* Formulário de Cadastro */}
          <VStack space={4}>
            <FormControl isRequired>
              <FormControl.Label _text={{ color: colors.dark }}>Nome Completo</FormControl.Label>
              <Input
                placeholder="Seu nome completo"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="person-outline" size={5} ml={3} color="gray.400" />
                }
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormControl.Label _text={{ color: colors.dark }}>Email</FormControl.Label>
              <Input
                placeholder="Seu e-mail"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                autoCapitalize="none"
                keyboardType="email-address"
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="mail-outline" size={5} ml={3} color="gray.400" />
                }
              />
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{ color: colors.dark }}>Telefone</FormControl.Label>
              <Input
                placeholder="(XX) XXXXXXXXX"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="call-outline" size={5} ml={3} color="gray.400" />
                }
              />
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{ color: colors.dark }}>Endereço</FormControl.Label>
              <Input
                placeholder="Seu endereço completo"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="location-outline" size={5} ml={3} color="gray.400" />
                }
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormControl.Label _text={{ color: colors.dark }}>Senha</FormControl.Label>
              <Input
                placeholder="Escolha uma senha"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                type={showPassword ? "text" : "password"}
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="lock-closed-outline" size={5} ml={3} color="gray.400" />
                }
                InputRightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)} mr={3}>
                    <Icon 
                      as={Ionicons} 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={5} 
                      color="gray.400" 
                    />
                  </Pressable>
                }
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormControl.Label _text={{ color: colors.dark }}>Confirmar Senha</FormControl.Label>
              <Input
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                type={showConfirmPassword ? "text" : "password"}
                fontSize="sm"
                py={3}
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: colors.primary,
                  backgroundColor: `${colors.primary}05`
                }}
                InputLeftElement={
                  <Icon as={Ionicons} name="lock-closed-outline" size={5} ml={3} color="gray.400" />
                }
                InputRightElement={
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} mr={3}>
                    <Icon 
                      as={Ionicons} 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={5} 
                      color="gray.400" 
                    />
                  </Pressable>
                }
              />
            </FormControl>

            <Button 
              mt={4}
              bg={colors.primary}
              _pressed={{ bg: colors.primary+"e0" }}
              onPress={handleRegister}
              py={3}
              borderRadius="lg"
              isLoading={isLoading}
              isLoadingText="Cadastrando..."
              leftIcon={<Icon as={Ionicons} name="person-add-outline" size="sm" color="white" />}
            >
              Criar Conta
            </Button>
          </VStack>
          
          {/* Opção para login */}
          <HStack mt={4} justifyContent="center">
            <Text color={colors.grayText}>Já tem uma conta?</Text>
            <Pressable onPress={navigateToLogin}>
              <Text ml={1} color={colors.primary} fontWeight="medium">
                Fazer login
              </Text>
            </Pressable>
          </HStack>
          
          {/* Política de privacidade */}
          <Center mt={4} px={4}>
            <Text fontSize="xs" color={colors.grayText} textAlign="center">
              Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
            </Text>
          </Center>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterUser;