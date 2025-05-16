import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Pizza, ShoppingCart, Clock, Users, ChevronRight, CircleDollarSign, RefreshCw, ArrowUp, ArrowDown, Eye } from "lucide-react";
import styles from "./Home.module.css";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Home() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user } = useStateContext();
    
    // Estados para armazenar dados do backend
    const [maisVendidoRes, setMaisVendidoRes] = useState(null);
    const [estatisticasRes, setEstatisticasRes] = useState(null);
    const [vendasPorDiaRes, setVendasPorDiaRes] = useState(null);
    const [pedidosRecentes, setPedidosRecentes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(null);
    
    // Atualizar relógio
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);
    
    // Carregar dados da API
    useEffect(() => {
        carregarDados();
    }, []);
    
    // Status mapping para português
    const statusMap = {
        'pending': 'Pendente',
        'processing': 'Processando',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'canceled': 'Cancelado'
    };
    
    // Função para carregar todos os dados necessários
    const carregarDados = async () => {
        setIsLoading(true);
        setErro(null);
        
        try {
            const hoje = new Date();
            let dataIni = new Date();
            dataIni.setDate(hoje.getDate() - 7); // Últimos 7 dias por padrão
            
            const params = {
                start_date: dataIni.toISOString().split('T')[0],
                end_date: hoje.toISOString().split('T')[0],
                limit: 10
            };
            
            // Função para fazer requisições de forma segura
            const fetchSafe = async (url, params = {}) => {
                try {
                    const response = await axiosClient.get(url, { params });
                    console.log(`Resposta de ${url}:`, response.data);
                    return response.data;
                } catch (error) {
                    console.error(`Erro ao buscar ${url}:`, error);
                    return null;
                }
            };
            
            // Fazer as requisições aos mesmos endpoints usados na página de relatórios
            const maisVendido = await fetchSafe('/reports/most-sold-item', params);
            const estatisticas = await fetchSafe('/reports/sales-stats', params);
            const vendasPorDia = await fetchSafe('/reports/sales-by-day', params);
            
            // Buscar pedidos recentes usando o mesmo endpoint da página Pedidos
            console.log("Buscando pedidos recentes...");
            const responseOrders = await axiosClient.get('/orders', { 
                params: { limit: 4, sort: '-created_at' } 
            });
            console.log("Resposta de pedidos:", responseOrders.data);
            
            // Processar pedidos da mesma forma que na página Pedidos
            const ordersData = await Promise.all(
                responseOrders.data.data.map(async (order) => {
                    // Buscar os itens de cada pedido
                    console.log(`Buscando itens para o pedido ${order.id}...`);
                    let orderItems = [];
                    try {
                        const itemsResponse = await axiosClient.get(`/order-items/${order.id}`);
                        orderItems = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
                    } catch (err) {
                        console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
                    }
                    
                    // Formatar os dados do pedido
                    return {
                        ...order,
                        items: orderItems,
                        clienteNome: order.user ? order.user.name : 'Cliente não encontrado',
                        clienteEmail: order.user ? order.user.email : '',
                        clienteTelefone: order.contact_phone,
                        data: order.created_at,
                        valor: order.total_amount,
                        status: statusMap[order.status] || order.status,
                        endereco: order.delivery_address
                    };
                })
            );
            
            // Armazenar os resultados nos estados
            setMaisVendidoRes(maisVendido);
            setEstatisticasRes(estatisticas);
            setVendasPorDiaRes(vendasPorDia);
            setPedidosRecentes(ordersData);
            
        } catch (error) {
            console.error("Erro geral:", error);
            setErro(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Função para formatar moeda
    const formatarMoeda = (valor) => {
        if (!valor && valor !== 0) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
    };
    
    // Função para formatar a lista de itens do pedido
    const formatarItens = (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) return "Sem itens";
        
        return items.map(item => {
            const tamanho = item.size === 'small' ? 'P' : (item.size === 'medium' ? 'M' : 'G');
            const itemName = item.item?.name || 'Item desconhecido';
            return `${item.quantity} ${itemName} (${tamanho})`;
        }).join(', ');
    };
    
    // Função para obter a classe CSS do status
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'entregue':
                return styles.entregue;
            case 'enviado':
                return styles.enviado;
            case 'processando':
                return styles.processando;
            case 'pendente':
                return styles.pendente;
            case 'cancelado':
                return styles.cancelado;
            default:
                return '';
        }
    };

    return (
        <div className={styles.home}>
            <main className={styles.main}>
                <div className={styles.welcome_section}>
                    <div className={styles.welcome_content}>
                        <div className={styles.welcome_text}>
                            <h1 className={styles.welcome_title}>Bem-vindo(a), {user.name || 'Administrador'}</h1>
                            <p className={styles.welcome_subtitle}>
                                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | 
                                {currentTime.toLocaleTimeString('pt-BR')}
                            </p>
                        </div>
                        <button className={styles.refresh_button} onClick={carregarDados} disabled={isLoading}>
                            <RefreshCw size={16} />
                            {isLoading ? 'Atualizando...' : 'Atualizar dados'}
                        </button>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Carregando dados...</p>
                    </div>
                ) : erro ? (
                    <div className={styles.error}>
                        <p>Erro ao carregar dados: {erro}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.stats_grid}>
                            {/* Dados reais da API */}
                            <div className={`${styles.stat_card} ${styles.primary}`}>
                                <div className={styles.stat_header}>
                                    <h3>Vendas</h3>
                                    <CircleDollarSign className={styles.stat_icon} />
                                </div>
                                <p className={styles.stat_value}>
                                    {estatisticasRes ? formatarMoeda(estatisticasRes.current_period.total_sales) : 'R$ 0,00'}
                                </p>
                            </div>
                            
                            <div className={`${styles.stat_card} ${styles.secondary}`}>
                                <div className={styles.stat_header}>
                                    <h3>Pedidos</h3>
                                    <ShoppingCart className={styles.stat_icon} />
                                </div>
                                <p className={styles.stat_value}>
                                    {estatisticasRes ? estatisticasRes.current_period.total_orders : '0'}
                                </p>
                            </div>
                            
                            <div className={`${styles.stat_card} ${styles.success}`}>
                                <div className={styles.stat_header}>
                                    <h3>Produto Mais Vendido</h3>
                                    <Pizza className={styles.stat_icon} />
                                </div>
                                <p className={styles.stat_value}>
                                    {maisVendidoRes ? maisVendidoRes.item.name : 'Carregando...'}
                                </p>
                            </div>
                            
                            <div className={`${styles.stat_card} ${styles.info}`}>
                                <div className={styles.stat_header}>
                                    <h3>Ticket Médio</h3>
                                    <Clock className={styles.stat_icon} />
                                </div>
                                <p className={styles.stat_value}>
                                    {estatisticasRes ? formatarMoeda(estatisticasRes.current_period.average_ticket) : 'R$ 0,00'}
                                </p>
                            </div>
                        </div>
                        
                        <div className={styles.content_grid}>
                            <div className={styles.chart_container}>
                                <div className={styles.section_header}>
                                    <h2>Vendas da Semana</h2>
                                    <BarChart3 />
                                </div>
                                {vendasPorDiaRes && vendasPorDiaRes.length > 0 ? (
                                    <div className={styles.chart_wrapper}>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart
                                                data={vendasPorDiaRes}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    angle={-45} 
                                                    textAnchor="end" 
                                                    height={70}
                                                    interval={0}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis 
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => `R$ ${value}`}
                                                />
                                                <Tooltip 
                                                    formatter={(value) => [formatarMoeda(value), 'Vendas']} 
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ marginTop: 10 }} />
                                                <Bar 
                                                    dataKey="vendas" 
                                                    fill="#3b82f6" 
                                                    name="Vendas (R$)" 
                                                    barSize={40}
                                                    radius={[4, 4, 0, 0]}
                                                    animationDuration={1500}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
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
                                )}
                            </div>
                            
                            <div className={styles.recent_orders}>
                                <div className={styles.section_header}>
                                    <h2>Pedidos Recentes</h2>
                                    <ShoppingCart />
                                </div>
                                <div className={styles.table_responsive}>
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
                                            {pedidosRecentes && pedidosRecentes.length > 0 ? (
                                                pedidosRecentes.map((pedido) => (
                                                    <tr key={pedido.id}>
                                                        <td className={styles.id_cell}>#{pedido.id}</td>
                                                        <td className={styles.cliente_cell}>{pedido.clienteNome}</td>
                                                        <td className={styles.items_cell}>
                                                            {formatarItens(pedido.items)}
                                                        </td>
                                                        <td className={styles.valor_cell}>{formatarMoeda(pedido.valor)}</td>
                                                        <td className={styles.status_cell}>
                                                            <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>
                                                                {pedido.status}
                                                            </span>
                                                        </td>
                                                        <td className={styles.action_cell}>
                                                            <a href={`/pedidos?id=${pedido.id}`} className={styles.view_button}>
                                                                <ChevronRight size={16} />
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className={styles.no_orders}>
                                                        Nenhum pedido recente encontrado
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className={styles.view_all}>
                                    <a href="/pedidos">Ver todos os pedidos</a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}