import { useState } from "react";
import { Pizza, PlusCircle, Search, Edit, Trash2, X, Save, Coffee, IceCream, Clock } from "lucide-react";
import styles from "./Cardapio.module.css";

export default function Cardapio() {
    // Estados para gerenciar o modal e formulário
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("pizzas");
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

    // Dados simulados para o cardápio
    const [menuItems, setMenuItems] = useState([
        {
            id: 1,
            nome: "Portuguesa",
            descricao: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitona e orégano",
            categoria: "pizzas",
            precoP: "39.90",
            precoM: "49.90",
            precoG: "59.90",
            imagem: "portuguesa.jpg",
            disponivel: true,
            destaque: true,
            ingredientes: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitona, orégano",
            tempoEstimado: "30 min"
        },
        {
            id: 2,
            nome: "Calabresa",
            descricao: "Molho de tomate, mussarela, calabresa, cebola, azeitona e orégano",
            categoria: "pizzas",
            precoP: "37.90",
            precoM: "47.90",
            precoG: "57.90",
            imagem: "calabresa.jpg",
            disponivel: true,
            destaque: true,
            ingredientes: "Molho de tomate, mussarela, calabresa, cebola, azeitona, orégano",
            tempoEstimado: "25 min"
        },
        {
            id: 3,
            nome: "Margherita",
            descricao: "Molho de tomate, mussarela, tomate, manjericão fresco e orégano",
            categoria: "pizzas",
            precoP: "36.90",
            precoM: "46.90",
            precoG: "56.90",
            imagem: "margherita.jpg",
            disponivel: true,
            destaque: false,
            ingredientes: "Molho de tomate, mussarela, tomate, manjericão fresco, orégano",
            tempoEstimado: "25 min"
        },
        {
            id: 4,
            nome: "Frango com Catupiry",
            descricao: "Molho de tomate, mussarela, frango desfiado, catupiry, milho e orégano",
            categoria: "pizzas",
            precoP: "41.90",
            precoM: "51.90",
            precoG: "61.90",
            imagem: "frango.jpg",
            disponivel: true,
            destaque: true,
            ingredientes: "Molho de tomate, mussarela, frango desfiado, catupiry, milho, orégano",
            tempoEstimado: "30 min"
        },
        {
            id: 5,
            nome: "Coca-Cola",
            descricao: "Refrigerante Coca-Cola",
            categoria: "bebidas",
            precoP: "5.90",
            precoM: "8.90",
            precoG: "12.90",
            imagem: "coca.jpg",
            disponivel: true,
            destaque: false,
            ingredientes: "",
            tempoEstimado: "5 min"
        },
        {
            id: 6,
            nome: "Suco de Laranja",
            descricao: "Suco natural de laranja",
            categoria: "bebidas",
            precoP: "7.90",
            precoM: "10.90",
            precoG: "14.90",
            imagem: "suco.jpg",
            disponivel: true,
            destaque: false,
            ingredientes: "Laranja",
            tempoEstimado: "10 min"
        },
        {
            id: 7,
            nome: "Petit Gateau",
            descricao: "Petit gateau de chocolate com sorvete de creme",
            categoria: "sobremesas",
            precoP: "16.90",
            precoM: "",
            precoG: "",
            imagem: "petit.jpg",
            disponivel: true,
            destaque: true,
            ingredientes: "Chocolate, sorvete de creme",
            tempoEstimado: "15 min"
        }
    ]);

    // Filtragem de itens baseada na categoria e termo de busca
    const filteredItems = menuItems.filter(item => {
        return (
            item.categoria === activeCategory &&
            (item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    });

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

    const handleDeleteConfirm = () => {
        setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingItem) {
            // Atualizar item existente
            setMenuItems(menuItems.map(item => 
                item.id === editingItem ? { ...formData, id: item.id } : item
            ));
        } else {
            // Adicionar novo item
            const newId = Math.max(...menuItems.map(item => item.id), 0) + 1;
            setMenuItems([...menuItems, { ...formData, id: newId }]);
        }
        
        setShowModal(false);
    };

    // Categorias disponíveis
    const categories = [
        { id: "pizzas", name: "Pizzas", icon: <Pizza /> },
        { id: "bebidas", name: "Bebidas", icon: <Coffee /> },
        { id: "sobremesas", name: "Sobremesas", icon: <IceCream /> }
    ];

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
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div className={styles.form_group}>
                                    <label htmlFor="ingredientes">Ingredientes</label>
                                    <textarea
                                        id="ingredientes"
                                        name="ingredientes"
                                        value={formData.ingredientes}
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
                                                value={formData.precoP}
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
                                                        value={formData.precoM}
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
                                                        value={formData.precoG}
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
                                        value={formData.tempoEstimado}
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
                                        value={formData.imagem}
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
                                            checked={formData.disponivel}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="disponivel">Disponível para venda</label>
                                    </div>
                                    
                                    <div className={styles.checkbox_group}>
                                        <input
                                            type="checkbox"
                                            id="destaque"
                                            name="destaque"
                                            checked={formData.destaque}
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
            {showDeleteModal && (
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