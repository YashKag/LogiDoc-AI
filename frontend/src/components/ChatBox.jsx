import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatBox = ({ messages, loading }) => {
    const endRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleExportPDF = () => {
        // Native window print gracefully triggers the system's "Save as PDF" dialog
        // This entirely bypasses the html2canvas OKLAB CSS parsing engine crash
        window.print();
    };

    return (
        <main className="flex-1 flex flex-col h-full bg-slate-900/40 rounded-t-xl overflow-hidden relative">
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-transparent backdrop-blur-md z-10">
                <div>
                    <h2 className="text-xl font-medium tracking-tight m-0 text-white flex items-center gap-2">
                        Document Intelligence
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                    </h2>
                    <p className="text-xs text-text-sec mt-1">Chat securely with your local documents</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/30 rounded-full text-[11px] font-semibold text-indigo-300 transition-all shadow-[0_0_10px_rgba(99,102,241,0.15)] flex items-center gap-1.5 uppercase disabled:opacity-50"
                    >
                        {isExporting ? '⏳ Exporting...' : '💾 Export PDF'}
                    </button>
                    <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-[11px] font-semibold text-slate-300 shadow-sm hover:border-slate-500 transition-colors cursor-default tracking-wide uppercase">FastAPI Backend</span>
                    <span className="px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-[11px] font-semibold text-brand-400 shadow-[0_0_10px_rgba(56,189,248,0.1)] hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:border-brand-500/40 transition-all cursor-default tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                        Ollama (Phi-3)
                    </span>
                </div>
            </header>

            <div id="chat-export-container" ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar scroll-smooth">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex max-w-[85%] animate-msg ${msg.type === 'user' ? 'self-end bg-gradient-to-br from-brand-500 to-brand-600 text-white' : 'self-start bg-slate-800/80 border border-slate-700 text-slate-200'} rounded-2xl p-4 shadow-md backdrop-blur-sm hover:shadow-lg transition-shadow`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 text-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            {msg.type === 'user' ? '👤' : (msg.type === 'error' ? '⚠️' : '🤖')}
                        </div>
                        <div className="flex-1 text-sm leading-relaxed pt-1">
                            {msg.type === 'user' || msg.type === 'error' ? (
                                <p>{msg.content}</p>
                            ) : (
                                <div className="markdown-body">
                                    <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex max-w-[85%] self-start bg-slate-800/80 border border-slate-700 rounded-2xl p-4 animate-msg backdrop-blur-sm shadow-md">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 text-lg bg-white/5 border border-white/10 shadow-inner">🤖</div>
                        <div className="flex items-center gap-1.5 pt-2 px-2">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>
        </main>
    );
};

export default ChatBox;
