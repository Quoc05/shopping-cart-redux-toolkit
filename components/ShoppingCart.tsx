import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
} from '../slices/productsSlice';
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} from '../slices/cartSlice';
import { selectCartItems, selectCartSummary } from '../slices/cartSelectors';
import { RootState, AppDispatch } from '../store';

export default function ShoppingCart() {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.products.items);
  const productsStatus = useSelector((state: RootState) => state.products.status);
  const productsError = useSelector((state: RootState) => state.products.error);
  const cartItems = useSelector(selectCartItems);
  const summary = useSelector(selectCartSummary);
  const activeDiscount = useSelector((state: RootState) => state.cart.discountCode);
  const activeShipping = useSelector((state: RootState) => state.cart.shippingCost);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (productsStatus === 'idle') {
      dispatch(fetchProducts());
    }
  }, [productsStatus, dispatch]);

  const handleSaveProduct = async () => {
    if (!name.trim() || !price.trim()) return;
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) return;

    try {
      if (editingId !== null) {
        const currentItem = products.find((p) => p.id === editingId);
        await dispatch(
          updateProduct({
            id: editingId,
            name: name.trim(),
            price: numericPrice,
            image: currentItem?.image || 'https://via.placeholder.com/150',
          })
        ).unwrap();
      } else {
        await dispatch(
          addProduct({
            name: name.trim(),
            price: numericPrice,
            image: 'https://via.placeholder.com/150',
          })
        ).unwrap();
      }
      setName('');
      setPrice('');
      setEditingId(null);
    } catch (err) {}
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
  };

  if (productsStatus === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (productsStatus === 'failed') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lỗi: {productsError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Cửa Hàng Trực Tuyến</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {editingId !== null ? 'Cập Nhật Sản Phẩm (CRUD)' : 'Thêm Sản Phẩm Mới (CRUD)'}
        </Text>
        <View style={styles.formRow}>
          <TextInput
            style={styles.input}
            placeholder="Tên sản phẩm"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Giá ($)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}>
            <Text style={styles.btnText}>
              {editingId !== null ? 'Lưu' : 'Thêm'}
            </Text>
          </TouchableOpacity>
          {editingId !== null && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
              <Text style={styles.btnText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản Phẩm Có Sẵn</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => dispatch(addToCart(product))}
              >
                <Text style={styles.btnText}>+ Giỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleStartEdit(product)}
              >
                <Text style={styles.btnText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => dispatch(deleteProduct(product.id))}
              >
                <Text style={styles.btnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Giỏ Hàng ({summary.itemCount} sản phẩm)
        </Text>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.quantityActions}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(decreaseQuantity(item.id))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(increaseQuantity(item.id))}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => dispatch(removeFromCart(item.id))}
                  >
                    <Text style={styles.removeBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => dispatch(clearCart())}
            >
              <Text style={styles.btnText}>Xóa Tất Cả</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mã Giảm Giá</Text>
        <View style={styles.rowOptions}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              activeDiscount === 'SUMMER10' && styles.optionBtnActive,
            ]}
            onPress={() => dispatch(applyDiscount('SUMMER10'))}
          >
            <Text style={styles.optionText}>SUMMER10 (-10%)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              activeDiscount === 'SPECIAL20' && styles.optionBtnActive,
            ]}
            onPress={() => dispatch(applyDiscount('SPECIAL20'))}
          >
            <Text style={styles.optionText}>SPECIAL20 (-20%)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phí Vận Chuyển</Text>
        <View style={styles.rowOptions}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              activeShipping === 0 && styles.optionBtnActive,
            ]}
            onPress={() => dispatch(setShippingCost(0))}
          >
            <Text style={styles.optionText}>Miễn phí ($0)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              activeShipping === 10 && styles.optionBtnActive,
            ]}
            onPress={() => dispatch(setShippingCost(10))}
          >
            <Text style={styles.optionText}>Tiêu chuẩn ($10)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              activeShipping === 25 && styles.optionBtnActive,
            ]}
            onPress={() => dispatch(setShippingCost(25))}
          >
            <Text style={styles.optionText}>Nhanh ($25)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tóm Tắt Đơn Hàng</Text>
        <View style={styles.summaryRow}>
          <Text>Tổng cộng:</Text>
          <Text>${summary.subtotal.toFixed(2)}</Text>
        </View>
        {summary.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.discountText}>Giảm giá:</Text>
            <Text style={styles.discountText}>-${summary.discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text>Thuế (10%):</Text>
          <Text>${summary.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Vận chuyển:</Text>
          <Text>${summary.shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Thành Tiền:</Text>
          <Text style={styles.totalText}>${summary.total.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 8, fontSize: 16, color: '#475569' },
  errorText: { fontSize: 16, color: '#dc2626', fontWeight: 'bold' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', marginTop: 24 },
  section: { backgroundColor: '#ffffff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1e293b' },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: { flex: 1, minWidth: 140, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  priceInput: { flex: 0.5, minWidth: 80 },
  saveBtn: { backgroundColor: '#16a34a', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#64748b', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 6 },
  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  productImage: { width: 45, height: 45, resizeMode: 'contain', marginRight: 10, borderRadius: 4 },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: '500', color: '#334155' },
  productPrice: { fontSize: 14, color: '#16a34a', fontWeight: 'bold', marginTop: 4 },
  productActions: { flexDirection: 'row', gap: 6 },
  addBtn: { backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  editBtn: { backgroundColor: '#f59e0b', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnText: { color: '#ffffff', fontWeight: '600', textAlign: 'center', fontSize: 13 },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  cartItemImage: { width: 35, height: 35, resizeMode: 'contain', marginRight: 8, borderRadius: 4 },
  cartItemInfo: { flex: 1, marginRight: 8 },
  cartItemName: { fontSize: 14, fontWeight: '500' },
  cartItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  quantityActions: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: '#e2e8f0', width: 28, height: 28, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: 'bold' },
  qtyText: { marginHorizontal: 8, fontSize: 15, fontWeight: '600' },
  removeBtn: { marginLeft: 8, backgroundColor: '#ef4444', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4 },
  removeBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  clearBtn: { backgroundColor: '#dc2626', padding: 10, borderRadius: 6, marginTop: 12 },
  rowOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  optionBtnActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  optionText: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  discountText: { color: '#16a34a', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 8, marginTop: 8 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
});