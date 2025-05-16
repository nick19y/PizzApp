import {
    Menu,
    User,
    Users,
    Pizza,
    ShoppingCart,
    BarChart3,
    FileBarChart,
    Boxes,
    LogOut
} from "lucide-react";
import { useState } from "react";
import styles from "./Header.module.css";
import axiosClient from "../../axios-client";


export default function Header({ onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo_container}>
                    <Pizza className={styles.logo_icon} />
                    <h1 className={styles.logo_text}>PizzApp</h1>
                </div>

                <button
                    className={styles.menu_button}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <Menu />
                </button>

                <nav className={`${styles.navigation} ${menuOpen ? styles.active : ""}`}>
                    <ul className={styles.nav_list}>
                        <li className={styles.nav_item}>
                            <a href="/" className={styles.nav_link}>
                                <BarChart3 className={styles.nav_icon} />
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="/pedidos" className={styles.nav_link}>
                                <ShoppingCart className={styles.nav_icon} />
                                <span>Pedidos</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="/cardapio" className={styles.nav_link}>
                                <Pizza className={styles.nav_icon} />
                                <span>Cardápio</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="/relatorios" className={styles.nav_link}>
                                <FileBarChart className={styles.nav_icon} />
                                <span>Relatórios</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="/estoque" className={styles.nav_link}>
                                <Boxes className={styles.nav_icon} />
                                <span>Estoque</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="/clientes" className={styles.nav_link}>
                                <Users className={styles.nav_icon} />
                                <span>Clientes</span>
                            </a>
                        </li>
                        <li className={styles.nav_item}>
                            <a href="#" onClick={onLogout} className={styles.nav_link}>
                                <LogOut className={styles.nav_icon} />
                                <span>Sair</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}