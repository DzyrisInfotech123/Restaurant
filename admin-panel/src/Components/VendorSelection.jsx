import React, { useEffect, useState } from "react";
import { Select, message, Typography } from "antd";
import axios from "./Services/Api"; // Ensure Axios is set up properly

const { Option } = Select;
const { Title } = Typography; // Import Typography for headings

const VendorSelection = ({ onVendorSelect }) => {
  const [vendors, setVendors] = useState([]); // To hold the list of vendors
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedVendorName, setSelectedVendorName] = useState(""); // State to hold the selected vendor name

  useEffect(() => {
    // Fetch vendors list
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Authentication token is missing. Please log in.");
          return;
        }

        const response = await axios.get(
          "https://dev.digitalexamregistration.com/api/getVendor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setVendors(response.data); // Assuming the response contains a list of vendors
      } catch (error) {
        console.error("Error fetching vendors:", error);
        message.error("Failed to fetch vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleVendorChange = (value) => {
    const selectedVendor = vendors.find(vendor => vendor._id === value);
    if (selectedVendor) {
      setSelectedVendorName(selectedVendor.vendorName); // Set the selected vendor name
    }
    localStorage.setItem("vendorId", value); // Store the selected vendor ID in local storage
    if (onVendorSelect) {
      onVendorSelect(value); // Call the callback function to pass the selected vendor ID
    }
  };

  return (
    <div>
      <Title level={4}>Select a Vendor</Title> {/* Heading for the vendor selection */}
      <Select
        placeholder="Select Vendor"
        onChange={handleVendorChange}
        loading={loading}
        style={{ width: "100%" }} // Full width
      >
        {vendors.map((vendor) => (
          <Option key={vendor._id} value={vendor._id}>
            {vendor.vendorName}
          </Option>
        ))}
      </Select>
      {selectedVendorName && ( // Display the selected vendor name if available
        <div style={{ marginTop: '10px' }}>
          <strong style={{fontSize : '30px' }} >You can View/Edit data of Vendor : {selectedVendorName} </strong> 
        </div>
      )}
    </div>
  );
};

export default VendorSelection;