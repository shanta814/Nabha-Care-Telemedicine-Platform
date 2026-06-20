import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../styles/Payment.module.css';

export default function Payment() {
  const router = useRouter();
  const amount = useMemo(() => {
    const t = parseFloat(router.query.total);
    return Number.isFinite(t) && t > 0 ? t.toFixed(2) : '0.00';
  }, [router.query.total]);
  const [qrSrc, setQrSrc] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const vpa = 'devsharma@ybl';
    const name = 'Dev Sharma';
    const note = 'NabhaCare Order';
    const upi = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    QRCode.toDataURL(upi, { width: 220, margin: 1 }).then(setQrSrc).catch(() => setQrSrc(''));
  }, [amount]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Complete Payment</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoHeader}>
          <span className={styles.logoText}>t</span>
          <h2>PhonePe</h2>
        </div>
        <p className={styles.accepted}>ACCEPTED HERE</p>
        <p className={styles.scanText}>Scan & Pay Using PhonePe App</p>
        <div className={styles.qrCode}>
          {qrSrc ? <img src={qrSrc} alt="UPI QR" className={styles.qrImg} /> : <span className={styles.loading}>Loading...</span>}
        </div>
        <p className={styles.merchantName}>Dev Sharma</p>
        <div className={styles.checkoutAction}>
          <p className={styles.totalAmount}>Total: ₹{amount}</p>
          <button
            className={styles.confirmButton}
            onClick={() => setOrderPlaced(true)}
            disabled={orderPlaced}
          >
            {orderPlaced ? 'Order Placed' : 'Confirm Payment & Place Order'}
          </button>
          {orderPlaced && (
            <div className={styles.successTick}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="#4caf50"/>
                <polyline points="14,26 22,34 34,18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>Order placed successfully!</div>
            </div>
          )}
        </div>
      </main>
      <footer className={styles.footer}>© 2025, All rights reserved, PhonePe Ltd (Formerly known as 'PhonePe Private Ltd')</footer>
    </div>
  );
}
