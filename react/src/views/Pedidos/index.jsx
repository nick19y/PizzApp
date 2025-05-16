import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, FileText, Package, Filter, Download, Truck, X, ShoppingCart } from "lucide-react";
import styles from "./Pedidos.module.css";
import axiosClient from "../../axios-client";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
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

  // Adicione esta função para gerar o PDF
  const generateInvoicePDF = (pedido) => {
    // Criar um novo documento PDF
    const doc = new jsPDF();
    
    // Adicionar título
    doc.setFontSize(20);
    doc.text(`NOTA FISCAL - Pedido #${pedido.id}`, 15, 15);
    
    // Adicionar informações do pedido
    doc.setFontSize(12);
    doc.text(`Data: ${new Date(pedido.data).toLocaleDateString('pt-BR')}`, 15, 30);
    doc.text(`Cliente: ${pedido.clienteNome}`, 15, 37);
    doc.text(`Email: ${pedido.clienteEmail || 'Não informado'}`, 15, 44);
    doc.text(`Telefone: ${pedido.clienteTelefone || 'Não informado'}`, 15, 51);
    doc.text(`Endereço: ${pedido.endereco || 'Não informado'}`, 15, 58);
    doc.text(`Método de Pagamento: ${pedido.payment_method || 'Não informado'}`, 15, 65);
    doc.text(`Status: ${pedido.status}`, 15, 72);
    
    // Adicionar observações se existirem
    if (pedido.notes) {
      doc.text('Observações:', 15, 79);
      doc.setFontSize(10);
      // Quebrar texto longo em múltiplas linhas
      const splitNotes = doc.splitTextToSize(pedido.notes, 180);
      doc.text(splitNotes, 15, 86);
      // Ajustar posição Y para a tabela com base no tamanho do texto
      var tableY = 86 + (splitNotes.length * 5);
    } else {
      var tableY = 85;
    }
    
    // Adicionar tabela de itens
    const tableColumn = ["Item", "Tamanho", "Quantidade", "Preço Unit.", "Subtotal"];
    const tableRows = [];
    
    // Preencher dados da tabela
    pedido.items.forEach(item => {
      const tamanho = item.size === 'small' ? 'P' : (item.size === 'medium' ? 'M' : 'G');
      const precoUnitario = `R$ ${parseFloat(item.unit_price || 0).toFixed(2).replace('.', ',')}`;
      const subtotal = `R$ ${parseFloat(item.subtotal || (item.quantity * item.unit_price) || 0).toFixed(2).replace('.', ',')}`;
      
      tableRows.push([
        item.item?.name || 'Item não encontrado',
        tamanho,
        item.quantity,
        precoUnitario,
        subtotal
      ]);
    });
    
    // Adicionar a tabela ao PDF usando jspdf-autotable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: tableY,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      styles: { 
        halign: 'center',
        valign: 'middle' 
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });
    
    // Adicionar valor total (usando lastAutoTable ou o API mais recente)
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : doc.previous.finalY) + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Valor Total: R$ ${parseFloat(pedido.valor || 0).toFixed(2).replace('.', ',')}`, 130, finalY);
    
    // Adicionar informações da empresa
    const finalY2 = finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PizzApp', 15, finalY2);
    doc.text('CNPJ: 00.000.000/0001-00', 15, finalY2 + 7);
    doc.text('Rua Exemplo, 123 - Centro, Campinas/SP', 15, finalY2 + 14);
    doc.text('Telefone: (19) 3333-3333', 15, finalY2 + 21);
    doc.text('Email: contato@pizzapp.com', 15, finalY2 + 28);
    
    // Gerar o PDF
    doc.save(`Nota_Fiscal_Pedido_${pedido.id}.pdf`);
  };


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
      console.log("Buscando pedidos...");
      const response = await axiosClient.get('/orders');
      console.log("Resposta da API de pedidos:", response.data);
      
      const ordersData = await Promise.all(
        response.data.data.map(async (order) => {
          // Buscar os itens de cada pedido
          console.log(`Buscando itens para o pedido ${order.id}...`);
          let orderItems = [];
          try {
            const itemsResponse = await axiosClient.get(`/order-items/${order.id}`);
            orderItems = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
            console.log(`Itens do pedido ${order.id}:`, orderItems);
          } catch (err) {
            console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
          }
          
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
      
      console.log("Pedidos processados:", ordersData);
      setPedidos(ordersData);
      setFilteredPedidos(ordersData);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Não foi possível carregar os pedidos. Por favor, tente novamente.");
    } finally {
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
      const response = await axiosClient.get(`/order-items/${orderId}`);
      return Array.isArray(response.data) ? response.data : [];
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

  // Gerenciamento de itens em um pedido
  const handleAddItem = (item) => {
    const selectedSize = itemSizes[item.id] || 'small';
    
    // Determinar o preço baseado no tamanho selecionado
    const unit_price =
      selectedSize === 'small' ? item.price_small :
      selectedSize === 'medium' ? item.price_medium :
      item.price_large;
    
    // Verificar se o item já existe no carrinho com o mesmo tamanho
    const existingItemIndex = selectedItems.findIndex(
      i => i.specific_details.item_id === item.id && i.size === selectedSize
    );
    
    if (existingItemIndex !== -1) {
      // Se já existe, aumentar a quantidade
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Se não existe, adicionar novo item
      const newItem = {
        specific_details: {
          item_id: item.id,
          name: item.name, // Guardando o nome para exibição
          description: item.description
        },
        size: selectedSize,
        quantity: 1,
        unit_price,
        special_instructions: ''
      };
      
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveItem = (index) => {
    // Remove o item pelo índice
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return; // Não permitir quantidade menor que 1
    
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleSizeChange = (itemId, size) => {
    setItemSizes(prev => ({
      ...prev,
      [itemId]: size,
    }));
  };

  const handleSpecialInstructionsChange = (index, instructions) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, special_instructions: instructions } : item
    ));
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

  const openModal = async (pedido = null) => {
    // Resetar os itens selecionados
    setSelectedItems([]);
    
    // Se estamos editando um pedido existente
    if (pedido) {
      try {
        // Buscar os itens mais recentes do pedido
        const items = await fetchPedidoItems(pedido.id);
        
        // Verificar se items é um array antes de usar map
        const formattedItems = Array.isArray(items) ? items.map(item => ({
          specific_details: {
            item_id: item.item.id,
            name: item.item.name,
            description: item.item.description
          },
          size: item.size,
          quantity: item.quantity,
          unit_price: item.unit_price,
          special_instructions: item.notes || '',
          id: item.id // ID do item_order para atualizações
        })) : [];
        
        // Definir os itens selecionados para edição
        setSelectedItems(formattedItems);
        
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
          items: Array.isArray(items) ? items : [] // Garantir que items seja um array
        });
      } catch (err) {
        console.error("Erro ao carregar itens do pedido para edição:", err);
        alert("Erro ao carregar itens do pedido. Tente novamente.");
      }
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
    // Limpar o formulário ao fechar
    setFormData({
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
    setSelectedItems([]);
  };

  const openDetalhesModal = async (pedido) => {
    // Atualizar itens do pedido antes de abrir o modal
    setLoading(true);
    try {
      // Use a nova rota de order-items para buscar os itens
      const response = await axiosClient.get(`/order-items/${pedido.id}`);
      const items = Array.isArray(response.data) ? response.data : [];
      
      // Garantir que cada item tenha as propriedades necessárias
      const processedItems = items.map(item => {
        // Certifique-se de que o item e suas propriedades estejam definidos
        if (!item.item) {
          console.warn(`Item sem propriedade 'item' encontrado no pedido ${pedido.id}`, item);
        }
        
        return {
          ...item,
          // Garantir que o item tenha um objeto 'item' com um nome
          item: item.item || { 
            name: 'Item não encontrado',
            id: item.item_id
          }
        };
      });
      
      // Atualize o pedido com os itens processados
      const updatedPedido = {
        ...pedido, 
        items: processedItems
      };
      
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
      
      // Em caso de erro, usar array vazio para os itens
      const fallbackPedido = {
        ...pedido,
        items: []
      };
      
      setSelectedPedido(fallbackPedido);
      setIsDetalhesModalOpen(true);
    } finally {
      setLoading(false);
    }
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

  const calculateCartTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);
  };

  // Função handleSubmit para atualizar um pedido existente
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert("Por favor, adicione pelo menos um item ao pedido.");
      return;
    }
    
    setLoading(true);

    try {
      // Calcular o valor total do pedido com base nos itens selecionados
      const totalAmount = selectedItems.reduce((total, item) => {
        return total + (parseFloat(item.unit_price) * item.quantity);
      }, 0);

      const orderData = {
        delivery_address: formData.delivery_address,
        contact_phone: formData.contact_phone,
        notes: formData.notes,
        delivery_time: formData.delivery_time,
        payment_method: formData.payment_method,
        status: formData.status,
        user_id: formData.user_id || null,
        total_amount: totalAmount // Adicionar o valor total calculado
      };

      let response;

      if (formData.id) {
        // Atualizar pedido existente
        console.log("Atualizando pedido:", formData.id, orderData);
        response = await axiosClient.put(`/orders/${formData.id}`, orderData);
        
        console.log("Resposta da atualização:", response.data);
        
        // Para cada item, determinar se precisa adicionar, atualizar ou remover
        const existingItemIds = Array.isArray(formData.items) 
        ? formData.items.map(item => item.id).filter(id => id) 
        : [];
        
        console.log("IDs de itens existentes:", existingItemIds);
        
        // Itens a serem atualizados ou adicionados
        for (const item of selectedItems) {
          const itemData = {
            order_id: formData.id,
            item_id: item.specific_details.item_id,
            quantity: item.quantity,
            size: item.size,
            notes: item.special_instructions || null,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity // Garantir que o subtotal seja calculado corretamente
          };
          
          if (item.id) {
            // Atualizar item existente
            console.log("Atualizando item:", item.id, itemData);
            await axiosClient.put(`/item_order/${item.id}`, itemData);
          } else {
            // Adicionar novo item
            console.log("Adicionando novo item:", itemData);
            await axiosClient.post('/item_order', itemData);
          }
        }
        
        // Identificar itens removidos
        const currentItemIds = selectedItems
          .filter(item => item.id)
          .map(item => item.id);
        
        console.log("IDs de itens atuais:", currentItemIds);
        
        // Remover itens que não estão mais no pedido
        for (const itemId of existingItemIds) {
          if (!currentItemIds.includes(itemId)) {
            console.log("Removendo item:", itemId);
            await axiosClient.delete(`/item_order/${itemId}`);
          }
        }

        // Após todas as operações de item, atualizar novamente o pedido para garantir
        // que o total esteja correto (opcional, mas pode ser útil para garantir consistência)
        await axiosClient.put(`/orders/${formData.id}`, { 
          ...orderData, 
          total_amount: totalAmount 
        });
      } else {
        // Criar um novo pedido
        // Preparar os itens no formato esperado pelo backend
        const itemsData = selectedItems.map(item => ({
          item_id: item.specific_details.item_id,
          size: item.size,
          quantity: item.quantity,
          special_instructions: item.special_instructions || null
        }));

        // Montar o payload para a API
        const orderData = {
          user_id: formData.user_id, // Este campo é obrigatório para a rota /orders/for-user
          delivery_address: formData.delivery_address,
          contact_phone: formData.contact_phone,
          notes: formData.notes,
          delivery_time: formData.delivery_time,
          payment_method: formData.payment_method,
          items: itemsData
        };

        console.log("Criando novo pedido:", orderData);
        
        // Verificar se o user_id está preenchido para usar a rota correta
        if (formData.user_id) {
          response = await axiosClient.post('/orders/for-user', orderData);
        } else {
          alert("É necessário selecionar um cliente para criar um pedido.");
          setLoading(false);
          return;
        }
        
        console.log("Resposta da criação:", response.data);
      }

      // Atualizar lista de pedidos e fechar modal
      await fetchPedidos();
      closeModal();
      alert(formData.id ? "Pedido atualizado com sucesso!" : "Pedido criado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
      
      // O restante do código de tratamento de erros permanece o mesmo...
    } finally {
      setLoading(false);
      closeModal();
      fetchPedidos();
      fetchItens();
      fetchClientes();
    }
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
          <div className={styles.modal_large}>
            <div className={styles.modal_header}>
              <h2>{formData.id ? "Editar Pedido" : "Novo Pedido"}</h2>
              <button className={styles.close_button} onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.pedido_form}>
              <div className={styles.modal_columns}>
                <div className={styles.left_column}>
                  <div className={styles.column_header}>
                    <h3>Dados do Pedido</h3>
                  </div>
                  
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
                </div>
                
                <div className={styles.right_column}>
                  <div className={styles.column_header}>
                    <h3>Itens do Pedido</h3>
                    {selectedItems.length > 0 && (
                      <div className={styles.cart_total}>
                        <ShoppingCart size={18} />
                        <span>R$ {calculateCartTotal().toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Lista de itens selecionados */}
                  <div className={styles.selected_items_container}>
                    {selectedItems.length > 0 ? (
                      <div className={styles.selected_items_list}>
                        {selectedItems.map((item, index) => (
                          <div key={index} className={styles.selected_item}>
                            <div className={styles.selected_item_header}>
                              <h4>{item.specific_details.name || 'Item'}</h4>
                              <button 
                                type="button" 
                                className={styles.remove_item_button}
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className={styles.selected_item_details}>
                              <div className={styles.item_size_label}>
                                Tamanho: <span>{item.size === 'small' ? 'P' : (item.size === 'medium' ? 'M' : 'G')}</span>
                              </div>
                              <div className={styles.item_price}>
                                R$ {parseFloat(item.unit_price).toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                            <div className={styles.item_quantity_control}>
                              <button 
                                type="button" 
                                className={styles.quantity_button}
                                onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className={styles.quantity_value}>{item.quantity}</span>
                              <button 
                                type="button" 
                                className={styles.quantity_button}
                                onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.item_subtotal}>
                              Subtotal: <span>R$ {(item.quantity * parseFloat(item.unit_price)).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className={styles.item_instructions}>
                              <input
                                type="text"
                                placeholder="Instruções especiais (opcional)"
                                value={item.special_instructions || ''}
                                onChange={(e) => handleSpecialInstructionsChange(index, e.target.value)}
                                className={styles.instructions_input}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.empty_cart}>
                        <ShoppingCart size={48} className={styles.empty_cart_icon} />
                        <p>Nenhum item adicionado ao pedido</p>
                        <p className={styles.empty_cart_help}>Selecione itens abaixo para adicionar ao pedido</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Catálogo de itens disponíveis */}
                  <div className={styles.available_items_section}>
                    <h4 className={styles.available_items_title}>Adicionar Itens</h4>
                    
                    <div className={styles.items_catalog}>
                      {itens && itens.length > 0 ? (
                        itens.map((item) => (
                          <div key={item.id} className={styles.catalog_item}>
                            <div className={styles.catalog_item_header}>
                              <h5>{item.name}</h5>
                              <p className={styles.item_description}>{item.description}</p>
                            </div>
                            <div className={styles.catalog_item_controls}>
                              <div className={styles.catalog_item_sizes}>
                                <select
                                  value={itemSizes[item.id] || 'small'}
                                  onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                  className={styles.size_select}
                                >
                                  <option value="small">Pequeno - R$ {parseFloat(item.price_small).toFixed(2).replace('.', ',')}</option>
                                  <option value="medium">Médio - R$ {parseFloat(item.price_medium).toFixed(2).replace('.', ',')}</option>
                                  <option value="large">Grande - R$ {parseFloat(item.price_large).toFixed(2).replace('.', ',')}</option>
                                </select>
                              </div>
                              <button 
                                type="button" 
                                className={styles.add_catalog_item}
                                onClick={() => handleAddItem(item)}
                              >
                                <Plus size={16} />
                                Adicionar
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={styles.no_items_message}>Nenhum item disponível.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.form_actions}>
                <button 
                  type="button" 
                  className={styles.cancel_button} 
                  onClick={closeModal} 
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.save_button} 
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? "Salvando..." : "Salvar Pedido"}
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
              <div className={styles.detalhes_status_header}>
                <span className={`${styles.status} ${styles.status_badge} ${getStatusClass(selectedPedido.status)}`}>
                  {selectedPedido.status}
                </span>
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
              </div>
              
              <div className={styles.detalhes_grid_container}>
                <div className={styles.detalhes_section}>
                  <h3>
                    <FileText size={18} />
                    Informações do Pedido
                  </h3>
                  <div className={styles.detalhes_grid}>
                    <div>
                      <p className={styles.detail_label}>Cliente:</p>
                      <p className={styles.detail_value}>{selectedPedido.clienteNome}</p>
                    </div>
                    <div>
                      <p className={styles.detail_label}>Data do Pedido:</p>
                      <p className={styles.detail_value}>{new Date(selectedPedido.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className={styles.detail_label}>Valor Total:</p>
                      <p className={styles.detail_value}><strong>R$ {parseFloat(selectedPedido.valor).toFixed(2).replace('.', ',')}</strong></p>
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
                  <h3>
                    <Package size={18} />
                    Dados de Contato
                  </h3>
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
              </div>
              
              <div className={styles.detalhes_section}>
                <h3>
                  <ShoppingCart size={18} />
                  Itens do Pedido
                </h3>
                {selectedPedido.items && selectedPedido.items.length > 0 ? (
                  <div className={styles.itens_container}>
                    <table className={styles.itens_table}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Tamanho</th>
                          <th>Quantidade</th>
                          <th>Preço Unit.</th>
                          <th>Subtotal</th>
                          <th>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPedido.items.map(item => (
                          <tr key={item.id || `item-${Math.random()}`}>
                            <td>{item.item?.name || 'Item não encontrado'}</td>
                            <td className={styles.item_size_cell}>
                              {item.size === 'small' ? 'P' : (item.size === 'medium' ? 'M' : 'G')}
                            </td>
                            <td className={styles.item_qty_cell}>{item.quantity}</td>
                            <td>R$ {parseFloat(item.unit_price || 0).toFixed(2).replace('.', ',')}</td>
                            <td><strong>R$ {parseFloat(item.subtotal || (item.quantity * (item.unit_price || 0))).toFixed(2).replace('.', ',')}</strong></td>
                            <td className={styles.item_notes_cell}>{item.special_instructions || item.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className={styles.total_label}>Total</td>
                          <td colSpan="2" className={styles.total_value}>
                            R$ {parseFloat(selectedPedido.valor || 0).toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className={styles.no_items}>Nenhum item encontrado neste pedido.</p>
                )}
              </div>
              
              {selectedPedido.notes && (
                <div className={styles.detalhes_section}>
                  <h3>Observações</h3>
                  <div className={styles.observacoes_box}>
                    <p className={styles.observacoes_text}>{selectedPedido.notes}</p>
                  </div>
                </div>
              )}
              
              <div className={styles.detalhes_actions}>
                <button 
                  className={styles.invoice_button} 
                  onClick={() => generateInvoicePDF(selectedPedido)}
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