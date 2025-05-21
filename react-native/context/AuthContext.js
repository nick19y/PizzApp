import { createContext, useContext, useState, useEffect } from "react";
import { SafeAreaView, Text, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "../axios-client"; // Certifique-se de ajustar o caminho para seu arquivo

// Cria o contexto de autenticação
const AuthContext = createContext();

// Provedor de autenticação
const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true); // Começa como true para verificar o storage
    const [session, setSession] = useState(null);
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
                console.log("Token existe no storage:", userToken.substring(0, 10) + "...");
                setSession(userToken);
                setUser(userData ? JSON.parse(userData) : null);
                
                // Você pode validar o token com o backend aqui
                try {
                    const response = await axiosClient.get('/user');
                    console.log("Validação do token bem-sucedida:", response.data);
                    
                    // Atualiza os dados do usuário caso necessário
                    if (response.data) {
                        setUser(response.data);
                        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
                    }
                } catch (validationError) {
                    console.error("Erro na validação do token:", validationError);
                    // Se o token for inválido, faz logout
                    await signout();
                }
            } else {
                setSession(null);
                setUser(null);
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
            // Fazer login usando o axiosClient
            const response = await axiosClient.post('/login', {
                email,
                password
            });
            
            // Verifica se a resposta contém o token e dados do usuário
            if (response.data && response.data.token) {
                const { token, user } = response.data;
                
                // Guarda os dados no AsyncStorage
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(user));
                
                // Atualiza o estado do contexto
                setSession(token);
                setUser(user);
                
                console.log("Login bem-sucedido para:", user.name);
                return { success: true };
            } else {
                throw new Error("Resposta de login inválida");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            
            // Criação de mensagens de erro amigáveis
            let errorMessage = "Falha ao realizar login. Verifique suas credenciais.";
            
            if (error.response) {
                // Resposta contém dados do erro
                if (error.response.status === 401) {
                    errorMessage = "Email ou senha incorretos";
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message === "Network Error") {
                errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
            }
            
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Função de logout
    const signout = async () => {
        setLoading(true);
        try {
            // Tenta fazer logout no servidor se estiver autenticado
            if (session) {
                try {
                    await axiosClient.post('/logout');
                    console.log("Logout no servidor bem-sucedido");
                } catch (logoutError) {
                    console.warn("Erro ao fazer logout no servidor:", logoutError);
                    // Continua com o logout local mesmo se falhar no servidor
                }
            }
            
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