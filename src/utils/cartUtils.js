export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) return [];

  const productMap = new Map(
    productsData.map((product) => [product._id, { ...product }])
  );

  return cartData
    .map((cartItem) => {
      const product = productMap.get(cartItem.productId);
      if (!product) return null;

      return {
        ...product,
        quantity: cartItem.qty,
      };
    })
    .filter(Boolean);
};

export const getTotalCartValue = (items = []) => {
  let value = 0;
  for (let i = 0; i < items.length; i++) {
    value += items[i].quantity * items[i].cost;
  }
  return value;
};

export const getTotalItems = (items = []) => {
  let qty = 0;
  for (let i = 0; i < items.length; i++) {
    qty += items[i].quantity;
  }
  return qty;
};
