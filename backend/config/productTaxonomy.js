const TAXONOMY = {
  Necklaces: [
    'Choker',
    'Pendant',
    'Princess & Matinee',
    'Lariat',
    'Mangalsutra',
    'Rani Haar',
    'Bib',
    'Collar'
  ],
  Earrings: [
    'Studs',
    'Hoops',
    'Drops',
    'Danglers',
    'Jhumkas',
    'Chandbalis',
    'Ear Cuffs',
    'Chandelier',
    'Huggies'
  ],
  Rings: [
    'Solitaire',
    'Wedding Bands',
    'Cocktail',
    'Stackable',
    'Signet',
    'Eternity Rings',
    'Multi-stone',
    'Lord Ganesh/Religious motifs'
  ],
  Bangles: [
    'Solid Bangles',
    'Kadas (thick)',
    'Interlocking',
    'Meenakari (Enamel)',
    'Adjustable'
  ],
  Bracelets: [
    'Tennis',
    'Charm',
    'Cuff',
    'Chain & Link',
    'Bangle-Bracelets',
    'Beaded',
    'Bolo/Slider'
  ],
  'Nose Jewellery': [
    'Nose Studs',
    'Nath (traditional large ring)',
    'Clip-on (non-pierced)',
    'Septum rings'
  ],
  'Head & Waist': [
    'Maang Tikka (forehead)',
    'Kamarbandh (waist belt/Odiyannam)',
    'Hair Chains'
  ],
  'Foot Jewellery': ['Payal/Anklets', 'Bicchiya (Toe Rings)']
}

export const PRODUCT_TAXONOMY = Object.freeze(
  Object.fromEntries(
    Object.entries(TAXONOMY).map(([category, subCategories]) => [
      category,
      Object.freeze([...subCategories])
    ])
  )
)

export const PRODUCT_CATEGORIES = Object.freeze(Object.keys(PRODUCT_TAXONOMY))

export const PRODUCT_SUB_CATEGORIES = Object.freeze(
  [...new Set(Object.values(PRODUCT_TAXONOMY).flat())]
)

export const isValidCategory = (category) => PRODUCT_CATEGORIES.includes(category)

export const isValidCategorySubCategoryPair = (category, subCategory) =>
  (PRODUCT_TAXONOMY[category] || []).includes(subCategory)
