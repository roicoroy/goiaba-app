import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToast,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { personAdd, mail, person, business, call, lockClosed } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { RegisterPayload } from '../interfaces/auth';

const RegisterPage: React.FC = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState<RegisterPayload>({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const handleInputChange = (field: keyof RegisterPayload, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.password) {
      setToastMessage('Please fill in all required fields');
      setToastColor('danger');
      setShowToast(true);
      return false;
    }

    if (formData.password !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return false;
    }

    if (formData.password.length < 8) {
      setToastMessage('Password must be at least 8 characters long');
      setToastColor('danger');
      setShowToast(true);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToastMessage('Please enter a valid email address');
      setToastColor('danger');
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Clean the payload - remove empty optional fields
      const cleanPayload: RegisterPayload = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password,
      };

      if (formData.company_name?.trim()) {
        cleanPayload.company_name = formData.company_name.trim();
      }

      if (formData.phone?.trim()) {
        cleanPayload.phone = formData.phone.trim();
      }

      const { token, customer } = await AuthService.register(cleanPayload);

      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      console.log('✅ Registration completed successfully');

      setToastMessage('Account created successfully! Welcome!');
      setToastColor('success');
      setShowToast(true);

      // Navigate to main app after a short delay
      setTimeout(() => {
        history.push('/tabs/tab1');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setToastMessage(error instanceof Error ? error.message : 'Registration failed');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Create Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={personAdd} style={{ marginRight: '8px' }} />
              Join Medusa Store
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '1rem' }}>
              <IonText color="medium">
                <p>Create your account to start shopping with us!</p>
              </IonText>
            </div>

            {/* Email */}
            <IonItem>
              <IonIcon icon={mail} slot="start" />
              <IonLabel position="stacked">Email Address *</IonLabel>
              <IonInput
                type="email"
                value={formData.email}
                onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                placeholder="Enter your email"
                required
              />
            </IonItem>

            {/* First Name */}
            <IonItem>
              <IonIcon icon={person} slot="start" />
              <IonLabel position="stacked">First Name *</IonLabel>
              <IonInput
                type="text"
                value={formData.first_name}
                onIonInput={(e) => handleInputChange('first_name', e.detail.value!)}
                placeholder="Enter your first name"
                required
              />
            </IonItem>

            {/* Last Name */}
            <IonItem>
              <IonIcon icon={person} slot="start" />
              <IonLabel position="stacked">Last Name *</IonLabel>
              <IonInput
                type="text"
                value={formData.last_name}
                onIonInput={(e) => handleInputChange('last_name', e.detail.value!)}
                placeholder="Enter your last name"
                required
              />
            </IonItem>

            {/* Company Name (Optional) */}
            <IonItem>
              <IonIcon icon={business} slot="start" />
              <IonLabel position="stacked">Company Name</IonLabel>
              <IonInput
                type="text"
                value={formData.company_name}
                onIonInput={(e) => handleInputChange('company_name', e.detail.value!)}
                placeholder="Enter company name (optional)"
              />
            </IonItem>

            {/* Phone (Optional) */}
            <IonItem>
              <IonIcon icon={call} slot="start" />
              <IonLabel position="stacked">Phone Number</IonLabel>
              <IonInput
                type="tel"
                value={formData.phone}
                onIonInput={(e) => handleInputChange('phone', e.detail.value!)}
                placeholder="Enter phone number (optional)"
              />
            </IonItem>

            {/* Password */}
            <IonItem>
              <IonIcon icon={lockClosed} slot="start" />
              <IonLabel position="stacked">Password *</IonLabel>
              <IonInput
                type="password"
                value={formData.password}
                onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                placeholder="Enter password (min. 8 characters)"
                required
              />
            </IonItem>

            {/* Confirm Password */}
            <IonItem>
              <IonIcon icon={lockClosed} slot="start" />
              <IonLabel position="stacked">Confirm Password *</IonLabel>
              <IonInput
                type="password"
                value={confirmPassword}
                onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                placeholder="Confirm your password"
                required
              />
            </IonItem>

            {/* Register Button */}
            <IonButton
              expand="block"
              onClick={handleRegister}
              disabled={isLoading}
              style={{ marginTop: '2rem' }}
              data-cy="register-button"
            >
              {isLoading ? (
                <>
                  <IonSpinner slot="start" />
                  Creating Account...
                </>
              ) : (
                <>
                  <IonIcon icon={personAdd} slot="start" />
                  Create Account
                </>
              )}
            </IonButton>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <IonText color="medium">
                <p>
                  Already have an account?{' '}
                  <span 
                    style={{ color: 'var(--ion-color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={navigateToLogin}
                  >
                    Sign in here
                  </span>
                </p>
              </IonText>
            </div>

            {/* Required Fields Note */}
            <div style={{ marginTop: '1rem' }}>
              <IonText color="medium">
                <p style={{ fontSize: '0.8rem' }}>
                  * Required fields
                </p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;