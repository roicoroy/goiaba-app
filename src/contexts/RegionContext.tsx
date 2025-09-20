import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegions } from 'medusa-react';

interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Array<{
    id: string;
    name: string;
    iso_2: string;
  }>;
}

interface RegionContextType {
  selectedRegion: Region | null;
  regions: Region[];
  setSelectedRegion: (region: Region) => void;
  isLoading: boolean;
  error: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export const RegionProvider: React.FC<RegionProviderProps> = ({ children }) => {
  const { regions, isLoading, isError } = useRegions();
  const [selectedRegion, setSelectedRegionState] = useState<Region | null>(null);

  // Load saved region from localStorage on mount
  useEffect(() => {
    const savedRegionId = localStorage.getItem('selectedRegionId');
    if (savedRegionId && regions) {
      const savedRegion = regions.find((region) => region.id === savedRegionId);
      if (savedRegion) {
        setSelectedRegionState(savedRegion);
      }
    } else if (regions && regions.length > 0 && !selectedRegion) {
      // Set first region as default if none selected
      setSelectedRegionState(regions[0]);
    }
  }, [regions, selectedRegion]);

  const setSelectedRegion = (region: Region) => {
    setSelectedRegionState(region);
    localStorage.setItem('selectedRegionId', region.id);
  };

  const value: RegionContextType = {
    selectedRegion,
    regions: regions || [],
    setSelectedRegion,
    isLoading,
    error: isError,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegionContext = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegionContext must be used within a RegionProvider');
  }
  return context;
};