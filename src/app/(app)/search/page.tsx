import { Suspense } from 'react'
import { SearchResults } from './SearchResults'

export default function SearchPage() {
  return (
    <div className="pt-[62px] px-[22px] pb-4 md:pt-10 md:px-12 md:pb-[60px] fade-up">
      <div style={{ fontFamily: 'var(--font-newsreader), serif', color: 'var(--ink)', fontWeight: 400 }} className="text-[30px] md:text-[38px] mb-6">
        Discover
      </div>
      <Suspense>
        <SearchResults />
      </Suspense>
    </div>
  )
}
