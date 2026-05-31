"""Proxy geocoding (Nominatim / OSM) — evita CORS y respeta User-Agent en el servidor."""
from __future__ import annotations

import urllib.parse

import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
NOMINATIM_HEADERS = {
    "User-Agent": "CECSA-CucarachasBarcelona/1.0 (info@cucarachasbarcelona.cat)",
    "Accept-Language": "ca,es,en",
}


@api_view(["GET"])
@permission_classes([AllowAny])
def geo_search(request):
    """Autocompletar direcciones (prioriza Catalunya / Barcelona)."""
    q = (request.query_params.get("q") or "").strip()
    if len(q) < 3:
        return Response({"results": []})

    params = {
        "q": q,
        "format": "json",
        "limit": 6,
        "addressdetails": 1,
        "countrycodes": "es",
        # Viewbox Barcelona metropolitana (lon_min, lat_max, lon_max, lat_min)
        "viewbox": "1.92,41.55,2.35,41.30",
        "bounded": "0",
    }
    try:
        resp = requests.get(
            f"{NOMINATIM_BASE}/search",
            params=params,
            headers=NOMINATIM_HEADERS,
            timeout=8,
        )
        if resp.status_code != 200:
            return Response({"results": [], "error": "geocode_unavailable"}, status=502)
        raw = resp.json()
        results = []
        for item in raw if isinstance(raw, list) else []:
            lat = item.get("lat")
            lon = item.get("lon")
            label = item.get("display_name") or ""
            if lat and lon and label:
                results.append({
                    "label": label,
                    "lat": float(lat),
                    "lng": float(lon),
                })
        return Response({"results": results})
    except requests.RequestException as e:
        return Response({"results": [], "error": str(e)}, status=502)


@api_view(["GET"])
@permission_classes([AllowAny])
def geo_reverse(request):
    """Coordenades → adreça (GPS del navegador)."""
    try:
        lat = float(request.query_params.get("lat", ""))
        lng = float(request.query_params.get("lng", ""))
    except (TypeError, ValueError):
        return Response({"error": "lat/lng invalid"}, status=400)

    params = urllib.parse.urlencode({
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
    })
    try:
        resp = requests.get(
            f"{NOMINATIM_BASE}/reverse?{params}",
            headers=NOMINATIM_HEADERS,
            timeout=8,
        )
        if resp.status_code != 200:
            return Response({"error": "reverse_failed"}, status=502)
        data = resp.json()
        label = data.get("display_name") or ""
        return Response({"label": label, "lat": lat, "lng": lng})
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=502)
