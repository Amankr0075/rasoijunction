import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [activeCoupon, setActiveCoupon] = useState(null);

  const [orderContext, setOrderContext] = useState(() => {
    const saved = localStorage.getItem('orderContext');
    return saved ? JSON.parse(saved) : { orderType: 'delivery', tableNumber: null, customerName: '', mobileNumber: '' };
  });

  const setDineInContext = (tableNumber, customerName = '', mobileNumber = '') => {
    setOrderContext({ orderType: 'dine-in', tableNumber, customerName, mobileNumber });
    toast.success(`Dine-in mode set for Table ${tableNumber}`);
  };

  const clearDineInContext = () => {
    setOrderContext({ orderType: 'delivery', tableNumber: null, customerName: '', mobileNumber: '' });
  };

  useEffect(() => {
    localStorage.setItem('orderContext', JSON.stringify(orderContext));
  }, [orderContext]);

  // Self-heal cart items with database values to prevent stale IDs (e.g. after seed reset)
  useEffect(() => {
    const healCart = async () => {
      if (cartItems.length === 0) return;
      try {
        const { data } = await api.get('/menu', { params: { limit: 100 } });
        const freshItems = data?.data || [];
        if (freshItems.length === 0) return;

        let changed = false;
        const healed = cartItems.map((item) => {
          const matched = freshItems.find((f) => f.name.toLowerCase() === item.name.toLowerCase());
          if (matched && matched._id !== item._id) {
            changed = true;
            return { ...item, _id: matched._id, price: matched.price };
          }
          return item;
        });

        if (changed) {
          setCartItems(healed);
          console.log('🛒 Cart self-healed: updated stale menu item IDs.');
        }
      } catch (err) {
        console.error('Failed to heal stale cart items:', err);
      }
    };

    healCart();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity = 1) => {
    let isNew = false;
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      isNew = true;
      return [...prev, { ...item, quantity }];
    });
    
    // Fire toast outside the state updater to avoid React Strict Mode double-invocation
    setTimeout(() => {
      if (isNew) {
        toast.success(`Added ${item.name} to Cart!`);
      } else {
        toast.success(`Updated ${item.name} quantity in Cart!`);
      }
    }, 0);
  };

  const removeFromCart = (itemId) => {
    let removedName = null;
    setCartItems((prev) => {
      const item = prev.find((i) => i._id === itemId);
      if (item) removedName = item.name;
      return prev.filter((i) => i._id !== itemId);
    });
    
    setTimeout(() => {
      if (removedName) {
        toast.success(`Removed ${removedName} from Cart.`);
      }
    }, 0);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setActiveCoupon(null);
    toast.success('Cart cleared.');
  };

  // Math Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gstAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
  const deliveryCharges = (orderContext.orderType === 'dine-in' || subtotal > 599 || subtotal === 0) ? 0 : 40; // Free delivery over ₹599 or Dine-in
  
  // Coupon discounts
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountAmount = parseFloat(((subtotal * activeCoupon.value) / 100).toFixed(2));
      if (activeCoupon.maxDiscount && discountAmount > activeCoupon.maxDiscount) {
        discountAmount = activeCoupon.maxDiscount;
      }
    } else {
      discountAmount = activeCoupon.value;
    }
  }

  const finalTotal = parseFloat((subtotal + gstAmount + deliveryCharges - discountAmount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        activeCoupon,
        setActiveCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        gstAmount,
        deliveryCharges,
        discountAmount,
        finalTotal,
        orderContext,
        setDineInContext,
        clearDineInContext,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
