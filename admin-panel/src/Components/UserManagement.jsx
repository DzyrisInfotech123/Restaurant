import React, { useState, useEffect } from "react";
import { Input, Select, Switch, Button, Table, message, Modal } from "antd";
import axios from "./Services/Api";
import "./AddUserForm.css";

const { Option } = Select;

const UserManagement = () => {
  const [userData, setUserData] = useState({
    userName: "",
    contactNo: "",
    role: "",
    userId: "",
    password: "",
    active: false,
  });

  const [users, setUsers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getUsersData = async () => {
    try {
      const allUsers = await axios.get("/getUsers", {
        headers: { "Content-Type": "application/json" },
      });

      const data = allUsers.data.map((user) => ({
        userName: user.userName,
        contactNo: user.contactNo,
        userId: user.userId || "",
        role: user.role,
        password: user.password || "", // ⛔️ If password isn't returned, it's empty
        active: user.active,
        status: user.active ? "Active" : "Inactive",
      }));

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const handleChange = (name, value) => {
    if (name === "userName" && !/^[A-Za-z ]*$/.test(value)) {
      message.error("User Name must contain only letters and spaces.");
      return;
    }
    if (name === "contactNo" && !/^[0-9]{0,10}$/.test(value)) {
      return;
    }
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    const { userName, contactNo, role, userId, password, active } = userData;

    if (!userName || !contactNo || !role || !userId) {
      message.error("All fields are required!");
      return;
    }

    if (contactNo.length !== 10) {
      message.error("User Contact No. must be exactly 10 digits.");
      return;
    }

    try {
      if (isEditMode) {
        const payload = { userName, contactNo, role, userId, active };
        if (password) {
          payload.password = password;
        }

        await axios.put("/updateUser", payload, {
          headers: { "Content-Type": "application/json" },
        });
        message.success("User updated successfully!");
      } else {
        if (!password) {
          message.error("Password is required for new user!");
          return;
        }

        await axios.post("/addUser", userData, {
          headers: { "Content-Type": "application/json" },
        });
        message.success("User added successfully!");
      }

      setUserData({
        userName: "",
        contactNo: "",
        role: "",
        userId: "",
        password: "",
        active: false,
      });
      setIsEditMode(false);
      setIsModalVisible(false);
      getUsersData();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Something went wrong while saving!");
    }
  };

  const handleEdit = (record) => {
    setUserData({
      userName: record.userName,
      contactNo: record.contactNo,
      role: record.role,
      userId: record.userId,
      password: record.password || "", // Preserve password if it was fetched
      active: record.status === "Active",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "User Name", dataIndex: "userName", key: "userName" },
    { title: "User Contact No", dataIndex: "contactNo", key: "contactNo" },
    { title: "User ID", dataIndex: "userId", key: "userId" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="header">User Management</div>

      <div className="form-container">
        <div className="form-group">
          <label>User Name</label>
          <Input
            name="userName"
            value={userData.userName}
            onChange={(e) => handleChange("userName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>User Contact No.</label>
          <Input
            name="contactNo"
            value={userData.contactNo}
            onChange={(e) => handleChange("contactNo", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <Select
            name="role"
            value={userData.role}
            onChange={(value) => handleChange("role", value)}
            style={{ width: "100%" }}
          >
            <Option value="">Select</Option>
            <Option value="Admin">Admin</Option>
            <Option value="Distributor">Distributor</Option>
            <Option value="Vendor">Vendor</Option>
          </Select>
        </div>
        <div className="form-group">
          <label>User ID</label>
          <Input
            name="userId"
            value={userData.userId}
            onChange={(e) => handleChange("userId", e.target.value)}
          />
        </div>

        {!isEditMode && (
          <div className="form-group">
            <label>User Password</label>
            <Input.Password
              name="password"
              value={userData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
        )}

        <div className="form-group checkbox">
          <label className="checkbox-label">
            Active{" "}
            <Switch
              checked={userData.active}
              onChange={(checked) => handleChange("active", checked)}
            />
          </label>
        </div>

        <div className="buttons">
          <Button type="primary" onClick={handleSave} className="save-btn">
            {isEditMode ? "Update" : "Save"}
          </Button>
          <Button
            onClick={() => {
              setUserData({
                userName: "",
                contactNo: "",
                role: "",
                userId: "",
                password: "",
                active: false,
              });
              setIsEditMode(false);
            }}
            className="reset-btn"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">View User</div>
        <Table dataSource={users} columns={columns} rowKey="userId" />
      </div>

      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          setUserData({
            userName: "",
            contactNo: "",
            role: "",
            userId: "",
            password: "",
            active: false,
          });
          setIsEditMode(false);
        }}
        okText="Update"
      >
        <div className="form-group">
          <label>User Name</label>
          <Input
            name="userName"
            value={userData.userName}
            onChange={(e) => handleChange("userName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>User Contact No.</label>
          <Input
            name="contactNo"
            value={userData.contactNo}
            onChange={(e) => handleChange("contactNo", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <Select
            name="role"
            value={userData.role}
            onChange={(value) => handleChange("role", value)}
            style={{ width: "100%" }}
          >
            <Option value="">Select</Option>
            <Option value="Admin">Admin</Option>
            <Option value="Distributor">Distributor</Option>
          </Select>
        </div>
        <div className="form-group">
          <label>User ID</label>
          <Input name="userId" value={userData.userId} disabled />
        </div>
        <div className="form-group">
          <label>Password</label>
          <Input.Password value="********" disabled />
        </div>
        <div className="form-group checkbox">
          <label className="checkbox-label">
            Active{" "}
            <Switch
              checked={userData.active}
              onChange={(checked) => handleChange("active", checked)}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
