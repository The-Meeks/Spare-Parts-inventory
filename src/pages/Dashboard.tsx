import React, { useEffect, useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent } from '../components/UI';
import { subscribeToProducts, subscribeToSales, getBusinessSettings } from '../services/firestoreService';
import { Product, Sale } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

const StatCard = ({ label, value, icon: Icon, color, trend, trendValue }: any) => (
  <Card className="relative overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-bold",
                trend === 'up' ? "text-emerald-500" : "text-red-500"
              )}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trendValue}
              </span>
            )}
          </div>
        </div>
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", color)}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </CardContent>
    <div className={cn("absolute bottom-0 left-0 right-0 h-1", color.replace('bg-', 'bg-opacity-20 bg-'))} />
  </Card>
);

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState({ lowStockThreshold: 10, currency: 'Ksh' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const st = await getBusinessSettings();
      if (st) setSettings(st as any);
    };
    fetchSettings();

    const unsubProducts = subscribeToProducts((p) => {
      setProducts(p);
    });

    const unsubSales = subscribeToSales((s) => {
      setSales(s);
      setLoading(false);
    }, 100);

    return () => {
      unsubProducts();
      unsubSales();
    };
  }, []);

  const totalProducts = products.length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= settings.lowStockThreshold).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  const totalProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);

  // Group sales by date for charts
  const salesByDate = sales.reduce((acc: any, sale) => {
    const date = format(sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt), 'MMM dd');
    if (!acc[date]) acc[date] = { date, revenue: 0, profit: 0 };
    acc[date].revenue += sale.totalPrice;
    acc[date].profit += sale.profit;
    return acc;
  }, {});

  const chartData = Object.values(salesByDate).slice(-7).reverse();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Dashboard</h2>
        <p className="text-slate-500 mt-1">Real-time overview of your business performance.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <StatCard 
            label="Stock Balance" 
            value={totalProducts} 
            icon={Package} 
            color="bg-indigo-600" 
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard 
            label="Total Revenue" 
            value={formatCurrency(totalRevenue)} 
            icon={DollarSign} 
            color="bg-emerald-600" 
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard 
            label="Total Profit" 
            value={formatCurrency(totalProfit)} 
            icon={TrendingUp} 
            color="bg-blue-600" 
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard 
            label="Low Stock Alert" 
            value={lowStock + outOfStock} 
            icon={AlertTriangle} 
            color={(lowStock + outOfStock) > 0 ? "bg-amber-500" : "bg-slate-400"} 
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue & Profit Overview</h3>
              <p className="text-xs text-slate-500">Last 7 active trading days</p>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <div className="w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${settings.currency} ${val}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{sale.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 font-medium">
                        {format(sale.createdAt.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt), 'MMM dd, h:mm a')}
                      </p>
                      <span className="text-[10px] text-slate-300">•</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{sale.staffName}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.totalPrice)}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">+{formatCurrency(sale.profit)}</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No sales recorded yet.</div>
              )}
            </div>
            {sales.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <button className="text-indigo-600 text-sm font-bold hover:underline w-full text-center">
                  View All Activity
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Stock Status</h3>
          </CardHeader>
          <CardContent className="h-64">
            <div className="w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Healthy', value: products.filter(p => p.quantity > settings.lowStockThreshold).length, fill: '#6366f1' },
                  { name: 'Low', value: lowStock, fill: '#f59e0b' },
                  { name: 'Out', value: outOfStock, fill: '#ef4444' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Summary Statistics</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">Avg. Revenue Per Sale</span>
              <span className="font-bold text-slate-900">
                {sales.length > 0 ? formatCurrency(totalRevenue / sales.length) : `${settings.currency} 0.00`}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">Operating Margin</span>
              <span className="font-bold text-emerald-600">
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">Inventory Value (Cost)</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(products.reduce((acc, p) => acc + (p.buyingPrice * p.quantity), 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
