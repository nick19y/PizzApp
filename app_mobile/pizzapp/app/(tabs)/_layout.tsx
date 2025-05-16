import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider } from 'native-base';

// Definindo o esquema de cores baseado no design anterior
const colors = {
  primary: "#f97316", // Laranja - cor de destaque
  darkBlue: "#1e293b", // Azul escuro - cor do header
  secondary: "#3b82f6", // Azul - cor secundária
  tertiary: "#8b5cf6", // Roxo - cor terciária
  success: "#10b981", // Verde - para badges/status
};

export default function TabLayout() {
  return (
    <NativeBaseProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.darkBlue,
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name='home' size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Pedidos',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name='receipt' size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: 'Sobre',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name='information-circle' size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name='person' size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: 'Login',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name='log-in' size={size + 4} color={color} />
            ),
          }}
        />
      </Tabs>
    </NativeBaseProvider>
  );
}