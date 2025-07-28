import React, { useState, useEffect } from 'react';
import './App.css';
import SalesTable from './components/SalesTable';
import DateFilter from './components/DateFilter';
import AddSaleForm from './components/AddSaleForm'; // Import the new component


const PHP_API_BASE_URL = 'http://localhost/erp-backend/api.php';

function App() {
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD format
  const [endDate, setEndDate] = useState('');   // YYYY-MM-DD format
  const [showAddSaleForm, setShowAddSaleForm] = useState(false); // New state for form visibility


 
  const fetchDashboardSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${PHP_API_BASE_URL}?resource=dashboard_summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.message) {
        setError(data.message);
        setDashboardSummary(null);
      } else {
        setDashboardSummary(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Could not fetch dashboard summary. Please check your network or API endpoint.');
      setDashboardSummary(null);
    } finally {
      setLoading(false);
    }
  };


  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    let url = `${PHP_API_BASE_URL}?resource=sales`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched sales data:', data);

      if (data.success) {
        setSalesData(data.sales || []);
      } else {
        setError(data.message || 'Failed to fetch sales data.');
        setSalesData([]);
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Could not fetch sales data. Please check your network or API endpoint.');
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    fetchDashboardSummary();
    fetchSalesData();
  }, []);

  // Effect to re-fetch sales data when date filters change
  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  // Function to handle date filter changes
  const handleDateChange = (type, date) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  
  const handleSaleAdded = () => {
    fetchDashboardSummary();
    fetchSalesData();       
    setShowAddSaleForm(false); 
  };

  const menu = [
    { name: 'Dashboard', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Orders', path: '/orders' },
    { name: 'Customers', path: '/customers' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <div className='min-h-screen w-full bg-gray-100'>
      <header className='flex justify-around bg-white shadow p-4 mb-3 rounded items-center'>
        <h1 className='text-3xl font-bold text-gray-800'>Basic Store ERP</h1>
        <nav>
          <ul className='flex text-lg text-center'>
            {menu.map((item, index) => (
              <li
                key={index}
                className='inline-block mr-7 hover:text-xl hover:cursor-pointer hover:text-blue-600 text-center transition-all duration-200'
              >
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <div className='container mx-auto p-4'>
        

          {loading && <p className="text-center text-blue-500">Loading dashboard data...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {dashboardSummary && (
            <section className="mb-6 bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-700">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-gray-500 text-sm">Sales Today</p>
                  <p className="text-2xl font-bold text-blue-700">₹{dashboardSummary.todaySales.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-gray-500 text-sm">Items Sold Today</p>
                  <p className="text-2xl font-bold text-green-700">{dashboardSummary.itemsSoldToday}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-gray-500 text-sm">Total Sales (Overall)</p>
                  <p className="text-2xl font-bold text-purple-700">₹{dashboardSummary.totalSales.toFixed(2)}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">Recent Orders</h3>
              {dashboardSummary.recentOrders && dashboardSummary.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Order ID</th>
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {dashboardSummary.recentOrders.map((order, i) => (
                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">{order.id}</td>
                          <td className="py-3 px-6 text-left">{order.date}</td>
                          <td className="py-3 px-6 text-right">₹{order.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No recent orders.</p>
              )}

              <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-700">Top Selling Products (This Month)</h3>
              {dashboardSummary.topSellingProducts && dashboardSummary.topSellingProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Rank</th>
                        <th className="py-3 px-6 text-left">Product</th>
                        <th className="py-3 px-6 text-right">Units Sold</th>
                        <th className="py-3 px-6 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {dashboardSummary.topSellingProducts.map((product, i) => (
                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">{product.rank}</td>
                          <td className="py-3 px-6 text-left">{product.name}</td>
                          <td className="py-3 px-6 text-right">{product.units}</td>
                          <td className="py-3 px-6 text-right">₹{product.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No top selling products this month.</p>
              )}

              <p className="text-sm text-gray-500 mt-4 text-right">Last Updated: {dashboardSummary.lastUpdated}</p>
            </section>
          )}

          
          <section className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">Individual Sales Records</h2>
              <button
                onClick={() => setShowAddSaleForm(!showAddSaleForm)}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {showAddSaleForm ? 'Hide Add Sale Form' : 'Add New Sale'}
              </button>
            </div>

            {showAddSaleForm && (
              <AddSaleForm
                onSaleAdded={handleSaleAdded}
                onFormClose={() => setShowAddSaleForm(false)}
              />
            )}

            {!showAddSaleForm && (
              <>
                <DateFilter
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateChange}
                  onApplyFilter={fetchSalesData}
                />
                {loading && <p className="text-center text-blue-500 mt-4">Loading sales data...</p>}
                {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                {!loading && !error && salesData.length === 0 && (
                  <p className="text-center text-gray-600 mt-4">No sales data available for the selected period.</p>
                )}
                {!loading && !error && salesData.length > 0 && (
                  <SalesTable sales={salesData} />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;