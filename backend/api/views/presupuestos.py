from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Cliente, Presupuesto
from api.presupuesto_pdf import build_presupuesto_pdf
from api.presupuesto_service import create_presupuesto_from_form
from api.serializers_presupuesto import CreatePresupuestoSerializer, PresupuestoListSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_presupuestos(request):
    qs = (
        Presupuesto.objects.select_related("cliente", "ubicacion")
        .order_by("-created_at")[:100]
    )
    return Response(PresupuestoListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_presupuesto_pdf(request):
    serializer = CreatePresupuestoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        presupuesto = create_presupuesto_from_form(
            cliente_id=data["cliente_id"],
            lineas=data["lineas"],
            direccion=data.get("direccion", ""),
            ciudad=data.get("ciudad", "Barcelona"),
            tipo_propiedad=data.get("tipo_propiedad", "Residencial"),
            fecha=data.get("fecha"),
            validez_dias=data.get("validez_dias", 30),
            pest_type=data.get("pest_type", ""),
            severity=data.get("severity", ""),
            garantia_meses=data.get("garantia_meses", 12),
            notas=data.get("notas", ""),
        )
    except Cliente.DoesNotExist:
        return Response({"detail": "Client no trobat."}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    pdf_bytes = build_presupuesto_pdf(presupuesto, issue_date=data.get("fecha"))
    filename = f"pressupost-cecsa-{presupuesto.id:04d}.pdf"
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["X-Presupuesto-Id"] = str(presupuesto.id)
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_presupuesto_pdf(request, pk: int):
    try:
        presupuesto = (
            Presupuesto.objects.select_related("cliente", "ubicacion")
            .prefetch_related("detalles")
            .get(pk=pk)
        )
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)

    pdf_bytes = build_presupuesto_pdf(presupuesto)
    filename = f"pressupost-cecsa-{presupuesto.id:04d}.pdf"
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
