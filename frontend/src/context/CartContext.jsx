import { createContext, useContext, useState } from 'react';
export const CartContext = createContext(null);
export function CartProvider({children}){
  const [items, setItems] = useState([]); // {medicine, quantity}
  const addItem=(medicine)=>{
    setItems(prev=>{
      const found = prev.find(i=>i.medicine.id===medicine.id);
      if(found){ return prev.map(i=>i.medicine.id===medicine.id? {...i, quantity:i.quantity+1}:i); }
      return [...prev, {medicine, quantity:1}];
    });
  };
  const removeItem=(id)=> setItems(prev=>prev.filter(i=>i.medicine.id!==id));
  const updateQty=(id, qty)=> setItems(prev=>prev.map(i=>i.medicine.id===id? {...i, quantity:qty}:i));
  const clear=()=> setItems([]);
  return <CartContext.Provider value={{items, addItem, removeItem, updateQty, clear}}>{children}</CartContext.Provider>;
}
export const useCart=()=>useContext(CartContext);
