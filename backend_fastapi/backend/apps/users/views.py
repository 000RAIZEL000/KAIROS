from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer, ForgotPasswordSerializer, ResetPasswordSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp = "1234" # Dummy OTP for now
                user.otp_code = otp
                user.otp_expiration = timezone.now() + timedelta(minutes=10)
                user.save()
                
                print(f"Aca esta el numero de confirmacion: {otp}")
                
                return Response({
                    "message": "Si el email existe, se ha enviado un código de recuperación.",
                    "token": otp
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({
                    "message": "Si el email existe, se ha enviado un código de recuperación."
                }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(email=email)
                
                if not user.otp_code or user.otp_code != token:
                    return Response({"detail": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)
                
                if not user.otp_expiration or timezone.now() > user.otp_expiration:
                    return Response({"detail": "Token expirado"}, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.otp_code = None
                user.otp_expiration = None
                user.save()
                
                return Response({"message": "Contraseña actualizada exitosamente"}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
