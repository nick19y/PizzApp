import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Detectar se estamos em emulador/dispositivo físico ou web
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api'; // Endereço do host para emulador Android
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
    timeout: 10000, // Aumentar timeout para debug
});

// Interceptor de requisição
axiosClient.interceptors.request.use(async (config) => {
    try {
        console.log(`Fazendo requisição para: ${config.baseURL}${config.url}`);
        
        // Buscando o token do AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        
        // Se houver token, adicione ao cabeçalho de autorização
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Token encontrado e adicionado à requisição");
        } else {
            console.log("Nenhum token de autenticação encontrado");
        }
        
        return config;
    } catch (error) {
        console.error("Erro no interceptor de requisição:", error);
        return Promise.reject(error);
    }
});

// Interceptor para tratar respostas e erros
axiosClient.interceptors.response.use(
    (response) => {
        console.log("Resposta recebida com sucesso:", response.status);
        return response;
    },
    (error) => {
        console.error("Erro na requisição:", error);
        
        // Verificar se é um erro de rede
        if (error.message === 'Network Error') {
            console.error("Erro de rede. Verifique se o backend está rodando e acessível.");
        }
        
        // Se o erro for 401 (não autorizado)
        if (error.response?.status === 401) {
            console.log("Não autorizado. Redirecionando para login...");
            // Limpar os dados armazenados quando o token expirar
            AsyncStorage.removeItem('userToken');
            AsyncStorage.removeItem('userData');
            
            // Redirecionamento será tratado no componente que recebe o erro
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;