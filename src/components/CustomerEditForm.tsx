import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonSpinner,
  IonToast,
} from '@ionic/react';

interface Customer {
  id: string;
  email: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface CustomerEditFormProps {
  customer: Customer;
  onSave: (customerData: Partial<Customer>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CustomerEditForm: React.FC<CustomerEditFormProps> = ({ 
  customer, 
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
      });
    }
  }, [customer]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setToastMessage('First name and last name are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      await onSave({
        company_name: formData.company_name.trim() || undefined,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
      });
      setToastMessage('Customer information updated successfully!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update customer information');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Edit Customer Information</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            value={customer.email}
            readonly
            disabled
            placeholder="Email cannot be changed"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Company Name</IonLabel>
          <IonInput
            value={formData.company_name}
            onIonInput={(e) => handleInputChange('company_name', e.detail.value!)}
            placeholder="Enter company name"
          />
        </IonItem>

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
          <IonLabel position="stacked">Phone</IonLabel>
          <IonInput
            value={formData.phone}
            onIonInput={(e) => handleInputChange('phone', e.detail.value!)}
            placeholder="Enter phone number"
            type="tel"
          />
        </IonItem>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <IonButton 
            expand="block" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <IonSpinner /> : 'Save Changes'}
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

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default CustomerEditForm;