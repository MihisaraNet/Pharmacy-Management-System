import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function SimpleExpiryNotifications({ onDataUpdate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            // Only get expired and near expiry notifications
            const [expiredResponse, nearExpiryResponse] = await Promise.all([
                api.get('/api/notifications/expired'),
                api.get('/api/notifications/near-expiry')
            ]);
            
            const allNotifications = [
                ...expiredResponse.data,
                ...nearExpiryResponse.data
            ];
            
            // Sort by urgency (expired first, then by days until expiry)
            allNotifications.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'DANGER' ? -1 : 1; // DANGER (expired) first
                }
                return a.daysUntilExpiry - b.daysUntilExpiry;
            });
            
            setNotifications(allNotifications);
            
            if (onDataUpdate) onDataUpdate();
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (expiryRecordId, newStatus) => {
        try {
            await api.put(`/api/medicine-expiry/${expiryRecordId}/status?status=${newStatus}`);
            toast.success(`Status updated to ${newStatus}`);
            loadNotifications();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (expiryRecordId) => {
        if (!window.confirm('Are you sure you want to delete this medicine record?')) return;
        
        try {
            await api.delete(`/api/medicine-expiry/${expiryRecordId}`);
            toast.success('Medicine record deleted successfully');
            loadNotifications();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete medicine record');
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    🔔 Expiry Notifications
                </h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {notifications.filter(n => n.type === 'DANGER').length} expired • {notifications.filter(n => n.type === 'WARNING').length} near expiry
                    </span>
                    <button
                        onClick={loadNotifications}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Expired</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {notifications.filter(n => n.type === 'DANGER').length}
                            </p>
                        </div>
                        <div className="text-3xl">🚨</div>
                    </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Near Expiry</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {notifications.filter(n => n.type === 'WARNING').length}
                            </p>
                        </div>
                        <div className="text-3xl">⚠️</div>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border-l-4 shadow-md ${
                                notification.type === 'DANGER'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl mr-3">
                                            {notification.type === 'DANGER' ? '🚨' : '⚠️'}
                                        </span>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                {notification.medicineName}
                                            </h4>
                                            <p className="text-sm opacity-75">
                                                Batch: {notification.batchNumber} • 
                                                Quantity: {notification.quantity} • 
                                                {notification.daysUntilExpiry < 0 
                                                    ? `${Math.abs(notification.daysUntilExpiry)} days overdue`
                                                    : `${notification.daysUntilExpiry} days left`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm mb-3 font-medium">
                                        {notification.message}
                                    </p>
                                </div>

                                <div className="ml-4 flex flex-col space-y-2">
                                    {notification.type === 'DANGER' && (
                                        <button
                                            onClick={() => handleStatusUpdate(notification.expiryRecordId, 'DISPOSED')}
                                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs"
                                        >
                                            Mark Disposed
                                        </button>
                                    )}
                                    
                                    {notification.type === 'WARNING' && (
                                        <button
                                            onClick={() => handleStatusUpdate(notification.expiryRecordId, 'EXPIRING_SOON')}
                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                                        >
                                            Mark Expiring
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => handleDelete(notification.expiryRecordId)}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                    >
                                        Delete Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="text-6xl mb-4">✅</div>
                        <div className="text-lg">No urgent notifications</div>
                        <div className="text-sm">All medicines are within safe expiry periods</div>
                    </div>
                )}
            </div>
        </div>
    );
}