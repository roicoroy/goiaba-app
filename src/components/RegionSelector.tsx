import React from 'react';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { globeOutline } from 'ionicons/icons';
import { useRegionContext } from '../contexts/RegionContext';

const RegionSelector: React.FC = () => {
  const { selectedRegion, regions, setSelectedRegion, isLoading, error } = useRegionContext();

  if (isLoading) {
    return (
      <IonItem>
        <IonIcon icon={globeOutline} slot="start" />
        <IonLabel>Loading regions...</IonLabel>
        <IonSpinner slot="end" />
      </IonItem>
    );
  }

  if (error || regions.length === 0) {
    return (
      <IonItem>
        <IonIcon icon={globeOutline} slot="start" />
        <IonLabel>Unable to load regions</IonLabel>
      </IonItem>
    );
  }

  return (
    <IonItem>
      <IonIcon icon={globeOutline} slot="start" />
      <IonLabel>Region</IonLabel>
      <IonSelect
        value={selectedRegion?.id}
        placeholder="Select Region"
        onIonChange={(e) => {
          const regionId = e.detail.value;
          const region = regions.find((r) => r.id === regionId);
          if (region) {
            setSelectedRegion(region);
          }
        }}
      >
        {regions.map((region) => (
          <IonSelectOption key={region.id} value={region.id}>
            {region.name} ({region.currency_code.toUpperCase()})
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>
  );
};

export default RegionSelector;