import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, FileText, Package, Filter, Download, Truck } from "lucide-react";
import styles from "./Pedidos.module.css";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    clienteId: "",
    data: "",
    valor: "",
    status: "Pendente",
    itens: [],
    observacoes: ""
  });

  // Dados de exemplo
  useEffect(() => {
    // Simulando carregamento de dados
    const mockPedidos = [
      {
        id: 101,
        clienteId: 1,
        clienteNome: "João Silva",
        clienteEmail: "joao.silva@email.com",
        clienteTelefone: "(11) 99999-8888",
        data: "2025-03-10",
        valor: 250.50,
        status: "Entregue",
        itens: [
          { id: 1, nome: "Produto A", quantidade: 2, preco: 75.25, total: 150.50 },
          { id: 2, nome: "Produto B", quantidade: 1, preco: 100.00, total: 100.00 }
        ],
        observacoes: "Entregar no período da tarde.",
        endereco: "Av. Paulista, 1000 - São Paulo, SP"
      },
      {
        id: 102,
        clienteId: 2,
        clienteNome: "Maria Oliveira",
        clienteEmail: "maria.oliveira@email.com",
        clienteTelefone: "(21) 98888-7777",
        data: "2025-03-25",
        valor: 175.00,
        status: "Enviado",
        itens: [
          { id: 3, nome: "Produto C", quantidade: 1, preco: 175.00, total: 175.00 }
        ],
        observacoes: "",
        endereco: "Rua Copacabana, 500 - Rio de Janeiro, RJ"
      },
      {
        id: 103,
        clienteId: 1,
        clienteNome: "João Silva",
        clienteEmail: "joao.silva@email.com",
        clienteTelefone: "(11) 99999-8888",
        data: "2025-04-05",
        valor: 120.75,
        status: "Processando",
        itens: [
          { id: 4, nome: "Produto D", quantidade: 3, preco: 40.25, total: 120.75 }
        ],
        observacoes: "Cliente solicitou embalagem para presente.",
        endereco: "Av. Paulista, 1000 - São Paulo, SP"
      },
      {
        id: 104,
        clienteId: 3,
        clienteNome: "Pedro Santos",
        clienteEmail: "pedro.santos@email.com",
        clienteTelefone: "(31) 97777-6666",
        data: "2025-04-10",
        valor: 350.00,
        status: "Pendente",
        itens: [
          { id: 5, nome: "Produto E", quantidade: 1, preco: 250.00, total: 250.00 },
          { id: 6, nome: "Produto F", quantidade: 2, preco: 50.00, total: 100.00 }
        ],
        observacoes: "Ligar antes de entregar.",
        endereco: "Av. Amazonas, 100 - Belo Horizonte, MG"
      },
      {
        id: 105,
        clienteId: 4,
        clienteNome: "Ana Rodrigues",
        clienteEmail: "ana.rodrigues@email.com",
        clienteTelefone: "(41) 96666-5555",
        data: "2025-04-12",
        valor: 89.90,
        status: "Cancelado",
        itens: [
          { id: 7, nome: "Produto G", quantidade: 1, preco: 89.90, total: 89.90 }
        ],
        observacoes: "Cliente cancelou o pedido após a confirmação.",
        endereco: "Rua das Flores, 200 - Curitiba, PR"
      }
    ];
    
    setPedidos(mockPedidos);
    setFilteredPedidos(mockPedidos);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterPedidos(value, statusFilter);
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    filterPedidos(searchTerm, status);
  };

  const filterPedidos = (search, status) => {
    let filtered = [...pedidos];
    
    // Filtrar por termo de busca
    if (search.trim() !== "") {
      filtered = filtered.filter(pedido => 
        pedido.id.toString().includes(search) ||
        pedido.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
        pedido.clienteEmail.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (status !== "todos") {
      filtered = filtered.filter(pedido => 
        pedido.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    setFilteredPedidos(filtered);
  };

  const openModal = (pedido = null) => {
    if (pedido) {
      setFormData({
        id: pedido.id,
        clienteId: pedido.clienteId,
        clienteNome: pedido.clienteNome,
        data: pedido.data,
        valor: pedido.valor,
        status: pedido.status,
        itens: [...pedido.itens],
        observacoes: pedido.observacoes,
        endereco: pedido.endereco
      });
    } else {
      const hoje = new Date().toISOString().split('T')[0];
      setFormData({
        id: null,
        clienteId: "",
        clienteNome: "",
        data: hoje,
        valor: "",
        status: "Pendente",
        itens: [],
        observacoes: "",
        endereco: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDetalhesModal = (pedido) => {
    setSelectedPedido(pedido);
    setIsDetalhesModalOpen(true);
  };

  const closeDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedPedido(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      status: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.id) {
      // Atualizar pedido existente
      const updatedPedidos = pedidos.map(pedido => 
        pedido.id === formData.id ? { ...formData } : pedido
      );
      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
    } else {
      // Adicionar novo pedido
      const newPedido = {
        ...formData,
        id: pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1,
        valor: parseFloat(formData.valor) || 0
      };
      
      const updatedPedidos = [...pedidos, newPedido];
      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      const updatedPedidos = pedidos.filter(pedido => pedido.id !== id);
      setPedidos(updatedPedidos);
      setFilteredPedidos(updatedPedidos);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
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

  const getTotalPedidos = () => {
    return filteredPedidos.length;
  };

  const getTotalValor = () => {
    return filteredPedidos.reduce((total, pedido) => total + pedido.valor, 0);
  };

  const exportarPedidos = () => {
    // Simulação de exportação
    alert("Exportação de pedidos iniciada. O arquivo será baixado em breve.");
  };

  return (
    <div className={styles.page_container}>
      <main className={styles.main_content}>
        <div className={styles.page_header}>
          <h1 className={styles.page_title}>Gerenciamento de Pedidos</h1>
          <button 
            className={styles.add_button}
            onClick={() => openModal()}
          >
            <Plus size={16} />
            Novo Pedido
          </button>
        </div>

        <div className={styles.filters_row}>
          <div className={styles.search_container}>
            <div className={styles.search_box}>
              <Search size={20} className={styles.search_icon} />
              <input 
                type="text" 
                placeholder="Buscar pedidos por ID, cliente..."
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
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          
          <button className={styles.export_button} onClick={exportarPedidos}>
            <Download size={16} />
            Exportar
          </button>
        </div>

        <div className={styles.stats_cards}>
          <div className={styles.stat_card}>
            <h3>Total de Pedidos</h3>
            <p className={styles.stat_value}>{getTotalPedidos()}</p>
          </div>
          <div className={styles.stat_card}>
            <h3>Valor Total</h3>
            <p className={styles.stat_value}>
              R$ {getTotalValor().toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        <div className={styles.table_container}>
          <table className={styles.pedidos_table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Itens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.length > 0 ? (
                filteredPedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>
                      <div className={styles.cliente_info}>
                        <span className={styles.cliente_nome}>{pedido.clienteNome}</span>
                        <span className={styles.cliente_email}>{pedido.clienteEmail}</span>
                      </div>
                    </td>
                    <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                    <td>R$ {pedido.valor.toFixed(2).replace('.', ',')}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td>{pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'}</td>
                    <td>
                      <div className={styles.action_buttons}>
                        <button 
                          className={`${styles.action_button} ${styles.view}`}
                          title="Visualizar Detalhes"
                          onClick={() => openDetalhesModal(pedido)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={`${styles.action_button} ${styles.edit}`}
                          onClick={() => openModal(pedido)}
                          title="Editar Pedido"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className={`${styles.action_button} ${styles.delete}`}
                          onClick={() => handleDelete(pedido.id)}
                          title="Excluir Pedido"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.no_results}>
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Cadastro/Edição de Pedido */}
      {isModalOpen && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <div className={styles.modal_header}>
              <h2>{formData.id ? "Editar Pedido" : "Novo Pedido"}</h2>
              <button className={styles.close_button} onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.form_grid}>
                <div className={styles.form_group}>
                  <label htmlFor="clienteNome">Cliente</label>
                  <input
                    type="text"
                    id="clienteNome"
                    name="clienteNome"
                    value={formData.clienteNome || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="data">Data</label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="valor">Valor Total (R$)</label>
                  <input
                    type="number"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    required
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Processando">Processando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="endereco">Endereço de Entrega</label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="Endereço completo"
                  />
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="observacoes">Observações</label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes || ""}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Observações sobre o pedido (opcional)"
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.itens_section}>
                <h3>Itens do Pedido</h3>
                <p className={styles.itens_note}>
                  Os itens do pedido podem ser gerenciados na tela de detalhes após a criação.
                </p>
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

      {/* Modal de Detalhes do Pedido */}
      {isDetalhesModalOpen && selectedPedido && (
        <div className={styles.modal_overlay}>
          <div className={`${styles.modal} ${styles.detalhes_modal}`}>
            <div className={styles.modal_header}>
              <h2>Detalhes do Pedido #{selectedPedido.id}</h2>
              <button className={styles.close_button} onClick={closeDetalhesModal}>×</button>
            </div>
            
            <div className={styles.detalhes_container}>
              <div className={styles.detalhes_section}>
                <h3>Informações do Pedido</h3>
                <div className={styles.detalhes_grid}>
                  <div>
                    <p className={styles.detail_label}>Cliente:</p>
                    <p className={styles.detail_value}>{selectedPedido.clienteNome}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Data:</p>
                    <p className={styles.detail_value}>{new Date(selectedPedido.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Valor Total:</p>
                    <p className={styles.detail_value}>R$ {selectedPedido.valor.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Status:</p>
                    <p className={styles.detail_value}>
                      <span className={`${styles.status} ${getStatusClass(selectedPedido.status)}`}>
                        {selectedPedido.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Dados de Contato</h3>
                <div className={styles.detalhes_grid}>
                  <div>
                    <p className={styles.detail_label}>Email:</p>
                    <p className={styles.detail_value}>{selectedPedido.clienteEmail}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Telefone:</p>
                    <p className={styles.detail_value}>{selectedPedido.clienteTelefone}</p>
                  </div>
                  <div className={styles.detail_full}>
                    <p className={styles.detail_label}>Endereço de Entrega:</p>
                    <p className={styles.detail_value}>{selectedPedido.endereco}</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Itens do Pedido</h3>
                <table className={styles.itens_table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Preço Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPedido.itens.map(item => (
                      <tr key={item.id}>
                        <td>{item.nome}</td>
                        <td>{item.quantidade}</td>
                        <td>R$ {item.preco.toFixed(2).replace('.', ',')}</td>
                        <td>R$ {item.total.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className={styles.total_label}>Total</td>
                      <td className={styles.total_value}>
                        R$ {selectedPedido.valor.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {selectedPedido.observacoes && (
                <div className={styles.detalhes_section}>
                  <h3>Observações</h3>
                  <p className={styles.observacoes_text}>{selectedPedido.observacoes}</p>
                </div>
              )}
              
              <div className={styles.detalhes_actions}>
                <button className={styles.status_update_button} title="Atualizar Status">
                  <Truck size={16} />
                  Atualizar Status
                </button>
                <button className={styles.invoice_button} title="Gerar Nota Fiscal">
                  <FileText size={16} />
                  Gerar Nota Fiscal
                </button>
              </div>
            </div>
            
            <div className={styles.form_actions}>
              <button type="button" className={styles.cancel_button} onClick={closeDetalhesModal}>
                Fechar
              </button>
              <button type="button" className={styles.edit_button} onClick={() => {
                closeDetalhesModal();
                openModal(selectedPedido);
              }}>
                <Edit size={16} />
                Editar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}