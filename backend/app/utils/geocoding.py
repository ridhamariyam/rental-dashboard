from __future__ import annotations

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"


def reverse_geocode(latitude: float, longitude: float) -> str | None:
    try:
        response = httpx.get(
            NOMINATIM_URL,
            params={"lat": latitude, "lon": longitude, "format": "json"},
            headers={"User-Agent": "RentPlatform/1.0"},
            timeout=5.0,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return None

    return data.get("display_name")
