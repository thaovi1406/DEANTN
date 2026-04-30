from langchain_community.document_loaders import Docx2txtLoader

def load_docx(file_path: str, source_name: str):
    loader = Docx2txtLoader(file_path)
    docs = loader.load()

    for doc in docs:
        doc.metadata["source"] = source_name

    return docs