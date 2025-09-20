import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
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
  IonToast,
} from '@ionic/react';
import { checkmarkCircle, card, location, truck } from 'ionicons/icons';
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
                  {cart ? formatPrice(cart.total, cart.currency_code) : '$0.00'}
                </h2>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>
        {console.log('🔍 CheckoutPage: Order summary rendered')}

        {/* Current Step Component */}
        {console.log('🔍 CheckoutPage: About to render current step component')}
        {getCurrentStepComponent()}
        {console.log('🔍 CheckoutPage: Current step component rendered')}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
        {console.log('🔍 CheckoutPage: Toast rendered')}
      </IonContent>
      {console.log('🔍 CheckoutPage: Component render complete')}
    </IonPage>
  );
};

export default CheckoutPage;