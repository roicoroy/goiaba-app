export const formatPrice = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  } catch (error) {
    console.warn('Failed to format price:', error);
    return `${currencyCode.toUpperCase()} ${amount.toFixed(2)}`;
  }
};

export const formatAddress = (address: {
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code?: string;
}): string => {
  const parts = [
    address.address_1,
    address.address_2,
    address.city,
    address.province,
    address.postal_code,
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
};