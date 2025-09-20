import React from 'react';
import { IonButton, IonIcon, IonBadge } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';

interface CartIconProps {
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
  const { cartItemCount } = useCartContext();

  return (
    <IonButton fill="clear" onClick={onClick}>
      <IonIcon icon={cartOutline} />
      {cartItemCount > 0 && (
        <IonBadge color="danger" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem' }}>
          {cartItemCount}
        </IonBadge>
      )}
    </IonButton>
  );
};

export default CartIcon;