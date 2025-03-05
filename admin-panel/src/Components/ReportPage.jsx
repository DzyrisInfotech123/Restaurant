import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("https://dev.digitalexamregistration.com/api/getOrder"); // Replace with your API
      setOrders(response.data);
      setFilteredOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = orders.filter((order) => {
      const orderDate = moment(order.date);
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
      moment(order.date).format("MMM DD")
    );
    const data = filteredOrders.map((order) => {
      if (type === "purchase") {
        return order.cart.reduce((acc, item) => acc + (item.purchase || 0), 0);
      } else if (type === "sale") {
        return order.cart.reduce((acc, item) => acc + (item.sale || 0), 0);
      } else {
        return order.cart.reduce((acc, item) => acc + (item.stock || 0), 0);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: type.toUpperCase(),
          data,
          backgroundColor: type === "sale" ? "green" : type === "purchase" ? "blue" : "orange",
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
      <h2>Reports</h2>

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
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Purchase</th>
            <th>Sale</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) =>
            order.cart.map((item, i) => (
              <tr key={`${index}-${i}`}>
                <td>{moment(order.date).format("MMM DD, YYYY")}</td>
                <td>{item.vendorName}</td>
                <td>₹{item.purchase || 0}</td>
                <td>₹{item.sale || 0}</td>
                <td>{item.stock || 0}</td>
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
          <h3>Purchase Overview</h3>
          <Line data={generateChartData("purchase")} />
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
