import { useCallback, useState, type ReactNode } from "react";
import { LocateFixed, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { LocationState } from "@/types";
import { formatCoordinate } from "@/lib/validation";

interface LocationInputProps {
  latitude: number | null;
  longitude: number | null;
  errors?: {
    latitude?: string;
    longitude?: string;
  };
  onChange: (latitude: number | null, longitude: number | null) => void;
  children?: ReactNode;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export function LocationInput({
  latitude,
  longitude,
  errors,
  onChange,
  children,
}: LocationInputProps) {
  const [state, setState] = useState<LocationState>({
    latitude,
    longitude,
    status: "idle",
  });

  const handleUseMyLocation = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: undefined }));
    try {
      const position = await getCurrentPosition();
      const lat = Number(position.coords.latitude.toFixed(5));
      const lng = Number(position.coords.longitude.toFixed(5));
      setState({ latitude: lat, longitude: lng, status: "success" });
      onChange(lat, lng);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message === "User denied Geolocation"
            ? "Location access was denied. Please enter your coordinates manually."
            : err.message
          : "Unable to determine your location.";
      setState((current) => ({
        ...current,
        status: "error",
        error: message,
      }));
    }
  }, [onChange]);

  const hasLocation = state.latitude !== null && state.longitude !== null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input
        type="number"
        step="0.00001"
        label="Latitude"
        placeholder="e.g. 28.6139"
        value={state.latitude ?? ""}
        error={errors?.latitude}
        onChange={(event) => {
          const value = event.target.value;
          const parsed = value === "" ? null : Number(value);
          setState((current) => ({ ...current, latitude: parsed }));
          onChange(parsed, state.longitude);
        }}
        icon={<MapPin className="h-4 w-4" aria-hidden />}
      />
      <Input
        type="number"
        step="0.00001"
        label="Longitude"
        placeholder="e.g. 77.2090"
        value={state.longitude ?? ""}
        error={errors?.longitude}
        onChange={(event) => {
          const value = event.target.value;
          const parsed = value === "" ? null : Number(value);
          setState((current) => ({ ...current, longitude: parsed }));
          onChange(state.latitude, parsed);
        }}
        icon={<MapPin className="h-4 w-4" aria-hidden />}
      />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          loading={state.status === "loading"}
          className="w-fit"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Locating…
            </>
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden />
          )}
          {state.status === "loading" ? "Detecting location…" : "Use My Location"}
        </Button>

        {hasLocation && state.status === "success" && (
          <p className="text-xs text-secondary">
            Location detected — lat {formatCoordinate(state.latitude)}, lng{" "}
            {formatCoordinate(state.longitude)}
          </p>
        )}

        {state.status === "error" && state.error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs text-amber-600">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {state.error}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
