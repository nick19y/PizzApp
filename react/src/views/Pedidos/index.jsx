import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, FileText, Package, Filter, Download, Truck, X } from "lucide-react";
import styles from "./Pedidos.module.css";
import axiosClient from "../../axios-client";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itens, setItens] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [itemSizes, setItemSizes] = useState({});
  const [formData, setFormData] = useState({
    id: null,
    user_id: "",
    delivery_address: "",
    contact_phone: "",
    notes: "",
    delivery_time: "",
    payment_method: "cash",
    status: "pending",
    items: []
  });
  const [itemFormData, setItemFormData] = useState({
    item_id: "",
    order_id: null,
    quantity: 1,
    size: "medium",
    notes: ""
  });
  useEffect(()=>{
    console.log("Itens selecionados: ", selectedItems);
  }, [selectedItems])

  // Status mapping para português
  const statusMap = {
    'pending': 'Pendente',
    'processing': 'Processando',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'canceled': 'Cancelado'
  };

  // Status inverso para API
  const statusMapReverse = {
    'Pendente': 'pending',
    'Processando': 'processing',
    'Enviado': 'shipped',
    'Entregue': 'delivered',
    'Cancelado': 'canceled'
  };

  // Métodos de pagamento
  const paymentMethods = {
    'cash': 'Dinheiro',
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'pix': 'PIX'
  };

  // Buscar dados
  useEffect(() => {
    fetchPedidos();
    fetchItens();
    fetchClientes();
  }, []);

  // Buscar pedidos
  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/orders');
      const ordersData = await Promise.all(
        response.data.data.map(async (order) => {
          // Buscar os itens de cada pedido
          try {
            const itemsResponse = await axiosClient.get(`/item_order/${order.id}`);
            return {
              ...order,
              items: itemsResponse.data || [],
              clienteNome: order.user ? order.user.name : 'Cliente não encontrado',
              clienteEmail: order.user ? order.user.email : '',
              clienteTelefone: order.contact_phone,
              data: order.created_at,
              valor: order.total_amount,
              status: statusMap[order.status] || order.status,
              endereco: order.delivery_address
            };
          } catch (err) {
            console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
            return {
              ...order,
              items: [],
              clienteNome: order.user ? order.user.name : 'Cliente não encontrado',
              clienteEmail: order.user ? order.user.email : '',
              clienteTelefone: order.contact_phone,
              data: order.created_at,
              valor: order.total_amount,
              status: statusMap[order.status] || order.status,
              endereco: order.delivery_address
            };
          }
        })
      );
      setPedidos(ordersData);
      setFilteredPedidos(ordersData);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Não foi possível carregar os pedidos. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  // Buscar itens do menu
  const fetchItens = async () => {
    try {
      const response = await axiosClient.get('/items');
      setItens(response.data);
    } catch (err) {
      console.error("Erro ao buscar itens:", err);
    }
  };
  useEffect(()=>{
    console.log("Itens consultados 1: ", itens)
  }, [itens])

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      const response = await axiosClient.get('/clients');
      setClientes(response.data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  // Buscar itens de um pedido específico
  const fetchPedidoItems = async (orderId) => {
    try {
      const response = await axiosClient.get(`/item_order/${orderId}`);
      return response.data;
    } catch (err) {
      console.error(`Erro ao buscar itens do pedido ${orderId}:`, err);
      return [];
    }
  };

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
  const handleAddItem = (item) => {
    const selectedSize = itemSizes[item.id] || 'small'; // padrão se não escolher
    const unit_price =
      selectedSize === 'small' ? item.price_small :
      selectedSize === 'medium' ? item.price_medium :
      item.price_large;

    const newItem = {
      specific_details: {
        item_id: item.id,
      },
      size: selectedSize,
      quantity: 1,
      unit_price,
      special_instructions: ''
    };

    setSelectedItems(prev => [...prev, newItem]);
  };


  const handleRemoveItem = (item) => {
    const existing = selectedItems.find(
      i => i.id === item.id && i.size === item.size
    );

    if (!existing) return; // não faz nada se o item não existir

    if (existing.quantity === 1) {
      // remove da lista se for o último
      setSelectedItems(prev =>
        prev.filter(i => !(i.id === item.id && i.size === item.size))
      );
    } else {
      // só diminui a quantidade
      setSelectedItems(prev =>
        prev.map(i =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
    }
  };
  const handleSizeChange = (itemId, size) => {
    setItemSizes(prev => ({
      ...prev,
      [itemId]: size,
    }));
  };


  const filterPedidos = (search, status) => {
    let filtered = [...pedidos];
    
    // Filtrar por termo de busca
    if (search.trim() !== "") {
      filtered = filtered.filter(pedido => 
        pedido.id.toString().includes(search) ||
        (pedido.clienteNome && pedido.clienteNome.toLowerCase().includes(search.toLowerCase())) ||
        (pedido.clienteEmail && pedido.clienteEmail.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Filtrar por status
    if (status !== "todos") {
      filtered = filtered.filter(pedido => 
        pedido.status && pedido.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    setFilteredPedidos(filtered);
  };

  const openModal = (pedido = null) => {
    // Se estamos editando um pedido existente
    if (pedido) {
      const deliveryTime = pedido.delivery_time 
        ? new Date(pedido.delivery_time).toISOString().slice(0, 16) 
        : '';

      setFormData({
        id: pedido.id,
        user_id: pedido.user_id,
        delivery_address: pedido.delivery_address || pedido.endereco || '',
        contact_phone: pedido.contact_phone || pedido.clienteTelefone || '',
        notes: pedido.notes || pedido.observacoes || '',
        delivery_time: deliveryTime,
        payment_method: pedido.payment_method || 'cash',
        status: statusMapReverse[pedido.status] || pedido.status || 'pending',
        items: pedido.items || []
      });
    } else {
      // Se estamos criando um novo pedido
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hora
      
      setFormData({
        id: null,
        user_id: "",
        delivery_address: "",
        contact_phone: "",
        notes: "",
        delivery_time: deliveryTime.toISOString().slice(0, 16),
        payment_method: "cash",
        status: "pending",
        items: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDetalhesModal = async (pedido) => {
    // Atualizar itens do pedido antes de abrir o modal
    try {
      const items = await fetchPedidoItems(pedido.id);
      const updatedPedido = {...pedido, items};
      setSelectedPedido(updatedPedido);
      setIsDetalhesModalOpen(true);
      
      // Atualizar também o pedido na lista
      setPedidos(prevPedidos => 
        prevPedidos.map(p => 
          p.id === pedido.id ? updatedPedido : p
        )
      );
      setFilteredPedidos(prevFilteredPedidos => 
        prevFilteredPedidos.map(p => 
          p.id === pedido.id ? updatedPedido : p
        )
      );
    } catch (err) {
      console.error("Erro ao abrir detalhes do pedido:", err);
      setError("Não foi possível carregar os detalhes do pedido.");
      setSelectedPedido(pedido);
      setIsDetalhesModalOpen(true);
    }
  };

  const closeDetalhesModal = () => {
    setIsDetalhesModalOpen(false);
    setSelectedPedido(null);
  };

  const openAddItemModal = (pedido) => {
    setItemFormData({
      item_id: "",
      order_id: pedido.id,
      quantity: 1,
      size: "medium",
      notes: ""
    });
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setItemFormData({
      item_id: "",
      order_id: null,
      quantity: 1,
      size: "medium",
      notes: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setItemFormData({
      ...itemFormData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      delivery_address: formData.delivery_address,
      contact_phone: formData.contact_phone,
      notes: formData.notes,
      delivery_time: formData.delivery_time,
      payment_method: formData.payment_method,
      status: formData.status,
      user_id: formData.user_id || null,
      items: selectedItems.map(item => ({
        item_id: item.specific_details.item_id,
        size: item.size,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null
      }))
    };
    console.log("Formulário sendo enviado: ", formData);

    try {
      let response;

      if (formData.id) {
        // Atualizar pedido existente
        response = await axiosClient.put(`/orders/${formData.id}`, orderData);

        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === formData.id
              ? {
                  ...response.data,
                  clienteNome: response.data.user ? response.data.user.name : 'Cliente não encontrado',
                  clienteEmail: response.data.user ? response.data.user.email : '',
                  clienteTelefone: response.data.contact_phone,
                  data: response.data.created_at,
                  valor: response.data.total_amount,
                  status: statusMap[response.data.status] || response.data.status,
                  endereco: response.data.delivery_address,
                  items: formData.items
                }
              : pedido
          )
        );
      } else {
        // Criar novo pedido
        if (formData.user_id) {
          // Rota personalizada para outro usuário
          response = await axiosClient.post('/orders/for-user', orderData);
        } else {
          // Pedido normal
          response = await axiosClient.post('/orders', orderData);
        }

        const newPedido = {
          ...response.data.data || response.data, // compatibilidade com estrutura do retorno
          clienteNome: response.data.data?.user?.name || response.data.user?.name || 'Cliente não encontrado',
          clienteEmail: response.data.data?.user?.email || response.data.user?.email || '',
          clienteTelefone: response.data.data?.contact_phone || response.data.contact_phone,
          data: response.data.data?.created_at || response.data.created_at,
          valor: response.data.data?.total_amount || response.data.total_amount,
          status: statusMap[response.data.data?.status || response.data.status] || response.data.status,
          endereco: response.data.data?.delivery_address || response.data.delivery_address,
          items: []
        };

        setPedidos(prevPedidos => [...prevPedidos, newPedido]);
      }

      filterPedidos(searchTerm, statusFilter);
      closeModal();
      alert(formData.id ? "Pedido atualizado com sucesso!" : "Pedido criado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
      alert(`Erro ao ${formData.id ? 'atualizar' : 'criar'} pedido: ${err.response?.data?.message || err.message}`);
    } finally {
      fetchPedidos();
      fetchItens();
      fetchClientes();
      setLoading(false);
    }
  };


  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validar entrada
    if (!itemFormData.item_id || !itemFormData.quantity || itemFormData.quantity < 1) {
      alert("Por favor, selecione um item e informe uma quantidade válida.");
      setLoading(false);
      return;
    }
    
    try {
      const itemData = {
        order_id: itemFormData.order_id,
        item_id: itemFormData.item_id,
        quantity: itemFormData.quantity,
        size: itemFormData.size,
        notes: itemFormData.notes || null
      };
      
      // Adicionar item ao pedido
      const response = await axiosClient.post('/item_order', itemData);
      
      // Atualizar o pedido com o novo item
      const updatedItems = await fetchPedidoItems(itemFormData.order_id);
      
      // Atualizar o pedido selecionado se estiver nos detalhes
      if (selectedPedido && selectedPedido.id === itemFormData.order_id) {
        setSelectedPedido(prev => ({
          ...prev,
          items: updatedItems,
          valor: calculateTotal(updatedItems)
        }));
      }
      
      // Atualizar a lista de pedidos
      const updatePedidoWithNewItems = (pedidosList) => {
        return pedidosList.map(pedido => {
          if (pedido.id === itemFormData.order_id) {
            return {
              ...pedido,
              items: updatedItems,
              valor: calculateTotal(updatedItems)
            };
          }
          return pedido;
        });
      };
      
      setPedidos(updatePedidoWithNewItems);
      setFilteredPedidos(updatePedidoWithNewItems);
      
      closeItemModal();
      alert("Item adicionado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      alert(`Erro ao adicionar item: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemOrderId, orderId) => {
    if (window.confirm("Tem certeza que deseja remover este item do pedido?")) {
      setLoading(true);
      try {
        // Remover item do pedido
        await axiosClient.delete(`/item_order/${itemOrderId}`);
        
        // Atualizar o pedido com os itens atualizados
        const updatedItems = await fetchPedidoItems(orderId);
        
        // Atualizar o pedido selecionado se estiver nos detalhes
        if (selectedPedido && selectedPedido.id === orderId) {
          setSelectedPedido(prev => ({
            ...prev,
            items: updatedItems,
            valor: calculateTotal(updatedItems)
          }));
        }
        
        // Atualizar a lista de pedidos
        const updatePedidoWithNewItems = (pedidosList) => {
          return pedidosList.map(pedido => {
            if (pedido.id === orderId) {
              return {
                ...pedido,
                items: updatedItems,
                valor: calculateTotal(updatedItems)
              };
            }
            return pedido;
          });
        };
        
        setPedidos(updatePedidoWithNewItems);
        setFilteredPedidos(updatePedidoWithNewItems);
        
        alert("Item removido com sucesso!");
      } catch (err) {
        console.error("Erro ao remover item:", err);
        alert(`Erro ao remover item: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      setLoading(true);
      try {
        await axiosClient.delete(`/orders/${id}`);
        
        // Remover o pedido das listas
        setPedidos(prevPedidos => prevPedidos.filter(pedido => pedido.id !== id));
        setFilteredPedidos(prevFilteredPedidos => prevFilteredPedidos.filter(pedido => pedido.id !== id));
        
        alert("Pedido excluído com sucesso!");
      } catch (err) {
        console.error("Erro ao excluir pedido:", err);
        alert(`Erro ao excluir pedido: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (pedido, newStatus) => {
    try {
      // Converter status de português para o formato da API
      const apiStatus = statusMapReverse[newStatus] || newStatus;
      
      await axiosClient.put(`/orders/${pedido.id}`, {
        status: apiStatus
      });
      
      // Atualizar pedido na lista
      setPedidos(prevPedidos => 
        prevPedidos.map(p => 
          p.id === pedido.id ? {...p, status: newStatus} : p
        )
      );
      setFilteredPedidos(prevFilteredPedidos => 
        prevFilteredPedidos.map(p => 
          p.id === pedido.id ? {...p, status: newStatus} : p
        )
      );
      
      if (selectedPedido && selectedPedido.id === pedido.id) {
        setSelectedPedido({...selectedPedido, status: newStatus});
      }
      
      alert("Status do pedido atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert(`Erro ao atualizar status: ${err.response?.data?.message || err.message}`);
    }
  };

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

  const getTotalPedidos = () => {
    return filteredPedidos.length;
  };

  const getTotalValor = () => {
    return filteredPedidos.reduce((total, pedido) => total + parseFloat(pedido.valor || 0), 0);
  };

  const exportarPedidos = () => {
    // Gerar CSV dos pedidos
    const headers = "ID,Cliente,Data,Valor,Status,Endereço,Telefone\n";
    const csvData = filteredPedidos.map(pedido => {
      return `${pedido.id},"${pedido.clienteNome}",${new Date(pedido.data).toLocaleDateString('pt-BR')},${pedido.valor || 0},"${pedido.status}","${pedido.endereco || ''}","${pedido.clienteTelefone || ''}"`;
    }).join("\n");
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + csvData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const options = { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className={styles.page_container}>
      <main className={styles.main_content}>
        <div className={styles.page_header}>
          <h1 className={styles.page_title}>Gerenciamento de Pedidos</h1>
          <button 
            className={styles.add_button}
            onClick={() => openModal()}
            disabled={loading}
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
          
          <button className={styles.export_button} onClick={exportarPedidos} disabled={loading}>
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

        {error && (
          <div className={styles.error_message}>
            {error}
          </div>
        )}

        <div className={styles.table_container}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
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
                      <td>R$ {parseFloat(pedido.valor || 0).toFixed(2).replace('.', ',')}</td>
                      <td>
                        <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>
                          {pedido.status}
                        </span>
                      </td>
                      <td>{pedido.items?.length || 0} {pedido.items?.length === 1 ? 'item' : 'itens'}</td>
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
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className={`${styles.action_button} ${styles.delete}`}
                            onClick={() => handleDelete(pedido.id)}
                            title="Excluir Pedido"
                            disabled={loading}
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
          )}
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
                  <label htmlFor="user_id">Cliente</label>
                  <select
                    id="user_id"
                    name="user_id"
                    value={formData.user_id || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.name} ({cliente.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="contact_phone">Telefone *</label>
                  <input
                    type="text"
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="delivery_time">Data de Entrega</label>
                  <input
                    type="datetime-local"
                    id="delivery_time"
                    name="delivery_time"
                    value={formData.delivery_time || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.form_group}>
                  <label htmlFor="payment_method">Método de Pagamento *</label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method || "cash"}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="delivery_address">Endereço de Entrega</label>
                  <input
                    type="text"
                    id="delivery_address"
                    name="delivery_address"
                    value={formData.delivery_address || ""}
                    onChange={handleInputChange}
                    placeholder="Endereço completo"
                  />
                </div>
                <div className={styles.form_group_full}>
                  <label htmlFor="notes">Observações</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Observações sobre o pedido (opcional)"
                  ></textarea>
                </div>
                {formData.id && (
                  <div className={styles.form_group}>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || "pending"}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pendente</option>
                      <option value="processing">Processando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                      <option value="canceled">Cancelado</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className={styles.itens_section}>
                <h3>Escolher Itens</h3>
                {itens && itens.length > 0 ? (
                  <table className={styles.items_table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Tamanho</th>
                        <th>Preço P</th>
                        <th>Preço M</th>
                        <th>Preço G</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => (
                        <tr key={`${item.id}-${item.size}`}>
                          <td>{item.name}</td>
                          <td>
                            <select
                              value={itemSizes[item.id] || 'small'}
                              onChange={(e) => handleSizeChange(item.id, e.target.value)}
                            >
                              <option value="small">P</option>
                              <option value="medium">M</option>
                              <option value="large">G</option>
                            </select>
                          </td>
                          <td>R$ {item.price_small}</td>
                          <td>R$ {item.price_medium}</td>
                          <td>R$ {item.price_large}</td>
                          <td>
                            <button type="button" onClick={() => handleAddItem(item)}>
                              Adicionar
                            </button>
                            <button type="button" onClick={() => handleRemoveItem(item)}>
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Nenhum item disponível.</p>
                )}
              </div> 
              <div className={styles.form_actions}>
                <button type="button" className={styles.cancel_button} onClick={closeModal} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className={styles.save_button} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
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
                    {/* <p className={styles.detail_value}>R$ {selectedPedido.valor?.toFixed(2).replace('.', ',') || '0,00'}</p> */}
                    <p className={styles.detail_value}>R$ {selectedPedido.valor}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Status:</p>
                    <p className={styles.detail_value}>
                      <span className={`${styles.status} ${getStatusClass(selectedPedido.status)}`}>
                        {selectedPedido.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Método de Pagamento:</p>
                    <p className={styles.detail_value}>
                      {paymentMethods[selectedPedido.payment_method] || selectedPedido.payment_method}
                    </p>
                  </div>
                  {selectedPedido.delivery_time && (
                    <div>
                      <p className={styles.detail_label}>Horário de Entrega:</p>
                      <p className={styles.detail_value}>{formatDateTime(selectedPedido.delivery_time)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Dados de Contato</h3>
                <div className={styles.detalhes_grid}>
                  <div>
                    <p className={styles.detail_label}>Email:</p>
                    <p className={styles.detail_value}>{selectedPedido.clienteEmail || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className={styles.detail_label}>Telefone:</p>
                    <p className={styles.detail_value}>{selectedPedido.clienteTelefone || 'Não informado'}</p>
                  </div>
                  <div className={styles.detail_full}>
                    <p className={styles.detail_label}>Endereço de Entrega:</p>
                    <p className={styles.detail_value}>{selectedPedido.endereco || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>Itens do Pedido</h3>
                {selectedPedido.items && selectedPedido.items.length > 0 ? (
                  <table className={styles.itens_table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Tamanho</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.item?.name || 'Item não encontrado'}</td>
                          <td>{item.size === 'small' ? 'P' : (item.size === 'medium' ? 'M' : 'G')}</td>
                          <td>{item.quantity}</td>
                          {/* <td>R$ {item.unit_price?.toFixed(2).replace('.', ',') || '0,00'}</td>
                          <td>R$ {item.subtotal?.toFixed(2).replace('.', ',') || '0,00'}</td> */}
                          <td>R$ {item.unit_price}</td>
                          <td>R$ {item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className={styles.total_label}>Total</td>
                        {/* <td className={styles.total_value}>
                          R$ {selectedPedido.valor?.toFixed(2).replace('.', ',') || '0,00'}
                        </td> */}
                        <td className={styles.total_value}>
                          R$ {selectedPedido.valor}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className={styles.no_items}>Nenhum item encontrado neste pedido.</p>
                )}
              </div>
              
              {selectedPedido.notes && (
                <div className={styles.detalhes_section}>
                  <h3>Observações</h3>
                  <p className={styles.observacoes_text}>{selectedPedido.notes}</p>
                </div>
              )}
              
              <div className={styles.detalhes_actions}>
                <div className={styles.status_update_container}>
                  <select
                    className={styles.status_select}
                    value={selectedPedido.status}
                    onChange={(e) => handleStatusChange(selectedPedido, e.target.value)}
                    disabled={loading}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Processando">Processando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                  <button 
                    className={styles.status_update_button}
                    onClick={() => handleStatusChange(selectedPedido, document.querySelector(`.${styles.status_select}`).value)}
                    disabled={loading}
                  >
                    <Truck size={16} />
                    Atualizar Status
                  </button>
                </div>
                
                <button 
                  className={styles.invoice_button} 
                  onClick={()=>console.log("implementar")}
                  disabled={loading}
                >
                  <FileText size={16} />
                  Gerar Nota Fiscal
                </button>
              </div>
            </div>
            
            <div className={styles.form_actions}>
              <button 
                type="button" 
                className={styles.cancel_button} 
                onClick={closeDetalhesModal}
                disabled={loading}
              >
                Fechar
              </button>
              <button 
                type="button" 
                className={styles.edit_button} 
                onClick={() => {
                  closeDetalhesModal();
                  openModal(selectedPedido);
                }}
                disabled={loading}
              >
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