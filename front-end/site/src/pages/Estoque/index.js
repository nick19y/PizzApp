import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, BarChart2, Filter, Download, AlertTriangle } from "lucide-react";
import styles from "./Estoque.module.css";
import Header from "../../components/Header";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    codigo: "",
    nome: "",
    descricao: "",
    categoria: "",
    precoCompra: "",
    precoVenda: "",
    quantidadeEstoque: "",
    estoqueMinimo: "",
    fornecedor: "",
    localizacao: "",
    dataUltimaCompra: "",
    unidadeMedida: "",
    dataValidade: ""
  });

  // Dados de exemplo para pizzaria
  useEffect(() => {
    // Simulando carregamento de dados
    const mockProdutos = [
      {
        id: 1,
        codigo: "ING001",
        nome: "Mussarela",
        descricao: "Queijo mussarela fatiado para coberturas",
        categoria: "Laticínios",
        precoCompra: 32.00,
        precoVenda: 0,
        quantidadeEstoque: 25,
        estoqueMinimo: 10,
        fornecedor: "Laticínios Bom Sabor",
        localizacao: "Refrigerador 1",
        dataUltimaCompra: "2025-03-20",
        unidadeMedida: "kg",
        dataValidade: "2025-04-25",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 2,
        codigo: "ING002",
        nome: "Molho de Tomate",
        descricao: "Molho de tomate preparado para base de pizzas",
        categoria: "Molhos",
        precoCompra: 18.50,
        precoVenda: 0,
        quantidadeEstoque: 35,
        estoqueMinimo: 15,
        fornecedor: "Alimentos Italianos Ltda",
        localizacao: "Despensa 2",
        dataUltimaCompra: "2025-03-25",
        unidadeMedida: "litro",
        dataValidade: "2025-05-15",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 3,
        codigo: "ING003",
        nome: "Farinha de Trigo",
        descricao: "Farinha de trigo especial para massas",
        categoria: "Farináceos",
        precoCompra: 5.90,
        precoVenda: 0,
        quantidadeEstoque: 80,
        estoqueMinimo: 50,
        fornecedor: "Distribuidora de Grãos",
        localizacao: "Prateleira A1",
        dataUltimaCompra: "2025-03-10",
        unidadeMedida: "kg",
        dataValidade: "2025-07-10",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 4,
        codigo: "ING004",
        nome: "Calabresa Fatiada",
        descricao: "Calabresa defumada fatiada para coberturas",
        categoria: "Embutidos",
        precoCompra: 28.90,
        precoVenda: 0,
        quantidadeEstoque: 8,
        estoqueMinimo: 10,
        fornecedor: "Frigorífico Bom Sabor",
        localizacao: "Refrigerador 2",
        dataUltimaCompra: "2025-03-22",
        unidadeMedida: "kg",
        dataValidade: "2025-04-15",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 5,
        codigo: "ING005",
        nome: "Fermento Biológico",
        descricao: "Fermento biológico seco para massas",
        categoria: "Insumos",
        precoCompra: 12.50,
        precoVenda: 0,
        quantidadeEstoque: 15,
        estoqueMinimo: 8,
        fornecedor: "Distribuidora de Insumos",
        localizacao: "Refrigerador 1",
        dataUltimaCompra: "2025-03-15",
        unidadeMedida: "pacote",
        dataValidade: "2025-09-20",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 6,
        codigo: "ING006",
        nome: "Presunto",
        descricao: "Presunto cozido fatiado para coberturas",
        categoria: "Embutidos",
        precoCompra: 29.90,
        precoVenda: 0,
        quantidadeEstoque: 0,
        estoqueMinimo: 5,
        fornecedor: "Frigorífico Bom Sabor",
        localizacao: "Refrigerador 2",
        dataUltimaCompra: "2025-03-01",
        unidadeMedida: "kg",
        dataValidade: "2025-04-05",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 7,
        codigo: "ING007",
        nome: "Orégano",
        descricao: "Orégano desidratado para temperar pizzas",
        categoria: "Temperos",
        precoCompra: 16.50,
        precoVenda: 0,
        quantidadeEstoque: 12,
        estoqueMinimo: 5,
        fornecedor: "Casa das Especiarias",
        localizacao: "Prateleira B3",
        dataUltimaCompra: "2025-03-18",
        unidadeMedida: "pacote",
        dataValidade: "2025-12-10",
        imagem: "/api/placeholder/80/80"
      },
      {
        id: 8,
        codigo: "ING008",
        nome: "Azeitonas Pretas",
        descricao: "Azeitonas pretas sem caroço para coberturas",
        categoria: "Conservas",
        precoCompra: 22.90,
        precoVenda: 0,
        quantidadeEstoque: 18,
        estoqueMinimo: 10,
        fornecedor: "Importadora de Alimentos",
        localizacao: "Despensa 1",
        dataUltimaCompra: "2025-03-12",
        unidadeMedida: "pote",
        dataValidade: "2025-08-15",
        imagem: "/api/placeholder/80/80"
      }
    ];
    
    setProdutos(mockProdutos);
    setFilteredProdutos(mockProdutos);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterProdutos(value, categoriaFilter);
  };

  const handleCategoriaFilter = (e) => {
    const categoria = e.target.value;
    setCategoriaFilter(categoria);
    filterProdutos(searchTerm, categoria);
  };

  const filterProdutos = (search, categoria) => {
    let filtered = [...produtos];
    
    // Filtrar por termo de busca
    if (search.trim() !== "") {
      filtered = filtered.filter(produto => 
        produto.codigo.toLowerCase().includes(search.toLowerCase()) ||
        produto.nome.toLowerCase().includes(search.toLowerCase()) ||
        produto.fornecedor.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtrar por categoria
    if (categoria !== "todas") {
      filtered = filtered.filter(produto => 
        produto.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
    
    setFilteredProdutos(filtered);
  };

  const openModal = (produto = null) => {
    if (produto) {
      setFormData({
        ...produto
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
    
    if (formData.id) {
      // Atualizar produto existente
      const updatedProdutos = produtos.map(produto => 
        produto.id === formData.id ? { ...formData } : produto
      );
      setProdutos(updatedProdutos);
      setFilteredProdutos(updatedProdutos);
    } else {
      // Adicionar novo produto
      const newProduto = {
        ...formData,
        id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
        precoCompra: parseFloat(formData.precoCompra) || 0,
        precoVenda: 0, // preço de venda não relevante para ingredientes
        quantidadeEstoque: parseFloat(formData.quantidadeEstoque) || 0,
        estoqueMinimo: parseFloat(formData.estoqueMinimo) || 0,
        imagem: "/api/placeholder/80/80"
      };
      
      const updatedProdutos = [...produtos, newProduto];
      setProdutos(updatedProdutos);
      setFilteredProdutos(updatedProdutos);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este ingrediente?")) {
      const updatedProdutos = produtos.filter(produto => produto.id !== id);
      setProdutos(updatedProdutos);
      setFilteredProdutos(updatedProdutos);
    }
  };

  const generateProductCode = () => {
    // Gera um código de ingrediente aleatório com formato ING + 3 dígitos
    const lastId = produtos.length > 0 ? 
      Math.max(...produtos.map(p => parseInt(p.codigo.replace('ING', '')))) : 0;
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
    const categorias = [...new Set(produtos.map(produto => produto.categoria))];
    return categorias;
  };

  const getUnidadesMedida = () => {
    return ["kg", "g", "litro", "ml", "unidade", "pacote", "pote", "caixa"];
  };

  const getTotalProdutos = () => {
    return filteredProdutos.length;
  };

  const getValorTotalEstoque = () => {
    return filteredProdutos.reduce((total, produto) => 
      total + (produto.precoCompra * produto.quantidadeEstoque), 0);
  };

  const getProdutosBaixoEstoque = () => {
    return filteredProdutos.filter(produto => 
      produto.quantidadeEstoque > 0 && produto.quantidadeEstoque < produto.estoqueMinimo).length;
  };

  const getProdutosEsgotados = () => {
    return filteredProdutos.filter(produto => produto.quantidadeEstoque <= 0).length;
  };

  const getProdutosVencendo = () => {
    const hoje = new Date();
    const umaSemanaDepois = new Date();
    umaSemanaDepois.setDate(hoje.getDate() + 7);
    
    return filteredProdutos.filter(produto => {
      const dataValidade = new Date(produto.dataValidade);
      return dataValidade <= umaSemanaDepois && dataValidade >= hoje;
    }).length;
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
    // Simulação de exportação
    alert("Exportação de ingredientes iniciada. O arquivo será baixado em breve.");
  };

  // Função para ajustar estoque (poderia ser implementada mais tarde)
  const ajustarEstoque = (produto) => {
    // Implementação futura
    alert(`Função para ajustar estoque do ingrediente ${produto.nome}`);
  };

  return (
    <div className={styles.page_container}>
      <Header/>
      
      <main className={styles.main_content}>
        <div className={styles.page_header}>
          <h1 className={styles.page_title}>Estoque da Pizzaria</h1>
          <button 
            className={styles.add_button}
            onClick={() => openModal()}
          >
            <Plus size={16} />
            Novo Ingrediente
          </button>
        </div>

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
            <p className={styles.stat_value}>{getTotalProdutos()}</p>
          </div>
          <div className={styles.stat_card}>
            <h3>Valor em Estoque</h3>
            <p className={styles.stat_value}>
              R$ {getValorTotalEstoque().toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className={styles.stat_card}>
            <h3>Baixo Estoque</h3>
            <p className={`${styles.stat_value} ${styles.warning_text}`}>
              {getProdutosBaixoEstoque()}
            </p>
          </div>
          <div className={styles.stat_card}>
            <h3>Vencendo em 7 dias</h3>
            <p className={`${styles.stat_value} ${styles.warning_text}`}>
              {getProdutosVencendo()}
            </p>
          </div>
          <div className={styles.stat_card}>
            <h3>Esgotados</h3>
            <p className={`${styles.stat_value} ${styles.danger_text}`}>
              {getProdutosEsgotados()}
            </p>
          </div>
        </div>

        <div className={styles.table_container}>
          <table className={styles.produtos_table}>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Código</th>
                <th>Categoria</th>
                <th>Preço (R$)</th>
                <th>Estoque</th>
                <th>Validade</th>
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
                        <div className={styles.produto_info}>
                          <img 
                            src={produto.imagem} 
                            alt={produto.nome} 
                            className={styles.produto_imagem}
                          />
                          <div>
                            <span className={styles.produto_nome}>{produto.nome}</span>
                            <span className={styles.produto_descricao}>
                              {produto.descricao.length > 60 
                                ? produto.descricao.substring(0, 60) + '...' 
                                : produto.descricao}
                            </span>
                          </div>
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
        </div>
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
              <div className={styles.detalhes_header}>
                <div className={styles.produto_imagem_grande}>
                  <img src={selectedProduto.imagem} alt={selectedProduto.nome} />
                </div>
                <div className={styles.produto_info_detalhes}>
                  <h3>{selectedProduto.nome}</h3>
                  <p className={styles.codigo_produto}>Código: {selectedProduto.codigo}</p>
                  <p className={styles.categoria_produto}>Categoria: {selectedProduto.categoria}</p>
                  <div className={styles.estoque_status_container}>
                    <span className={styles.estoque_label}>Status do Estoque:</span>
                    <span className={`${styles.estoque_badge} ${getEstoqueStatusClass(
                      getEstoqueStatus(selectedProduto.quantidadeEstoque, selectedProduto.estoqueMinimo)
                    )}`}>
                      {selectedProduto.quantidadeEstoque} {selectedProduto.unidadeMedida}
                      {getEstoqueStatus(selectedProduto.quantidadeEstoque, selectedProduto.estoqueMinimo) === "baixo" && (
                        <AlertTriangle size={14} className={styles.estoque_icon} />
                      )}
                    </span>
                  </div>
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
                    <div className={styles.detail_value}>{selectedProduto.estoqueMinimo} {selectedProduto.unidadeMedida}</div>
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
                      {new Date(selectedProduto.dataUltimaCompra).toLocaleDateString('pt-BR')}
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
                <p className={styles.descricao_texto}>{selectedProduto.descricao}</p>
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
                  <button 
                    className={styles.adjust_stock_button}
                    onClick={() => ajustarEstoque(selectedProduto)}
                    style={{ marginLeft: '0.75rem' }}
                  >
                    <BarChart2 size={16} />
                    Ajustar Estoque
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
                  