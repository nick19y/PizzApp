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
  Center,
  Image,
  Pressable,
  Icon,
  Link,
  KeyboardAvoidingView,
  ScrollView,
  useToast,
  StatusBar
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform } from "react-native";

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b"
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleLogin = () => {
    // Validação básica
    if (!email || !password) {
      toast.show({
        description: "Por favor, preencha todos os campos",
        status: "error",
        placement: "top"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulação de login
    setTimeout(() => {
      setIsLoading(false);
      
      // Aqui você implementaria a chamada real de API
      // Simulando um login bem-sucedido
      router.replace("/");
      
      toast.show({
        description: "Login realizado com sucesso!",
        status: "success",
        placement: "top"
      });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar backgroundColor={colors.dark} barStyle="light-content" />
      
      {/* Header azul em toda a largura */}
      <Box bg={colors.dark} w="100%" pt={12} pb={20} shadow={4}>
        <Center>
          <Icon as={Ionicons} name="pizza" size="4xl" color={colors.primary} />
          <Heading size="xl" color="white" fontWeight="bold" mt={2}>
            PizzApp
          </Heading>
          <Text color="gray.300" mt={1}>
            As melhores pizzas da cidade
          </Text>
        </Center>
      </Box>
      
      {/* Conteúdo principal com efeito de sobreposição */}
      <Box 
        bg="white" 
        borderTopRadius="3xl" 
        mt={-10} 
        flex={1} 
        shadow={5}
      >
        <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
          <VStack flex={1} px={6} py={8} space={6}>
            {/* Título do formulário */}
            <Box>
              <Heading size="lg" color={colors.dark}>Bem-vindo de volta!</Heading>
              <Text color={colors.grayText} mt={1}>
                Faça login para continuar
              </Text>
            </Box>
            
            {/* Formulário de Login */}
            <VStack space={4} mt={4}>
              <FormControl>
                <FormControl.Label _text={{ color: colors.dark }}>Email</FormControl.Label>
                <Input
                  placeholder="Seu e-mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{ 
                    borderColor: colors.dark,
                    backgroundColor: `${colors.dark}05`
                  }}
                  InputLeftElement={
                    <Icon as={Ionicons} name="mail-outline" size={5} ml={3} color="gray.400" />
                  }
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ color: colors.dark }}>Senha</FormControl.Label>
                <Input
                  placeholder="Sua senha"
                  value={password}
                  onChangeText={setPassword}
                  type={showPassword ? "text" : "password"}
                  fontSize="sm"
                  py={3}
                  borderRadius="lg"
                  borderColor="gray.300"
                  _focus={{ 
                    borderColor: colors.dark,
                    backgroundColor: `${colors.dark}05`
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
                <HStack justifyContent="flex-end" mt={1}>
                  <Link _text={{ color: colors.dark, fontSize: "xs" }}>
                    Esqueceu a senha?
                  </Link>
                </HStack>
              </FormControl>

              <Button 
                mt={4}
                bg={colors.dark}
                _pressed={{ bg: colors.dark+"e0" }}
                onPress={handleLogin}
                py={3}
                borderRadius="lg"
                isLoading={isLoading}
                isLoadingText="Entrando..."
                leftIcon={<Icon as={Ionicons} name="log-in-outline" size="sm" color="white" />}
              >
                Entrar
              </Button>
              
              <Button 
                mt={2}
                bg="transparent"
                borderWidth={1}
                borderColor={colors.primary}
                _pressed={{ bg: `${colors.primary}10` }}
                onPress={() => router.push("/register")}
                py={3}
                borderRadius="lg"
                _text={{ color: colors.primary }}
                leftIcon={<Icon as={Ionicons} name="person-add-outline" size="sm" color={colors.primary} />}
              >
                Criar Nova Conta
              </Button>
            </VStack>
            
            {/* Rodapé */}
            <Center mt={4}>
              <Text fontSize="xs" color={colors.grayText}>
                © 2025 PizzApp. Todos os direitos reservados.
              </Text>
            </Center>
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}