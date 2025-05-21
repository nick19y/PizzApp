import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Headers customizados nas telas
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Meus Pedidos'
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'Criar Pedido',
          presentation: 'modal' // Opcional: apresentar como modal
        }}
      />
    </Stack>
  );
}