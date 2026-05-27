import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ExpiryNotifications({ onDataUpdate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: 'ALL',
        urgent: 'ALL'
    });
    const [filteredNotifications, setFilteredNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, notifications]);

    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/api/notifications');
            setNotifications(data);
            
            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            setError('Failed to load notifications');
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...notifications];

        if (filters.type !== 'ALL') {
            filtered = filtered.filter(notification => notification.type === filters.type);
        }

        if (filters.urgent === 'YES') {
            filtered = filtered.filter(notification => notification.urgent);
        } else if (filters.urgent === 'NO') {
            filtered = filtered.filter(notification => !notification.urgent);
        }

        // Sort by urgency and then by days until expiry
        filtered.sort((a, b) => {
            if (a.urgent !== b.urgent) {
                return b.urgent - a.urgent; // Urgent first
            }
            return a.daysUntilExpiry - b.daysUntilExpiry; // Closest expiry first
        });

        setFilteredNotifications(filtered);
    };

    const getNotificationIcon = (type, urgent) => {
        if (urgent) return '🚨';
        switch (type) {
            case 'DANGER': return '⚠️';
            case 'WARNING': return '🟡';
            case 'INFO': return '🔵';
            default: return '📢';
        }
    };

    const getNotificationColor = (type, urgent) => {
        if (urgent) {
            return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300';
        }
        
        switch (type) {
            case 'DANGER':
                return 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/10 dark:border-red-600 dark:text-red-400';
            case 'WARNING':
                return 'bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/10 dark:border-yellow-600 dark:text-yellow-400';
            case 'INFO':
                return 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/10 dark:border-blue-600 dark:text-blue-400';
            default:
                return 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-900/10 dark:border-gray-600 dark:text-gray-400';
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

    const getDaysText = (days) => {
        if (days < 0) {
            return `${Math.abs(days)} days overdue`;
        } else if (days === 0) {
            return 'Expires today';
        } else {
            return `${days} days left`;
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading notifications...</p>
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
                    onClick={loadNotifications}
                    className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                    Retry
                </button>
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
                        {filteredNotifications.filter(n => n.urgent).length} urgent alerts
                    </span>
                    <button
                        onClick={loadNotifications}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Alerts</p>
                            <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                        </div>
                        <div className="text-3xl">📢</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Urgent</p>
                            <p className="text-2xl font-bold text-red-600">
                                {notifications.filter(n => n.urgent).length}
                            </p>
                        </div>
                        <div className="text-3xl">🚨</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expired</p>
                            <p className="text-2xl font-bold text-red-600">
                                {notifications.filter(n => n.type === 'DANGER').length}
                            </p>
                        </div>
                        <div className="text-3xl">⚠️</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Expiring Soon</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {notifications.filter(n => n.type === 'WARNING').length}
                            </p>
                        </div>
                        <div className="text-3xl">🟡</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">🔍 Filter Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="ALL">All Types</option>
                            <option value="DANGER">Expired (Danger)</option>
                            <option value="WARNING">Expiring Soon (Warning)</option>
                            <option value="INFO">Information</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Urgency
                        </label>
                        <select
                            value={filters.urgent}
                            onChange={(e) => setFilters({ ...filters, urgent: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="YES">Urgent Only</option>
                            <option value="NO">Non-Urgent</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Showing {filteredNotifications.length} of {notifications.length} notifications
                    </span>
                    <button
                        onClick={() => setFilters({ type: 'ALL', urgent: 'ALL' })}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                        🗑️ Clear Filters
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`border-l-4 p-4 rounded-lg shadow-md ${getNotificationColor(notification.type, notification.urgent)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <span className="text-2xl mr-3">
                                            {getNotificationIcon(notification.type, notification.urgent)}
                                        </span>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                {notification.medicineName}
                                            </h4>
                                            <p className="text-sm opacity-75">
                                                Batch: {notification.batchNumber} • 
                                                Quantity: {notification.quantity} • 
                                                {getDaysText(notification.daysUntilExpiry)}
                                            </p>
                                        </div>
                                        {notification.urgent && (
                                            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                                URGENT
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm mb-3">
                                        {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs opacity-75">
                                        <span>ID: #{notification.expiryRecordId}</span>
                                        <span>{formatTimestamp(notification.timestamp)}</span>
                                    </div>
                                </div>

                                <div className="ml-4 flex flex-col space-y-2">
                                    {notification.type === 'DANGER' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(notification.expiryRecordId, 'DISPOSED')}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                title="Mark as Disposed"
                                            >
                                                🗑️ Dispose
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(notification.expiryRecordId, 'RECALLED')}
                                                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors"
                                                title="Mark as Recalled"
                                            >
                                                📞 Recall
                                            </button>
                                        </>
                                    )}
                                    
                                    {notification.type === 'WARNING' && (
                                        <button
                                            onClick={() => handleStatusUpdate(notification.expiryRecordId, 'EXPIRING_SOON')}
                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs transition-colors"
                                            title="Mark as Expiring Soon"
                                        >
                                            ⚡ Mark Expiring
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {notifications.length === 0 ? (
                            <div>
                                <div className="text-6xl mb-4">✅</div>
                                <div className="text-lg">No notifications</div>
                                <div className="text-sm">All medicines are within safe expiry periods</div>
                            </div>
                        ) : (
                            <div>
                                <div className="text-6xl mb-4">🔍</div>
                                <div className="text-lg">No notifications match your filters</div>
                                <div className="text-sm">Try adjusting your filter criteria</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions Footer */}
            {filteredNotifications.filter(n => n.urgent).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-red-500 text-xl mr-2">🚨</span>
                            <span className="text-red-700 dark:text-red-300 font-medium">
                                {filteredNotifications.filter(n => n.urgent).length} urgent notifications require immediate attention
                            </span>
                        </div>
                        <button
                            onClick={() => setFilters({ ...filters, urgent: 'YES' })}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                        >
                            Show Only Urgent
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}