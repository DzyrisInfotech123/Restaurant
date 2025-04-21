import React, { useState, useEffect } from 'react';
import { Select, Button, Checkbox, Dropdown, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const DistributorVendorMapping = () => {
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorList, setDistributorList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [vendorMappings, setVendorMappings] = useState({});
  const [frozenVendorId, setFrozenVendorId] = useState(null);

  useEffect(() => {
    axios
      .get('https://dev.digitalexamregistration.com/api/getDistributor')
      .then((res) => setDistributorList(res.data || []))
      .catch((err) => console.error('Distributor fetch error:', err));

    axios
      .get('https://dev.digitalexamregistration.com/api/getVendor')
      .then((res) => {
        const vendors = res.data || [];
        setVendorList(vendors);
        const frozen = vendors.find(v => v.vendorName === 'Dzyris Frozen Foods');
        if (frozen) {
          setFrozenVendorId(frozen._id);
        }
      })
      .catch((err) => console.error('Vendor fetch error:', err));

      axios
      .get('https://dev.digitalexamregistration.com/api/getMappings')
      .then((res) => {
        const rawMappings = res.data || {};
        const formattedMappings = {};
    
        Object.entries(rawMappings).forEach(([vendorId, data]) => {
          formattedMappings[vendorId] = data.distributors || [];
        });
    
        setVendorMappings(formattedMappings);
      })
    
      .catch((err) => console.error('Mapping fetch error:', err));
  }, []);

  useEffect(() => {
    if (frozenVendorId && distributorList.length > 0) {
      setVendorMappings(prev => ({
        ...prev,
        [frozenVendorId]: distributorList.map(d => d.distributorName),
      }));
    }
  }, [distributorList, frozenVendorId]);

  const handleDistributorChange = (value) => {
    setSelectedDistributor(value);
    const mappedVendors = Object.entries(vendorMappings)
      .filter(([_, distributors]) => Array.isArray(distributors) && distributors.includes(value))
      .map(([vendorId]) => vendorId);

    if (frozenVendorId && !mappedVendors.includes(frozenVendorId)) {
      mappedVendors.push(frozenVendorId);
    }

    setSelectedVendors(mappedVendors);
  };

  const handleVendorCheckboxChange = (vendorId) => {
    let updatedSelected = [...selectedVendors];
    if (updatedSelected.includes(vendorId)) {
      updatedSelected = updatedSelected.filter((id) => id !== vendorId);
    } else {
      updatedSelected.push(vendorId);
    }
    setSelectedVendors(updatedSelected);

    const updatedMapping = { ...vendorMappings };
    vendorList.forEach((vendor) => {
      if (!Array.isArray(updatedMapping[vendor._id])) updatedMapping[vendor._id] = [];
    });

    const currentMap = Array.isArray(updatedMapping[vendorId]) ? updatedMapping[vendorId] : [];

    updatedMapping[vendorId] = updatedSelected.includes(vendorId)
      ? [...new Set([...currentMap, selectedDistributor])]
      : currentMap.filter((d) => d !== selectedDistributor);

    setVendorMappings(updatedMapping);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('https://dev.digitalexamregistration.com/api/saveMappings', vendorMappings);
      if (response.status === 200) {
        message.success('Mappings saved successfully!');
      } else {
        message.error('Failed to save mappings.');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'An error occurred while saving.';
      message.error(errorMsg);
    }
  };

  const handleReset = () => {
    setSelectedDistributor(null);
    setSelectedVendors([]);
  };

  const vendorDropdownMenu = {
    items: vendorList.map((vendor) => ({
      key: vendor._id,
      label: (
        <Checkbox
          checked={
            vendor._id === frozenVendorId
              ? true
              : selectedVendors.includes(vendor._id)
          }
          disabled={vendor._id === frozenVendorId}
          onChange={() => handleVendorCheckboxChange(vendor._id)}
        >
          {vendor.vendorName} ({vendor.state})
        </Checkbox>
      ),
    })),
  };

  return (
    <div
      style={{
        maxWidth: '1050px',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #ccc',
        margin: '0 auto',
        paddingBottom: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#d3dbe6',
          padding: '10px',
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Distributor Vendor Mapping
      </div>

      {/* Distributor Selection */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 30px 10px' }}>
        <label style={{ width: '160px', fontWeight: 'bold', fontSize: '14px' }}>
          Distributor Name
        </label>
        <Select
          style={{ width: '300px' }}
          placeholder="Select Distributor Name"
          value={selectedDistributor}
          onChange={handleDistributorChange}
        >
          {distributorList.map((d) => (
            <Option key={d._id} value={d.distributorName}>
              {d.distributorName}
            </Option>
          ))}
        </Select>
      </div>

      {/* Vendor Dropdown */}
      {selectedDistributor && (
        <div style={{ padding: '10px 30px' }}>
          <label style={{ fontWeight: 'bold' }}>Select Vendors:</label>
          <div style={{ marginTop: '5px' }}>
            <Dropdown menu={vendorDropdownMenu} trigger={['click']}>
              <Button>Select Vendors</Button>
            </Dropdown>
          </div>
          <div style={{ marginTop: '10px' }}>
            Selected:{' '}
            {selectedVendors.map((id) => {
              const vendor = vendorList.find((v) => v._id === id);
              return vendor?.vendorName;
            }).join(', ') || 'None'}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          padding: '10px 30px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <Button
          type="primary"
          style={{
            backgroundColor: '#2c66b8',
            borderColor: '#2c66b8',
            borderRadius: '6px',
            fontWeight: 'bold',
            width: '80px',
          }}
          onClick={handleSave}
          disabled={!selectedDistributor}
        >
          Save
        </Button>
        <Button
          style={{
            backgroundColor: '#2c66b8',
            color: 'white',
            borderColor: '#2c66b8',
            borderRadius: '6px',
            fontWeight: 'bold',
            width: '80px',
          }}
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      {/* Vendor Mapping Summary Table */}
      <table
        style={{
          width: 'calc(100% - 60px)',
          margin: '10px 30px',
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Vendor Name</th>
            <th style={tableHeaderStyle}>State</th>
            <th style={tableHeaderStyle}>Mapped Distributors</th>
          </tr>
        </thead>
        <tbody>
          {vendorList.map((vendor) => (
            <tr key={vendor._id}>
              <td style={tableCellStyle}>{vendor.vendorName}</td>
              <td style={tableCellStyle}>{vendor.state}</td>
              <td style={tableCellStyle}>
                {(Array.isArray(vendorMappings[vendor._id]) ? vendorMappings[vendor._id] : []).join(', ') || 'None'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tableHeaderStyle = {
  border: '1px solid black',
  padding: '8px',
  fontWeight: 'bold',
  textAlign: 'center',
};

const tableCellStyle = {
  border: '1px solid black',
  padding: '8px',
  textAlign: 'center',
};

export default DistributorVendorMapping;
