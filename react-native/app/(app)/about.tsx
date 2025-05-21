import React from "react";
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
  useToast,
  StatusBar,
  IPressableProps,
  IBoxProps,
  ITextProps
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

// Definindo interfaces para tipagem
interface PizzariaHorario {
  segunda: string;
  terca: string;
  quarta: string;
  quinta: string;
  sexta: string;
  sabado: string;
  domingo: string;
}

interface RedesSociais {
  instagram: string;
  facebook: string;
  twitter: string;
}

interface PizzariaInfo {
  nome: string;
  endereco: string;
  cidade: string;
  cep: string;
  telefone: string;
  whatsapp: string;
  email: string;
  horario: PizzariaHorario;
  redesSociais: RedesSociais;
}

// Informações da pizzaria
const pizzariaInfo: PizzariaInfo = {
  nome: "PizzApp",
  endereco: "Rua Principal, 123 - Centro",
  cidade: "São Paulo, SP",
  cep: "01234-567",
  telefone: "(11) 5555-1234",
  whatsapp: "(11) 98765-4321",
  email: "contato@pizzapp.com",
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
    instagram: "@pizzapp_oficial",
    facebook: "PizzAppOficial",
    twitter: "@pizzapp"
  }
};

// Definindo um esquema de cores mais rico baseado no CSS do site
const colors = {
  primary: "#f97316", // Laranja - cor de destaque
  darkBlue: "#1e293b", // Azul escuro - cor do header
  secondary: "#3b82f6", // Azul - cor secundária
  tertiary: "#8b5cf6", // Roxo - cor terciária
  success: "#10b981", // Verde - para badges/status
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b",
  grayDark: "#334155",
  grayLight: "#e2e8f0"
};

// Interfaces para componentes
interface InfoCardProps extends IBoxProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  mb?: number | string;
}

interface ContactItemProps {
  icon: string;
  title: string;
  value: string;
  actionIcon: string;
  onPress: () => void;
  color?: string;
}

interface ScheduleItemProps {
  day: string;
  hours: string;
  isOpen?: boolean;
}

interface SocialButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

// Componente de card reutilizável
const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, mb = 4, ...rest }) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      shadow={2}
      mb={mb}
      overflow="hidden"
      {...rest}
    >
      <Box bg={colors.darkBlue} px={4} py={3}>
        <HStack alignItems="center" space={2}>
          <Icon as={Ionicons} name={icon} color="white" size="sm" />
          <Heading size="sm" color="white">{title}</Heading>
        </HStack>
      </Box>
      {children}
    </Box>
  );
};

// Componente para itens de contato
const ContactItem: React.FC<ContactItemProps> = ({ 
  icon, 
  title, 
  value, 
  actionIcon, 
  onPress, 
  color = colors.primary 
}) => {
  return (
    <Pressable
      onPress={onPress}
      _pressed={{ bg: `${color}10` }}
    >
      <HStack space={3} alignItems="center" p={4}>
        <Center bg={`${color}20`} p={3} borderRadius="lg">
          <Icon as={Ionicons} name={icon} size="md" color={color} />
        </Center>
        <VStack flex={1}>
          <Text fontSize="md" fontWeight="medium" color={colors.darkBlue}>{title}</Text>
          <Text fontSize="sm" color={colors.grayText}>{value}</Text>
        </VStack>
        <Box bg={`${color}10`} p={2} borderRadius="lg">
          <Icon as={Ionicons} name={actionIcon} size="sm" color={color} />
        </Box>
      </HStack>
    </Pressable>
  );
};

// Componente para item de horário
const ScheduleItem: React.FC<ScheduleItemProps> = ({ day, hours, isOpen = false }) => {
  return (
    <HStack justifyContent="space-between" py={2} borderBottomWidth={1} borderBottomColor={`${colors.grayText}20`}>
      <Text fontWeight="medium" color={colors.darkBlue}>{day}</Text>
      <Badge
        variant="subtle"
        bg={isOpen ? `${colors.success}20` : `${colors.primary}20`}
        _text={{ color: isOpen ? colors.success : colors.primary }}
        px={2}
      >
        {hours}
      </Badge>
    </HStack>
  );
};

// Componente para botão de rede social
const SocialButton: React.FC<SocialButtonProps> = ({ 
  icon, 
  label, 
  onPress, 
  color = colors.primary 
}) => {
  return (
    <Pressable onPress={onPress}>
      <VStack alignItems="center" space={2}>
        <Center bg={`${color}20`} p={4} borderRadius="full">
          <Icon as={Ionicons} name={icon} size="lg" color={color} />
        </Center>
        <Text fontSize="sm" color={colors.darkBlue}>{label}</Text>
      </VStack>
    </Pressable>
  );
};

const About: React.FC = () => {
  const toast = useToast();
  
  // Verificar se a pizzaria está aberta agora
  const isOpenNow = (): boolean => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0-6, onde 0 é domingo
    const hora = hoje.getHours();
    
    let horarioHoje: string;
    switch(diaSemana) {
      case 0: horarioHoje = pizzariaInfo.horario.domingo; break;
      case 1: horarioHoje = pizzariaInfo.horario.segunda; break;
      case 2: horarioHoje = pizzariaInfo.horario.terca; break;
      case 3: horarioHoje = pizzariaInfo.horario.quarta; break;
      case 4: horarioHoje = pizzariaInfo.horario.quinta; break;
      case 5: horarioHoje = pizzariaInfo.horario.sexta; break;
      case 6: horarioHoje = pizzariaInfo.horario.sabado; break;
      default: return false;
    }
    
    const [abertura, fechamento] = horarioHoje.split(' - ');
    const [horaAbertura] = abertura.split(':').map(Number);
    const [horaFechamento] = fechamento.split(':').map(Number);
    
    return hora >= horaAbertura && hora < horaFechamento;
  };
  
  const aberto = isOpenNow();
  
  const handleContactPress = (type: string, value: string): void => {
    toast.show({
      description: `Abrindo ${type}: ${value}`,
      placement: "top",
      bg: colors.darkBlue,
    });
  };

  return (
    <VStack flex={1} bg={colors.grayBg}>
      <StatusBar backgroundColor={colors.darkBlue} barStyle="light-content" />
      
      {/* Header fixo */}
      <Box bg={colors.darkBlue} p={4} shadow={4}>
        <HStack space={2} alignItems="center" justifyContent="space-between">
          <HStack space={2} alignItems="center">
            <Icon as={Ionicons} name="pizza" size="md" color={colors.primary} />
            <Heading size="md" color="white">{pizzariaInfo.nome}</Heading>
          </HStack>
          <Badge 
            variant="solid" 
            colorScheme={aberto ? "success" : "error"}
            rounded="full"
            px={2}
          >
            {aberto ? "Aberto agora" : "Fechado"}
          </Badge>
        </HStack>
      </Box>
      
      <ScrollView flex={1} showsVerticalScrollIndicator={false} pb={24}>
        {/* Banner */}
        <Box bg={colors.darkBlue} pb={12} pt={4} px={4}>
          <Center>
            <VStack space={1} alignItems="center">
              <Icon as={Ionicons} name="information-circle" size="4xl" color={colors.primary} />
              <Heading color="white" size="lg">Sobre Nós</Heading>
              <Text color={colors.grayLight} px={6} textAlign="center">
                Entre em contato conosco ou visite uma de nossas lojas
              </Text>
            </VStack>
          </Center>
        </Box>
        
        {/* Wave separator */}
        <Box width="100%" height={12} bg={colors.grayBg} marginTop={-10} borderTopRadius={40} />
        
        {/* Cards com informações */}
        <Box px={4} >
          {/* Card de Informações de contato */}
          <InfoCard title="CONTATO" icon="call-outline">
            <VStack p={0} divider={<Divider />}>
              <ContactItem 
                icon="location-outline" 
                title="Endereço" 
                value={`${pizzariaInfo.endereco}, ${pizzariaInfo.cidade}`}
                actionIcon="navigate-outline"
                onPress={() => handleContactPress("mapa", pizzariaInfo.endereco)}
                color={colors.secondary}
              />
              
              <ContactItem 
                icon="call-outline" 
                title="Telefone" 
                value={pizzariaInfo.telefone}
                actionIcon="call"
                onPress={() => handleContactPress("telefone", pizzariaInfo.telefone)}
                color={colors.primary}
              />
              
              <ContactItem 
                icon="logo-whatsapp" 
                title="WhatsApp" 
                value={pizzariaInfo.whatsapp}
                actionIcon="chatbubble-outline"
                onPress={() => handleContactPress("whatsapp", pizzariaInfo.whatsapp)}
                color={colors.success}
              />
              
              <ContactItem 
                icon="mail-outline" 
                title="Email" 
                value={pizzariaInfo.email}
                actionIcon="send-outline"
                onPress={() => handleContactPress("email", pizzariaInfo.email)}
                color={colors.tertiary}
              />
            </VStack>
          </InfoCard>
          
          {/* Card de Redes sociais */}
          <InfoCard title="REDES SOCIAIS" icon="share-social-outline">
            <HStack p={6} justifyContent="space-around">
              <SocialButton
                icon="logo-instagram"
                label="Instagram"
                onPress={() => handleContactPress("instagram", pizzariaInfo.redesSociais.instagram)}
                color="#E1306C"
              />
              
              <SocialButton
                icon="logo-facebook"
                label="Facebook"
                onPress={() => handleContactPress("facebook", pizzariaInfo.redesSociais.facebook)}
                color="#4267B2"
              />
              
              <SocialButton
                icon="logo-twitter"
                label="Twitter"
                onPress={() => handleContactPress("twitter", pizzariaInfo.redesSociais.twitter)}
                color="#1DA1F2"
              />
            </HStack>
          </InfoCard>
          
          {/* Card de Horário de funcionamento */}
          <InfoCard title="HORÁRIO DE FUNCIONAMENTO" icon="time-outline" mb={8}>
            <Box p={4}>
              <HStack mb={3} bg={`${colors.grayText}15`} p={2} borderRadius="md" justifyContent="center">
                <Badge
                  colorScheme={aberto ? "success" : "error"}
                  variant="subtle"
                  rounded="md"
                  px={3}
                  py={1}
                >
                  <HStack alignItems="center" space={1}>
                    <Icon 
                      as={Ionicons} 
                      name={aberto ? "checkmark-circle" : "close-circle"} 
                      size="xs" 
                    />
                    <Text fontWeight="medium">{aberto ? "Aberto agora" : "Fechado no momento"}</Text>
                  </HStack>
                </Badge>
              </HStack>
              
              <VStack space={2}>
                <ScheduleItem 
                  day="Segunda-feira" 
                  hours={pizzariaInfo.horario.segunda} 
                  isOpen={new Date().getDay() === 1 && aberto}
                />
                <ScheduleItem 
                  day="Terça-feira" 
                  hours={pizzariaInfo.horario.terca} 
                  isOpen={new Date().getDay() === 2 && aberto}
                />
                <ScheduleItem 
                  day="Quarta-feira" 
                  hours={pizzariaInfo.horario.quarta} 
                  isOpen={new Date().getDay() === 3 && aberto}
                />
                <ScheduleItem 
                  day="Quinta-feira" 
                  hours={pizzariaInfo.horario.quinta} 
                  isOpen={new Date().getDay() === 4 && aberto}
                />
                <ScheduleItem 
                  day="Sexta-feira" 
                  hours={pizzariaInfo.horario.sexta} 
                  isOpen={new Date().getDay() === 5 && aberto}
                />
                <ScheduleItem 
                  day="Sábado" 
                  hours={pizzariaInfo.horario.sabado} 
                  isOpen={new Date().getDay() === 6 && aberto}
                />
                <HStack justifyContent="space-between" py={2}>
                  <Text fontWeight="medium" color={colors.darkBlue}>Domingo</Text>
                  <Badge
                    variant="subtle"
                    bg={new Date().getDay() === 0 && aberto ? `${colors.success}20` : `${colors.primary}20`}
                    _text={{ 
                      color: new Date().getDay() === 0 && aberto ? colors.success : colors.primary 
                    }}
                    px={2}
                  >
                    {pizzariaInfo.horario.domingo}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </InfoCard>
        </Box>
      </ScrollView>
      
      {/* Rodapé com botões de ação */}
      <Box p={4} bg="white" shadow={5}>
        <HStack space={3}>
          <Pressable 
            flex={1}
            bg={colors.darkBlue}
            py={3.5}
            borderRadius="lg"
            _pressed={{ bg: colors.darkBlue+"e0" }}
            onPress={() => {
              toast.show({
                description: "Abrindo localização no mapa",
                placement: "top",
                bg: colors.secondary,
              });
            }}
          >
            <HStack space={2} justifyContent="center" alignItems="center">
              <Icon as={Ionicons} name="location-outline" color="white" size="sm" />
              <Text color="white" fontWeight="bold" fontSize="md">Ver no Mapa</Text>
            </HStack>
          </Pressable>
          
          <Pressable 
            flex={1.5}
            bg={colors.primary}
            py={3.5}
            borderRadius="lg"
            _pressed={{ bg: colors.primary+"e0" }}
            onPress={() => {
              toast.show({
                description: "Redirecionando para cardápio",
                placement: "top",
                bg: colors.primary,
              });
            }}
          >
            <HStack space={2} justifyContent="center" alignItems="center">
              <Icon as={Ionicons} name="pizza-outline" color="white" size="sm" />
              <Text color="white" fontWeight="bold" fontSize="md">Fazer Pedido</Text>
            </HStack>
          </Pressable>
        </HStack>
      </Box>
    </VStack>
  );
};

export default About;