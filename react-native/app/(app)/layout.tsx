import { useAuth } from '../../context/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

// Definindo o esquema de cores
const colors = {
  primary: "#f97316", // Laranja - cor de destaque
  darkBlue: "#1e293b", // Azul escuro - cor do header
  secondary: "#3b82f6", // Azul - cor secundária
  tertiary: "#8b5cf6", // Roxo - cor terciária
  success: "#10b981", // Verde - para badges/status
};

export default function AppLayout() {
  // Obtém o estado de autenticação
  const { session, loading } = useAuth();
  
  // Mostra indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.darkBlue }}>Verificando autenticação...</Text>
      </View>
    );
  }
  
  // Redireciona para signin se não houver sessão
  if (!session) {
    return <Redirect href="/signin" />;
  }
  
  // Renderiza o Stack navigator para as páginas autenticadas
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}