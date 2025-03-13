import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import moment from "moment";
import "./ReportPage.css"; // Add necessary CSS

ChartJS.register(...registerables);

const ReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorId, setVendorId] = useState("123"); // Replace with dynamic vendor ID
  const [processed, setProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [vendorId, processed]); // Fetch orders when vendor or processed changes

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `https://dev.digitalexamregistration.com/api/getOrder?vendorId=${vendorId}&processed=${processed}`
      );
      console.log("📦 API Response:", response.data); // Debugging

      // Filter orders that contain at least one sale entry
      const saleOrders = response.data.filter((order) =>
        order.cart.some((item) => item.sale && item.sale > 0)
      );

      setOrders(saleOrders);
      setFilteredOrders(saleOrders);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = orders.filter((order) => {
      const orderDate = moment(order.orderDate);
      const isWithinRange =
        (!startDate || orderDate.isSameOrAfter(startDate)) &&
        (!endDate || orderDate.isSameOrBefore(endDate));
      const matchesSearch = searchQuery
        ? order.cart.some((item) =>
            item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true;

      return isWithinRange && matchesSearch;
    });
    setFilteredOrders(filtered);
  };

  const generateChartData = (type) => {
    const labels = filteredOrders.map((order) =>
      moment(order.orderDate).format("MMM DD")
    );

    const data = filteredOrders.map((order) =>
      order.cart.reduce((acc, item) => {
        if (type === "sale") {
          return acc + (item.sale ?? (item.price * item.quantity));
        } else {
          return acc + (item.stock ?? 0);
        }
      }, 0)
    );

    return {
      labels,
      datasets: [
        {
          label: type.toUpperCase(),
          data,
          backgroundColor: type === "sale" ? "green" : "orange",
          borderColor: "black",
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="report-container">
      <h2>Sales Reports</h2>

      <div className="filters">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Vendor Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleFilter}>Apply Filters</button>

        <label>
          <input
            type="checkbox"
            checked={processed}
            onChange={() => setProcessed(!processed)}
          />
          Show Processed Orders
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Sale</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) =>
            order.cart
              .filter((item) => item.sale && item.sale > 0) // Only show items with sale values
              .map((item, i) => (
                <tr key={`${index}-${i}`}>
                  <td>{moment(order.orderDate).format("MMM DD, YYYY")}</td>
                  <td>{item.vendorName}</td>
                  <td>₹{item.sale ?? (item.price * item.quantity).toFixed(2)}</td>
                  <td>{item.stock ?? 0}</td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      <div className="charts">
        <div className="chart">
          <h3>Sales Overview</h3>
          <Bar data={generateChartData("sale")} />
        </div>
        <div className="chart">
          <h3>Stock Overview</h3>
          <Pie data={generateChartData("stock")} />
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
