import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Popconfirm } from "antd";
import axios from "axios";
import FrozenFood from "./FrozenFood"; // Assuming this is the same component as provided earlier

const FrozenFoodTable = () => {
  const [frozenFoods, setFrozenFoods] = useState([]);
  const [editingFrozenFood, setEditingFrozenFood] = useState(null); // For editing a specific item
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility

  // Fetch the list of frozen food items
  useEffect(() => {
    const fetchFrozenFoods = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/getFrozenFood");
        setFrozenFoods(response.data);
      } catch (error) {
        message.error("Error fetching frozen food items.");
        console.error("Error:", error);
      }
    };

    fetchFrozenFoods();
  }, []);

  // Handle the delete action
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/deleteFrozenFood/${id}`);
      if (response.status === 200) {
        message.success("Frozen food item deleted successfully");
        // Refresh the list after deletion
        setFrozenFoods(frozenFoods.filter((item) => item._id !== id));
      }
    } catch (error) {
      message.error("Error deleting frozen food item.");
      console.error("Error:", error);
    }
  };

  // Handle the edit action
  const handleEdit = (item) => {
    setEditingFrozenFood(item); // Set the item to edit
    setIsModalVisible(true); // Show the modal
  };

  // Handle the submit action from the FrozenFood form inside the modal
  const handleSubmit = (data) => {
    // After adding or updating a frozen food, refresh the list
    setFrozenFoods((prev) => {
      const updatedFoods = prev.map((food) =>
        food._id === data._id ? data : food
      );
      return updatedFoods;
    });
    setIsModalVisible(false); // Close the modal
    setEditingFrozenFood(null); // Reset editing mode
  };

  // Table columns definition
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "HSN Code",
      dataIndex: "hsnCode",
      key: "hsnCode",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* FrozenFood Form Modal */}
      <Modal
        title={editingFrozenFood ? "Edit Product Details" : "Add Product Details"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)} // Close the modal
        footer={null} // We handle submit manually
      >
        <FrozenFood
          frozenFoodData={editingFrozenFood} // Pass frozen food data for editing
          onSubmit={handleSubmit} // Handle form submission
        />
      </Modal>

      {/* Frozen Food Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={frozenFoods}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default FrozenFoodTable;
