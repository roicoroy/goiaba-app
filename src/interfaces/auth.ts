// Authentication interfaces for Medusa API

export interface RegisterPayload {
  email: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
}

export interface CreateCustomerPayload {
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
}

export interface CreateCustomerResponse {
  customer: {
    id: string;
    email: string;
    company_name: string | null;
    first_name: string;
    last_name: string;
    phone: string | null;
    metadata: any | null;
    has_account: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    addresses: any[];
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}