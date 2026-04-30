from pathlib import Path

from chatbot.rag.loaders import load_docx
from chatbot.rag.splitter import split_documents
from chatbot.rag.embedding import get_embedding_model
from chatbot.rag.vector_store import build_faiss_index, save_faiss_index

BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"
FILES = [
    ("faq.docx", "faq"),
    ("user_guide.docx", "user_guide"),
    ("user_guide_p2.docx", "user_guide_p2"),
]
FAISS_INDEX_DIR = BASE_DIR / "knowledge_base" / "faiss_index"


def build_index():
    documents = []

    for file_name, source_name in FILES:
        file_path = KNOWLEDGE_DIR / file_name

        if not file_path.exists():
            raise FileNotFoundError(f"Không tìm thấy file: {file_path}")

        docs = load_docx(str(file_path), source_name)
        documents.extend(docs)
    split_docs = split_documents(documents)
    embedding_model = get_embedding_model()

    vector_store = build_faiss_index(split_docs, embedding_model)
    save_faiss_index(vector_store, str(FAISS_INDEX_DIR))

    return {
        "message": "Build FAISS index thành công",
        "knowledge_files": [file_name for file_name, _ in FILES],
        "total_documents": len(documents),
        "total_chunks": len(split_docs),
        "index_dir": str(FAISS_INDEX_DIR),
    }