// Gjøvikmillionæren 3D – Komplett Spilldata for Gjøvik med ekte bilder og lokal kultur

export const PLAYER_COLORS = [
  { id: 'blue',   name: 'Mjøsblå',        hex: '#38bdf8', emoji: '🔵' },
  { id: 'yellow', name: 'Solgul',         hex: '#facc15', emoji: '🟡' },
  { id: 'red',    name: 'Postrød',        hex: '#ef4444', emoji: '🔴' },
  { id: 'purple', name: 'Kallerud-Lilla', hex: '#a855f7', emoji: '🟣' },
  { id: 'green',  name: 'Toten-Grønn',    hex: '#10b981', emoji: '🟢' },
  { id: 'white',  name: 'Svanehvit',      hex: '#f8fafc', emoji: '⚪' },
  { id: 'orange', name: 'Kobberoransje',  hex: '#f97316', emoji: '🟠' },
  { id: 'pink',   name: 'Bringebærrosa',  hex: '#ec4899', emoji: '🩷' },
  { id: 'teal',   name: 'Turkis',         hex: '#14b8a6', emoji: '🩵' }
];

export const TOKENS = [
  { id: 'skibladner', name: 'Skibladner', icon: '🚢', color: '#38bdf8', desc: 'Mjøsas Hvite Svane i egen høye person' },
  { id: 'chocolate', name: 'Gjøvik-Sjokoladen', icon: '🍫', color: '#facc15', desc: 'Søt og eksklusiv fra Chokoladefabrikken' },
  { id: 'ski', name: 'Fastland-Hoppski', icon: '🎿', color: '#ef4444', desc: 'Klar for svev fra Hovdetoppen' },
  { id: 'ntnu', name: 'Kallerud-Studenten', icon: '🎓', color: '#a855f7', desc: 'Drøyt god på cyber og billig nudel-økonomi' },
  { id: 'tractor', name: 'Toten-Traktoren', icon: '🚜', color: '#10b981', desc: 'Har krysset kommunegrensa med lommeboka full' },
  { id: 'swan', name: 'Byvåpen-Svanen', icon: '🦢', color: '#f8fafc', desc: 'Kongelig vingesus fra Kauffeldts plass' }
];

export const GROUP_COLORS = {
  brown:   { name: 'SØRBYEN & VINDINGSTAD', hex: '#854d0e' },
  lblue:   { name: 'KALLERUD & NTNU', hex: '#0284c7' },
  pink:    { name: 'HUNNDALEN', hex: '#db2777' },
  orange:  { name: 'TONGJORDET & STRANDGATA', hex: '#ea580c' },
  red:     { name: 'SENTRUM & HOVDETOPPEN', hex: '#dc2626' },
  yellow:  { name: 'HANDELSKVARTALET', hex: '#eab308' },
  green:   { name: 'TORVGATENE & STORGATA', hex: '#16a34a' },
  dblue:   { name: 'STORKARSSTRØKET', hex: '#1e3a8a' },
  station: { name: 'KOLLEKTIVKNUTEPUNKT', hex: '#334155' },
  utility: { name: 'KOMMUNALE VERK', hex: '#0f766e' },
  special: { name: 'SPESIALFELT', hex: '#475569' }
};

// Hjelpefunksjon for raske, skalerte Wikimedia Commons-bilder
const wm = (filename, width = 720) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;

// 40 Felt rundt Gjøvik-brettet (0 til 39) – Med ekte bilder fra Gjøvik!
export const BOARD_TILES = [
  {
    id: 0, type: 'go', name: 'START – Jernbanetorget', shortName: 'START',
    group: 'special', icon: '🚉',
    photo: wm('Gjøvik_stasjon_-_2012-09-30_at_15-02-29.jpg'),
    photoCaption: 'Gjøvik stasjon og Jernbanetorget',
    flavor: 'Velkommen ut av Gjøvik stasjon! Motta kr 2 000 hver gang du runder Jernbanetorget.'
  },
  {
    id: 1, type: 'street', name: 'Vindingstadbakken', shortName: 'Vindingstad',
    group: 'brown', price: 600, houseCost: 500,
    rents: [30, 120, 350, 850, 1400, 2000],
    photo: wm('Gjøvik_sett_fra_Sørbyen,_8._desember_2005.jpg'),
    photoCaption: 'Utsikt fra Sørbyen og Vindingstad mot Mjøsa',
    flavor: 'Fin utsikt fra Sørbyen mot Mjøsa, men husk piggdekk i januar!'
  },
  {
    id: 2, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    photo: wm('Mjøsa_as_seen_from_Gjøvik.jpg'),
    photoCaption: 'Mjøsa sett fra Gjøvik',
    flavor: 'Prøv lykken ved Mjøskanten! Hva har bølgene skylt i land i dag?'
  },
  {
    id: 3, type: 'street', name: 'Kopperudvegen', shortName: 'Kopperudv.',
    group: 'brown', price: 600, houseCost: 500,
    rents: [50, 200, 550, 1200, 1900, 2600],
    photo: wm('Bratt_bakke_i_Gjøvik_A.jpg'),
    photoCaption: 'Bakkene opp mot Kopperud og Sørbyen i Gjøvik',
    flavor: 'Lang og trofast ferdselsåre opp mot Kopperud.'
  },
  {
    id: 4, type: 'tax', name: 'Kommuneskatt', shortName: 'Skatt kr 1500',
    group: 'special', amount: 1500, icon: '🏛️',
    photo: wm('Gjøvik_rådhus_(2019).jpg'),
    photoCaption: 'Gjøvik rådhus i sentrum',
    flavor: 'Gjøvik Rådhus trenger penger til snøbrøyting og blomsterurner i gågata. Betal kr 1 500!'
  },
  {
    id: 5, type: 'station', name: 'Gjøvik Skysstasjon', shortName: 'Skysstasjonen',
    group: 'station', price: 2000, icon: '🚌',
    rents: [250, 500, 1000, 2000],
    photo: wm('Gjøvik_stasjon_-_2012-09-30_at_15-03-04.jpg'),
    photoCaption: 'Knutepunktet ved Gjøvik stasjon og skysstasjon',
    flavor: 'Bussene går i alle retninger – til og med til Toten hvis du tør!'
  },
  {
    id: 6, type: 'street', name: 'Teknologivegen', shortName: 'Teknologiv.',
    group: 'lblue', price: 1000, houseCost: 500,
    rents: [70, 300, 800, 1800, 2700, 3600],
    photo: wm('NTNU_in_Gjøvik_(main_building).jpg'),
    photoCaption: 'NTNU i Gjøvik i Teknologivegen på Kallerud',
    flavor: 'Hjemmet til NTNU i Gjøvik og Norges skarpeste kodehoder.'
  },
  {
    id: 7, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    photo: wm('Rundkiosken_på_Gjøvik_B.jpg'),
    photoCaption: 'Den klassiske Rundkiosken på Gjøvik',
    flavor: 'Siste nytt fra lokalredaksjonen! Trekk et hendelseskort.'
  },
  {
    id: 8, type: 'street', name: 'Kallerudlia', shortName: 'Kallerudlia',
    group: 'lblue', price: 1000, houseCost: 500,
    rents: [70, 300, 800, 1800, 2700, 3600],
    photo: wm('NTNU_in_Gjøvik_(2021).jpg'),
    photoCaption: 'Kallerud og universitetsområdet i Gjøvik',
    flavor: 'Hybler så tette at du hører naboen puste under eksamenstida.'
  },
  {
    id: 9, type: 'street', name: 'Studievegen', shortName: 'Studievegen',
    group: 'lblue', price: 1200, houseCost: 500,
    rents: [90, 400, 1000, 2200, 3200, 4200],
    photo: wm('NTNU_in_Gjøvik_main_entrance.jpg'),
    photoCaption: 'Studentområdet ved Studievegen på Kallerud',
    flavor: 'Her studeres det hardt på hverdager og festes enda hardere i fadderuka!'
  },
  {
    id: 10, type: 'jail', name: 'Arresten i Fjellhallen', shortName: 'Fjellhallen',
    group: 'special', icon: '⛰️',
    photo: wm('Gjøvik_olympiske_fjellhall_(2023).jpg'),
    photoCaption: 'Gjøvik Olympiske Fjellhall – verdens største publikumshall i fjell',
    flavor: 'Enten er du bare på besøk for å se ishockey, eller så sitter du innelåst 120 meter inne i fjellet!'
  },
  {
    id: 11, type: 'street', name: 'Raufossvegen', shortName: 'Raufossvegen',
    group: 'pink', price: 1400, houseCost: 1000,
    rents: [110, 480, 1250, 2800, 4000, 5200],
    photo: wm('Hunndalen_3.JPG'),
    photoCaption: 'Hunndalen og Raufossvegen i Gjøvik',
    flavor: 'Strake vegen gjennom Hunndalen med lukten av industri, bilopphøggeri og kebab.'
  },
  {
    id: 12, type: 'utility', name: 'Gjøvik Elektrisitetsverk', shortName: 'El-verket',
    group: 'utility', price: 1500, icon: '⚡',
    photo: wm('Mustad_fabrikker_ved_Hunnselva_i_Gjøvik_01.jpg'),
    photoCaption: 'Vannkraft langs Hunnselva og Mustad i Gjøvik',
    flavor: 'Ren vannkraft fra Hunnselva! Leien er 25× terningkastet (eller 60× hvis du også eier Vannverket).'
  },
  {
    id: 13, type: 'street', name: 'Åsvegen', shortName: 'Åsvegen',
    group: 'pink', price: 1400, houseCost: 1000,
    rents: [110, 480, 1250, 2800, 4000, 5200],
    photo: wm('PermaLiv_Hunn_kulturskole_10-03-20.jpg'),
    photoCaption: 'Boligområdet ved Hunn og Åsvegen',
    flavor: 'Solrikt og trivelig boligstrøk med utsikt over dalen.'
  },
  {
    id: 14, type: 'street', name: 'Blomshøgda', shortName: 'Blomshøgda',
    group: 'pink', price: 1600, houseCost: 1000,
    rents: [130, 560, 1450, 3200, 4500, 5800],
    photo: wm('Suburbia_Gjøvik_Oppland.jpg'),
    photoCaption: 'Boligstrøk i høyden i Gjøvik',
    flavor: 'Høyt hevet over Hunndalen – her bor folk som liker frisk luft!'
  },
  {
    id: 15, type: 'station', name: 'Gjøvikbanen', shortName: 'Gjøvikbanen',
    group: 'station', price: 2000, icon: '🚆',
    rents: [250, 500, 1000, 2000],
    photo: wm('Gjøvik_på_Gjøvik_stasjon.JPG'),
    photoCaption: 'Gjøvikbanen klar til avgang på Gjøvik stasjon',
    flavor: 'Nordbanen fra 1902 – går som ei klokke (når det ikke er løv på skinnene).'
  },
  {
    id: 16, type: 'street', name: 'Trondhjemsvegen', shortName: 'Trondhjemsv.',
    group: 'orange', price: 1800, houseCost: 1000,
    rents: [150, 650, 1700, 3700, 5100, 6500],
    photo: wm('Nordbyen_på_Gjøvik_-4.JPG'),
    photoCaption: 'Nordbyen og Trondhjemsvegen i Gjøvik',
    flavor: 'Klassisk innfartsåre fra nord gjennom Nordbyen og Tongjordet.'
  },
  {
    id: 17, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    photo: wm('Gjøvik_Mjøsa.jpg'),
    photoCaption: 'Utsikt over Mjøsa fra Gjøvik',
    flavor: 'Prøv lykken! Kanskje Mjøsørreten biter i dag?'
  },
  {
    id: 18, type: 'street', name: 'Marcus Thranes gate', shortName: 'M. Thranes gt.',
    group: 'orange', price: 1800, houseCost: 1000,
    rents: [150, 650, 1700, 3700, 5100, 6500],
    photo: wm('Gjøvik_stadion.jpg'),
    photoCaption: 'Gjøvik Stadion ved Marcus Thranes gate',
    flavor: 'Rett ved Gjøvik Stadion og sentrumskjernen.'
  },
  {
    id: 19, type: 'street', name: 'Strandgata', shortName: 'Strandgata',
    group: 'orange', price: 2000, houseCost: 1000,
    rents: [170, 750, 1950, 4100, 5600, 7200],
    photo: wm('Strandgata_i_Gjøvik.JPG'),
    photoCaption: 'Strandgata i Gjøvik sentrum',
    flavor: 'Langs Mjøskanten med hoteller, tinghus, restauranter og bølgeskvulp.'
  },
  {
    id: 20, type: 'parking', name: 'Fastland Friluftsbad', shortName: 'Fastland',
    group: 'special', icon: '🏊‍♂️',
    photo: wm('W_-_Fastland_på_Gjøvik_vinterstid.JPG'),
    photoCaption: 'Fastland Friluftsbad med det ikoniske funkis-stupetårnet fra 1947',
    flavor: 'Stup fra 10-meteren på det hvite funkis-stupetårnet fra 1947! Med Fastland-husregelen vinner du hele potten her.'
  },
  {
    id: 21, type: 'street', name: 'Jernbanegata', shortName: 'Jernbanegata',
    group: 'red', price: 2200, houseCost: 1500,
    rents: [190, 850, 2200, 4600, 6200, 7800],
    photo: wm('Jernbanegata_Gjøvik_i_februar.JPG'),
    photoCaption: 'Jernbanegata i Gjøvik sentrum',
    flavor: 'Travel sentrumsgate rett opp fra stasjonen.'
  },
  {
    id: 22, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    photo: wm('Gjøvik_bibliotek_og_litteraturhus_ved_rådhuset.jpg'),
    photoCaption: 'Gjøvik bibliotek og litteraturhus',
    flavor: 'Ekstra! Ekstra! Les dagens overskrifter fra Gjøvik!'
  },
  {
    id: 23, type: 'street', name: 'Hunnsvegen', shortName: 'Hunnsvegen',
    group: 'red', price: 2200, houseCost: 1500,
    rents: [190, 850, 2200, 4600, 6200, 7800],
    photo: wm('Gjøvik_skole_hovedinngang.jpg'),
    photoCaption: 'Sentrum og Gjøvik skole ved Hunnsvegen',
    flavor: 'Sentral og ettertraktet gate rett ved parken og skolen.'
  },
  {
    id: 24, type: 'street', name: 'Hovdetoppen', shortName: 'Hovdetoppen',
    group: 'red', price: 2400, houseCost: 1500,
    rents: [220, 950, 2500, 5100, 6800, 8500],
    photo: wm('Gjøvik_sentrum_sett_fra_Hovdetoppen.JPG'),
    photoCaption: 'Panoramautsikt over Gjøvik og Mjøsa fra Hovdetoppen',
    flavor: 'Byens beste utsiktspunkt! Her ser du helt til Helgøya og enda lenger.'
  },
  {
    id: 25, type: 'station', name: 'Skibladnerbrygga', shortName: 'Skibladner',
    group: 'station', price: 2000, icon: '🚢',
    rents: [250, 500, 1000, 2000],
    photo: wm('Skibladner_(2020).jpg'),
    photoCaption: 'DS Skibladner (1856) – Mjøsas Hvite Svane ved Gjøvik',
    flavor: 'Verdens eldste hjuldamper i drift legger til kai med laks og jordbær!'
  },
  {
    id: 26, type: 'street', name: 'Kauffeldts plass', shortName: 'Kauffeldts pl.',
    group: 'yellow', price: 2600, houseCost: 1500,
    rents: [240, 1050, 2800, 5600, 7400, 9200],
    photo: wm('Gjøvik_rådhus_-_Gjøvik_City_Hall.jpg'),
    photoCaption: 'Kauffeldts plass og rådhuset midt i Gjøvik',
    flavor: 'Knutepunktet oppkalt etter glassverkets grunnlegger Caspar Kauffeldt.'
  },
  {
    id: 27, type: 'street', name: 'Kyrre Grepps gate', shortName: 'Kyrre Grepps',
    group: 'yellow', price: 2600, houseCost: 1500,
    rents: [240, 1050, 2800, 5600, 7400, 9200],
    photo: wm('Sveitservilla_i_Gjøvik_sentrum.jpg'),
    photoCaption: 'Staselig trearkitektur i Gjøvik sentrum',
    flavor: 'Staselig bygate med kort vei til alt Gjøvik har å by på.'
  },
  {
    id: 28, type: 'utility', name: 'Gjøvik Vannverk', shortName: 'Vannverket',
    group: 'utility', price: 1500, icon: '🚰',
    photo: wm('Vikenstranda_på_Gjøvik_1.JPG'),
    photoCaption: 'Mjøskanten ved Vikenstranda i Gjøvik',
    flavor: 'Friskt Mjøsvann i alle kraner! Leie = 25× terningkast (60× hvis du har begge verk).'
  },
  {
    id: 29, type: 'street', name: 'Glassverksgata', shortName: 'Glassverksgt.',
    group: 'yellow', price: 2800, houseCost: 1500,
    rents: [260, 1150, 3000, 6000, 7900, 9800],
    photo: wm('Blått_gjøvikglass_med_kvinnemotiv-II.jpg'),
    photoCaption: 'Koboltblått glass fra historiske Gjøvik Glassverk',
    flavor: 'Historisk grunn der det berømte Gjøvik Glassverk glitret i koboltblått.'
  },
  {
    id: 30, type: 'gotojail', name: 'Tatt i laserkontroll!', shortName: 'Gå i Arresten!',
    group: 'special', icon: '🚓',
    photo: wm('Hunton_fiber_Gjøvik.jpg'),
    photoCaption: 'Innfarten ved Huntonstranda i Gjøvik',
    flavor: 'Du ble målt til 92 km/t forbi Huntonstranda! Rykk direkte inn i Arresten i Fjellhallen uten å motta kr 2 000.'
  },
  {
    id: 31, type: 'street', name: 'Øvre Torvgate', shortName: 'Øvre Torvgt.',
    group: 'green', price: 3000, houseCost: 2000,
    rents: [280, 1250, 3300, 6600, 8600, 10600],
    photo: wm('Gateløp_i_Gjøvik_by.jpg'),
    photoCaption: 'Klassisk gateløp ved Torvgatene i Gjøvik sentrum',
    flavor: 'Yrende byliv, kafeer og oppløpssiden mot Storgata!'
  },
  {
    id: 32, type: 'street', name: 'Nedre Torvgate', shortName: 'Nedre Torvgt.',
    group: 'green', price: 3000, houseCost: 2000,
    rents: [280, 1250, 3300, 6600, 8600, 10600],
    photo: wm('W_-_Gågata_på_Gjøvik_vinterstid.JPG'),
    photoCaption: 'Gågata og Torvgatene i Gjøvik sentrum',
    flavor: 'Midt i smørøyet mellom gågata, torget og brygga.'
  },
  {
    id: 33, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    photo: wm('Rambekkvika_båthavn_gjøvik_1.JPG'),
    photoCaption: 'Rambekkvika båthavn ved Mjøsa i Gjøvik',
    flavor: 'Trekk et lykkekort fra Mjøsas dyp!'
  },
  {
    id: 34, type: 'street', name: 'Storgata', shortName: 'Storgata',
    group: 'green', price: 3200, houseCost: 2000,
    rents: [320, 1400, 3700, 7300, 9400, 11500],
    photo: wm('Storgata_2_Gjøvik_Strandgata_til_venstre.jpg'),
    photoCaption: 'Storgata i Gjøvik sentrum',
    flavor: 'Selve kronjuvelen av gater i Gjøvik! Eier du Storgata, styrer du byen.'
  },
  {
    id: 35, type: 'station', name: 'Mjøsbrua', shortName: 'Mjøsbrua',
    group: 'station', price: 2000, icon: '🌉',
    rents: [250, 500, 1000, 2000],
    photo: wm('Mjøsbrua,_2024.jpg'),
    photoCaption: 'Mjøsbrua (1 421 meter) over Mjøsa mellom Biri og Moelv',
    flavor: '1 421 meter bru rett over Mjøsa mellom Gjøvik kommune og Ringsaker!'
  },
  {
    id: 36, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    photo: wm('17._mai_Gjøvik_2019_01.jpg'),
    photoCaption: 'Folkeliv og feiring i Gjøvik sentrum',
    flavor: 'Hva skjer i Gjøvik i kveld? Trekk et kort!'
  },
  {
    id: 37, type: 'street', name: 'CC Gjøvik', shortName: 'CC Gjøvik',
    group: 'dblue', price: 3500, houseCost: 2000,
    rents: [380, 1600, 4200, 8200, 10500, 13000],
    photo: wm('Cc_gjøvik_2017.jpg'),
    photoCaption: 'CC Gjøvik kjøpesenter',
    flavor: 'Innlandets store handelssenter – her ryker tusenlappene fortere enn svint!'
  },
  {
    id: 38, type: 'tax', name: 'Luksus- & Bryggeskatt', shortName: 'Skatt kr 1000',
    group: 'special', amount: 1000, icon: '🍾',
    photo: wm('Ankommer_Gjøvik_med_Skibladner.JPG'),
    photoCaption: 'Innseilingen til Gjøvik brygge med Skibladner',
    flavor: 'Du bestilte laks, jordbær og champagne på 1. klasse på Skibladner. Betal kr 1 000!'
  },
  {
    id: 39, type: 'street', name: 'Gjøvik Gård', shortName: 'Gjøvik Gård',
    group: 'dblue', price: 4000, houseCost: 2000,
    rents: [500, 2000, 5000, 9500, 12000, 15000],
    photo: wm('Gjövik_gaard_IMG_3459.JPG'),
    photoCaption: 'Den hvite hovedbygningen på Gjøvik Gård midt i byparken',
    flavor: 'Den hvite hovedbygningen midt i byen med egen park, Hunnselva og svanedam. Dyrere blir det ikke!'
  }
];

// 26 Humoristiske BYAVISA-kort (Sjanse) med Vazelina Bilopphøggers & lokal Gjøvik-kultur!
export const CHANCE_CARDS = [
  {
    title: 'Haik med Vazelina Bilopphøggers i 245-en!',
    desc: 'Eldar Vågan svingte innom med en gul Volvo 245 og ga deg skyss mens «Gi meg fri i kveld» ljomet over høyttalerne! Rykk direkte frem til START og motta lønn.',
    action: 'move_to', target: 0, icon: '🎸',
    photo: wm('Vazelina_Bilopphøggers_at_Oslo_Spektrum_October_2022.jpg')
  },
  {
    title: 'Vazelina-konsert i Fjellhallen!',
    desc: 'Du arrangerte jubileumskonsert med Vazelina Bilopphøggers 120 meter inne i fjellet! Alle synger med på «Musikk tel arbe’» og kjøper VIP-billett av deg for kr 350 hver.',
    action: 'collect_from_all', amount: 350, icon: '🎤',
    photo: wm('Vazelina_Bilopphøggers_at_Oslo_Spektrum_October_2022.jpg')
  },
  {
    title: '«Surfbrett» fra 10-meteren på Fastland!',
    desc: 'Inspirert av Vazelina Bilopphøggers tok du med deg et nymalt høgger-surfbrett opp i funkis-stupetårnet på Fastland! Rykk frem til Fastland Friluftsbad.',
    action: 'move_to', target: 20, icon: '🏄‍♂️',
    photo: wm('W_-_Fastland_på_Gjøvik_vinterstid.JPG')
  },
  {
    title: 'Utflukt med Skibladner!',
    desc: 'Kapteinen vinker deg om bord med dampfløyta på full guffe! Rykk frem til Skibladnerbrygga. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 25, icon: '🚢',
    photo: wm('Skibladner_(2020).jpg')
  },
  {
    title: 'Byvandring i Storgata!',
    desc: 'Du skal på lørdagshandel i gågata! Rykk frem til Storgata. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 34, icon: '🛍️',
    photo: wm('Storgata_2_Gjøvik_Strandgata_til_venstre.jpg')
  },
  {
    title: 'Blankholke i Vindingstadbakken!',
    desc: 'Strøbilen kom for sent og snøen raser fra takene dine! Betal kr 200 per hus og kr 750 per hotell i vedlikehold.',
    action: 'street_repairs', house: 200, hotel: 750, icon: '❄️'
  },
  {
    title: 'Frikort fra Rådhuset!',
    desc: 'Du spanderte kremmerhus fra Gjøvik Chokoladefabrikk på hele formannskapet. Behold kortet for å slippe gratis ut av Arresten!',
    action: 'jail_free', icon: '🎟️'
  },
  {
    title: 'Storkar på Gjøvik Gård!',
    desc: 'Du er invitert på Ditlevines Uke og hagefest hos Mjøsmuseet! Rykk direkte frem til Gjøvik Gård.',
    action: 'move_to', target: 39, icon: '🦢',
    photo: wm('Gjövik_gaard_IMG_3459.JPG')
  },
  {
    title: 'Feilparkert ved CC Gjøvik!',
    desc: 'Du stod 3 minutter over tiden på CC Gjøvik mens du bare skulle «innom en kjapp tur» før helga. Betal kr 600 i parkeringsgebyr.',
    action: 'pay_pot', amount: 600, icon: '🅿️',
    photo: wm('Cc_gjøvik_2017.jpg')
  },
  {
    title: 'Innovasjonspris på NTNU Kallerud!',
    desc: 'Du lagde en AI-robot i Teknologivegen som automatisk finner billigste frossenpizza i Gjøvik. Motta kr 1 600 i stipend!',
    action: 'gain_cash', amount: 1600, icon: '💻',
    photo: wm('NTNU_in_Gjøvik_(main_building).jpg')
  },
  {
    title: 'Råkjøring med «Blålys» forbi Huntonstranda!',
    desc: 'Du nynnet på Vazelinas «Blålys» i 92 km/t i 60-sona, og plutselig så du ekte blålys i speilet! Gå rett i Arresten i Fjellhallen uten å motta kr 2 000.',
    action: 'goto_jail', icon: '🚓'
  },
  {
    title: 'Svimmel i Kallerud-rundkjøringa!',
    desc: 'Du kjørte fire runder ekstra i rundkjøringa ved RV4 og tok feil avkjøring mot Raufoss! Rykk 3 plasser tilbake.',
    action: 'move_back', steps: 3, icon: '🔄'
  },
  {
    title: 'Måkeangrep på Skibladnerbrygga!',
    desc: 'En gigantisk Mjøs-måke stupte ned og stjal krone-isen din ved brygga. Du rygget i sjokk! Rykk 3 plasser tilbake.',
    action: 'move_back', steps: 3, icon: '🐦'
  },
  {
    title: 'Spanderbuksa er på!',
    desc: 'Du ble så glad da sola tittet frem over Hovdetoppen at du spanderte kaffe og napoleonskake på hele bordet! Betal kr 250 til hver spiller.',
    action: 'pay_each_player', amount: 250, icon: '🧁'
  },
  {
    title: 'Skidronninga i Vindløypene!',
    desc: 'Du prøvde å holde følge med Ingvild Flugstad Østberg og Harald Østberg Amundsen i skiløypene på Vind, men sprakk etter 400 meter og måtte kjøpe vaffel og solbærtoddy. Betal kr 450.',
    action: 'pay_pot', amount: 450, icon: '🎿',
    photo: wm('Harald_Østberg_Amundsen_0581.jpg')
  },
  {
    title: 'Siste tog på Gjøvikbanen!',
    desc: 'Konduktøren på Nordbanen holder døra åpen for deg! Rykk frem til Gjøvikbanen. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 15, icon: '🚆',
    photo: wm('Gjøvik_på_Gjøvik_stasjon.JPG')
  },
  {
    title: 'Lokaloppgjør på Gjøvik Stadion!',
    desc: 'Gjøvik-Lyn slo Raufoss 2–1 på overtid i Marcus Thranes gate! Du hadde tippet riktig resultat og vinner kr 1 300.',
    action: 'gain_cash', amount: 1300, icon: '⚽',
    photo: wm('Gjøvik_stadion.jpg')
  },
  {
    title: 'Tett sluk i Hunndalen!',
    desc: 'Rørleggeren måtte rykke ut midt under lørdagskvelden. Betal kr 150 per hus og kr 500 per hotell du eier.',
    action: 'street_repairs', house: 150, hotel: 500, icon: '🔧'
  },
  {
    title: 'Kebab-kupp i Hunndalen!',
    desc: 'Du ble kåret til «Månedens stamkunde» i Raufossvegen! Rykk frem til Raufossvegen (motta kr 2 000 hvis du passerer START).',
    action: 'move_to', target: 11, icon: '🥙',
    photo: wm('Hunndalen_3.JPG')
  },
  {
    title: 'Skibladner-laks på krita!',
    desc: 'Kelneren oppdaget at du prøvde å betale for laks og jordbær i 1. plass salong med gamle bussbilletter fra 1998. Betal kr 700!',
    action: 'pay_pot', amount: 700, icon: '🍓'
  },
  {
    title: 'Filmstatist på Kauffeldts plass!',
    desc: 'Det spilles inn film ved Rundkiosken, og du ble hyret inn som «autentisk gjøvikenser med skinnvest». Motta kr 1 000!',
    action: 'gain_cash', amount: 1000, icon: '🎬',
    photo: wm('Rundkiosken_på_Gjøvik_B.jpg')
  },
  {
    title: 'Ulovlig bading i svanedammen!',
    desc: 'Du tok et nattbad i dammen på Gjøvik Gård etter sommerkonsert og vekket svanene. Vaktmesteren sender deg rett i Arresten i Fjellhallen!',
    action: 'goto_jail', icon: '🦢'
  },
  {
    title: 'Kjøretime i bakkene mot Hovdetoppen!',
    desc: 'Du klarte bakkestart med håndbrekk i 22 graders stigning! Rykk frem til Hovdetoppen.',
    action: 'move_to', target: 24, icon: '🚗',
    photo: wm('Gjøvik_sentrum_sett_fra_Hovdetoppen.JPG')
  }
];

// 25 Humoristiske MJØSGLØTT-kort (Prøvelykken) med lokal kultur, Vazelina & Toten-humor!
export const CHEST_CARDS = [
  {
    title: 'Solgte bildeler til Vazelina Bilopphøggers!',
    desc: 'Eldar Vågan trengte en rusten Opel-skjerm og to hjulkapsler som musikkinstrumenter på neste konsert! Du solgte skrotet fra garasjen for kr 1 600.',
    action: 'gain_cash', amount: 1600, icon: '🚗',
    photo: wm('Vazelina_Bilopphøggers_at_Oslo_Spektrum_October_2022.jpg')
  },
  {
    title: '«Urbane Totninger» på Gjøvik Gård!',
    desc: 'Sommershowet i teltet på Gjøvik Gård solgte ut på rekordtid! Du sto for vaffel- og pølsesalget i pausen og håvet inn kr 1 500.',
    action: 'gain_cash', amount: 1500, icon: '🎪',
    photo: wm('The_modernistic_stage_at_Gjøvik_Gård_(the_park),_Gjøvik,_Norway.jpg')
  },
  {
    title: '1. premie på Gjøvik Marken!',
    desc: 'Du spiste 14 vafler på 3 minutter og vant det gyldne vaffeljernet under Gjøvik Marken! Motta kr 1 500.',
    action: 'gain_cash', amount: 1500, icon: '🎡'
  },
  {
    title: 'Hemmelig oppskrift fra Gjøvik Chokoladefabrikk!',
    desc: 'Du fant en original eske Mokkabønner og oppskriften på ekte Gjøvik-sjokolade fra 1909 på loftet! Motta kr 2 000.',
    action: 'gain_cash', amount: 2000, icon: '🍫'
  },
  {
    title: '«Feil side ta Mjøsa»!',
    desc: 'Du sovnet på bussen og våknet på feil side ta Mjøsa! Du måtte betale drosje tilbake over Mjøsbrua til Gjøvik. Betal kr 650.',
    action: 'pay_pot', amount: 650, icon: '🌉',
    photo: wm('Mjøsbrua,_2024.jpg')
  },
  {
    title: 'Lurt av en hestehandler fra Toten!',
    desc: 'Du kjøpte en «strøken» snøfreser fra Østre Toten som viste seg å være en gammel gressklipper malt hvit. Betal kr 800.',
    action: 'pay_pot', amount: 800, icon: '🚜'
  },
  {
    title: 'Toget fra Oslo er i rute!',
    desc: 'Et mindre mirakel på Jernbanetorget! Rykk direkte frem til START og motta lønn.',
    action: 'move_to', target: 0, icon: '🚉',
    photo: wm('Gjøvik_stasjon_-_2012-09-30_at_15-02-29.jpg')
  },
  {
    title: 'Utleie under Fadderuka på Kallerud!',
    desc: 'Du leide ut vedboden som «kompakt studenthybel med panoramautsikt mot komposten». Motta kr 1 200 i forskuddsleie!',
    action: 'gain_cash', amount: 1200, icon: '🎓'
  },
  {
    title: 'Bursdag på Egon i Strandgata!',
    desc: 'Du feirer runddag med pizzabuffet i Strandgata! Alle medspillere gir deg kr 300 hver i bursdagsgave.',
    action: 'collect_from_all', amount: 300, icon: '🎂',
    photo: wm('Strandgata_i_Gjøvik.JPG')
  },
  {
    title: 'Viralt mageplask på Fastland!',
    desc: 'Du tok tidenes mageplask fra 10-meteren på Fastland og fikk 500 000 visninger på TikTok. Motta kr 1 000 i reklamepenger!',
    action: 'gain_cash', amount: 1000, icon: '🏊‍♂️',
    photo: wm('W_-_Fastland_på_Gjøvik_vinterstid.JPG')
  },
  {
    title: 'Mistet stråhatten fra Skibladner!',
    desc: 'En frisk bris midtfjords gjorde at sommerhatten din fløy til bunns i Mjøsa. Betal kr 400 for ny hatt.',
    action: 'pay_pot', amount: 400, icon: '🎩'
  },
  {
    title: 'Koboltblått kupp fra Gjøvik Glassverk!',
    desc: 'En støvete potpurrikrukke du kjøpte for 20 kroner på loppemarked på Kopperud viste seg å være ekte koboltblått Gjøvik-glass fra 1820! Motta kr 2 200.',
    action: 'gain_cash', amount: 2200, icon: '🏺',
    photo: wm('Blått_gjøvikglass_med_kvinnemotiv-II.jpg')
  },
  {
    title: 'Rekordfangst i Mjøsa!',
    desc: 'Du dro opp en Mjøsørret på 9,4 kilo rett utenfor Fredevika og solgte den til kokken på Skibladner! Motta kr 1 400.',
    action: 'gain_cash', amount: 1400, icon: '🐟',
    photo: wm('Mjøsa_as_seen_from_Gjøvik.jpg')
  },
  {
    title: 'Andeløpet i Hunnselva!',
    desc: 'Badeanda di svømte raskest nedover strykene i Hunnselva under det store Andeløpet! Motta kr 1 100 i førstepremie.',
    action: 'gain_cash', amount: 1100, icon: '🦆',
    photo: wm('Hunnselva_andeløp_2013-3.JPG')
  },
  {
    title: 'Nøkkelknippe i Hunnselva!',
    desc: 'Du mistet husnøklene dine i Hunnselva mens du så på endene ved brua. Betal kr 500 til låsesmeden.',
    action: 'pay_pot', amount: 500, icon: '🔑'
  },
  {
    title: 'Skatteoppgjøret fra Gjøvik Kemnerkontor!',
    desc: 'Kemneren på Rådhuset har regnet med kuleramme og funnet ut at du har betalt for mye skatt. Motta kr 1 300!',
    action: 'gain_cash', amount: 1300, icon: '💰',
    photo: wm('Gjøvik_rådhus_(2019).jpg')
  },
  {
    title: 'Dugnad i borettslaget!',
    desc: 'Du møtte ikke opp på vårdugnaden og må betale «pølse- og rakebot» på kr 200 til hver av de andre spillerne!',
    action: 'pay_each_player', amount: 200, icon: '🌭'
  },
  {
    title: '17. mai-toget i Storgata!',
    desc: 'Du spilte stortromme i Gjøvik Bykorps gjennom hele Storgata uten å miste takten! Motta kr 900 i hederspris.',
    action: 'gain_cash', amount: 900, icon: '🥁',
    photo: wm('Gjøvik_bykorps.JPG')
  },
  {
    title: 'Kjøpte «ekte» Rolex på Gjøvik Marken!',
    desc: 'Klokka begynte å gå baklengs før du rakk ut porten på Gjøvik Gård. Betal kr 600 i lærepenger.',
    action: 'pay_pot', amount: 600, icon: '⌚'
  },
  {
    title: 'Pantelotteri på CC Gjøvik!',
    desc: 'Du trykket på Røde Kors-knappen på CC Gjøvik etter å ha pantet tre bæreposer med julebrusflasker! Motta kr 1 500.',
    action: 'gain_cash', amount: 1500, icon: '🍾',
    photo: wm('Cc_gjøvik_entrance.jpg')
  },
  {
    title: 'Pausekonkurranse hos Gjøvik Mammuts i Fjellhallen!',
    desc: 'Du skjøt pucken fra midtbanen rett i hullet under ishockeykamp i Fjellhallen, og hjalp vaktmesteren med ismaskinen etterpå. Behold Frikortet fra Arresten!',
    action: 'jail_free', icon: '🏒',
    photo: wm('Isbanen_i_Gjøvik_Olympiske_Fjellhall.JPG')
  },
  {
    title: 'Ufrivillig skitur i Øvre Torvgate!',
    desc: 'Du glemte å ta av deg skiene etter turen fra Hovdetoppen og skled rett inn i en blomsterbutikk. Betal kr 550 i erstatning.',
    action: 'pay_pot', amount: 550, icon: '💐'
  },
  {
    title: 'Quiz-mester på Havnepuben!',
    desc: 'Laget ditt kunne alle tekstene til Vazelina Bilopphøggers utenat OG visste byggeåret til Skibladner (1856)! Motta kr 950 i premie.',
    action: 'gain_cash', amount: 950, icon: '🧠',
    photo: wm('Havnepuben_på_Gjøvik_en_høstdag.JPG')
  },
  {
    title: 'Sniking i køen til 10-meteren!',
    desc: 'Badevakta på Fastland tok deg på fersken da du snek i trappa på stupetårnet. Gå rett i Arresten i Fjellhallen!',
    action: 'goto_jail', icon: '🛟'
  }
];

export const GJOVIK_QUOTES = [
  '«Det er itte nøye bare du eier Storgata!»',
  '«En ekte gjøvikenser skuer aldri en gavehest i kjeften – med mindre den kommer fra Toten.»',
  '«Husk: Laks og jordbær smaker best når de andre betaler husleia di!»',
  '«Musikk tel arbe’ – fra Hunndalen til Hovdetoppen skal skjøtene i boks!»',
  '«Pass deg for laserkontrollen ved Huntonstranda!»',
  '«Skibladner legger fra kai, og lommeboka di lukter gull!»'
];
