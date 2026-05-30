/**
 * =============================================================================
 * Code Cities — subscriber automation
 * -----------------------------------------------------------------------------
 *  WHAT THIS DOES
 *    1. Sends the welcome email (with dossier download links) the moment a
 *       reader submits the Google Form (`onFormSubmit`).
 *    2. Runs a daily drip — emails 1..N at +3, +7, +14, +30 days after signup.
 *    3. Provides a one-click unsubscribe URL (Apps Script web app endpoint).
 *    4. Emails the author a CSV backup of the subscriber sheet every week.
 *
 *  WHAT YOU EDIT
 *    Only the CONFIG block below. Nothing else needs to be touched per book.
 *
 *  HOW TO INSTALL
 *    See SETUP.md, section "Apps Script". Three things to do once:
 *      a) Paste this file into the bound Apps Script of the subscriber sheet.
 *      b) Run `installTriggers()` once from the editor (it asks for permissions).
 *      c) Deploy as web app for the unsubscribe endpoint (also in SETUP.md).
 *
 *  ASSUMPTIONS
 *    - One Google Sheet, one tab per book (tab name matches CONFIG.books[i].tab).
 *    - Each Form is linked to its book's tab via Form > Responses > "Link to sheet".
 *    - The Form contains exactly three questions, in this order:
 *        Q1 = Name (short answer)
 *        Q2 = Email (short answer, with email validation)
 *        Q3 = Consent (checkbox, required) — title contains the word "consent".
 *    - Drive PDFs are uploaded with sharing "Anyone with the link · Viewer".
 *
 *  QUOTAS (consumer Gmail)
 *    - MailApp.sendEmail: ~100 recipients / day.
 *    - GmailApp.sendEmail: same shared quota.
 *    - For a slow-burn organic launch this is sufficient. If you regularly
 *      cross 100 signups/day, see README.md "Brevo migration" — only the
 *      `sendEmail_()` function changes.
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// CONFIG  —  EDIT THIS BLOCK ONLY
// -----------------------------------------------------------------------------
const CONFIG = {
  authorName:  'A. N. Author',                  // appears in From + signatures
  authorEmail: 'hello@yourdomain.com',          // gets weekly backups + replies

  // The deployed web-app URL of THIS script. Fill in AFTER you deploy
  // (Deploy > New deployment > Web app > Anyone). It looks like:
  //   https://script.google.com/macros/s/AKfycb.../exec
  // Until it's filled in, the unsubscribe link in emails will be a plain
  // 'mailto:' fallback (also fine).
  webAppUrl: '',

  landingUrl: 'https://YOUR-GITHUB-USER.github.io/code-cities/',

  // One entry per book. To launch The Paris Code, copy the Westminster block,
  // rename the tab, swap the Drive file IDs, rewrite the drip subjects/bodies.
  books: [
    {
      slug: 'westminster',
      title: 'The Westminster Code',
      tab:   '01-Westminster',                  // must match the Sheet tab name

      // Drive file IDs (NOT the full URL). Find each ID by opening the file in
      // Drive and copying the long string between /d/ and /view in the URL.
      files: {
        map:   'DRIVE_FILE_ID_FOR_PUB_CODE_MAP',
        brief: 'DRIVE_FILE_ID_FOR_HIDDEN_LONDON_BRIEF',
        guide: 'DRIVE_FILE_ID_FOR_SYMBOLS_GUIDE',
        paris: 'DRIVE_FILE_ID_FOR_PARIS_CHAPTER_ONE',
      },

      // The drip. dayOffset = days after signup the email should send.
      // Subject + body live in `content/email-sequence.md`. Keep them in sync.
      drip: [
        {
          key: 'drip1',
          dayOffset: 3,
          subject: 'What you walked past in Trafalgar Square',
          body:
'{{FIRST_NAME}},\n\n' +
'Three days ago you took the dossier. By now you\'ve probably opened the map.\n\n' +
'If you walk to the north-east corner of Trafalgar Square — the corner the protagonist crosses in Chapter Four — and look up at the lamp post nearest the National Gallery steps, there\'s a small brass plaque most tourists never notice.\n\n' +
'It reads: "By Royal Appointment". Beneath that, a date. Beneath the date, a number.\n\n' +
'That number is in the dossier. Page three of the Symbols Field Guide.\n\n' +
'I\'m telling you this because the people who actually walk the routes are the people the next book is written for.\n\n' +
'— {{AUTHOR_NAME}}\n\n' +
'Unsubscribe in one click: {{UNSUB_URL}}\n'
        },
        {
          key: 'drip2',
          dayOffset: 7,
          subject: 'A note from the author — the research that didn\'t fit',
          body:
'{{FIRST_NAME}},\n\n' +
'This is the kind of email I almost didn\'t send.\n\n' +
'Of the three years it took to write The Westminster Code, roughly six months were spent in the British Library reading rooms, filing FOI requests, and being politely told "no". A great deal of what I learned never made it into the novel. A novel doesn\'t have room for forty-eight pages of footnotes. A dossier does.\n\n' +
'The Hidden London brief in your pack (File 02) is the closest I could come to publishing the rest. Footnoted. Sourced. Where something is a hypothesis, it\'s labelled as one.\n\n' +
'If you have time, read the foreword. Two pages. It tells you what I changed in the book, and why.\n\n' +
'I\'m grateful you\'re here for the long version.\n\n' +
'— {{AUTHOR_NAME}}\n\n' +
'P.S. Have a friend who\'d read the brief? Forward this, or send them the landing:\n' +
'{{LANDING_URL}}\n\n' +
'Unsubscribe in one click: {{UNSUB_URL}}\n'
        },
        {
          key: 'drip3',
          dayOffset: 14,
          subject: 'The Paris Code — first transmission',
          body:
'{{FIRST_NAME}},\n\n' +
'You\'ve had the dossier for two weeks. File 04 — The Paris Code, Chapter One — has been sitting there the whole time.\n\n' +
'I want to tell you why it\'s there.\n\n' +
'When I finished Westminster, I didn\'t know how to start Paris. The opening scene came from a single photograph I took in the Marais on a Tuesday morning in November — a door that shouldn\'t have been there, in a courtyard that shouldn\'t have existed. Chapter One is built around that door.\n\n' +
'It is, to my knowledge, the earliest any reader has seen any of Book Two. The novel itself is months away. You\'re holding the only copy that exists outside my editor\'s hard drive.\n\n' +
'Open File 04 when you have an hour and a quiet room. It\'s not a teaser. It\'s a real chapter.\n\n' +
'— {{AUTHOR_NAME}}\n\n' +
'Unsubscribe in one click: {{UNSUB_URL}}\n'
        },
        {
          key: 'drip4',
          dayOffset: 30,
          subject: 'Reserve your seat for Paris',
          body:
'{{FIRST_NAME}},\n\n' +
'A month ago, you signed the register for Westminster.\n\n' +
'When The Paris Code publishes, here\'s what "dossier holders are first" means in practice:\n\n' +
'  1. You\'ll receive the publication date one week before it\'s announced publicly.\n' +
'  2. You\'ll receive the Paris dossier — a new map, a new brief, a new field guide, and Chapter One of Book Three — the day the book ships.\n' +
'  3. If signed first-edition copies are offered, dossier holders get the first window.\n\n' +
'You don\'t have to do anything. You\'re already on the list.\n\n' +
'But if you\'d like to be on a specific "let me know the moment pre-orders open" list for Paris, reply to this email with the single word: PARIS.\n\n' +
'That\'s it. No form. No clicking.\n\n' +
'— {{AUTHOR_NAME}}\n\n' +
'Unsubscribe in one click: {{UNSUB_URL}}\n'
        },
      ],
    },

    // --- TEMPLATE for books 2..7 ---
    // {
    //   slug: 'paris',
    //   title: 'The Paris Code',
    //   tab:   '02-Paris',
    //   files: { map: '...', brief: '...', guide: '...', rome: '...' },
    //   drip: [ ... rewritten for Paris ... ],
    // },
  ],
};

// -----------------------------------------------------------------------------
// SHEET LAYOUT
//   Form-managed columns (don't touch):
//     A: Timestamp   B: Name   C: Email   D: Consent
//   Script-managed columns (script adds them if missing):
//     E: WelcomeSent   F: Drip1Sent   G: Drip2Sent   H: Drip3Sent
//     I: Drip4Sent    J: Unsubscribed  K: UnsubToken
// -----------------------------------------------------------------------------
const COL = {
  timestamp:    1,
  name:         2,
  email:        3,
  consent:      4,
  welcomeSent:  5,
  drip1Sent:    6,
  drip2Sent:    7,
  drip3Sent:    8,
  drip4Sent:    9,
  unsubscribed: 10,
  unsubToken:   11,
};

const DRIP_COL_BY_KEY = { drip1: COL.drip1Sent, drip2: COL.drip2Sent, drip3: COL.drip3Sent, drip4: COL.drip4Sent };

// =============================================================================
// 1. ONE-TIME SETUP
// =============================================================================

/**
 * Run this ONCE from the Apps Script editor to install triggers.
 * It will ask you to approve permissions; that's normal.
 */
function installTriggers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });

  ScriptApp.newTrigger('onFormSubmitHandler').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('sendDripEmails').timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger('weeklyBackup').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();

  ensureHeadersOnAllTabs_();
  Logger.log('Triggers installed. Headers ensured on all configured tabs.');
}

/** Adds the script-managed header columns to every configured tab if missing. */
function ensureHeadersOnAllTabs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wanted = ['WelcomeSent', 'Drip1Sent', 'Drip2Sent', 'Drip3Sent', 'Drip4Sent', 'Unsubscribed', 'UnsubToken'];

  CONFIG.books.forEach(function (book) {
    const sheet = ss.getSheetByName(book.tab);
    if (!sheet) {
      Logger.log('Warning: configured tab not found: ' + book.tab);
      return;
    }
    const header = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), COL.unsubToken)).getValues()[0];
    wanted.forEach(function (h, i) {
      const colIdx = COL.welcomeSent + i;
      if ((header[colIdx - 1] || '') !== h) sheet.getRange(1, colIdx).setValue(h);
    });
  });
}

// =============================================================================
// 2. WELCOME EMAIL (form submit)
// =============================================================================

function onFormSubmitHandler(e) {
  const sheet = e.range.getSheet();
  const book  = findBookByTab_(sheet.getName());
  if (!book) { Logger.log('Form submitted to an unconfigured tab: ' + sheet.getName()); return; }

  const row   = e.range.getRow();
  const name  = String(sheet.getRange(row, COL.name).getValue() || '').trim();
  const email = String(sheet.getRange(row, COL.email).getValue() || '').trim();
  const consent = String(sheet.getRange(row, COL.consent).getValue() || '').trim();

  if (!email || !isValidEmail_(email)) { Logger.log('Skipping row ' + row + ': invalid email'); return; }
  if (!consent) { Logger.log('Skipping row ' + row + ': no consent'); return; }

  const token = Utilities.getUuid();
  sheet.getRange(row, COL.unsubToken).setValue(token);

  try {
    sendWelcome_(book, name, email, token);
    sheet.getRange(row, COL.welcomeSent).setValue(new Date());
  } catch (err) {
    Logger.log('Welcome send failed for ' + email + ': ' + err);
  }
}

function sendWelcome_(book, name, email, token) {
  const firstName = firstNameOf_(name);
  const subject = 'Your ' + book.title.replace(/^The\s+/, '') + ' Dossier — files inside';
  const links = book.files;

  const body =
    firstName + ',\n\n' +
    'You asked for the dossier. Here it is.\n\n' +
    '  · The Westminster Pub Code Map\n' +
    '    ' + driveDownloadUrl_(links.map) + '\n\n' +
    '  · Hidden London: Intelligence Brief №1\n' +
    '    ' + driveDownloadUrl_(links.brief) + '\n\n' +
    '  · Decoded: The Westminster Symbols Field Guide\n' +
    '    ' + driveDownloadUrl_(links.guide) + '\n\n' +
    '  · The Paris Code — Chapter One (classified)\n' +
    '    ' + driveDownloadUrl_(links.paris) + '\n\n' +
    'Read them in any order. The map first, if you trust me.\n\n' +
    'Three locations on the map have been gently shifted by 30–60 metres. ' +
    'I\'m not going to tell you which. If you find them, you\'ve earned the next dossier.\n\n' +
    'I\'ll write to you again in a few days with the part of the research that didn\'t fit ' +
    'in the book. After that, only when a new file in the series is ready — never more than once a month.\n\n' +
    '— ' + CONFIG.authorName + '\n\n' +
    'P.S. If a friend would walk this route with you, send them the landing:\n' +
    CONFIG.landingUrl + '\n\n' +
    'Unsubscribe in one click: ' + unsubscribeUrl_(token) + '\n';

  sendEmail_(email, subject, body);
}

// =============================================================================
// 3. DRIP SCHEDULER (daily)
// =============================================================================

function sendDripEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();

  CONFIG.books.forEach(function (book) {
    const sheet = ss.getSheetByName(book.tab);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const data = sheet.getRange(2, 1, lastRow - 1, COL.unsubToken).getValues();

    data.forEach(function (row, i) {
      const rowIdx = i + 2;
      const ts = row[COL.timestamp - 1];
      const name = String(row[COL.name - 1] || '').trim();
      const email = String(row[COL.email - 1] || '').trim();
      const unsub = row[COL.unsubscribed - 1];
      const token = row[COL.unsubToken - 1] || '';

      if (!ts || !email || !isValidEmail_(email)) return;
      if (unsub === true || String(unsub).toLowerCase() === 'true') return;

      const daysSince = daysBetween_(ts, today);

      book.drip.forEach(function (mail) {
        if (daysSince < mail.dayOffset) return;
        const sentCol = DRIP_COL_BY_KEY[mail.key];
        if (!sentCol) return;
        const alreadySent = row[sentCol - 1];
        if (alreadySent) return;

        try {
          sendDrip_(book, mail, name, email, token);
          sheet.getRange(rowIdx, sentCol).setValue(new Date());
        } catch (err) {
          Logger.log('Drip ' + mail.key + ' failed for ' + email + ': ' + err);
        }
      });
    });
  });
}

function sendDrip_(book, mail, name, email, token) {
  const body = mail.body
    .replace(/{{FIRST_NAME}}/g, firstNameOf_(name))
    .replace(/{{AUTHOR_NAME}}/g, CONFIG.authorName)
    .replace(/{{LANDING_URL}}/g, CONFIG.landingUrl)
    .replace(/{{UNSUB_URL}}/g,   unsubscribeUrl_(token));
  sendEmail_(email, mail.subject, body);
}

// =============================================================================
// 4. UNSUBSCRIBE WEB APP
//    Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
//      Execute as: Me     Who has access: Anyone
//    Paste the resulting URL into CONFIG.webAppUrl above.
// =============================================================================

function doGet(e) {
  const token = (e && e.parameter && e.parameter.t) ? String(e.parameter.t) : '';
  const result = token ? unsubscribeByToken_(token) : false;

  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribed</title>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' +
    'body{margin:0;background:#0B0B0D;color:#ECE7DD;font-family:Georgia,serif;' +
    'display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}' +
    '.box{max-width:480px;text-align:center;border:1px solid rgba(184,150,79,0.25);' +
    'padding:2.5rem;background:#14141A}' +
    'h1{font-weight:500;margin:0 0 1rem;color:#B8964F}' +
    'p{line-height:1.6;color:#8A8579}' +
    '</style></head><body><div class="box">' +
    (result
      ? '<h1>You\'re unsubscribed.</h1><p>We won\'t email you again. Your dossier files keep working — they\'re yours.</p>'
      : '<h1>Already unsubscribed</h1><p>Or the link is no longer valid. Either way, you won\'t receive further emails.</p>') +
    '</div></body></html>';

  return HtmlService.createHtmlOutput(html).setTitle('Unsubscribed');
}

function unsubscribeByToken_(token) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let didUnsub = false;

  CONFIG.books.forEach(function (book) {
    const sheet = ss.getSheetByName(book.tab);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const tokens = sheet.getRange(2, COL.unsubToken, lastRow - 1, 1).getValues();
    for (let i = 0; i < tokens.length; i++) {
      if (String(tokens[i][0]) === token) {
        sheet.getRange(i + 2, COL.unsubscribed).setValue(true);
        didUnsub = true;
      }
    }
  });

  return didUnsub;
}

// =============================================================================
// 5. WEEKLY BACKUP — CSV emailed to the author
// =============================================================================

function weeklyBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const attachments = [];
  let totalRows = 0;

  CONFIG.books.forEach(function (book) {
    const sheet = ss.getSheetByName(book.tab);
    if (!sheet) return;
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return;
    totalRows += values.length - 1;
    const csv = values.map(rowToCsv_).join('\n');
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    attachments.push(Utilities.newBlob(csv, 'text/csv', book.slug + '-subscribers-' + stamp + '.csv'));
  });

  if (!attachments.length) { Logger.log('Backup: nothing to send.'); return; }

  MailApp.sendEmail({
    to: CONFIG.authorEmail,
    subject: 'Code Cities — weekly subscriber backup (' + totalRows + ' total)',
    body: 'Attached: one CSV per book. Keep these in a folder you trust. ' +
          'They are the canonical source of truth for your list.',
    attachments: attachments,
  });
}

function rowToCsv_(row) {
  return row.map(function (cell) {
    const s = (cell instanceof Date) ? cell.toISOString() : String(cell == null ? '' : cell);
    return '"' + s.replace(/"/g, '""') + '"';
  }).join(',');
}

// =============================================================================
// 6. HELPERS
// =============================================================================

function findBookByTab_(tabName) {
  for (let i = 0; i < CONFIG.books.length; i++) {
    if (CONFIG.books[i].tab === tabName) return CONFIG.books[i];
  }
  return null;
}

function isValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function firstNameOf_(full) {
  if (!full) return 'Reader';
  const first = String(full).trim().split(/\s+/)[0];
  return first || 'Reader';
}

function daysBetween_(from, to) {
  const ms = to.getTime() - new Date(from).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Direct-download URL for a Drive file shared as "Anyone with the link".
 * This bypasses the Drive viewer and pushes the PDF straight to the browser,
 * which is what readers expect from an email link.
 */
function driveDownloadUrl_(fileId) {
  if (!fileId || fileId.indexOf('DRIVE_FILE_ID_FOR_') === 0) {
    return '[REPLACE THIS — fileId not configured in CONFIG.books[].files]';
  }
  return 'https://drive.google.com/uc?export=download&id=' + fileId;
}

function unsubscribeUrl_(token) {
  if (CONFIG.webAppUrl && token) {
    return CONFIG.webAppUrl + '?t=' + encodeURIComponent(token);
  }
  // Safe fallback: a reply-based unsubscribe. Honoured manually by the author
  // until the web-app deployment is in place.
  return 'mailto:' + CONFIG.authorEmail + '?subject=Unsubscribe';
}

/**
 * Single send chokepoint. To swap providers later (e.g. Brevo), only this
 * function needs to change — call signatures elsewhere stay identical.
 */
function sendEmail_(to, subject, body) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: body,
    name: CONFIG.authorName,
    replyTo: CONFIG.authorEmail,
  });
}
