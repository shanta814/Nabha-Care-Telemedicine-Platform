import { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Cart.module.css';
import CartContext from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);
  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    router.push({
      pathname: '/payment',
      query: { total: total.toFixed(2) },
    });
  };

  return (
    <div className={styles.container}>
      <Head><title>Your Cart</title></Head>
      <main className={styles.main}>
        <h1>Your Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <Link href="/pharmacy" legacyBehavior><a>Continue Shopping</a></Link>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <h2>{item.name}</h2>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <p>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <h2>Total: ₹{total.toFixed(2)}</h2>
              <button onClick={handleCheckout} disabled={total === 0}>Proceed to Payment</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
