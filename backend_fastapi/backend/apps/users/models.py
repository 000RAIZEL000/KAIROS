from django.db import models
from django.contrib.auth.models import AbstractUser

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class User(AbstractUser, TimestampedModel):
    nombre = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, default="user") # admin | user
    activo = models.BooleanField(default=True)
    
    otp_code = models.CharField(max_length=10, blank=True, null=True)
    otp_expiration = models.DateTimeField(blank=True, null=True)

    # Use email as the username field
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    def __str__(self):
        return self.email
