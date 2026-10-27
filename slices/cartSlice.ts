import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  image: string | undefined;
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  taxRate: number;
  shippingCost: number;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    }
  } catch (e) {
    return [];
  }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('cartItems', JSON.stringify(items));
    }
  } catch (e) {}
};

const removeCartFromStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('cartItems');
    }
  } catch (e) {}
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  discountCode: null,
  taxRate: 0.1,
  shippingCost: 10,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCartToStorage(state.items);
    },
    increaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        saveCartToStorage(state.items);
      }
    },
    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCartToStorage(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.discountCode = null;
      removeCartFromStorage();
    },
    applyDiscount: (state, action: PayloadAction<string>) => {
      state.discountCode = action.payload;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} = cartSlice.actions;

export default cartSlice.reducer;