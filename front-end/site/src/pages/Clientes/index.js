import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, FileText, Package } from "lucide-react";
import styles from "./Clientes.module.css";
import Header from "../../components/Header";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPedidosModalOpen, setIsPedidosModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    dataCadastro: "",
  });

  // Dados de exemplo
  useEffect(() => {
    // Simulando carregamento de dados
    const mockClientes = [
      {
        id: 1,
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 99999-8888",
        endereco: "Av. Paulista, 1000 - São Paulo, SP",
        dataCadastro: "2025-01-15",
        pedidos: [
          { id: 101, data: "2025-03-10", valor: 250.50, status: "Entregue" },
          { id: 103, data: "2025-04-05", valor: 120.75, status: "Processando" }
        ]
      },
      {
        id: 2,
        nome: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        telefone: "(21) 98888-7777",
        endereco: "Rua Copacabana, 500 - Rio de Janeiro, RJ",
        dataCadastro: "2025-02-20",
        pedidos: [
          { id: 102, data: "2025-03-25", valor: 175.00, status: "Enviado" }
        ]
      },
      {
        id: 3,
        nome: "Pedro Santos",
        email: "pedro.santos@email.com",
        telefone: "(31) 97777-6666",
        endereco: "Av. Amazonas, 100 - Belo Horizonte, MG",
        dataCadastro: "2025-03-05",
        pedidos: []
      },
    ];
    
    setClientes(mockClientes);
    setFilteredClientes(mockClientes);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(value.toLowerCase()) ||
        cliente.email.toLowerCase().includes(value.toLowerCase()) ||
        cliente.telefone.includes(value)
      );
      setFilteredClientes(filtered);
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setFormData({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        dataCadastro: cliente.dataCadastro,
      });
    } else {
      setFormData({
        id: null,
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        dataCadastro: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openPedidosModal = (cliente) => {
    setSelectedCliente(cliente);
    setIsPedidosModalOpen(true);
  };

  const closePedidosModal = () => {
    setIsPedidosModalOpen(false);
    setSelectedCliente(null);
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
      // Atualizar cliente existente
      const updatedClientes = clientes.map(cliente => 
        cliente.id === formData.id ? { ...formData, pedidos: cliente.pedidos } : cliente
      );
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
    } else {
      // Adicionar novo cliente
      const newCliente = {
        ...formData,
        id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
        pedidos: []
      };
      
      const updatedClientes = [...clientes, newCliente];
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      const updatedClientes = clientes.filter(cliente => cliente.id !== id);
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
    }
  };

  const countPedidos = (cliente) => {
    return cliente.pedidos ? cliente.pedidos.length : 0;
  };

  const calcularValorTotal = (pedidos) => {
    return pedidos.reduce((total, pedido) => total + pedido.valor, 0);
  };

  return (
    <div className={styles.page_container}>
      <Header />
      
      <main className={styles.main_content}>
        <div className={styles.page_header}>
          <h1 className={styles.page_title}>Gerenciamento de Clientes</h1>
          <button 
            className={styles.add_button}
            onClick={() => openModal()}
          >
            <Plus size={16} />
            Novo Cliente
          </button>
        </div>

        <div className={styles.search_container}>
          <div className={styles.search_box}>
            <Search size={20} className={styles.search_icon} />
            <input 
              type="text" 
              placeholder="Buscar clientes..."
              className={styles.search_input}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className={styles.table_container}>
          <table className={styles.clients_table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Cadastro</th>
                <th>Pedidos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.nome}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.endereco}</td>
                    <td>{new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button 
                        className={styles.pedidos_button}
                        onClick={() => openPedidosModal(cliente)}
                      >
                        <Package size={16} />
                        {countPedidos(cliente)}
                      </button>
                    </td>
                    <td>
                      <div className={styles.action_buttons}>
                        <button 
                          className={`${styles.action_button} ${styles.view}`}
                          title="Visualizar Cliente"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={`${styles.action_button} ${styles.edit}`}
                          onClick={() => openModal(cliente)}
                          title="Editar Cliente"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className={`${styles.action_button} ${styles.delete}`}
                          onClick={() => handleDelete(cliente.id)}
                          title="Excluir Cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.no_results}>
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal}>
            <div className={styles.modal_header}>
              <h2>{formData.id ? "Editar Cliente" : "Novo Cliente"}</h2>
              <button className={styles.close_button} onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.form_grid}>
                <div className={styles.form_group}>
                  <label htmlFor="nome">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="endereco">Endereço</label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
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

      {/* Modal de Pedidos */}
      {isPedidosModalOpen && selectedCliente && (
        <div className={styles.modal_overlay}>
          <div className={`${styles.modal} ${styles.pedidos_modal}`}>
            <div className={styles.modal_header}>
              <h2>Pedidos de {selectedCliente.nome}</h2>
              <button className={styles.close_button} onClick={closePedidosModal}>×</button>
            </div>
            <div className={styles.pedidos_info}>
              <p>
                <strong>Cliente:</strong> {selectedCliente.nome} (ID: {selectedCliente.id})
              </p>
              <p>
                <strong>Email:</strong> {selectedCliente.email} | <strong>Telefone:</strong> {selectedCliente.telefone}
              </p>
            </div>
            {selectedCliente.pedidos.length > 0 ? (
              <div className={styles.pedidos_list}>
                <table className={styles.pedidos_table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCliente.pedidos.map(pedido => (
                      <tr key={pedido.id}>
                        <td>#{pedido.id}</td>
                        <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                        <td>R$ {pedido.valor.toFixed(2).replace('.', ',')}</td>
                        <td>
                          <span className={`${styles.status} ${styles[pedido.status.toLowerCase()]}`}>
                            {pedido.status}
                          </span>
                        </td>
                        <td>
                          <button className={styles.view_details}>
                            <FileText size={16} />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2"><strong>Total</strong></td>
                      <td colSpan="3">
                        <strong>R$ {calcularValorTotal(selectedCliente.pedidos).toFixed(2).replace('.', ',')}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className={styles.no_pedidos}>
                <p>Este cliente ainda não possui pedidos.</p>
              </div>
            )}
            <div className={styles.form_actions}>
              <button type="button" className={styles.cancel_button} onClick={closePedidosModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}