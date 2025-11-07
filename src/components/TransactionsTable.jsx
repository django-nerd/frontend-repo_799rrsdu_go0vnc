import React from 'react';

export default function TransactionsTable({ items, onEdit, onDelete }) {
  return (
    <section className="bg-white/5 backdrop-blur rounded-2xl p-4 ring-1 ring-white/10 overflow-x-auto">
      <h3 className="font-medium text-white/90 mb-3">Transaction History ({items.length})</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/70">
            <th className="py-2">Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th className="text-right">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
              <td className="py-2">{t.date}</td>
              <td className="max-w-[280px] truncate" title={t.title}>{t.title}</td>
              <td>{t.category}</td>
              <td className="capitalize">{t.type}</td>
              <td className={`text-right font-medium ${t.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>₹{Number(t.amount).toFixed(2)}</td>
              <td className="text-right whitespace-nowrap">
                <button onClick={()=>onEdit(t)} className="px-2 py-1 mr-2 rounded bg-white/10 hover:bg-white/20">Edit</button>
                <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded bg-rose-600/90 hover:bg-rose-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
