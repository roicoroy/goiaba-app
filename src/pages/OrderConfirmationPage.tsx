import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  IonSpinner,
} from '@ionic/react';
import { checkmarkCircle, home, receipt } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useMedusa } from 'medusa-react';
import { formatPrice, formatAddress } from '../utils/formatters';

interface OrderConfirmationParams {
  orderId: string;
}

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<OrderConfirmationParams>();
  const history = useHistory();
  const { client } = useMedusa();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await client.orders.retrieve(orderId);
        setOrder(response.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, client]);

  const handleContinueShopping = () => {
    history.push('/tabs/tab1');
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Order Confirmation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Order Confirmation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard color="danger">
            <IonCardContent>
              <IonText color="danger">
                {error || 'Order not found'}
              </IonText>
            </IonCardContent>
          </IonCard>
          <div style={{ padding: '1rem' }}>
            <IonButton expand="block" onClick={handleContinueShopping}>
              <IonIcon icon={home} slot="start" />
              Continue Shopping
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Order Confirmation</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {/* Success Message */}
        <IonCard color="success">
          <IonCardContent style={{ textAlign: 'center' }}>
            <IonIcon 
              icon={checkmarkCircle} 
              style={{ fontSize: '4rem', marginBottom: '1rem' }}
            />
            <IonText color="success">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your purchase. Your order has been successfully placed.</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Order Details */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={receipt} style={{ marginRight: '8px' }} />
              Order Details
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <h3>Order Number</h3>
                <p>{order.display_id}</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <h3>Order Date</h3>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <h3>Status</h3>
                <p style={{ textTransform: 'capitalize' }}>{order.status}</p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Order Items */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Items Ordered</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {order.items?.map((item: any) => (
                <IonItem key={item.id}>
                  <IonLabel>
                    <h3>{item.title}</h3>
                    <p>{item.variant?.title}</p>
                    <p>Qty: {item.quantity} × {formatPrice(item.unit_price, order.currency_code)}</p>
                  </IonLabel>
                  <IonLabel slot="end">
                    <h3>{formatPrice(item.total, order.currency_code)}</h3>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Shipping Address */}
        {order.shipping_address && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Shipping Address</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonLabel>
                  <h3>{order.shipping_address.first_name} {order.shipping_address.last_name}</h3>
                  <p>{formatAddress(order.shipping_address)}</p>
                  {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>
        )}

        {/* Order Total */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Order Summary</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>Subtotal</IonLabel>
              <IonLabel slot="end">{formatPrice(order.subtotal, order.currency_code)}</IonLabel>
            </IonItem>
            {order.shipping_total > 0 && (
              <IonItem lines="none">
                <IonLabel>Shipping</IonLabel>
                <IonLabel slot="end">{formatPrice(order.shipping_total, order.currency_code)}</IonLabel>
              </IonItem>
            )}
            {order.tax_total > 0 && (
              <IonItem lines="none">
                <IonLabel>Tax</IonLabel>
                <IonLabel slot="end">{formatPrice(order.tax_total, order.currency_code)}</IonLabel>
              </IonItem>
            )}
            <IonItem lines="none">
              <IonLabel>
                <h2 style={{ color: 'var(--ion-color-primary)' }}>Total</h2>
              </IonLabel>
              <IonLabel slot="end">
                <h2 style={{ color: 'var(--ion-color-primary)' }}>
                  {formatPrice(order.total, order.currency_code)}
                </h2>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Actions */}
        <div style={{ padding: '1rem' }}>
          <IonButton expand="block" onClick={handleContinueShopping}>
            <IonIcon icon={home} slot="start" />
            Continue Shopping
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderConfirmationPage;