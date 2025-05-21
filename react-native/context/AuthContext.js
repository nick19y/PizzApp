import { createContext, useContext, useState, useEffect } from "react";
import { SafeAreaView, Text, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cria o contexto de autenticação
const AuthContext = createContext();

// Provedor de autenticação
const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true); // Começa como true para verificar o storage
    const [session, setSession] = useState(true);
    const [user, setUser] = useState(null);

    // Função para verificar se existe uma sessão salva
    const checkSession = async () => {
        try {
            setLoading(true);
            // Busca dados da sessão no AsyncStorage
            const userToken = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');
            
            if (userToken) {
                // Se o token existir, restaura a sessão
                console.log("token existe")
                setSession(userToken);
                setUser(userData ? JSON.parse(userData) : null);
                
                // Aqui você pode opcionalmente validar o token com o backend
                // await validateToken(userToken);
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            // Limpa os dados em caso de erro
            await signout();
        } finally {
            setLoading(false);
        }
    };

    // Executa a verificação de sessão ao iniciar
    useEffect(() => {
        checkSession();
    }, []);

    // Função de login
    const signin = async (email, password) => {
        setLoading(true);
        try {
            // Aqui você faria uma chamada para sua API
            // Exemplo simulado:
            // const response = await fetch('https://sua-api.com/login', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            
            // Simulação de resposta bem-sucedida
            const mockResponse = {
                token: 'token-exemplo-123456',
                user: {
                    id: 1,
                    name: 'Usuário Teste',
                    email: email
                }
            };
            
            // Guarda os dados no AsyncStorage
            await AsyncStorage.setItem('userToken', mockResponse.token);
            await AsyncStorage.setItem('userData', JSON.stringify(mockResponse.user));
            
            // Atualiza o estado do contexto
            setSession(mockResponse.token);
            setUser(mockResponse.user);
            
            return true;
        } catch (error) {
            console.error("Erro no login:", error);
            return { error: "Falha ao realizar login. Verifique suas credenciais." };
        } finally {
            setLoading(false);
        }
    };

    // Função de logout
    const signout = async () => {
        setLoading(true);
        try {
            // Remove os dados do AsyncStorage
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            
            // Limpa o estado do contexto
            setSession(null);
            setUser(null);
            
            return true;
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Valores disponibilizados pelo contexto
    const contextData = { 
        session, 
        user, 
        signin, 
        signout,
        isAuthenticated: !!session, // Helper para verificar autenticação
        loading,
        refreshSession: checkSession // Permitir atualizar a sessão manualmente
    };

    // Tela de carregamento
    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={{ marginTop: 10 }}>Carregando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar o contexto
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};

export { AuthContext, AuthProvider, useAuth };