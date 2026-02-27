# Section Persistence Fix - ROOT CAUSE FOUND & FIXED

## 🔴 Problem
User adds 7 sections (Personal Info, Work Experience, Education, Skills, Soft Skills, Interests, Projects), clicks Save, refreshes the page, and only 4 default sections remain. The **content** inside the sections is saved perfectly, but the **section visibility** is lost.

---

## 🔍 Root Cause - THE REAL CULPRIT

### The Validation Schema Was Stripping Out `selectedSections`!

**File**: `src/lib/validation/resume.schema.ts`

The resume API route (`/api/resumes`) uses **Zod validation** to validate all incoming resume data:

```typescript
// POST /api/resumes - Line 111
const parsed = resumeSchema.safeParse(body);
const resumeData = parsed.data; // ❌ selectedSections stripped out here!

// PUT /api/resumes - Line 179
const parsed = resumeSchema.safeParse(dataToValidate);
const resumeData = parsed.data; // ❌ selectedSections stripped out here!
```

**The Issue:**
- `resumeSchema` defines ALL allowed fields for a resume
- Any field **NOT** in the schema gets **silently removed** during validation
- `selectedSections` was **NOT** in the schema
- Result: Even though we sent `selectedSections` in the request, the API stripped it out before saving to the database

**Why Content Was Saved But Sections Were Not:**
- ✅ `personalInfo`, `experience`, `education`, `skills`, etc. → **IN** the schema → Saved
- ❌ `selectedSections` → **NOT IN** the schema → Stripped out → Lost

---

## ✅ Complete Solution

### 1. Added selectedSections to TypeScript Type
**File**: `src/types/index.ts`

```typescript
export interface ResumeData {
  // ... all other fields
  design: ResumeDesign;
  selectedSections?: string[]; // ✅ TypeScript type
}
```

### 2. Added selectedSections to Validation Schema ⭐ KEY FIX
**File**: `src/lib/validation/resume.schema.ts`

```typescript
export const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  experience: z.array(experienceSchema),
  // ... all other fields
  design: designSchema,
  selectedSections: z.array(z.string()).optional(), // ✅ Now in schema!
});
```

**This is the critical fix** - without this, selectedSections would always be stripped out at the API level.

### 3. Load selectedSections from Database
**File**: `src/app/builder/page.tsx`

```typescript
// Load from MongoDB
const dbData = await loadResumeDataFromDB(templateId || undefined);
if (dbData) {
  setResumeData(applyDesign(dbData));
  // ✅ Load selected sections
  if (dbData.selectedSections && dbData.selectedSections.length > 0) {
    setSelectedSections(dbData.selectedSections);
  }
  setInitialLoad(false);
  return;
}
```

### 4. Save selectedSections - Manual Save
**File**: `src/app/builder/page.tsx`

```typescript
const handleSave = () => {
  // ✅ Merge selectedSections from state
  const dataToSave = { ...resumeData, selectedSections };
  saveResumeData(dataToSave);
  saveResumeDataToDB(dataToSave).catch(console.error);
  setIsSaved(true);
};
```

### 5. Save selectedSections - Auto-Save
**File**: `src/app/builder/page.tsx`

```typescript
useEffect(() => {
  if (autoSave && resumeData.personalInfo.fullName) {
    const timeoutId = setTimeout(() => {
      // ✅ Merge selectedSections before saving
      const dataToSave = { ...resumeData, selectedSections };
      saveResumeData(dataToSave);
      saveResumeDataToDB(dataToSave).catch(console.error);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }
}, [resumeData, autoSave, selectedSections]); // ✅ Depends on selectedSections
```

### 6. Save selectedSections - Generate Button
**File**: `src/app/builder/page.tsx`

```typescript
const handleGenerateContent = () => {
  if (!resumeData.personalInfo.fullName) {
    alert('Please fill in your name first');
    return;
  }
  const dataToSave = { ...resumeData, selectedSections };
  saveResumeData(dataToSave);
  router.push('/generate');
};
```

### 7. Update selectedSections When Changed
**File**: `src/app/builder/page.tsx`

```typescript
const handleAddSection = (sectionId: string) => {
  if (!selectedSections.includes(sectionId) && sectionId !== 'personalInfo') {
    const newSections = [...selectedSections, sectionId];
    setSelectedSections(newSections);
    setResumeData({ ...resumeData, selectedSections: newSections });
  }
};
```

---

## 🎯 Why It Was Failing

### Data Flow BEFORE Fix ❌

```
┌─────────────────┐
│ User adds       │
│ "Soft Skills"   │
│ section         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ handleAddSection()          │
│ selectedSections = [        │
│   'personalInfo',           │
│   'experience',             │
│   'education',              │
│   'skills',                 │
│   'softSkills' ✅           │
│ ]                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User clicks Save            │
│                             │
│ dataToSave = {              │
│   personalInfo: {...},      │
│   experience: [...],        │
│   skills: [...],            │
│   selectedSections: [       │
│     'personalInfo',         │
│     'experience',           │
│     'education',            │
│     'skills',               │
│     'softSkills'            │
│   ]                         │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/resumes           │
│                             │
│ resumeSchema.safeParse()    │
│                             │
│ ❌ selectedSections NOT     │
│    in schema!               │
│                             │
│ parsed.data = {             │
│   personalInfo: {...},      │
│   experience: [...],        │
│   skills: [...],            │
│   // selectedSections       │
│   // STRIPPED OUT! ❌       │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ MongoDB.insertOne()         │
│                             │
│ Saved without               │
│ selectedSections ❌         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User refreshes page         │
│                             │
│ loadResumeDataFromDB()      │
│ returns data without        │
│ selectedSections            │
│                             │
│ Falls back to default:      │
│ ['personalInfo',            │
│  'experience',              │
│  'education',               │
│  'skills']                  │
│                             │
│ ❌ "Soft Skills" gone!      │
└─────────────────────────────┘
```

### Data Flow AFTER Fix ✅

```
┌─────────────────┐
│ User adds       │
│ "Soft Skills"   │
│ section         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ handleAddSection()          │
│ selectedSections = [        │
│   'personalInfo',           │
│   'experience',             │
│   'education',              │
│   'skills',                 │
│   'softSkills' ✅           │
│ ]                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User clicks Save            │
│                             │
│ dataToSave = {              │
│   personalInfo: {...},      │
│   experience: [...],        │
│   skills: [...],            │
│   selectedSections: [       │
│     'personalInfo',         │
│     'experience',           │
│     'education',            │
│     'skills',               │
│     'softSkills'            │
│   ]                         │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/resumes           │
│                             │
│ resumeSchema.safeParse()    │
│                             │
│ ✅ selectedSections IS      │
│    in schema now!           │
│                             │
│ parsed.data = {             │
│   personalInfo: {...},      │
│   experience: [...],        │
│   skills: [...],            │
│   selectedSections: [       │
│     'personalInfo',         │
│     'experience',           │
│     'education',            │
│     'skills',               │
│     'softSkills' ✅         │
│   ]                         │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ MongoDB.insertOne()         │
│                             │
│ Saved WITH                  │
│ selectedSections ✅         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User refreshes page         │
│                             │
│ loadResumeDataFromDB()      │
│ returns data with           │
│ selectedSections ✅         │
│                             │
│ setSelectedSections([       │
│   'personalInfo',           │
│   'experience',             │
│   'education',              │
│   'skills',                 │
│   'softSkills'              │
│ ])                          │
│                             │
│ ✅ "Soft Skills" persists!  │
└─────────────────────────────┘
```

---

## 🧪 Testing

Your dev server should still be running on **http://localhost:4000**

### Test Steps:

1. **Open** http://localhost:4000/builder
2. **Add sections:**
   - Click "Add Sections" at the bottom
   - Add: Soft Skills, Interests, Projects, Awards, Languages
3. **Fill in dummy data** in each section
4. **Click "Save" button** (top right)
5. **Wait for "Saved!" confirmation**
6. **Open browser DevTools** (F12) → Network tab
7. **Look at the last PUT request to `/api/resumes`**
8. **Check the Request Payload** - you should see `selectedSections` array
9. **Refresh the page (F5)**
10. ✅ **All sections should persist!**

---

## 📊 Summary

### Files Modified

1. ✅ `src/types/index.ts` - Added TypeScript type
2. ✅ `src/lib/validation/resume.schema.ts` - **⭐ KEY FIX** - Added to Zod schema
3. ✅ `src/app/builder/page.tsx` - Load and save logic

### The Key Issue

**The validation schema was the hidden culprit!** Even though we were sending `selectedSections` in the request, the API was silently stripping it out during validation because it wasn't defined in the schema.

### Expected Behavior Now ✅

- Add any sections → Click Save → Refresh → **Sections persist** ✅
- Add any sections → Wait 2s (auto-save) → Refresh → **Sections persist** ✅
- Remove sections → Save → Refresh → **Changes persist** ✅
- Section **content** persists ✅
- Section **visibility** persists ✅

The fix is now **COMPLETE**!
