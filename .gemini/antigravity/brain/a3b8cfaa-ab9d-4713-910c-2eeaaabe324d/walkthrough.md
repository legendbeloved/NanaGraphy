# Admin Dashboard Settings Configuration

Your admin dashboard now features a fully functional "Settings" configuration pane! 

## Features Integrated

1. **Global Site Settings**
   - You can now dynamically update your homepage's main Hero Title and Subtitle directly from the admin panel without editing any code.
   - The inputs correctly map newlines `\n` to visual line breaks dynamically, just like you had hardcoded previously.

2. **Social Connections Management 🔗**
   - Head over to your Settings pane and look under the Site Configuration tab! You'll see a brand new "Social Connections" block.
   - You can **Add a Link**, choose your platform (Instagram, Twitter, YouTube, TikTok, Facebook, LinkedIn, Email, or Other), and drop your profile URL.
   - You can also delete links using the trash icon or edit them natively.
   - The Footer across the entire site will instantly render your selected links alongside their clean SVG logo mapping (including the custom TikTok logo!).

3. **Account Security**
   - We tapped into the `@supabase/supabase-js` authentication client. You can now securely overwrite your Admin password directly from the same settings pane.

4. **Appearance Toggle**
   - The Dark/Light mode theme toggler is logically located inside the Admin Settings screen where it belongs, acting alongside all your website controls.

## How to Test
Navigate to your active localhost admin dashboard.
1. Click the new `Settings` tab.
2. In the "Social Connections" block, click "+ Add Link".
3. Select "TikTok" from the dropdown and type `https://tiktok.com/@yourusername`.
4. Click `Save Site Settings`.
5. Roll down to the bottom of the Admin Dashboard (or check the public Homepage `localhost:5173/`)—you will see your new TikTok logo instantly appear in the Connect footer! 
