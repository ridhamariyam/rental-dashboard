from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.users import router as user_router
from app.routers.categories import categoryrouter
from app.routers.bookings import router as bookings
from app.routers.shop import router as shops
from app.routers.products import router as product
from app.routers.staff_leave import router as staff_leave

app = FastAPI()

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
app.include_router(staff_leave)
