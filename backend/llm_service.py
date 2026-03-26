import ollama

class LLMService:
    def __init__(self, model_name="phi3"):
        self.model_name = model_name

    def generate_response(self, question: str, context: str):
        messages = [
            {"role": "system", "content": "You are a raw data extraction tool. You must respond with ONLY the exact answer extracted from the text in a single sentence. Absolutely NO explanations, NO reasoning, and NO extra formatting. Do NOT repeat the user's question. ONLY output the final answer."},
            {"role": "user", "content": f"Context: [The sky is blue and the company made 500 dollars.]\nQuestion: How much money did the company make?"},
            {"role": "assistant", "content": "The company made 500 dollars."},
            {"role": "user", "content": f"Context: [The document states the shipment arrived on Tuesday.]\nQuestion: What is the name of the CEO?"},
            {"role": "assistant", "content": "Data not found in document."},
            {"role": "user", "content": f"Context: [{context}]\nQuestion: {question}"}
        ]
        
        try:
            stream = ollama.chat(model=self.model_name, messages=messages, stream=True)
            for chunk in stream:
                yield chunk['message']['content']
        except Exception as e:
            yield f"\n\nError interacting with local Ollama LLM: {str(e)}"

    def classify_document(self, text_sample: str) -> bool:
        """Returns True if the text sample appears to be related to logistics."""
        if not text_sample.strip():
            return False
            
        messages = [
            {"role": "system", "content": "You are a document classifier. Answer ONLY with 'YES' or 'NO'. Is this text from a document related to logistics, supply chain, delivery, shipping, freight, or business operations?"},
            {"role": "user", "content": f"Text sample: {text_sample[-1000:]}"}
        ]
        
        try:
            response = ollama.chat(model=self.model_name, messages=messages, stream=False)
            content = response['message']['content'].strip().upper()
            # Be relatively lenient but strictly exclude complete nonsense
            return 'YES' in content or 'NO' not in content
        except Exception:
            return True # Fallback on error to avoid blocking completely
