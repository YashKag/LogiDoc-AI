import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import UploadArea from './components/UploadArea';
import { streamChat, clearWorkspace } from './api/apiService';

function App() {
  const defaultMessages = [
    { id: 1, type: 'ai', content: 'Welcome to LogiDoc AI where you can upload a logistics PDF, and ask me anything.' }
  ];
  const [messages, setMessages] = useState(defaultMessages);
  const [inputState, setInputState] = useState('');
  const [loading, setLoading] = useState(false);
  const [docReady, setDocReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = async () => {
      try {
          await clearWorkspace();
      } catch (err) {
          console.error("Reset failed:", err);
      }
      setMessages(defaultMessages);
      setDocReady(false);
      setInputState('');
      setResetKey(prev => prev + 1);
  };

  const handleSend = async () => {
    if (!inputState.trim() || loading) return;

    const userMsg = inputState.trim();
    setInputState('');
    const userMsgId = Date.now() + "-user";
    const msgId = Date.now() + "-ai";

    setMessages(prev => [...prev,
    { id: userMsgId, type: 'user', content: userMsg },
    { id: msgId, type: 'ai', content: '' }
    ]);
    setLoading(true);

    try {
      await streamChat(userMsg, (chunkText) => {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, content: m.content + chunkText } : m
        ));
      });
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + "-err", type: 'error', content: err.message }]);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="background-animations">
        <div className="shape-1 gradient-sphere"></div>
        <div className="shape-2 gradient-sphere"></div>
        <div className="shape-3 gradient-sphere"></div>
      </div>

      <div className="flex h-screen max-w-[1600px] mx-auto p-6 gap-6 overflow-hidden relative z-10 animate-layout-entry">
        {/* Sidebar */}
        <aside className="w-[320px] flex flex-col shrink-0">
          <div className="flex items-center gap-4 mb-10 group">
            <div className="text-4xl filter drop-shadow hover:scale-110 transition-transform duration-300 cursor-pointer animate-pulse">📦</div>
            <div>
              <h1 className="text-2xl font-bold text-gradient m-0 animate-glow">LogiDoc AI</h1>
              <p className="text-xs text-brand-500 uppercase tracking-widest font-bold m-0 opacity-80 group-hover:opacity-100 transition-opacity">v2.0 Beta</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm text-brand-500 uppercase tracking-widest mb-4 font-semibold transition-colors hover:text-brand-400">
                Configuration
            </h2>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 shadow-inner hover:shadow-brand-500/10 transition-shadow animate-pulse-border">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-200">Local Model</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
                </div>
                <code className="text-xs text-brand-400 font-semibold bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">phi3</code>
                <p className="text-xs text-text-sec mt-3 leading-relaxed">System is securely processing your queries locally. Completely offline.</p>
                
                <button 
                  onClick={handleReset}
                  className="mt-4 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all hover:border-red-500/50 flex items-center justify-center gap-2"
                >
                  <span className="text-sm">🔄</span> Reset Workspace
                </button>
            </div>
          </div>

          <UploadArea key={resetKey} onUploadSuccess={() => setDocReady(true)} />

          <div className="mt-auto pb-4">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50 mb-4"></div>
            <div className="text-[15px] text-text-sec/60 flex justify-between uppercase tracking-wider font-semibold">
              <span>RAG Architecture</span>
              <span>By Group-12</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 glass-panel">
          <ChatBox messages={messages} loading={loading} />

          <div className="m-5 flex bg-slate-800/80 border border-slate-700 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-brand-500/50 transition-all duration-300 hover:border-slate-600 no-print">
            <input
              className="flex-1 bg-transparent border-0 px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
              type="text"
              value={inputState}
              onChange={(e) => setInputState(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={docReady ? "Ask a question about your logistics document..." : "Upload a document first to unlock chat..."}
              disabled={!docReady}
            />
            <button
              className={`px-8 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 ${docReady && inputState.trim() && !loading
                ? "bg-brand-500 hover:bg-brand-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer transform hover:scale-105 active:scale-95"
                : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                }`}
              onClick={handleSend}
              disabled={!docReady || !inputState.trim() || loading}
            >
              <span>Send</span>
              <span className="text-[10px] opacity-70">⏎</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
