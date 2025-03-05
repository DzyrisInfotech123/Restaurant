import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import AddUser  from '../AddUserForm';
import UsersTable from '../UserTable';
import AddRestaurantForm from '../AddRestaurant';
import RestaurantTable from '../RestaurantTable';
import MenuManagement from '../AddMenuItem';
import ViewMenu from '../ViewMenu';
import VendorManagement from '../VendorManagement';
import VendorTable from '../VendorTable';
import VendorProductPricing from '../VendorProductPricing';
import OrderManagement from '../OrderManagement';
import VendorSelection from '../VendorSelection';
import PurchaseOrder from '../PurchaseOrder';
import InventoryManagement from '../InventoryManagement';
import ReportPage from '../ReportPage';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState(() => {
    const storedMenu = localStorage.getItem('selectedMenu');
    return storedMenu ? storedMenu : '1';
  });

  const [userRole, setUserRole] = useState(''); // Corrected line

  useEffect(() => {
    const role = localStorage.getItem('role'); // Retrieve user role from local storage
    setUserRole(role);
    localStorage.setItem('selectedMenu', selectedMenu);
  }, [selectedMenu]);

  const renderContent = () => {
    if (selectedMenu === '1' && userRole === 'admin') {
      return (
        <>
          <h2>User Management</h2>
          <AddUser  />
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
    if (selectedMenu === '5' && userRole === 'admin') {
      return (
        <>
          <h2>Vendor Management</h2>
          <VendorManagement />
          <VendorTable />
        </>
      );
    }
    if (selectedMenu === '7') {
      return (
        <>
          <h2>Vendor Product Pricing</h2>
          <VendorProductPricing />
        </>
      );
    }
    if (selectedMenu === '8') {
      return (
        <>
          <h2>Order Management</h2>
          <OrderManagement />
        </>
      );
    }
    if (selectedMenu === '9' && userRole === 'admin') {
      return (
        <>
          <h2>Vendor Selection</h2>
          <VendorSelection/>
        </>
      );
    }

    if (selectedMenu === '10' && userRole === 'admin') {
      return (
        <>
          <h2>Purchase Order</h2>
          <PurchaseOrder/>
        </>
      );
    }
    if (selectedMenu === '11') {
      return (
        <>
          <h2>Inventory Management</h2>
          <InventoryManagement/>
        </>
      );
    }
    if (selectedMenu === '12') {
      return (
        <>
          <h2>Report</h2>
          <ReportPage/>
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
            {userRole === 'admin' && <Menu.Item key="1">User  Management</Menu.Item>}
            <Menu.Item key="2">Restaurant Management</Menu.Item>
            <Menu.Item key="3">Add Menu</Menu.Item>
            <Menu.Item key="4">Menu Management</Menu.Item>
           {userRole === 'admin' && <Menu.Item key="5">Vendor Management</Menu.Item>} 
            <Menu.Item key="7">Vendor Product Pricing</Menu.Item>
            <Menu.Item key="8">Sale Order Management</Menu.Item>
            {userRole ==='admin' && <Menu.Item key="9">Vendor Selection</Menu.Item>}
            {userRole ==='admin' && <Menu.Item key="10">Purchase Order Management</Menu.Item>}
            <Menu.Item key="11">Inventory Management</Menu.Item>
            <Menu.Item key="12">Report</Menu.Item>
          </Menu>
        </Sider>
        <Content style={{ padding: '20px' }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;