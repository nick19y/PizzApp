import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./views/Login";
import NaoEncontrado from "./views/NaoEncontrado";
import Cardapio from "./views/Cardapio";
import Clientes from "./views/Clientes";
import Estoque from "./views/Estoque";
import Home from "./views/Home";
import Pedidos from "./views/Pedidos";
import Relatorios from "./views/Relatorios";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import CadastroAdmin from "./views/CadastroAdministrador";

const router = createBrowserRouter([
    {
        path:'/',
        element: <DefaultLayout/>,
        children: [
            {
                path: '/cardapio',
                element: <Cardapio/>
            },
            {
                path: '/clientes',
                element: <Clientes/>
            },
            {
                path: '/estoque',
                element: <Estoque/>
            },
            {
                path: '/home',
                element: <Home/>
            },
            {
                path: '/pedidos',
                element: <Pedidos/>
            },
            {
                path: '/relatorios',
                element: <Relatorios/>
            },
            {
                path: '/',
                element: <Navigate to="/home"/>
            },
        ]
    },
    {
        path:'/',
        element: <GuestLayout/>,
        children: [
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/cadastro_admin',
                element: <CadastroAdmin/>
            },
        ]
    },
    {
        path: '*',
        element: <NaoEncontrado/>
    },
])

export default router;