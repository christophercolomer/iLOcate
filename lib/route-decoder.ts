const POLYLINE_PRECISION = 1_000_000;

function decodeSingleValue(encoded: string, startIndex: number) {
  let result = 0;
  let shift = 0;
  let index = startIndex;

  while (true) {
    const byte = encoded.charCodeAt(index++) - 63;
    result |= (byte & 0x1f) << shift;
    shift += 5;

    if (byte < 0x20) {
      break;
    }
  }

  return {
    value: (result & 1) ? ~(result >> 1) : (result >> 1),
    nextIndex: index,
  };
}

export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    const latResult = decodeSingleValue(encoded, index);
    lat += latResult.value;
    index = latResult.nextIndex;

    const lngResult = decodeSingleValue(encoded, index);
    lng += lngResult.value;
    index = lngResult.nextIndex;

    coordinates.push([lat / POLYLINE_PRECISION, lng / POLYLINE_PRECISION]);
  }

  return coordinates;
}

export interface RouteData {
  id: string;
  routeNumber: string;
  routeName: string;
  routeColor: string;
  routeDetails: string;
  availableFrom: string;
  availableTo: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  points: {
    polylineGoingTo?: string;
    goingTo?: Array<{
      id: string;
      sequence: number;
      address: string;
      point: [number, number];
    }>;
    polylineReturning?: string;
    returning?: Array<{
      id: string;
      sequence: number;
      address: string;
      point: [number, number];
    }>;
  };
}

export interface DecodedRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  routeColor: string;
  vehicleTypeName: string;
  goingToCoordinates: [number, number][];
  returningCoordinates: [number, number][];
  stops: Array<{
    id: string;
    sequence: number;
    address: string;
    point: [number, number];
  }>;
}

export async function loadAndDecodeRoutes(): Promise<DecodedRoute[]> {
  try {
    const response = await fetch('/data.json');
    const data = await response.json();

    if (!data.ok || !data.data.routes) {
      console.error('Invalid data format');
      return [];
    }

    return data.data.routes.map((route: RouteData): DecodedRoute => {
      const goingToCoordinates = route.points.polylineGoingTo
        ? decodePolyline(route.points.polylineGoingTo)
        : [];

      const returningCoordinates = route.points.polylineReturning
        ? decodePolyline(route.points.polylineReturning)
        : [];

      return {
        id: route.id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        routeColor: route.routeColor,
        vehicleTypeName: route.vehicleTypeName,
        goingToCoordinates,
        returningCoordinates,
        stops: route.points.goingTo || [],
      };
    });
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
}
