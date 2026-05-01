import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  X,
  Package,
  ArrowUpDown
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
  addProduct, 
  updateProduct, 
  deleteProduct,
  getBusinessSettings,
  subscribeToProducts
} from '../services/firestoreService';
import { Product, UserRole } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const Inventory: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.ADMIN;

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState({ lowStockThreshold: 10 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    buyingPrice: 0,
    sellingPrice: 0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const s = await getBusinessSettings();
      if (s) setSettings(s as any);
    };
    fetchSettings();

    const unsub = subscribeToProducts((p) => {
      setProducts(p);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        quantity: product.quantity,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        quantity: 0,
        buyingPrice: 0,
        sellingPrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !confirm('Are you sure you want to delete this product?')) return;
    await deleteProduct(id);
  };

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Catalog</h2>
          <p className="text-slate-500 mt-1">Manage and track your products in real-time.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-indigo-100">
            <Plus size={20} />
            Add New Product
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-none pt-6 lg:px-8">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-1 rounded-xl border border-slate-100">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products by name..." 
              className="bg-transparent border-none outline-none py-2 w-full text-sm text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-y border-slate-100">
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Buying Cost</th>
                  {isAdmin && <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="text-slate-200" />
                        <p className="text-slate-400 font-medium">No products found in inventory.</p>
                        {searchTerm && <p className="text-xs text-slate-400">Try adjusting your search terms.</p>}
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.map((p) => (
                  <motion.tr 
                    layout
                    key={p.id} 
                    className="group hover:bg-slate-50/50 transition-colors cursor-default"
                  >
                    <td className="px-8 py-4">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${
                          p.quantity <= 0 ? 'text-red-500' : p.quantity <= settings.lowStockThreshold ? 'text-amber-500' : 'text-slate-700'
                        }`}>
                          {p.quantity} Units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-indigo-600">{formatCurrency(p.sellingPrice)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-slate-500">{formatCurrency(p.buyingPrice)}</p>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(p)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                <div>
                  <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-indigo-100 text-xs mt-0.5 font-medium uppercase tracking-wider">Update inventory list</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <Input 
                    label="Product Name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input 
                    label="Quantity" 
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                  <Input 
                    label="Buying Price (Ksh)" 
                    type="number"
                    required
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <Input 
                    label="Selling Price (Ksh)" 
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2]"
                    isLoading={isSubmitting}
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
