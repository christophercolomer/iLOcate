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
 {
    name: "DOIS Seafood Bar and Big Plates",
    type: "Food",
    coordinates: [10.733960911318269, 122.5661866324471],
  },
  {
    name: "Dayneto Seafood Grill & Restaurant",
    type: "Food",
    coordinates: [10.75913433293768, 122.59345959847636],
  },
  {
    name: "Bugoy's Seafood Resto",
    type: "Food",
    coordinates: [10.757940927551093, 122.59338814214664],
  },
  {
    name: "Tytche Grill and Seafood Restaurant",
    type: "Food",
    coordinates: [10.764777235930518, 122.59507758983803],
  },
  {
    name: "Paluto Seafood Grill & Restaurant",
    type: "Food",
    coordinates: [10.757973358181326, 122.59245361680223],
  },
  {
    name: "IGMA SEAFOOD RESTAURANT",
    type: "Food",
    coordinates: [10.75607953604305, 122.59217904773323],
  },
  {
    name: "Payag sa Baybay Seafood and Grill",
    type: "Food",
    coordinates: [10.759583613741787, 122.59409555981111],
  },
  {
    name: "Bulljack Talabahan",
    type: "Food",
    coordinates: [10.753044089625048, 122.59037708494218],
  },
  {
    name: "Chicken Sari-Sari Restaurant",
    type: "Food",
    coordinates: [10.721818809477522, 122.56109618388516],
  },
  {
    name: "KALANPH",
    type: "Food",
    coordinates: [10.722465771312292, 122.56589050408616],
  },
  {
    name: "Sa Poste Café - Del Carmen Jaro",
    type: "Food",
    coordinates: [10.718892086382088, 122.56354623172219],
  },
  {
    name: "Pat-Pat's Kansi House",
    type: "Food",
    coordinates: [10.723337086662148, 122.55733416770454],
  },
  {
    name: "ALICIA BATCHOY LAPAZ BRANCH",
    type: "Food",
    coordinates: [10.712996520779798, 122.57021377535246],
  },
  {
    name: "Netong's Original Special La Paz Batchoy",
    type: "Food",
    coordinates: [10.708976980581577, 122.56788379006483],
  },
  {
    name: "Madge Cafe",
    type: "Food",
    coordinates: [10.709116791570953, 122.56795493464733],
  },
  {
    name: "Roberto's",
    type: "Food",
    coordinates: [10.69432238142466, 122.5712668119209],
  },
  {
    name: "Coffee Crib Cafe",
    type: "Cafe",
    coordinates: [10.720511088390547, 122.56239392275427],
  },
  {
    name: "Coffee Brewtherhood",
    type: "Cafe",
    coordinates: [10.72124157586635, 122.55930662122633],
  },
  {
    name: "bean there. coffee",
    type: "Cafe",
    coordinates: [10.71823799017888, 122.56164170212094],
  },
  {
    name: "The Yield Specialty Coffee",
    type: "Cafe",
    coordinates: [10.727099929771118, 122.5566095839762],
  },
  {
    name: "Monkey Grounds Coffee",
    type: "Cafe",
    coordinates: [10.70934597057672, 122.55187049136245],
  },
  {
    name: "Neighbor Coffee",
    type: "Cafe",
    coordinates: [10.707757842409734, 122.54925312999886],
  },
  {
    name: "bean there. coffee - city proper",
    type: "Cafe",
    coordinates: [10.698631681482047, 122.56194864533974],
  },
  {
    name: "Madge Cafe - Lapaz",
    type: "Cafe",
    coordinates: [10.70951744441596, 122.56818504357632],
  },
  {
    name: "Drip Coffee & Community",
    type: "Cafe",
    coordinates: [10.708861743853888, 122.55227466863532],
  },
  {
    name: "Dud's Cafe",
    type: "Cafe",
    coordinates: [10.728834352091425, 122.55484113795352],
  },
  {
    name: "Palanaguan Cafe",
    type: "Cafe",
    coordinates: [10.725260428581427, 122.54320842999886],
  },
  {
    name: "Coffee Degree",
    type: "Cafe",
    coordinates: [10.71692310843851, 122.56611503330569],
  },
  {
    name: "Palpitate Coffee Iloilo",
    type: "Cafe",
    coordinates: [10.694933493563868, 122.56597909931709],
  },
  {
    name: "The Good Locals Co.",
    type: "Cafe",
    coordinates: [10.700626367341295, 122.56506791465796],
  },
  {
    name: "Amore Coffee",
    type: "Cafe",
    coordinates: [10.730991555874061, 122.53965957602153],
  },
  {
    name: "Chapter Coffee Roastery & Cafe - Iloilo La Paz",
    type: "Cafe",
    coordinates: [10.703371015503937, 122.56018861465796],
  },
  {
    name: "Saigon Brewers",
    type: "Cafe",
    coordinates: [10.72813422345321, 122.55744632261262],
  },
  {
    name: "Aquarium Cafe",
    type: "Cafe",
    coordinates: [10.723035137313119, 122.55426424533975],
  },
  {
    name: "aroma.",
    type: "Cafe",
    coordinates: [10.71161060368349, 122.55405127602151],
  },
  {
    name: "The Grind Coffee Co.",
    type: "Cafe",
    coordinates: [10.700027369048932, 122.55986838397621],
  },
  {
    name: "Flour Bakery + Brunch Cafe",
    type: "Cafe",
    coordinates: [10.69975952418958, 122.5618389385556],
  },
  {
    name: "Madge Cafe",
    type: "Cafe",
    coordinates: [10.707186575535314, 122.54891614533973],
  },
  {
    name: "9:04 Resto Café and Events",
    type: "Cafe",
    coordinates: [10.728625722116929, 122.55607866863531],
  },
  {
    name: "Snap.a.shot Cafe",
    type: "Cafe",
    coordinates: [10.72144151023983, 122.5593649686353],
  },
  {
    name: "Sa Poste Café - Del Carmen Jaro",
    type: "Cafe",
    coordinates: [10.719453106484801, 122.56345428217048],
  },
  {
    name: "Kucho Cafe",
    type: "Cafe",
    coordinates: [10.710020914201346, 122.55101945730674],
  },
  {
    name: "8th Street Coffee",
    type: "Cafe",
    coordinates: [10.714266587734375, 122.57023490603119],
  },
  {
    name: "Owl’s Café",
    type: "Cafe",
    coordinates: [10.73145421442561, 122.55459863795355],
  },
  {
    name: "Cicada Café",
    type: "Cafe",
    coordinates: [10.698573073194513, 122.56741372999885],
  },
  {
    name: "Cafe Maya",
    type: "Cafe",
    coordinates: [10.727172388101925, 122.55187146068066],
  },
  {
    name: "The Coffee Studio",
    type: "Cafe",
    coordinates: [10.6977921234577, 122.56177848397617],
  },
  {
    name: "Book Latté Café, Library & Art Space",
    type: "Cafe",
    coordinates: [10.718830748796714, 122.5480581839762],
  },
  {
    name: "café ula",
    type: "Cafe",
    coordinates: [10.740793852614296, 122.56469471465796],
  },
  {
    name: "St. Clement's Church - Redemptorists Iloilo",
    type: "Church",
    coordinates: [10.710559045016277, 122.56528133033173],
  },
  {
    name: "St. Joseph the Worker Parish Church",
    type: "Church",
    coordinates: [10.735283594676114, 122.54678398801076],
  },
  {
    name: "Nstra. Sra. De La Paz Y Buen Viaje",
    type: "Church",
    coordinates: [10.712946083218212, 122.57147359965853],
  },
  {
    name: "M.H. Del Pilar Nuestra Senora Parish Church",
    type: "Church",
    coordinates: [10.721908469174252, 122.56418828801075],
  },
  {
    name: "San Jose Placer Parish Church",
    type: "Church",
    coordinates: [10.693436337834125, 122.5741979769314],
  },
  {
    name: "Sta. Teresita del Niño Jesus Parish - Iloilo City",
    type: "Church",
    coordinates: [10.693565928484707, 122.56655606897674],
  },
  {
    name: "Our Lady of Fatima Parish Church",
    type: "Church",
    coordinates: [10.702037709013139, 122.57402505732898],
  },
  {
    name: "Arevalo Parish Church (Archdiocesan Shrine of Santo Niño de Arevalo)",
    type: "Church",
    coordinates: [10.690170304749435, 122.51602965999773],
  },
  {
    name: "The Church of Jesus Christ of Latter-day Saints",
    type: "Church",
    coordinates: [10.714375519645746, 122.57285399863417],
  },
  {
    name: "Victory Churches of Asia - Iloilo",
    type: "Church",
    coordinates: [10.694337072995824, 122.53582819067952],
  },
  {
    name: "The Church of Jesus Christ of Latter-day Saints",
    type: "Church",
    coordinates: [10.69845390413905, 122.56228700038172],
  },
  {
    name: "Santa Barbara Parish Church",
    type: "Church",
    coordinates: [10.836890812097712, 122.53304143340699],
  },
  {
    name: "Archdiocesan Shrine of Saint Vincent Ferrer",
    type: "Church",
    coordinates: [10.786647709709229, 122.59014852842455],
  },
  {
    name: "St. Isidore Parish Church - Zarraga",
    type: "Church",
    coordinates: [10.824088000928233, 122.60991833106057],
  },
  {
    name: "Doane Baptist Church",
    type: "Church",
    coordinates: [10.702269251099665, 122.56783455811234],
  },
  {
    name: "Santo Tomas de Villanueva Parish - Miagao Church (Archdiocese of Jaro)",
    type: "Church",
    coordinates: [10.64200874690313, 122.23530092501237],
  },
]
