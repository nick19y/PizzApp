// Login.jsx
import { useState } from 'react';
import { Eye, EyeOff, Pizza } from 'lucide-react';
import styles from './Login.module.css';
import axiosClient from '../../axios-client';
import { useStateContext } from '../../contexts/ContextProvider';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setUser, setToken} = useStateContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post('/login', {
        email: email,
        password: password,
      });

      console.log("Resposta do login: ", response);

      if (response && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);

        // Limpa os campos se quiser
        setEmail('');
        setPassword('');
      } else {
        alert("Erro inesperado: resposta da API inválida.");
      }

    } catch (error) {
      console.error("Erro ao fazer login:", error);

      if (error.response) {
        if (error.response.status === 422 && error.response.data.message) {
          alert(`Erro: ${error.response.data.message}`);
        } else {
          alert(`Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.request) {
        alert("Erro de conexão: o servidor não respondeu.");
      } else {
        alert(`Erro desconhecido: ${error.message}`);
      }
    }
  };


  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginLayout}>
          {/* Lado do formulário */}
          <div className={styles.formSide}>
            <div className={styles.logoContainer}>
              <Pizza className={styles.logoIcon} />
              <span className={styles.logoText}>PizzApp</span>
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
              <h3 className={styles.imageTitle}>PizzApp</h3>
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