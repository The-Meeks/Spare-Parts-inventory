import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  FileJson, 
  FileText,
  BarChart,
  Filter,
  CheckCircle2,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Select 
} from '../components/UI';
import { 
  subscribeToProducts, 
  subscribeToSalesByRange 
} from '../services/firestoreService';
import { Product, Sale } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfToday, 
  endOfToday,
  subMonths
} from 'date-fns';
import { formatCurrency } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Reports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let start = startOfMonth(new Date());
    let end = endOfMonth(new Date());

    if (dateRange === 'today') {
      start = startOfToday();
      end = endOfToday();
    } else if (dateRange === '3months') {
      start = startOfMonth(subMonths(new Date(), 3));
      end = endOfMonth(new Date());
    }

    setLoading(true);
    
    const unsubProducts = subscribeToProducts((p) => {
      setProducts(p);
    });

    const unsubSales = subscribeToSalesByRange(start, end, (s) => {
      setSales(s);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubSales();
    };
  }, [dateRange]);

  const totalRevenue = sales.reduce((acc, s) => acc + (s.totalPrice || 0), 0);
  const totalProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
  const totalItems = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);

  const exportToExcel = () => {
    setExporting(true);
    const data = sales.map(s => ({
      'Date': format(s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt), 'yyyy-MM-dd HH:mm'),
      'Item Name': s.productName,
      'Quantity Sold': s.quantity,
      'Unit Price': s.unitPrice,
      'Total Price': s.totalPrice,
      'Gross Profit': s.profit,
      'Salesperson': s.staffName
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Pasbest_Sales_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    setExporting(false);
  };

  const exportToPDF = () => {
    setExporting(true);
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Pasbest Ventures - Sales Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 30);
    doc.text(`Period: ${dateRange.toUpperCase()}`, 14, 37);

    const tableColumn = ["Date", "Item Name", "Qty", "Unit Price", "Total Price", "Salesperson"];
    const tableRows = sales.map(s => [
      format(s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt), 'MM/dd HH:mm'),
      s.productName,
      s.quantity.toString(),
      formatCurrency(s.unitPrice),
      formatCurrency(s.totalPrice),
      s.staffName
    ]);

    autoTable(doc, { 
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      styles: { fontSize: 8 }
    });
    doc.save(`Sales_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    setExporting(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytical Reports</h2>
          <p className="text-slate-500 mt-1">Export business performance data for internal audits.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['today', 'month', '3months'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                dateRange === range 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {range === '3months' ? 'Last 3 Months' : range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none shadow-xl shadow-indigo-100">
          <CardContent className="p-6">
            <p className="text-indigo-100 font-bold uppercase tracking-tighter text-[10px]">Net Sales Revenue</p>
            <h4 className="text-3xl font-black mt-1">{formatCurrency(totalRevenue)}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-200">
              <TrendingUp size={14} />
              <span>For the selected period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-xl shadow-emerald-100">
          <CardContent className="p-6">
            <p className="text-emerald-100 font-bold uppercase tracking-tighter text-[10px]">Total Gross Profit</p>
            <h4 className="text-3xl font-black mt-1">{formatCurrency(totalProfit)}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-200">
              <TrendingUp size={14} />
              <span>{((totalProfit / Math.max(1, totalRevenue)) * 100).toFixed(1)}% Profit Margin</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl shadow-blue-100">
          <CardContent className="p-6">
            <p className="text-blue-100 font-bold uppercase tracking-tighter text-[10px]">Units Sold</p>
            <h4 className="text-3xl font-black mt-1">{totalItems}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-200">
              <Package size={14} />
              <span>Across all categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2 pt-6 px-8">
              <Download className="text-indigo-600" size={20} />
              <h3 className="font-bold text-lg">Export Data</h3>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Download your reports in different formats to keep manual records or for external processing.
              </p>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={exportToExcel} 
                  variant="outline" 
                  className="w-full justify-start py-4 h-auto border-dashed hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700" 
                  isLoading={exporting}
                >
                  <FileSpreadsheet size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Download Excel</p>
                    <p className="text-[10px] font-medium opacity-70 uppercase tracking-tighter">Recommended for auditing</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={exportToPDF} 
                  variant="outline" 
                  className="w-full justify-start py-4 h-auto border-dashed hover:border-red-500 hover:bg-red-50 hover:text-red-700"
                  isLoading={exporting}
                >
                  <FileText size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Generate PDF</p>
                    <p className="text-[10px] font-medium opacity-70 uppercase tracking-tighter">Perfect for printing</p>
                  </div>
                </Button>

                <Button 
                   onClick={() => {
                    const data = JSON.stringify(sales, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sales_raw_${Date.now()}.json`;
                    a.click();
                   }}
                   variant="outline" 
                   className="w-full justify-start py-4 h-auto border-dashed hover:border-slate-500 hover:bg-slate-50"
                >
                  <FileJson size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">RAW JSON Export</p>
                    <p className="text-[10px] font-medium opacity-70 uppercase tracking-tighter">For developer access</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center pt-6 px-8">
              <h3 className="font-bold text-lg text-slate-900">Performance Summary</h3>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                <BarChart size={16} />
                Highlights
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Top Categories</h4>
                  <div className="space-y-3">
                    {Array.from(new Set(sales.map(s => products.find(p => p.id === s.productId)?.category))).filter(Boolean).slice(0, 4).map((cat, idx) => {
                      const count = sales.filter(s => products.find(p => p.id === s.productId)?.category === cat).length;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{cat}</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{count} Sales</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System Notifications</h4>
                  <div className="space-y-3">
                    {products.filter(p => p.quantity <= 5).length > 0 ? (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-700">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold">Low Stock Warning</p>
                          <p className="text-[10px] leading-tight mt-1 opacity-80">
                            {products.filter(p => p.quantity <= 5).length} items are critically low.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 text-emerald-700">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold">Stock Is Healthy</p>
                          <p className="text-[10px] leading-tight mt-1 opacity-80">
                            No critical inventory shortages found.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
