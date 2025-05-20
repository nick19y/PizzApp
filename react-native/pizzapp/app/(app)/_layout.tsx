import { Redirect, Slot } from "expo-router";

export default function AppLayout(){
    const session = false
    return !session ? <Redirect href="/login"/> : <Slot/>
}