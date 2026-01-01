import React, { useState } from 'react';
import { analyzeReceipt } from '../services/geminiService';
import { ShoppingItem } from '../types';
import { Icons } from '../constants';

interface Props {
  shoppingList: ShoppingItem[];
  onUpdateList: (list: ShoppingItem[]) => void;
}

export default function ReceiptScanner({ shoppingList, onUpdateList }: Props) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeReceipt(base64);
        const newItems: ShoppingItem[] = result.map(item => ({
             ...item,
             id: Math.random().toString(36).substr(2, 9),
             checked: false,
             addedFrom: 'scan'
        }));
        onUpdateList([...shoppingList, ...newItems]);
      } catch (err) {
        console.error(err);
        alert("Could not analyze receipt.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCheck = (id: string) => {
    onUpdateList(shoppingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    onUpdateList(shoppingList.filter(item => item.id !== id));
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-sm border border-stone-100 flex flex-col p-6">
      <div className="mb-6 flex justify-between items-start">
         <div>
          <h2 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
            <span className="text-lime-500"><Icons.Receipt /></span>
            Shopping List
          </h2>
          <p className="text-stone-500 text-sm mt-1">Manage your pantry and grocery needs.</p>
         </div>
         <div className="relative overflow-hidden group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button className="bg-stone-900 text-lime-400 px-4 py-3 rounded-xl text-sm font-bold group-hover:bg-stone-800 transition-colors shadow-lg shadow-stone-200 flex items-center gap-2">
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-lime-400 border-t-transparent rounded-full"></span>
              ) : (
                <Icons.Receipt />
              )}
              {loading ? 'Scanning...' : 'Scan Receipt'}
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {shoppingList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50">
            <Icons.List />
            <p className="mt-2 text-sm font-medium">Your shopping list is empty.</p>
            <p className="text-xs mt-1">Add ingredients from your Meal Plan or scan a receipt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shoppingList.map((item) => (
              <div 
                key={item.id} 
                className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                   item.checked 
                     ? 'bg-stone-50 border-stone-100 opacity-60' 
                     : 'bg-white border-stone-100 hover:border-lime-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                   <button 
                     onClick={() => toggleCheck(item.id)}
                     className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked 
                          ? 'bg-lime-400 border-lime-400 text-stone-900' 
                          : 'border-stone-300 hover:border-lime-400'
                     }`}
                   >
                      {item.checked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                   </button>
                   
                   <div className="flex flex-col">
                      <span className={`font-bold text-stone-800 ${item.checked ? 'line-through text-stone-400' : ''}`}>
                          {item.name}
                      </span>
                      <div className="flex gap-2 text-xs">
                          <span className="text-stone-400 uppercase tracking-wide font-bold">{item.category}</span>
                          {item.expiryEstimate && (
                             <span className="text-lime-600 bg-lime-50 px-1.5 rounded">Exp: {item.expiryEstimate}</span>
                          )}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-stone-300 hover:text-red-400 p-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                   </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}