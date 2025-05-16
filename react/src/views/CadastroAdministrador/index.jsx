import { useState } from 'react';
import { Eye, EyeOff, Pizza, User, Mail, Phone, MapPin, Check, X } from 'lucide-react';
import styles from './CadastroAdmin.module.css';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';

export default function CadastroAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
    role: 'admin'
  });
  const {setUser, setToken} = useStateContext();
  
  // Estado para controlar a validação da senha
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Verificar requisitos de senha
  const passwordHasMinLength = formData.password.length >= 8;
  const passwordHasLetters = /[a-zA-Z]/.test(formData.password);
  const passwordHasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const response = await axiosClient.post('/signup', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
      });

      console.log("Resposta da api: ", response);

      // Check if response exists and has data
      if (response && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);

        console.log('Cadastro realizado:', response.data);
        alert("Usuário cadastrado com sucesso!");

        // Limpa os campos
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          password_confirmation: '',
          role: 'admin',
        });
      } else {
        console.error('Resposta da API inválida:', response);
        alert("Erro ao cadastrar usuário. Resposta da API inválida.");
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      // Verificar se existe error.response antes de acessar suas propriedades
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.log('Erro do servidor:', error.response.data);
        
        // Mostrar detalhes específicos de validação para erros 422
        if (error.response.status === 422 && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          let errorMessage = "Erros de validação:\n";
          
          for (const field in validationErrors) {
            errorMessage += `- ${field}: ${validationErrors[field].join(', ')}\n`;
          }
          
          alert(errorMessage);
        } else {
          alert(`Erro ao cadastrar: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.log('Sem resposta:', error.request);
        alert("Erro de conexão: Não foi possível conectar ao servidor.");
      } else {
        // Algo aconteceu na configuração da requisição
        alert(`Erro: ${error.message}`);
      }
    }
  };

  // Estilo para os indicadores de requisitos de senha
  const requirementStyle = (met) => ({
    display: 'flex',
    alignItems: 'center',
    color: met ? 'green' : 'red',
    marginBottom: '4px',
    fontSize: '0.85rem'
  });

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        <div className={styles.signupLayout}>
          {/* Lado do formulário */}
          <div className={styles.formSide}>
            <div className={styles.logoContainer}>
              <Pizza className={styles.logoIcon} />
              <span className={styles.logoText}>PizzApp</span>
            </div>
            
            <h2 className={styles.title}>Cadastro de Usuário</h2>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Nome completo</label>
                <div className={styles.inputWithIcon}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={styles.input}
                    placeholder="Maria Silva"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <div className={styles.inputWithIcon}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.input_email_phone}
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.label}>Telefone</label>
                  <div className={styles.inputWithIcon}>
                    <Phone size={18} className={styles.inputIcon} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={styles.input_email_phone}
                      placeholder="(11) 98765-4321"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="address" className={styles.label}>Endereço</label>
                <div className={styles.inputWithIcon}>
                  <MapPin size={18} className={styles.inputIcon} />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className={styles.input}
                    placeholder="Rua, número, bairro"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>Senha</label>
                  <div className={styles.passwordContainer}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={styles.passwordInput}
                      placeholder="********"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Mostrar requisitos de senha quando o campo estiver focado ou preenchido */}
                  {(passwordFocused || formData.password.length > 0) && (
                    <div className={styles.passwordRequirements}>
                      <div style={requirementStyle(passwordHasMinLength)}>
                        {passwordHasMinLength ? <Check size={16} /> : <X size={16} />}
                        <span style={{ marginLeft: '5px' }}>Mínimo 8 caracteres</span>
                      </div>
                      <div style={requirementStyle(passwordHasLetters)}>
                        {passwordHasLetters ? <Check size={16} /> : <X size={16} />}
                        <span style={{ marginLeft: '5px' }}>Incluir letras</span>
                      </div>
                      <div style={requirementStyle(passwordHasSymbols)}>
                        {passwordHasSymbols ? <Check size={16} /> : <X size={16} />}
                        <span style={{ marginLeft: '5px' }}>Incluir símbolos (ex: @, #, $)</span>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            <div className={styles.inputGroup}>
                <label htmlFor="password_confirmation" className={styles.label}>Confirmar senha</label>
                <div className={styles.passwordContainer}>
                <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    className={styles.passwordInput}
                    placeholder="********"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>
                {/* Mostrar mensagem se as senhas não combinam */}
                {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                  <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '5px' }}>
                    <X size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    As senhas não coincidem
                  </div>
                )}
            </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={!passwordHasMinLength || !passwordHasLetters || !passwordHasSymbols || formData.password !== formData.password_confirmation}
              >
                Cadastrar
              </button>
              
              <div className={styles.loginLink}>
                Já possui uma conta? <a href="/login">Faça login</a>
              </div>
            </form>
            
            <div className={styles.footer}>
              Sistema de Administração de Pizzaria © 2025
            </div>
          </div>
          
          {/* Lado da imagem/decoração */}
          <div className={styles.imageSide}>
            <div className={styles.imageContent}>
              <h3 className={styles.imageTitle}>PizzApp</h3>
              <p className={styles.imageText}>
                Cadastre-se para fazer pedidos e acompanhar suas entregas
              </p>
              
              <div className={styles.decorationContainer}>
                <div className={styles.decorationCircle1}></div>
                <div className={styles.decorationCircle2}></div>
                <Pizza size={80} className={styles.decorationIcon} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}