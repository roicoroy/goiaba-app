import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle, person } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ErrorBoundary from './components/ErrorBoundary';
import CheckoutPage from './pages/CheckoutPage';
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    const authFlag = localStorage.getItem('isAuthenticated');
    const isValid = token && token !== 'null' && token !== 'undefined' && authFlag === 'true';
    console.log('🔍 App isAuthenticated check:', { 
      hasToken: !!token, 
      authFlag, 
      isValid,
      tokenLength: token?.length || 0 
    });
    return isValid;
  };

  return (
    <ErrorBoundary>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" component={LoginPage} exact={true} />
            <Route path="/register" component={RegisterPage} exact={true} />
            <Route
              render={() => (
                <AuthenticatedTabs />
              )}
            />
            <Route exact path="/">
              <Redirect to={isAuthenticated() ? "/tabs/tab1" : "/login"} />
              <Route path="/checkout" component={CheckoutPage} exact={true} />
            </Route>
            <Route path="/checkout" component={CheckoutPage} exact={true} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ErrorBoundary>
  );
};

const AuthenticatedTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/tabs/tab1" component={Tab1} exact={true} />
      <Route path="/tabs/tab2" component={Tab2} exact={true} />
      <Route path="/tabs/tab3" component={Tab3} />
      <Route path="/tabs/product/:id" component={ProductDetailsPage} exact={true} />
      <Route path="/tabs/order-confirmation/:orderId" component={OrderConfirmationPage} exact={true} />
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tabs/tab1">
        <IonIcon icon={triangle} />
        <IonLabel>Tab 1</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tabs/tab2">
        <IonIcon icon={person} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab3" href="/tabs/tab3">
        <IonIcon icon={square} />
        <IonLabel>Tab 3</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default App;
