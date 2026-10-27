import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectDiscountCode = (state: RootState) => state.cart.discountCode;
export const selectTaxRate = (state: RootState) => state.cart.taxRate;
export const selectShippingCost = (state: RootState) => state.cart.shippingCost;

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

export const selectSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectDiscount = createSelector(
  [selectSubtotal, selectDiscountCode],
  (subtotal, discountCode) => {
    const discountRates: Record<string, number> = {
      SUMMER10: 0.1,
      SPECIAL20: 0.2,
    };
    const rate = discountRates[discountCode || ''] || 0;
    return subtotal * rate;
  }
);

export const selectTax = createSelector(
  [selectSubtotal, selectTaxRate],
  (subtotal, taxRate) => subtotal * taxRate
);

export const selectCartTotal = createSelector(
  [selectSubtotal, selectDiscount, selectTax, selectShippingCost],
  (subtotal, discount, tax, shippingCost) =>
    subtotal > 0 ? subtotal - discount + tax + shippingCost : 0
);

export const selectCartSummary = createSelector(
  [
    selectSubtotal,
    selectDiscount,
    selectTax,
    selectShippingCost,
    selectCartTotal,
    selectCartItemCount,
  ],
  (subtotal, discount, tax, shipping, total, itemCount) => ({
    subtotal,
    discount,
    tax,
    shipping: subtotal > 0 ? shipping : 0,
    total,
    itemCount,
  })
);