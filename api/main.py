from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Trade App API",
    version="0.1.0"
)

# Allow the public trading frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trade-web.hastenload.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "trade-api",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
