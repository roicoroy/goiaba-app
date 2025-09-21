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
  IonRadioGroup,
  IonRadio,
  IonList,
  IonSpinner,
} from '@ionic/react';
import { add, location } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';
import { useCustomerContext } from '../contexts/CustomerContext';
import { useMedusa } from 'medusa-react';
import { formatAddress } from '../utils/formatters';

interface CheckoutAddressesProps {
  onNext: () => void;
  onPrevious: () => void;
}

const CheckoutAddresses: React.FC<CheckoutAddressesProps> = ({ onNext }) => {
  const { cart } = useCartContext();
  const { customer } = useCustomerContext();
  const { client } = useMedusa();
  
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-select default addresses
    if (customer?.default_shipping_address?.id) {
      setSelectedShippingAddress(customer.default_shipping_address.id);
    }
    if (customer?.billing_address?.id) {
      setSelectedBillingAddress(customer.billing_address.id);
    }
  }, [customer]);

  const handleUpdateCartAddresses = async () => {
    if (!cart?.id || !selectedShippingAddress) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const shippingAddress = customer?.shipping_addresses?.find(addr => addr.id === selectedShippingAddress);
      const billingAddress = selectedBillingAddress 
        ? customer?.shipping_addresses?.find(addr => addr.id === selectedBillingAddress) || customer?.billing_address
        : shippingAddress;
      
      if (!shippingAddress) {
        throw new Error('Please select a shipping address');
      }

      // Helper to create a clean address object for the API
      const cleanAddress = (addr: any) => ({
          first_name: addr.first_name,
          last_name: addr.last_name,
          company: addr.company || null,
          address_1: addr.address_1,
          address_2: addr.address_2 || null,
          city: addr.city,
          country_code: addr.country_code,
          province: addr.province || null,
          postal_code: addr.postal_code,
          phone: addr.phone || null,
      });

      // Update cart with the clean address objects
      await client.carts.update(cart.id, {
        shipping_address: cleanAddress(shippingAddress),
        billing_address: billingAddress ? cleanAddress(billingAddress) : undefined,
      });
      
      onNext();
    } catch (err) {
      console.error('Failed to update cart addresses:', err);
      setError('Failed to update addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedShippingAddress !== '';

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={location} style={{ marginRight: '8px' }} />
            Shipping Address
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {customer?.shipping_addresses && customer.shipping_addresses.length > 0 ? (
            <IonRadioGroup 
              value={selectedShippingAddress} 
              onIonChange={(e) => setSelectedShippingAddress(e.detail.value)}
            >
              <IonList>
                {customer.shipping_addresses.filter(addr => !addr.is_default_billing).map((address) => (
                  <IonItem key={address.id}>
                    <IonRadio slot="start" value={address.id} />
                    <IonLabel>
                      <h3>{address.first_name} {address.last_name}</h3>
                      <p>{formatAddress(address)}</p>
                      {address.phone && <p>{address.phone}</p>}
                      {address.is_default_shipping && (
                        <IonText color="success">
                          <p><small>Default Shipping</small></p>
                        </IonText>
                      )}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonRadioGroup>
          ) : (
            <IonItem>
              <IonLabel>
                <IonText color="medium">No shipping addresses available</IonText>
                <p>Please add a shipping address in your profile</p>
              </IonLabel>
              <IonButton slot="end" fill="outline" routerLink="/tabs/tab2">
                <IonIcon icon={add} slot="start" />
                Add Address
              </IonButton>
            </IonItem>
          )}
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Billing Address</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem>
            <IonRadio 
              slot="start" 
              value="same" 
              checked={selectedBillingAddress === '' || selectedBillingAddress === selectedShippingAddress}
              onIonChange={() => setSelectedBillingAddress('')}
            />
            <IonLabel>
              <h3>Same as shipping address</h3>
            </IonLabel>
          </IonItem>
          
          {customer?.billing_address && (
            <IonItem>
              <IonRadio 
                slot="start" 
                value={customer.billing_address.id} 
                checked={selectedBillingAddress === customer.billing_address.id}
                onIonChange={() => setSelectedBillingAddress(customer.billing_address!.id!)}
              />
              <IonLabel>
                <h3>{customer.billing_address.first_name} {customer.billing_address.last_name}</h3>
                <p>{formatAddress(customer.billing_address)}</p>
                {customer.billing_address.phone && <p>{customer.billing_address.phone}</p>}
              </IonLabel>
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
          onClick={handleUpdateCartAddresses}
          disabled={!canProceed || isLoading}
        >
          {isLoading ? <IonSpinner /> : 'Continue to Shipping'}
        </IonButton>
      </div>
    </>
  );
};

export default CheckoutAddresses;