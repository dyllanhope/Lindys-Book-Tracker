# Graph Report - C:\Users\user-pc\Lindy's book tracker  (2026-06-17)

## Corpus Check
- 54 files · ~28,253 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 127 nodes · 151 edges · 39 communities detected
- Extraction: 58% EXTRACTED · 42% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 29 edges
2. `GET()` - 21 edges
3. `push()` - 7 edges
4. `getOpenLibraryWork()` - 7 edges
5. `importBook()` - 5 edges
6. `addToLibrary()` - 5 edges
7. `getExternalBookDetails()` - 5 edges
8. `fetchWithRetry()` - 5 edges
9. `importExternalBook()` - 5 edges
10. `createCollection()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `push()` --calls--> `getTagsForBooks()`  [INFERRED]
  C:\Users\user-pc\Lindy's book tracker\src\app\(app)\library\LibraryFilters.tsx → C:\Users\user-pc\Lindy's book tracker\src\lib\tags.ts
- `updateProfile()` --calls--> `GET()`  [INFERRED]
  C:\Users\user-pc\Lindy's book tracker\src\app\(app)\account\page.tsx → C:\Users\user-pc\Lindy's book tracker\src\app\auth\callback\route.ts
- `changePassword()` --calls--> `GET()`  [INFERRED]
  C:\Users\user-pc\Lindy's book tracker\src\app\(app)\account\page.tsx → C:\Users\user-pc\Lindy's book tracker\src\app\auth\callback\route.ts
- `signOut()` --calls--> `createClient()`  [INFERRED]
  C:\Users\user-pc\Lindy's book tracker\src\app\(app)\account\page.tsx → C:\Users\user-pc\Lindy's book tracker\src\lib\supabase\server.ts
- `createBook()` --calls--> `createClient()`  [INFERRED]
  C:\Users\user-pc\Lindy's book tracker\src\app\(app)\books\new\page.tsx → C:\Users\user-pc\Lindy's book tracker\src\lib\supabase\server.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (13): addNote(), addTag(), deleteBook(), deleteNote(), removeTag(), saveDetails(), setRating(), toggleCollection() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (12): addNote(), deleteBook(), deleteNote(), resetPasswordRequest(), setRating(), signIn(), signUp(), toggleCollection() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (11): getGoogleVolume(), parseCategories(), searchGoogleBooks(), volumeToExternalBook(), fetchWithRetry(), cleanDescription(), curateSubjects(), getOpenLibraryWork() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (4): importExternalBook(), importBook(), findOrCreateTag(), getTagsForBooks()

### Community 4 - "Community 4"
Cohesion: 0.52
Nodes (6): clearAll(), push(), setRating(), setSort(), toggleOwned(), toggleTag()

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (3): shot(), runScreenshots(), runScreenshots()

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (3): getExternalBookDetails(), toExternalId(), addToLibrary()

### Community 7 - "Community 7"
Cohesion: 0.83
Nodes (3): createCollection(), safeColor(), updateCollectionColor()

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 11`** (2 nodes): `screenshot.mjs`, `shot()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `proxy.ts`, `proxy()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `page.tsx`, `Home()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `DeleteCollectionButton.tsx`, `DeleteCollectionButton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `BottomNav()`, `BottomNav.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Badge()`, `Badge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `Button()`, `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `shelfColors.ts`, `hexToRgba()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `client.ts`, `createClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `NewCollectionForm.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `ShelfColorPicker.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `Sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `SidebarNav.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `Input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Select.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 0` to `Community 1`, `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `findOrCreateTag()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `createClient()` (e.g. with `updateProfile()` and `changePassword()`) actually correct?**
  _`createClient()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `GET()` (e.g. with `updateProfile()` and `changePassword()`) actually correct?**
  _`GET()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `getOpenLibraryWork()` (e.g. with `getExternalBookDetails()` and `importExternalBook()`) actually correct?**
  _`getOpenLibraryWork()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `importBook()` (e.g. with `createClient()` and `GET()`) actually correct?**
  _`importBook()` has 4 INFERRED edges - model-reasoned connections that need verification._