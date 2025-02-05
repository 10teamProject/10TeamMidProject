import Image from 'next/image';
import Link from 'next/link';

import LoginForm from '@/form/login/LoginForm';
import logo from '@/public/assets/images/biglogo.png';

import styles from './LoginPage.module.scss';

export default function LoginPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.logoContainer}>Pay Plus+</div>
        <LoginForm />
        <Link className={styles.loginLink} href="/signup">
          회원이 아닌가요? 회원가입하기
        </Link>
      </div>
    </div>
  );
}
