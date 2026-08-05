from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.users import router as user_router
from app.routers.categories import categoryrouter
from app.routers.bookings import router as bookings
from app.routers.shop import router as shops
from app.routers.products import router as product
from app.routers.product_variations import router as product_variations
from app.routers.staff_leave import router as staff_leave
from app.routers.attendance import router as attendance
from app.routers.salary import router as salary
from app.utils.upload import UPLOAD_ROOT

app = FastAPI()

UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(bookings)
app.include_router(categoryrouter)
app.include_router(shops)
app.include_router(product)
app.include_router(product_variations)
app.include_router(staff_leave)
app.include_router(attendance)
app.include_router(salary)
