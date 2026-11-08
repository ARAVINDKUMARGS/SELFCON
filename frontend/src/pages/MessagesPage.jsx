import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, MapPin } from 'lucide-react';
import { messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageAPI
      .getConversations()
      .then(res => {
        const convos = res.data.conversations || [];
        setConversations(convos);
        if (convos.length > 0) {
          setSelectedConvo(convos[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      messageAPI
        .getMessages(selectedConvo._id)
        .then(res => setMessages(res.data.messages || []))
        .catch(() => {});
    }
  }, [selectedConvo]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvo) return;

    try {
      const res = await messageAPI.sendMessage({
        conversationId: selectedConvo._id,
        text: inputText.trim()
      });
      setMessages(prev => [...prev, res.data.message]);
      setInputText('');
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const getOtherParticipant = convo => {
    return convo.participants?.find(p => p._id !== user?.id) || { name: 'Host / Buyer' };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Messages</h1>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Left: Conversations list */}
        <div className="border-r border-neutral-100 flex flex-col">
          <div className="p-4 border-b border-neutral-100 font-bold text-xs text-neutral-400 uppercase tracking-wider">
            All Conversations ({conversations.length})
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-50">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">No active message threads.</div>
            ) : (
              conversations.map(convo => {
                const other = getOtherParticipant(convo);
                const isSelected = selectedConvo?._id === convo._id;
                return (
                  <div
                    key={convo._id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <img
                      src={other.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={other.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{other.name}</div>
                      {convo.property && (
                        <div className="text-[10px] text-brand-600 truncate">{convo.property.title}</div>
                      )}
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {convo.lastMessage?.text || 'Started conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div className="md:col-span-2 flex flex-col justify-between bg-neutral-50/50">
          {selectedConvo ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getOtherParticipant(selectedConvo).avatar}
                    alt={getOtherParticipant(selectedConvo).name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{getOtherParticipant(selectedConvo).name}</h3>
                    <span className="text-[10px] text-neutral-400 capitalize">{getOtherParticipant(selectedConvo).role}</span>
                  </div>
                </div>
                {selectedConvo.property && (
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-800 line-clamp-1">{selectedConvo.property.title}</span>
                    <span className="text-neutral-400 text-[10px]">{selectedConvo.property.location?.city}</span>
                  </div>
                )}
              </div>

              {/* Chat Stream */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {messages.map(m => {
                  const isMe = m.sender?._id === user?.id || m.sender === user?.id;
                  return (
                    <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white border text-slate-800 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-100 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-neutral-400 text-xs">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

