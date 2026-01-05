from pydantic import BaseModel, EmailStr

# Validación de la petición de login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Respuesta de la petición de login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"