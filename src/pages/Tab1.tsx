import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonLoading,
  IonButton,
  IonButtons,
} from "@ionic/react";
import { useProducts } from "medusa-react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useRegionContext } from "../contexts/RegionContext";
import RegionSelector from "../components/RegionSelector";
import CartIcon from "../components/CartIcon";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { MedusaProduct } from "../interfaces/medusa";
import CartModal from "../components/CartModal";
import { storefront } from "ionicons/icons";
import "./Tab1.css";

const Tab1: React.FC = () => {
  const { selectedRegion } = useRegionContext();
  const { products, isLoading, isError } = useProducts(
    {
      region_id: selectedRegion?.id,
      fields: "*variants.calculated_price",
    },
    {
      enabled: !!selectedRegion,
    }
  );
  const history = useHistory();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authToken");
    history.push("/login");
  };

  const handleProductClick = (product: MedusaProduct) => {
    history.push(`/tabs/product/${product.id}`);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Products</IonTitle>
            <IonButtons slot="end">
              <CartIcon onClick={() => setIsCartModalOpen(true)} />
              <IonButton onClick={handleLogout}>Logout</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <LoadingSpinner message="Loading products..." />
        </IonContent>
      </IonPage>
    );
  }

  if (isError) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Products</IonTitle>
            <IonButtons slot="end">
              <CartIcon onClick={() => setIsCartModalOpen(true)} />
              <IonButton onClick={handleLogout}>Logout</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <EmptyState
            icon={storefront}
            title="Failed to load products"
            description="There was an error loading the products. Please try again."
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Products</IonTitle>
          <IonButtons slot="end">
            <CartIcon onClick={() => setIsCartModalOpen(true)} />
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Products</IonTitle>
          </IonToolbar>
        </IonHeader>

        <RegionSelector />

        {!products || products.length === 0 ? (
          <EmptyState
            icon={storefront}
            title="No products available"
            description="There are no products available in the selected region."
            actionText="Refresh"
            onAction={() => window.location.reload()}
          />
        ) : (
          <div className="product-grid">
            {products.map((product: MedusaProduct) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </IonContent>

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </IonPage>
  );
};

export default Tab1;