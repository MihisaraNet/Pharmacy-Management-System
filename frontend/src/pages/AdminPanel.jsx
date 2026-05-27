// frontend/src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import SimpleExpiryDashboard from '../components/SimpleExpiryDashboard';
import SimpleExpiryNotifications from '../components/SimpleExpiryNotifications';
import { Calendar, Download, FileText, Package, TrendingUp, Eye, X, Settings, Users, Pill, ShoppingCart, Truck, BarChart3 } from 'lucide-react';

export default function AdminPanel() {
    // USERS
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
    const [editingUser, setEditingUser] = useState(null);

    // MEDICINES
    const [medicines, setMedicines] = useState([]);
    const [newMedicine, setNewMedicine] = useState({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
    const [editingMedicine, setEditingMedicine] = useState(null);

    // ENHANCED SALES STATE
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [salesFilters, setSalesFilters] = useState({
        status: 'ALL',
        customer: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: ''
    });
    const [filteredSales, setFilteredSales] = useState([]);
    const [salesStats, setSalesStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        pendingSales: 0,
        completedSales: 0
    });

    // DELIVERIES
    const [deliveries, setDeliveries] = useState([]);

    // REPORTS - VISUAL REPORTS STATE
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [loadingVisualReport, setLoadingVisualReport] = useState(false);
    const [visualReportType, setVisualReportType] = useState('');
    const [customReportStartDate, setCustomReportStartDate] = useState(getDefaultStartDate());
    const [customReportEndDate, setCustomReportEndDate] = useState(getDefaultEndDate());
    const [customThreshold, setCustomThreshold] = useState(10);

    function getDefaultStartDate() {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    function getDefaultEndDate() {
        return new Date().toISOString().split('T')[0];
    }

    // EXPIRY TRACKING
    const [activeExpiryTab, setActiveExpiryTab] = useState('dashboard');
    const [expiryNotificationCount, setExpiryNotificationCount] = useState(0);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [exportingData, setExportingData] = useState(false);

    // Errors
    const [errors, setErrors] = useState({});

    // UI State
    const [activeTab, setActiveTab] = useState('sales');
    const [selectedSales, setSelectedSales] = useState([]);

    const ensureArray = (data) => Array.isArray(data) ? data : [];

    // Load data functions (keeping existing ones)
    const loadUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(ensureArray(data));
            setErrors(prev => ({ ...prev, users: null }));
        } catch (error) {
            console.error('Error loading users:', error);
            setErrors(prev => ({ ...prev, users: error.response?.data?.message || 'Failed to load users' }));
        }
    };

    const loadMedicines = async () => {
        try {
            // Load only active medicines since we're now doing hard deletes
            const { data } = await api.get('/api/medicines');
            setMedicines(ensureArray(data));
            setErrors(prev => ({ ...prev, medicines: null }));
        } catch (error) {
            console.error('Error loading medicines:', error);
            setErrors(prev => ({ ...prev, medicines: error.response?.data?.message || 'Failed to load medicines' }));
        }
    };

    // ENHANCED SALES FUNCTIONS
    const loadSales = async () => {
        try {
            const { data } = await api.get('/api/sales');
            const salesData = ensureArray(data);
            setSales(salesData);
            setFilteredSales(salesData);
            
            // Calculate stats
            const stats = {
                totalSales: salesData.length,
                totalRevenue: salesData.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
                pendingSales: salesData.filter(s => s.status === 'PENDING').length,
                completedSales: salesData.filter(s => s.status === 'COMPLETED').length
            };
            setSalesStats(stats);
            
            setErrors(prev => ({ ...prev, sales: null }));
        } catch (error) {
            console.error('Error loading sales:', error);
            setErrors(prev => ({ ...prev, sales: error.response?.data?.message || 'Failed to load sales' }));
        }
    };

    const loadDeliveries = async () => {
        try {
            const { data } = await api.get('/api/deliveries');
            setDeliveries(ensureArray(data));
            setErrors(prev => ({ ...prev, deliveries: null }));
        } catch (error) {
            console.error('Error loading deliveries:', error);
            setErrors(prev => ({ ...prev, deliveries: error.response?.data?.message || 'Failed to load deliveries' }));
        }
    };

// VISUAL REPORT FUNCTIONS
    const viewSalesReport = async () => {
        setLoadingVisualReport(true);
        setVisualReportType('Sales Summary Report');
        try {
            const response = await fetch('http://localhost:8082/api/reports/html/sales');
            const html = await response.text();
            setReportContent(html);
            setShowReportModal(true);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Failed to load sales report');
        } finally {
            setLoadingVisualReport(false);
        }
    };

    const viewLowStockReport = async () => {
        setLoadingVisualReport(true);
        setVisualReportType('Low Stock & Inventory Report');
        try {
            const response = await fetch('http://localhost:8082/api/reports/html/lowstock');
            const html = await response.text();
            setReportContent(html);
            setShowReportModal(true);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Failed to load low stock report');
        } finally {
            setLoadingVisualReport(false);
        }
    };

    const viewCustomSalesReport = async () => {
        setLoadingVisualReport(true);
        setVisualReportType('Custom Sales Report');
        try {
            const start = new Date(customReportStartDate).toISOString();
            const end = new Date(customReportEndDate).toISOString();
            
            const response = await fetch('http://localhost:8082/api/reports/html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportType: 'SALES_SUMMARY',
                    parameters: { start, end }
                })
            });
            const html = await response.text();
            setReportContent(html);
            setShowReportModal(true);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Failed to load custom sales report');
        } finally {
            setLoadingVisualReport(false);
        }
    };

    const viewCustomLowStockReport = async () => {
        setLoadingVisualReport(true);
        setVisualReportType('Custom Low Stock Report');
        try {
            const response = await fetch('http://localhost:8082/api/reports/html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportType: 'LOW_STOCK',
                    parameters: { threshold: parseInt(customThreshold) }
                })
            });
            const html = await response.text();
            setReportContent(html);
            setShowReportModal(true);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Failed to load custom low stock report');
        } finally {
            setLoadingVisualReport(false);
        }
    };

    const downloadReport = () => {
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${visualReportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const loadExpiryNotificationCount = async () => {
        try {
            // Get counts for expired and near expiry medicines
            const [expiredResponse, nearExpiryResponse] = await Promise.all([
                api.get('/api/medicine-expiry/expired'),
                api.get('/api/medicine-expiry/near-expiry')
            ]);
            
            const urgentCount = expiredResponse.data.length + nearExpiryResponse.data.length;
            setExpiryNotificationCount(urgentCount);
        } catch (error) {
            console.error('Error loading expiry notification count:', error);
            setExpiryNotificationCount(0);
        }
    };

    const load = async () => {
        setLoading(true);
        await Promise.all([
            loadUsers(),
            loadMedicines(),
            loadSales(),
            loadDeliveries(),
            loadExpiryNotificationCount()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    // ENHANCED SALES FUNCTIONS
    const viewSaleDetails = async (saleId) => {
        try {
            const { data } = await api.get(`/api/sales/${saleId}`);
            setSelectedSale(data);
        } catch (error) {
            console.error('Error fetching sale details:', error);
            toast.error('Failed to load sale details');
        }
    };

    const updateSaleStatus = async (saleId, newStatus) => {
        try {
            await api.put(`/api/sales/${saleId}?status=${newStatus}`);
            toast.success(`Sale status updated to ${newStatus}`);
            loadSales();
        } catch (error) {
            console.error('Error updating sale status:', error);
            toast.error('Failed to update sale status');
        }
    };

    const cancelSale = async (saleId) => {
        if (!window.confirm('Are you sure you want to cancel this sale? Stock quantities will be restored.')) {
            return;
        }

        try {
            await api.delete(`/api/sales/${saleId}`);
            toast.success('Sale cancelled successfully. Stock quantities restored.');
            loadSales();
        } catch (error) {
            console.error('Error cancelling sale:', error);
            toast.error('Failed to cancel sale');
        }
    };

    // ADVANCED FILTERING
    const applyFilters = () => {
        let filtered = [...sales];

        if (salesFilters.status !== 'ALL') {
            filtered = filtered.filter(sale => sale.status === salesFilters.status);
        }

        if (salesFilters.customer) {
            filtered = filtered.filter(sale => 
                sale.user?.username?.toLowerCase().includes(salesFilters.customer.toLowerCase()) ||
                sale.user?.email?.toLowerCase().includes(salesFilters.customer.toLowerCase())
            );
        }

        if (salesFilters.dateFrom) {
            filtered = filtered.filter(sale => 
                new Date(sale.saleDate) >= new Date(salesFilters.dateFrom)
            );
        }

        if (salesFilters.dateTo) {
            filtered = filtered.filter(sale => 
                new Date(sale.saleDate) <= new Date(salesFilters.dateTo + 'T23:59:59')
            );
        }

        if (salesFilters.minAmount) {
            filtered = filtered.filter(sale => 
                Number(sale.totalAmount) >= Number(salesFilters.minAmount)
            );
        }

        if (salesFilters.maxAmount) {
            filtered = filtered.filter(sale => 
                Number(sale.totalAmount) <= Number(salesFilters.maxAmount)
            );
        }

        setFilteredSales(filtered);
    };

    const clearFilters = () => {
        setSalesFilters({
            status: 'ALL',
            customer: '',
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: ''
        });
        setFilteredSales(sales);
    };

    // BULK OPERATIONS
    const handleSelectSale = (saleId) => {
        setSelectedSales(prev => 
            prev.includes(saleId) 
                ? prev.filter(id => id !== saleId)
                : [...prev, saleId]
        );
    };

    const handleSelectAllSales = () => {
        if (selectedSales.length === filteredSales.length) {
            setSelectedSales([]);
        } else {
            setSelectedSales(filteredSales.map(sale => sale.id));
        }
    };

    const bulkUpdateStatus = async (newStatus) => {
        if (selectedSales.length === 0) {
            toast.warning('Please select sales to update');
            return;
        }

        if (!window.confirm(`Update ${selectedSales.length} sales to ${newStatus}?`)) {
            return;
        }

        try {
            await Promise.all(
                selectedSales.map(saleId => 
                    api.put(`/api/sales/${saleId}?status=${newStatus}`)
                )
            );
            toast.success(`${selectedSales.length} sales updated to ${newStatus}`);
            setSelectedSales([]);
            loadSales();
        } catch (error) {
            console.error('Error in bulk update:', error);
            toast.error('Failed to update some sales');
        }
    };

    const bulkDelete = async () => {
        if (selectedSales.length === 0) {
            toast.warning('Please select sales to delete');
            return;
        }

        if (!window.confirm(`Delete ${selectedSales.length} sales? This will restore stock quantities.`)) {
            return;
        }

        try {
            await Promise.all(
                selectedSales.map(saleId => api.delete(`/api/sales/${saleId}`))
            );
            toast.success(`${selectedSales.length} sales deleted successfully`);
            setSelectedSales([]);
            loadSales();
        } catch (error) {
            console.error('Error in bulk delete:', error);
            toast.error('Failed to delete some sales');
        }
    };

    // EXPORT FUNCTIONALITY
    const exportSales = async (format = 'csv') => {
        setExportingData(true);
        try {
            const dataToExport = filteredSales.map(sale => ({
                ID: sale.id,
                Customer: sale.user?.username || 'N/A',
                Email: sale.user?.email || 'N/A',
                'Total Amount': Number(sale.totalAmount).toFixed(2),
                Status: sale.status,
                Date: new Date(sale.saleDate).toLocaleDateString(),
                Items: sale.items?.length || 0
            }));

            if (format === 'csv') {
                downloadCSV(dataToExport, `sales-export-${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                downloadJSON(dataToExport, `sales-export-${new Date().toISOString().split('T')[0]}.json`);
            }

            toast.success(`Sales data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting sales:', error);
            toast.error('Failed to export sales data');
        } finally {
            setExportingData(false);
        }
    };

    const downloadCSV = (data, filename) => {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const downloadJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    // Apply filters whenever they change
    useEffect(() => {
        applyFilters();
    }, [salesFilters, sales]);

    // Keep all existing user and medicine functions...
    const addUser = async () => {
        try {
            await api.post('/api/users', newUser);
            setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
            loadUsers();
            toast.success('✅ User added successfully!');
        } catch (error) {
            toast.error('❌ Failed to add user. Please try again.');
        }
    };

    const delUser = async (id) => {
        try {
            await api.delete('/api/users/' + id);
            loadUsers();
            toast.success('🗑️ User deleted successfully!');
        } catch (error) {
            toast.error('❌ Failed to delete user. Please try again.');
        }
    };

    const startEditUser = (user) => {
        setEditingUser(user);
        setNewUser({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role
        });
    };

    const saveEditUser = async () => {
        try {
            const userData = {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            };
            if (newUser.password.trim()) {
                userData.password = newUser.password;
            }
            await api.put('/api/users/' + editingUser.id, userData);
            setEditingUser(null);
            setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
            loadUsers();
            toast.success('✅ User updated successfully!');
        } catch (error) {
            toast.error('❌ Failed to update user. Please try again.');
        }
    };

    const cancelEditUser = () => {
        setEditingUser(null);
        setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
    };

    // Medicine functions...
    const addMedicine = async () => {
        try {
            const medicineData = {
                name: newMedicine.name,
                category: newMedicine.category,
                price: parseFloat(newMedicine.price),
                quantity: parseInt(newMedicine.quantity),
                expiryDate: newMedicine.expiryDate ? new Date(newMedicine.expiryDate).toISOString().split('T')[0] : null
            };
            await api.post('/api/medicines', medicineData);
            setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
            loadMedicines();
            toast.success('✅ Medicine added successfully!');
        } catch (error) {
            toast.error('❌ Failed to add medicine. Please try again.');
        }
    };

    const startEditMedicine = (medicine) => {
        setEditingMedicine(medicine);
        setNewMedicine({
            name: medicine.name,
            category: medicine.category,
            price: medicine.price.toString(),
            quantity: medicine.quantity.toString(),
            expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : ''
        });
    };

    const saveEditMedicine = async () => {
        try {
            const medicineData = {
                name: newMedicine.name,
                category: newMedicine.category,
                price: parseFloat(newMedicine.price),
                quantity: parseInt(newMedicine.quantity),
                expiryDate: newMedicine.expiryDate ? new Date(newMedicine.expiryDate).toISOString().split('T')[0] : null
            };
            await api.put('/api/medicines/' + editingMedicine.id, medicineData);
            setEditingMedicine(null);
            setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
            loadMedicines();
            toast.success('✅ Medicine updated successfully!');
        } catch (error) {
            toast.error('❌ Failed to update medicine. Please try again.');
        }
    };

    const cancelEditMedicine = () => {
        setEditingMedicine(null);
        setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
    };

    const delMedicine = async (id) => {
        try {
            // Use hard delete endpoint to permanently remove medicine from database
            await api.delete('/api/medicines/' + id + '/hard');
            loadMedicines();
            toast.success('🗑️ Medicine permanently deleted from database!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete medicine. Please try again.';
            toast.error('❌ ' + errorMessage);
        }
    };



    // Delivery functions...
    const updateDeliveryStatus = async (id, status) => {
        try {
            await api.put('/api/deliveries/' + id, null, { params: { status } });
            loadDeliveries();
            toast.success(`🚚 Delivery ${status.toLowerCase()} successfully!`);
        } catch (error) {
            toast.error('❌ Failed to update delivery status. Please try again.');
        }
    };

    const delDelivery = async (id) => {
        try {
            await api.delete('/api/deliveries/' + id);
            loadDeliveries();
            toast.success('🗑️ Delivery deleted successfully!');
        } catch (error) {
            toast.error('❌ Failed to delete delivery. Please try again.');
        }
    };

    // Keep existing user and medicine functions...

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue-400 to-pastel-lavender-400 rounded-3xl flex items-center justify-center mr-6 shadow-pastel-lg hover:scale-110 transition-transform duration-300">
                      <Settings className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                      <p className="text-gray-600 mt-3 font-medium">Manage users, inventory, sales, and deliveries</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="card-pastel p-6 rounded-2xl hover:shadow-pastel-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-pastel-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-blue-700 bg-clip-text text-transparent">{users.length}</p>
                    </div>
                    <div className="card-pastel p-6 rounded-2xl hover:shadow-pastel-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-mint-100 flex items-center justify-center">
                                <Pill className="w-5 h-5 text-pastel-mint-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Medicines</h3>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pastel-mint-600 to-pastel-mint-700 bg-clip-text text-transparent">{medicines.length}</p>
                    </div>
                    <div className="card-pastel p-6 rounded-2xl hover:shadow-pastel-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-lavender-100 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-pastel-lavender-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Sales</h3>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pastel-lavender-600 to-pastel-lavender-700 bg-clip-text text-transparent">{salesStats.totalSales}</p>
                        <p className="text-sm text-gray-600 mt-1">${salesStats.totalRevenue.toFixed(2)} Revenue</p>
                    </div>
                    <div className="card-pastel p-6 rounded-2xl hover:shadow-pastel-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-yellow-100 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-pastel-yellow-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Pending Sales</h3>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pastel-yellow-600 to-pastel-yellow-700 bg-clip-text text-transparent">{salesStats.pendingSales}</p>
                        <p className="text-sm text-gray-600 mt-1">{salesStats.completedSales} Completed</p>
                    </div>
                    <div className="card-pastel p-6 rounded-2xl hover:shadow-pastel-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-pink-100 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-pastel-pink-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Deliveries</h3>
                        </div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-600 to-pastel-pink-700 bg-clip-text text-transparent">{deliveries.length}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap space-x-1 mb-8 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                    {[
                        { id: 'sales', label: '📊 Sales', count: sales.length },
                        { id: 'users', label: '👥 Users', count: users.length },
                        { id: 'medicines', label: '💊 Medicines', count: medicines.length },
                        { id: 'expiry', label: '⏰ Expiry Tracking', count: expiryNotificationCount > 0 ? expiryNotificationCount : null, badge: true },
                        { id: 'deliveries', label: '🚚 Deliveries', count: deliveries.length },
                        { id: 'reports', label: '📋 Reports', count: null }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label} {tab.count !== null && tab.count > 0 && !tab.badge && `(${tab.count})`}
                            {tab.badge && tab.count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ENHANCED SALES SECTION */}
                {activeTab === 'sales' && (
                    <div className="card-pastel mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <ShoppingCart className="w-6 h-6 text-pastel-blue-500" />
                                Enhanced Sales Management
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={loadSales}
                                    className="btn-pastel-secondary py-2 px-4 rounded-xl"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </span>
                                </button>
                                <button
                                    onClick={() => exportSales('csv')}
                                    disabled={exportingData}
                                    className="btn-pastel-secondary py-2 px-4 rounded-xl disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export CSV
                                    </span>
                                </button>
                                <button
                                    onClick={() => exportSales('json')}
                                    disabled={exportingData}
                                    className="btn-pastel-secondary py-2 px-4 rounded-xl disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export JSON
                                    </span>
                                </button>
                            </div>
                        </div>

                        {errors.sales && (
                            <div className="mb-4 p-4 bg-pastel-pink-50 border border-pastel-pink-200 text-pastel-pink-700 rounded-xl">
                                {errors.sales}
                            </div>
                        )}

                        {/* Advanced Filters */}
                        <div className="bg-pastel-blue-50 p-4 rounded-xl mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-pastel-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Advanced Filters
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <select
                                    value={salesFilters.status}
                                    onChange={(e) => setSalesFilters({...salesFilters, status: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Customer name/email"
                                    value={salesFilters.customer}
                                    onChange={(e) => setSalesFilters({...salesFilters, customer: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    placeholder="From Date"
                                    value={salesFilters.dateFrom}
                                    onChange={(e) => setSalesFilters({...salesFilters, dateFrom: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    placeholder="To Date"
                                    value={salesFilters.dateTo}
                                    onChange={(e) => setSalesFilters({...salesFilters, dateTo: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Min Amount ($)"
                                    value={salesFilters.minAmount}
                                    onChange={(e) => setSalesFilters({...salesFilters, minAmount: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Amount ($)"
                                    value={salesFilters.maxAmount}
                                    onChange={(e) => setSalesFilters({...salesFilters, maxAmount: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    🗑️ Clear Filters
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-300 py-2">
                                    Showing {filteredSales.length} of {sales.length} sales
                                </span>
                            </div>
                        </div>

                        {/* Bulk Operations */}
                        {selectedSales.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        {selectedSales.length} sales selected
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => bulkUpdateStatus('COMPLETED')}
                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                        >
                                            ✅ Mark Completed
                                        </button>
                                        <button
                                            onClick={() => bulkUpdateStatus('PENDING')}
                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                                        >
                                            ⏳ Mark Pending
                                        </button>
                                        <button
                                            onClick={bulkDelete}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                        >
                                            🗑️ Delete Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sales Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                                                onChange={handleSelectAllSales}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Total Amount</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Items</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map(sale => (
                                        <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSales.includes(sale.id)}
                                                    onChange={() => handleSelectSale(sale.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-2 font-mono">#{sale.id}</td>
                                            <td className="px-4 py-2">
                                                <div>
                                                    <div className="font-medium">{sale.user?.username || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{sale.user?.email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-mono text-green-600 font-bold">
                                                ${Number(sale.totalAmount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="text-sm">
                                                    {new Date(sale.saleDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(sale.saleDate).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    sale.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : sale.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                                                    {sale.items?.length || 0} items
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => viewSaleDetails(sale.id)}
                                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => updateSaleStatus(sale.id, sale.status === 'PENDING' ? 'COMPLETED' : 'PENDING')}
                                                        className={`px-2 py-1 text-white rounded text-xs transition-colors ${
                                                            sale.status === 'PENDING'
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-yellow-500 hover:bg-yellow-600'
                                                        }`}
                                                        title={`Mark as ${sale.status === 'PENDING' ? 'Completed' : 'Pending'}`}
                                                    >
                                                        {sale.status === 'PENDING' ? '✅' : '⏳'}
                                                    </button>
                                                    <button
                                                        onClick={() => cancelSale(sale.id)}
                                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                        title="Cancel Sale"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredSales.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    {sales.length === 0 ? (
                                        <div>
                                            <div className="text-6xl mb-4">📊</div>
                                            <div className="text-lg">No sales found</div>
                                            <div className="text-sm">Sales will appear here once customers make purchases</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-6xl mb-4">🔍</div>
                                            <div className="text-lg">No sales match your filters</div>
                                            <div className="text-sm">Try adjusting your search criteria</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Keep all existing sections but only show when activeTab matches */}
                {/* Users Section */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">👥 Users Management</h2>

                        {errors.users && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.users}
                            </div>
                        )}

                        {/* Add/Edit User Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="flex space-x-3 mb-6">
                            {editingUser ? (
                                <>
                                    <button
                                        onClick={saveEditUser}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        💾 Update User
                                    </button>
                                    <button
                                        onClick={cancelEditUser}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        ❌ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={addUser}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    ➕ Add User
                                </button>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Username</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Role</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{u.id}</td>
                                            <td className="px-4 py-2">{u.username}</td>
                                            <td className="px-4 py-2">{u.email}</td>
                                            <td className="px-4 py-2">
                                                {u.role === 'ADMIN' ? '⚡ Admin' : '👤 Customer'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => startEditUser(u)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => delUser(u.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    👥 No users found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Medicines Section */}
                {activeTab === 'medicines' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">💊 Medicines Management</h2>

                        {errors.medicines && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.medicines}
                            </div>
                        )}

                        {/* Add/Edit Medicine Form */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Medicine Name"
                                value={newMedicine.name}
                                onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={newMedicine.category}
                                onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                value={newMedicine.price}
                                onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={newMedicine.quantity}
                                onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="date"
                                placeholder="Expiry Date"
                                value={newMedicine.expiryDate}
                                onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex space-x-3 mb-6">
                            {editingMedicine ? (
                                <>
                                    <button
                                        onClick={saveEditMedicine}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        💾 Update Medicine
                                    </button>
                                    <button
                                        onClick={cancelEditMedicine}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        ❌ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={addMedicine}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    ➕ Add Medicine
                                </button>
                            )}
                        </div>

                        {/* Medicines Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Category</th>
                                        <th className="px-4 py-2 text-left">Price</th>
                                        <th className="px-4 py-2 text-left">Stock</th>
                                        <th className="px-4 py-2 text-left">Expiry</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.map(m => (
                                        <tr key={m.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{m.id}</td>
                                            <td className="px-4 py-2">{m.name}</td>
                                            <td className="px-4 py-2">{m.category}</td>
                                            <td className="px-4 py-2">${Number(m.price).toFixed(2)}</td>
                                            <td className="px-4 py-2">
                                                <span className={m.quantity === 0 ? 'text-red-500 font-bold' : m.quantity <= 10 ? 'text-yellow-500 font-bold' : ''}>
                                                    {m.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                                                {m.expiryDate && new Date(m.expiryDate) < new Date() && (
                                                    <span className="ml-2 text-red-500 font-bold">⚠️ EXPIRED</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => startEditMedicine(m)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => delMedicine(m.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {medicines.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    💊 No medicines found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Deliveries Section */}
                {activeTab === 'deliveries' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">🚚 Deliveries Management</h2>

                        {errors.deliveries && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.deliveries}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Sale</th>
                                        <th className="px-4 py-2 text-left">Address</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveries.map(d => (
                                        <tr key={d.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{d.id}</td>
                                            <td className="px-4 py-2">
                                                Sale #{d.sale?.id} ${Number(d.sale?.totalAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2">{d.address}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    d.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    d.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                }`}>
                                                    {d.status === 'DELIVERED' ? '✅ Delivered' : d.status === 'SHIPPED' ? '🚚 Shipped' : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    {d.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => updateDeliveryStatus(d.id, 'SHIPPED')}
                                                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                        >
                                                            🚚 Ship
                                                        </button>
                                                    )}
                                                    {d.status === 'SHIPPED' && (
                                                        <button
                                                            onClick={() => updateDeliveryStatus(d.id, 'DELIVERED')}
                                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                                        >
                                                            ✅ Deliver
                                                        </button>
                                                    )}
                                                    {d.status === 'DELIVERED' && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-sm">
                                                            🎉 Completed
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => delDelivery(d.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {deliveries.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    🚚 No deliveries found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reports Section - VISUAL REPORTS */}
                {activeTab === 'reports' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Sales Reports</h2>
                                <p className="text-gray-600 dark:text-gray-300">View automatically generated one-month sales reports</p>
                            </div>
                        </div>

                        {errors.reports && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.reports}
                            </div>
                        )}

                        {/* Quick Reports */}
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">🚀 Monthly Sales Reports</h3>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Sales Report Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sales Summary</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Last 30 days performance</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={viewSalesReport}
                                        disabled={loadingVisualReport}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Eye className="w-5 h-5" />
                                        {loadingVisualReport ? 'Loading...' : 'View Report'}
                                    </button>
                                    <button
                                        onClick={() => window.open('http://localhost:8082/api/reports/html/sales', '_blank')}
                                        className="w-full bg-white dark:bg-gray-600 border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-300 py-2 px-4 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-gray-500 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Open in New Tab
                                    </button>
                                </div>
                            </div>

                            {/* Low Stock Report Card */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Low Stock Alert</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Inventory status report</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={viewLowStockReport}
                                        disabled={loadingVisualReport}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Eye className="w-5 h-5" />
                                        {loadingVisualReport ? 'Loading...' : 'View Report'}
                                    </button>
                                    <button
                                        onClick={() => window.open('http://localhost:8082/api/reports/html/lowstock', '_blank')}
                                        className="w-full bg-white dark:bg-gray-600 border-2 border-orange-600 dark:border-orange-400 text-orange-600 dark:text-orange-300 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 dark:hover:bg-gray-500 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Open in New Tab
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Information about automatic reports */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ About Sales Reports</h3>
                            <p className="text-blue-700 dark:text-blue-300">
                                Sales reports are automatically generated for the last 30 days. 
                                Custom date ranges are no longer supported to simplify reporting.
                            </p>
                        </div>
                    </div>
                )}

                {/* Expiry Tracking Section */}
                {activeTab === 'expiry' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">⏰ Medicine Expiry Tracking</h2>
                            <button
                                onClick={loadExpiryNotificationCount}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        {/* Simplified Sub-Tab Navigation */}
                        <div className="flex space-x-1 mb-6 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
                            {[
                                { id: 'dashboard', label: '📊 View Expired & Near Expiry' },
                                { id: 'notifications', label: '🔔 Notifications', badge: expiryNotificationCount }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveExpiryTab(tab.id)}
                                    className={`relative flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        activeExpiryTab === tab.id
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.badge > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Simplified Sub-Tab Content */}
                        {activeExpiryTab === 'dashboard' && (
                            <SimpleExpiryDashboard onDataUpdate={loadExpiryNotificationCount} />
                        )}
                        {activeExpiryTab === 'notifications' && (
                            <SimpleExpiryNotifications onDataUpdate={loadExpiryNotificationCount} />
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Sale Details Modal */}
            {selectedSale && (
                <SaleDetailsModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onStatusUpdate={updateSaleStatus}
                />
            )}

            {/* Visual Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{visualReportType}</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={downloadReport}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={printReport}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Print
                                </button>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <iframe
                                srcDoc={reportContent}
                                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                                title="Report Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Enhanced Sale Details Modal Component
function SaleDetailsModal({ sale, onClose, onStatusUpdate }) {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">🧾 Sale Details - #{sale.id}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Sale Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Customer:</span> 
                                <span>{sale.user?.username || "N/A"}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Email:</span> 
                                <span>{sale.user?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Sale Date:</span> 
                                <span>{new Date(sale.saleDate).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Status:</span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    sale.status === "COMPLETED"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : sale.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}>
                                    {sale.status}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Total:</span>
                                <span className="ml-2 text-xl font-bold text-green-600">
                                    ${Number(sale.totalAmount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Items:</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                                    {sale.items?.length || 0} items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <button
                            onClick={() => {
                                onStatusUpdate(sale.id, sale.status === "PENDING" ? "COMPLETED" : "PENDING");
                                onClose();
                            }}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                sale.status === "PENDING"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-yellow-500 hover:bg-yellow-600"
                            }`}
                        >
                            {sale.status === "PENDING" ? "✅ Mark Completed" : "⏳ Mark Pending"}
                        </button>
                    </div>

                    {/* Sale Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">🛒 Items Purchased</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-3 text-left border-b font-semibold">Medicine</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Category</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Unit Price</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Quantity</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.items?.map((item, index) => (
                                        <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{item.medicine?.name || "N/A"}</div>
                                                    <div className="text-sm text-gray-500">ID: #{item.medicine?.id}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-sm">
                                                    {item.medicine?.category || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono">${Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded font-bold">
                                                    ×{item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-green-600">
                                                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <td colSpan="4" className="px-4 py-3 text-right font-bold">Total:</td>
                                        <td className="px-4 py-3 font-mono font-bold text-green-600 text-lg">
                                            ${Number(sale.totalAmount).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    {sale.delivery && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">🚚 Delivery Information</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-semibold">Address:</span> 
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">{sale.delivery.address}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Delivery Status:</span>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                            sale.delivery.status === "DELIVERED" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                                            sale.delivery.status === "SHIPPED" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        }`}>
                                            {sale.delivery.status}
                                        </span>
                                    </div>
                                    {sale.delivery.deliveryDate && (
                                        <div>
                                            <span className="font-semibold">Delivered On:</span>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                {new Date(sale.delivery.deliveryDate).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

