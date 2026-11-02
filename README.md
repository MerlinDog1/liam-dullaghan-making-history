# Liam Dullaghan - Making History

Static album artist landing page for the remastered release of `Making History`.

## Structure

- Desktop navigation with stream, vinyl, live, and social links.
- Mobile hamburger menu with a side panel.
- Hero using supplied typographic mask SVGs for desktop and mobile.
- Streaming links, Bandcamp CTA, vinyl interest signup, live response counter, share row, and Shakespeare Road section.

## Vinyl interest list

The form posts to the Supabase project `making-history` (`pxdbewtikunsjuwmmzxi`, London). `script.js` calls two
database functions with the public key: `register_vinyl_interest(p_email)` adds a lower-cased, de-duplicated email and
returns the total, and `vinyl_interest_count()` returns the total. The public key cannot read the emails: the
`vinyl_interest` table has row-level security on, no policies and no grants. Read the list in the Supabase dashboard
(Table editor, `vinyl_interest`).

## Local Preview

```bash
python3 -m http.server 4175
```

Then open `http://127.0.0.1:4175/`.
