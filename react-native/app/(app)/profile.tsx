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
  Pressable,
  useToast,
  AlertDialog,
  Modal,
  FormControl,
  Input,
  Spinner
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext"; // Ajuste o caminho conforme necessário
import { useRouter, useFocusEffect } from "expo-router";
import axiosClient from "../../axios-client"; // Ajuste o caminho conforme necessário

// Interfaces para tipagem
interface ProfileListItemProps {
  icon: string;
  label: string;
  value: string;
}

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

// Definir cores para corresponder ao tema web
const colors = {
  primary: "#f97316", // Orange - cor de destaque
  dark: "#1e293b", // Dark blue - cor do header
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b"
};

// Componente para item da lista de perfil
const ProfileListItem: React.FC<ProfileListItemProps> = ({ icon, label, value }) => (
  <Box py={2}>
    <HStack space={3} alignItems="center">
      <Box bg={`${colors.primary}10`} p={2} borderRadius="lg">
        <Icon as={Ionicons} name={icon} size="md" color={colors.primary} />
      </Box>
      <VStack>
        <Text fontWeight="medium" color={colors.dark}>{value || "Não informado"}</Text>
        <Text fontSize="xs" color={colors.grayText}>{label}</Text>
      </VStack>
    </HStack>
  </Box>
);

const Profile: React.FC = () => {
  // Obter dados do usuário e a função de logout do contexto
  const { user, signout, loading, updateUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  // Estados para controlar os diálogos
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = React.useState(false);
  
  // Estado local para dados do usuário (para forçar re-renderização)
  const [localUserData, setLocalUserData] = React.useState<UserData | null>(null);
  
  // Estados para o formulário de edição
  const [formData, setFormData] = React.useState<EditFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  
  // Estados para validação
  const [errors, setErrors] = React.useState<Partial<EditFormData>>({});
  
  const cancelRef = React.useRef(null);

  // Função para carregar dados do usuário do servidor
  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setIsLoadingUserData(true);
    try {
      const response = await axiosClient.get(`/clients/${user.id}`);
      if (response.data.status === 'success') {
        const userData = response.data.data;
        setLocalUserData(userData);
        
        // Atualizar o contexto também
        if (updateUser) {
          updateUser(userData);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Carregar dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchUserData();
      }
    }, [user?.id])
  );

  // Sincronizar dados locais com o contexto
  React.useEffect(() => {
    if (user) {
      setLocalUserData(user);
    }
  }, [user]);

  // Usar dados locais ou do contexto
  const currentUserData = localUserData || user;

  // Função para abrir modal de edição e popular campos
  const openEditModal = () => {
    setFormData({
      name: currentUserData?.name || "",
      email: currentUserData?.email || "",
      phone: currentUserData?.phone || "",
      address: currentUserData?.address || "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<EditFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório";
    }

    // Validar senha apenas se foi preenchida
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Senha deve ter pelo menos 8 caracteres";
      } else if (!/(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
        newErrors.password = "Senha deve conter letras e símbolos";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);

    try {
      // Preparar dados para envio
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      // Incluir senha apenas se foi preenchida
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Fazer requisição para atualizar dados do usuário
      const response = await axiosClient.put(`/clients/${user?.id}`, updateData);

      if (response.data.status === 'success') {
        const updatedUserData = response.data.data;
        
        // Atualizar estado local imediatamente
        setLocalUserData(updatedUserData);
        
        // Atualizar contexto
        if (updateUser) {
          updateUser(updatedUserData);
        }

        toast.show({
          description: "✅ Perfil atualizado com sucesso!",
          placement: "top",
          duration: 3000
        });

        setIsEditModalOpen(false);
        
        // Buscar dados atualizados do servidor para garantir sincronização
        setTimeout(() => {
          fetchUserData();
        }, 500);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      
      let errorMessage = "Erro ao atualizar perfil. Tente novamente.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Tratar erros de validação do Laravel
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0] as string;
        }
      }

      toast.show({
        description: `❌ ${errorMessage}`,
        placement: "top",
        duration: 4000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Lidar com o clique no botão de logout
  const handleLogout = async () => {
    try {
      await signout();
      toast.show({
        description: "Você saiu com sucesso",
        placement: "top",
        duration: 2000
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.show({
        description: "Erro ao sair da conta. Tente novamente.",
        placement: "top",
        duration: 3000
      });
    }
  };

  // Função para formatar o tipo de conta com tipagem adequada
  const formatUserRole = (role: string | undefined): string => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'staff': 'Funcionário',
      'client': 'Cliente'
    };
    return role ? (roleMap[role] || role) : 'Não informado';
  };

  if (isLoadingUserData && !currentUserData) {
    return (
      <VStack flex={1} bg={colors.light} safeArea justifyContent="center" alignItems="center">
        <Spinner size="lg" color={colors.primary} />
        <Text mt={4} color={colors.dark}>Carregando perfil...</Text>
      </VStack>
    );
  }

  return (
    <VStack flex={1} bg={colors.light} safeArea>
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
              >
                {currentUserData?.name?.charAt(0) || "U"}
              </Avatar>
              
              <VStack space={1} alignItems="center" mt={4}>
                <Heading size="md" color={colors.dark}>
                  {currentUserData?.name || "Usuário"}
                </Heading>
                <Text color={colors.grayText} fontSize="sm">
                  {currentUserData?.email || "email@exemplo.com"}
                </Text>
                
                <HStack space={2} mt={3}>
                  <Button
                    size="sm"
                    bg={colors.primary}
                    _pressed={{ bg: colors.primary+"e0" }}
                    leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" color="white" />}
                    borderRadius="lg"
                    onPress={openEditModal}
                  >
                    Editar Perfil
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
            value={currentUserData?.email || ""} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="call-outline" 
            label="Telefone" 
            value={currentUserData?.phone || ""} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="location-outline" 
            label="Endereço" 
            value={currentUserData?.address || ""} 
          />
          
          <Divider my={2} />
          
          <ProfileListItem 
            icon="person-circle-outline" 
            label="Tipo de Conta" 
            value={formatUserRole(currentUserData?.role)} 
          />
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
            onPress={() => setIsLogoutOpen(true)}
            isLoading={loading}
            isLoadingText="Saindo..."
          >
            Sair da conta
          </Button>
          
          <Text fontSize="xs" color={colors.grayText} textAlign="center" mt={6}>
            Versão do aplicativo: 1.0.0
          </Text>
        </Box>
      </ScrollView>

      {/* Modal de Edição do Perfil */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Editar Perfil</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              {/* Nome */}
              <FormControl isInvalid={!!errors.name}>
                <FormControl.Label>Nome</FormControl.Label>
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Digite seu nome"
                  leftElement={
                    <Icon 
                      as={Ionicons} 
                      name="person-outline" 
                      size="sm" 
                      color={colors.grayText} 
                      ml={3} 
                    />
                  }
                />
                <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
              </FormControl>

              {/* Email */}
              <FormControl isInvalid={!!errors.email}>
                <FormControl.Label>Email</FormControl.Label>
                <Input
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Digite seu email"
                  keyboardType="email-address"
                  leftElement={
                    <Icon 
                      as={Ionicons} 
                      name="mail-outline" 
                      size="sm" 
                      color={colors.grayText} 
                      ml={3} 
                    />
                  }
                />
                <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
              </FormControl>

              {/* Telefone */}
              <FormControl isInvalid={!!errors.phone}>
                <FormControl.Label>Telefone</FormControl.Label>
                <Input
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Digite seu telefone"
                  keyboardType="phone-pad"
                  leftElement={
                    <Icon 
                      as={Ionicons} 
                      name="call-outline" 
                      size="sm" 
                      color={colors.grayText} 
                      ml={3} 
                    />
                  }
                />
                <FormControl.ErrorMessage>{errors.phone}</FormControl.ErrorMessage>
              </FormControl>

              {/* Endereço */}
              <FormControl isInvalid={!!errors.address}>
                <FormControl.Label>Endereço</FormControl.Label>
                <Input
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="Digite seu endereço"
                  leftElement={
                    <Icon 
                      as={Ionicons} 
                      name="location-outline" 
                      size="sm" 
                      color={colors.grayText} 
                      ml={3} 
                    />
                  }
                />
                <FormControl.ErrorMessage>{errors.address}</FormControl.ErrorMessage>
              </FormControl>

              {/* Divider para senha */}
              <Divider />
              <Text fontSize="sm" color={colors.grayText} textAlign="center">
                Deixe em branco para manter a senha atual
              </Text>

              {/* Nova Senha */}
              <FormControl isInvalid={!!errors.password}>
                <FormControl.Label>Nova Senha (opcional)</FormControl.Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder="Digite uma nova senha"
                  leftElement={
                    <Icon 
                      as={Ionicons} 
                      name="lock-closed-outline" 
                      size="sm" 
                      color={colors.grayText} 
                      ml={3} 
                    />
                  }
                />
                <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
              </FormControl>

              {/* Confirmar Senha */}
              {formData.password && (
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormControl.Label>Confirmar Nova Senha</FormControl.Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    placeholder="Confirme a nova senha"
                    leftElement={
                      <Icon 
                        as={Ionicons} 
                        name="lock-closed-outline" 
                        size="sm" 
                        color={colors.grayText} 
                        ml={3} 
                      />
                    }
                  />
                  <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
                </FormControl>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button 
                variant="ghost" 
                colorScheme="blueGray" 
                onPress={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button 
                bg={colors.primary}
                _pressed={{ bg: colors.primary + "e0" }}
                onPress={handleUpdateProfile}
                isLoading={isUpdating}
                isLoadingText="Salvando..."
              >
                Salvar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Diálogo de confirmação de logout */}
      <AlertDialog 
        leastDestructiveRef={cancelRef} 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Sair da conta</AlertDialog.Header>
          <AlertDialog.Body>
            Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar seus dados.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button 
                variant="unstyled" 
                colorScheme="coolGray" 
                onPress={() => setIsLogoutOpen(false)} 
                ref={cancelRef}
              >
                Cancelar
              </Button>
              <Button 
                colorScheme="danger" 
                onPress={() => {
                  setIsLogoutOpen(false);
                  handleLogout();
                }}
              >
                Sair
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </VStack>
  );
};

export default Profile;