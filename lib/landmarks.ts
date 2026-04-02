export interface Landmark {
  name: string
  type: string
  coordinates: [number, number] // [lat, lng]
}

export const landmarks: Landmark[] = [
  {
    name: "Miag-ao Church",
    type: "Heritage",
    coordinates: [10.6969, 122.5644],
  },
  {
    name: "SM City Iloilo",
    type: "Shopping",
    coordinates: [10.6950, 122.5620],
  },
  {
    name: "Iloilo River Esplanade",
    type: "Urban",
    coordinates: [10.702837020070335, 122.54784983801503],
  },
  {
    name: "La Paz Market",
    type: "Food",
    coordinates: [10.708776576861046, 122.5676238668577],
  },
  {
    name: "Molo Church",
    type: "Heritage",
    coordinates: [10.7020, 122.5400],
  },
  {
    name: "Jaro Cathedral",
    type: "Heritage",
    coordinates: [10.7150, 122.5550],
  },
  {
    name: "Santa Ana Parish of Molo | Molo Church",
    type: "Heritage",
    coordinates: [10.697540512031699, 122.54444379349131],
  },
  {
    name: "Jaro Metropolitan Cathedral of St. Elizabeth of Hungary & National Shrine of Our Lady of Candles",
    type: "Heritage",
    coordinates: [10.72406703316234, 122.55645779714744],
  },
  {
    name: "Espousal of Our Lady Parish Church",
    type: "Heritage",
    coordinates: [10.717966483446467, 122.53628465756235],
  },
]
