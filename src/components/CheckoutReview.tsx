import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonIcon,
  IonList,
  IonSpinner,
} from '@ionic/react';
import { checkmarkCircle, location, car, card } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';
import { useCheckoutContext } from '../contexts/CheckoutContext';
import { formatPrice, formatAddress } from '../utils/formatters';

interface CheckoutReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

const CheckoutReview: React.FC<CheckoutReviewProps> = ({ onPrevious }) => {
  const { cart } = useCartContext();
  const { selectedShippingMethod, completeOrder } = useCheckoutContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await completeOrder();
      if (!result) {
        throw new Error('Failed to complete order');
      }
      
      // Navigation to confirmation page is handled by CheckoutPage useEffect
    } catch (err: any) {
      console.error('Order completion error:', err);
      setError(err.message || 'Failed to complete order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart) return null;

  return (
    <>
      {/* Order Items */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Order Items</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {cart.items?.map((item) => (
              <IonItem key={item.id}>
                <IonLabel>
                  <h3>{item.title}</h3>
                  <p>{item.variant_title}</p>
                  <p>Qty: {item.quantity} × {formatPrice(item.unit_price, cart.currency_code)}</p>
                </IonLabel>
                <IonLabel slot="end">
                  <h3>{formatPrice(item.unit_price * item.quantity, cart.currency_code)}</h3>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>

      {/* Shipping Address */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={location} style={{ marginRight: '8px' }} />
            Shipping Address
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {cart.shipping_address && (
            <IonItem lines="none">
              <IonLabel>
                <h3>{cart.shipping_address.first_name} {cart.shipping_address.last_name}</h3>
                <p>{formatAddress(cart.shipping_address)}</p>
                {cart.shipping_address.phone && <p>{cart.shipping_address.phone}</p>}
              </IonLabel>
            </IonItem>
          )}
        </IonCardContent>
      </IonCard>

      {/* Shipping Method */}
      {selectedShippingMethod && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={truck} style={{ marginRight: '8px' }} />
              Shipping Method
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <h3>{selectedShippingMethod.name}</h3>
                <p>{formatPrice(selectedShippingMethod.amount, selectedShippingMethod.currency_code)}</p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>
      )}

      {/* Payment Method */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={card} style={{ marginRight: '8px' }} />
            Payment Method
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem lines="none">
            <IonLabel>
              <h3>Credit/Debit Card</h3>
              <p>Payment will be processed securely via Stripe</p>
            </IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      {/* Order Total */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Order Total</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem lines="none">
            <IonLabel>Subtotal</IonLabel>
            <IonLabel slot="end">{formatPrice(cart.subtotal, cart.currency_code)}</IonLabel>
          </IonItem>
          {cart.shipping_total > 0 && (
            <IonItem lines="none">
              <IonLabel>Shipping</IonLabel>
              <IonLabel slot="end">{formatPrice(cart.shipping_total, cart.currency_code)}</IonLabel>
            </IonItem>
          )}
          {cart.tax_total > 0 && (
            <IonItem lines="none">
              <IonLabel>Tax</IonLabel>
              <IonLabel slot="end">{formatPrice(cart.tax_total, cart.currency_code)}</IonLabel>
            </IonItem>
          )}
          {cart.discount_total > 0 && (
            <IonItem lines="none">
              <IonLabel>Discount</IonLabel>
              <IonLabel slot="end" color="success">
                -{formatPrice(cart.discount_total, cart.currency_code)}
              </IonLabel>
            </IonItem>
          )}
          <IonItem lines="none">
            <IonLabel>
              <h2 style={{ color: 'var(--ion-color-primary)' }}>Total</h2>
            </IonLabel>
            <IonLabel slot="end">
              <h2 style={{ color: 'var(--ion-color-primary)' }}>
                {formatPrice(cart.total, cart.currency_code)}
              </h2>
            </IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      {error && (
        <IonCard color="danger">
          <IonCardContent>
            <IonText color="danger">{error}</IonText>
          </IonCardContent>
        </IonCard>
      )}

      <div className="checkout-actions">
        <IonButton 
          expand="block" 
          fill="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Back to Payment
        </IonButton>
        <IonButton 
          expand="block" 
          color="success"
          onClick={handleCompleteOrder}
          disabled={isLoading}
        >
          {isLoading ? <IonSpinner /> : (
            <>
              <IonIcon icon={checkmarkCircle} slot="start" />
              Complete Order
            </>
          )}
        </IonButton>
      </div>
    </>
  );
};

export default CheckoutReview;