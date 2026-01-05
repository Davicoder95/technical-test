from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse

# Servicio de autenticación
class AuthService:
    
    @staticmethod
    def authenticate_user(db: Session, login_data: LoginRequest) -> TokenResponse:
       
        #Autentica un usuario y retorna un token JWT.
        # Buscar usuario por email
        user = db.query(User).filter(User.email == login_data.email).first()
        
        # Verificar si el usuario existe y la contraseña es correcta
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas, verifica y vuelve a intentarlo",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear token JWT
        access_token = create_access_token(data={"sub": user.email})
        
        return TokenResponse(access_token=access_token)