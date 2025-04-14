import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeBaseProvider } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <NativeBaseProvider>
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                title: 'Home',
                tabBarIcon: ({ color, size }) => (<Ionicons name='home' size={size} color={color}/>),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Pedidos',
                    tabBarIcon: ({ color, size }) => (<MaterialIcons name='receipt' size={size} color={color}/>),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'Sobre',
                    tabBarIcon: ({ color, size }) => (<Ionicons name='information-circle' size={size} color={color}/>),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                title: 'Profile',
                tabBarIcon: ({ color, size }) => (<Ionicons name='person' size={size} color={color}/>),
                }}
            />
        </Tabs>
    </NativeBaseProvider>
  );
}
