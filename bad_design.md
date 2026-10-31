# UI / UX Design Guidelines: Bad Design Anti-Patterns & Enterprise Best Practices

This document records identified bad design anti-patterns in the WMSU Faculty Scheduling system and provides concrete rules on how to design professionally.

---

## 1. The "Naive Full-Width Stretch" Anti-Pattern (Schedule Create / Edit Page)

### ❌ What Was Done (Bad Design)
- The entire form was wrapped in a single, massive 100% width card stretching across 1920px desktop viewports.
- Form inputs were placed in 2-column or 3-column rows that spanned the full screen, resulting in text fields and dropdowns 700px–900px wide.
- Vast empty white voids formed between labels and controls, making eye tracking and scanning exhausting for users.
- Sub-sections like "Timetable & Weekly Periods" had huge empty dashed drop zones that occupied half the monitor with zero informative value.
- Action buttons were isolated in the bottom-left corner with nothing filling the rest of the lower viewport.

### 💡 Why It Is Bad
> **"Using the entire page does NOT mean making everything huge or stretching single inputs just to occupy space. Every space used must have a distinct, functional purpose."**

### ✅ The Professional Enterprise Solution
When utilizing a full-width desktop canvas (`w-full`), **partition the screen into purposeful functional zones**:
1. **Master-Detail Two-Column Grid (`lg:grid-cols-12`)**:
   - **Main Form Area (`lg:col-span-7 xl:col-span-8`)**:
     - Group related inputs into compact, logically scoped cards (e.g., *Course & Term*, *Classroom & Biometrics*, *Weekly Timetable*).
     - Keep input fields at ergonomic widths (2-column grids inside cards, inputs 240px–360px wide).
     - Add contextual micro-banners (e.g., ZKTeco Biometric Terminal indicator, course credit units badge).
   - **Sticky Sidebar Panel (`lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6`)**:
     - **Actions & Status Card**: Direct access to primary CTA (`Create Schedule` / `Save Changes`), cancel link, and active status toggle.
     - **Live Preview Card**: Dynamically updates as the user fills out the form, displaying selected course, semester, classroom, section, and allocated periods in real time.
     - **Readiness Checklist**: Visual checkmarks displaying completeness before submission (Course offering, Semester, Room & Section, Weekly slots).

---

## 2. The "Emoticon & Informal Expression" Anti-Pattern

### ❌ What Was Done (Bad Design)
- Placing informal emoji icons (e.g. `👋`, `🚀`, `🎉`) in greeting headers, dashboards, and system alerts to express emotion or friendliness.

### 💡 Why It Is Bad
> **"If a joke needs to be explained, it is a bad joke; the same applies to design."**
- Emojis cheapen professional enterprise and institutional systems.
- Emojis render inconsistently across operating systems (Windows, macOS, Android, Linux).
- Emojis create visual noise that distracts from critical academic data.

### ✅ The Professional Solution
- Use professional academic copy: *"Good morning, Instructor [Name]"*, *"Faculty Academic Dashboard"*.
- Use clean, monochrome or subtly tinted semantic SVG icons from `lucide-react` (e.g. `Clock`, `BookOpen`, `GraduationCap`, `CheckCircle2`).

---

## 3. The "Floating Secondary Filter Row" Anti-Pattern

### ❌ What Was Done (Bad Design)
- Table index pages had Search and "New Request" on row 1, with a separate row 2 containing status/teacher/type dropdowns floating in a wide empty space.

### 💡 Why It Is Bad
- Wastes vertical viewport space before the user can see actual data rows.
- Creates visual disconnect between search filtering and select filtering.

### ✅ The Professional Solution
- Place all filters **inline** inside `TablePageHeader` between the search input and the primary CTA button:
  ```tsx
  <TablePageHeader count={data.total} search={search} ... createHref={...}>
      <Select value={statusFilter} ... />
      <Select value={categoryFilter} ... />
  </TablePageHeader>
  ```

---

## 4. The "Giant Empty Card" Anti-Pattern on Large Screens

### ❌ What Was Done (Bad Design)
- Centering a narrow card inside a 1920px container with huge grey gutters, or doing the reverse and stretching a 3-field form across 1920px.

### 💡 Why It Is Bad
- Both extremes fail: gutters waste screen real estate, while unrestrained 100% width makes forms unusable.

### ✅ The Professional Solution
- **Summary KPI Cards** on index pages: Always provide 4 responsive cards (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) summarizing key operational metrics above tables.
- **Form Pages**: Always use master-detail side-by-side architecture with sticky preview and action bars on wide viewports, collapsing gracefully to single-column on mobile viewports (`grid-cols-1 lg:grid-cols-12`).

---

## 5. The "Item-Aligned Overlay Select" Anti-Pattern (Dropdown Covering Input)

### ❌ What Was Done (Bad Design)
- The `<SelectContent>` component had `position="item-aligned"` as default, which caused the dropdown options menu to pop up directly over the trigger input field, completely covering it.

### 💡 Why It Is Bad
- Users lose visual context of what field they clicked and what current value was selected.
- It feels jarring and behaves unlike standard web forms, which drop down naturally below (or above if at the viewport bottom) the trigger button.

### ✅ The Professional Solution
- Always use `position="popper"` with `sideOffset={4}` and `align="start"` on `<SelectContent>`:
  ```tsx
  function SelectContent({
    className,
    children,
    position = "popper",
    sideOffset = 4,
    align = "start",
    ...props
  }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  ```
- This ensures all dropdowns pop down neatly below the input with a 4px gap, matching user expectations across all browsers.

---

## 6. The "Shrunken Select Trigger (`w-fit`)" & "Disconnected Action Button" Anti-Pattern

### ❌ What Was Done (Bad Design)
- The `<SelectTrigger>` had `w-fit` hardcoded in its default classes, causing it to shrink down to just fit the placeholder text (`"Choose day"`), while standard `<Input>` fields stretched to fill their column (`w-full`).
- In addition, action buttons (like `+ Add Slot`) were assigned to the far right columns of an expansive 12-column grid (`sm:col-span-2`), leaving huge empty voids between the dropdown inputs and the button.

### 💡 Why It Is Bad
- Creates an unbalanced, amateur appearance where form controls in the same row have drastically mismatched widths.
- Action buttons floating hundreds of pixels away from their associated inputs create eye strain and break visual proximity (Gestalt principle of proximity).

### ✅ The Professional Solution
- Set `<SelectTrigger>` default to `w-full` in `select.tsx`, matching `<Input>`.
- In composite action rows (e.g. Day + Time Slot + Add Button), use a cohesive flex layout:
  ```tsx
  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="w-full sm:w-48 ...">...</div> {/* Day */}
      <div className="w-full sm:flex-1 ...">...</div> {/* Period block */}
      <Button className="w-full sm:w-auto h-9 px-4 shrink-0">Add Slot</Button>
  </div>
  ```
- This keeps the inputs full-width within their slots and places the action button directly adjacent to the controls it operates on.

---

## Summary Checklist for New Pages
- [ ] Is every square inch of screen space serving a distinct, functional purpose?
- [ ] Are input widths ergonomic and never stretched horizontally to ridiculous proportions?
- [ ] Do `<Select>` components have `w-full` so they match `<Input>` field widths?
- [ ] Are related action buttons kept in close proximity to their inputs, not floating across empty grid spans?
- [ ] Are filters placed inline within `TablePageHeader`?
- [ ] Are headings clean and devoid of childish emojis?
- [ ] Do dropdowns pop down cleanly below the input (`position="popper"`) without covering the trigger?
- [ ] Is there a live preview, summary card, or checklist in creation/editing workflows?
