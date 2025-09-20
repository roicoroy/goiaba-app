import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useRegionContext } from '../contexts/RegionContext';

interface Address {
  id?: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  country_code: string;
  province?: string;
  postal_code: string;
  phone?: string;
}

interface AddressFormProps {
  address?: Address;
  onSave: (address: Omit<Address, 'id'>) => Promise<void>;
  onCancel: () => void;
  title: string;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  address, 
  onSave, 
  onCancel, 
  title, 
  isLoading = false 
}) => {
  const { regions } = useRegionContext();
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    country_code: '',
    province: '',
    postal_code: '',
    phone: '',
  });

  useEffect(() => {
    if (address) {
      setFormData({
        first_name: address.first_name || '',
        last_name: address.last_name || '',
        company: address.company || '',
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        country_code: address.country_code || '',
        province: address.province || '',
        postal_code: address.postal_code || '',
        phone: address.phone || '',
      });
    }
  }, [address]);

  const handleInputChange = (field: keyof Omit<Address, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.address_1 || 
        !formData.city || !formData.country_code || !formData.postal_code) {
      return;
    }

    await onSave(formData);
  };

  const getCountryOptions = () => {
    const countries = new Set<string>();
    regions.forEach(region => {
      region.countries?.forEach(country => {
        countries.add(`${country.iso_2}|${country.name}`);
      });
    });
    return Array.from(countries).map(country => {
      const [code, name] = country.split('|');
      return { code, name };
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem>
          <IonLabel position="stacked">First Name *</IonLabel>
          <IonInput
            value={formData.first_name}
            onIonInput={(e) => handleInputChange('first_name', e.detail.value!)}
            placeholder="Enter first name"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Last Name *</IonLabel>
          <IonInput
            value={formData.last_name}
            onIonInput={(e) => handleInputChange('last_name', e.detail.value!)}
            placeholder="Enter last name"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Company</IonLabel>
          <IonInput
            value={formData.company}
            onIonInput={(e) => handleInputChange('company', e.detail.value!)}
            placeholder="Enter company name"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Address Line 1 *</IonLabel>
          <IonInput
            value={formData.address_1}
            onIonInput={(e) => handleInputChange('address_1', e.detail.value!)}
            placeholder="Enter street address"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Address Line 2</IonLabel>
          <IonInput
            value={formData.address_2}
            onIonInput={(e) => handleInputChange('address_2', e.detail.value!)}
            placeholder="Apartment, suite, etc."
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">City *</IonLabel>
          <IonInput
            value={formData.city}
            onIonInput={(e) => handleInputChange('city', e.detail.value!)}
            placeholder="Enter city"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Country *</IonLabel>
          <IonSelect
            value={formData.country_code}
            placeholder="Select country"
            onIonChange={(e) => handleInputChange('country_code', e.detail.value)}
          >
            {getCountryOptions().map(country => (
              <IonSelectOption key={country.code} value={country.code}>
                {country.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">State/Province</IonLabel>
          <IonInput
            value={formData.province}
            onIonInput={(e) => handleInputChange('province', e.detail.value!)}
            placeholder="Enter state or province"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Postal Code *</IonLabel>
          <IonInput
            value={formData.postal_code}
            onIonInput={(e) => handleInputChange('postal_code', e.detail.value!)}
            placeholder="Enter postal code"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Phone</IonLabel>
          <IonInput
            value={formData.phone}
            onIonInput={(e) => handleInputChange('phone', e.detail.value!)}
            placeholder="Enter phone number"
          />
        </IonItem>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <IonButton 
            expand="block" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <IonSpinner /> : 'Save Address'}
          </IonButton>
          <IonButton 
            expand="block" 
            fill="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </IonButton>
        </div>

        <IonText color="medium">
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            * Required fields
          </p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );
};

export default AddressForm;