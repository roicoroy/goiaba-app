import React, { useState } from 'react';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSpinner,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';
import { MedusaProductVariant } from '../interfaces/medusa';
import { formatPrice } from '../utils/formatters';

interface AddToCartProps {
  variants: MedusaProductVariant[];
}

const AddToCart: React.FC<AddToCartProps> = ({ variants }) => {
  const { addToCart, isLoading } = useCartContext();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      setToastMessage('Please select a variant');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (quantity < 1) {
      setToastMessage('Quantity must be at least 1');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      await addToCart(selectedVariantId, quantity);
      setToastMessage('Added to cart successfully!');
      setToastColor('success');
      setShowToast(true);
      // Reset form after successful add
      setQuantity(1);
    } catch {
      setToastMessage('Failed to add to cart');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  if (!variants || variants.length === 0) {
    return (
      <IonCard>
        <IonCardContent>
          <IonItem>
            <IonLabel color="medium">No variants available for purchase</IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={cartOutline} style={{ marginRight: '8px' }} />
          Add to Cart
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem>
          <IonLabel>Select Variant</IonLabel>
          <IonSelect
            value={selectedVariantId}
            placeholder="Choose variant"
            onIonChange={(e) => setSelectedVariantId(e.detail.value)}
          >
            {variants.map((variant) => {
              const price = variant.calculated_price;
              return (
                <IonSelectOption key={variant.id} value={variant.id}>
                  {variant.title} - {price ? formatPrice(price.calculated_amount, price.currency_code) : 'Price N/A'}
                </IonSelectOption>
              );
            })}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Quantity</IonLabel>
          <IonInput
            type="number"
            value={quantity}
            min={1}
            max={99}
            onIonInput={(e) => setQuantity(parseInt(e.detail.value!, 10) || 1)}
          />
        </IonItem>

        <div style={{ marginTop: '1rem' }}>
          <IonButton
            expand="block"
            onClick={handleAddToCart}
            disabled={isLoading || !selectedVariantId}
            color="primary"
          >
            {isLoading ? (
              <>
                <IonSpinner slot="start" />
                Adding...
              </>
            ) : (
              <>
                <IonIcon icon={cartOutline} slot="start" />
                Add to Cart
              </>
            )}
          </IonButton>
        </div>
      </IonCardContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={toastColor}
      />
    </IonCard>
  );
};

export default AddToCart;
