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
} from "@ionic/react";
import { logIn, mail, lockClosed } from 'ionicons/icons';
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { API_CONFIG } from '../utils/constants';
import { AuthService } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("test02@test.com");
  const [password, setPassword] = useState("Rwbento123!");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔐 Starting login with credentials:', { email, passwordLength: password.length });
      
      // Use the AuthService for consistent authentication
      const { token } = await AuthService.login({ email, password });
      
      console.log('🔑 Login successful, token received:', !!token);
      console.log('🔑 Token length:', token?.length);
      console.log('🔑 Token preview:', token?.substring(0, 20) + '...');
      
      // Store authentication data
      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      
      // Verify storage immediately
      const storedToken = localStorage.getItem("authToken");
      const storedAuth = localStorage.getItem("isAuthenticated");
      console.log('💾 Verification - stored token:', !!storedToken, 'auth flag:', storedAuth);
      
      // Clear any existing mock data since we now have real auth
      localStorage.removeItem("mockCustomer");
      
      console.log('💾 Authentication stored successfully');
      
      setToastMessage('Login successful! Welcome back!');
      setToastColor('success');
      setShowToast(true);
      
      // Navigate to main app after a short delay to show success message
      setTimeout(() => {
        console.log('🚀 Navigating to main app');
        history.push("/tabs/tab1");
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      setToastMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    history.push('/register');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={logIn} style={{ marginRight: '8px' }} />
              Welcome Back
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '1rem' }}>
              <IonText color="medium">
                <p>Sign in to your account to continue shopping</p>
              </IonText>
            </div>

            <IonItem>
              <IonIcon icon={mail} slot="start" />
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="Enter your email"
                required
              />
            </IonItem>

            <IonItem>
              <IonIcon icon={lockClosed} slot="start" />
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                placeholder="Enter your password"
                required
              />
            </IonItem>

            <IonButton 
              expand="block" 
              onClick={handleLogin} 
              disabled={isLoading}
              style={{ marginTop: '2rem' }}
              data-cy="login-button"
            >
              {isLoading ? (
                <>
                  <IonSpinner slot="start" />
                  Signing In...
                </>
              ) : (
                <>
                  <IonIcon icon={logIn} slot="start" />
                  Sign In
                </>
              )}
            </IonButton>

            {/* Register Link */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <IonText color="medium">
                <p>
                  Don't have an account?{' '}
                  <span 
                    style={{ color: 'var(--ion-color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={navigateToRegister}
                  >
                    Create one here
                  </span>
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

export default LoginPage;