import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonProgressBar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { checkmarkCircle, card, location } from 'ionicons/icons';
import { car } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { useCustomerContext } from '../contexts/CustomerContext';
import { useCheckoutContext } from '../contexts/CheckoutContext';
import CheckoutAddresses from '../components/CheckoutAddresses';
import CheckoutShipping from '../components/CheckoutShipping';
import CheckoutPayment from '../components/CheckoutPayment';
import CheckoutReview from '../components/CheckoutReview';
import { formatPrice } from '../utils/formatters';
import './CheckoutPage.css';
import { useMedusa } from 'medusa-react';


const CheckoutPage: React.FC = () => {
  console.log('🚀 CheckoutPage: Component function called');
  
  const history = useHistory();
  console.log('🔍 CheckoutPage: History hook initialized');
  
  const { cart } = useCartContext();
  console.log('🔍 CheckoutPage: Cart context:', { hasCart: !!cart, cartId: cart?.id });
  
  const { customer } = useCustomerContext();
  console.log('🔍 CheckoutPage: Customer context:', { hasCustomer: !!customer, customerId: customer?.id });
  
  const { currentStep, setCurrentStep, completedOrder } = useCheckoutContext();
  console.log('🔍 CheckoutPage: Checkout context:', { currentStep, hasCompletedOrder: !!completedOrder });
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  console.log('🔍 CheckoutPage: State initialized');

  const steps = [
    { title: 'Addresses', icon: location, component: CheckoutAddresses },
    { title: 'Shipping', icon: car, component: CheckoutShipping },
    { title: 'Payment', icon: card, component: CheckoutPayment },
    { title: 'Review', icon: checkmarkCircle, component: CheckoutReview },
  ];
  console.log('🔍 CheckoutPage: Steps defined');

  const { client } = useMedusa();

  useEffect(() => {
    const updateCartWithCustomer = async () => {
      if (customer && cart && client) {
        try {
          const updatePayload: any = {
            customer_id: customer.id,
            email: customer.email,
          };

          // Only add addresses if they exist and have required fields
          if (customer.shipping_addresses && customer.shipping_addresses.length > 0) {
            const shippingAddress = customer.shipping_addresses[0];
            if (shippingAddress.first_name && shippingAddress.last_name && shippingAddress.address_1) {
             // Validate country code - if it's inconsistent with location data, skip the address
             const isBrazilianLocation = shippingAddress.city === "Belo Horizonte" || shippingAddress.province === "MG";
             const isDenmarkCode = shippingAddress.country_code === "dk";
             
             if (isBrazilianLocation && isDenmarkCode) {
               console.warn("Skipping address with inconsistent country code (dk) for Brazilian location");
             } else {
              updatePayload.shipping_address = {
                first_name: shippingAddress.first_name,
                last_name: shippingAddress.last_name,
                company: shippingAddress.company || null,
                address_1: shippingAddress.address_1,
                address_2: shippingAddress.address_2 || null,
                city: shippingAddress.city,
                country_code: shippingAddress.country_code,
                province: shippingAddress.province || null,
                postal_code: shippingAddress.postal_code,
                phone: shippingAddress.phone || null,
              };
             }
            }
          }

          if (customer.billing_address && customer.billing_address.first_name && customer.billing_address.last_name) {
           // Validate country code for billing address too
           const isBrazilianLocation = customer.billing_address.city === "Belo Horizonte" || customer.billing_address.province === "MG";
           const isDenmarkCode = customer.billing_address.country_code === "dk";
           
           if (isBrazilianLocation && isDenmarkCode) {
             console.warn("Skipping billing address with inconsistent country code (dk) for Brazilian location");
           } else {
            updatePayload.billing_address = {
              first_name: customer.billing_address.first_name,
              last_name: customer.billing_address.last_name,
              company: customer.billing_address.company || null,
              address_1: customer.billing_address.address_1,
              address_2: customer.billing_address.address_2 || null,
              city: customer.billing_address.city,
              country_code: customer.billing_address.country_code,
              province: customer.billing_address.province || null,
              postal_code: customer.billing_address.postal_code,
              phone: customer.billing_address.phone || null,
            };
           }
          }

          await client.carts.update(cart.id, updatePayload);

        } catch (error) {
          console.error("Failed to update cart with customer data", error);
        }
      }
    };

    updateCartWithCustomer();
  }, [customer, cart, client]);

  // Handle order completion navigation
  useEffect(() => {
    console.log('🔍 CheckoutPage: Order completion useEffect triggered', { hasCompletedOrder: !!completedOrder });
    if (completedOrder) {
      console.log('🔍 CheckoutPage: Navigating to order confirmation');
      history.push(`/tabs/order-confirmation/${completedOrder.id}`);
    }
  }, [completedOrder, history]);

  useEffect(() => {
    console.log('🔍 CheckoutPage: Main useEffect triggered');
    console.log('CheckoutPage mounted');
    console.log('Cart:', cart);
    console.log('Customer:', customer);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('No cart items, redirecting to products');
      // For now, let's not redirect to allow testing
      // history.push('/tabs/tab1');
    }
    console.log('🔍 CheckoutPage: Main useEffect completed');
  }, [cart, customer, history]);

  const handleNextStep = () => {
    console.log('🔍 CheckoutPage: handleNextStep called', { currentStep, maxStep: steps.length - 1 });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    console.log('🔍 CheckoutPage: handlePreviousStep called', { currentStep });
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    console.log('🔍 CheckoutPage: getCurrentStepComponent called', { currentStep, stepTitle: steps[currentStep]?.title });
    const StepComponent = steps[currentStep].component;
    console.log('🔍 CheckoutPage: About to render step component:', steps[currentStep]?.title);
    return <StepComponent onNext={handleNextStep} onPrevious={handlePreviousStep} />;
  };

  console.log('🔍 CheckoutPage: About to check loading conditions');
  
  // Show loading if contexts are not ready
  if (!cart && !customer) {
    console.log('🔍 CheckoutPage: Rendering loading state - no cart and no customer');
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/tab1" />
            </IonButtons>
            <IonTitle>Checkout</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonSpinner />
            <IonText style={{ marginLeft: '1rem' }}>Loading checkout...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!cart) {
    console.log('🔍 CheckoutPage: Rendering no cart state');
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/tab1" />
            </IonButtons>
            <IonTitle>Checkout</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonText>
              <h2>No items in cart</h2>
              <p>Add some items to your cart before checking out.</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  console.log('🔍 CheckoutPage: About to render main checkout page');
  
  return (
    <IonPage>
      {console.log('🔍 CheckoutPage: Starting main JSX render')}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        {console.log('🔍 CheckoutPage: Rendering IonContent')}
        {/* Progress Bar */}
        <IonProgressBar 
          value={(currentStep + 1) / steps.length} 
          color="primary"
        />
        {console.log('🔍 CheckoutPage: Progress bar rendered')}
        
        {/* Step Indicator */}
        <IonCard className="step-indicator">
          <IonCardContent>
            <div className="steps-container">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                >
                  <div className="step-icon">
                    <IonIcon icon={step.icon} />
                  </div>
                  <IonText>
                    <p className="step-title">{step.title}</p>
                  </IonText>
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>
        {console.log('🔍 CheckoutPage: Step indicator rendered')}

        {/* Order Summary */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Order Summary</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <h3>Items ({cart?.items?.length || 0})</h3>
                <p>Subtotal: {cart ? formatPrice(cart.subtotal, cart.currency_code) : '$0.00'}</p>
                {cart && cart.shipping_total > 0 && (
                  <p>Shipping: {formatPrice(cart.shipping_total, cart.currency_code)}</p>
                )}
                {cart && cart.tax_total > 0 && (
                  <p>Tax: {formatPrice(cart.tax_total, cart.currency_code)}</p>
                )}
              </IonLabel>
              <IonLabel slot="end">
                <h2 style={{ color: 'var(--ion-color-primary)' }}>
                  {cart ? formatPrice(cart.total, cart.currency_code) : ''}
                </h2>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Step Content */}
        <div className="step-content">
          {getCurrentStepComponent()}
        </div>
        {console.log('🔍 CheckoutPage: Step content rendered')}
        
      </IonContent>
    </IonPage>
  );
};

export default CheckoutPage;