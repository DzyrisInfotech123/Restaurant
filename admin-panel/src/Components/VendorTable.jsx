import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Modal } from 'antd';
import axios from './Services/Api'; 
import VendorManagement from './VendorManagement'; 

const VendorTable = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null); 

  const fetchVendors = async () => {
    try {
      const { data } = await axios.get('/getVendor'); 
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      message.error('Failed to fetch vendors.');
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (id) => {
    try {
      await axios.delete(`/deleteVendor/${id}`); 
      message.success('Vendor deleted successfully!');
      fetchVendors(); 
    } catch (error) {
      message.error('Failed to delete vendor.');
    }
  };

  const handleEditClick = (vendor) => {
    setEditingVendor(vendor); 
    setIsModalOpen(true); 
  };

  const handleModalClose = () => {
    setEditingVendor(null); 
    setIsModalOpen(false); 
  };

  const handleEditSuccess = () => {
    handleModalClose(); 
    fetchVendors(); 
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const columns = [
    { title: 'Vendor Name', dataIndex: 'vendorName', key: 'vendorName' },
    { title: 'Vendor Address', dataIndex: 'vendorAddress', key: 'vendorAddress' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'State Code', dataIndex: 'stateCode', key: 'stateCode' },
    {title: 'GSTIN/UIN', dataIndex: 'gstIn', key: 'gstIn'},
    {title: 'Contact Details', dataIndex: 'contactDetails', key: 'contactDetails'},
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this vendor?"
            onConfirm={() => deleteVendor(record._id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={vendors}
        loading={loading}
        rowKey="_id"
        pagination={false}
      />

      {/* Modal for editing */}
      <Modal
        title="Edit Vendor"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
      >
        {editingVendor && (
          <VendorManagement
            vendorData={editingVendor}  // Pass vendor data for editing
            onUpdateSuccess={handleEditSuccess}  // Success handler after update
          />
        )}
      </Modal>
    </div>
  );
};

export default VendorTable;
