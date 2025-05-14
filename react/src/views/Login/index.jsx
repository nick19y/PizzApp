// Login.jsx
import { useState } from 'react';
import { Eye, EyeOff, Pizza } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginLayout}>
          {/* Lado do formulário */}
          <div className={styles.formSide}>
            <div className={styles.logoContainer}>
              <Pizza className={styles.logoIcon} />
              <span className={styles.logoText}>PizzaAdmin</span>
            </div>
            
            <h2 className={styles.title}>Bem-vindo de volta!</h2>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Senha</label>
                <div className={styles.passwordContainer}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={styles.passwordInput}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <a href="#" className={styles.forgotPassword}>Esqueceu a senha?</a>
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Entrar
              </button>
            </form>
            
            <div className={styles.footer}>
              Não tem uma conta ainda? <a href="cadastro_admin">Cadastre-se!</a>
            </div>
            <div className={styles.footer}>
              Sistema de Administração de Pizzaria © 2025
            </div>
          </div>
          
          {/* Lado da imagem/decoração */}
          <div className={styles.imageSide}>
            <div className={styles.imageContent}>
              <h3 className={styles.imageTitle}>PizzaAdmin</h3>
              <p className={styles.imageText}>
                Gerencie seus pedidos, clientes e inventário de forma eficiente
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