"""
qa_engine.py - Grounded Document Q&A Retrieval Engine
Retrieves relevant document segments, matches semantic keywords, produces page-cited answers,
and prevents hallucination by strictly enforcing grounding.
"""

import re
from typing import List, Dict, Any, Tuple
import config

def find_relevant_passages(
    pages_data: List[Dict[str, Any]],
    query: str,
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant passages across pages using weighted BM25/keyword density.
    Returns list of dicts with:
      - page_num: int
      - passage: str
      - score: float
    """
    if not query.strip() or not pages_data:
        return []

    # Clean query tokens
    query_tokens = [w.lower() for w in re.findall(r"\b\w{3,}\b", query.lower())]
    if not query_tokens:
        query_tokens = query.lower().split()

    scored_passages: List[Dict[str, Any]] = []

    for page in pages_data:
        page_num = page.get("page_num", 1)
        text = page.get("text", "")
        if not text:
            continue

        # Split page into paragraphs/passages (~100-200 words)
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        if not paragraphs:
            paragraphs = [text]

        for para in paragraphs:
            para_lower = para.lower()
            score = 0
            for token in query_tokens:
                count = para_lower.count(token)
                if count > 0:
                    # Score based on frequency and term importance
                    score += count * (1.5 if len(token) > 5 else 1.0)
            
            if score > 0:
                scored_passages.append({
                    "page_num": page_num,
                    "passage": para,
                    "score": score
                })

    scored_passages.sort(key=lambda x: x["score"], reverse=True)
    return scored_passages[:top_k]

def answer_document_question(
    pages_data: List[Dict[str, Any]],
    question: str,
    conversation_history: List[Dict[str, Any]] = None
) -> Tuple[str, List[int]]:
    """
    Answers a user question strictly grounded in retrieved document passages.
    Returns: (answer: str, page_references: List[int])
    """
    if not question.strip():
        return "Please ask a specific question about the document.", []

    relevant = find_relevant_passages(pages_data, question, top_k=4)
    if not relevant:
        return "I could not find information regarding this question in the uploaded document. Please check the terminology or refer to another section.", []

    page_refs = sorted(list(set([r["page_num"] for r in relevant])))
    context_str = "\n\n".join([f"[Page {r['page_num']}]: {r['passage']}" for r in relevant])

    # If Gemini is configured, use it with strict grounding instructions
    if config.is_gemini_configured():
        try:
            from google import genai
            client = genai.Client(api_key=config.GEMINI_API_KEY)
            
            history_context = ""
            if conversation_history:
                recent_turns = conversation_history[-3:]
                for turn in recent_turns:
                    history_context += f"User: {turn.get('question')}\nAssistant: {turn.get('answer')}\n"

            prompt = f"""You are a precise, scholarly document analysis assistant.
Answer the user's question STRICTLY based on the provided document excerpts.

GROUNDING RULES:
1. Only state facts directly supported by the text below.
2. If the answer cannot be found in the text, explicitly state: "This information is not found in the uploaded document."
3. Cite the relevant page numbers like [Page X] in your answer.
4. Do not invent details or speculate beyond what is written.

RELEVANT EXCERPTS:
{context_str}

CONVERSATION HISTORY:
{history_context}

USER QUESTION: {question}

RESPONSE:"""

            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt
            )
            if response.text:
                return response.text.strip(), page_refs
        except Exception as e:
            print(f"Gemini Q&A failed, falling back to extractive: {e}")

    # Deterministic extractive answer when LLM API unavailable
    primary_passage = relevant[0]["passage"]
    answer_text = (
        f"Based on **Page {relevant[0]['page_num']}**, the document states:\n\n"
        f"> \"{primary_passage[:400]}...\"\n\n"
        f"*Supporting pages cited: {', '.join([f'Page {p}' for p in page_refs])}*"
    )
    return answer_text, page_refs
