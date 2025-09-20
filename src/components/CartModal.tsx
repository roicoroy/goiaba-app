import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonInput,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { close, trash, add, remove } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';
import { MedusaCartItem } from '../interfaces/medusa';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, isLoading, updateCartItem, removeFromCart } = useCartContext();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Shopping Cart</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {isLoading && (
          <LoadingSpinner message="Updating cart..." />
        )}

        {!isLoading && (!cart || !cart.items || cart.items.length === 0) && (
          <EmptyState
            icon={close}
            title="Your cart is empty"
            description="Add some products to get started shopping!"
            actionText="Continue Shopping"
            onAction={onClose}
          />
        )}

        {!isLoading && cart && cart.items && cart.items.length > 0 && (
          <>
            <IonList>
              {cart.items.map((item: MedusaCartItem) => (
                <IonItemSliding key={item.id}>
                  <IonItem>
                    <IonLabel>
                      <h2>{item.title}</h2>
                      <h3>{item.variant_title}</h3>
                      <p>Unit Price: {formatPrice(item.unit_price, cart.currency_code)}</p>
                      <p>Total: {formatPrice(item.unit_price * item.quantity, cart.currency_code)}</p>
                    </IonLabel>
                    
                    <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <IonIcon icon={remove} />
                      </IonButton>
                      
                      <IonInput
                        type="number"
                        value={item.quantity}
                        min={1}
                        style={{ width: '60px', textAlign: 'center' }}
                        onIonBlur={(e) => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                          const newQuantity = parseInt(e.detail.value!, 10);
                          if (newQuantity && newQuantity !== item.quantity) {
                            handleQuantityChange(item.id, newQuantity);
                          }
                        }}
                      />
                      
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <IonIcon icon={add} />
                      </IonButton>
                    </div>
                  </IonItem>
                  
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => handleRemoveItem(item.id)}>
                      <IonIcon icon={trash} />
                      Remove
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>

            <IonCard>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Subtotal: {formatPrice(cart.subtotal, cart.currency_code)}</h3>
                    {cart.tax_total > 0 && (
                      <p>Tax: {formatPrice(cart.tax_total, cart.currency_code)}</p>
                    )}
                    {cart.discount_total > 0 && (
                      <p style={{ color: 'var(--ion-color-success)' }}>
                        Discount: -{formatPrice(cart.discount_total, cart.currency_code)}
                      </p>
                    )}
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>
                    <h2 style={{ color: 'var(--ion-color-primary)' }}>
                      Total: {formatPrice(cart.total, cart.currency_code)}
                    </h2>
                  </IonLabel>
                </IonItem>
                
                <IonButton 
                  expand="block" 
                  color="primary" 
                  size="large"
                  style={{ marginTop: '1rem' }}
                  routerLink="/checkout"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};

export default CartModal;