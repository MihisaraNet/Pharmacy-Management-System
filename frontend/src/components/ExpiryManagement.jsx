import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ExpiryManagement({ onDataUpdate }) {
    const [expiryRecords, setExpiryRecords] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecords, setSelectedRecords] = useState([]);
    
    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        medicineId: '',
        batchNumber: '',
        expiryDate: '',
        manufactureDate: '',
        quantity: '',
        purchasePrice: '',
        supplierName: '',
        status: 'ACTIVE',
        notes: ''
    });

    // Filter states
    const [filters, setFilters] = useState({
        status: 'ALL',
        search: '',
        dateFrom: '',
        dateTo: ''
    });

    const [filteredRecords, setFilteredRecords] = useState([]);

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active', color: 'green' },
        { value: 'EXPIRED', label: 'Expired', color: 'red' },
        { value: 'EXPIRING_SOON', label: 'Expiring Soon', color: 'yellow' },
        { value: 'DISPOSED', label: 'Disposed', color: 'gray' },
        { value: 'RECALLED', label: 'Recalled', color: 'orange' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, expiryRecords]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [expiryResponse, medicinesResponse] = await Promise.all([
                api.get('/api/medicine-expiry'),
                api.get('/api/medicines')
            ]);
            
            setExpiryRecords(expiryResponse.data);
            setMedicines(medicinesResponse.data);
            
            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...expiryRecords];

        if (filters.status !== 'ALL') {
            filtered = filtered.filter(record => record.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(record =>
                record.medicineName?.toLowerCase().includes(searchLower) ||
                record.batchNumber?.toLowerCase().includes(searchLower) ||
                record.supplierName?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(record =>
                new Date(record.expiryDate) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filtered = filtered.filter(record =>
                new Date(record.expiryDate) <= new Date(filters.dateTo)
            );
        }

        setFilteredRecords(filtered);
    };

    const resetForm = () => {
        setFormData({
            medicineId: '',
            batchNumber: '',
            expiryDate: '',
            manufactureDate: '',
            quantity: '',
            purchasePrice: '',
            supplierName: '',
            status: 'ACTIVE',
            notes: ''
        });
        setEditingRecord(null);
        setShowAddForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.medicineId || !formData.batchNumber || !formData.expiryDate || !formData.quantity) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const payload = {
                ...formData,
                quantity: parseInt(formData.quantity),
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null
            };

            if (editingRecord) {
                await api.put(`/api/medicine-expiry/${editingRecord.id}`, payload);
                toast.success('Medicine expiry record updated successfully');
            } else {
                await api.post('/api/medicine-expiry', payload);
                toast.success('Medicine expiry record created successfully');
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving record:', error);
            toast.error('Failed to save medicine expiry record');
        }
    };

    const handleEdit = (record) => {
        setFormData({
            medicineId: record.medicineId,
            batchNumber: record.batchNumber,
            expiryDate: record.expiryDate,
            manufactureDate: record.manufactureDate || '',
            quantity: record.quantity.toString(),
            purchasePrice: record.purchasePrice ? record.purchasePrice.toString() : '',
            supplierName: record.supplierName || '',
            status: record.status,
            notes: record.notes || ''
        });
        setEditingRecord(record);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expiry record?')) {
            return;
        }

        try {
            await api.delete(`/api/medicine-expiry/${id}`);
            toast.success('Medicine expiry record deleted successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete medicine expiry record');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/api/medicine-expiry/${id}/status?status=${newStatus}`);
            toast.success(`Status updated to ${newStatus}`);
            loadData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSelectRecord = (id) => {
        setSelectedRecords(prev =>
            prev.includes(id)
                ? prev.filter(recordId => recordId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredRecords.map(record => record.id));
        }
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        const colorMap = {
            green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        };
        return colorMap[statusOption?.color] || colorMap.gray;
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
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading expiry records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    💊 Medicine Expiry Management
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                        {showAddForm ? '❌ Cancel' : '➕ Add Record'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingRecord ? '✏️ Edit Expiry Record' : '➕ Add New Expiry Record'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Medicine *
                                </label>
                                <select
                                    name="medicineId"
                                    value={formData.medicineId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Medicine</option>
                                    {medicines.map(medicine => (
                                        <option key={medicine.id} value={medicine.id}>
                                            {medicine.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Batch Number *
                                </label>
                                <input
                                    type="text"
                                    name="batchNumber"
                                    value={formData.batchNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Purchase Price
                                </label>
                                <input
                                    type="number"
                                    name="purchasePrice"
                                    value={formData.purchasePrice}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Supplier Name
                                </label>
                                <input
                                    type="text"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                {editingRecord ? '💾 Update Record' : '➕ Create Record'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">🔍 Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="ALL">All Status</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search medicine, batch, supplier..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />

                    <input
                        type="date"
                        placeholder="Expiry From"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />

                    <input
                        type="date"
                        placeholder="Expiry To"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Expiry Records Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Medicine
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Batch
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Expiry Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Days Left
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRecords.includes(record.id)}
                                            onChange={() => handleSelectRecord(record.id)}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {record.medicineName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                                            {record.batchNumber}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        {new Date(record.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            record.daysUntilExpiry < 0
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                : record.daysUntilExpiry <= 7
                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                : record.daysUntilExpiry <= 30
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        }`}>
                                            {getDaysText(record.daysUntilExpiry)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                        {record.quantity}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                                            {record.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleStatusUpdate(record.id, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="px-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                                                title="Update Status"
                                            >
                                                <option value="">🔄</option>
                                                {statusOptions.filter(opt => opt.value !== record.status).map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleDelete(record.id)}
                                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="text-6xl mb-4">💊</div>
                            <div className="text-lg">No expiry records found</div>
                            <div className="text-sm">Try adjusting your filters or add new records</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}