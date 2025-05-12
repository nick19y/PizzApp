import { useState } from "react";
import Header from "../../components/Header";
import { Calendar, Filter, Download, PieChart, BarChart2, LineChart, FileText } from "lucide-react";
import { 
  LineChart as ReLineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import styles from "./Relatorios.module.css";

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("semana");
  const [tipoRelatorio, setTipoRelatorio] = useState("vendas");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const vendasData = [
    { name: "Segunda", vendas: 4200 },
    { name: "Terça", vendas: 3800 },
    { name: "Quarta", vendas: 5100 },
    { name: "Quinta", vendas: 4800 },
    { name: "Sexta", vendas: 6700 },
    { name: "Sábado", vendas: 8200 },
    { name: "Domingo", vendas: 7400 },
  ];

  const produtosData = [
    { name: "Margherita", valor: 3800 },
    { name: "Calabresa", valor: 5200 },
    { name: "Frango", valor: 4100 },
    { name: "Portuguesa", valor: 3500 },
    { name: "Quatro Queijos", valor: 4300 },
  ];

  const horariosData = [
    { name: "18:00", pedidos: 12 },
    { name: "19:00", pedidos: 28 },
    { name: "20:00", pedidos: 45 },
    { name: "21:00", pedidos: 57 },
    { name: "22:00", pedidos: 32 },
    { name: "23:00", pedidos: 18 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleExportarRelatorio = () => {
    alert("Exportando relatório...");
  };

  // Função para renderizar o gráfico baseado no tipo selecionado
  const renderGrafico = () => {
    switch (tipoRelatorio) {
      case "vendas":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={vendasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vendas" stroke="#f97316" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case "produtos":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "horarios":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={horariosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pedidos" stroke="#f97316" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case "categorias":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={produtosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {produtosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Dados para tabela baseado no tipo de relatório
  const getTabelaData = () => {
    switch (tipoRelatorio) {
      case "vendas":
        return vendasData.map((item, index) => (
          <tr key={index} className={index % 2 === 0 ? styles.row_even : styles.row_odd}>
            <td className={styles.table_cell}>{item.name}</td>
            <td className={styles.table_cell}>R$ {item.vendas.toFixed(2)}</td>
            <td className={styles.table_cell}>{Math.floor(item.vendas / 50)}</td>
            <td className={styles.table_cell}>R$ {(item.vendas / Math.floor(item.vendas / 50)).toFixed(2)}</td>
          </tr>
        ));
      case "produtos":
        return produtosData.map((item, index) => (
          <tr key={index} className={index % 2 === 0 ? styles.row_even : styles.row_odd}>
            <td className={styles.table_cell}>{item.name}</td>
            <td className={styles.table_cell}>R$ {item.valor.toFixed(2)}</td>
            <td className={styles.table_cell}>{Math.floor(item.valor / 50)}</td>
            <td className={styles.table_cell}>{((item.valor / 5000) * 100).toFixed(1)}%</td>
          </tr>
        ));
      case "horarios":
        return horariosData.map((item, index) => (
          <tr key={index} className={index % 2 === 0 ? styles.row_even : styles.row_odd}>
            <td className={styles.table_cell}>{item.name}</td>
            <td className={styles.table_cell}>{item.pedidos}</td>
            <td className={styles.table_cell}>R$ {(item.pedidos * 50).toFixed(2)}</td>
            <td className={styles.table_cell}>{((item.pedidos / 192) * 100).toFixed(1)}%</td>
          </tr>
        ));
      case "categorias":
        return produtosData.map((item, index) => (
          <tr key={index} className={index % 2 === 0 ? styles.row_even : styles.row_odd}>
            <td className={styles.table_cell}>{item.name}</td>
            <td className={styles.table_cell}>R$ {item.valor.toFixed(2)}</td>
            <td className={styles.table_cell}>{Math.floor(item.valor / 50)}</td>
            <td className={styles.table_cell}>{((item.valor / 20900) * 100).toFixed(1)}%</td>
          </tr>
        ));
      default:
        return [];
    }
  };

  // Colunas da tabela baseadas no tipo de relatório
  const getColunas = () => {
    switch (tipoRelatorio) {
      case "vendas":
        return ["Dia", "Valor Total", "Pedidos", "Ticket Médio"];
      case "produtos":
        return ["Pizza", "Valor Total", "Quantidade", "% das Vendas"];
      case "horarios":
        return ["Horário", "Pedidos", "Valor Total", "% dos Pedidos"];
      case "categorias":
        return ["Categoria", "Valor Total", "Quantidade", "% das Vendas"];
      default:
        return [];
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content_container}>
          <div className={styles.header_container}>
            <h1 className={styles.title}>Relatórios</h1>
            
            <button 
              onClick={handleExportarRelatorio}
              className={styles.export_button}
            >
              <Download size={16} />
              <span>Exportar Relatório</span>
            </button>
          </div>

          {/* Filtros */}
          <div className={styles.filters_container}>
            <div className={styles.filters_row}>
              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Tipo de Relatório</label>
                <div className={styles.filter_buttons}>
                  <button 
                    className={`${styles.filter_button} ${tipoRelatorio === 'vendas' ? styles.filter_button_active : ''}`}
                    onClick={() => setTipoRelatorio('vendas')}
                  >
                    <LineChart size={16} />
                    <span>Vendas</span>
                  </button>
                  <button 
                    className={`${styles.filter_button} ${tipoRelatorio === 'produtos' ? styles.filter_button_active : ''}`}
                    onClick={() => setTipoRelatorio('produtos')}
                  >
                    <BarChart2 size={16} />
                    <span>Produtos</span>
                  </button>
                  <button 
                    className={`${styles.filter_button} ${tipoRelatorio === 'horarios' ? styles.filter_button_active : ''}`}
                    onClick={() => setTipoRelatorio('horarios')}
                  >
                    <Calendar size={16} />
                    <span>Horários</span>
                  </button>
                  <button 
                    className={`${styles.filter_button} ${tipoRelatorio === 'categorias' ? styles.filter_button_active : ''}`}
                    onClick={() => setTipoRelatorio('categorias')}
                  >
                    <PieChart size={16} />
                    <span>Categorias</span>
                  </button>
                </div>
              </div>

              <div className={styles.filter_group}>
                <label className={styles.filter_label}>Período</label>
                <div className={styles.filter_buttons}>
                  <button 
                    className={`${styles.period_button} ${periodoSelecionado === 'semana' ? styles.period_button_active : ''}`}
                    onClick={() => setPeriodoSelecionado('semana')}
                  >
                    Última Semana
                  </button>
                  <button 
                    className={`${styles.period_button} ${periodoSelecionado === 'mes' ? styles.period_button_active : ''}`}
                    onClick={() => setPeriodoSelecionado('mes')}
                  >
                    Último Mês
                  </button>
                  <button 
                    className={`${styles.period_button} ${periodoSelecionado === 'ano' ? styles.period_button_active : ''}`}
                    onClick={() => setPeriodoSelecionado('ano')}
                  >
                    Último Ano
                  </button>
                  <button 
                    className={`${styles.period_button} ${periodoSelecionado === 'personalizado' ? styles.period_button_active : ''}`}
                    onClick={() => setPeriodoSelecionado('personalizado')}
                  >
                    Personalizado
                  </button>
                </div>
              </div>
            </div>

            {periodoSelecionado === 'personalizado' && (
              <div className={styles.date_filters}>
                <div className={styles.date_filter_group}>
                  <label className={styles.filter_label}>Data Inicial</label>
                  <input 
                    type="date" 
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    className={styles.date_input}
                  />
                </div>
                <div className={styles.date_filter_group}>
                  <label className={styles.filter_label}>Data Final</label>
                  <input 
                    type="date" 
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    className={styles.date_input}
                  />
                </div>
                <div className={styles.filter_button_container}>
                  <button className={styles.filter_apply_button}>
                    Filtrar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cards de resumo */}
          <div className={styles.summary_cards}>
            <div className={styles.summary_card}>
              <div className={styles.summary_card_content}>
                <div>
                  <p className={styles.summary_card_label}>Total de Vendas</p>
                  <p className={styles.summary_card_value}>R$ 40.200,00</p>
                </div>
                <div className={styles.summary_card_icon_green}>
                  <BarChart2 size={24} />
                </div>
              </div>
              <p className={styles.summary_card_trend_positive}>+5% em relação ao período anterior</p>
            </div>
            
            <div className={styles.summary_card}>
              <div className={styles.summary_card_content}>
                <div>
                  <p className={styles.summary_card_label}>Total de Pedidos</p>
                  <p className={styles.summary_card_value}>804</p>
                </div>
                <div className={styles.summary_card_icon_blue}>
                  <FileText size={24} />
                </div>
              </div>
              <p className={styles.summary_card_trend_positive}>+3% em relação ao período anterior</p>
            </div>
            
            <div className={styles.summary_card}>
              <div className={styles.summary_card_content}>
                <div>
                  <p className={styles.summary_card_label}>Ticket Médio</p>
                  <p className={styles.summary_card_value}>R$ 50,00</p>
                </div>
                <div className={styles.summary_card_icon_purple}>
                  <LineChart size={24} />
                </div>
              </div>
              <p className={styles.summary_card_trend_positive}>+2% em relação ao período anterior</p>
            </div>
            
            <div className={styles.summary_card}>
              <div className={styles.summary_card_content}>
                <div>
                  <p className={styles.summary_card_label}>Produto Mais Vendido</p>
                  <p className={styles.summary_card_value}>Calabresa</p>
                </div>
                <div className={styles.summary_card_icon_orange}>
                  <PieChart size={24} />
                </div>
              </div>
              <p className={styles.summary_card_trend_neutral}>104 unidades vendidas</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className={styles.chart_container}>
            <h2 className={styles.section_title}>
              {tipoRelatorio === 'vendas' && 'Vendas por Dia'}
              {tipoRelatorio === 'produtos' && 'Vendas por Produto'}
              {tipoRelatorio === 'horarios' && 'Pedidos por Horário'}
              {tipoRelatorio === 'categorias' && 'Vendas por Categoria'}
            </h2>
            <div className={styles.chart}>
              {renderGrafico()}
            </div>
          </div>

          {/* Tabela de detalhes */}
          <div className={styles.table_container}>
            <div className={styles.table_header}>
              <h2 className={styles.section_title}>Detalhes do Relatório</h2>
              <div className={styles.table_filter}>
                <Filter size={16} />
                <span>Filtrar</span>
              </div>
            </div>
            <div className={styles.table_responsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {getColunas().map((coluna, index) => (
                      <th 
                        key={index}
                        className={styles.table_heading}
                      >
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getTabelaData()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={styles.footer}>
        &copy; 2025 PizzaAdmin - Sistema de Gerenciamento de Pizzaria
      </footer>
    </div>
  );
}