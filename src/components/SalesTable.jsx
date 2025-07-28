import React from 'react';

function SalesTable({ sales }) {
  if (!sales || sales.length === 0) {
    return null; // Or a message indicating no sales
  }

  return (
    <div className="overflow-x-auto mt-4"> 
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Sale ID</th>
            <th className="py-3 px-6 text-left">Date</th>
            <th className="py-3 px-6 text-left">Product</th>
            <th className="py-3 px-6 text-left">Quantity</th>
            <th className="py-3 px-6 text-right">Amount</th>
            <th className="py-3 px-6 text-left">Customer</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {sales.map(sale => (
            <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left whitespace-nowrap">{sale.id}</td>
              <td className="py-3 px-6 text-left">{sale.sale_date}</td>
              <td className="py-3 px-6 text-left">{sale.product_name}</td>
              <td className="py-3 px-6 text-left">{sale.quantity}</td>
              <td className="py-3 px-6 text-right">₹{parseFloat(sale.amount).toFixed(2)}</td>
              <td className="py-3 px-6 text-left">{sale.customer_name || 'N/A'}</td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesTable;