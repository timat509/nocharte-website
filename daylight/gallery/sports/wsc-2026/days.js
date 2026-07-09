const WSC_EVENT = {
  slug: "wsc-2026",
  title: "WSC Tournament",
  category: "Sports",
  location: "Instalaciones de Liga la Frarándula — SDQ",
  defaultDay: "day-01"
};

function wscMatch(daySlug, slug, label){
  return {
    slug,
    label,
    photos: `${daySlug}/matches/${slug}/photos.js`,
    highlights: `${daySlug}/matches/${slug}/highlights.js`,
    webPath: `${daySlug}/matches/${slug}/web/`,
    fullPath: `${daySlug}/matches/${slug}/full/`
  };
}

function wscMatches(daySlug, count){
  return Array.from({ length: count }, (_, i) => wscMatch(daySlug, `match-${i + 1}`, `Match ${i + 1}`));
}

const WSC_DAYS = [
  {
    slug: "day-01",
    label: "Day 01",
    title: "WSC Tournament — Day 01",
    date: "2026-12-12",
    location: WSC_EVENT.location,
    cover: "day-01/cover.webp",
    photos: "day-01/photos.js",
    highlights: "day-01/highlights.js",
    webPath: "day-01/web/",
    fullPath: "day-01/full/"
  },
  {
    slug: "day-02",
    label: "Day 02",
    title: "WSC Tournament — Day 02",
    date: "2026-12-13",
    location: WSC_EVENT.location,
    cover: "day-02/cover.webp",
    photos: "day-02/photos.js",
    highlights: "day-02/highlights.js",
    webPath: "day-02/web/",
    fullPath: "day-02/full/"
  },
  {
    slug: "day-03",
    label: "Day 03",
    title: "WSC Tournament — Day 03",
    date: "2026-12-14",
    location: WSC_EVENT.location,
    cover: "day-03/cover.webp",
    photos: "day-03/photos.js",
    highlights: "day-03/highlights.js",
    webPath: "day-03/web/",
    fullPath: "day-03/full/",
    matches: [
      wscMatch("day-03", "godfathers-vs-sueltabate", "Godfathers vs Sueltabate"),
      wscMatch("day-03", "plakata-vs-domilquince", "Plakata vs Domilquince"),
      wscMatch("day-03", "cimarrones-vs-loti", "Cimarrones vs Loti"),
      wscMatch("day-03", "agricultores-vs-villanos", "Agricultores vs Villanos")
    ]
  },
  {
    slug: "day-04",
    label: "Day 04",
    title: "WSC Tournament — Day 04",
    date: "2026-12-15",
    location: WSC_EVENT.location,
    cover: "day-04/cover.webp",
    photos: "day-04/photos.js",
    highlights: "day-04/highlights.js",
    webPath: "day-04/web/",
    fullPath: "day-04/full/",
    matches: [
      wscMatch("day-04", "cartel-vs-godfathers", "Cartel vs Godfathers"),
      wscMatch("day-04", "loti-vs-agricultores", "Loti vs Agricultores"),
      wscMatch("day-04", "cimarrones-vs-sueltabate", "Cimarrones vs Sueltabate"),
      wscMatch("day-04", "villanos-vs-plakata", "Villanos vs Plakata")
    ]
  },
  {
    slug: "day-05",
    label: "Day 05",
    title: "WSC Tournament — Day 05",
    date: "2026-12-16",
    location: WSC_EVENT.location,
    cover: "day-05/cover.webp",
    photos: "day-05/photos.js",
    highlights: "day-05/highlights.js",
    webPath: "day-05/web/",
    fullPath: "day-05/full/",
    matches: [
      wscMatch("day-05", "piantini-vs-agricultores", "Piantini vs Agricultores"),
      wscMatch("day-05", "loti-vs-lo-villano", "Loti vs Lo Villano"),
      wscMatch("day-05", "domilquince-vs-godfathers", "Domilquince vs Godfathers"),
      wscMatch("day-05", "plakata-vs-sueltabate", "Plakata vs Sueltabate")
    ]
  },
  {
    slug: "day-06",
    label: "Day 06",
    title: "WSC Tournament — Day 06",
    date: "2026-12-17",
    location: WSC_EVENT.location,
    cover: "day-06/cover.webp",
    photos: "day-06/photos.js",
    highlights: "day-06/highlights.js",
    webPath: "day-06/web/",
    fullPath: "day-06/full/",
    matches: wscMatches("day-06", 4)
  },
  {
    slug: "day-07",
    label: "Day 07",
    title: "WSC Tournament — Day 07",
    date: "2026-12-18",
    location: WSC_EVENT.location,
    cover: "day-07/cover.webp",
    photos: "day-07/photos.js",
    highlights: "day-07/highlights.js",
    webPath: "day-07/web/",
    fullPath: "day-07/full/",
    matches: wscMatches("day-07", 4)
  },
  {
    slug: "day-08",
    label: "Day 08",
    title: "WSC Tournament — Day 08",
    date: "2026-12-19",
    location: WSC_EVENT.location,
    cover: "day-08/cover.webp",
    photos: "day-08/photos.js",
    highlights: "day-08/highlights.js",
    webPath: "day-08/web/",
    fullPath: "day-08/full/",
    matches: wscMatches("day-08", 4)
  },
  {
    slug: "day-09",
    label: "Day 09",
    title: "WSC Tournament — Day 09",
    date: "2026-12-20",
    location: WSC_EVENT.location,
    cover: "day-09/cover.webp",
    photos: "day-09/photos.js",
    highlights: "day-09/highlights.js",
    webPath: "day-09/web/",
    fullPath: "day-09/full/",
    matches: wscMatches("day-09", 4)
  },
  {
    slug: "day-10",
    label: "Day 10",
    title: "WSC Tournament — Day 10",
    date: "2026-12-21",
    location: WSC_EVENT.location,
    cover: "day-10/cover.webp",
    photos: "day-10/photos.js",
    highlights: "day-10/highlights.js",
    webPath: "day-10/web/",
    fullPath: "day-10/full/",
    matches: wscMatches("day-10", 4)
  }
];
