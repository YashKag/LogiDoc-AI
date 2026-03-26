const API_BASE = 'http://127.0.0.1:8000/api';

export const verifyDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        body: formData
    });
    
    if(!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Verification failed');
    }
    return await res.json();
};

export const clearWorkspace = async () => {
    const res = await fetch(`${API_BASE}/clear`, { method: 'POST' });
    if(!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to clear workspace');
    }
    return await res.json();
};

export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
    });
    
    if(!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
};

export const streamChat = async (message, onChunk) => {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    
    if(!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Chat request failed');
    }
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
    }
};
