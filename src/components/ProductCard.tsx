import React, { useState, useMemo } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonChip,
  IonLabel,
  IonIcon,
  IonBadge,
  IonSkeletonText,
} from '@ionic/react';
import { pricetag } from 'ionicons/icons';
import { MedusaProduct } from '../interfaces/medusa';
import { formatPrice, truncateText } from '../utils/formatters';
import './ProductCard.css';

interface ProductCardProps {
  product: MedusaProduct;
  onProductClick: (product: MedusaProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    onProductClick(product);
  };

  // Find the cheapest price among all variants
  const cheapestPrice = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    
    const prices = product.variants
      .map(variant => variant.calculated_price?.calculated_amount)
      .filter(price => price !== null && price !== undefined);
    
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [product.variants]);

  const currencyCode = product.variants?.[0]?.calculated_price?.currency_code || 'USD';

  return (
    <IonCard 
      button 
      onClick={handleCardClick}
      className="product-card"
    >
      {product.thumbnail && (
        <div className="product-card-image">
          {imageLoading && !imageError && (
            <IonSkeletonText 
              animated 
              style={{ 
                width: '100%', 
                height: '200px',
                borderRadius: '0'
              }} 
            />
          )}
          {!imageError && (
            <img
              src={product.thumbnail}
              alt={product.title}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          )}
          {imageError && (
            <div className="product-card-placeholder">
              <IonText>No Image</IonText>
            </div>
          )}
        </div>
      )}

      <IonCardHeader>
        <IonCardTitle className="product-card-title">
          {truncateText(product.title, 50)}
        </IonCardTitle>
      </IonCardHeader>

      <IonCardContent className="product-card-content">
        {product.description && (
          <IonText color="medium" className="product-card-description">
            <p>
              {truncateText(product.description, 100)}
            </p>
          </IonText>
        )}

        <div className="product-card-footer">
          {cheapestPrice !== null ? (
            <IonChip color="primary">
              <IonIcon icon={pricetag} />
              <IonLabel>From {formatPrice(cheapestPrice, currencyCode)}</IonLabel>
            </IonChip>
          ) : (
            <IonChip color="medium">
              <IonLabel>Price not available</IonLabel>
            </IonChip>
          )}

          {product.variants && product.variants.length > 1 && (
            <IonBadge color="secondary">
              {product.variants.length} variants
            </IonBadge>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductCard;