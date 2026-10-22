"""
utils.py – Shared helpers: ObjectId serialisation, document-to-dict conversion.
"""

from bson import ObjectId
from typing import Any, Dict, Optional


def oid(hex_str: str) -> ObjectId:
    """Convert hex string to ObjectId, raising ValueError on bad input."""
    try:
        return ObjectId(hex_str)
    except Exception:
        raise ValueError(f"'{hex_str}' is not a valid ObjectId")


def doc_to_dict(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Recursively convert a MongoDB document (with ObjectId fields) to a plain
    dict suitable for JSON serialisation.
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, dict):
            result[key] = doc_to_dict(value)
        elif isinstance(value, list):
            result[key] = [
                doc_to_dict(v) if isinstance(v, dict) else
                str(v) if isinstance(v, ObjectId) else v
                for v in value
            ]
        else:
            result[key] = value
    return result
