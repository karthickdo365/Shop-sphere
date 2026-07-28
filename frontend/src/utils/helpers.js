export const formatPrice = (n) => {
  const num = Number(n) || 0;
  return `\u20B9${num.toLocaleString('en-IN')}`;
};

export const calculateDiscountPercent = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const truncate = (str, n = 60) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const getFirstImage = (product) => {
  if (!product) return '';
  if (product.images && product.images.length > 0) return product.images[0].url;
  if (typeof product.image === 'string') return product.image;
  return 'https://via.placeholder.com/400x400?text=No+Image';
};

export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
