import { useState, useEffect } from "react";
import axiosClient from "../../axios-client.js";
import styles from "./Relatorios.module.css";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Clock, DollarSign, ShoppingBag, TrendingUp, ChevronDown, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Package, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Save, FileText, X, LayoutGrid } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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
  const [filtroAvancadoAberto, setFiltroAvancadoAberto] = useState(false);
  const [graficoSelecionado, setGraficoSelecionado] = useState('vendas-por-dia');
  const [limiteDados, setLimiteDados] = useState(10);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [categorias, setCategorias] = useState([]);
  const [ordenacao, setOrdenacao] = useState('valor-desc');

  const ajustarDadosHorario = (dados) => {
    if (!dados || !Array.isArray(dados)) return [];
    
    return dados.map(item => {
      if (item.name && item.name.includes(':')) {
        const hora = parseInt(item.name.split(':')[0], 10);
        let horaAjustada = hora - 3;
        
        if (horaAjustada < 0) {
          horaAjustada += 24;
        }
        
        // Formata com dois dígitos
        const horaFormatada = `${horaAjustada.toString().padStart(2, '0')}:00`;
        
        return {
          ...item,
          name: horaFormatada
        };
      }
      return item;
    });
  };

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
      case '180d':
        dataIni.setDate(hoje.getDate() - 180);
        break;
      case '365d':
        dataIni.setDate(hoje.getDate() - 365);
        break;
      default:
        dataIni.setDate(hoje.getDate() - 7);
    }
      
      const params = {
        start_date: dataIni.toISOString().split('T')[0],
        end_date: hoje.toISOString().split('T')[0],
        limit: limiteDados,
        category: filtroCategoria !== 'todas' ? filtroCategoria : undefined,
        order_by: ordenacao
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
      
      // Extrair categorias únicas para o filtro
      if (vendasPorCategoria && Array.isArray(vendasPorCategoria)) {
        const categoriasUnicas = vendasPorCategoria.map(cat => cat.name);
        setCategorias(categoriasUnicas);
      }
      
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

  // Carregar dados apenas uma vez quando o componente montar ou quando os filtros mudarem
  useEffect(() => {
    carregarDadosVendas();
  }, [periodoSelecionado, limiteDados, filtroCategoria, ordenacao]);

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

  // Gerar PDF do relatório
  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Adicionar título
    doc.setFontSize(20);
    doc.text(`Relatório de Vendas - ${getTituloPeriodo()}`, 15, 15);
    
    // Adicionar informações gerais
    doc.setFontSize(12);
    doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 15, 25);
    doc.text(`Período: ${getTituloPeriodo()}`, 15, 32);
    
    // Adicionar estatísticas
    if (estatisticasRes) {
      doc.setFontSize(16);
      doc.text('Resumo de Vendas', 15, 42);
      
      doc.setFontSize(12);
      doc.text(`Vendas totais: ${formatarMoeda(estatisticasRes.current_period.total_sales)}`, 15, 52);
      doc.text(`Pedidos totais: ${estatisticasRes.current_period.total_orders}`, 15, 59);
      doc.text(`Ticket médio: ${formatarMoeda(estatisticasRes.current_period.average_ticket)}`, 15, 66);
      
      // if (estatisticasRes.growth) {
      //   doc.text(`Crescimento de vendas: ${estatisticasRes.growth.sales_growth}%`, 15, 73);
      //   doc.text(`Crescimento de pedidos: ${estatisticasRes.growth.orders_growth}%`, 15, 80);
      //   doc.text(`Crescimento do ticket médio: ${estatisticasRes.growth.ticket_growth}%`, 15, 87);
      // }
    }
    
    // Adicionar produto mais vendido
    if (maisVendidoRes) {
      doc.setFontSize(16);
      doc.text('Produto Mais Vendido', 15, 100);
      
      doc.setFontSize(12);
      doc.text(`Produto: ${maisVendidoRes.item.name}`, 15, 110);
      doc.text(`Categoria: ${maisVendidoRes.item.category}`, 15, 117);
      doc.text(`Quantidade vendida: ${maisVendidoRes.quantity}`, 15, 124);
      doc.text(`Valor total: ${formatarMoeda(maisVendidoRes.total_value)}`, 15, 131);
    }
    
    // Adicionar tabela com base no gráfico selecionado
    let tableY = 145;
    
    switch (graficoSelecionado) {
      case 'vendas-por-dia': {
        doc.setFontSize(16);
        doc.text('Vendas por Dia', 15, tableY - 4);
        
        if (vendasPorDiaRes && vendasPorDiaRes.length > 0) {
          const tableColumn = ["Data", "Vendas (R$)", "Pedidos"];
          const tableRows = vendasPorDiaRes.map(item => [
            item.name,
            formatarMoeda(item.vendas),
            item.pedidos
          ]);
          
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableY,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
          });
        }
        break;
      }
      
      case 'vendas-por-produto': {
        doc.setFontSize(16);
        doc.text('Vendas por Produto', 15, tableY - 10);
        
        if (vendasPorProdutoRes && vendasPorProdutoRes.length > 0) {
          const tableColumn = ["Produto", "Valor (R$)", "Quantidade"];
          const tableRows = vendasPorProdutoRes.map(item => [
            item.name,
            formatarMoeda(item.valor),
            item.quantidade
          ]);
          
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableY,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] }
          });
        }
        break;
      }
      
      case 'vendas-por-categoria': {
        doc.setFontSize(16);
        doc.text('Vendas por Categoria', 15, tableY - 4);
        
        if (vendasPorCategoriaRes && vendasPorCategoriaRes.length > 0) {
          const tableColumn = ["Categoria", "Valor (R$)", "Quantidade"];
          const tableRows = vendasPorCategoriaRes.map(item => [
            item.name,
            formatarMoeda(item.valor),
            item.quantidade
          ]);
          
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableY,
            theme: 'striped',
            headStyles: { fillColor: [236, 72, 153] }
          });
        }
        break;
      }
      
      case 'vendas-por-horario': {
        doc.setFontSize(16);
        doc.text('Vendas por Horário', 15, tableY - 10);
        
        if (vendasPorHorarioRes && vendasPorHorarioRes.length > 0) {
          const tableColumn = ["Horário", "Vendas (R$)", "Pedidos"];
          const tableRows = vendasPorHorarioRes.map(item => [
            item.name,
            formatarMoeda(item.vendas),
            item.pedidos
          ]);
          
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableY,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] }
          });
        }
        break;
      }
    }
    
    // Adicionar rodapé
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 280;
    doc.setFontSize(10);
    doc.text('Relatório gerado automaticamente pelo sistema PizzApp', 15, finalY + 15);
    doc.text(`Data e hora: ${new Date().toLocaleString('pt-BR')}`, 15, finalY + 22);
    
    // Salvar o PDF
    doc.save(`relatorio_vendas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Função para obter o título do período selecionado
  const getTituloPeriodo = () => {
    switch (periodoSelecionado) {
      case '1d': return 'Hoje';
      case '7d': return 'Últimos 7 dias';
      case '15d': return 'Últimos 15 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '180d': return 'Últimos 180 dias';
      case '365d': return 'Último ano';
      default: return 'Últimos 7 dias';
    }
  };

  // Renderizar o gráfico selecionado
  const renderizarGraficoSelecionado = () => {
    switch (graficoSelecionado) {
      case 'vendas-por-dia':
        return (
          <div className={styles.report_card_full}>
            <div className={styles.card_header}>
              <h2>Vendas por Dia</h2>
              <BarChartIcon size={20} className={styles.card_icon} />
            </div>
            {vendasPorDiaRes && vendasPorDiaRes.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={vendasPorDiaRes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'vendas') return [formatarMoeda(value), 'Vendas (R$)'];
                      if (name === 'pedidos') return [value, 'Pedidos'];
                      return [value, name];
                    }} 
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="vendas" 
                    fill="#3b82f6" 
                    name="Vendas (R$)" 
                    barSize={20}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="pedidos" 
                    fill="#10b981" 
                    name="Pedidos" 
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.no_data}>
                <p>Sem dados para o período selecionado</p>
              </div>
            )}
          </div>
        );
        
      case 'vendas-por-produto':
        return (
          <div className={styles.report_card_full}>
            <div className={styles.card_header}>
              <h2>Vendas por Produto</h2>
              <BarChartIcon size={20} className={styles.card_icon} />
            </div>
            {vendasPorProdutoRes && vendasPorProdutoRes.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={vendasPorProdutoRes}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={140}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
  formatter={(value, name) => {
    if (name === 'valor') return [formatarMoeda(value), 'Valor (R$)'];
    if (name === 'quantidade') return [value, 'Quantidade'];
    return [value, name];
  }} 
/>
                  <Legend />
                  <Bar dataKey="valor" fill="#8b5cf6" name="Valor (R$)" />
                  <Bar dataKey="quantidade" fill="#ec4899" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.no_data}>
                <p>Sem dados para o período selecionado</p>
              </div>
            )}
          </div>
        );
        
      case 'vendas-por-categoria':
        return (
          <div className={styles.report_card_full}>
            <div className={styles.card_header}>
              <h2>Vendas por Categoria</h2>
              <PieChartIcon size={20} className={styles.card_icon} />
            </div>
            {vendasPorCategoriaRes && vendasPorCategoriaRes.length > 0 ? (
              <div className={styles.chart_container}>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={vendasPorCategoriaRes}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
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
                      <li key={index} className={styles.summary_item}>
                        <span 
                          className={styles.color_dot} 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className={styles.category_name}>{item.name}</span>
                        <span className={styles.category_value}>{formatarMoeda(item.valor)}</span>
                        <span className={styles.category_qty}>
                          ({item.quantidade} {item.quantidade === 1 ? 'item' : 'itens'})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className={styles.no_data}>
                <p>Sem dados para o período selecionado</p>
              </div>
            )}
          </div>
        );
        
      case 'vendas-por-horario':
        return (
          <div className={styles.report_card_full}>
            <div className={styles.card_header}>
              <h2>Vendas por Horário</h2>
              <LineChartIcon size={20} className={styles.card_icon} />
            </div>
            {vendasPorHorarioRes && vendasPorHorarioRes.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={vendasPorHorarioRes.map(item => {
                    // Ajuste do fuso horário: subtrair 3 horas
                    if (item.name && item.name.includes(':')) {
                      const hora = parseInt(item.name.split(':')[0], 10);
                      let horaAjustada = hora - 3;
                      
                      // Se ficar negativo, ajusta para o formato 24h
                      if (horaAjustada < 0) {
                        horaAjustada += 24;
                      }
                      
                      // Formata com zero à esquerda quando necessário
                      const horaFormatada = `${horaAjustada.toString().padStart(2, '0')}:00`;
                      
                      return {
                        ...item,
                        name: horaFormatada
                      };
                    }
                    return item;
                  })}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'vendas') return [formatarMoeda(value), 'Vendas (R$)'];
                      if (name === 'pedidos') return [value, 'Pedidos'];
                      return [value, name];
                    }} 
                  />
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
              <div className={styles.no_data}>
                <p>Sem dados para o período selecionado</p>
              </div>
            )}
          </div>
              );
              
            default:
              return (
                <div className={styles.no_data}>
                  <p>Selecione um tipo de relatório</p>
                </div>
              );
          }
        };

  // Renderizar os dados com estilo
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard de Relatórios de Vendas</h1>
        
        <div className={styles.filters_row}>
          <div className={styles.period_selector}>
            <div className={styles.period_current} onClick={() => setFiltroAberto(!filtroAberto)}>
              <Calendar size={16} />
              <span>{getTituloPeriodo()}</span>
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
                <div 
                  className={`${styles.period_option} ${periodoSelecionado === '180d' ? styles.selected : ''}`}
                  onClick={() => { setPeriodoSelecionado('180d'); setFiltroAberto(false); }}
                >
                  Últimos 180 dias
                </div>
                <div 
                  className={`${styles.period_option} ${periodoSelecionado === '365d' ? styles.selected : ''}`}
                  onClick={() => { setPeriodoSelecionado('365d'); setFiltroAberto(false); }}
                >
                  Último ano
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.filter_advanced}>
            <button 
              className={styles.filter_button} 
              onClick={() => setFiltroAvancadoAberto(!filtroAvancadoAberto)}
            >
              <Filter size={16} />
              Filtros Avançados
              <ChevronDown size={16} className={filtroAvancadoAberto ? styles.rotated : ''} />
            </button>
            
            {filtroAvancadoAberto && (
              <div className={styles.advanced_filters_panel}>
                <div className={styles.filter_row}>
                  <div className={styles.filter_group}>
                    <label>Limite de Dados</label>
                    <select 
                      value={limiteDados} 
                      onChange={(e) => setLimiteDados(Number(e.target.value))}
                    >
                      <option value={5}>5 itens</option>
                      <option value={10}>10 itens</option>
                      <option value={20}>20 itens</option>
                      <option value={50}>50 itens</option>
                      <option value={100}>100 itens</option>
                    </select>
                  </div>
                  
                  <div className={styles.filter_group}>
                    <label>Categoria</label>
                    <select 
                      value={filtroCategoria} 
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <option value="todas">Todas as categorias</option>
                      {categorias.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.filter_group}>
                    <label>Ordenação</label>
                    <select 
                      value={ordenacao} 
                      onChange={(e) => setOrdenacao(e.target.value)}
                    >
                      <option value="valor-desc">Valor (maior para menor)</option>
                      <option value="valor-asc">Valor (menor para maior)</option>
                      <option value="quantidade-desc">Quantidade (maior para menor)</option>
                      <option value="quantidade-asc">Quantidade (menor para maior)</option>
                      <option value="alfabetica">Alfabética (A-Z)</option>
                      <option value="alfabetica-desc">Alfabética (Z-A)</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  className={styles.close_filters_button}
                  onClick={() => setFiltroAvancadoAberto(false)}
                >
                  <X size={16} />
                  Fechar Filtros
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.actions}>
            <button className={`${styles.action_button} ${styles.refresh}`} onClick={carregarDadosVendas}>
              <RefreshCw size={16} />
              <span>Atualizar</span>
            </button>
            
            <button className={`${styles.action_button} ${styles.export}`} onClick={gerarPDF}>
              <FileText size={16} />
              <span>Exportar PDF</span>
            </button>
          </div>
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
          
          {/* Seletor de tipo de gráfico */}
          <div className={styles.chart_selector}>
            <div className={styles.selector_header}>
              <h2>Selecione o tipo de relatório</h2>
            </div>
            <div className={styles.chart_buttons}>
              <button 
                className={`${styles.chart_button} ${graficoSelecionado === 'vendas-por-dia' ? styles.selected : ''}`}
                onClick={() => setGraficoSelecionado('vendas-por-dia')}
              >
                <BarChartIcon size={20} />
                <span>Vendas por Dia</span>
              </button>
              
              <button 
                className={`${styles.chart_button} ${graficoSelecionado === 'vendas-por-produto' ? styles.selected : ''}`}
                onClick={() => setGraficoSelecionado('vendas-por-produto')}
              >
                <BarChartIcon size={20} />
                <span>Vendas por Produto</span>
              </button>
              
              <button 
                className={`${styles.chart_button} ${graficoSelecionado === 'vendas-por-categoria' ? styles.selected : ''}`}
                onClick={() => setGraficoSelecionado('vendas-por-categoria')}
              >
                <PieChartIcon size={20} />
                <span>Vendas por Categoria</span>
              </button>
              
              <button 
                className={`${styles.chart_button} ${graficoSelecionado === 'vendas-por-horario' ? styles.selected : ''}`}
                onClick={() => setGraficoSelecionado('vendas-por-horario')}
              >
                <LineChartIcon size={20} />
                <span>Vendas por Horário</span>
              </button>
            </div>
          </div>
          
          {/* Área do gráfico */}
          <div className={styles.chart_area}>
            {renderizarGraficoSelecionado()}
          </div>
          
          {/* Produto mais vendido e estatísticas resumidas em cards */}
          <div className={styles.info_cards}>
            {/* Produto Mais Vendido */}
            <div className={styles.info_card}>
              <div className={styles.card_header}>
                <h2>Produto Mais Vendido</h2>
                <Package size={20} className={styles.card_icon} />
              </div>
              {maisVendidoRes ? (
                <div className={styles.best_seller}>
                  <div className={styles.product_info}>
                    <h3>{maisVendidoRes.item.name}</h3>
                    <p className={styles.product_description}>{maisVendidoRes.item.description}</p>
                  </div>
                  <div className={styles.sales_info}>
                    <div className={styles.info_item}>
                      <span className={styles.info_label}>Categoria</span>
                      <span className={styles.info_value}>{maisVendidoRes.item.category}</span>
                    </div>
                    <div className={styles.info_item}>
                      <span className={styles.info_label}>Quantidade</span>
                      <span className={styles.info_value}>{maisVendidoRes.quantity}</span>
                    </div>
                    <div className={styles.info_item}>
                      <span className={styles.info_label}>Valor Total</span>
                      <span className={styles.info_value}>{formatarMoeda(maisVendidoRes.total_value)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.no_data}>
                  <p>Sem dados para o período selecionado</p>
                </div>
              )}
            </div>
            
            {/* Estatísticas de Vendas */}
            <div className={styles.info_card}>
              <div className={styles.card_header}>
                <h2>Estatísticas Detalhadas</h2>
                <DollarSign size={20} className={styles.card_icon} />
              </div>
              {estatisticasRes ? (
                <div className={styles.detailed_stats}>
                  <div className={styles.stats_section}>
                    <h3>Período Atual</h3>
                    <div className={styles.stats_grid}>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Vendas totais:</span>
                        <span className={styles.stat_highlight}>{formatarMoeda(estatisticasRes.current_period.total_sales)}</span>
                      </div>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Pedidos totais:</span>
                        <span className={styles.stat_highlight}>{estatisticasRes.current_period.total_orders}</span>
                      </div>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Ticket médio:</span>
                        <span className={styles.stat_highlight}>{formatarMoeda(estatisticasRes.current_period.average_ticket)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* <div className={styles.stats_section}>
                    <h3>Crescimento</h3>
                    <div className={styles.stats_grid}>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Vendas:</span>
                        <span className={`${styles.stat_growth} ${estatisticasRes.growth.sales_growth > 0 ? styles.positive : estatisticasRes.growth.sales_growth < 0 ? styles.negative : ''}`}>
                          {estatisticasRes.growth.sales_growth > 0 ? <ArrowUp size={14} /> : estatisticasRes.growth.sales_growth < 0 ? <ArrowDown size={14} /> : null}
                          {Math.abs(estatisticasRes.growth.sales_growth)}%
                        </span>
                      </div>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Pedidos:</span>
                        <span className={`${styles.stat_growth} ${estatisticasRes.growth.orders_growth > 0 ? styles.positive : estatisticasRes.growth.orders_growth < 0 ? styles.negative : ''}`}>
                          {estatisticasRes.growth.orders_growth > 0 ? <ArrowUp size={14} /> : estatisticasRes.growth.orders_growth < 0 ? <ArrowDown size={14} /> : null}
                          {Math.abs(estatisticasRes.growth.orders_growth)}%
                        </span>
                      </div>
                      <div className={styles.stat_item}>
                        <span className={styles.stat_label}>Ticket médio:</span>
                        <span className={`${styles.stat_growth} ${estatisticasRes.growth.ticket_growth > 0 ? styles.positive : estatisticasRes.growth.ticket_growth < 0 ? styles.negative : ''}`}>
                          {estatisticasRes.growth.ticket_growth > 0 ? <ArrowUp size={14} /> : estatisticasRes.growth.ticket_growth < 0 ? <ArrowDown size={14} /> : null}
                          {Math.abs(estatisticasRes.growth.ticket_growth)}%
                        </span>
                      </div>
                    </div>
                  </div> */}
                </div>
              ) : (
                <div className={styles.no_data}>
                  <p>Sem dados para o período selecionado</p>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.footer}>
            <div className={styles.footer_content}>
              <p>Dados atualizados em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              <button 
                className={styles.button} 
                onClick={carregarDadosVendas}
              >
                <RefreshCw size={16} />
                Recarregar Dados
              </button>
            </div>
          </div>
          </>
      )}
    </div>
  );
}