from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'nombre', 'email', 'telefono', 'role', 'activo', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'nombre', 'email', 'telefono', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            nombre=validated_data['nombre'],
            password=validated_data['password'],
            telefono=validated_data.get('telefono', '')
        )
        return user

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()
    new_password = serializers.CharField()


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('email') or attrs.get(self.username_field)
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("El correo electrónico no está registrado")

        if not user.check_password(password):
            raise exceptions.AuthenticationFailed("Contraseña incorrecta")

        if not user.is_active or not user.activo:
            raise exceptions.AuthenticationFailed("Esta cuenta está desactivada")

        data = super().validate(attrs)
        return data

