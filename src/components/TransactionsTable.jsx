import React from 'react';

export default function TransactionsTable({ items = [], onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full text-sm text-white">
        <thead className="bg-[#111]">
          <tr>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">Amount</th>
            <th className="text-left px-4 py-3">Notes</th>
            <th className="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-6 text-center text-white/60">No records yet</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id} className="odd:bg-[#0b0b0b] even:bg-[#0e0e0e]">
              <td className="px-4 py-3 whitespace-nowrap">{it.date}</td>
              <td className="px-4 py-3">{it.title}</td>
              <td className="px-4 py-3 capitalize">
                <span className={`px-2 py-1 rounded text-xs ${it.type === 'income' ? 'bg-[#5B913B] text-black' : 'bg-[#754E1A] text-white'}`}>
                  {it.type}
                </span>
              </td>
              <td className="px-4 py-3">{it.type === 'income' ? '-' : it.category}</td>
              <td className="px-4 py-3">₹{Number(it.amount).toLocaleString()}</td>
              <td className="px-4 py-3">{it.notes}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(it)} className="px-2 py-1 rounded bg-[#84994F] text-black text-xs">Edit</button>
                  <button onClick={() => onDelete(it.id)} className="px-2 py-1 rounded bg-[#B03030] text-white text-xs">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
