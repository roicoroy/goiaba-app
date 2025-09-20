import React, { Component, ReactNode } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { refreshOutline, bugOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Something went wrong</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent className="ion-text-center">
                <IonIcon
                  icon={bugOutline}
                  style={{ fontSize: '4rem', color: 'var(--ion-color-danger)' }}
                />
                <IonText>
                  <h2>Oops! Something went wrong</h2>
                  <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
                </IonText>
                <IonButton
                  expand="block"
                  onClick={() => window.location.reload()}
                  style={{ marginTop: '1rem' }}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Refresh Page
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;