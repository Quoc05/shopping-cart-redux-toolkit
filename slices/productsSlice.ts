import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

const API_URL = 'https://fakestoreapi.com/products';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?limit=5`);
      if (!response.ok) return rejectWithValue('Không thể tải sản phẩm');
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        name: item.title,
        price: Number(item.price),
        image: item.image,
      })) as Product[];
    } catch (error) {
      return rejectWithValue('Lỗi kết nối máy chủ');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (newProduct: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
        }),
      });
      if (!response.ok) return rejectWithValue('Không thể thêm sản phẩm');
      const data = await response.json();
      return {
        id: Date.now(),
        name: data.title || newProduct.name,
        price: Number(data.price ?? newProduct.price),
        image: newProduct.image || 'https://via.placeholder.com/150',
      } as Product;
    } catch (error) {
      return rejectWithValue('Lỗi khi thêm sản phẩm');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (product: Product, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.name,
          price: product.price,
          image: product.image,
        }),
      });
      if (!response.ok) return rejectWithValue('Không thể cập nhật sản phẩm');
      return product;
    } catch (error) {
      return rejectWithValue('Lỗi khi cập nhật sản phẩm');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) return rejectWithValue('Không thể xóa sản phẩm');
      return id;
    } catch (error) {
      return rejectWithValue('Lỗi khi xóa sản phẩm');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Lỗi';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;