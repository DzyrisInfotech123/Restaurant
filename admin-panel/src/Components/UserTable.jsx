import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import axios from './Services/Api'; // Correct import

const UsersTable = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/getUsers');
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to load users.');
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/deleteUser/${id}`);
      message.success('User deleted successfully!');
      fetchUsers(); // Refresh user list
    } catch (error) {
      message.error('Failed to delete user.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this user?"
          onConfirm={() => deleteUser(record._id)} // Use _id for MongoDB documents
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return <Table columns={columns} dataSource={users} rowKey="_id" />;
};

export default UsersTable;
