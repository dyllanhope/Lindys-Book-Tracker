const PALETTES: [string, string][] = [
  ['#C3D4B0', '#E0EAD2'],
  ['#F6D6BE', '#F1C2A0'],
  ['#DBCFE9', '#E9E0F1'],
  ['#BDE0D5', '#CFE8E4'],
  ['#E6B9C3', '#D5C3E1'],
  ['#F6D7C0', '#ECC4C4'],
  ['#AFC6A6', '#CCDABF'],
  ['#ECC9C9', '#F4D8C3'],
  ['#C4E3D2', '#D2E1C4'],
  ['#F1C5A6', '#F4D4C0'],
  ['#D7CFE9', '#CCE3DB'],
  ['#C9DAC3', '#EDE7D5'],
]

export function coverGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0
  const [c1, c2] = PALETTES[h % PALETTES.length]
  return `linear-gradient(155deg, ${c1} 0%, ${c2} 70%, ${c1} 140%)`
}

export function coverColors(seed: string): { c1: string; c2: string } {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0
  const [c1, c2] = PALETTES[h % PALETTES.length]
  return { c1, c2 }
}
