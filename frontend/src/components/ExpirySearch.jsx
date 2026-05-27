import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ExpirySearch({ onDataUpdate }) {
    const [searchResults, setSearchResults] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [searchCriteria, setSearchCriteria] = useState({
        medicineId: '',
        medicineName: '',
        batchNumber: '',
        supplierName: '',
        expiryDateFrom: '',
        expiryDateTo: '',
        manufactureDateFrom: '',
        manufactureDateTo: '',
        status: '',
        expired: false,
        expiringSoon: false,
        nearExpiry: false,
        daysUntilExpiry: ''
    });

    const [savedSearches, setSavedSearches] = useState([]);

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'EXPIRED', label: 'Expired' },
        { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
        { value: 'DISPOSED', label: 'Disposed' },
        { value: 'RECALLED', label: 'Recalled' }
    ];

    useEffect(() => {
        loadMedicines();
        loadSavedSearches();
    }, []);

    const loadMedicines = async () => {
        try {
            const { data } = await api.get('/api/medicines');
            setMedicines(data);
        } catch (error) {
            console.error('Error loading medicines:', error);
            toast.error('Failed to load medicines');
        }
    };

    const loadSavedSearches = () => {
        const saved = localStorage.getItem('expirySearches');
        if (saved) {
            setSavedSearches(JSON.parse(saved));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchCriteria(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Filter out empty values
            const searchPayload = Object.entries(searchCriteria)
                .filter(([key, value]) => {
                    if (typeof value === 'boolean') return value;
                    return value !== '' && value !== null && value !== undefined;
                })
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});

            const { data } = await api.post('/api/medicine-expiry/search', searchPayload);
            setSearchResults(data);
            
            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            console.error('Error searching:', error);
            setError('Failed to search expiry records');
            toast.error('Failed to search expiry records');
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchCriteria({
            medicineId: '',
            medicineName: '',
            batchNumber: '',
            supplierName: '',
            expiryDateFrom: '',
            expiryDateTo: '',
            manufactureDateFrom: '',
            manufactureDateTo: '',
            status: '',
            expired: false,
            expiringSoon: false,
            nearExpiry: false,
            daysUntilExpiry: ''
        });
        setSearchResults([]);
        setError(null);
    };

    const saveSearch = () => {
        const searchName = prompt('Enter a name for this search:');
        if (searchName) {
            const newSearch = {
                id: Date.now(),
                name: searchName,
                criteria: { ...searchCriteria },
                createdAt: new Date().toISOString()
            };
            
            const updatedSearches = [...savedSearches, newSearch];
            setSavedSearches(updatedSearches);
            localStorage.setItem('expirySearches', JSON.stringify(updatedSearches));
            toast.success('Search saved successfully');
        }
    };

    const loadSavedSearch = (search) => {
        setSearchCriteria(search.criteria);
        toast.success(`Loaded search: ${search.name}`);
    };

    const deleteSavedSearch = (searchId) => {
        if (window.confirm('Are you sure you want to delete this saved search?')) {
            const updatedSearches = savedSearches.filter(s => s.id !== searchId);
            setSavedSearches(updatedSearches);
            localStorage.setItem('expirySearches', JSON.stringify(updatedSearches));
            toast.success('Saved search deleted');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/api/medicine-expiry/${id}/status?status=${newStatus}`);
            toast.success(`Status updated to ${newStatus}`);
            // Re-run the search to get updated results
            handleSearch({ preventDefault: () => {} });
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'EXPIRED': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            'EXPIRING_SOON': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'DISPOSED': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            'RECALLED': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        };
        return colorMap[status] || colorMap.ACTIVE;
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

    const exportResults = () => {
        if (searchResults.length === 0) {
            toast.warning('No results to export');
            return;
        }

        const csvData = searchResults.map(record => ({
            'Medicine': record.medicineName,
            'Batch Number': record.batchNumber,
            'Expiry Date': new Date(record.expiryDate).toLocaleDateString(),
            'Days Until Expiry': record.daysUntilExpiry,
            'Quantity': record.quantity,
            'Purchase Price': record.purchasePrice || '',
            'Supplier': record.supplierName || '',
            'Status': record.status,
            'Notes': record.notes || ''
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `expiry-search-results-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast.success('Results exported successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    🔍 Advanced Expiry Search
                </h2>
                <div className="flex space-x-2">
                    {searchResults.length > 0 && (
                        <button
                            onClick={exportResults}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            📤 Export Results
                        </button>
                    )}
                    {Object.values(searchCriteria).some(val => val !== '' && val !== false) && (
                        <button
                            onClick={saveSearch}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                            💾 Save Search
                        </button>
                    )}
                </div>
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3">💾 Saved Searches</h3>
                    <div className="flex flex-wrap gap-2">
                        {savedSearches.map(search => (
                            <div key={search.id} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                                <button
                                    onClick={() => loadSavedSearch(search)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mr-2"
                                >
                                    {search.name}
                                </button>
                                <button
                                    onClick={() => deleteSavedSearch(search.id)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">🔍 Search Criteria</h3>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Medicine Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Medicine
                            </label>
                            <select
                                name="medicineId"
                                value={searchCriteria.medicineId}
                                onChange={handleInputChange}
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

                        {/* Medicine Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Medicine Name (contains)
                            </label>
                            <input
                                type="text"
                                name="medicineName"
                                value={searchCriteria.medicineName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Search by medicine name"
                            />
                        </div>

                        {/* Batch Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Batch Number
                            </label>
                            <input
                                type="text"
                                name="batchNumber"
                                value={searchCriteria.batchNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Search by batch number"
                            />
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Supplier Name
                            </label>
                            <input
                                type="text"
                                name="supplierName"
                                value={searchCriteria.supplierName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Search by supplier"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={searchCriteria.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Days Until Expiry */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Days Until Expiry (max)
                            </label>
                            <input
                                type="number"
                                name="daysUntilExpiry"
                                value={searchCriteria.daysUntilExpiry}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="e.g., 30"
                            />
                        </div>

                        {/* Expiry Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Date From
                            </label>
                            <input
                                type="date"
                                name="expiryDateFrom"
                                value={searchCriteria.expiryDateFrom}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Date To
                            </label>
                            <input
                                type="date"
                                name="expiryDateTo"
                                value={searchCriteria.expiryDateTo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="expired"
                                checked={searchCriteria.expired}
                                onChange={handleInputChange}
                                className="rounded mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show only expired</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="expiringSoon"
                                checked={searchCriteria.expiringSoon}
                                onChange={handleInputChange}
                                className="rounded mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show expiring soon (30 days)</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="nearExpiry"
                                checked={searchCriteria.nearExpiry}
                                onChange={handleInputChange}
                                className="rounded mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show near expiry (7 days)</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                        >
                            {loading ? '🔍 Searching...' : '🔍 Search'}
                        </button>
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">❌</span>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">
                            📊 Search Results ({searchResults.length} found)
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
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
                                        Supplier
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
                                {searchResults.map(record => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                            {record.supplierName || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-1">
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
                                                    {statusOptions.filter(opt => opt.value !== '' && opt.value !== record.status).map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Results Message */}
            {!loading && searchResults.length === 0 && Object.values(searchCriteria).some(val => val !== '' && val !== false) && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-lg">No results found</div>
                    <div className="text-sm">Try adjusting your search criteria</div>
                </div>
            )}
        </div>
    );
}