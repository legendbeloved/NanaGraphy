# Dynamic About Page Configuration Plan

This plan details how we will migrate the hardcoded content on your **About Page** so it can be managed dynamically from your Admin Settings pane.

To keep the database schema clean and flexible, we will store all About page text in a single structured JSON block within your settings table.

## User Action Required (SQL Setup)

We will modify your `site_settings` table to accept an `about_content` JSON column. 

**Before approving this plan, please run this quick SQL script in your Supabase SQL Editor:**

```sql
alter table public.site_settings 
add column if not exists about_content jsonb default '{}'::jsonb;
```

## Proposed Changes

### 1. `AdminDashboard.tsx`
- **New Section**: We will add a new submenu inside the Settings tab specifically for "About Page Content".
- **Functionality**:
  - Input field for **Hero Title** (e.g., "Meet Nana").
  - Two large `<textarea>` fields for **Paragraph 1** and **Paragraph 2**.
  - Input field for the **Image URL**.
  - A dynamic array builder for your **Experience Stats** (e.g., "10+ Years Experience", "500+ Sessions").
  - Saving will securely bundle all these into the `about_content` JSON payload.

### 2. `src/services/supabaseAdmin.ts`
- **Typings**: Update the `SiteSettingsRow` definition to typecheck the new `about_content` payload.

### 3. `src/pages/About.tsx`
- **Dynamic Fetch**: Modify the About page to run `getSiteSettings()` when the site loads.
- **Rendering**: Replace the hardcoded text and stats with the dynamic `about_content`. If the fetch is delayed or the content is missing, the site will gracefully fall back to the existing beautifully written defaults so your site never looks broken!

## Verification Plan
1. Admin loads the Settings panel and sees the "About Page Configuration" block filled with empty states.
2. Admin inputs new text into the Bio blocks and saves.
3. Upon navigating to `/about`, the page instantly renders the updated biographies and customized stats cleanly!
