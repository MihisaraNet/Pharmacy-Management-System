import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Calendar, Download, FileText, Package, TrendingUp, Eye, X, Settings, Users, Pill, ShoppingCart, Truck, BarChart3 } from 'lucide-react';
import SimpleExpiryDashboard from '../components/SimpleExpiryDashboard';

export default function SimpleAdminPanel() {
    // USERS
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
    const [editingUser, setEditingUser] = useState(null);

    // MEDICINES
    const [medicines, setMedicines] = useState([]);
    const [newMedicine, setNewMedicine] = useState({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
    const [editingMedicine, setEditingMedicine] = useState(null);

    // SALES
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

    // REPORTS
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [loadingVisualReport, setLoadingVisualReport] = useState(false);
    const [visualReportType, setVisualReportType] = useState('');

    // EXPIRY TRACKING
    const [expiryNotificationCount, setExpiryNotificationCount] = useState(0);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [exportingData, setExportingData] = useState(false);

    // Errors
    const [errors, setErrors] = useState({});

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedSales, setSelectedSales] = useState([]);

    const ensureArray = (data) => Array.isArray(data) ? data : [];

    // Load data functions
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
            const { data } = await api.get('/api/medicines');
            setMedicines(ensureArray(data));
            setErrors(prev => ({ ...prev, medicines: null }));
        } catch (error) {
            console.error('Error loading medicines:', error);
            setErrors(prev => ({ ...prev, medicines: error.response?.data?.message || 'Failed to load medicines' }));
        }
    };

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

    // REPORT FUNCTIONS
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

    // SALE FUNCTIONS
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

    // FILTERING
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

    // USER FUNCTIONS
    const addUser = async () => {
        try {
            await api.post('/api/users', newUser);
            setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
            loadUsers();
            toast.success('User added successfully!');
        } catch (error) {
            toast.error('Failed to add user. Please try again.');
        }
    };

    const delUser = async (id) => {
        try {
            await api.delete('/api/users/' + id);
            loadUsers();
            toast.success('User deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete user. Please try again.');
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
            toast.success('User updated successfully!');
        } catch (error) {
            toast.error('Failed to update user. Please try again.');
        }
    };

    const cancelEditUser = () => {
        setEditingUser(null);
        setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
    };

    // MEDICINE FUNCTIONS
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
            loadExpiryNotificationCount();
            toast.success('Medicine added successfully!');
        } catch (error) {
            toast.error('Failed to add medicine. Please try again.');
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
            loadExpiryNotificationCount();
            toast.success('Medicine updated successfully!');
        } catch (error) {
            toast.error('Failed to update medicine. Please try again.');
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
            loadExpiryNotificationCount();
            toast.success('Medicine permanently deleted from database!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete medicine. Please try again.';
            toast.error(errorMessage);
        }
    };

    // DELIVERY FUNCTIONS
    const updateDeliveryStatus = async (id, status) => {
        try {
            await api.put('/api/deliveries/' + id, null, { params: { status } });
            loadDeliveries();
            toast.success(`Delivery ${status.toLowerCase()} successfully!`);
        } catch (error) {
            toast.error('Failed to update delivery status. Please try again.');
        }
    };

    const delDelivery = async (id) => {
        try {
            await api.delete('/api/deliveries/' + id);
            loadDeliveries();
            toast.success('Delivery deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete delivery. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">Manage your pharmacy operations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Pill className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Medicines</p>
                                <p className="text-2xl font-semibold text-gray-900">{medicines.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <ShoppingCart className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                                <p className="text-2xl font-semibold text-gray-900">{salesStats.totalSales}</p>
                                <p className="text-sm text-gray-500">Rs. {salesStats.totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Truck className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Deliveries</p>
                                <p className="text-2xl font-semibold text-gray-900">{deliveries.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Expiry Alerts</p>
                                <p className="text-2xl font-semibold text-gray-900">{expiryNotificationCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                                { id: 'sales', label: 'Sales', icon: ShoppingCart },
                                { id: 'users', label: 'Users', icon: Users },
                                { id: 'medicines', label: 'Medicines', icon: Pill },
                                { id: 'expiry', label: 'Expiry Tracking', icon: Calendar },
                                { id: 'deliveries', label: 'Deliveries', icon: Truck },
                                { id: 'reports', label: 'Reports', icon: FileText },
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-6 border-b-2 font-medium flex items-center`}
                                    >
                                        <Icon className="h-5 w-5 mr-2" />
                                        {tab.label}
                                        {tab.id === 'expiry' && expiryNotificationCount > 0 && (
                                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {expiryNotificationCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white border rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Sales</span>
                                                <span className="font-semibold">{salesStats.totalSales}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Revenue</span>
                                                <span className="font-semibold text-green-600">Rs. {salesStats.totalRevenue.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Pending Sales</span>
                                                <span className="font-semibold text-yellow-600">{salesStats.pendingSales}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Completed Sales</span>
                                                <span className="font-semibold text-green-600">{salesStats.completedSales}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setActiveTab('sales')}
                                                className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                                            >
                                                View Sales
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('medicines')}
                                                className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                                            >
                                                Manage Medicines
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('expiry')}
                                                className="w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                            >
                                                Check Expiry Alerts ({expiryNotificationCount})
                                            </button>
                                            <button
                                                onClick={viewSalesReport}
                                                className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100"
                                            >
                                                Generate Sales Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sales Tab */}
                        {activeTab === 'sales' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Sales Management</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={loadSales}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Refresh
                                        </button>
                                        <button
                                            onClick={() => exportSales('csv')}
                                            disabled={exportingData}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Export CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <select
                                            value={salesFilters.status}
                                            onChange={(e) => setSalesFilters({...salesFilters, status: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ALL">All Status</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Customer"
                                            value={salesFilters.customer}
                                            onChange={(e) => setSalesFilters({...salesFilters, customer: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="date"
                                            placeholder="From Date"
                                            value={salesFilters.dateFrom}
                                            onChange={(e) => setSalesFilters({...salesFilters, dateFrom: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="date"
                                            placeholder="To Date"
                                            value={salesFilters.dateTo}
                                            onChange={(e) => setSalesFilters({...salesFilters, dateTo: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Min Amount"
                                            value={salesFilters.minAmount}
                                            onChange={(e) => setSalesFilters({...salesFilters, minAmount: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max Amount"
                                            value={salesFilters.maxAmount}
                                            onChange={(e) => setSalesFilters({...salesFilters, maxAmount: e.target.value})}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
                                        >
                                            Clear Filters
                                        </button>
                                        <span className="text-sm text-gray-600 py-2">
                                            Showing {filteredSales.length} of {sales.length} sales
                                        </span>
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                {selectedSales.length > 0 && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 font-medium">
                                                {selectedSales.length} sales selected
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => bulkUpdateStatus('COMPLETED')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
                                                >
                                                    Mark Completed
                                                </button>
                                                <button
                                                    onClick={() => bulkUpdateStatus('PENDING')}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600"
                                                >
                                                    Mark Pending
                                                </button>
                                                <button
                                                    onClick={bulkDelete}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"
                                                >
                                                    Delete Selected
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sales Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                                                        onChange={handleSelectAllSales}
                                                        className="rounded"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredSales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSales.includes(sale.id)}
                                                            onChange={() => handleSelectSale(sale.id)}
                                                            className="rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sale.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{sale.user?.username || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">{sale.user?.email || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                        Rs. {Number(sale.totalAmount).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(sale.saleDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            sale.status === 'COMPLETED'
                                                                ? 'bg-green-100 text-green-800'
                                                                : sale.status === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {sale.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {sale.items?.length || 0} items
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => viewSaleDetails(sale.id)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => updateSaleStatus(sale.id, sale.status === 'PENDING' ? 'COMPLETED' : 'PENDING')}
                                                            className={`${
                                                                sale.status === 'PENDING'
                                                                    ? 'text-green-600 hover:text-green-900'
                                                                    : 'text-yellow-600 hover:text-yellow-900'
                                                            } mr-3`}
                                                        >
                                                            {sale.status === 'PENDING' ? 'Complete' : 'Pending'}
                                                        </button>
                                                        <button
                                                            onClick={() => cancelSale(sale.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredSales.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No sales found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Users Management</h2>

                                {/* Add/Edit User Form */}
                                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingUser ? 'Edit User' : 'Add New User'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex space-x-3 mt-4">
                                        {editingUser ? (
                                            <>
                                                <button
                                                    onClick={saveEditUser}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                                                >
                                                    Update User
                                                </button>
                                                <button
                                                    onClick={cancelEditUser}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={addUser}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                                            >
                                                Add User
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Users Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{u.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            u.role === 'ADMIN'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => startEditUser(u)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => delUser(u.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {users.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Medicines Tab */}
                        {activeTab === 'medicines' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Medicines Management</h2>

                                {/* Add/Edit Medicine Form */}
                                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Medicine Name"
                                            value={newMedicine.name}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Category"
                                            value={newMedicine.category}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Price"
                                            value={newMedicine.price}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={newMedicine.quantity}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="date"
                                            placeholder="Expiry Date"
                                            value={newMedicine.expiryDate}
                                            onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex space-x-3 mt-4">
                                        {editingMedicine ? (
                                            <>
                                                <button
                                                    onClick={saveEditMedicine}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                                                >
                                                    Update Medicine
                                                </button>
                                                <button
                                                    onClick={cancelEditMedicine}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={addMedicine}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                                            >
                                                Add Medicine
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Medicines Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {medicines.map(m => (
                                                <tr key={m.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{m.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rs. {Number(m.price).toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={m.quantity === 0 ? 'text-red-600 font-bold' : m.quantity <= 10 ? 'text-yellow-600 font-bold' : ''}>
                                                            {m.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                                                        {m.expiryDate && new Date(m.expiryDate) < new Date() && (
                                                            <span className="ml-2 text-red-600 font-bold">EXPIRED</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => startEditMedicine(m)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => delMedicine(m.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {medicines.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No medicines found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Expiry Tracking Tab */}
                        {activeTab === 'expiry' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Medicine Expiry Tracking</h2>
                                <SimpleExpiryDashboard onDataUpdate={loadExpiryNotificationCount} />
                            </div>
                        )}

                        {/* Deliveries Tab */}
                        {activeTab === 'deliveries' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Deliveries Management</h2>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {deliveries.map(d => (
                                                <tr key={d.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{d.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">Sale #{d.sale?.id}</div>
                                                        <div className="text-sm text-gray-500">Rs. {Number(d.sale?.totalAmount || 0).toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{d.address}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            d.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            d.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {d.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => updateDeliveryStatus(d.id, 'SHIPPED')}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                Ship
                                                            </button>
                                                        )}
                                                        {d.status === 'SHIPPED' && (
                                                            <button
                                                                onClick={() => updateDeliveryStatus(d.id, 'DELIVERED')}
                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                            >
                                                                Deliver
                                                            </button>
                                                        )}
                                                        {d.status === 'DELIVERED' && (
                                                            <span className="text-gray-500">Completed</span>
                                                        )}
                                                        <button
                                                            onClick={() => delDelivery(d.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {deliveries.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No deliveries found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                                <TrendingUp className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Sales Summary</h3>
                                                <p className="text-sm text-gray-500">Last 30 days performance</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={viewSalesReport}
                                            disabled={loadingVisualReport}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loadingVisualReport ? 'Loading...' : 'View Report'}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 bg-green-100 rounded-lg mr-4">
                                                <Package className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
                                                <p className="text-sm text-gray-500">Inventory status report</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={viewLowStockReport}
                                            disabled={loadingVisualReport}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {loadingVisualReport ? 'Loading...' : 'View Report'}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800">
                                        Sales reports are automatically generated for the last 30 days. 
                                        Custom date ranges are no longer supported to simplify reporting.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sale Details Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Sale Details - #{selectedSale.id}</h3>
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <div className="mt-2 px-7 py-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium">{selectedSale.user?.username || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{selectedSale.user?.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Sale Date</p>
                                        <p className="font-medium">{new Date(selectedSale.saleDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            selectedSale.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : selectedSale.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                            {selectedSale.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-medium text-green-600">Rs. {Number(selectedSale.totalAmount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Items</p>
                                        <p className="font-medium">{selectedSale.items?.length || 0} items</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Items Purchased</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedSale.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {item.medicine?.name || "N/A"}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            Rs. {Number(item.unitPrice).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                                                            Rs. {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={() => setSelectedSale(null)}
                                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{visualReportType}</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={downloadReport}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={printReport}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                >
                                    Print
                                </button>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            <iframe
                                srcDoc={reportContent}
                                className="w-full h-full border-0"
                                title="Report Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}