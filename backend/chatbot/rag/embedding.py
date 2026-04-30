from langchain_huggingface import HuggingFaceEmbeddings


_EMBEDDING_MODEL = None


def get_embedding_model():
    global _EMBEDDING_MODEL

    if _EMBEDDING_MODEL is None:
        _EMBEDDING_MODEL = HuggingFaceEmbeddings(
            model_name="BAAI/bge-m3",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    return _EMBEDDING_MODEL