import { useState, useEffect } from "react";
import { Pizza, PlusCircle, Search, Edit, Trash2, X, Save, Coffee, IceCream, Clock } from "lucide-react";
import styles from "./Cardapio.module.css";
import axiosClient from "../../axios-client";

export default function Cardapio() {
    // Estados para gerenciar o modal e formulário
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("pizzas");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuItems, setMenuItems] = useState([]);  // Initialize as empty array
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        categoria: "pizzas",
        precoP: "",
        precoM: "",
        precoG: "",
        imagem: "",
        disponivel: true,
        destaque: false,
        ingredientes: "",
        tempoEstimado: ""
    });

    // Carregar itens do cardápio da API
    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/items');
            // Ensure response.data is an array
            setMenuItems(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar itens do cardápio:", err);
            setError("Falha ao carregar o cardápio. Por favor, tente novamente.");
            setMenuItems([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Filtragem de itens baseada na categoria e termo de busca
    const filteredItems = Array.isArray(menuItems) ? menuItems.filter(item => {
        return (
            item?.categoria === activeCategory &&
            ((item?.nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (item?.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
        );
    }) : [];

    // Funções para manipulação de dados
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({
            nome: "",
            descricao: "",
            categoria: activeCategory,
            precoP: "",
            precoM: "",
            precoG: "",
            imagem: "",
            disponivel: true,
            destaque: false,
            ingredientes: "",
            tempoEstimado: ""
        });
        setShowModal(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item.id);
        setFormData({
            ...item
        });
        setShowModal(true);
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete || !itemToDelete.id) return;
        
        try {
            await axiosClient.delete(`/items/${itemToDelete.id}`);
            setMenuItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (err) {
            console.error("Erro ao excluir item:", err);
            alert("Não foi possível excluir o item. Por favor, tente novamente.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingItem) {
                // Atualizar item existente
                const response = await axiosClient.put(`/items/${editingItem}`, formData);
                setMenuItems(prevItems => 
                    prevItems.map(item => item.id === editingItem ? response.data : item)
                );
            } else {
                // Adicionar novo item
                const response = await axiosClient.post('/items', formData);
                setMenuItems(prevItems => [...prevItems, response.data]);
            }
            
            setShowModal(false);
        } catch (err) {
            console.error("Erro ao salvar item:", err);
            alert("Não foi possível salvar o item. Por favor, verifique os dados e tente novamente.");
        }
    };

    // Funções específicas de cada categoria
    const handleAddPizza = async (pizzaData) => {
        try {
            await axiosClient.post('/pizzas', pizzaData);
            fetchMenuItems(); // Recarregar todos os itens para ter a lista atualizada
        } catch (err) {
            console.error("Erro ao adicionar pizza:", err);
            throw err;
        }
    };

    const handleAddDrink = async (drinkData) => {
        try {
            await axiosClient.post('/drinks', drinkData);
            fetchMenuItems();
        } catch (err) {
            console.error("Erro ao adicionar bebida:", err);
            throw err;
        }
    };

    const handleAddDessert = async (dessertData) => {
        try {
            await axiosClient.post('/desserts', dessertData);
            fetchMenuItems();
        } catch (err) {
            console.error("Erro ao adicionar sobremesa:", err);
            throw err;
        }
    };

    // Função para determinar qual endpoint específico usar baseado na categoria
    const saveItemByCategory = async (itemData) => {
        try {
            switch (itemData.categoria) {
                case 'pizzas':
                    await handleAddPizza(itemData);
                    break;
                case 'bebidas':
                    await handleAddDrink(itemData);
                    break;
                case 'sobremesas':
                    await handleAddDessert(itemData);
                    break;
                default:
                    throw new Error("Categoria inválida");
            }
        } catch (err) {
            console.error("Erro ao salvar item por categoria:", err);
            throw err;
        }
    };

    // Categorias disponíveis
    const categories = [
        { id: "pizzas", name: "Pizzas", icon: <Pizza /> },
        { id: "bebidas", name: "Bebidas", icon: <Coffee /> },
        { id: "sobremesas", name: "Sobremesas", icon: <IceCream /> }
    ];

    // Exibir estados de carregamento e erro
    if (loading) {
        return (
            <div className={styles.loading_state}>
                <div className={styles.spinner}></div>
                <p>Carregando cardápio...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error_state}>
                <p>{error}</p>
                <button onClick={fetchMenuItems} className={styles.retry_button}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className={styles.cardapio}>
            
            <main className={styles.main}>
                <div className={styles.page_header}>
                    <h1 className={styles.page_title}>Gerenciar Cardápio</h1>
                    <button 
                        className={styles.add_button}
                        onClick={handleAddItem}
                    >
                        <PlusCircle size={20} />
                        <span>Adicionar Item</span>
                    </button>
                </div>
                
                <div className={styles.content_container}>
                    <div className={styles.filters}>
                        <div className={styles.search_container}>
                            <Search className={styles.search_icon} size={20} />
                            <input
                                type="text"
                                placeholder="Buscar no cardápio..."
                                className={styles.search_input}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className={styles.categories}>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`${styles.category_button} ${activeCategory === category.id ? styles.active : ''}`}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    {category.icon}
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className={styles.items_grid}>
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div key={item.id} className={styles.menu_item}>
                                    <div className={styles.item_header}>
                                        <div className={styles.item_image_container}>
                                            <div className={styles.placeholder_image}>
                                                {item.categoria === "pizzas" && <Pizza size={40} />}
                                                {item.categoria === "bebidas" && <Coffee size={40} />}
                                                {item.categoria === "sobremesas" && <IceCream size={40} />}
                                            </div>
                                            {item.destaque && (
                                                <span className={styles.destaque_badge}>Destaque</span>
                                            )}
                                        </div>
                                        <div className={styles.item_status}>
                                            <span className={`${styles.status} ${item.disponivel ? styles.disponivel : styles.indisponivel}`}>
                                                {item.disponivel ? 'Disponível' : 'Indisponível'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.item_content}>
                                        <h3 className={styles.item_name}>{item.nome}</h3>
                                        <p className={styles.item_description}>{item.descricao}</p>
                                        
                                        <div className={styles.item_details}>
                                            {activeCategory === 'pizzas' && (
                                                <div className={styles.item_prices}>
                                                    <span>P: R$ {item.precoP}</span>
                                                    <span>M: R$ {item.precoM}</span>
                                                    <span>G: R$ {item.precoG}</span>
                                                </div>
                                            )}
                                            
                                            {activeCategory !== 'pizzas' && (
                                                <div className={styles.item_prices}>
                                                    {item.precoP && <span>R$ {item.precoP}</span>}
                                                    {item.precoM && <span>R$ {item.precoM}</span>}
                                                    {item.precoG && <span>R$ {item.precoG}</span>}
                                                </div>
                                            )}
                                            
                                            {item.tempoEstimado && (
                                                <div className={styles.item_time}>
                                                    <Clock size={14} />
                                                    <span>{item.tempoEstimado}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.item_actions}>
                                        <button 
                                            className={styles.edit_button}
                                            onClick={() => handleEditItem(item)}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            className={styles.delete_button}
                                            onClick={() => handleDeleteClick(item)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.empty_state}>
                                <Pizza size={50} />
                                <p>Nenhum item encontrado. Tente ajustar os filtros ou adicione um novo item.</p>
                                <button 
                                    className={styles.add_button}
                                    onClick={handleAddItem}
                                >
                                    <PlusCircle size={20} />
                                    <span>Adicionar Item</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            {/* Modal para adicionar/editar item */}
            {showModal && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal}>
                        <div className={styles.modal_header}>
                            <h2>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</h2>
                            <button 
                                className={styles.close_button}
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.form_grid}>
                                <div className={styles.form_group}>
                                    <label htmlFor="nome">Nome do Item*</label>
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
                                    <label htmlFor="categoria">Categoria*</label>
                                    <select
                                        id="categoria"
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="pizzas">Pizzas</option>
                                        <option value="bebidas">Bebidas</option>
                                        <option value="sobremesas">Sobremesas</option>
                                    </select>
                                </div>
                                
                                <div className={styles.form_group}>
                                    <label htmlFor="descricao">Descrição</label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={formData.descricao || ""}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div className={styles.form_group}>
                                    <label htmlFor="ingredientes">Ingredientes</label>
                                    <textarea
                                        id="ingredientes"
                                        name="ingredientes"
                                        value={formData.ingredientes || ""}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Separados por vírgula"
                                    ></textarea>
                                </div>
                                
                                <div className={styles.form_row}>
                                    <div className={styles.form_group}>
                                        <label htmlFor="precoP">
                                            {formData.categoria === 'pizzas' ? 'Preço (P)*' : 'Preço*'}
                                        </label>
                                        <div className={styles.price_input}>
                                            <span>R$</span>
                                            <input
                                                type="number"
                                                id="precoP"
                                                name="precoP"
                                                value={formData.precoP || ""}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    {formData.categoria === 'pizzas' && (
                                        <>
                                            <div className={styles.form_group}>
                                                <label htmlFor="precoM">Preço (M)*</label>
                                                <div className={styles.price_input}>
                                                    <span>R$</span>
                                                    <input
                                                        type="number"
                                                        id="precoM"
                                                        name="precoM"
                                                        value={formData.precoM || ""}
                                                        onChange={handleInputChange}
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className={styles.form_group}>
                                                <label htmlFor="precoG">Preço (G)*</label>
                                                <div className={styles.price_input}>
                                                    <span>R$</span>
                                                    <input
                                                        type="number"
                                                        id="precoG"
                                                        name="precoG"
                                                        value={formData.precoG || ""}
                                                        onChange={handleInputChange}
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div className={styles.form_group}>
                                    <label htmlFor="tempoEstimado">Tempo de Preparo Estimado</label>
                                    <input
                                        type="text"
                                        id="tempoEstimado"
                                        name="tempoEstimado"
                                        value={formData.tempoEstimado || ""}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 30 min"
                                    />
                                </div>
                                
                                <div className={styles.form_group}>
                                    <label htmlFor="imagem">URL da Imagem</label>
                                    <input
                                        type="text"
                                        id="imagem"
                                        name="imagem"
                                        value={formData.imagem || ""}
                                        onChange={handleInputChange}
                                        placeholder="Ex: pizza-portuguesa.jpg"
                                    />
                                </div>
                                
                                <div className={styles.form_checkboxes}>
                                    <div className={styles.checkbox_group}>
                                        <input
                                            type="checkbox"
                                            id="disponivel"
                                            name="disponivel"
                                            checked={formData.disponivel || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="disponivel">Disponível para venda</label>
                                    </div>
                                    
                                    <div className={styles.checkbox_group}>
                                        <input
                                            type="checkbox"
                                            id="destaque"
                                            name="destaque"
                                            checked={formData.destaque || false}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="destaque">Item em destaque</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.form_actions}>
                                <button 
                                    type="button" 
                                    className={styles.cancel_button}
                                    onClick={() => setShowModal(false)}
                                >
                                    <X size={18} />
                                    <span>Cancelar</span>
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.save_button}
                                >
                                    <Save size={18} />
                                    <span>Salvar</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmação de exclusão */}
            {showDeleteModal && itemToDelete && (
                <div className={styles.modal_overlay}>
                    <div className={styles.delete_modal}>
                        <div className={styles.delete_modal_header}>
                            <Trash2 size={24} className={styles.delete_icon} />
                            <h2>Confirmar Exclusão</h2>
                        </div>
                        
                        <div className={styles.delete_modal_content}>
                            <p>Tem certeza que deseja excluir o item <strong>{itemToDelete?.nome}</strong>?</p>
                            <p>Esta ação não pode ser desfeita.</p>
                        </div>
                        
                        <div className={styles.delete_modal_actions}>
                            <button 
                                className={styles.delete_cancel_button}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.delete_confirm_button}
                                onClick={handleDeleteConfirm}
                            >
                                Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}