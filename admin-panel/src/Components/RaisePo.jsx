import React, { useState, useEffect } from 'react';
import { Table, Select, InputNumber, Button, Input, Popover, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const categories = ['Veg Patty', 'Non Veg Patty', 'Veg Kabab', 'Non Veg Kabab'];
const products = {
  'Veg Patty': ['Aloo Patty', 'Paneer Patty'],
  'Non Veg Patty': ['Chicken Patty', 'Mutton Patty'],
  'Veg Kabab': ['Hara Bhara Kabab'],
  'Non Veg Kabab': ['Chicken Kabab']
};
const units = ['kg', 'pcs', 'ltr'];

const RaisePo = () => {
  const [vendor, setVendor] = useState(null);
  const [vendorList, setVendorList] = useState([]);
  const [data, setData] = useState([]);
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    // Fetch vendor list from backend
    const fetchVendors = async () => {
      try {
        const response = await axios.get('https://dev.digitalexamregistration.com/api/getVendor');
        setVendorList(response.data);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
        message.error('Unable to load vendor list');
      }
    };
    fetchVendors();
  }, []);

  const addRow = () => {
    setData([
      ...data,
      {
        key: counter,
        category: '',
        product: '',
        stock: 100,
        quantity: 0,
        unit: '',
        rate: 0,
        amount: 0,
        instructions: ''
      }
    ]);
    setCounter(counter + 1);
  };

  const updateRow = (key, field, value) => {
    const newData = data.map((row) => {
      if (row.key === key) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedRow.amount = (updatedRow.quantity || 0) * (updatedRow.rate || 0);
        }
        return updatedRow;
      }
      return row;
    });
    setData(newData);
  };

  const deleteRow = (key) => {
    setData(data.filter((row) => row.key !== key));
  };

  const columns = [
    {
      title: 'Sr. no',
      width: 70,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Category',
      width: 150,
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          value={record.category}
          onChange={(value) => updateRow(record.key, 'category', value)}
        >
          {categories.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Product/Item Name',
      width: 160,
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          value={record.product}
          onChange={(value) => updateRow(record.key, 'product', value)}
        >
          {(products[record.category] || []).map((prod) => (
            <Option key={prod} value={prod}>
              {prod}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Stock',
      width: 80,
      dataIndex: 'stock'
    },
    {
      title: 'Quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.quantity}
          onChange={(value) => updateRow(record.key, 'quantity', value)}
        />
      )
    },
    {
      title: 'Unit',
      width: 90,
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          value={record.unit}
          onChange={(value) => updateRow(record.key, 'unit', value)}
        >
          {units.map((u) => (
            <Option key={u} value={u}>
              {u}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Rate',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.rate}
          onChange={(value) => updateRow(record.key, 'rate', value)}
        />
      )
    },
    {
      title: 'Amount',
      width: 100,
      render: (_, record) => record.amount.toFixed(2)
    },
    {
      title: 'Instructions',
      width: 110,
      render: (_, record) => (
        <Popover
          content={
            <Input.TextArea
              rows={3}
              defaultValue={record.instructions}
              onChange={(e) => updateRow(record.key, 'instructions', e.target.value)}
            />
          }
          title="Add Instructions"
        >
          <Button>+</Button>
        </Popover>
      )
    },
    {
      title: 'Delete',
      width: 80,
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => deleteRow(record.key)} />
      )
    }
  ];

  const totalAmount = data.reduce((sum, row) => sum + row.amount, 0);
  const totalQuantity = data.reduce((sum, row) => sum + (row.quantity || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        Vendor Name:{' '}
        <Select
          placeholder="Select Vendor"
          style={{ width: 250 }}
          value={vendor}
          onChange={setVendor}
        >
          {vendorList.map((v) => (
            <Option key={v.vendorId} value={v.vendorId}>
              {v.vendorName}
            </Option>
          ))}
        </Select>
        <Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={addRow}
  disabled={!vendor}
  style={{ marginLeft: 20 }}
>
  Add New
</Button>

      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        footer={() => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold'
            }}
          >
            <span>Total</span>
            <span>{`Quantity: ${totalQuantity} | Amount: ₹${totalAmount.toFixed(2)}`}</span>
          </div>
        )}
      />
      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <Button style={{ marginRight: 10 }}>Cancel</Button>
        <Button type="primary">Submit PO</Button>
      </div>
    </div>
  );
};

export default RaisePo;
