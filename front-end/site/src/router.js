import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Estoque from "./pages/Estoque";
import Login from "./pages/Login";
import Cardapio from "./pages/Cardapio";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Relatorios from "./pages/Relatorios";



const router = createBrowserRouter([
    { path: '/cardapio', element: <Cardapio/>},
    { path: '/clientes', element: <Clientes/>},
    { path: '/estoque', element: <Estoque/>},
    { path: '/', element: <Home/>},
    { path: '/login', element: <Login/>},
    { path: '/pedidos', element: <Pedidos/>},
    { path: '/relatorios', element: <Relatorios/>},
]);

export default router;