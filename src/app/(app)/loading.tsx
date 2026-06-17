import { BookLoader } from '@/components/BookLoader'

// Shown automatically while any authenticated page streams its data.
export default function AppLoading() {
  return (
    <div className="pt-[80px] px-[22px] md:pt-16 md:px-12">
      <BookLoader cards={3} />
    </div>
  )
}
