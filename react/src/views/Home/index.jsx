import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Pizza, ShoppingCart, Clock, Users, ChevronRight, CircleDollarSign } from "lucide-react";
import styles from "./Home.module.css";
import { useStateContext } from "../../contexts/ContextProvider";

export default function Home() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useStateContext();
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    const recentOrders = [
        { id: '#4832', customer: 'João Silva', items: '1 Portuguesa G, 1 Refrigerante', total: 'R$ 57,90', status: 'Entregue' },
        { id: '#4831', customer: 'Maria Oliveira', items: '1 Calabresa M, 1 Suco', total: 'R$ 42,50', status: 'Em entrega' },
        { id: '#4830', customer: 'Pedro Santos', items: '2 Margherita P, 1 Água', total: 'R$ 61,80', status: 'Preparando' },
        { id: '#4829', customer: 'Ana Costa', items: '1 Frango c/ Catupiry G', total: 'R$ 52,00', status: 'Entregue' },
    ];

    return (
        <div className={styles.home}>
            <main className={styles.main}>
                <div className={styles.welcome_section}>
                    <div className={styles.welcome_text}>
                        <h1 className={styles.welcome_title}>Bem-vindo, {user.name || 'Administrador'}</h1>
                        <p className={styles.welcome_subtitle}>
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | 
                            {currentTime.toLocaleTimeString('pt-BR')}
                        </p>
                    </div>
                </div>
                
                <div className={styles.stats_grid}>
                    <div className={`${styles.stat_card} ${styles.primary}`}>
                        <div className={styles.stat_header}>
                            <h3>Vendas Hoje</h3>
                            <CircleDollarSign className={styles.stat_icon} />
                        </div>
                        <p className={styles.stat_value}>R$ 1.284,50</p>
                        <p className={styles.stat_change}>
                            <TrendingUp className={styles.trend_up} /> +12% desde ontem
                        </p>
                    </div>
                    
                    <div className={`${styles.stat_card} ${styles.secondary}`}>
                        <div className={styles.stat_header}>
                            <h3>Pedidos</h3>
                            <ShoppingCart className={styles.stat_icon} />
                        </div>
                        <p className={styles.stat_value}>24</p>
                        <p className={styles.stat_change}>
                            <TrendingUp className={styles.trend_up} /> +8% desde ontem
                        </p>
                    </div>
                    
                    <div className={`${styles.stat_card} ${styles.success}`}>
                        <div className={styles.stat_header}>
                            <h3>Pizzas Vendidas</h3>
                            <Pizza className={styles.stat_icon} />
                        </div>
                        <p className={styles.stat_value}>42</p>
                        <p className={styles.stat_subtext}>Mais popular: Portuguesa</p>
                    </div>
                    
                    <div className={`${styles.stat_card} ${styles.info}`}>
                        <div className={styles.stat_header}>
                            <h3>Tempo Médio</h3>
                            <Clock className={styles.stat_icon} />
                        </div>
                        <p className={styles.stat_value}>28 min</p>
                        <p className={styles.stat_subtext}>Do pedido à entrega</p>
                    </div>
                </div>
                
                <div className={styles.content_grid}>
                    <div className={styles.chart_container}>
                        <div className={styles.section_header}>
                            <h2>Vendas da Semana</h2>
                            <BarChart3 />
                        </div>
                        <div className={styles.chart_placeholder}>
                            <div className={styles.bar_chart}>
                                <div className={styles.bar} style={{ height: '40%' }}><span>Seg</span></div>
                                <div className={styles.bar} style={{ height: '65%' }}><span>Ter</span></div>
                                <div className={styles.bar} style={{ height: '55%' }}><span>Qua</span></div>
                                <div className={styles.bar} style={{ height: '70%' }}><span>Qui</span></div>
                                <div className={styles.bar} style={{ height: '85%' }}><span>Sex</span></div>
                                <div className={styles.bar} style={{ height: '95%' }}><span>Sáb</span></div>
                                <div className={styles.bar} style={{ height: '75%' }}><span>Dom</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.recent_orders}>
                        <div className={styles.section_header}>
                            <h2>Pedidos Recentes</h2>
                            <ShoppingCart />
                        </div>
                        <table className={styles.orders_table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Itens</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.items}</td>
                                        <td>{order.total}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[order.status.toLowerCase().replace(' ', '_')]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.view_button}>
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={styles.view_all}>
                            <a href="/pedidos">Ver todos os pedidos</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}