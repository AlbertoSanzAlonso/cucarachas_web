from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

@api_view(['POST'])
def auth_login(request):
    """Login con email/password → devuelve token DRF."""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email i contrasenya obligatoris'}, status=400)
    
    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'error': 'Correu o contrasenya incorrectes'}, status=401)
    
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'role': 'Administrador'
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auth_logout(request):
    """Invalida el token del usuario."""
    request.user.auth_token.delete()
    return Response({'status': 'Sessió tancada'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me(request):
    """Retorna les dades de l'usuari autenticat."""
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.get_full_name() or user.username,
        'role': 'Administrador'
    })
