import { Slot } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NativeBaseProvider>
        <Slot />
      </NativeBaseProvider>
    </AuthProvider>
  );
}