from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from app.config.settings import settings

security = HTTPBearer()


def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(
            token.credentials,
            settings.jwt_secret_key,   # ✅ FIXED
            algorithms=[settings.jwt_algorithm]  # ✅ FIXED
        )
        return payload
    except Exception as e:
        print("JWT ERROR:", str(e))  # optional debug
        raise HTTPException(status_code=401, detail="Invalid token")