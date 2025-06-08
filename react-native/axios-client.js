import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Detectar se estamos em emulador/dispositivo físico ou web
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.100.57:8000/api'; // Endereço do host para emulador Android
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:8000/api'; // Para iOS
  } else {
    return 'http://localhost:8000/api'; // Web
  }
};

console.log("Plataforma:", Platform.OS);
const baseURL = getBaseUrl();
console.log("API BASE URL:", baseURL);

const axiosClient = axios.create({
    baseURL,
    timeout: 10000, // Timeout de 10 segundos
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Remover headers que podem causar preflight CORS
        // Não adicionar 'X-Requested-With' que causa problemas CORS
    },
});

// Interceptor de requisição - VERSÃO CORRIGIDA
axiosClient.interceptors.request.use(async (config) => {
    try {
        console.log(`=== REQUISIÇÃO ===`);
        console.log(`URL: ${config.baseURL}${config.url}`);
        console.log(`Método: ${config.method?.toUpperCase()}`);
        console.log(`Headers atuais:`, config.headers);
        
        // Buscando o token do AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        
        // Se houver token, adicione ao cabeçalho de autorização
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Token encontrado e adicionado à requisição");
        } else {
            console.log("⚠️ Nenhum token de autenticação encontrado");
        }
        
        // Log dos dados sendo enviados (se houver)
        if (config.data) {
            // console.log("Dados sendo enviados:", JSON.stringify(config.data, null, 2));
        }
        
        return config;
    } catch (error) {
        console.error("❌ Erro no interceptor de requisição:", error);
        return Promise.reject(error);
    }
});

// Interceptor para tratar respostas e erros - VERSÃO MELHORADA
axiosClient.interceptors.response.use(
    (response) => {
        console.log("=== RESPOSTA SUCESSO ===");
        console.log(`Status: ${response.status}`);
        console.log(`URL: ${response.config.url}`);
        console.log("Headers de resposta:", response.headers);
        console.log("Dados recebidos:", response.data);
        console.log("========================");
        return response;
    },
    async (error) => {
        console.error("=== ERRO NA REQUISIÇÃO ===");
        
        if (error.response) {
            // O servidor respondeu com um status de erro
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
            console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
            console.error(`URL: ${error.config?.url}`);
            
            // Tratamento específico para diferentes tipos de erro
            switch (error.response.status) {
                case 401:
                    console.log("🚫 Não autorizado. Limpando token...");
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('userData');
                    break;
                    
                case 403:
                    console.log("🚫 Acesso proibido");
                    break;
                    
                case 422:
                    console.log("❌ Erro de validação:", error.response.data);
                    break;
                    
                case 500:
                    console.log("🔥 Erro interno do servidor");
                    break;
            }
            
        } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            console.error("❌ Erro de rede/conexão:");
            console.error("Request:", error.request);
            console.error("Verifique se o backend está rodando e acessível no endereço:", baseURL);
            
            // Verificar se é especificamente erro de rede
            if (error.message === 'Network Error') {
                console.error("🌐 Erro de rede detectado. Possíveis causas:");
                console.error("1. Backend não está rodando");
                console.error("2. URL incorreta");
                console.error("3. Problemas de CORS");
                console.error("4. Firewall/antivírus bloqueando");
            }
            
        } else {
            // Algo aconteceu na configuração da requisição
            console.error("❌ Erro na configuração:", error.message);
        }
        
        console.error("Config da requisição:", error.config);
        console.error("==========================");
        
        return Promise.reject(error);
    }
);

export default axiosClient;