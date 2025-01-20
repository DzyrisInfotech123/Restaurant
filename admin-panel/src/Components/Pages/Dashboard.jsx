// Dashboard.js

import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import AddUserForm from '../AddUserForm';
import UsersTable from '../UserTable';
import AddRestaurantForm from '../AddRestaurant';
import RestaurantTable from '../RestaurantTable';
import MenuManagement from '../AddMenuItem';
import ViewMenu from '../ViewMenu';
import VendorManagement from '../VendorManagement';
import VendorTable from '../VendorTable'; // Default import
import FrozenFood from '../FrozenFood';
import FrozenFoodTable from '../FrozenFoodTable';
import VendorProductPricing from '../VendorProductPricing';
import ViewVendorPricing from '../ViewVendorPricing';
import OrderManagement from '../OrderManagement'; // Import the OrderManagement component

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState(() => {
    const storedMenu = localStorage.getItem('selectedMenu');
    return storedMenu ? storedMenu : '1';
  });

  useEffect(() => {
    localStorage.setItem('selectedMenu', selectedMenu);
  }, [selectedMenu]);

  const renderContent = () => {
    if (selectedMenu === '1') {
      return (
        <>
          <h2>User Management</h2>
          <AddUserForm />
          <UsersTable />
        </>
      );
    }
    if (selectedMenu === '2') {
      return (
        <>
          <h2>Restaurant Management</h2>
          <AddRestaurantForm />
          <RestaurantTable />
        </>
      );
    }
    if (selectedMenu === '3') {
      return (
        <>
          <h2>Menu Management</h2>
          <MenuManagement />
        </>
      );
    }
    if (selectedMenu === '4') {
      return <ViewMenu />;
    }
    if (selectedMenu === '5') {
      return (
        <>
          <h2>Vendor Management</h2>
          <VendorManagement />
          <VendorTable /> {/* Rendering VendorTable */}
        </>
      );
    }
    if (selectedMenu === '6') {
      return (
        <>
          <h2>Frozen Foods</h2>
          <FrozenFood />
          <FrozenFoodTable /> {/* Rendering FrozenFoodTable */}
        </>
      );
    }
    if (selectedMenu === '7') {
      return (
        <>
          <h2>Vendor Product Pricing</h2>
          <VendorProductPricing />
          <ViewVendorPricing />
        </>
      );
    }
    if (selectedMenu === '8') {
      return (
        <>
          <h2>Order Management</h2>
          <OrderManagement /> {/* Render OrderManagement component */}
        </>
      );
    }
  };

  return (
    <Layout>
      <Header style={{ color: '#fff', textAlign: 'center' }}>Admin Panel</Header>
      <Layout>
        <Sider>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
          >
            <Menu.Item key="1">User Management</Menu.Item>
            <Menu.Item key="2">Restaurant Management</Menu.Item>
            <Menu.Item key="3">Add Menu</Menu.Item>
            <Menu.Item key="4">Menu Management</Menu.Item>
            <Menu.Item key="5">Vendor Management</Menu.Item>
            <Menu.Item key="6">Frozen Food</Menu.Item>
            <Menu.Item key="7">Vendor Product Pricing</Menu.Item>
            <Menu.Item key="8">Order Management</Menu.Item> {/* Add Order Management option */}
          </Menu>
        </Sider>
        <Content style={{ padding: '20px' }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
