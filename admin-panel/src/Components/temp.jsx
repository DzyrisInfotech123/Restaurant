import React, { useEffect, useState } from "react";
import { Input, Select, Switch, Button, Table, message, Modal } from "antd";
import axios from "axios";
import { getUsersData } from "../utils/getUsers";
import "./Distributor.css";

const { Option } = Select;

const indianStates = [
  ["AP", "Andhra Pradesh"], ["AR", "Arunachal Pradesh"], ["AS", "Assam"], ["BR", "Bihar"],
  ["CG", "Chhattisgarh"], ["GA", "Goa"], ["GJ", "Gujarat"], ["HR", "Haryana"],
  ["HP", "Himachal Pradesh"], ["JH", "Jharkhand"], ["KA", "Karnataka"], ["KL", "Kerala"],
  ["MP", "Madhya Pradesh"], ["MH", "Maharashtra"], ["MN", "Manipur"], ["ML", "Meghalaya"],
  ["MZ", "Mizoram"], ["NL", "Nagaland"], ["OD", "Odisha"], ["PB", "Punjab"],
  ["RJ", "Rajasthan"], ["SK", "Sikkim"], ["TN", "Tamil Nadu"], ["TG", "Telangana"],
  ["TR", "Tripura"], ["UP", "Uttar Pradesh"], ["UK", "Uttarakhand"], ["WB", "West Bengal"],
  ["AN", "Andaman and Nicobar Islands"], ["CH", "Chandigarh"], ["DN", "Dadra and Nagar Haveli and Daman and Diu"],
  ["DL", "Delhi"], ["JK", "Jammu and Kashmir"], ["LA", "Ladakh"], ["LD", "Lakshadweep"], ["PY", "Puducherry"]
];

const DistributorManagement = () => {
  const [userData, setUserData] = useState([]);
  const [distributorData, setDistributorData] = useState({
    distributorName: "",
    userId: "",
    contactNo: "",
    address: "",
    state: "",
    gstin: "",
    active: false,
  });
  const [distributors, setDistributors] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchDistributors();
  }, []);

  const fetchUsers = async () => {
    const data = await getUsersData();
    setUserData(data || []);
  };

  const fetchDistributors = async () => {
    try {
      const res = await axios.get("https://dev.digitalexamregistration.com/api/getDistributor");
      setDistributors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch distributors", err);
    }
  };

  const handleChange = (name, value, target = "main") => {
    if (name === "gstin") {
      if (value.length > 15 || /[^a-zA-Z0-9]/.test(value)) return;
    }

    if (target === "edit") {
      setEditingDistributor((prev) => ({ ...prev, [name]: value }));
    } else {
      setDistributorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const { distributorName, userId, contactNo, address, state, gstin, active } = distributorData;

    if (!distributorName || !userId || !contactNo || !address || !state || !gstin) {
      message.error("All fields are required!");
      return;
    }

    if (gstin.length !== 15) {
      message.error("GSTIN must be 15 characters long");
      return;
    }

    try {
      await axios.post("https://dev.digitalexamregistration.com/api/addDistributor", {
        distributorName,
        distributorId: userId,
        constactNumber: contactNo,
        distributorAddress: address,
        state,
        gstIn: gstin,
        active
      });

      message.success("Distributor added successfully!");
      setDistributorData({
        distributorName: "",
        userId: "",
        contactNo: "",
        address: "",
        state: "",
        gstin: "",
        active: false,
      });

      fetchDistributors();
    } catch (error) {
      message.error("Failed to save distributor");
      console.error(error);
    }
  };

  const handleEdit = (record) => {
    setEditingDistributor({
      id: record._id,
      distributorName: record.distributorName,
      userId: record.distributorId,
      contactNo: record.constactNumber,
      address: record.distributorAddress,
      state: record.state,
      gstin: record.gstIn,
      active: record.active,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    const { id, distributorName, userId, contactNo, address, state, gstin, active } = editingDistributor;

    if (!distributorName || !userId || !contactNo || !address || !state || !gstin) {
      message.error("All fields are required!");
      return;
    }

    if (gstin.length !== 15) {
      message.error("GSTIN must be 15 characters long");
      return;
    }

    try {
      await axios.post("https://dev.digitalexamregistration.com/api/updateDistributor", {
        distributorId: userId,
        distributorName,
        constactNumber: contactNo,
        distributorAddress: address,
        state,
        gstIn: gstin,
        active
      });
      message.success("Distributor updated successfully!");
      setIsEditModalVisible(false);
      fetchDistributors();
    } catch (error) {
      message.error("Failed to update distributor");
      console.error(error);
    }
  };

  const columns = [
    { title: "Distributor Name", dataIndex: "distributorName", key: "distributorName" },
    { title: "User ID", dataIndex: "distributorId", key: "distributorId" },
    { title: "Contact No", dataIndex: "constactNumber", key: "constactNumber" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "GSTIN No", dataIndex: "gstIn", key: "gstIn" },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (value) => (value ? "Active" : "Inactive"),
    },
    {
      title: "Address",
      dataIndex: "distributorAddress",
      key: "distributorAddress",
      render: (text) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{text}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>,
    },
  ];

  return (
    <div className="container">
      <div className="header">Distributor Management</div>

     <div className="form-container">
             <div className="form-group">
               <label>Distributor Name</label>
               <Select
                 className="custom-select"
                 value={distributorData.distributorName || undefined}
                 onChange={(name) => {
                   const selectedUser = userData.find(user => user.userName === name);
                   if (selectedUser) {
                     handleChange("distributorName", selectedUser.userName);
                     handleChange("userId", selectedUser.userId);
                     handleChange("contactNo", selectedUser.contactNo);
                   }
                 }}
                 style={{ width: "100%" }}
                 showSearch
                 optionFilterProp="children"
                 placeholder="Select Distributor Name"
               >
                 {userData.map(user => (
                   <Option key={user.userId} value={user.userName}>{user.userName}</Option>
                 ))}
               </Select>
             </div>
     
             <div className="form-group">
               <label>User ID</label>
               <Input disabled value={distributorData.userId} />
             </div>
     
             <div className="form-group">
               <label>Contact No.</label>
               <Input disabled value={distributorData.contactNo} />
             </div>
     
             <div className="form-group">
               <label>Distributor Address</label>
               <Input.TextArea
                 value={distributorData.address}
                 onChange={(e) => handleChange("address", e.target.value)}
                 autoSize={{ minRows: 2, maxRows: 6 }}
               />
             </div>
     
             <div className="form-group">
               <label>State</label>
               <Select
                 value={distributorData.state}
                 onChange={(value) => handleChange("state", value)}
                 style={{ width: "100%" }}
               >
                 <Option value="">Select State</Option>
                 {indianStates.map(([code, name]) => (
                   <Option key={code} value={code}>{name}</Option>
                 ))}
               </Select>
             </div>
     
             <div className="form-group">
               <label>GSTIN No.</label>
               <Input
                 value={distributorData.gstin}
                 onChange={(e) => handleChange("gstin", e.target.value)}
                 maxLength={15}
               />
             </div>
     
             <div className="form-group checkbox">
               <label className="checkbox-label">
                 Distributor Active
                 <Switch
                   checked={distributorData.active}
                   onChange={(checked) => handleChange("active", checked)}
                   style={{ marginLeft: "10px" }}
                 />
               </label>
             </div>
        <div className="buttons">
          <Button type="primary" onClick={handleSave} className="save-btn">Save</Button>
          <Button onClick={() => setDistributorData({
            distributorName: "", userId: "", contactNo: "", address: "", state: "", gstin: "", active: false
          })} className="reset-btn">Reset</Button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">View Distributor</div>
        <Table dataSource={distributors} columns={columns} rowKey="_id" />
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Distributor"
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Update"
      >
        <div className="form-group">
          <label>Distributor Name</label>
          <Input value={editingDistributor?.distributorName} onChange={(e) => handleChange("distributorName", e.target.value, "edit")} />
        </div>
        <div className="form-group">
          <label>User ID</label>
          <Input disabled value={editingDistributor?.userId} />
        </div>
        <div className="form-group">
          <label>Contact No.</label>
          <Input value={editingDistributor?.contactNo} onChange={(e) => handleChange("contactNo", e.target.value, "edit")} />
        </div>
        <div className="form-group">
          <label>Distributor Address</label>
          <Input.TextArea value={editingDistributor?.address} onChange={(e) => handleChange("address", e.target.value, "edit")} />
        </div>
        <div className="form-group">
          <label>State</label>
          <Select value={editingDistributor?.state} onChange={(val) => handleChange("state", val, "edit")} style={{ width: "100%" }}>
            {indianStates.map(([code, name]) => (
              <Option key={code} value={code}>{name}</Option>
            ))}
          </Select>
        </div>
        <div className="form-group">
          <label>GSTIN No.</label>
          <Input value={editingDistributor?.gstin} onChange={(e) => handleChange("gstin", e.target.value, "edit")} maxLength={15} />
        </div>
        <div className="form-group checkbox">
          <label className="checkbox-label">
            Distributor Active
            <Switch checked={editingDistributor?.active} onChange={(checked) => handleChange("active", checked, "edit")} style={{ marginLeft: "10px" }} />
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default DistributorManagement;
