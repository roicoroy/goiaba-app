import React, { useState, useEffect } from 'react';
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
  IonSpinner,
} from '@ionic/react';
import { card } from 'ionicons/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartContext } from '../contexts/CartContext';
import { useCheckoutContext } from '../contexts/CheckoutContext';
import { useMedusa } from 'medusa-react';

import { API_CONFIG } from '../utils/constants';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(API_CONFIG.STRIPE_PUBLISHABLE_KEY);

interface CheckoutPaymentProps {
  onNext: () => void;
  onPrevious: () => void;
}

const PaymentForm: React.FC<CheckoutPaymentProps> = ({ onNext, onPrevious }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCartContext();
  const { 
    paymentSessions, 
    selectedPaymentSession,
    initializePaymentSessions 
  } = useCheckoutContext();
  const { client } = useMedusa();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePaymentSessions();
  }, []);

  const handlePayment = async () => {
    if (!stripe || !elements || !cart?.id || !selectedPaymentSession) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Update payment session with payment method
      await client.carts.updatePaymentSession(cart.id, selectedPaymentSession.provider_id, {
        data: {
          payment_method_id: paymentMethod.id,
        },
      });

      // Select the payment session
      await client.carts.setPaymentSession(cart.id, {
        provider_id: selectedPaymentSession.provider_id,
      });

      onNext();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={card} style={{ marginRight: '8px' }} />
            Payment Information
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {selectedPaymentSession ? (
            <div>
              <IonItem lines="none">
                <IonLabel>
                  <h3>Payment Method</h3>
                  <p>Credit/Debit Card via Stripe</p>
                </IonLabel>
              </IonItem>
              
              <div style={{ 
                padding: '1rem', 
                border: '1px solid var(--ion-color-light)', 
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <CardElement options={cardElementOptions} />
              </div>
              
              <IonText color="medium">
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Your payment information is secure and encrypted.
                </p>
              </IonText>
            </div>
          ) : (
            <IonItem>
              <IonLabel>
                <IonText color="medium">Loading payment methods...</IonText>
              </IonLabel>
              <IonSpinner slot="end" />
            </IonItem>
          )}
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
          Back to Shipping
        </IonButton>
        <IonButton 
          expand="block" 
          onClick={handlePayment}
          disabled={!stripe || !selectedPaymentSession || isLoading}
        >
          {isLoading ? <IonSpinner /> : 'Continue to Review'}
        </IonButton>
      </div>
    </>
  );
};

const CheckoutPayment: React.FC<CheckoutPaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default CheckoutPayment;