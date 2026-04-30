from pathlib import Path
from langchain_community.vectorstores import FAISS


def build_faiss_index(documents, embedding_model):
    return FAISS.from_documents(documents, embedding_model)


def save_faiss_index(vector_store, index_dir: str):
    Path(index_dir).mkdir(parents=True, exist_ok=True)
    vector_store.save_local(index_dir)


def load_faiss_index(index_dir: str, embedding_model):
    return FAISS.load_local(
        index_dir,
        embedding_model,
        allow_dangerous_deserialization=True,
    )


def get_retriever(vector_store, k: int = 4):
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )