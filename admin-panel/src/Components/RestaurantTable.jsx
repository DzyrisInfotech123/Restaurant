import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Modal } from 'antd';
import axios from './Services/Api'; // Correct import
import AddRestaurant from './AddRestaurant'; // Import AddRestaurant component

const RestaurantTable = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null); // State for the restaurant being edited

  // Fetch restaurants from the API
  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get('/getRestaurant'); // Destructure response data
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      message.error('Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  // Delete restaurant
  const deleteRestaurant = async (id) => {
    try {
      await axios.delete(`/deleteRestaurant/${id}`); // Correct the delete route if necessary
      message.success('Restaurant deleted successfully!');
      fetchRestaurants(); // Refresh restaurant list
    } catch (error) {
      message.error('Failed to delete restaurant.');
    }
  };

  // Handle edit button click
  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant); // Set the selected restaurant for editing
    setIsModalOpen(true); // Open the modal
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditingRestaurant(null); // Clear the selected restaurant
    setIsModalOpen(false); // Close the modal
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    handleModalClose(); // Close the modal
    fetchRestaurants(); // Refresh restaurant list
  };

  // Use effect to fetch restaurants when the component mounts
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating' },
    { title: 'Number of Reviews', dataIndex: 'reviews', key: 'reviews' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Image',
      dataIndex: 'imgPath',
      key: 'imgPath',
      render: (text, record) => {
        const imageUrl = `http://localhost:4001${record.imgPath}`; // Avoid double slash issue
        return (
          <img
            src={imageUrl}
            alt="Restaurant"
            style={{ width: '50px', height: '50px' }}
            
          />
          
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this restaurant?"
            onConfirm={() => deleteRestaurant(record._id)}
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
        dataSource={restaurants}
        loading={loading}
        rowKey="_id" // Ensure this matches your backend ID field
        pagination={false} // You can enable pagination if the table grows large
      />

      {/* Modal for editing */}
      <Modal
        title="Edit Restaurant"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null} // Footer is not needed as form buttons are inside AddRestaurant
      >
        {editingRestaurant && (
          <AddRestaurant
            restaurantData={editingRestaurant} // Pass the selected restaurant data
            onUpdateSuccess={handleEditSuccess} // Handle successful update
          />
        )}
      </Modal>
    </div>
  );
};

export default RestaurantTable;
