import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Trash2, 
  FileText,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  Select 
} from '../components/UI';
import { 
  recordSale, 
  subscribeToProducts,
  subscribeToSales,
  updateSale,
  deleteSale
} from '../services/firestoreService';
import { Product, Sale } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const Sales: React.FC = () => {
  const { profile } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // New Sale State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  // Editing State
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnitPrice, setEditUnitPrice] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((p) => {
      setProducts(p);
      setLoading(false);
    });

    const unsubSales = subscribeToSales((s) => {
      setSales(s);
    });

    return () => {
      unsubProducts();
      unsubSales();
    };
  }, []);

  const activeProduct = products.find(p => p.id === selectedProductId);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeProduct) return;
    
    if (quantity > activeProduct.quantity) {
      setError(`Insufficient stock. Only ${activeProduct.quantity} available.`);
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await recordSale({
        productId: activeProduct.id,
        productName: activeProduct.name,
        quantity: quantity,
        unitPrice: activeProduct.sellingPrice,
        totalPrice: activeProduct.sellingPrice * quantity,
        staffId: profile.id,
        staffName: profile.name
      }, activeProduct.buyingPrice);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setSelectedProductId('');
      setQuantity(1);
    } catch (err: any) {
      setError(err.message || 'An error occurred while recording the sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditQuantity(sale.quantity);
    setEditUnitPrice(sale.unitPrice);
    setIsEditModalOpen(true);
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    try {
      const totalPrice = editUnitPrice * editQuantity;
      // Use buyingPrice from record if it exists, otherwise fallback to 0 or current product price
      const costPrice = editingSale.buyingPrice || 0;
      const profit = (editUnitPrice - costPrice) * editQuantity;

      await updateSale(editingSale.id, {
        quantity: editQuantity,
        unitPrice: editUnitPrice,
        totalPrice,
        profit
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (!profile || profile.role !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this sale? This will restock the inventory.')) {
      try {
        await deleteSale(sale);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sales Management</h2>
        <p className="text-slate-500 mt-1">Record new transactions and track sales history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Sale Form */}
        <div className="lg:col-span-1">
          <Card className="h-full border-none shadow-xl shadow-indigo-50/50">
            <CardHeader className="bg-indigo-600 text-white py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">New Transaction</h3>
                  <p className="text-indigo-100 text-xs">Record a sale for a customer</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSale} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Select Product</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium"
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setError('');
                    }}
                    required
                  >
                    <option value="">Select an item...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                        {p.name} ({p.quantity} in stock) - {formatCurrency(p.sellingPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors font-bold text-xl"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="flex-1 text-center font-bold text-xl py-2 bg-transparent outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {activeProduct && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Unit Price</span>
                      <span className="font-bold text-slate-900">{formatCurrency(activeProduct.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-900">{formatCurrency(activeProduct.sellingPrice * quantity)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">Grand Total</span>
                      <span className="text-2xl font-black text-indigo-600 leading-none">
                        {formatCurrency(activeProduct.sellingPrice * quantity)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {showSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Sale recorded successfully!
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg rounded-2xl relative group overflow-hidden"
                  disabled={!selectedProductId || quantity <= 0}
                  isLoading={isSubmitting}
                >
                  Confirm Sale
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sales History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Recent Transactions History</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={14} />
                Live Updates
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-y border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Transaction Details</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Processed By</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      {profile?.role === 'admin' && <th className="px-6 py-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                              <ShoppingCart size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{sale.productName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Quantity: {sale.quantity} @ {formatCurrency(sale.unitPrice)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {format(sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {format(sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt), 'HH:mm')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {sale.staffName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-600">{sale.staffName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.totalPrice)}</p>
                        </td>
                        {profile?.role === 'admin' && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenEdit(sale)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSale(sale)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {sales.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <ShoppingCart size={48} className="opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest">No sales records yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Sale Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <CardHeader className="bg-indigo-600 text-white">
                <h3 className="font-bold">Edit Transaction</h3>
                <p className="text-xs text-indigo-100">Correcting a past record</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">Item</label>
                  <p className="text-sm text-slate-900 font-bold">{editingSale?.productName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1 block">Quantity Sold</label>
                    <Input 
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1 block">Unit Price</label>
                    <Input 
                      type="number"
                      value={editUnitPrice}
                      onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>RECALCULATED TOTAL</span>
                    <span>{formatCurrency(editUnitPrice * editQuantity)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleUpdateSale}
                  >
                    Update Record
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
