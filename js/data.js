// Gjøvikmillionæren 3D – Komplett Spilldata for Gjøvik

export const TOKENS = [
  { id: 'skibladner', name: 'Skibladner', icon: '🚢', color: '#38bdf8', desc: 'Mjøsas Hvite Svane i egen høye person' },
  { id: 'chocolate', name: 'Gjøvik-Sjokoladen', icon: '🍫', color: '#f59e0b', desc: 'Søt og eksklusiv fra Chokoladefabrikken' },
  { id: 'ski', name: 'Fastland-Hoppski', icon: '🎿', color: '#ef4444', desc: 'Klar for svev fra Hovdetoppen' },
  { id: 'ntnu', name: 'Kallerud-Studenten', icon: '🎓', color: '#a855f7', desc: 'Drøyt god på cyber og billig nudel-økonomi' },
  { id: 'tractor', name: 'Toten-Traktoren', icon: '🚜', color: '#10b981', desc: 'Har krysset kommunegrensa med lommeboka full' },
  { id: 'swan', name: 'Byvåpen-Svanen', icon: '🦢', color: '#f43f5e', desc: 'Kongelig vingesus fra Kauffeldts plass' }
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

// 40 Tiles around the Gjøvik Board (0 to 39) – Balanserte leiepriser!
export const BOARD_TILES = [
  {
    id: 0, type: 'go', name: 'START – Jernbanetorget', shortName: 'START',
    group: 'special', icon: '🚉',
    flavor: 'Velkommen ut av Gjøvik Stasjon! Motta kr 2 000 hver gang du runder Jernbanetorget.'
  },
  {
    id: 1, type: 'street', name: 'Vindingstadbakken', shortName: 'Vindingstad',
    group: 'brown', price: 600, houseCost: 500,
    rents: [30, 120, 350, 850, 1400, 2000],
    flavor: 'Fin utsikt mot Mjøsa, men husk piggdekk i januar!'
  },
  {
    id: 2, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    flavor: 'Prøv lykken ved Mjøskanten! Hva har bølgene skylt i land i dag?'
  },
  {
    id: 3, type: 'street', name: 'Kopperudvegen', shortName: 'Kopperudv.',
    group: 'brown', price: 600, houseCost: 500,
    rents: [50, 200, 550, 1200, 1900, 2600],
    flavor: 'Lang og trofast ferdselsåre opp mot Kopperud.'
  },
  {
    id: 4, type: 'tax', name: 'Kommuneskatt', shortName: 'Skatt kr 1500',
    group: 'special', amount: 1500, icon: '🏛️',
    flavor: 'Gjøvik Rådhus trenger penger til snøbrøyting og blomsterurner i gågata. Betal kr 1 500!'
  },
  {
    id: 5, type: 'station', name: 'Gjøvik Skysstasjon', shortName: 'Skysstasjonen',
    group: 'station', price: 2000, icon: '🚌',
    rents: [250, 500, 1000, 2000],
    flavor: 'Bussene går i alle retninger – til og med til Toten hvis du tør!'
  },
  {
    id: 6, type: 'street', name: 'Teknologivegen', shortName: 'Teknologiv.',
    group: 'lblue', price: 1000, houseCost: 500,
    rents: [70, 300, 800, 1800, 2700, 3600],
    flavor: 'Hjemmet til NTNU i Gjøvik og Norges skarpeste kodehoder.'
  },
  {
    id: 7, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    flavor: 'Siste nytt fra redaksjonen! Trekk et hendelseskort.'
  },
  {
    id: 8, type: 'street', name: 'Kallerudlia', shortName: 'Kallerudlia',
    group: 'lblue', price: 1000, houseCost: 500,
    rents: [70, 300, 800, 1800, 2700, 3600],
    flavor: 'Hybler så tette at du hører naboen puste under eksamenstida.'
  },
  {
    id: 9, type: 'street', name: 'Studievegen', shortName: 'Studievegen',
    group: 'lblue', price: 1200, houseCost: 500,
    rents: [90, 400, 1000, 2200, 3200, 4200],
    flavor: 'Her studeres det hardt på hverdager og festes enda hardere i fadderuka!'
  },
  {
    id: 10, type: 'jail', name: 'Arresten i Fjellhallen', shortName: 'Fjellhallen',
    group: 'special', icon: '⛰️',
    flavor: 'Enten er du bare på besøk for å se håndballkamp, eller så sitter du innelåst 120 meter inne i fjellet!'
  },
  {
    id: 11, type: 'street', name: 'Raufossvegen', shortName: 'Raufossvegen',
    group: 'pink', price: 1400, houseCost: 1000,
    rents: [110, 480, 1250, 2800, 4000, 5200],
    flavor: 'Strake vegen gjennom Hunndalen med lukten av industri og kebab.'
  },
  {
    id: 12, type: 'utility', name: 'Hunnselva Kraftverk', shortName: 'Kraftverket',
    group: 'utility', price: 1500, icon: '⚡',
    flavor: 'Ren vannkraft fra Hunnselva! Leien er 25× terningkastet (eller 60× hvis du også eier Vannverket).'
  },
  {
    id: 13, type: 'street', name: 'Åsvegen', shortName: 'Åsvegen',
    group: 'pink', price: 1400, houseCost: 1000,
    rents: [110, 480, 1250, 2800, 4000, 5200],
    flavor: 'Solrikt og trivelig boligstrøk med utsikt over dalen.'
  },
  {
    id: 14, type: 'street', name: 'Blomshøgda', shortName: 'Blomshøgda',
    group: 'pink', price: 1600, houseCost: 1000,
    rents: [130, 560, 1450, 3200, 4500, 5800],
    flavor: 'Høyt hevet i Hunndalen – her bor folk som liker frisk luft!'
  },
  {
    id: 15, type: 'station', name: 'Gjøvikbanen', shortName: 'Gjøvikbanen',
    group: 'station', price: 2000, icon: '🚆',
    rents: [250, 500, 1000, 2000],
    flavor: 'Nordbanen fra 1902 – går som ei klokke (når det ikke er løv på skinner).'
  },
  {
    id: 16, type: 'street', name: 'Trondhjemsvegen', shortName: 'Trondhjemsv.',
    group: 'orange', price: 1800, houseCost: 1000,
    rents: [150, 650, 1700, 3700, 5100, 6500],
    flavor: 'Klassisk innfartsåre fra nord gjennom Tongjordet.'
  },
  {
    id: 17, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    flavor: 'Prøv lykken! Kanskje Mjøsørreten biter i dag?'
  },
  {
    id: 18, type: 'street', name: 'Marcus Thranes gate', shortName: 'M. Thranes gt.',
    group: 'orange', price: 1800, houseCost: 1000,
    rents: [150, 650, 1700, 3700, 5100, 6500],
    flavor: 'Rett ved sentrumskjernen og parkområdene.'
  },
  {
    id: 19, type: 'street', name: 'Strandgata', shortName: 'Strandgata',
    group: 'orange', price: 2000, houseCost: 1000,
    rents: [170, 750, 1950, 4100, 5600, 7200],
    flavor: 'Langs Mjøskanten med hoteller, restauranter og bølgeskvulp.'
  },
  {
    id: 20, type: 'parking', name: 'Fastland Friluftsbad', shortName: 'Fastland',
    group: 'special', icon: '🏊‍♂️',
    flavor: 'Stup fra 10-meteren på det hvite funkis-stupetårnet fra 1947! Med Fastland-husregelen vinner du hele potten her.'
  },
  {
    id: 21, type: 'street', name: 'Jernbanegata', shortName: 'Jernbanegata',
    group: 'red', price: 2200, houseCost: 1500,
    rents: [190, 850, 2200, 4600, 6200, 7800],
    flavor: 'Travel sentrumsgate rett opp fra stasjonen.'
  },
  {
    id: 22, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    flavor: 'Ekstra! Ekstra! Les dagens overskrifter fra Gjøvik!'
  },
  {
    id: 23, type: 'street', name: 'Hunnsvegen', shortName: 'Hunnsvegen',
    group: 'red', price: 2200, houseCost: 1500,
    rents: [190, 850, 2200, 4600, 6200, 7800],
    flavor: 'Sentral og ettertraktet gate rett ved parken og kulturhuset.'
  },
  {
    id: 24, type: 'street', name: 'Hovdetoppen', shortName: 'Hovdetoppen',
    group: 'red', price: 2400, houseCost: 1500,
    rents: [220, 950, 2500, 5100, 6800, 8500],
    flavor: 'Byens beste utsiktspunkt! Her ser du helt til Helgøya og enda lenger.'
  },
  {
    id: 25, type: 'station', name: 'Skibladnerbrygga', shortName: 'Skibladner',
    group: 'station', price: 2000, icon: '🚢',
    rents: [250, 500, 1000, 2000],
    flavor: 'Verdens eldste hjuldamper i drift legger til kai med laks og jordbær!'
  },
  {
    id: 26, type: 'street', name: 'Kauffeldts plass', shortName: 'Kauffeldts pl.',
    group: 'yellow', price: 2600, houseCost: 1500,
    rents: [240, 1050, 2800, 5600, 7400, 9200],
    flavor: 'Knutepunktet oppkalt etter glassverkets grunnlegger Caspar Kauffeldt.'
  },
  {
    id: 27, type: 'street', name: 'Kyrre Grepps gate', shortName: 'Kyrre Grepps',
    group: 'yellow', price: 2600, houseCost: 1500,
    rents: [240, 1050, 2800, 5600, 7400, 9200],
    flavor: 'Staselig bygate med kort vei til alt Gjøvik har å by på.'
  },
  {
    id: 28, type: 'utility', name: 'Gjøvik Vannverk', shortName: 'Vannverket',
    group: 'utility', price: 1500, icon: '🚰',
    flavor: 'Friskt Mjøsvann i alle kraner! Leie = 25× terningkast (60× hvis du har begge verk).'
  },
  {
    id: 29, type: 'street', name: 'Glassverksgata', shortName: 'Glassverksgt.',
    group: 'yellow', price: 2800, houseCost: 1500,
    rents: [260, 1150, 3000, 6000, 7900, 9800],
    flavor: 'Historisk grunn der det berømte Gjøvik Glassverk glitret i koboltblått.'
  },
  {
    id: 30, type: 'gotojail', name: 'Tatt i laserkontroll!', shortName: 'Gå i Arresten!',
    group: 'special', icon: '🚓',
    flavor: 'Du ble målt til 92 km/t forbi Huntonstranda! Rykk direkte inn i Arresten i Fjellhallen uten å motta kr 2 000.'
  },
  {
    id: 31, type: 'street', name: 'Øvre Torvgate', shortName: 'Øvre Torvgt.',
    group: 'green', price: 3000, houseCost: 2000,
    rents: [280, 1250, 3300, 6600, 8600, 10600],
    flavor: 'Yrende byliv, kafeer og oppløpssiden mot Storgata!'
  },
  {
    id: 32, type: 'street', name: 'Nedre Torvgate', shortName: 'Nedre Torvgt.',
    group: 'green', price: 3000, houseCost: 2000,
    rents: [280, 1250, 3300, 6600, 8600, 10600],
    flavor: 'Midt i smørøyet mellom gågata, torget og brygga.'
  },
  {
    id: 33, type: 'chest', name: 'Mjøsgløtt', shortName: 'Mjøsgløtt',
    group: 'special', icon: '🎁',
    flavor: 'Trekk et lykkekort fra Mjøsas dyp!'
  },
  {
    id: 34, type: 'street', name: 'Storgata', shortName: 'Storgata',
    group: 'green', price: 3200, houseCost: 2000,
    rents: [320, 1400, 3700, 7300, 9400, 11500],
    flavor: 'Selve kronjuvelen av gågater i Innlandet! Eier du Storgata, styrer du byen.'
  },
  {
    id: 35, type: 'station', name: 'Mjøsbrua Ekspress', shortName: 'Mjøsbrua',
    group: 'station', price: 2000, icon: '🌉',
    rents: [250, 500, 1000, 2000],
    flavor: '1 421 meter bru rett over til Ringsaker og E6!'
  },
  {
    id: 36, type: 'chance', name: 'Byavisa', shortName: 'Byavisa',
    group: 'special', icon: '📰',
    flavor: 'Hva skjer i Gjøvik i kveld? Trekk et kort!'
  },
  {
    id: 37, type: 'street', name: 'CC Gjøvik Torg', shortName: 'CC Gjøvik',
    group: 'dblue', price: 3500, houseCost: 2000,
    rents: [380, 1600, 4200, 8200, 10500, 13000],
    flavor: 'Innlandets største handelssenter – her ryker tusenlappene fortere enn svint!'
  },
  {
    id: 38, type: 'tax', name: 'Luksus- & Bryggeskatt', shortName: 'Skatt kr 1000',
    group: 'special', amount: 1000, icon: '🍾',
    flavor: 'Du bestilte laks, jordbær og champagne på 1. klasse på Skibladner. Betal kr 1 000!'
  },
  {
    id: 39, type: 'street', name: 'Gjøvik Gård', shortName: 'Gjøvik Gård',
    group: 'dblue', price: 4000, houseCost: 2000,
    rents: [500, 2000, 5000, 9500, 12000, 15000],
    flavor: 'Den hvite hovedbygningen midt i byen med egen park og svanedam. Dyrere blir det ikke!'
  }
];

// 22 Humoristiske BYAVISA-kort (Sjanse)
export const CHANCE_CARDS = [
  {
    title: 'Utflukt med Skibladner!',
    desc: 'Kapteinen vinker deg om bord med dampfløyta på full guffe! Rykk frem til Skibladnerbrygga. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 25, icon: '🚢'
  },
  {
    title: 'Byvandring i Storgata!',
    desc: 'Du skal på lørdagshandel i gågata! Rykk frem til Storgata. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 34, icon: '🛍️'
  },
  {
    title: 'Utsolgt konsert i Fjellhallen!',
    desc: 'Du arrangerte allsang med Vazelina-klassikere 120 meter inne i fjellet! Hver medspiller kjøper VIP-billett av deg for kr 350.',
    action: 'collect_from_all', amount: 350, icon: '🎸'
  },
  {
    title: 'Blankholke i Vindingstadbakken!',
    desc: 'Strøbilen kom for sent og snøen raser fra takene dine! Betal kr 200 per hus og kr 750 per hotell i vedlikehold.',
    action: 'street_repairs', house: 200, hotel: 750, icon: '❄️'
  },
  {
    title: 'Frikort fra Rådhuset!',
    desc: 'Du spanderte kremmerhus fra Gjøvik Chokolade på hele formannskapet. Behold kortet for å slippe gratis ut av Arresten!',
    action: 'jail_free', icon: '🎟️'
  },
  {
    title: 'Storkar på Gjøvik Gård!',
    desc: 'Du er invitert på hagefest med ordføreren hos Mjøsmuseet! Rykk direkte frem til Gjøvik Gård.',
    action: 'move_to', target: 39, icon: '🦢'
  },
  {
    title: 'Feilparkert ved CC Gjøvik!',
    desc: 'Du stod 3 minutter over tiden mens du bare skulle «innom en kjapp tur» før jul. Betal kr 600 i parkeringsgebyr.',
    action: 'pay_pot', amount: 600, icon: '🅿️'
  },
  {
    title: 'Innovasjonspris på NTNU Kallerud!',
    desc: 'Du lagde en AI-robot som automatisk finner billigste frossenpizza i Gjøvik. Motta kr 1 600 i stipend!',
    action: 'gain_cash', amount: 1600, icon: '💻'
  },
  {
    title: 'Råkjøring forbi Huntonstranda!',
    desc: 'Du prøvde å rekke ferga som ikke finnes lenger, og UP stod med laser! Gå rett i Arresten i Fjellhallen uten å motta kr 2 000.',
    action: 'goto_jail', icon: '🚓'
  },
  {
    title: 'Svimmel i Kallerud-rundkjøringa!',
    desc: 'Du kjørte fire runder ekstra i rundkjøringa ved E6 og tok feil avkjøring! Rykk 3 plasser tilbake.',
    action: 'move_back', steps: 3, icon: '🔄'
  },
  {
    title: 'Måkeangrep på Skibladnerbrygga!',
    desc: 'En gigantisk Mjøs-måke stupte ned og stjal krone-isen din. Du rygget i sjokk! Rykk 3 plasser tilbake.',
    action: 'move_back', steps: 3, icon: '🐦'
  },
  {
    title: 'Sommerdag på Fastland!',
    desc: 'Sola skinner over Hovdetjernet! Rykk frem til Fastland Friluftsbad og ta et svalestup fra 10-meteren.',
    action: 'move_to', target: 20, icon: '🏊‍♂️'
  },
  {
    title: 'Spanderbuksa er på!',
    desc: 'Du ble så glad da sola tittet frem over Hovdetoppen at du spanderte kaffe og napoleonskake på hele bordet! Betal kr 250 til hver spiller.',
    action: 'pay_each_player', amount: 250, icon: '🧁'
  },
  {
    title: 'Elg i sporet i Vindmarka!',
    desc: 'En diger elgokse spiste opp skistavene dine under søndagsturen på Vind. Betal kr 450 for nytt utstyr.',
    action: 'pay_pot', amount: 450, icon: '🫎'
  },
  {
    title: 'Siste tog på Gjøvikbanen!',
    desc: 'Konduktøren holder døra åpen for deg! Rykk frem til Gjøvikbanen. Passerer du START, får du kr 2 000.',
    action: 'move_to', target: 15, icon: '🚆'
  },
  {
    title: 'Stuntmann i Hoppbakken på Fastland!',
    desc: 'Du satte utfor hoppbakken på miniski og landet i telemark! Motta kr 1 200 i stilkarakter-bonus.',
    action: 'gain_cash', amount: 1200, icon: '🎿'
  },
  {
    title: 'Tett sluk i Hunndalen!',
    desc: 'Rørleggeren måtte rykke ut midt under lørdagskvelden. Betal kr 150 per hus og kr 500 per hotell du eier.',
    action: 'street_repairs', house: 150, hotel: 500, icon: '🔧'
  },
  {
    title: 'Kebab-kupp i Hunndalen!',
    desc: 'Du ble kåret til «Månedens stamkunde» i Raufossvegen! Rykk frem til Raufossvegen (motta kr 2 000 hvis du passerer START).',
    action: 'move_to', target: 11, icon: '🥙'
  },
  {
    title: 'Skibladner-laks på krita!',
    desc: 'Kelneren oppdaget at du prøvde å betale for laks og jordbær med gamle bussbilletter fra 1998. Betal kr 700!',
    action: 'pay_pot', amount: 700, icon: '🍓'
  },
  {
    title: 'Filmstatist i Storgata!',
    desc: 'Det spilles inn reklamefilm på Kauffeldts plass, og du ble hyret inn som «autentisk gjøvikenser». Motta kr 1 000!',
    action: 'gain_cash', amount: 1000, icon: '🎬'
  },
  {
    title: 'Ulovlig bading i svanedammen!',
    desc: 'Du tok et nattbad i dammen på Gjøvik Gård og vekket svanene. Vaktmesteren sender deg rett i Arresten i Fjellhallen!',
    action: 'goto_jail', icon: '🦢'
  },
  {
    title: 'Kjøretime i bakkene mot Hovdetoppen!',
    desc: 'Du klarte bakkestart med håndbrekk i 22 graders stigning! Rykk frem til Hovdetoppen.',
    action: 'move_to', target: 24, icon: '🚗'
  }
];

// 22 Humoristiske MJØSGLØTT-kort (Prøvelykken)
export const CHEST_CARDS = [
  {
    title: '1. premie på Gjøvik Marken!',
    desc: 'Du spiste 14 vafler på 3 minutter og vant det gyldne vaffeljernet på Gjøvik Gård! Motta kr 1 500.',
    action: 'gain_cash', amount: 1500, icon: '🎡'
  },
  {
    title: 'Hemmelig Sjokoladeoppskrift!',
    desc: 'Du fant en gammel gullsjekk og originaloppskrift fra Gjøvik Chokoladefabrikk på loftet! Motta kr 2 000.',
    action: 'gain_cash', amount: 2000, icon: '🍫'
  },
  {
    title: 'Lurt av en kremmer fra Toten!',
    desc: 'Du kjøpte en «strøken» snøfreser fra Østre Toten som viste seg å være en gammel gressklipper malt hvit. Betal kr 800.',
    action: 'pay_pot', amount: 800, icon: '🚜'
  },
  {
    title: 'Toget fra Oslo er i rute!',
    desc: 'Et mindre mirakel på Jernbanetorget! Rykk direkte frem til START og motta lønn.',
    action: 'move_to', target: 0, icon: '🚉'
  },
  {
    title: 'Utleie under Fadderuka!',
    desc: 'Du leide ut vedboden på Kallerud som «kompakt studenthybel med sjarm». Motta kr 1 200 i forskuddsleie!',
    action: 'gain_cash', amount: 1200, icon: '🎓'
  },
  {
    title: 'Bursdag på Egon i Strandgata!',
    desc: 'Du feirer runddag med panoramautsikt mot Mjøsa! Alle medspillere gir deg kr 300 hver i bursdagsgave.',
    action: 'collect_from_all', amount: 300, icon: '🎂'
  },
  {
    title: 'Viralt mageplask på Fastland!',
    desc: 'Du tok tidenes mageplask fra 10-meteren på Fastland og fikk 500 000 visninger på TikTok. Motta kr 1 000 i reklamepenger!',
    action: 'gain_cash', amount: 1000, icon: '🏊‍♂️'
  },
  {
    title: 'Mistet stråhatten fra Skibladner!',
    desc: 'En frisk bris utenfor Nes gjorde at sommerhatten din fløy til bunns i Mjøsa. Betal kr 400 for ny hatt.',
    action: 'pay_pot', amount: 400, icon: '🎩'
  },
  {
    title: 'Koboltblått kupp på loppemarked!',
    desc: 'En støvete karaffel du kjøpte for 20 kroner på Kopperud viste seg å være ekte Gjøvik Glassverk fra 1815! Motta kr 2 200.',
    action: 'gain_cash', amount: 2200, icon: '🏺'
  },
  {
    title: 'Rekordfangst i Mjøsa!',
    desc: 'Du dro opp en Mjøsørret på 9,4 kilo rett utenfor Fredevika og solgte den til kokken på Skibladner! Motta kr 1 400.',
    action: 'gain_cash', amount: 1400, icon: '🐟'
  },
  {
    title: 'Nøkkelknippe i Hunnselva!',
    desc: 'Du mistet husnøklene dine i Hunnselva mens du matet endene ved brua. Betal kr 500 til låsesmeden.',
    action: 'pay_pot', amount: 500, icon: '🔑'
  },
  {
    title: 'Skatteoppgjøret fra Gjøvik Kemnerkontor!',
    desc: 'Kemneren har regnet med kuleramme og funnet ut at du har betalt for mye skatt. Motta kr 1 300!',
    action: 'gain_cash', amount: 1300, icon: '💰'
  },
  {
    title: 'Dugnad i borettslaget!',
    desc: 'Du møtte ikke opp på vårdugnaden og må betale «pølse- og rakebot» på kr 200 til hver av de andre spillerne!',
    action: 'pay_each_player', amount: 200, icon: '🌭'
  },
  {
    title: 'Kongelig vink på Jernbanetorget!',
    desc: 'Kongeskipet kom ikke opp Mjøsa, men du vinket pent med flagget på 17. mai i Storgata. Motta kr 800 i borgerbonus!',
    action: 'gain_cash', amount: 800, icon: '🇳🇴'
  },
  {
    title: 'Kjøpte «ekte» Rolex på Gjøvik Marken!',
    desc: 'Klokka begynte å gå baklengs før du rakk ut porten på Gjøvik Gård. Betal kr 600 i lærepenger.',
    action: 'pay_pot', amount: 600, icon: '⌚'
  },
  {
    title: 'Pantelotteri på CC Gjøvik!',
    desc: 'Du trykket på Røde Kors-knappen etter å ha pantet tre bæreposer med julebrusflasker! Motta kr 1 500.',
    action: 'gain_cash', amount: 1500, icon: '🍾'
  },
  {
    title: 'Frikort fra Fjellhallen!',
    desc: 'Du hjalp vaktmesteren i Fjellhallen med å vanne isen før ishockeykamp. Behold kortet for å slippe gratis ut av Arresten!',
    action: 'jail_free', icon: '🏒'
  },
  {
    title: 'Ufrivillig skitur i Øvre Torvgate!',
    desc: 'Du glemte å ta av deg skiene etter turen fra Hovdetoppen og skled rett inn i en blomsterbutikk. Betal kr 550 i erstatning.',
    action: 'pay_pot', amount: 550, icon: '💐'
  },
  {
    title: 'Quiz-mester på puben i Storgata!',
    desc: 'Laget ditt visste både byggeåret til Skibladner (1856) og høyden på stupetårnet på Fastland (10m)! Motta kr 900 i premie.',
    action: 'gain_cash', amount: 900, icon: '🧠'
  },
  {
    title: 'Bompenger over Mjøsbrua!',
    desc: 'AutoPASS-brikka di pep så høyt at måkene skvatt da du krysset Mjøsbrua 8 ganger på én dag. Betal kr 450.',
    action: 'pay_pot', amount: 450, icon: '🌉'
  },
  {
    title: 'Arv fra en rik onkel på Tongjordet!',
    desc: 'Onkel Bjarne etterlot deg en koie og en kasse gamle femhundrelapper! Motta kr 1 800.',
    action: 'gain_cash', amount: 1800, icon: '🧳'
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
  '«Fra Hunndalen til Hovdetoppen – nå skal skjøtene i boks!»',
  '«Pass deg for laserkontrollen ved Huntonstranda!»',
  '«Skibladner legger fra kai, og lommeboka di lukter gull!»'
];
