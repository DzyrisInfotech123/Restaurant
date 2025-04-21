import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';

import AddUser from '../UserManagement';
import DistributorVendorMapping from '../DistributorVendorMapping';
import AddRestaurantForm from '../AddRestaurant';
import RestaurantTable from '../RestaurantTable';
import MenuManagement from '../AddMenuItem';
import ViewMenu from '../ViewMenu';
import DistributorManagement from '../DistributorManagement';
import VendorTable from '../VendorTable';
import VendorProductPricing from '../VendorProductPricing';
import OrderManagement from '../OrderManagement';
import VendorManagement from '../VendorManagement';
import PurchaseOrder from '../PurchaseOrder';
import InventoryManagement from '../InventoryManagement';
import ReportPage from '../ReportPage';
import Production from '../Production';
import RaisePo from '../RaisePo';
import logo from '../img/Logo.png';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState(() => {
    const storedMenu = localStorage.getItem('selectedMenu');
    return storedMenu ? storedMenu : '1';
  });

  const [userRole, setUserRole] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    localStorage.setItem('selectedMenu', selectedMenu);
  }, [selectedMenu]);

  const renderContent = () => {
    switch (selectedMenu) {
      case '1':
        // return userRole === 'admin' && <AddUser />;
        return <AddUser />;
      case '2':
        return <DistributorManagement />;
      case '3':
        return <VendorManagement/>;
      case '4':
        return <DistributorVendorMapping />;
      case '5':
        return(
          <>
            <AddRestaurantForm/>
          </>
        );
        case '6':
        return(
          <>
            <MenuManagement/>
          </>
        );
      case '7':
        return userRole === 'admin' && (
          <>
            <h2>Vendor Product Pricing</h2>
            <VendorProductPricing />
          </>
        );
      case '8':
        return (
          <>
            <h2>Order Management</h2>
            <OrderManagement />
          </>
        );
      case '9':
      return <RaisePo/>;
      case '10':
        return userRole === 'admin' && (
          <>
            <PurchaseOrder/>
          </>
        );
      case '11':
        return (
          <>
            <h2>Inventory Management</h2>
            <InventoryManagement />
          </>
        );
      case '12':
        return (
          <>
            <h2>Report</h2>
            <ReportPage />
          </>
        );
      case '13':
        return (
          <>
            <h2>Todays Production</h2>
            <Production />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {/* Logo */}
    <img src={logo} alt="Logo" style={{ height: '90px', marginRight: '16px' , marginTop:'6%'}} />

    {/* Menu toggle icon */}
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      style: { color: '#fff', fontSize: '20px', cursor: 'pointer' },
      onClick: () => setCollapsed(!collapsed),
    })}
  </div>

  {/* Centered text */}
  <h1 style={{ color: '#fff', margin: 0, textAlign: 'center', flex: 1 }}>Admin Panel</h1>

  {/* Placeholder to balance layout */}
  <div style={{ width: '60px' }}></div>
</Header>

      <Layout>
        <Sider
          theme="dark"
          width={200}
          collapsedWidth={0}
          collapsed={collapsed}
          trigger={null}
          style={{
            transition: 'all 0.5s ease-in-out',
            overflow: 'hidden',
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
          >
            {/* {userRole === 'admin' && <Menu.Item key="1">User Management</Menu.Item>} */}
            {<Menu.Item key="1">User Management</Menu.Item>}
            <Menu.Item key="2">Distributor Management</Menu.Item>
            <Menu.Item key="3">Vendor Management</Menu.Item>
            <Menu.Item key="4">Distributor Vendor Mapping</Menu.Item>
            <Menu.Item key="5">Add Restaurant</Menu.Item>
            <Menu.Item key="6">Menu Management</Menu.Item>
            <Menu.Item key="8">Order Management</Menu.Item>
            <Menu.Item key="9">Raise PO</Menu.Item>
            {userRole === 'admin' && <Menu.Item key="10">Purchase Order Management</Menu.Item>}
            <Menu.Item key="11">Inventory Management</Menu.Item>
            <Menu.Item key="12">Report</Menu.Item>
            <Menu.Item key="13">Todays Production</Menu.Item>
          </Menu>
        </Sider>

        <Content
          style={{
            margin: '8px',
            padding: '0px',
            background: '#fff',
            width: '72%',
            transition: 'margin 0.5s ease-in-out',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
