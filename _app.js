import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import '../styles/Home.module.css';
import { CartProvider } from '../context/CartContext';

function MyApp({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default appWithTranslation(MyApp);
