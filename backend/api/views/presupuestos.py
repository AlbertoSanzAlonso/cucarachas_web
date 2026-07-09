from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.models import Cliente, Presupuesto
from api.presupuesto_email import send_presupuesto_email
from api.presupuesto_pdf import build_presupuesto_pdf
from api.presupuesto_service import create_presupuesto_from_form, update_presupuesto_from_form
from api.serializers_presupuesto import (
    CreatePresupuestoSerializer,
    PresupuestoDetailSerializer,
    PresupuestoListSerializer,
    SendPresupuestoEmailSerializer,
    UpdatePresupuestoSerializer,
)


def _presupuesto_qs():
    return Presupuesto.objects.select_related("cliente", "ubicacion").prefetch_related("detalles")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_presupuestos(request):
    qs = _presupuesto_qs().order_by("-created_at")[:200]
    return Response(PresupuestoListSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_presupuesto_detail(request, pk: int):
    try:
        presupuesto = _presupuesto_qs().get(pk=pk)
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)
    return Response(PresupuestoDetailSerializer(presupuesto).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_presupuesto(request, pk: int):
    try:
        presupuesto = _presupuesto_qs().get(pk=pk)
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdatePresupuestoSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if "lineas" not in data:
        return Response({"detail": "Cal enviar les línies del pressupost."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        presupuesto = update_presupuesto_from_form(
            presupuesto,
            lineas=data["lineas"],
            validez_dias=data.get("validez_dias"),
            garantia_meses=data.get("garantia_meses"),
            notas=data.get("notas"),
            estado=data.get("estado"),
            direccion=data.get("direccion"),
            ciudad=data.get("ciudad"),
            tipo_propiedad=data.get("tipo_propiedad"),
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(PresupuestoDetailSerializer(presupuesto).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_presupuesto(request, pk: int):
    try:
        presupuesto = Presupuesto.objects.get(pk=pk)
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)
    presupuesto.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_presupuesto_email_view(request, pk: int):
    try:
        presupuesto = _presupuesto_qs().get(pk=pk)
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)

    serializer = SendPresupuestoEmailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        send_presupuesto_email(
            presupuesto,
            to_email=data["email"],
            subject=data.get("subject") or None,
            body=data.get("body") or None,
        )
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response(
            {"detail": f"No s'ha pogut enviar el correu: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            "detail": "Pressupost enviat correctament.",
            "presupuesto": PresupuestoDetailSerializer(presupuesto).data,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_presupuesto(request):
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

    return Response(PresupuestoDetailSerializer(presupuesto).data, status=status.HTTP_201_CREATED)


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
        presupuesto = _presupuesto_qs().get(pk=pk)
    except Presupuesto.DoesNotExist:
        return Response({"detail": "Pressupost no trobat."}, status=status.HTTP_404_NOT_FOUND)

    pdf_bytes = build_presupuesto_pdf(presupuesto)
    filename = f"pressupost-cecsa-{presupuesto.id:04d}.pdf"
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
