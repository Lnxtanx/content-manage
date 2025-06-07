import styles from './Footer.module.css';
import { FaHeart, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.mainText}>
          Built with <FaHeart className={styles.heartIcon} /> by Vivek
        </div>
        <div className={styles.subText}>
          © 2025 School Management Portal
        </div>
        <div className={styles.socialLinks}>
          <a href="https://github.com/Lnxtanx" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/vivek-kumar1387" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
}
