import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ExpiryDashboard({ onDataUpdate }) {
    const [dashboardData, setDashboardData] = useState({
        totalMedicines: 0,
        activeMedicines: 0,
        expiredMedicines: 0,
        expiringSoonMedicines: 0,
        nearExpiryMedicines: 0,
        disposedMedicines: 0,
        totalValueAtRisk: 0,
        lowStockCount: 0
    });
    const [recentExpired, setRecentExpired] = useState([]);
    const [urgentExpiring, setUrgentExpiring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Load dashboard statistics
            const { data: dashboard } = await api.get('/api/medicine-expiry/dashboard');
            setDashboardData(dashboard);

            // Load recent expired medicines
            const { data: expired } = await api.get('/api/medicine-expiry/expired');
            setRecentExpired(expired.slice(0, 5)); // Show only 5 most recent

            // Load urgently expiring medicines (within 7 days)
            const { data: urgent } = await api.get('/api/medicine-expiry/near-expiry');
            setUrgentExpiring(urgent.slice(0, 5)); // Show only 5 most urgent

            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/medicine-expiry/${id}/status?status=${newStatus}`);
            toast.success(`Status updated to ${newStatus}`);
            loadDashboardData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const triggerStatusUpdate = async () => {
        try {
            await api.post('/api/medicine-expiry/update-statuses');
            toast.success('All expiry statuses updated successfully');
            loadDashboardData();
        } catch (error) {
            console.error('Error updating statuses:', error);
            toast.error('Failed to update expiry statuses');
        }
    };

    const formatCurrency = (value) => {
        return `Rs. ${Number(value).toFixed(2)}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'EXPIRED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'EXPIRING_SOON':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'NEAR_EXPIRY':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'DISPOSED':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        }
    };

    const getDaysText = (days) => {
        if (days < 0) {
            return `${Math.abs(days)} days ago`;
        } else if (days === 0) {
            return 'Today';
        } else {
            return `${days} days`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                <div className="flex items-center">
                    <span className="text-xl mr-2">❌</span>
                    <span>{error}</span>
                </div>
                <button
                    onClick={loadDashboardData}
                    className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    📊 Expiry Dashboard
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={loadDashboardData}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={triggerStatusUpdate}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                        ⚡ Update Statuses
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Medicines</p>
                            <p className="text-3xl font-bold text-blue-600">{dashboardData.totalMedicines}</p>
                        </div>
                        <div className="text-4xl">💊</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {dashboardData.activeMedicines} active batches
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expired</p>
                            <p className="text-3xl font-bold text-red-600">{dashboardData.expiredMedicines}</p>
                        </div>
                        <div className="text-4xl">⚠️</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {dashboardData.disposedMedicines} disposed
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expiring Soon</p>
                            <p className="text-3xl font-bold text-yellow-600">{dashboardData.expiringSoonMedicines}</p>
                        </div>
                        <div className="text-4xl">🟡</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {dashboardData.nearExpiryMedicines} within 7 days
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Value at Risk</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(dashboardData.totalValueAtRisk)}
                            </p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {dashboardData.lowStockCount} low stock alerts
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">📈 Status Distribution</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Active', value: dashboardData.activeMedicines, color: 'bg-green-500' },
                            { label: 'Expiring Soon', value: dashboardData.expiringSoonMedicines, color: 'bg-yellow-500' },
                            { label: 'Near Expiry', value: dashboardData.nearExpiryMedicines, color: 'bg-orange-500' },
                            { label: 'Expired', value: dashboardData.expiredMedicines, color: 'bg-red-500' },
                            { label: 'Disposed', value: dashboardData.disposedMedicines, color: 'bg-gray-500' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center">
                                <div className={`w-4 h-4 ${item.color} rounded mr-3`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{item.label}</span>
                                <span className="font-semibold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Expired Medicines */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">🚨 Recent Expired Medicines</h3>
                    {recentExpired.length > 0 ? (
                        <div className="space-y-3">
                            {recentExpired.map(medicine => (
                                <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800 dark:text-red-300">{medicine.medicineName}</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Batch: {medicine.batchNumber} • {getDaysText(medicine.daysUntilExpiry)}
                                        </p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => updateStatus(medicine.id, 'DISPOSED')}
                                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                            title="Mark as Disposed"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">✅</div>
                            <p>No expired medicines</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Urgent Expiring Medicines */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">🚨 Urgent: Expiring Within 7 Days</h3>
                {urgentExpiring.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-orange-50 dark:bg-orange-900/20">
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Medicine</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Batch</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Expiry Date</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Days Left</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Quantity</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Status</th>
                                    <th className="px-4 py-2 text-left text-orange-800 dark:text-orange-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urgentExpiring.map(medicine => (
                                    <tr key={medicine.id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-medium">{medicine.medicineName}</td>
                                        <td className="px-4 py-2 font-mono text-sm">{medicine.batchNumber}</td>
                                        <td className="px-4 py-2">
                                            {new Date(medicine.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                                                medicine.daysUntilExpiry <= 1
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : medicine.daysUntilExpiry <= 3
                                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                                {getDaysText(medicine.daysUntilExpiry)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{medicine.quantity}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(medicine.status)}`}>
                                                {medicine.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => updateStatus(medicine.id, 'DISPOSED')}
                                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                                    title="Mark as Disposed"
                                                >
                                                    🗑️
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(medicine.id, 'RECALLED')}
                                                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs"
                                                    title="Mark as Recalled"
                                                >
                                                    📞
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">👍</div>
                        <p>No urgent expiring medicines</p>
                    </div>
                )}
            </div>
        </div>
    );
}