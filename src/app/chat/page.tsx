'use client';
import { useEffect, useState } from 'react';

export default function GroupChat() {
  const [chats, setChats] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState('Hakam Aji Ramadhan');
  const [message, setMessage] = useState('');

  const fetchChats = () => {
    fetch('/api/expedition').then(res => res.json()).then(data => setChats(data.chats || []));
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: currentUser, message })
    });
    if (res.ok) {
      setMessage('');
      fetchChats();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-xl shadow-xs overflow-hidden h-[550px] flex flex-col">
      <div className="bg-emerald-800 p-4 text-white flex justify-between items-center">
        <div><h2 className="font-bold text-sm">💬 Group Chat Koordinasi Gede</h2></div>
        <select value={currentUser} onChange={e => setCurrentUser(e.target.value)} className="bg-emerald-700 border-none rounded-md text-xs font-semibold p-1.5 text-white">
          <option value="Hakam Aji Ramadhan">Hakam</option><option value="Maryam">Maryam</option><option value="Dita Cahya Anjani">Dita</option>
        </select>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4 text-sm">
        {chats.map((c, i) => (
          <div key={i} className={`flex flex-col ${c.sender === currentUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">{c.sender}</span>
            <div className={`p-3 rounded-xl max-w-[80%] ${c.sender === currentUser ? 'bg-emerald-700 text-white' : 'bg-white text-slate-800 border'}`}>
              {c.message}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t bg-white flex gap-2">
        <input type="text" placeholder="Ketik pesan logistik..." value={message} onChange={e => setMessage(e.target.value)} className="flex-grow border rounded-xl px-4 py-2 text-xs bg-slate-50" />
        <button type="submit" className="bg-emerald-600 text-white font-bold text-xs px-4 rounded-xl">Kirim</button>
      </form>
    </div>
  );
}