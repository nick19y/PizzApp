import { useState } from 'react';
import { Eye, EyeOff, Pizza, User, Mail, Phone, MapPin } from 'lucide-react';
import styles from './CadastroCliente.module.css';

export default function CadastroCliente() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Cadastro:', formData);
    // Aqui você implementaria a lógica de cadastro
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        <div className={styles.signupLayout}>
          {/* Lado do formulário */}
          <div className={styles.formSide}>
            <div className={styles.logoContainer}>
              <Pizza className={styles.logoIcon} />
              <span className={styles.logoText}>PizzaAdmin</span>
            </div>
            
            <h2 className={styles.title}>Cadastro de Cliente</h2>
            
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
                </div>
                
              </div>
            <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirmar senha</label>
                <div className={styles.passwordContainer}>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={styles.passwordInput}
                    placeholder="********"
                    value={formData.confirmPassword}
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
            </div>
              
              <button type="submit" className={styles.submitButton}>
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
              <h3 className={styles.imageTitle}>PizzaAdmin</h3>
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