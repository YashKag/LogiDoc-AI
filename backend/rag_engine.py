import os
import fitz # PyMuPDF
import chromadb
from typing import List

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), ".chroma_db")
COLLECTION_NAME = "logistics_v2_docs"

class RAGEngine:
    def __init__(self):
        # Using persistent ChromaDB client; automatically handles SentenceTransformers embeddings
        self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        
    def get_collection(self):
        return self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page_num, page in enumerate(doc):
                text += f"\n[Page {page_num + 1}]\n{page.get_text()}"
            return text
        except Exception as e:
            raise ValueError(f"Failed to read PDF: {str(e)}")

    def extract_preview_text(self, pdf_bytes: bytes, max_chars: int = 1500) -> str:
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text() + " "
                if len(text) > max_chars:
                    break
            return text[:max_chars].strip()
        except Exception:
            return ""

    def chunk_text(self, text: str, chunk_size: int = 150, overlap: int = 30) -> List[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        return chunks

    def ingest_document_bytes(self, pdf_bytes: bytes, doc_name: str) -> int:
        text = self.extract_text_from_pdf(pdf_bytes)
        chunks = self.chunk_text(text)
        
        # Completely clear the database so the LLM only remembers the *latest* uploaded PDF
        self.clear_database()
            
        collection = self.get_collection()
        
        ids = []
        metadatas = []
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_name}_chunk_{i}"
            ids.append(chunk_id)
            metadatas.append({
                "text": chunk,
                "source": doc_name,
                "chunk_id": i
            })
            
        # Bulk upsert
        collection.upsert(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )
        
        return len(chunks)

    def clear_database(self) -> bool:
        try:
            collection = self.get_collection()
            docs = collection.get()
            if docs and docs.get('ids'):
                collection.delete(ids=docs['ids'])
            return True
        except Exception:
            return False

    def retrieve_context(self, question: str, top_k: int = 3) -> str:
        collection = self.get_collection()
        if collection.count() == 0:
            return ""
            
        n_results = min(top_k, collection.count())
        
        results = collection.query(
            query_texts=[question],
            n_results=n_results,
            include=["metadatas", "distances"]
        )
        
        context_parts = []
        if results.get('metadatas') and len(results['metadatas']) > 0:
            for i in range(len(results['metadatas'][0])):
                meta = results['metadatas'][0][i]
                dist = results['distances'][0][i]
                sim = 1.0 - (dist / 2.0)
                
                if sim > 0.35: # Slightly more lenient for testing
                    context_parts.append(f"Source: {meta['source']}\n{meta['text']}")
                    
        return "\n\n---\n\n".join(context_parts)
