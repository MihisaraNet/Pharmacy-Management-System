import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function SimpleExpiryDashboard({ onDataUpdate }) {
    const [expiredMedicines, setExpiredMedicines] = useState([]);
    const [nearExpiryMedicines, setNearExpiryMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpiryData();
    }, []);

    const loadExpiryData = async () => {
        setLoading(true);
        try {
            const [expiredResponse, nearExpiryResponse] = await Promise.all([
                api.get('/api/medicine-expiry/expired'),
                api.get('/api/medicine-expiry/near-expiry')
            ]);
            
            setExpiredMedicines(expiredResponse.data);
            setNearExpiryMedicines(nearExpiryResponse.data);
            
            if (onDataUpdate) onDataUpdate();
        } catch (error) {
            console.error('Error loading expiry data:', error);
            toast.error('Failed to load expiry data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine record?')) return;
        
        try {
            await api.delete(`/api/medicine-expiry/${id}`);
            toast.success('Medicine record deleted successfully');
            loadExpiryData();
        } catch (error) {
            console.error('Error deleting medicine:', error);
            toast.error('Failed to delete medicine record');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/api/medicine-expiry/${id}/status?status=${newStatus}`);
            toast.success(`Status updated to ${newStatus}`);
            loadExpiryData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                        🚨 Expired Medicines
                    </h3>
                    <p className="text-3xl font-bold text-red-600">{expiredMedicines.length}</p>
                    <p className="text-sm text-red-600 mt-1">Require immediate attention</p>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">
                        ⚠️ Near Expiry (7 days)
                    </h3>
                    <p className="text-3xl font-bold text-orange-600">{nearExpiryMedicines.length}</p>
                    <p className="text-sm text-orange-600 mt-1">Expiring within 7 days</p>
                </div>
            </div>

            {/* Expired Medicines */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-t-lg border-b">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                        🚨 Expired Medicines ({expiredMedicines.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Medicine</th>
                                <th className="px-4 py-3 text-left">Batch</th>
                                <th className="px-4 py-3 text-left">Expired Date</th>
                                <th className="px-4 py-3 text-left">Days Overdue</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiredMedicines.map(medicine => (
                                <tr key={medicine.id} className="border-b dark:border-gray-700 bg-red-50/30">
                                    <td className="px-4 py-3 font-medium">{medicine.medicineName}</td>
                                    <td className="px-4 py-3 font-mono text-sm">{medicine.batchNumber}</td>
                                    <td className="px-4 py-3">{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                                            {Math.abs(medicine.daysUntilExpiry)} days ago
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{medicine.quantity}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleStatusUpdate(medicine.id, 'DISPOSED')}
                                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                                            >
                                                Mark Disposed
                                            </button>
                                            <button
                                                onClick={() => handleDelete(medicine.id)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {expiredMedicines.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">✅</div>
                            <p>No expired medicines</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Near Expiry Medicines */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-t-lg border-b">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                        ⚠️ Near Expiry Medicines ({nearExpiryMedicines.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Medicine</th>
                                <th className="px-4 py-3 text-left">Batch</th>
                                <th className="px-4 py-3 text-left">Expiry Date</th>
                                <th className="px-4 py-3 text-left">Days Left</th>
                                <th className="px-4 py-3 text-left">Quantity</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nearExpiryMedicines.map(medicine => (
                                <tr key={medicine.id} className="border-b dark:border-gray-700 bg-orange-50/30">
                                    <td className="px-4 py-3 font-medium">{medicine.medicineName}</td>
                                    <td className="px-4 py-3 font-mono text-sm">{medicine.batchNumber}</td>
                                    <td className="px-4 py-3">{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            medicine.daysUntilExpiry <= 1
                                                ? 'bg-red-100 text-red-800'
                                                : medicine.daysUntilExpiry <= 3
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {medicine.daysUntilExpiry} days
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{medicine.quantity}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleStatusUpdate(medicine.id, 'EXPIRING_SOON')}
                                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                                            >
                                                Mark Expiring
                                            </button>
                                            <button
                                                onClick={() => handleDelete(medicine.id)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {nearExpiryMedicines.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">👍</div>
                            <p>No medicines expiring soon</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={loadExpiryData}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                    🔄 Refresh Data
                </button>
            </div>
        </div>
    );
}