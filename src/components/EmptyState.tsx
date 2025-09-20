import React from 'react';
import { IonCard, IonCardContent, IonIcon, IonText, IonButton } from '@ionic/react';
import { IconType } from 'ionicons/icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <IonCard>
      <IonCardContent className="ion-text-center" style={{ padding: '3rem 2rem' }}>
        <IonIcon
          icon={icon}
          style={{ 
            fontSize: '4rem', 
            color: 'var(--ion-color-medium)',
            marginBottom: '1rem'
          }}
        />
        <IonText>
          <h2 style={{ color: 'var(--ion-color-dark)' }}>{title}</h2>
          <p style={{ color: 'var(--ion-color-medium)' }}>{description}</p>
        </IonText>
        {actionText && onAction && (
          <IonButton
            expand="block"
            fill="outline"
            onClick={onAction}
            style={{ marginTop: '1.5rem' }}
          >
            {actionText}
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default EmptyState;