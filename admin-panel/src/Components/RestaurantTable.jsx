import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Modal } from "antd";
import axios from "./Services/Api"; // Correct API import
import AddRestaurant from "./AddRestaurant"; // Import AddRestaurant component

const RestaurantTable = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null); // Restaurant being edited

  // Fetch restaurants based on role
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const role = localStorage.getItem("role"); // Get role from localStorage
      const vendorId = localStorage.getItem("vendorId"); // Get vendorId from localStorage

      let url = "/getRestaurant";

      if (role === "admin") {
        // Admin sees only restaurants where default: true
        url += "?default=true";
      } else if (vendorId) {
        // Vendor sees only their assigned restaurants
        url += `?vendorId=${vendorId}`;
      }

      const { data } = await axios.get(url);
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error("Failed to fetch restaurants.");
    } finally {
      setLoading(false);
    }
  };

  // Delete restaurant
  const deleteRestaurant = async (id) => {
    try {
      await axios.delete(`/deleteRestaurant/${id}`);
      message.success("Restaurant deleted successfully!");
      fetchRestaurants();
    } catch (error) {
      message.error("Failed to delete restaurant.");
    }
  };

  // Handle edit button click
  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditingRestaurant(null);
    setIsModalOpen(false);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    handleModalClose();
    fetchRestaurants();
  };

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Image",
      dataIndex: "imgPath",
      key: "imgPath",
      render: (text, record) => {
        const imageUrl = `https://dev.digitalexamregistration.com/api/${record.imgPath}`;
        return (
          <img
            src={imageUrl}
            alt="Restaurant"
            style={{ width: "50px", height: "50px" }}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
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
        rowKey="_id"
        pagination={false}
      />

      {/* Modal for editing */}
      <Modal
        title="Edit Restaurant"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
      >
        {editingRestaurant && (
          <AddRestaurant
            restaurantData={editingRestaurant}
            onUpdateSuccess={handleEditSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

export default RestaurantTable;
