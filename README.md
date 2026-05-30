# Code Cities — Reader Dossier System

A complete, free, no-paywall email-capture funnel for the *Code Cities* thriller series. Built on GitHub Pages + Google Forms + Google Sheets + Google Drive + Google Apps Script. No subscriber limit. No vendor lock-in. No monthly fees, ever.

> **First time here?** Read `SETUP.md` end to end. It takes ~90 minutes once. After that, this README is the only file you need.

---

## What the system does

```
Reader scans QR in book
   ↓
Landing page (GitHub Pages, free)
   ↓
Google Form (free, unlimited responses)
   ↓
Google Sheet (free, unlimited rows)
   ↓
Apps Script (free):
   • sends welcome email + dossier download links instantly
   • runs a 5-email drip over 30 days
   • backs up the list to your inbox every Monday
   • handles one-click unsubscribes
```

Every component is owned by you. If any one of them disappears tomorrow, your subscriber list is still a plain CSV on your laptop and your book copy is still in `content/landing-copy.md`.

---

## Repository map

| Path                                | Purpose                                                                 | Who edits it                              |
|-------------------------------------|-------------------------------------------------------------------------|-------------------------------------------|
| `index.html`                        | The Westminster Code landing page                                       | Developer once, then rarely               |
| `thanks.html`                       | Post-signup confirmation page                                           | Rarely                                    |
| `assets/css/style.css`              | Design system                                                           | Designer                                  |
| `assets/js/main.js`                 | Tiny interactions (scroll reveal, sticky mobile CTA)                    | Developer                                 |
| `assets/img/`                       | Hero image, cover, author portrait, favicon                             | **Author** (drag files into GitHub)       |
| `books/_template/index.html`        | Reusable starter for books 2–7                                          | Developer, when adding a new book         |
| `content/landing-copy.md`           | All landing-page copy in plain markdown                                 | **Author** (edit freely)                  |
| `content/lead-magnet-pack.md`       | Spec for the four dossier PDFs                                          | Author + designer                         |
| `content/email-sequence.md`         | All email copy (mirror of what's in the Apps Script)                    | **Author** (edit freely)                  |
| `apps-script/Code.gs`               | The whole automation backend                                            | Paste once, then edit only the CONFIG     |
| `SETUP.md`                          | One-time end-to-end setup                                               | Read once                                 |
| `README.md`                         | This file                                                               | The author's bedside reading              |

---

## Day-to-day: what the author actually does

There is no daily work. The system runs itself. The five things you might do, ever:

### 1. Check the list
Open the Google Sheet `CodeCities-Subscribers`. New signups are at the bottom. That's it.

### 2. Export the list (CSV)
**File → Download → Comma-separated values (.csv)**. Done. You also receive a CSV backup by email every Monday morning.

### 3. Update a dossier PDF
In Drive, right-click the PDF → **Manage versions** → **Upload new version**. The download link **does not change**, so every email ever sent still works. Old subscribers can re-download to get the latest version.

### 4. Change a word on the landing page
In GitHub, open `index.html`, click the pencil icon, edit, scroll down, **Commit changes**. Live in ~30 seconds.

### 5. Change a word in an email
Open `apps-script/Code.gs` in the Apps Script editor (Extensions → Apps Script from the sheet), find the email in `CONFIG.books[i].drip`, edit, save. Live immediately. Also mirror the change in `content/email-sequence.md` so the markdown stays canonical.

---

## Growing the list

The landing page is the engine. These are levers you can pull, in order of impact:

1. **The book itself.** A QR code on the last page of the print book and a plain URL in the author bio (which travels with every ebook sample, every Amazon "Look Inside"). This is where 80% of signups come from.
2. **Bookplate cards** at signing events with the URL + QR. Costs a few pence per card.
3. **Podcast & interview mentions.** Whenever you're a guest on a show, mention "the dossier" — never mention "my email list".
4. **Forward-to-a-friend.** Built into Emails 0 and 2 already. Subscribers do this for you when the dossier is good.
5. **Cross-link from your other public profiles** — Goodreads, Amazon Author Central, your existing website. The URL is short enough to type from a podcast intro.

### Conversion levers (A/B testable)
Three places in `index.html` are intentionally designed to be swapped:
- `<!-- HEADLINE :: A/B SLOT -->` — try alternates from `content/landing-copy.md §11`.
- The hero CTA button text — try `Request the dossier` vs `Claim the dossier` vs `Take the dossier`.
- The dossier card order — leading with File 04 (the Paris Code preview) often outperforms.

A simple A/B routine: change one thing, leave it for 2 weeks, compare signup rate from the sheet timestamps.

---

## List segmentation (free, native)

Segmentation is built into the architecture: **one Sheet tab per book = one segment per book**. When you email Paris dossier holders only, the script's `book` parameter handles it. When you email *all* subscribers (rare — only for a series-wide event), the script can iterate every configured book.

To add a tag-style segment (e.g. "asked to be told when pre-orders open"), just add a new column to the Sheet tab manually. The author can edit it by hand from the sheet. No new code required for filtering on send.

---

## Backups

Three layers of redundancy, all automatic:

1. **Sheet itself** — Google keeps version history. **File → Version history → See version history**.
2. **Weekly email** — `weeklyBackup` runs every Monday morning and emails you one CSV per book.
3. **Manual** — once a quarter, download every CSV to a folder on your laptop. Belt and braces.

If you ever want to leave Google entirely, all your data is in those CSVs.

---

## Adding a new book (Paris, Rome, …)

Five steps. ~30 minutes total once the system is set up.

1. **Drive:** create `CodeCities/02-Paris/dossier/`, upload the new four PDFs, set sharing to *Anyone with the link*, copy the four file IDs.
2. **Sheet:** add a new tab named `02-Paris` (exact spelling).
3. **Form:** create a new form `Paris Code — Reader Access`, link it to the new tab, copy the embed URL.
4. **Landing page:** copy `books/_template/index.html` to `books/paris/index.html` and do the find-and-replace listed at the top of the template file.
5. **Apps Script:** in `CONFIG.books`, copy the Westminster block, change the slug/title/tab/files/drip copy. Save.

You're done. The new book is live at `https://YOUR-GITHUB-USER.github.io/code-cities/books/paris/`.

---

## Maintenance schedule

| Frequency  | Task                                                                    |
|------------|-------------------------------------------------------------------------|
| Weekly     | Glance at the Sheet (or just trust the Monday backup email).            |
| Monthly    | Replace any updated PDFs in Drive (only if you've revised one).         |
| Quarterly  | Manual CSV download to your laptop.                                     |
| Per book   | Run the 5-step "Adding a new book" list above.                          |
| Per book   | Update the QR code in print runs.                                       |

---

## Troubleshooting

**"I submitted the form but didn't get the welcome email."**
1. Check the spam folder / Promotions tab.
2. Open Apps Script → **Executions** in the left sidebar. Look for the most recent `onFormSubmitHandler` run. If it shows an error, the message tells you what's wrong (usually a missing Drive file ID).
3. If the row is in the sheet but column **E (WelcomeSent)** is empty, run `onFormSubmitHandler` manually with the row supplied — see the script for details.

**"The landing page doesn't show the form, just a blank box."**
- You probably forgot to replace `YOUR_FORM_EMBED_URL` in `index.html`. Re-grab the iframe `src` from your Google Form (Send → < > tab) and paste it in.

**"Gmail says I've hit a sending quota."**
- Consumer Gmail caps Apps Script email at ~100/day. Two options:
  - **Wait 24 hours** — the quota resets automatically.
  - **Migrate to Brevo** — see the next section. Only one function changes.

**"The unsubscribe link goes to a Google error page."**
- You haven't deployed the web app yet. See `SETUP.md §7`. Until then, the script falls back to a `mailto:unsubscribe@...` link that you honour manually.

**"A subscriber asked for their data to be deleted (GDPR)."**
- Open the Sheet, find their row, **delete the entire row**. Done.

---

## When (and how) to migrate to Brevo

The only constraint of this stack is Gmail's ~100 emails/day quota. For an organic book launch, that's fine. If you ever cross it — congratulations, you have a list problem worth solving.

Brevo (formerly Sendinblue) gives you:
- **Unlimited contacts** (no subscriber cap)
- **300 emails/day** on the free tier
- A real SMTP API

To migrate, only one function in `Code.gs` changes — `sendEmail_()`. Replace the `MailApp.sendEmail({...})` call with an HTTP POST to Brevo's API:

```js
function sendEmail_(to, subject, body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
  UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'api-key': apiKey, 'accept': 'application/json' },
    payload: JSON.stringify({
      sender:      { name: CONFIG.authorName, email: CONFIG.authorEmail },
      to:          [{ email: to }],
      subject:     subject,
      textContent: body,
    }),
    muteHttpExceptions: true,
  });
}
```

Store the API key in **Project Settings → Script Properties → BREVO_API_KEY**. Everything else in the script keeps working exactly as before. No vendor lock-in.

---

## Optional growth upgrades (still free)

When you're ready to push harder, none of these break the free model:

- **Referral counter** — add a hidden column tracking how many friends each subscriber forwards to (works via unique referral codes in the landing URL, captured by the form). Top referrers get the next dossier first.
- **Reader survey email** at Day +60 — one question, one CTA: "Where should Book 3 be set?" Excellent engagement signal.
- **Lite analytics** — add a `<noscript>`-friendly counter via [Plausible's free self-host](https://plausible.io/self-hosted-web-analytics) or, simpler, just count submissions in the sheet by week. The point is not vanity metrics, it's "are signups going up".
- **Pre-order capture mode** — re-use the same Form for Paris Code pre-order interest. Tag the row by source via a hidden Form field (`entry.XXXX`) appended to the URL.

---

## Why this stack (and what it isn't)

It's deliberately a *publisher's tool*, not a marketer's tool. There are no behavioural tracking pixels, no UTM-stuffed links, no "engagement scoring", no AI personalisation. The reader gets a clean dossier and four honest emails. The author owns the list.

If the project ever outgrows the free tier (you're sending more than 300/day, or you want WYSIWYG email templates, or you want a "campaigns" dashboard), graduate to Brevo's paid tier or to a real ESP like MailerLite. The migration is trivial because the only data that matters lives in CSVs you already own.

Until then: nothing to pay, nothing to maintain, no one to call.
