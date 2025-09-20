export interface MedusaImage {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
}

export interface MedusaProductOptionValue {
  id: string;
  value: string;
  option_id: string;
  variant_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
}

export interface MedusaProductOption {
  id: string;
  title: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
  values: MedusaProductOptionValue[];
}

export interface MedusaCalculatedPrice {
  id: string;
  is_calculated_price_price_list: boolean;
  is_calculated_price_tax_inclusive: boolean;
  calculated_amount: number;
  is_original_price_price_list: boolean;
  is_original_price_tax_inclusive: boolean;
  original_amount: number;
  currency_code: string;
}

export interface MedusaProductVariant {
  id: string;
  title: string;
  product_id: string;
  sku: string | null;
  barcode: string | null;
  ean: string | null;
  upc: string | null;
  inventory_quantity: number;
  allow_backorder: boolean;
  manage_inventory: boolean;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
  options: MedusaProductOptionValue[];
  calculated_price: MedusaCalculatedPrice;
}

export interface MedusaProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  is_giftcard: boolean;
  status: string;
  thumbnail: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  collection_id: string | null;
  type_id: string | null;
  discountable: boolean;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
  images: MedusaImage[];
  options: MedusaProductOption[];
  variants: MedusaProductVariant[];
}

export interface MedusaCountry {
    iso_2: string;
    iso_3: string;
    num_code: string;
    name: string;
    display_name: string;
    region_id: string;
    metadata: any;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface MedusaRegion {
    id: string;
    name: string;
    currency_code: string;
    automatic_taxes: boolean;
    countries: MedusaCountry[];
}

export interface MedusaShippingAddress {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    postal_code: string | null;
    country_code: string;
    province: string | null;
    phone: string | null;
}

export interface MedusaCartItem {
    id: string;
    thumbnail: string | null;
    variant_id: string;
    product_id: string;
    product_type_id: string | null;
    product_title: string;
    product_description: string | null;
    product_subtitle: string | null;
    product_type: string | null;
    product_collection: string | null;
    product_handle: string;
    variant_sku: string | null;
    variant_barcode: string | null;
    variant_title: string;
    requires_shipping: boolean;
    metadata: any;
    created_at: string;
    updated_at: string;
    title: string;
    quantity: number;
    unit_price: number;
    compare_at_unit_price: number | null;
    is_tax_inclusive: boolean;
    tax_lines: any[];
    adjustments: any[];
    product: {
        id: string;
        collection_id: string | null;
        type_id: string | null;
        categories: { id: string }[];
        tags: any[];
    };
}

export interface MedusaCart {
    id: string;
    currency_code: string;
    email: string | null;
    region_id: string;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    total: number;
    subtotal: number;
    tax_total: number;
    discount_total: number;
    discount_subtotal: number;
    discount_tax_total: number;
    original_total: number;
    original_tax_total: number;
    item_total: number;
    item_subtotal: number;
    item_tax_total: number;
    original_item_total: number;
    original_item_subtotal: number;
    original_item_tax_total: number;
    shipping_total: number;
    shipping_subtotal: number;
    shipping_tax_total: number;
    original_shipping_tax_total: number;
    original_shipping_subtotal: number;
    original_shipping_total: number;
    credit_lines_subtotal: number;
    credit_lines_tax_total: number;
    credit_lines_total: number;
    metadata: any;
    sales_channel_id: string;
    shipping_address_id: string;
    customer_id: string | null;
    items: MedusaCartItem[];
    shipping_methods: any[];
    shipping_address: MedusaShippingAddress;
    billing_address: MedusaShippingAddress | null;
    credit_lines: any[];
    region: MedusaRegion;
    promotions: any[];
}

export interface MedusaCustomer {
    id: string;
    email: string;
    default_billing_address_id?: string;
    default_shipping_address_id?: string;
    company_name?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    addresses?: MedusaAddress[];
    has_account?: boolean;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
}

export interface MedusaAddress {
    id?: string;
    address_name?: string;
    is_default_shipping?: boolean;
    is_default_billing?: boolean;
    customer_id?: string;
    company?: string;
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    country_code: string;
    province?: string;
    postal_code: string;
    phone?: string;
    metadata?: any;
    created_at?: string;
    updated_at?: string;
}