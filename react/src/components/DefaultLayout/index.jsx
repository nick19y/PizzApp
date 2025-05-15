import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import Header from "../Header";
import { useEffect } from "react";
import axiosClient from "../../axios-client";

export default function DefaultLayout() {
    const { user, token, setUser, setToken } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = async (ev) => {
        ev.preventDefault();
        try {
            await axiosClient.post('logout');
            setUser({});
            setToken(null);
            window.location.href = '/login';
        } catch (error) {
            console.error("Erro ao fazer logout no DefaultLayout:", error);
        }
    };

    useEffect(() => {
        axiosClient.get('/user')
            .then(({ data }) => {
                setUser(data);
            });
    }, [setUser]); // Adicione setUser como dependência para evitar warnings

    return (
        <div>
            <Header onLogout={onLogout} /> {/* Passando a função onLogout como prop */}
            <Outlet />
        </div>
    );
}