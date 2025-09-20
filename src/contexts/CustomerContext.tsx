import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { API_CONFIG } from '../utils/constants';

interface Address {
    id?: string;
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    country_code: string;
    province?: string;
    postal_code: string;
    phone?: string;
    address_name?: string;
    is_default_billing?: boolean;
    is_default_shipping?: boolean;
    customer_id?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    metadata?: unknown;
}

interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    billing_address?: Address;
    shipping_addresses?: Address[];
    default_shipping_address?: Address;
    addresses?: Address[];
    company_name?: string;
    has_account?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface CustomerContextType {
    customer: Customer | null;
    isLoading: boolean;
    error: string | null;
    updateCustomer: (data: Partial<Customer>) => Promise<void>;
    addShippingAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    updateShippingAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
    deleteShippingAddress: (addressId: string) => Promise<void>;
    updateBillingAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    setDefaultBillingAddress: (addressId: string) => Promise<void>;
    setDefaultShippingAddress: (addressId: string) => Promise<void>;
    fetchCustomer: () => Promise<void>;
    clearCustomer: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
    children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomer = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        console.log('🔍 fetchCustomer called:', { token: !!token, isAuthenticated });

        if (!token || token === 'null' || token === 'undefined' || isAuthenticated !== 'true') {
            console.log('❌ No valid authentication found');
            setCustomer(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            console.log('🔑 Making authenticated request to /store/customers/me');
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me`, {
                method: 'GET',
                headers,
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Customer data from API:', data);

                const customer = data.customer;
                const addresses = customer.addresses || [];

                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing === true);
                const defaultShippingAddress = addresses.find((addr: Address) => addr.is_default_shipping === true);

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: addresses,
                    billing_address: billingAddress,
                    default_shipping_address: defaultShippingAddress,
                };

                console.log('✅ Customer data loaded successfully');
                setCustomer(transformedCustomer);
            } else if (response.status === 401) {
                const errorText = await response.text();
                console.log('❌ 401 Unauthorized - clearing invalid token');
                console.log('❌ Error details:', errorText);
                
                // Clear invalid authentication
                localStorage.removeItem('authToken');
                localStorage.removeItem('isAuthenticated');
                setCustomer(null);
                setError('Authentication expired. Please log in again.');
            } else {
                const errorText = await response.text();
                console.error('❌ API request failed:', response.status, errorText);
                setError(`Failed to load customer data: ${response.status}`);
            }
        } catch (err) {
            console.error('Failed to fetch customer:', err);
            setError('Failed to load customer data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCustomer = async (data: Partial<Customer>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            
            if (!token || isAuthenticated !== 'true') {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    company_name: data.company_name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone: data.phone,
                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const customer = responseData.customer;
                const addresses = customer.addresses || [];

                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing === true);
                const defaultShippingAddress = addresses.find((addr: Address) => addr.is_default_shipping === true);

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: addresses,
                    billing_address: billingAddress,
                    default_shipping_address: defaultShippingAddress,
                };

                setCustomer(transformedCustomer);
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to update customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to update customer');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const addShippingAddress = async (address: Omit<Address, 'id'>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const shippingAddressData = {
                ...address,
                is_default_billing: false,
                is_default_shipping: true,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses`, {
                method: 'POST',
                headers,
                body: JSON.stringify(shippingAddressData),
            });

            if (response.ok) {
                console.log('✅ Address added successfully');
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to add shipping address:', err);
            setError('Failed to add shipping address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateShippingAddress = async (addressId: string, address: Partial<Address>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(address),
            });

            if (response.ok) {
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to update shipping address:', err);
            setError('Failed to update shipping address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteShippingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'DELETE',
                headers,
            });

            if (response.ok) {
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to delete shipping address:', err);
            setError('Failed to delete shipping address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateBillingAddress = async (address: Omit<Address, 'id'>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const billingAddressData = {
                ...address,
                is_default_billing: true,
                is_default_shipping: false,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses`, {
                method: 'POST',
                headers,
                body: JSON.stringify(billingAddressData),
            });

            if (response.ok) {
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to update billing address:', err);
            setError('Failed to update billing address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const setDefaultBillingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const addressToUpdate = customer?.shipping_addresses?.find(addr => addr.id === addressId);
            if (!addressToUpdate) {
                throw new Error('Address not found');
            }

            const cleanAddressData = {
                first_name: addressToUpdate.first_name,
                last_name: addressToUpdate.last_name,
                address_1: addressToUpdate.address_1,
                city: addressToUpdate.city,
                country_code: addressToUpdate.country_code,
                postal_code: addressToUpdate.postal_code,
                is_default_billing: true,
                ...(addressToUpdate.company && { company: addressToUpdate.company }),
                ...(addressToUpdate.address_2 && { address_2: addressToUpdate.address_2 }),
                ...(addressToUpdate.province && { province: addressToUpdate.province }),
                ...(addressToUpdate.phone && { phone: addressToUpdate.phone }),
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(cleanAddressData),
            });

            if (response.ok) {
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to set default billing: ${response.status} ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to set default billing address:', err);
            setError('Failed to set default billing address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const setDefaultShippingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            const addressToUpdate = customer?.shipping_addresses?.find(addr => addr.id === addressId);
            if (!addressToUpdate) {
                throw new Error('Address not found');
            }

            const cleanAddressData = {
                first_name: addressToUpdate.first_name,
                last_name: addressToUpdate.last_name,
                address_1: addressToUpdate.address_1,
                city: addressToUpdate.city,
                country_code: addressToUpdate.country_code,
                postal_code: addressToUpdate.postal_code,
                is_default_shipping: true,
                ...(addressToUpdate.company && { company: addressToUpdate.company }),
                ...(addressToUpdate.address_2 && { address_2: addressToUpdate.address_2 }),
                ...(addressToUpdate.province && { province: addressToUpdate.province }),
                ...(addressToUpdate.phone && { phone: addressToUpdate.phone }),
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(cleanAddressData),
            });

            if (response.ok) {
                await fetchCustomer();
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to set default shipping: ${response.status} ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to set default shipping address:', err);
            setError('Failed to set default shipping address');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearCustomer = () => {
        setCustomer(null);
        setError(null);
    };

    const value: CustomerContextType = {
        customer,
        isLoading,
        error,
        updateCustomer,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        updateBillingAddress,
        setDefaultBillingAddress,
        setDefaultShippingAddress,
        fetchCustomer,
        clearCustomer,
    };

    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerContext = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomerContext must be used within a CustomerProvider');
    }
    return context;
};