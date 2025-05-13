import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import Header from "../Header";
export default function DefaultLayout(){
    const {user, token} = useStateContext();
    console.log("Default layout")
    if(!token){
        return <Navigate to="/login"/>
    }
    return(
        <div>
            <Header/>
            <Outlet/>
        </div>
    )
}