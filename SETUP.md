# Setup — Code Cities email funnel

Follow this once, top to bottom. Budget: about 90 minutes the first time you do it. Every step is free.

If anything in this document gets out of date, fix it as you go — this file is the single source of truth for the system.

---

## Before you start — gather these

- A Google account (use a dedicated one, e.g. `code.cities.author@gmail.com`, so the author's personal inbox stays clean).
- A GitHub account (free).
- The four lead-magnet PDFs (see `content/lead-magnet-pack.md` for the spec).

You will end up with these public URLs:

- Landing page:  `https://YOUR-GITHUB-USER.github.io/code-cities/`
- Public form:   `https://docs.google.com/forms/d/e/1FAIpQLSf49_8hM5GEdnCg3fPuw9570OgvpB1JtvVdYmhxoA-VptGjpA/viewform?usp=header`
- Unsubscribe:   `https://script.google.com/macros/s/.../exec` (added at step 7)

---

## 1. Drive — upload the dossier

1. Open Google Drive ([drive.google.com](https://drive.google.com)).
2. Create this folder structure:
   ```
   CodeCities/
     01-Westminster/
       dossier/
   ```
3. Drag the four PDFs into `dossier/`. File names must be exactly:
   - `westminster-pub-code-map.pdf`
   - `hidden-london-intelligence-brief-01.pdf`
   - `westminster-symbols-field-guide.pdf`
   - `the-paris-code-chapter-one.pdf`
4. For each PDF: right-click → **Share** → **General access: Anyone with the link** → **Viewer** → Done.
5. For each PDF, copy the file ID from its URL. The URL looks like:
   `https://drive.google.com/file/d/1aBcDeFgHiJkLmNoP/view?usp=sharing`
   The ID is the part between `/d/` and `/view` — `1aBcDeFgHiJkLmNoP`.
   Keep all four IDs in a scratchpad. You'll paste them into the Apps Script config in step 6.

---

## 2. Sheet — the subscriber list

1. In Drive, create a new Google Sheet named `CodeCities-Subscribers`.
2. Rename `Sheet1` to `01-Westminster` (exact spelling — the script matches by name).
3. Leave row 1 empty for now. The Form will populate the first four columns once it's linked; the script adds the remaining headers automatically.

---

## 3. Form — the email capture

1. From the sheet, open **Tools → Create a new form**. (This auto-links the form to this sheet.)
2. Rename the form: `Westminster Code — Reader Access`.
3. Add **three questions** in this order:
   - **Q1** — *Short answer*. Title: `Your name`. Required.
   - **Q2** — *Short answer*. Title: `Your email`. Required. Click ⋮ → **Response validation** → *Text* → *Email*.
   - **Q3** — *Checkboxes*. Title: `I'd like to receive the dossier and occasional updates about the Code Cities series.` Required. One option: `I agree`.
4. **Settings tab → Responses:**
   - *Collect email addresses* → **Off** (we collect via Q2 so the author owns the field name).
   - *Restrict to users in your domain* → **Off**.
   - *Allow response editing* → **Off**.
5. **Settings tab → Presentation:**
   - *Confirmation message* → `Transmission received. Check your inbox in the next sixty seconds.`
6. **Customize theme** (top right paint-roller icon):
   - Header image: optional (a dark Westminster photo works well).
   - Color: `#B8964F` (brass).
   - Background color: `#0B0B0D` if available, otherwise dark grey.
   - Font: *Playfair* or *Cormorant* if listed; otherwise default.
7. Click **Send** (top right):
   - Choose the **< >** tab (embed).
   - Copy the long `src="..."` value — that's `FORM_EMBED_URL`. Paste it into `index.html` where it says `YOUR_FORM_EMBED_URL`.
   - Click the **🔗** tab → copy the short URL — that's `FORM_PUBLIC_URL`. Paste it into `index.html` where it says `YOUR_FORM_PUBLIC_URL`.

---

## 4. GitHub — host the landing page

1. Create a new public repo named `code-cities` (or whatever you like — the URL will reflect it).
2. Upload every file in this project to the repo root (drag the folder into github.com's upload UI, or use Git if you prefer).
3. In the repo, go to **Settings → Pages**.
4. Source: **Deploy from a branch**. Branch: `main`, folder: `/ (root)`. Click **Save**.
5. Wait one or two minutes. Your landing page is live at:
   `https://YOUR-GITHUB-USER.github.io/code-cities/`
6. Copy that URL — you'll paste it into `CONFIG.landingUrl` in the Apps Script in step 6.

---

## 5. Drop the real assets in

In the GitHub web UI, replace these placeholder paths with real files (just drag them into the matching folder):

- `assets/img/hero-westminster.jpg` — full-bleed hero image
- `assets/img/cover-westminster.jpg` — book cover for the OG/share preview
- `assets/img/author-portrait.jpg` — author headshot
- `assets/img/favicon.png` — 32×32 icon

The site already renders without them (graceful fallbacks), but real artwork is what sells.

---

## 6. Apps Script — paste, configure, test

1. From the **subscriber sheet** (not the form), open **Extensions → Apps Script**. A new tab opens with an empty `Code.gs`.
2. Delete everything in the editor.
3. Open this project's `apps-script/Code.gs` on GitHub, copy the entire file, and paste it into the editor.
4. Scroll to the `CONFIG` block at the top. Edit:
   - `authorName` — your published name.
   - `authorEmail` — where you want backups and replies to land.
   - `landingUrl` — the GitHub Pages URL from step 4.
   - `books[0].files.map / brief / guide / paris` — paste the four file IDs from step 1.
5. **Don't** fill in `webAppUrl` yet — we'll do it in step 7.
6. Save (Ctrl/Cmd + S). Give the project a name when prompted: `Code Cities Automation`.
7. From the function dropdown, select `installTriggers` and click **Run**.
8. The first run asks for permissions. Click **Review permissions** → choose your Google account → **Advanced** → **Go to Code Cities Automation (unsafe)** → **Allow**. This is normal for personal Apps Script projects — you're authorising your own script to send your own emails.
9. After it finishes (a few seconds), check **Triggers** in the left sidebar — you should see three triggers (`onFormSubmitHandler`, `sendDripEmails`, `weeklyBackup`).

---

## 7. Deploy the unsubscribe web app

1. Still in the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear → choose **Web app**.
3. Fill in:
   - *Description:* `Code Cities unsubscribe endpoint`
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
4. Click **Deploy**.
5. Copy the **Web app URL**. Paste it into `CONFIG.webAppUrl` in `Code.gs`. Save.
6. Every future change to the script needs **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** to take effect for the web app — but `onFormSubmitHandler` and `sendDripEmails` run live on every save, no redeploy needed.

---

## 8. End-to-end test

1. Open the landing page in a private/incognito window.
2. Submit the form with your own (different) email and a fake name.
3. Within ~30 seconds you should receive the welcome email, with four working Drive download links.
4. Open the unsubscribe link in the email — it should land on a dark "You're unsubscribed" page, and your row in the sheet should now have `TRUE` in column **J (Unsubscribed)**.
5. To verify the drip works without waiting three days:
   - In the sheet, change your `Timestamp` (column A) to four days ago.
   - In the Apps Script editor, run `sendDripEmails` manually.
   - You should receive the Day +3 email. Column **F (Drip1Sent)** flips to a timestamp.

If all of those pass, the system is live.

---

## 9. Print the QR code for the back of the book

Once the landing URL is live, generate a QR code pointing to it. Free, no account needed:

- [qrcode-monkey.com](https://www.qrcode-monkey.com/) — supports SVG export.
- Recommended: monochrome black on white, ≥ 2 cm wide in print.

Place it in:
- The back matter of the print book (with the line "Claim your dossier").
- The author bio in both the print and ebook editions (just the URL — many ereaders won't render QR codes).

---

## 10. Adding book 2 (Paris) later

When *The Paris Code* is ready, repeat this whole document with these changes:

| Step | Westminster value          | Paris value                  |
|------|----------------------------|------------------------------|
| 1    | `01-Westminster/dossier/`  | `02-Paris/dossier/`          |
| 2    | Sheet tab `01-Westminster` | New tab `02-Paris`           |
| 3    | Form: Westminster…         | Form: Paris…                 |
| 4    | (same repo)                | (same repo, new folder)      |
| 6    | `CONFIG.books[0]`          | Add a new `CONFIG.books[1]`  |

The landing page comes from `books/_template/index.html` — copy it to `books/paris/index.html` and follow the find-and-replace table inside the template.

That's the whole maintenance loop for every future book.
