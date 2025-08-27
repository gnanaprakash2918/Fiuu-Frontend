// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [qrAmount, setQrAmount] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    application_code: "",
    secret_key: "",
  });
  const [addForm, setAddForm] = useState({
    name: "",
    application_code: "",
    secret_key: "",
  });

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:8080/devices", {
        headers: { token: token },
      });
      setDevices(response.data);
      if (response.data.length > 0) {
        setSelectedDeviceId(response.data[0].id);
      }
    } catch (err) {
      setError("Failed to fetch devices.");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    if (!selectedDeviceId || !qrAmount) {
      setError("Please select a device and enter an amount.");
      return;
    }

    setLoading(true);
    setQrImageUrl(null);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:8080/generate-qr",
        {
          amount: parseFloat(qrAmount),
          device_id: selectedDeviceId,
        },
        {
          headers: { token: token },
        }
      );

      setQrImageUrl(response.data.qr_url);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://localhost:8080/add-device",
        {
          ...addForm,
          name: addForm.name,
          application_code: addForm.application_code,
          secret_key: addForm.secret_key,
        },
        {
          headers: { token: token },
        }
      );
      fetchDevices();
      setIsAdding(false);
      setAddForm({ name: "", application_code: "", secret_key: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add device.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `http://localhost:8080/devices/${editForm.id}`,
        {
          ...editForm,
          name: editForm.name,
          application_code: editForm.application_code,
          secret_key: editForm.secret_key,
        },
        {
          headers: { token: token },
        }
      );
      fetchDevices();
      setIsEditing(false);
      setEditForm({ id: null, name: "", application_code: "", secret_key: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update device.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:8080/devices/${deviceId}`, {
        headers: { token: token },
      });
      fetchDevices();
    } catch (err) {
      setError("Failed to delete device.");
    }
  };

  const startEditing = (device) => {
    setIsEditing(true);
    setEditForm({
      id: device.id,
      // Map backend device_name to frontend's name field
      name: device.device_name,
      application_code: device.application_code,
      secret_key: device.secret_key,
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({ id: null, name: "", application_code: "", secret_key: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-6">QR Code Generator</h2>
          <form onSubmit={handleGenerateQR} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Device
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              >
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.device_name} {/* <-- Fix here */}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (MYR)
              </label>
              <input
                type="number"
                step="0.01"
                value={qrAmount}
                onChange={(e) => setQrAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 10.50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate QR Code"}
            </button>
          </form>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-4">Generated QR Code</h3>
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="Generated QR Code"
              className="w-64 h-64 border border-gray-300 rounded-md"
            />
          ) : (
            <div className="w-64 h-64 border border-gray-300 rounded-md flex items-center justify-center text-gray-400">
              QR Code will appear here
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Devices</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add New Device
            </button>
          </div>

          {isAdding && (
            <form
              onSubmit={handleAddDevice}
              className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4 mb-4"
            >
              <h4 className="font-semibold">Add a New Device</h4>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Code
                </label>
                <input
                  type="text"
                  value={addForm.application_code}
                  onChange={(e) =>
                    setAddForm({ ...addForm, application_code: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={addForm.secret_key}
                  onChange={(e) =>
                    setAddForm({ ...addForm, secret_key: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="py-2 px-4 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  disabled={loading}
                >
                  Add Device
                </button>
              </div>
            </form>
          )}

          {isEditing && (
            <form
              onSubmit={handleEditDevice}
              className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4 mb-4"
            >
              <h4 className="font-semibold">Edit Device</h4>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Code
                </label>
                <input
                  type="text"
                  value={editForm.application_code}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      application_code: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={editForm.secret_key}
                  onChange={(e) =>
                    setEditForm({ ...editForm, secret_key: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="py-2 px-4 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          <ul className="mt-4 space-y-4">
            {devices.map((device) => (
              <li
                key={device.id}
                className="bg-gray-50 p-4 rounded-md shadow-sm flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold">{device.device_name}</h4>{" "}
                  {/* <-- Fix here */}
                  <p className="text-sm text-gray-600">
                    App Code: {device.application_code}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEditing(device)}
                    className="text-indigo-500 hover:text-indigo-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
