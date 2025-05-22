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
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, Keyboard } from "react-native";
import axiosClient from "../axios-client"; // Ajuste o caminho conforme sua estrutura

// Interfaces para tipagem
interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const router = useRouter();

  // Função para formatar telefone no padrão (XX) XXXXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.substring(0, 11);
    
    // Aplica a formatação
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.substring(0, 2)}) ${limitedNumbers.substring(2)}`;
    } else {
      return `(${limitedNumbers.substring(0, 2)}) ${limitedNumbers.substring(2, 7)}-${limitedNumbers.substring(7)}`;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'phone') {
      // Aplica formatação automática para telefone
      const formattedPhone = formatPhoneNumber(value);
      setFormData({
        ...formData,
        [field]: formattedPhone
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validação básica
    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else {
      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Por favor, informe um email válido";
      }
    }

    if (!formData.password) {
      errors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      errors.password = "A senha deve ter pelo menos 8 caracteres";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    // Validação de telefone (se preenchido)
    if (formData.phone) {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        errors.phone = "Telefone deve ter 10 ou 11 dígitos";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Preparar dados para envio
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone: formData.phone || undefined,
        address: formData.address.trim() || undefined,
        role: 'client', // Definir o tipo do usuário como 'client'
      };

      console.log("Enviando dados de cadastro:", registrationData);

      // Fazer chamada para a API usando o endpoint de signup
      const response = await axiosClient.post('/signup', registrationData);
      
      console.log("Resposta da API:", response.data);

      // Sucesso - usuário foi criado e token foi gerado
      const { user, token } = response.data;
      
      // Aqui você pode salvar o token se necessário para login automático
      // AsyncStorage.setItem('token', token);
      // AsyncStorage.setItem('user', JSON.stringify(user));
      
      toast.show({
        description: `✅ Bem-vindo(a), ${user.name}! Cadastro realizado com sucesso!`,
        placement: "top",
        duration: 3000
      });
      
      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: ""
      });
      
      // Redirecionar para login após cadastro bem-sucedido
      setTimeout(() => {
        router.replace("/signin");
      }, 1000);

    } catch (error: unknown) {
      console.error("Erro no cadastro:", error);
      
      const apiError = error as ApiError;
      let errorMessage = "Erro ao realizar cadastro. Tente novamente.";
      
      if (apiError.response?.data?.errors) {
        // Erros de validação da API
        const apiErrors = apiError.response.data.errors;
        const newFieldErrors: Record<string, string> = {};
        
        Object.keys(apiErrors).forEach(field => {
          if (apiErrors[field] && apiErrors[field].length > 0) {
            newFieldErrors[field] = apiErrors[field][0];
          }
        });
        
        setFieldErrors(newFieldErrors);
        errorMessage = "Verifique os campos e tente novamente.";
        
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.status === 422) {
        errorMessage = "Dados inválidos. Verifique as informações fornecidas.";
      } else if (apiError.response?.status === 409) {
        errorMessage = "Este email já está cadastrado.";
        setFieldErrors({ email: "Este email já está em uso" });
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

  const navigateToLogin = (): void => {
    router.push("/signin");
  };

  return (
    <Box flex={1} bg="white">
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
      
      <KeyboardAvoidingView
        flex={1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: Platform.OS === "ios" ? 50 : 100 
          }}
          bounces={false}
        >
          <VStack flex={1} px={6} py={6} bg="white" space={6}>
            {/* Formulário de Cadastro */}
            <VStack space={4}>
              <FormControl isRequired isInvalid={!!fieldErrors.name}>
                <FormControl.Label _text={{ color: colors.dark }}>Nome Completo</FormControl.Label>
                <Input
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.name ? "error.500" : "gray.300"}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  _focus={{ 
                    borderColor: fieldErrors.name ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.name ? "#ef444420" : colors.primary}05`
                  }}
                  InputLeftElement={
                    <Icon as={Ionicons} name="person-outline" size={5} ml={3} color="gray.400" />
                  }
                />
                {fieldErrors.name && (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.name}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!fieldErrors.email}>
                <FormControl.Label _text={{ color: colors.dark }}>Email</FormControl.Label>
                <Input
                  placeholder="Seu e-mail"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.email ? "error.500" : "gray.300"}
                  _focus={{ 
                    borderColor: fieldErrors.email ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.email ? "#ef444420" : colors.primary}05`
                  }}
                  InputLeftElement={
                    <Icon as={Ionicons} name="mail-outline" size={5} ml={3} color="gray.400" />
                  }
                />
                {fieldErrors.email && (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.email}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!fieldErrors.phone}>
                <FormControl.Label _text={{ color: colors.dark }}>Telefone</FormControl.Label>
                <Input
                  placeholder="(XX) XXXXX-XXXX"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  keyboardType="numeric"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.phone ? "error.500" : "gray.300"}
                  maxLength={15} // Limita o tamanho máximo do input
                  _focus={{ 
                    borderColor: fieldErrors.phone ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.phone ? "#ef444420" : colors.primary}05`
                  }}
                  InputLeftElement={
                    <Icon as={Ionicons} name="call-outline" size={5} ml={3} color="gray.400" />
                  }
                />
                {fieldErrors.phone ? (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.phone}
                  </FormControl.ErrorMessage>
                ) : (
                  <FormControl.HelperText _text={{ fontSize: "xs", color: colors.grayText }}>
                    Formato: (XX) XXXXX-XXXX
                  </FormControl.HelperText>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!fieldErrors.address}>
                <FormControl.Label _text={{ color: colors.dark }}>Endereço</FormControl.Label>
                <Input
                  placeholder="Seu endereço completo"
                  value={formData.address}
                  onChangeText={(value) => handleInputChange("address", value)}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.address ? "error.500" : "gray.300"}
                  _focus={{ 
                    borderColor: fieldErrors.address ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.address ? "#ef444420" : colors.primary}05`
                  }}
                  InputLeftElement={
                    <Icon as={Ionicons} name="location-outline" size={5} ml={3} color="gray.400" />
                  }
                />
                {fieldErrors.address && (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.address}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!fieldErrors.password}>
                <FormControl.Label _text={{ color: colors.dark }}>Senha</FormControl.Label>
                <Input
                  placeholder="Escolha uma senha (mín. 8 caracteres)"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  type={showPassword ? "text" : "password"}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.password ? "error.500" : "gray.300"}
                  _focus={{ 
                    borderColor: fieldErrors.password ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.password ? "#ef444420" : colors.primary}05`
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
                {fieldErrors.password && (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.password}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              
              <FormControl isRequired isInvalid={!!fieldErrors.confirmPassword}>
                <FormControl.Label _text={{ color: colors.dark }}>Confirmar Senha</FormControl.Label>
                <Input
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange("confirmPassword", value)}
                  type={showConfirmPassword ? "text" : "password"}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor={fieldErrors.confirmPassword ? "error.500" : "gray.300"}
                  _focus={{ 
                    borderColor: fieldErrors.confirmPassword ? "error.500" : colors.primary,
                    backgroundColor: `${fieldErrors.confirmPassword ? "#ef444420" : colors.primary}05`
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
                {fieldErrors.confirmPassword && (
                  <FormControl.ErrorMessage leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}>
                    {fieldErrors.confirmPassword}
                  </FormControl.ErrorMessage>
                )}
              </FormControl>

              <Button 
                mt={6}
                bg={colors.primary}
                _pressed={{ bg: colors.primary+"e0" }}
                onPress={handleRegister}
                py={3}
                borderRadius="lg"
                isLoading={isLoading}
                isLoadingText="Cadastrando..."
                leftIcon={<Icon as={Ionicons} name="person-add-outline" size="sm" color="white" />}
                disabled={isLoading}
              >
                Criar Conta
              </Button>
            </VStack>
            
            {/* Opção para login */}
            <HStack mt={6} justifyContent="center">
              <Text color={colors.grayText}>Já tem uma conta?</Text>
              <Pressable onPress={navigateToLogin}>
                <Text ml={1} color={colors.primary} fontWeight="medium">
                  Fazer login
                </Text>
              </Pressable>
            </HStack>
            
            {/* Política de privacidade */}
            <Center mt={4} px={4} pb={6}>
              <Text fontSize="xs" color={colors.grayText} textAlign="center">
                Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
              </Text>
            </Center>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default RegisterUser;