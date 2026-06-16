import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function createBook(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let coverUrl: string | null = null
  const coverFile = formData.get('cover') as File
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const bytes = await coverFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, bytes, { contentType: coverFile.type })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = publicUrl
    }
  }

  const title = (formData.get('title') as string).trim()
  if (!title) redirect('/books/new?error=Title+is+required')

  const { data, error } = await supabase.from('books').insert({
    user_id: user.id,
    title,
    author: (formData.get('author') as string).trim() || null,
    series: (formData.get('series') as string).trim() || null,
    description: (formData.get('description') as string).trim() || null,
    cover_url: coverUrl,
    external_source: 'manual',
  }).select('id').single()

  if (error) redirect(`/books/new?error=${encodeURIComponent(error.message)}`)
  redirect(`/books/${data.id}`)
}

const inputClass = 'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'

export default async function NewBookPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Add Book Manually</h1>
      <form action={createBook} encType="multipart/form-data" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-stone-700">Title *</label>
          <input id="title" name="title" required placeholder="Book title" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="author" className="text-sm font-medium text-stone-700">Author</label>
          <input id="author" name="author" placeholder="Author name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="series" className="text-sm font-medium text-stone-700">Series</label>
          <input id="series" name="series" placeholder="Series name (optional)" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-stone-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Book description (optional)"
            className={`${inputClass} resize-none`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="cover" className="text-sm font-medium text-stone-700">Cover Image</label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
        {error && <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>}
        <div className="flex gap-3 mt-2">
          <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">
            Add Book
          </button>
          <a href="/library" className="rounded-lg border border-stone-300 text-stone-700 px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
