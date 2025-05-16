import { useState, useEffect } from "react";
import axiosClient from "../../axios-client.js";
import styles from "./Relatorios.module.css";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Clock, DollarSign, ShoppingBag, TrendingUp, ChevronDown, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Package, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';

export default function Relatorios() {
  // Estados para armazenar dados do backend
  const [maisVendidoRes, setMaisVendidoRes] = useState(null);
  const [estatisticasRes, setEstatisticasRes] = useState(null);
  const [vendasPorDiaRes, setVendasPorDiaRes] = useState(null);
  const [vendasPorProdutoRes, setVendasPorProdutoRes] = useState(null);
  const [vendasPorCategoriaRes, setVendasPorCategoriaRes] = useState(null);
  const [vendasPorHorarioRes, setVendasPorHorarioRes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Estados para filtros
  const [periodoSelecionado, setPeriodoSelecionado] = useState('7d');
  const [filtroAberto, setFiltroAberto] = useState(false);

  // Carregar dados de vendas do backend
  const carregarDadosVendas = async () => {
    setIsLoading(true);
    setErro(null);
    
    try {
      // Determinar o período com base no filtro selecionado
      const hoje = new Date();
      let dataIni = new Date();
      
      switch (periodoSelecionado) {
        case '1d':
          dataIni = new Date(hoje);
          break;
        case '7d':
          dataIni.setDate(hoje.getDate() - 7);
          break;
        case '15d':
          dataIni.setDate(hoje.getDate() - 15);
          break;
        case '30d':
          dataIni.setDate(hoje.getDate() - 30);
          break;
        case '90d':
          dataIni.setDate(hoje.getDate() - 90);
          break;
        default:
          dataIni.setDate(hoje.getDate() - 7);
      }
      
      const params = {
        start_date: dataIni.toISOString().split('T')[0],
        end_date: hoje.toISOString().split('T')[0]
      };

      // Fazer uma requisição simples
      const fetchSafe = async (url) => {
        try {
          const response = await axiosClient.get(url, { params });
          console.log(`Resposta de ${url}:`, response.data);
          return response.data;
        } catch (error) {
          console.error(`Erro ao buscar ${url}:`, error);
          return null;
        }
      };
      
      // Fazer as requisições em sequência para facilitar depuração
      const maisVendido = await fetchSafe('/reports/most-sold-item');
      const estatisticas = await fetchSafe('/reports/sales-stats');
      const vendasPorDia = await fetchSafe('/reports/sales-by-day');
      const vendasPorProduto = await fetchSafe('/reports/sales-by-product');
      const vendasPorCategoria = await fetchSafe('/reports/sales-by-category');
      const vendasPorHorario = await fetchSafe('/reports/sales-by-hour');
      
      // Armazenar os resultados diretamente
      setMaisVendidoRes(maisVendido);
      setEstatisticasRes(estatisticas);
      setVendasPorDiaRes(vendasPorDia);
      setVendasPorProdutoRes(vendasPorProduto);
      setVendasPorCategoriaRes(vendasPorCategoria);
      setVendasPorHorarioRes(vendasPorHorario);
      
    } catch (error) {
      console.error("Erro geral:", error);
      setErro(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados apenas uma vez quando o componente montar
  useEffect(() => {
    carregarDadosVendas();
  }, [periodoSelecionado]); // Atualizar quando o período mudar

  // Apenas para depuração - mostrar os dados no console para verificar
  useEffect(() => {
    if (!isLoading) {
      console.log("Dados carregados:", {
        maisVendidoRes,
        estatisticasRes,
        vendasPorDiaRes,
        vendasPorProdutoRes,
        vendasPorCategoriaRes,
        vendasPorHorarioRes
      });
    }
  }, [isLoading, maisVendidoRes, estatisticasRes, vendasPorDiaRes, vendasPorProdutoRes, vendasPorCategoriaRes, vendasPorHorarioRes]);

  // Função auxiliar para formatar data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Cores para os gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444'];
  
  // Formatar moeda
  const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };
  
  // Componente de card para estatísticas
  const StatCard = ({ title, value, icon, color, change, changeType }) => {
    const Icon = icon;
    return (
      <div className={styles.stat_card} style={{ borderColor: color }}>
        <div className={styles.stat_icon} style={{ backgroundColor: `${color}20`, color: color }}>
          <Icon size={20} />
        </div>
        <div className={styles.stat_content}>
          <h3 className={styles.stat_title}>{title}</h3>
          <p className={styles.stat_value}>{value}</p>
          {change !== undefined && (
            <div className={`${styles.stat_change} ${changeType === 'up' ? styles.positive : changeType === 'down' ? styles.negative : ''}`}>
              {changeType === 'up' ? <ArrowUp size={14} /> : changeType === 'down' ? <ArrowDown size={14} /> : null}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar os dados com estilo
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard de Relatórios de Vendas</h1>
        
        <div className={styles.period_selector}>
          <div className={styles.period_current} onClick={() => setFiltroAberto(!filtroAberto)}>
            <Calendar size={16} />
            <span>
              {periodoSelecionado === '1d' && 'Hoje'}
              {periodoSelecionado === '7d' && 'Últimos 7 dias'}
              {periodoSelecionado === '15d' && 'Últimos 15 dias'}
              {periodoSelecionado === '30d' && 'Últimos 30 dias'}
              {periodoSelecionado === '90d' && 'Últimos 90 dias'}
            </span>
            <ChevronDown size={16} className={filtroAberto ? styles.rotated : ''} />
          </div>
          
          {filtroAberto && (
            <div className={styles.period_dropdown}>
              <div 
                className={`${styles.period_option} ${periodoSelecionado === '1d' ? styles.selected : ''}`}
                onClick={() => { setPeriodoSelecionado('1d'); setFiltroAberto(false); }}
              >
                Hoje
              </div>
              <div 
                className={`${styles.period_option} ${periodoSelecionado === '7d' ? styles.selected : ''}`}
                onClick={() => { setPeriodoSelecionado('7d'); setFiltroAberto(false); }}
              >
                Últimos 7 dias
              </div>
              <div 
                className={`${styles.period_option} ${periodoSelecionado === '15d' ? styles.selected : ''}`}
                onClick={() => { setPeriodoSelecionado('15d'); setFiltroAberto(false); }}
              >
                Últimos 15 dias
              </div>
              <div 
                className={`${styles.period_option} ${periodoSelecionado === '30d' ? styles.selected : ''}`}
                onClick={() => { setPeriodoSelecionado('30d'); setFiltroAberto(false); }}
              >
                Últimos 30 dias
              </div>
              <div 
                className={`${styles.period_option} ${periodoSelecionado === '90d' ? styles.selected : ''}`}
                onClick={() => { setPeriodoSelecionado('90d'); setFiltroAberto(false); }}
              >
                Últimos 90 dias
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <button className={`${styles.action_button} ${styles.refresh}`} onClick={carregarDadosVendas}>
            <RefreshCw size={16} />
            <span>Atualizar</span>
          </button>
          
          <button className={`${styles.action_button} ${styles.export}`}>
            <Download size={16} />
            <span>Exportar</span>
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
          {/* Cards de estatísticas */}
          {estatisticasRes && (
            <div className={styles.stats_cards}>
              <StatCard 
                title="Vendas Totais" 
                value={formatarMoeda(estatisticasRes.current_period.total_sales)}
                icon={DollarSign}
                color="#3b82f6"
                change={estatisticasRes.growth.sales_growth}
                changeType={estatisticasRes.growth.sales_growth > 0 ? 'up' : estatisticasRes.growth.sales_growth < 0 ? 'down' : 'neutral'}
              />
              
              <StatCard 
                title="Pedidos" 
                value={estatisticasRes.current_period.total_orders}
                icon={ShoppingBag}
                color="#10b981"
                change={estatisticasRes.growth.orders_growth}
                changeType={estatisticasRes.growth.orders_growth > 0 ? 'up' : estatisticasRes.growth.orders_growth < 0 ? 'down' : 'neutral'}
              />
              
              <StatCard 
                title="Ticket Médio" 
                value={formatarMoeda(estatisticasRes.current_period.average_ticket)}
                icon={TrendingUp}
                color="#f59e0b"
                change={estatisticasRes.growth.ticket_growth}
                changeType={estatisticasRes.growth.ticket_growth > 0 ? 'up' : estatisticasRes.growth.ticket_growth < 0 ? 'down' : 'neutral'}
              />
              
              {maisVendidoRes && (
                <StatCard 
                  title="Produto Mais Vendido" 
                  value={maisVendidoRes.item.name}
                  icon={Package}
                  color="#ec4899"
                />
              )}
            </div>
          )}
          
          <div className={styles.reports_grid}>
            {/* Produto Mais Vendido */}
            <div className={`${styles.report_card} ${styles.most_sold}`}>
              <h2>Produto Mais Vendido</h2>
              {maisVendidoRes && (
                <div>
                  <p><span className={styles.highlight}>Produto:</span> {maisVendidoRes.item.name}</p>
                  <p><span className={styles.highlight}>Descrição:</span> {maisVendidoRes.item.description}</p>
                  <p><span className={styles.highlight}>Categoria:</span> {maisVendidoRes.item.category}</p>
                  <p><span className={styles.highlight}>Quantidade vendida:</span> {maisVendidoRes.quantity}</p>
                  <p><span className={styles.highlight}>Valor total:</span> R$ {maisVendidoRes.total_value}</p>
                </div>
              )}
            </div>
            
            {/* Estatísticas de Vendas */}
            <div className={`${styles.report_card} ${styles.sales_stats}`}>
              <h2>Estatísticas de Vendas</h2>
              {estatisticasRes && (
                <div>
                  <h3>Período Atual</h3>
                  <p><span className={styles.highlight}>Vendas totais:</span> R$ {estatisticasRes.current_period.total_sales}</p>
                  <p><span className={styles.highlight}>Pedidos totais:</span> {estatisticasRes.current_period.total_orders}</p>
                  <p><span className={styles.highlight}>Ticket médio:</span> R$ {estatisticasRes.current_period.average_ticket}</p>
                  
                  <h3>Crescimento</h3>
                  <p><span className={styles.highlight}>Crescimento de vendas:</span> {estatisticasRes.growth.sales_growth}%</p>
                  <p><span className={styles.highlight}>Crescimento de pedidos:</span> {estatisticasRes.growth.orders_growth}%</p>
                  <p><span className={styles.highlight}>Crescimento do ticket médio:</span> {estatisticasRes.growth.ticket_growth}%</p>
                </div>
              )}
            </div>
            
            {/* Vendas por Dia */}
            <div className={`${styles.report_card} ${styles.daily_sales}`}>
              <h2>Vendas por Dia</h2>
              {vendasPorDiaRes && vendasPorDiaRes.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={vendasPorDiaRes}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                    <Legend />
                    <Bar dataKey="vendas" fill="#3b82f6" name="Vendas (R$)" />
                    <Bar dataKey="pedidos" fill="#10b981" name="Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.no_data}>Sem dados para o período selecionado</p>
              )}
            </div>
            
            {/* Vendas por Produto */}
            <div className={`${styles.report_card} ${styles.product_sales}`}>
              <h2>Vendas por Produto</h2>
              {vendasPorProdutoRes && vendasPorProdutoRes.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={vendasPorProdutoRes}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value, name) => [name === 'valor' ? formatarMoeda(value) : value, name === 'valor' ? 'Valor' : 'Quantidade']} />
                    <Legend />
                    <Bar dataKey="valor" fill="#8b5cf6" name="Valor (R$)" />
                    <Bar dataKey="quantidade" fill="#ec4899" name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.no_data}>Sem dados para o período selecionado</p>
              )}
            </div>
            
            {/* Vendas por Categoria */}
            <div className={`${styles.report_card} ${styles.category_sales}`}>
              <h2>Vendas por Categoria</h2>
              {vendasPorCategoriaRes && vendasPorCategoriaRes.length > 0 ? (
                <div className={styles.chart_container}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={vendasPorCategoriaRes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, valor}) => `${name}: R$ ${valor}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {vendasPorCategoriaRes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatarMoeda(value), 'Valor']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.chart_summary}>
                    <h3>Resumo por Categoria</h3>
                    <ul>
                      {vendasPorCategoriaRes.map((item, index) => (
                        <li key={index}>
                          <span className={styles.category_name}>{item.name}:</span> 
                          <span className={styles.category_value}>{formatarMoeda(item.valor)}</span>
                          <span className={styles.category_qty}>({item.quantidade} {item.quantidade === 1 ? 'item' : 'itens'})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className={styles.no_data}>Sem dados para o período selecionado</p>
              )}
            </div>
            
            {/* Vendas por Horário */}
            <div className={`${styles.report_card} ${styles.hourly_sales}`}>
              <h2>Vendas por Horário</h2>
              {vendasPorHorarioRes && vendasPorHorarioRes.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={vendasPorHorarioRes}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => [name === 'vendas' ? formatarMoeda(value) : value, name === 'vendas' ? 'Vendas' : 'Pedidos']} />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="vendas" 
                      stroke="#f97316" 
                      activeDot={{ r: 8 }} 
                      name="Vendas (R$)" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="pedidos" 
                      stroke="#0ea5e9" 
                      name="Pedidos" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.no_data}>Sem dados para o período selecionado</p>
              )}
            </div>
          </div>
          
          <button className={styles.button} onClick={carregarDadosVendas}>
            Recarregar Dados
          </button>
        </>
      )}
    </div>
  );
}