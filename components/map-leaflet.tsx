"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  center: [number, number]
  zoom: number
  routes: Array<{
    id: number
    name: string
    code: string
    stops: string[]
    fare: string
    time: string
  }>
  landmarks: Array<{
    name: string
    type: string
  }>
  selectedRoute: number | null
}

const routeCoordinates: Record<number, [number, number][]> = {
  1: [
    [10.6850, 122.5500],
    [10.6900, 122.5550],
    [10.6950, 122.5600],
    [10.7000, 122.5650],
  ],
  2: [
    [10.6800, 122.5550],
    [10.6850, 122.5600],
    [10.6900, 122.5650],
    [10.6950, 122.5700],
  ],
  3: [
    [10.7000, 122.5400],
    [10.7050, 122.5500],
    [10.7100, 122.5600],
    [10.7150, 122.5700],
  ],
  4: [
    [10.6700, 122.5400],
    [10.6800, 122.5500],
    [10.6900, 122.5600],
    [10.7000, 122.5650],
  ],
}

const landmarkCoordinates: Record<string, [number, number]> = {
  "Miag-ao Church": [10.6980, 122.5430],
  "SM City Iloilo": [10.7050, 122.5750],
  "Iloilo River Esplanade": [10.6900, 122.5650],
  "La Paz Market": [10.6850, 122.5700],
  "Molo Church": [10.6800, 122.5500],
  "Jaro Cathedral": [10.6900, 122.5400],
}

export default function MapLeaflet({
  center,
  zoom,
  routes,
  landmarks,
  selectedRoute,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView(center, zoom)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Center marker
    L.marker(center, {
      icon: L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .bindPopup("Iloilo City Center")
      .addTo(map.current)

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom])

  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => map.current?.removeLayer(marker))
    markersRef.current = []

    // Clear existing polyline
    if (polylineRef.current) {
      map.current.removeLayer(polylineRef.current)
      polylineRef.current = null
    }

    // Add landmark markers
    landmarks.forEach((landmark) => {
      const coords = landmarkCoordinates[landmark.name]
      if (coords && map.current) {
        const marker = L.marker(coords, {
          icon: L.icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .bindPopup(`<strong>${landmark.name}</strong><br/>${landmark.type}`)
          .addTo(map.current)

        markersRef.current.push(marker)
      }
    })

    // Add selected route polyline
    if (selectedRoute !== null && routeCoordinates[selectedRoute]) {
      const routeCoords = routeCoordinates[selectedRoute]
      const selectedRouteName = routes.find((r) => r.id === selectedRoute)?.name

      polylineRef.current = L.polyline(routeCoords, {
        color: "hsl(var(--color-primary))",
        weight: 3,
        opacity: 0.8,
        dashArray: "5, 5",
      })
        .bindPopup(`<strong>${selectedRouteName}</strong>`)
        .addTo(map.current)

      // Add stop markers for selected route
      const selectedRouteData = routes.find((r) => r.id === selectedRoute)
      if (selectedRouteData) {
        selectedRouteData.stops.forEach((stop, index) => {
          const coords = routeCoords[index]
          if (coords && map.current) {
            const marker = L.marker(coords, {
              icon: L.icon({
                iconUrl:
                  index === 0 || index === selectedRouteData.stops.length - 1
                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                    : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            })
              .bindPopup(`<strong>Stop: ${stop}</strong>`)
              .addTo(map.current)

            markersRef.current.push(marker)
          }
        })
      }

      // Fit bounds to show route
      const bounds = L.latLngBounds(routeCoords)
      map.current?.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [selectedRoute, landmarks, routes])

  return <div ref={mapContainer} className="h-full w-full" />
}