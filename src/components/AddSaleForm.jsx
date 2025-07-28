import React, { useState, useEffect } from 'react';

const PHP_API_BASE_URL = 'http://localhost/erp-backend/api.php';

function AddSaleForm({ onSaleAdded, onFormClose }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [saleItems, setSaleItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${PHP_API_BASE_URL}?resource=products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          setMessage(data.message || 'Error fetching products.');
          setMessageType('error');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setMessage('Could not load products. Network error.');
        setMessageType('error');
      }
    };

    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${PHP_API_BASE_URL}?resource=customers`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        if (data.success) {
          setCustomers(data.customers);
        } else {
          setMessage(data.message || 'Error fetching customers.');
          setMessageType('error');
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setMessage('Could not load customers. Network error.');
        setMessageType('error');
      }
    };

    fetchProducts();
    fetchCustomers();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newSaleItems = [...saleItems];
    newSaleItems[index][field] = value;
    setSaleItems(newSaleItems);
    // Auto-fill quantity if product selected and quantity is 0 or 1
    if (field === 'product_id' && newSaleItems[index].quantity === 0) {
      newSaleItems[index].quantity = 1;
    }
  };

  const handleAddItem = () => {
    setSaleItems([...saleItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newSaleItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newSaleItems);
  };

  const calculateTotalAmount = () => {
    let total = 0;
    saleItems.forEach(item => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product) {
        total += parseFloat(product.price) * parseInt(item.quantity || 0);
      }
    });
    return total.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Basic validation
    if (saleItems.some(item => !item.product_id || item.quantity <= 0)) {
      setMessage('Please select a product and ensure quantity is greater than 0 for all items.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomer === '' ? null : parseInt(selectedCustomer),
        items: saleItems.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity)
        }))
      };

      const response = await fetch(`${PHP_API_BASE_URL}?resource=sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message || 'Sale added successfully!');
        setMessageType('success');
        // Clear form
        setSelectedCustomer('');
        setSaleItems([{ product_id: '', quantity: 1 }]);
        onSaleAdded(); // Notify parent to refresh sales data
      } else {
        setMessage(data.message || 'Failed to add sale. Please check inputs.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error adding sale:', err);
      setMessage('Network error or server unreachable. Could not add sale.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Sale</h3>
      {message && (
        <div className={`p-3 mb-4 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="customer" className="block text-gray-700 text-sm font-bold mb-2">
            Customer (Optional):
          </label>
          <select
            id="customer"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Sale Items:</label>
          {saleItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <select
                value={item.product_id}
                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                className="shadow border rounded w-3/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">-- Select Product --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (₹{parseFloat(product.price).toFixed(2)}) - Stock: {product.stock_quantity}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                min="1"
                className="shadow border rounded w-1/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={saleItems.length === 1}
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-400 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
          >
            + Add Item
          </button>
        </div>

        <div className="mb-6 text-right text-lg font-bold">
          Total: ₹{calculateTotalAmount()}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Adding Sale...' : 'Add Sale'}
          </button>
          <button
            type="button"
            onClick={onFormClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSaleForm;