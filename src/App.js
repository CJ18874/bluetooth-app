import React, { useState } from 'react';

function App() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [message, setMessage] = useState('');

  const targetDevices = ['WIDI Jack', 'WIDI Jack2', 'WIDI Jack3'];

  const scanDevices = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'WIDI Jack' }],
        optionalServices: ['battery_service'],
      });

      if (targetDevices.includes(device.name)) {
        const isConnected = device.gatt.connected;
        setDevices((prevDevices) => [
          ...prevDevices,
          { device, status: isConnected ? 'Connected' : 'Online' },
        ]);
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      setMessage('Error scanning for devices.');
    }
  };

  const connectDevice = async () => {
    const deviceToConnect = devices.find(d => d.device.name === selectedDevice);
    if (deviceToConnect) {
      try {
        const server = await deviceToConnect.device.gatt.connect();
        setConnectedDevice(deviceToConnect.device);
        updateDeviceStatus(deviceToConnect.device, 'Connected');
        setMessage(`Connected to ${deviceToConnect.device.name}`);
      } catch (error) {
        console.error('Error connecting to device:', error);
        setMessage(`Error connecting to ${deviceToConnect.device.name}`);
      }
    } else {
      setMessage('Please select a device to connect.');
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.gatt.disconnect();
        updateDeviceStatus(connectedDevice, 'Online');
        setConnectedDevice(null);
        setMessage(`Disconnected from ${connectedDevice.name}`);
      } catch (error) {
        console.error('Error disconnecting from device:', error);
        setMessage(`Error disconnecting from ${connectedDevice.name}`);
      }
    }
  };

  const updateDeviceStatus = (device, status) => {
    setDevices((prevDevices) =>
      prevDevices.map((d) =>
        d.device === device ? { ...d, status } : d
      )
    );
  };

  return (
    <div className="App">
      <h1>Bluetooth Device Manager</h1>
      <select onChange={(e) => setSelectedDevice(e.target.value)} value={selectedDevice}>
        <option value="">Select a device</option>
        {targetDevices.map((device, index) => (
          <option key={index} value={device}>{device}</option>
        ))}
      </select>
      <button onClick={scanDevices}>Scan Devices</button>
      <button onClick={connectDevice} disabled={!selectedDevice}>Connect</button>
      <button onClick={disconnectDevice} disabled={!connectedDevice}>Disconnect</button>
      <ul>
        {devices.map((d, index) => (
          <li key={index}>
            {d.device.name || 'Unnamed Device'} - {d.status}
          </li>
        ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;