import React from 'react';
import { IonSpinner, IonText } from '@ionic/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'default' 
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px'
      }}
    >
      <IonSpinner name="crescent" />
      <IonText color="medium" style={{ marginTop: '1rem' }}>
        <p>{message}</p>
      </IonText>
    </div>
  );
};

export default LoadingSpinner;