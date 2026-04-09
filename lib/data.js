// ─────────────────────────────────────────────
// FENOMENA FINANCIAL DATA
// ─────────────────────────────────────────────

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// 2026: Jan-Apr = ACTUAL  |  May-Dec = PROJECTION
export const YTD_CUTOFF = 4 // April is the last actual month (index 3, count 4)

export const annual = [
  { year: 2020, total: 576566,   fenomena: 576566,   monthly: [50897,43897,43052,41785,23600,25288,25867,45638,57110,69301,74778,75353] },
  { year: 2021, total: 734696,   fenomena: 734696,   monthly: [48509,57824,68118,60786,62957,62047,77091,61441,74975,52909,60332,62706] },
  { year: 2022, total: 761718,   fenomena: 761718,   monthly: [40725,54117,60529,71512,54546,61736,71206,54994,72545,71314,63442,85051] },
  { year: 2023, total: 785839,   fenomena: 790213,   monthly: [52283,56070,58879,63645,76208,77949,57560,62458,68471,73087,79448,59783] },
  { year: 2024, total: 1243789,  fenomena: 953877,   monthly: [60479,79856,75292,68524,87297,82767,84335,75338,93317,99265,106373,130947] },
  { year: 2025, total: 1205809,  fenomena: 941989,   monthly: [86188,77954,96472,108355,98906,146022,81707,92148,109133,108864,109523,90537] },
  {
    year: 2026,
    total: 1198653,        // full-year budget
    fenomena: 906124,      // full-year budget
    totalYTD: 481321,      // Jan-Apr actual
    fenomenaYTD: 363879,   // Jan-Apr actual (estimated proportionally)
    monthly: [
      156537, 103524, 120491, 100770,   // Jan-Apr ACTUAL
       93976,  86266,  95909,  82827,   // May-Aug PROJECTED
       81580,  97808,  93676,  85291    // Sep-Dec PROJECTED
    ],
    projected: [false, false, false, false, true, true, true, true, true, true, true, true]
  },
]

// Service mix — full year
export const serviceMix = {
  2025: { 'Producción': 661815, 'Medios & Reporting': 343569, 'Comisión': 4360, 'Costos Reembolsables': 231747 },
  2026: { 'Producción': 704123, 'Medios & Reporting': 287072, 'Comisión': 0,    'Costos Reembolsables': 82223  },
  // 2026 YTD (Jan-Apr actual)
  '2026-YTD': { 'Producción': 240717, 'Medios & Reporting': 100017, 'Comisión': 0, 'Costos Reembolsables': 68100 },
}

// Service mix by client for 2026 (approximate from sheet data)
export const serviceByClient = [
  { client: 'ASSA',             produccion: 63285,  medios: 107110, comision: 0    },
  { client: 'ISHOP',            produccion: 132000,  medios: 25636,  comision: 0    },
  { client: 'MOLSON COORS',     produccion: 95000,  medios: 35207,  comision: 0    },
  { client: 'AGENCIAS FEDURO',  produccion: 95000,  medios: 10304,  comision: 0    },
  { client: 'LA HIPOTECARIA',   produccion: 47100,  medios: 27182,  comision: 0    },
  { client: 'VALOR DEVELOPMENT',produccion: 70261,  medios: 0,      comision: 0    },
  { client: 'RELOJIN + CASIO',  produccion: 47256,  medios: 12321,  comision: 0    },
  { client: 'BELLA HOLANDESA',  produccion: 36000,  medios: 8400,   comision: 0    },
  { client: 'ATTENZA',          produccion: 42600,  medios: 0,      comision: 0    },
  { client: 'ASSA MARKET',      produccion: 26900,  medios: 7907,   comision: 0    },
]

export const clients = [
  { name: 'ASSA',             rev26: 170395, rev25: 210265, tier: 1 },
  { name: 'ISHOP',            rev26: 166636, rev25: 14656,  tier: 1 },
  { name: 'MOLSON COORS',     rev26: 130207, rev25: 193047, tier: 1 },
  { name: 'AGENCIAS FEDURO',  rev26: 105304, rev25: 89853,  tier: 1 },
  { name: 'LA HIPOTECARIA',   rev26: 74282,  rev25: 94314,  tier: 2 },
  { name: 'VALOR DEVELOPMENT',rev26: 70261,  rev25: 22595,  tier: 2 },
  { name: 'RELOJIN + CASIO',  rev26: 59577,  rev25: 62057,  tier: 2 },
  { name: 'BELLA HOLANDESA',  rev26: 44400,  rev25: 25674,  tier: 2 },
  { name: 'ATTENZA',          rev26: 42600,  rev25: 63422,  tier: 2 },
  { name: 'ASSA MARKET',      rev26: 34807,  rev25: 41302,  tier: 2 },
  { name: "WELCH'S",          rev26: 28300,  rev25: 28125,  tier: 2 },
  { name: 'CASA SIMONA',      rev26: 20000,  rev25: 5492,   tier: 3 },
  { name: 'AMERICAN TRADE',   rev26: 16104,  rev25: 20652,  tier: 3 },
  { name: 'WHITE CLAW',       rev26: 15000,  rev25: 16250,  tier: 3 },
  { name: 'WESSON',           rev26: 13800,  rev25: 13800,  tier: 3 },
  { name: 'H&M',              rev26: 8925,   rev25: 10415,  tier: 3 },
  { name: 'GRUPO METALES',    rev26: 4125,   rev25: 8250,   tier: 4 },
  { name: 'MAXIA INC',        rev26: 2900,   rev25: 14695,  tier: 4 },
]

export const segments = {
  2025: { Grandes: 499276, Medianos: 293885, Pequeños: 66787 },
  2026: { Grandes: 541521, Medianos: 312549, Pequeños: 52054 },
}
