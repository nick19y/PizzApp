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
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        categoria: "pizzas",
        tamanhos: [], // Array de tamanhos selecionados
        precos: {}, // Objeto com preços por tamanho
        imagem: "",
        disponivel: true,
        destaque: false,
        ingredientes: "",
        tempoEstimado: ""
    });

    // Definição dos tamanhos disponíveis por categoria
    const tamanhosDisponiveis = {
        pizzas: [
            { id: 'P', label: 'Pequena (P)', description: '25cm - 4 fatias' },
            { id: 'M', label: 'Média (M)', description: '30cm - 6 fatias' },
            { id: 'G', label: 'Grande (G)', description: '35cm - 8 fatias' }
        ],
        bebidas: [
            { id: 'P', label: 'Pequena (P)', description: '300ml' },
            { id: 'M', label: 'Média (M)', description: '500ml' },
            { id: 'G', label: 'Grande (G)', description: '1L' }
        ],
        sobremesas: [
            { id: 'P', label: 'Individual', description: 'Porção individual' },
            { id: 'M', label: 'Para dividir', description: 'Serve 2 pessoas' },
            { id: 'G', label: 'Família', description: 'Serve 4 pessoas' }
        ]
    };

    // Mapeamento de categorias da API para categorias do componente
    const categoryMapping = {
        'pizzas': 'pizzas',
        'drinks': 'bebidas',
        'desserts': 'sobremesas'
    };

    // Carregar itens do cardápio da API
    useEffect(() => {
        fetchMenuItems();
    }, []);
    
    useEffect(() => {
        console.log("Itens consultados no menu: ", menuItems)
    }, [menuItems]);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/items');
            
            // Mapear os dados recebidos para o formato esperado pelo componente
            const formattedItems = Array.isArray(response.data) ? response.data.map(item => {
                // Determinar tamanhos disponíveis baseado nos preços
                const tamanhos = [];
                const precos = {};
                
                if (item.price_small) {
                    tamanhos.push('P');
                    precos.P = item.price_small;
                }
                if (item.price_medium) {
                    tamanhos.push('M');
                    precos.M = item.price_medium;
                }
                if (item.price_large) {
                    tamanhos.push('G');
                    precos.G = item.price_large;
                }

                return {
                    id: item.id,
                    nome: item.name,
                    descricao: item.description,
                    categoria: categoryMapping[item.category] || item.category,
                    tamanhos: tamanhos,
                    precos: precos,
                    imagem: item.image,
                    disponivel: item.available,
                    destaque: item.featured,
                    tempoEstimado: item.estimated_time,
                    ingredientes: item.specific_details?.ingredients || item.pizza?.ingredients || ""
                };
            }) : [];
            
            console.log("Itens formatados: ", formattedItems);
            setMenuItems(formattedItems);
            setError(null);
        } catch (err) {
            console.error("Erro ao carregar itens do cardápio:", err);
            setError("Falha ao carregar o cardápio. Por favor, tente novamente.");
            setMenuItems([]);
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

    // Função para lidar com mudança de categoria no formulário
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setFormData({
            ...formData,
            categoria: newCategory,
            tamanhos: [], // Reset tamanhos quando mudar categoria
            precos: {} // Reset preços quando mudar categoria
        });
    };

    // Função para lidar com seleção de tamanhos
    const handleTamanhoChange = (tamanhoId, isChecked) => {
        let newTamanhos = [...formData.tamanhos];
        let newPrecos = {...formData.precos};

        if (isChecked) {
            if (!newTamanhos.includes(tamanhoId)) {
                newTamanhos.push(tamanhoId);
                // Inicializar preço como string vazia
                newPrecos[tamanhoId] = "";
            }
        } else {
            newTamanhos = newTamanhos.filter(t => t !== tamanhoId);
            delete newPrecos[tamanhoId];
        }

        setFormData({
            ...formData,
            tamanhos: newTamanhos,
            precos: newPrecos
        });
    };

    // Função para lidar com mudança de preço
    const handlePrecoChange = (tamanhoId, valor) => {
        setFormData({
            ...formData,
            precos: {
                ...formData.precos,
                [tamanhoId]: valor
            }
        });
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({
            nome: "",
            descricao: "",
            categoria: activeCategory,
            tamanhos: [],
            precos: {},
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
        
        // Validar se pelo menos um tamanho foi selecionado
        if (formData.tamanhos.length === 0) {
            alert("Selecione pelo menos um tamanho para o produto.");
            return;
        }

        // Validar se todos os tamanhos selecionados têm preço
        const precosFaltantes = formData.tamanhos.filter(tamanho => 
            !formData.precos[tamanho] || formData.precos[tamanho] === ""
        );
        if (precosFaltantes.length > 0) {
            alert(`Preencha o preço para os tamanhos: ${precosFaltantes.join(", ")}`);
            return;
        }
        
        try {
            // Mapear dados do formulário para o formato esperado pela API
            const apiCategory = Object.keys(categoryMapping).find(
                key => categoryMapping[key] === formData.categoria
            ) || formData.categoria;
            
            const apiData = {
                name: formData.nome,
                description: formData.descricao,
                category: apiCategory,
                price_small: formData.precos.P || null,
                price_medium: formData.precos.M || null,
                price_large: formData.precos.G || null,
                image: formData.imagem,
                available: formData.disponivel,
                featured: formData.destaque,
                estimated_time: formData.tempoEstimado,
                ingredients: formData.ingredientes
            };
            
            if (editingItem) {
                // Atualizar item existente
                const response = await axiosClient.put(`/items/${editingItem}`, apiData);
                
                // Mapear o item retornado para o formato esperado pelo componente
                const updatedItem = {
                    id: response.data.id,
                    nome: response.data.name,
                    descricao: response.data.description,
                    categoria: categoryMapping[response.data.category] || response.data.category,
                    tamanhos: formData.tamanhos,
                    precos: formData.precos,
                    imagem: response.data.image,
                    disponivel: response.data.available,
                    destaque: response.data.featured,
                    tempoEstimado: response.data.estimated_time,
                    ingredientes: response.data.specific_details?.ingredients || response.data.pizza?.ingredients || ""
                };
                
                setMenuItems(prevItems => 
                    prevItems.map(item => item.id === editingItem ? updatedItem : item)
                );
            } else {
                // Adicionar novo item
                const response = await axiosClient.post('/items', apiData);
                
                // Mapear o item retornado para o formato esperado pelo componente
                const newItem = {
                    id: response.data.id,
                    nome: response.data.name,
                    descricao: response.data.description,
                    categoria: categoryMapping[response.data.category] || response.data.category,
                    tamanhos: formData.tamanhos,
                    precos: formData.precos,
                    imagem: response.data.image,
                    disponivel: response.data.available,
                    destaque: response.data.featured,
                    tempoEstimado: response.data.estimated_time,
                    ingredientes: response.data.specific_details?.ingredients || response.data.pizza?.ingredients || ""
                };
                
                setMenuItems(prevItems => [...prevItems, newItem]);
            }
            
            setShowModal(false);
        } catch (err) {
            console.error("Erro ao salvar item:", err);
            alert("Não foi possível salvar o item. Por favor, verifique os dados e tente novamente.");
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
                                            <div className={styles.item_prices}>
                                                {item.tamanhos && item.tamanhos.map(tamanho => (
                                                    <span key={tamanho}>
                                                        {tamanho}: R$ {item.precos[tamanho]}
                                                    </span>
                                                ))}
                                            </div>
                                            
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
                                        onChange={handleCategoryChange}
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

                                {/* Seção de Tamanhos e Preços */}
                                <div className={styles.form_group_full}>
                                    <label>Tamanhos e Preços*</label>
                                    <div className={styles.tamanhos_container}>
                                        {tamanhosDisponiveis[formData.categoria]?.map(tamanho => (
                                            <div key={tamanho.id} className={styles.tamanho_item}>
                                                <div className={styles.tamanho_header}>
                                                    <input
                                                        type="checkbox"
                                                        id={`tamanho_${tamanho.id}`}
                                                        checked={formData.tamanhos.includes(tamanho.id)}
                                                        onChange={(e) => handleTamanhoChange(tamanho.id, e.target.checked)}
                                                    />
                                                    <label htmlFor={`tamanho_${tamanho.id}`} className={styles.tamanho_label}>
                                                        <strong>{tamanho.label}</strong>
                                                        <span className={styles.tamanho_description}>{tamanho.description}</span>
                                                    </label>
                                                </div>
                                                
                                                {formData.tamanhos.includes(tamanho.id) && (
                                                    <div className={styles.preco_input}>
                                                        <span>R$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            value={formData.precos[tamanho.id] || ""}
                                                            onChange={(e) => handlePrecoChange(tamanho.id, e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
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