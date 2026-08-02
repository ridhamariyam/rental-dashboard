# app/utils/response.py
from typing import Any
from fastapi.responses import JSONResponse
from typing import Any
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": jsonable_encoder(data),
        },
    )


def error_response(
    message: str,
    data: Any = None,
    status_code: int = 400,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": jsonable_encoder(data),
        },
    )