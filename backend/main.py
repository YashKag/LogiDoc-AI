import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from llm_service import LLMService
from rag_engine import RAGEngine

app = FastAPI(title="LogiDoc V2 API")

rag_engine = RAGEngine()
llm_service = LLMService()

class ChatRequest(BaseModel):
    message: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/verify")
async def verify_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        preview_text = rag_engine.extract_preview_text(contents)
        is_logistics = llm_service.classify_document(preview_text)
        
        return {
            "status": "success", 
            "is_logistics": is_logistics,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported in V2.")
        
    try:
        contents = await file.read()
        num_chunks = rag_engine.ingest_document_bytes(contents, file.filename)
        return {
            "status": "success", 
            "message": f"{file.filename} processed successfully.",
            "chunks": num_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clear")
async def clear_workspace():
    try:
        rag_engine.clear_database()
        return {"status": "success", "message": "Database cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not req.message:
        raise HTTPException(status_code=400, detail="Message is required.")
        
    try:
        # Retrieve context from ChromaDB
        context = rag_engine.retrieve_context(req.message)
        
        if not context.strip():
            context = "No relevant context found in the uploaded documents for this question."
            
        generator = llm_service.generate_response(req.message, context)
        
        return StreamingResponse(generator, media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
