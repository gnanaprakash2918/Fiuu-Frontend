// src/components/AddDeviceForm.jsx
import { useState } from 'react';
import axios from 'axios';

function AddDeviceForm({ onDeviceAdded, onCancel }) {
    const [name, setName] = useState('');
    const [applicationCode, setApplicationCode] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(
                'http://localhost:8080/add-device',
                { name, application_code: applicationCode, secret_key: secretKey },
                {
                    headers: { 'token': token }
                }
            );
            onDeviceAdded(response.data);
            setName('');
            setApplicationCode('');
            setSecretKey('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add device.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
            <h3 className="text-xl font-bold mb-4">Add New Device</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-center">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Application Code</label>
                    <input type="text" value={applicationCode} onChange={(e) => setApplicationCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                    <input type="text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Device'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddDeviceForm;