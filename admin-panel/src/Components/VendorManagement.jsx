import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";

const { Option } = Select;

const VendorManagement = ({ vendorData, onSubmit }) => {
  const [stateCode, setStateCode] = useState(""); // To hold the state code
  const [states] = useState([
    { name: "Andhra Pradesh", code: "28" },
    { name: "Arunachal Pradesh", code: "12" },
    { name: "Assam", code: "18" },
    { name: "Bihar", code: "10" },
    { name: "Chhattisgarh", code: "22" },
    { name: "Goa", code: "30" },
    { name: "Gujarat", code: "24" },
    { name: "Haryana", code: "06" },
    { name: "Himachal Pradesh", code: "02" },
    { name: "Jharkhand", code: "20" },
    { name: "Karnataka", code: "29" },
    { name: "Kerala", code: "32" },
    { name: "Madhya Pradesh", code: "23" },
    { name: "Maharashtra", code: "27" },
    { name: "Manipur", code: "14" },
    { name: "Meghalaya", code: "17" },
    { name: "Mizoram", code: "15" },
    { name: "Nagaland", code: "13" },
    { name: "Odisha", code: "21" },
    { name: "Punjab", code: "03" },
    { name: "Rajasthan", code: "08" },
    { name: "Sikkim", code: "11" },
    { name: "Tamil Nadu", code: "33" },
    { name: "Telangana", code: "36" },
    { name: "Tripura", code: "16" },
    { name: "Uttar Pradesh", code: "09" },
    { name: "Uttarakhand", code: "05" },
    { name: "West Bengal", code: "19" },
    { name: "Andaman and Nicobar Islands", code: "35" },
    { name: "Chandigarh", code: "04" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
    { name: "Lakshadweep", code: "31" },
    { name: "Delhi", code: "07" },
    { name: "Puducherry", code: "34" },
  ]);

  // Check if it's in edit mode based on vendorData
  const isEditing = vendorData && Object.keys(vendorData).length > 0;

  // Pre-populate the form with vendorData when in edit mode
  useEffect(() => {
    if (isEditing && vendorData) {
      setStateCode(vendorData.stateCode); // Set the stateCode based on existing vendor data
    }
  }, [isEditing, vendorData]);

  // Handle state change to update the state code
  const handleStateChange = (value) => {
    const selectedState = states.find((state) => state.name === value);
    if (selectedState) {
      setStateCode(selectedState.code); // Update state code when a state is selected
    } else {
      setStateCode(""); // Reset the state code if no state is selected
    }
  };

  // On form submission
  const onFinish = async (values) => {
    console.log("Vendor details:", values);

    // Ensure vendorId is properly passed along in the values
    if (!values.vendorId) {
      message.error("Vendor ID is missing, cannot update the vendor.");
      return;
    }

    // Prepare the data for submission
    const requestData = {
      vendorId: values.vendorId, // Ensure vendorId is part of the request data
      vendorName: values.vendorName,
      vendorAddress: values.vendorAddress,
      state: values.state,
      stateCode: stateCode, // Using the selected state code
      gstIn: values.gstIn, // Adding GSTIN field
      contactDetails: values.contactDetails, // Adding contact details field
    };

    try {
      let response;
      const endpoint = `https://dev.digitalexamregistration.com/api/editVendor/${values.vendorId}`; // Use vendorId in the URL

      // Check if it's editing mode and make PUT request
      if (isEditing && values.vendorId) {
        response = await axios.put(endpoint, requestData);
        message.success("Vendor details updated successfully!");
      } else {
        // If adding new vendor, make POST request
        response = await axios.post("https://dev.digitalexamregistration.com/api/addVendor", requestData);
        message.success("Vendor details added successfully!");
      }

      // Handle successful response
      if (response.status === 200 || response.status === 201) {
        if (onSubmit) onSubmit(response.data); // Callback with the updated vendor data
      }
    } catch (error) {
      message.error("Error submitting vendor details.");
      console.error("Error submitting vendor:", error);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        vendorName: vendorData?.vendorName || "", // Pre-fill vendor name
        vendorAddress: vendorData?.vendorAddress || "", // Pre-fill vendor address
        state: vendorData?.state || "", // Pre-fill state if available
        vendorId: vendorData?.vendorId || "", // Pre-fill vendor ID if in edit mode
        gstIn: vendorData?.gstIn || "", // Pre-fill GSTIN if available
        contactDetails: vendorData?.contactDetails || "", // Pre-fill contact details if available
      }}
    >
      {/* Vendor ID */}
      <Form.Item
        name="vendorId"
        label="Vendor ID"
        rules={[{ required: true, message: "Vendor ID is required" }]}>
        <Input
          placeholder="Vendor ID"
          value={vendorData?.vendorId || ""}
          disabled={isEditing} // Disable if it's in edit mode
        />
      </Form.Item>

      {/* Vendor's Name */}
      <Form.Item
        name="vendorName"
        label="Vendor's Name"
        rules={[{ required: true, message: "Please enter the vendor's name" }]}>
        <Input placeholder="Enter vendor's name" />
      </Form.Item>

      {/* Vendor's Address */}
      <Form.Item
        name="vendorAddress"
        label="Vendor's Address"
        rules={[{ required: true, message: "Please enter the vendor's address" }]}>
        <Input.TextArea placeholder="Enter vendor's address" />
      </Form.Item>

      {/* State Selection */}
      <Form.Item
        name="state"
        label="State"
        rules={[{ required: true, message: "Please select the state" }]}>
        <Select
          placeholder="Select state"
          onChange={handleStateChange}
          value={vendorData?.state || undefined} // Use vendorData state if available
        >
          {states.map((state) => (
            <Option key={state.code} value={state.name}>
              {state.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* State Code Display (Disabled but visible) */}
      <Form.Item name="stateCode" label="State Code">
        <Input value={stateCode} disabled placeholder={stateCode} />
      </Form.Item>

      {/* GSTIN / UIN */}
      <Form.Item
        name="gstIn"
        label="GSTIN/UIN"
        rules={[{ required: true, message: "Please enter GSTIN/UIN" }]}>
        <Input placeholder="Enter GSTIN/UIN" />
      </Form.Item>

      {/* Contact Details */}
      <Form.Item
        name="contactDetails"
        label="Contact Details"
        rules={[{ required: true, message: "Please enter contact details" }]}>
        <Input placeholder="Enter Phone Number or Email Id" />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEditing ? "Update Vendor Details" : "Add Vendor Details"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VendorManagement;
