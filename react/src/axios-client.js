import axios from "axios";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        try {
            // Check if error has a response property before accessing it
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('ACCESS_TOKEN');
            }
        } catch (e) {
            console.error(e);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;