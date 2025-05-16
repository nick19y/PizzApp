import { useState } from 'react';
import { Pizza, Home, ArrowLeft } from 'lucide-react';
import styles from './NaoEncontrado.module.css';

export default function NaoEncontrado() {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundLayout}>
          {/* Lado do conteúdo principal */}
          <div className={styles.contentSide}>
            <div className={styles.logoContainer}>
              <Pizza className={styles.logoIcon} />
              <span className={styles.logoText}>PizzApp</span>
            </div>
            
            <div className={styles.contentBox}>
              <h1 className={styles.errorCode}>404</h1>
              <h2 className={styles.title}>Página não encontrada</h2>
              <p className={styles.message}>
                A página que você está procurando não existe ou foi movida.
              </p>
              
              <div className={styles.actions}>
                <a href="/" className={styles.primaryButton}>
                  <Home size={18} />
                  <span>Voltar ao início</span>
                </a>
                <button onClick={() => window.history.back()} className={styles.secondaryButton}>
                  <ArrowLeft size={18} />
                  <span>Voltar à página anterior</span>
                </button>
              </div>
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
                Ops! Parece que essa fatia não está no cardápio
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