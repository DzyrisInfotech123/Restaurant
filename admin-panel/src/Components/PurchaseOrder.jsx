import React from "react";
import { Table, Input, Button, DatePicker, Select, Space } from "antd";
import { SearchOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PurchaseOrder = () => {
  const columns = [
    {
      title: "Raised To",
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: "PO Date",
      dataIndex: "poDate",
      key: "poDate",
    },
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Created by",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created on",
      dataIndex: "createdOn",
      key: "createdOn",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button>View</Button>
          <Button>Cancel</Button>
          <Button>Send Email Again</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      vendorName: "Vendor Name",
      poDate: "2025-04-19",
      poNumber: "PO12345",
      amount: "₹10,000",
      createdBy: "Admin",
      createdOn: "2025-04-19 10:00 AM",
      status: "Pending",
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <h2>Purchase Order for Distributor</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker defaultValue={dayjs()} placeholder="From Date" />
        <DatePicker defaultValue={dayjs()} placeholder="To Date" />
        <Select defaultValue="All" style={{ width: 160 }}>
          <Option value="All">All</Option>
          <Option value="Requested">Requested</Option>
          <Option value="Accepted">Accepted by Vendor</Option>
          <Option value="Rejected">Rejected by Vendor</Option>
          <Option value="Dispatched">Dispatched</Option>
          <Option value="Delivered">Delivered</Option>
        </Select>
        <Input placeholder="PO Number" style={{ width: 205 }} />
        <Button icon={<SearchOutlined />}>Search</Button>
        <Button icon={<ReloadOutlined />}>Clear</Button>
        <Button type="primary" icon={<PlusOutlined />}>
          Raise PO
        </Button>
      </Space>

      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default PurchaseOrder;
