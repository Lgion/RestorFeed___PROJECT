import React from 'react';
import styles from '../assets/bem/components/orderTimestamp.module.scss';

const OrderTimestampLegend = ({ show = false }) => {
  if (!show) return null;

  const legendItems = [
    { color: 'green', label: '0-2 min', description: 'Très récent' },
    { color: 'yellow', label: '2-5 min', description: 'Récent' },
    { color: 'blue', label: '5-10 min', description: 'Commence à dater' },
    { color: 'orange', label: '10-20 min', description: 'Prend du temps' },
    { color: 'red', label: '20+ min', description: 'Très ancien' }
  ];

  return (
    <div className={styles.colorLegend}>
      <strong style={{ fontSize: '12px', marginRight: '8px' }}>Âge des commandes:</strong>
      {legendItems.map((item, index) => (
        <div key={index} className={styles.colorLegend__item}>
          <div className={`${styles.colorLegend__item__dot} ${styles[item.color]}`}></div>
          <span title={item.description}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderTimestampLegend;
