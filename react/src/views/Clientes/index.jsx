import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, FileText, Package } from "lucide-react";
import styles from "./Clientes.module.css";
import axiosClient from "../../axios-client";


export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPedidosModalOpen, setIsPedidosModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar a lista de clientes
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/clients');
      const clientesData = response.data || [];
      
      setClientes(clientesData);
      setFilteredClientes(clientesData);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError("Não foi possível carregar a lista de clientes.");
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        await fetchClientes();
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Simular um pequeno delay para mostrar o loading
    setLoading(true);
    
    setTimeout(() => {
      if (value.trim() === "") {
        setFilteredClientes(clientes);
      } else {
        const filtered = clientes.filter(cliente => 
          cliente.name.toLowerCase().includes(value.toLowerCase()) ||
          cliente.email.toLowerCase().includes(value.toLowerCase()) ||
          cliente.phone?.includes(value)
        );
        setFilteredClientes(filtered);
      }
      setLoading(false);
    }, 300); // 300ms de delay para simular busca
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setFormData({
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone || "",
        address: cliente.address || "",
        password: "" // Campo vazio para senha - só será atualizado se preenchido
      });
    } else {
      setFormData({
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        password: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Remover senha vazia do objeto para não enviar ao backend
      const dataToSend = {...formData};
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      if (formData.id) {
        // Atualizar cliente existente
        await axiosClient.put(`/clients/${formData.id}`, dataToSend);
      } else {
        // Adicionar novo cliente
        await axiosClient.post('/clients', dataToSend);
      }
      
      // Recarregar a lista de clientes
      await fetchClientes();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Ocorreu um erro ao salvar o cliente.");
      }
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
  //     try {
  //       await axiosClient.delete(`/clients/${id}`);
  //       await fetchClientes();
  //     } catch (err) {
  //       console.error("Erro ao excluir cliente:", err);
  //       alert("Ocorreu um erro ao excluir o cliente.");
  //     }
  //   }
  // };

  // Função para formatar a data
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return "Data inválida";
    }
  };

  // Função segura para contar pedidos - verifica se o array existe antes de acessar .length
  const countPedidos = (cliente) => {
    return cliente && cliente.pedidos && Array.isArray(cliente.pedidos) ? cliente.pedidos.length : 0;
  };

  return (
    <div className={styles.page_container}>
      <main className={styles.main_content}>
      <div className={styles.page_header}>
        <h1 className={styles.page_title}>Gerenciamento de Clientes</h1>
        <button 
          className={styles.add_button}
          onClick={() => openModal()}
          disabled={isInitialLoading}
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {isInitialLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando dados dos clientes...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>Erro ao carregar dados: {error}</p>
        </div>
      ) : (
        <>
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
            {loading ? (
              <div className={styles.table_loading}>
                <div className={styles.spinner}></div>
                <p>Atualizando dados...</p>
              </div>
            ) : (
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
                        <td>{cliente.name}</td>
                        <td>{cliente.email}</td>
                        <td>{cliente.phone || "-"}</td>
                        <td>{cliente.address || "-"}</td>
                        <td>{formatDate(cliente.created_at)}</td>
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
                              onClick={() => alert(`Visualizando ${cliente.name}`)}
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
            )}
          </div>
        </>
      )}
    </main>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
      <div className={styles.modal_overlay}>
        <div className={styles.modal}>
          <div className={styles.modal_header}>
            <h2>{formData.id ? "Editar Cliente" : "Novo Cliente"}</h2>
            <button className={styles.close_button} onClick={closeModal}>×</button>
          </div>
          {error && (
            <div className={styles.error_message}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={styles.form_grid}>
              <div className={styles.form_group}>
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
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
                <label htmlFor="phone">Telefone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor="address">Endereço</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor="password">
                  {formData.id ? "Senha (deixe em branco para não alterar)" : "Senha"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!formData.id}
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
            <h2>Pedidos de {selectedCliente.name}</h2>
            <button className={styles.close_button} onClick={closePedidosModal}>×</button>
          </div>
          <div className={styles.pedidos_info}>
            <p>
              <strong>Cliente:</strong> {selectedCliente.name} (ID: {selectedCliente.id})
            </p>
            <p>
              <strong>Email:</strong> {selectedCliente.email} | <strong>Telefone:</strong> {selectedCliente.phone || "-"}
            </p>
          </div>
          <div className={styles.no_pedidos}>
            <p>Este cliente ainda não possui pedidos registrados.</p>
          </div>
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