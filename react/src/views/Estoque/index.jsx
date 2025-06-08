import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, BarChart2, Filter, Download, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import styles from "./Estoque.module.css";
import axiosClient from "../../axios-client";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState({
    total_ingredientes: 0,
    valor_total_estoque: 0,
    baixo_estoque: 0,
    esgotados: 0,
    vencendo: 0
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    codigo: "",
    nome: "",
    descricao: "",
    categoria: "",
    preco_compra: "",
    preco_venda: 0,
    quantidade_estoque: "",
    estoque_minimo: "",
    fornecedor: "",
    localizacao: "",
    data_ultima_compra: "",
    unidade_medida: "",
    data_validade: ""
  });
  // Estados para ordenação
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState('asc');

  // Carregamento inicial dos dados
  useEffect(() => {
    getIngredients();
    getCategories();
    getStats();
  }, []);

  // Função para carregar os ingredientes
  const getIngredients = () => {
  setLoading(true);
  axiosClient.get('/ingredients', {
    params: {
      search: searchTerm,
      categoria: categoriaFilter !== 'todas' ? categoriaFilter : null
    }
  })
    .then(response => {
      // Verificar se os dados estão em response.data ou em response.data.data
      const responseData = response.data.data || response.data;
      
      // Garantir que responseData é um array
      const dataArray = Array.isArray(responseData) ? responseData : [];
      
      // Normalizar os nomes dos campos para o formato do front-end
      const normalizedData = dataArray.map(item => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        descricao: item.descricao || '',
        categoria: item.categoria,
        precoCompra: parseFloat(item.preco_compra || 0),
        precoVenda: parseFloat(item.preco_venda || 0),
        quantidadeEstoque: parseFloat(item.quantidade_estoque || 0),
        estoqueMinimo: parseFloat(item.estoque_minimo || 0),
        fornecedor: item.fornecedor || '',
        localizacao: item.localizacao || '',
        dataUltimaCompra: item.data_ultima_compra || '',
        unidadeMedida: item.unidade_medida || '',
        dataValidade: item.data_validade || '',
      }));
      
      // Ordenar os dados
      const sortedData = sortData(normalizedData, sortField, sortDirection);
      
      setProdutos(normalizedData);
      setFilteredProdutos(sortedData);
    })
    .catch(error => {
      console.error('Erro ao carregar ingredientes:', error);
      // Mostrar algo para o usuário
      alert('Erro ao carregar ingredientes. Verifique o console para mais detalhes.');
    })
    .finally(() => {
      setLoading(false);
      setIsInitialLoading(false); // Adicionar esta linha
    });
};
useEffect(() => {
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([
        getIngredients(),
        getCategories(),
        getStats()
      ]);
    } finally {
      setIsInitialLoading(false);
    }
  };
  
  loadInitialData();
}, []);

  // Função para ordenar os dados
  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Tratamento especial para datas
      if (field === 'dataValidade' || field === 'dataUltimaCompra') {
        valueA = new Date(valueA || '2000-01-01').getTime();
        valueB = new Date(valueB || '2000-01-01').getTime();
      }
      
      // Para números, garantir comparação numérica
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Para strings, comparação padrão
      if (direction === 'asc') {
        return String(valueA).localeCompare(String(valueB));
      } else {
        return String(valueB).localeCompare(String(valueA));
      }
    });
  };

  // Função para alternar ordenação
  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    
    // Aplicar ordenação aos dados filtrados
    const sortedData = sortData(filteredProdutos, field, direction);
    setFilteredProdutos(sortedData);
  };

  // Função para exibir indicador de ordenação
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className={styles.sort_icon} /> 
      : <ChevronDown size={14} className={styles.sort_icon} />;
  };

  // Função para carregar as categorias
  const getCategories = () => {
    axiosClient.get('/ingredient-categories')
      .then(response => {
        setCategorias(response.data);
      })
      .catch(error => {
        console.error('Erro ao carregar categorias:', error);
      });
  };

  // Função para carregar estatísticas
  const getStats = () => {
    axiosClient.get('/ingredient-stats')
      .then(response => {
        // Garantir que os valores são números
        const data = response.data;
        setStats({
          total_ingredientes: parseInt(data.total_ingredientes || 0),
          valor_total_estoque: parseFloat(data.valor_total_estoque || 0),
          baixo_estoque: parseInt(data.baixo_estoque || 0),
          esgotados: parseInt(data.esgotados || 0),
          vencendo: parseInt(data.vencendo || 0)
        });
      })
      .catch(error => {
        console.error('Erro ao carregar estatísticas:', error);
      });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Atualizar os filtros na API
    axiosClient.get('/ingredients', {
      params: {
        search: value,
        categoria: categoriaFilter !== 'todas' ? categoriaFilter : null
      }
    })
      .then(response => {
        const responseData = response.data.data || response.data;
        const dataArray = Array.isArray(responseData) ? responseData : [];
        const normalizedData = dataArray.map(item => ({
          id: item.id,
          codigo: item.codigo,
          nome: item.nome,
          descricao: item.descricao || '',
          categoria: item.categoria,
          precoCompra: parseFloat(item.preco_compra),
          precoVenda: parseFloat(item.preco_venda || 0),
          quantidadeEstoque: parseFloat(item.quantidade_estoque),
          estoqueMinimo: parseFloat(item.estoque_minimo),
          fornecedor: item.fornecedor,
          localizacao: item.localizacao || '',
          dataUltimaCompra: item.data_ultima_compra,
          unidadeMedida: item.unidade_medida,
          dataValidade: item.data_validade,
        }));
        
        // Ordenar conforme atual campo e direção
        const sortedData = sortData(normalizedData, sortField, sortDirection);
        setFilteredProdutos(sortedData);
        
        // Atualizar estatísticas quando filtros mudam
        getStats();
      })
      .catch(error => {
        console.error('Erro ao filtrar ingredientes:', error);
      });
  };

  const handleCategoriaFilter = (e) => {
    const categoria = e.target.value;
    setCategoriaFilter(categoria);
    
    // Atualizar os filtros na API
    axiosClient.get('/ingredients', {
      params: {
        search: searchTerm,
        categoria: categoria !== 'todas' ? categoria : null
      }
    })
      .then(response => {
        const responseData = response.data.data || response.data;
        const dataArray = Array.isArray(responseData) ? responseData : [];      
        const normalizedData = dataArray.map(item => ({
          id: item.id,
          codigo: item.codigo,
          nome: item.nome,
          descricao: item.descricao || '',
          categoria: item.categoria,
          precoCompra: parseFloat(item.preco_compra),
          precoVenda: parseFloat(item.preco_venda || 0),
          quantidadeEstoque: parseFloat(item.quantidade_estoque),
          estoqueMinimo: parseFloat(item.estoque_minimo),
          fornecedor: item.fornecedor,
          localizacao: item.localizacao || '',
          dataUltimaCompra: item.data_ultima_compra,
          unidadeMedida: item.unidade_medida,
          dataValidade: item.data_validade,
        }));
        
        // Ordenar conforme atual campo e direção
        const sortedData = sortData(normalizedData, sortField, sortDirection);
        setFilteredProdutos(sortedData);
        
        // Atualizar estatísticas quando filtros mudam
        getStats();
      })
      .catch(error => {
        console.error('Erro ao filtrar ingredientes:', error);
      });
  };

  const openModal = (produto = null) => {
    if (produto) {
      setFormData({
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoria: produto.categoria,
        precoCompra: produto.precoCompra,
        precoVenda: produto.precoVenda || 0,
        quantidadeEstoque: produto.quantidadeEstoque,
        estoqueMinimo: produto.estoqueMinimo,
        fornecedor: produto.fornecedor,
        localizacao: produto.localizacao || '',
        dataUltimaCompra: produto.dataUltimaCompra,
        unidadeMedida: produto.unidadeMedida,
        dataValidade: produto.dataValidade
      });
    } else {
      const hoje = new Date().toISOString().split('T')[0];
      const umMesDepois = new Date();
      umMesDepois.setMonth(umMesDepois.getMonth() + 1);
      
      setFormData({
        id: null,
        codigo: generateProductCode(),
        nome: "",
        descricao: "",
        categoria: "",
        precoCompra: "",
        precoVenda: 0,
        quantidadeEstoque: "",
        estoqueMinimo: "",
        fornecedor: "",
        localizacao: "",
        dataUltimaCompra: hoje,
        unidadeMedida: "kg",
        dataValidade: umMesDepois.toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDetalhesModal = (produto) => {
    setSelectedProduto(produto);
    setIsDetalhesModalOpen(true);
  };

  const closeDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedProduto(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter formato de dados para o formato da API
    const apiData = {
      codigo: formData.codigo,
      nome: formData.nome,
      descricao: formData.descricao,
      categoria: formData.categoria,
      preco_compra: parseFloat(formData.precoCompra),
      preco_venda: parseFloat(formData.precoVenda) || 0,
      quantidade_estoque: parseFloat(formData.quantidadeEstoque),
      estoque_minimo: parseFloat(formData.estoqueMinimo),
      fornecedor: formData.fornecedor,
      localizacao: formData.localizacao,
      data_ultima_compra: formData.dataUltimaCompra,
      unidade_medida: formData.unidadeMedida,
      data_validade: formData.dataValidade
    };
    
    if (formData.id) {
      // Atualizar ingrediente existente
      axiosClient.put(`/ingredients/${formData.id}`, apiData)
        .then(() => {
          // Após sucesso, recarregar os dados
          getIngredients();
          getStats();
          closeModal();
        })
        .catch(error => {
          console.error('Erro ao atualizar ingrediente:', error);
          // Aqui você pode adicionar um tratamento de erro visual
        });
    } else {
      // Adicionar novo ingrediente
      axiosClient.post('/ingredients', apiData)
        .then(() => {
          // Após sucesso, recarregar os dados
          getIngredients();
          getStats();
          closeModal();
        })
        .catch(error => {
          console.error('Erro ao adicionar ingrediente:', error);
          // Aqui você pode adicionar um tratamento de erro visual
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este ingrediente?")) {
      axiosClient.delete(`/ingredients/${id}`)
        .then(() => {
          // Após sucesso, recarregar os dados
          getIngredients();
          getStats();
        })
        .catch(error => {
          console.error('Erro ao excluir ingrediente:', error);
        });
    }
  };

  const generateProductCode = () => {
    // Gera um código de ingrediente aleatório com formato ING + 3 dígitos
    const lastId = produtos.length > 0 ? 
      Math.max(...produtos.map(p => parseInt(p.codigo.replace('ING', '') || '0'))) : 0;
    const newCode = `ING${String(lastId + 1).padStart(3, '0')}`;
    return newCode;
  };

  const getEstoqueStatus = (quantidade, minimo) => {
    if (quantidade <= 0) {
      return "esgotado";
    } else if (quantidade < minimo) {
      return "baixo";
    } else {
      return "normal";
    }
  };

  const getEstoqueStatusClass = (status) => {
    switch (status) {
      case 'normal':
        return styles.estoque_normal;
      case 'baixo':
        return styles.estoque_baixo;
      case 'esgotado':
        return styles.estoque_esgotado;
      default:
        return '';
    }
  };

  const getCategoriasUnicas = () => {
    return categorias;
  };

  const getUnidadesMedida = () => {
    return ["kg", "g", "litro", "ml", "unidade", "pacote", "pote", "caixa"];
  };

  const verificarValidade = (dataValidade) => {
    const hoje = new Date();
    const data = new Date(dataValidade);
    const umaSemana = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos
    
    if (data < hoje) {
      return "vencido";
    } else if (data - hoje < umaSemana) {
      return "proximo";
    } else {
      return "normal";
    }
  };

  const getValidadeStatusClass = (status) => {
    switch (status) {
      case 'normal':
        return '';
      case 'proximo':
        return styles.validade_proxima;
      case 'vencido':
        return styles.validade_vencida;
      default:
        return '';
    }
  };

  const exportarEstoque = () => {
    // Implementação de exportação - em uma versão real, poderia chamar uma API de exportação
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Código,Nome,Categoria,Preço de Compra,Estoque,Estoque Mínimo,Validade\n" + 
      filteredProdutos.map(p => 
        `${p.codigo},"${p.nome}","${p.categoria}",${p.precoCompra},${p.quantidadeEstoque},${p.estoqueMinimo},${p.dataValidade}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para ajustar estoque (poderia ser implementada mais tarde)
  const ajustarEstoque = (produto) => {
    // Implementação futura - poderia chamar uma API específica
    alert(`Função para ajustar estoque do ingrediente ${produto.nome}`);
  };

  return (
    <div className={styles.page_container}>
      <main className={styles.main_content}>
      <div className={styles.page_header}>
        <h1 className={styles.page_title}>Estoque da Pizzaria</h1>
        <button 
          className={styles.add_button}
          onClick={() => openModal()}
          disabled={isInitialLoading}
        >
          <Plus size={16} />
          Novo Ingrediente
        </button>
      </div>

      {isInitialLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando dados do estoque...</p>
        </div>
      ) : (
        <>
          <div className={styles.filters_row}>
            <div className={styles.search_container}>
              <div className={styles.search_box}>
                <Search size={20} className={styles.search_icon} />
                <input 
                  type="text" 
                  placeholder="Buscar ingredientes por código, nome..."
                  className={styles.search_input}
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className={styles.filter_container}>
              <div className={styles.filter_box}>
                <Filter size={20} className={styles.filter_icon} />
                <select 
                  className={styles.filter_select}
                  value={categoriaFilter}
                  onChange={handleCategoriaFilter}
                >
                  <option value="todas">Todas as categorias</option>
                  {getCategoriasUnicas().map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className={styles.export_button} onClick={exportarEstoque}>
              <Download size={16} />
              Exportar
            </button>
          </div>

          <div className={styles.stats_cards}>
            <div className={styles.stat_card}>
              <h3>Total de Ingredientes</h3>
              <p className={styles.stat_value}>{stats.total_ingredientes || 0}</p>
            </div>
            <div className={styles.stat_card}>
              <h3>Valor em Estoque</h3>
              <p className={styles.stat_value}>
                R$ {parseFloat(stats.valor_total_estoque || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className={styles.stat_card}>
              <h3>Baixo Estoque</h3>
              <p className={`${styles.stat_value} ${styles.warning_text}`}>
                {stats.baixo_estoque || 0}
              </p>
            </div>
            <div className={styles.stat_card}>
              <h3>Vencendo em 7 dias</h3>
              <p className={`${styles.stat_value} ${styles.warning_text}`}>
                {stats.vencendo || 0}
              </p>
            </div>
            <div className={styles.stat_card}>
              <h3>Esgotados</h3>
              <p className={`${styles.stat_value} ${styles.danger_text}`}>
                {stats.esgotados || 0}
              </p>
            </div>
          </div>

          <div className={styles.table_container}>
            {loading ? (
              <div className={styles.table_loading}>
                <div className={styles.spinner}></div>
                <p>Atualizando dados...</p>
              </div>
            ) : (
              <table className={styles.produtos_table}>
                {/* Resto da tabela permanece igual */}
                <thead>
                  <tr>
                    <th className={styles.sortable} onClick={() => handleSort('nome')}>
                      <div className={styles.th_content}>
                        Nome {renderSortIndicator('nome')}
                      </div>
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('codigo')}>
                      <div className={styles.th_content}>
                        Código {renderSortIndicator('codigo')}
                      </div>
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('categoria')}>
                      <div className={styles.th_content}>
                        Categoria {renderSortIndicator('categoria')}
                      </div>
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('precoCompra')}>
                      <div className={styles.th_content}>
                        Preço (R$) {renderSortIndicator('precoCompra')}
                      </div>
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('quantidadeEstoque')}>
                      <div className={styles.th_content}>
                        Estoque {renderSortIndicator('quantidadeEstoque')}
                      </div>
                    </th>
                    <th className={styles.sortable} onClick={() => handleSort('dataValidade')}>
                      <div className={styles.th_content}>
                        Validade {renderSortIndicator('dataValidade')}
                      </div>
                    </th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProdutos.length > 0 ? (
                    filteredProdutos.map(produto => {
                      const estoqueStatus = getEstoqueStatus(produto.quantidadeEstoque, produto.estoqueMinimo);
                      const validadeStatus = verificarValidade(produto.dataValidade);
                      
                      return (
                        <tr key={produto.id}>
                          <td>
                            <div className={styles.produto_info_redesigned}>
                              <span className={styles.produto_nome}>{produto.nome}</span>
                              <span className={styles.produto_descricao}>
                                {produto.descricao && produto.descricao.length > 40 
                                  ? produto.descricao.substring(0, 40) + '...' 
                                  : produto.descricao}
                              </span>
                            </div>
                          </td>
                          <td>{produto.codigo}</td>
                          <td>{produto.categoria}</td>
                          <td>R$ {produto.precoCompra.toFixed(2).replace('.', ',')}</td>
                          <td>
                            <div className={styles.estoque_info}>
                              <span className={`${styles.estoque_badge} ${getEstoqueStatusClass(estoqueStatus)}`}>
                                {produto.quantidadeEstoque} {produto.unidadeMedida}
                                {estoqueStatus === "baixo" && (
                                  <AlertTriangle size={14} className={styles.estoque_icon} />
                                )}
                              </span>
                              <span className={styles.estoque_minimo}>
                                Min: {produto.estoqueMinimo}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`${getValidadeStatusClass(validadeStatus)}`}>
                              {new Date(produto.dataValidade).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td>
                            <div className={styles.action_buttons}>
                              <button 
                                className={`${styles.action_button} ${styles.view}`}
                                title="Visualizar Detalhes"
                                onClick={() => openDetalhesModal(produto)}
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className={`${styles.action_button} ${styles.edit}`}
                                onClick={() => openModal(produto)}
                                title="Editar Ingrediente"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className={`${styles.action_button} ${styles.delete}`}
                                onClick={() => handleDelete(produto.id)}
                                title="Excluir Ingrediente"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.no_results}>
                        Nenhum ingrediente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </main>

      {/* Modal de Cadastro/Edição de Ingrediente */}
      {isModalOpen && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <div className={styles.modal_header}>
              <h2>{formData.id ? "Editar Ingrediente" : "Novo Ingrediente"}</h2>
              <button className={styles.close_button} onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.form_grid}>
                <div className={styles.form_group}>
                  <label htmlFor="codigo">Código</label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    readOnly={formData.id !== null}
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="categoria">Categoria</label>
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    list="categorias"
                  />
                  <datalist id="categorias">
                    {getCategoriasUnicas().map(categoria => (
                      <option key={categoria} value={categoria} />
                    ))}
                  </datalist>
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="nome">Nome do Ingrediente</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="precoCompra">Preço de Compra (R$)</label>
                  <input
                    type="number"
                    id="precoCompra"
                    name="precoCompra"
                    value={formData.precoCompra}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="unidadeMedida">Unidade de Medida</label>
                  <select
                    id="unidadeMedida"
                    name="unidadeMedida"
                    value={formData.unidadeMedida}
                    onChange={handleInputChange}
                    required
                  >
                    {getUnidadesMedida().map(unidade => (
                      <option key={unidade} value={unidade}>{unidade}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="quantidadeEstoque">Quantidade em Estoque</label>
                  <input
                    type="number"
                    id="quantidadeEstoque"
                    name="quantidadeEstoque"
                    value={formData.quantidadeEstoque}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="estoqueMinimo">Estoque Mínimo</label>
                  <input
                    type="number"
                    id="estoqueMinimo"
                    name="estoqueMinimo"
                    value={formData.estoqueMinimo}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="fornecedor">Fornecedor</label>
                  <input
                    type="text"
                    id="fornecedor"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="localizacao">Localização no Estoque</label>
                  <input
                    type="text"
                    id="localizacao"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="dataUltimaCompra">Data da Última Compra</label>
                  <input
                    type="date"
                    id="dataUltimaCompra"
                    name="dataUltimaCompra"
                    value={formData.dataUltimaCompra}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="dataValidade">Data de Validade</label>
                  <input
                    type="date"
                    id="dataValidade"
                    name="dataValidade"
                    value={formData.dataValidade}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.form_actions}>
                <button type="button" className={styles.cancel_button} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.save_button}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Ingrediente */}
      {isDetalhesModalOpen && selectedProduto && (
        <div className={styles.modal_overlay}>
          <div className={`${styles.modal} ${styles.detalhes_modal}`}>
            <div className={styles.modal_header}>
              <h2>Detalhes do Ingrediente</h2>
              <button className={styles.close_button} onClick={closeDetalhesModal}>×</button>
            </div>
            
            <div className={styles.detalhes_container}>
              <div className={styles.detalhes_header_redesigned}>
                <div className={styles.ingrediente_detalhes_title}>
                  <h3>{selectedProduto.nome}</h3>
                  <div className={styles.codigo_categoria_container}>
                    <p className={styles.codigo_produto}>Código: {selectedProduto.codigo}</p>
                    <p className={styles.categoria_produto}>Categoria: {selectedProduto.categoria}</p>
                  </div>
                </div>
                <div className={styles.estoque_status_container}>
                  <span className={styles.estoque_label}>Status do Estoque:</span>
                  <span className={`${styles.estoque_badge_large} ${getEstoqueStatusClass(
                    getEstoqueStatus(selectedProduto.quantidadeEstoque, selectedProduto.estoqueMinimo)
                  )}`}>
                    {selectedProduto.quantidadeEstoque} {selectedProduto.unidadeMedida}
                    {getEstoqueStatus(selectedProduto.quantidadeEstoque, selectedProduto.estoqueMinimo) === "baixo" && (
                      <AlertTriangle size={14} className={styles.estoque_icon} />
                    )}
                  </span>
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Informações Gerais</h3>
                <div className={styles.detalhes_grid}>
                  <div>
                    <div className={styles.detail_label}>Preço de Compra</div>
                    <div className={styles.detail_value}>R$ {selectedProduto.precoCompra.toFixed(2).replace('.', ',')}</div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Quantidade em Estoque</div>
                    <div className={styles.detail_value}>{selectedProduto.quantidadeEstoque} {selectedProduto.unidadeMedida}</div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Estoque Mínimo</div>
                    <div className={styles.detail_value}>{
                      selectedProduto.estoqueMinimo} {selectedProduto.unidadeMedida}</div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Fornecedor</div>
                    <div className={styles.detail_value}>{selectedProduto.fornecedor}</div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Localização no Estoque</div>
                    <div className={styles.detail_value}>{selectedProduto.localizacao}</div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Última Compra</div>
                    <div className={styles.detail_value}>
                      {selectedProduto.dataUltimaCompra ? new Date(selectedProduto.dataUltimaCompra).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className={styles.detail_label}>Validade</div>
                    <div className={`${styles.detail_value} ${getValidadeStatusClass(
                      verificarValidade(selectedProduto.dataValidade)
                    )}`}>
                      {new Date(selectedProduto.dataValidade).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Descrição do Produto</h3>
                <p className={styles.descricao_texto}>{selectedProduto.descricao || 'Sem descrição disponível.'}</p>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Movimentações Recentes</h3>
                <p className={styles.descricao_texto}>
                  Informações sobre movimentações de estoque serão exibidas aqui quando implementadas.
                </p>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Ações</h3>
                <div className={styles.detalhes_actions}>
                  <button 
                    className={styles.adjust_stock_button}
                    onClick={() => {
                      closeDetalhesModal();
                      openModal(selectedProduto);
                    }}
                  >
                    <Edit size={16} />
                    Editar Ingrediente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}