import React, { useState } from 'react';
import { uploadDocument, verifyDocument } from '../api/apiService';

const UploadArea = ({ onUploadSuccess }) => {
    const [uploadStatus, setUploadStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [animState, setAnimState] = useState('idle'); // idle, dropping, verifying, verify_pass, verify_reject, filling, done
    const [selectedFile, setSelectedFile] = useState(null);

    const processFile = async (file) => {
        if(!file) return;
        
        // Stage 1: The Drop
        setAnimState('dropping');
        setUploadStatus('Intercepting payload...');
        await new Promise(r => setTimeout(r, 600));

        // Stage 2: Verification
        setAnimState('verifying');
        setUploadStatus('AI performing semantic classification check...');
        
        try {
            const verifyRes = await verifyDocument(file);
            // Allow animation breathing room
            await new Promise(r => setTimeout(r, 600));
            
            if (verifyRes.is_logistics) {
                setAnimState('verify_pass');
                setUploadStatus('✅ Validated as Logistics Content.');
                setSelectedFile(file);
            } else {
                setAnimState('verify_reject');
                setUploadStatus('⚠️ Unrelated Content Detected. Document aborted.');
                setSelectedFile(null);
            }
        } catch(err) {
            setAnimState('idle');
            setUploadStatus(`Verification Error: ${err.message}`);
        }
    };

    const proceedToAnalyze = async () => {
        if (!selectedFile) return;
        
        setAnimState('filling');
        setUploadStatus('Ingesting data pipeline...');
        
        try {
            const res = await uploadDocument(selectedFile);
            await new Promise(r => setTimeout(r, 800));
            
            setAnimState('done');
            setUploadStatus(`Success! Generated ${res.chunks} chunks.`);
            setSelectedFile(null);
            setTimeout(() => onUploadSuccess(), 800);
        } catch(err) {
            setAnimState('verify_pass'); // fallback to pass state
            setUploadStatus(`Ingestion Error: ${err.message}`);
        }
    };

    const handleFileUpload = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            processFile(file);
        } else {
            setUploadStatus("Please upload a valid PDF file.");
        }
    };

    return (
        <section className="mt-8">
            <h2 className="text-sm text-brand-500 uppercase tracking-wider mb-4 font-semibold">
                Document Ingestion
            </h2>
            <label 
                className={`overflow-hidden relative block border border-dashed rounded-lg p-8 text-center transition-all duration-300
                    ${animState === 'idle' ? 'cursor-pointer hover:border-brand-500 hover:bg-brand-500/5' : 'cursor-default'}
                    ${isDragging && animState === 'idle' ? 'border-brand-500 bg-brand-500/10' : 'border-color-glass-border'}
                    ${animState === 'verify_pass' ? 'border-brand-500 bg-brand-500/10' : ''}
                    ${animState === 'verify_reject' ? 'border-red-500 bg-red-500/10 hover:bg-red-500/10 hover:border-red-500' : ''}
                    ${animState === 'done' ? 'border-emerald-500 bg-emerald-500/10 hover:border-emerald-500 hover:bg-emerald-500/10' : ''}
                `}
                onDragOver={(e) => { e.preventDefault(); if(animState==='idle') setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { if(animState==='idle') handleDrop(e); }}
            >
                {animState === 'filling' || animState === 'done' ? <div className="animate-fill"></div> : null}
                
                <div className={`text-4xl mb-3 relative z-10 transition-transform ${
                    animState === 'dropping' ? 'animate-drop' 
                    : animState === 'verifying' ? 'animate-pulse' 
                    : animState === 'verify_reject' ? 'scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : (animState === 'filling' || animState === 'done' || animState === 'verify_pass' ? 'scale-110' : '')
                }`}>
                    {animState === 'done' ? '✅' : animState === 'verify_reject' ? '✖️' : '📄'}
                </div>
                
                <div className="font-semibold text-text-primary relative z-10">
                    {animState === 'verify_reject' ? 'Invalid Category' : animState === 'done' ? 'Document Uploaded' : 'Drag & Drop PDF'}
                </div>
                
                {!selectedFile && animState !== 'verify_reject' && <div className="text-xs text-text-sec mt-1 relative z-10">
                    {animState === 'done' ? 'Ready for querying' : animState !== 'idle' ? 'Processing...' : 'or click to browse'}
                </div>}

                {animState === 'verify_reject' && (
                    <button onClick={(e) => { e.preventDefault(); setAnimState('idle'); setUploadStatus(''); }} className="mt-4 px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold hover:bg-red-500/40 relative z-10">
                        Try Again
                    </button>
                )}
                
                {animState === 'verify_pass' && (
                    <button onClick={(e) => { e.preventDefault(); proceedToAnalyze(); }} className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-brand-400 transform hover:scale-105 transition-all relative z-10 animate-bounce">
                        Proceed to Analyze
                    </button>
                )}
                
                <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".pdf"
                    className="hidden" 
                    disabled={animState !== 'idle'}
                />
            </label>
            {uploadStatus && (
                <div className={`text-xs mt-3 p-2 rounded relative z-10 transition-colors ${
                    animState === 'done' ? 'text-emerald-400 bg-emerald-500/10' : 
                    animState === 'verify_reject' ? 'text-red-400 bg-red-500/10' :
                    'text-brand-500/80 bg-brand-500/10'
                }`}>
                    {uploadStatus}
                </div>
            )}
        </section>
    );
};

export default UploadArea;
