import time
from starlette.middleware.base import BaseHTTPMiddleware


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start = time.time()

        response = await call_next(request)

        end = time.time()

        print(
            f"{request.method} "
            f"{request.url.path} "
            f"{response.status_code} "
            f"{end-start:.3f}s"
        )

        return response