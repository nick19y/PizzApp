import { useAuth } from '../../context/AuthContext';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeBaseProvider, extendTheme } from 'native-base';

// Definindo o esquema de cores unificado
const colors = {
  primary: "#f97316", // Laranja - cor de destaque
  darkBlue: "#1e293b", // Azul escuro - cor do header
  secondary: "#3b82f6", // Azul - cor secundária
  tertiary: "#8b5cf6", // Roxo - cor terciária
  success: "#10b981", // Verde - para badges/status
  light: "#ffffff",
  grayBg: "#f8fafc",
  grayText: "#64748b",
  warning: "#eab308",
  danger: "#ef4444",
  info: "#0284c7"
};

// Temas customizados para o NativeBase
const theme = extendTheme({
  colors: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: colors.primary,
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    secondary: {
      500: colors.secondary,
    },
    success: {
      500: colors.success,
    },
    warning: {
      500: colors.warning,
    },
    danger: {
      500: colors.danger,
    },
    info: {
      500: colors.info,
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

// Componente TabsNavigator para ser usado após autenticação
function TabsNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkBlue,
        tabBarStyle: {
          backgroundColor: colors.light,
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='receipt' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Sobre',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='information-circle' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Layout principal que verifica autenticação
export default function AppLayout() {
  // Obtém o estado de autenticação
  const { session, loading } = useAuth();
  
  // NativeBase provider para o app todo
  return (
    <NativeBaseProvider theme={theme}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.darkBlue }}>Verificando autenticação...</Text>
        </View>
      ) : !session ? (
        <Redirect href="/signin" />
      ) : (
        <TabsNavigator />
      )}
    </NativeBaseProvider>
  );
}