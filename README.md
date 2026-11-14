# Scavio Company Enrichment for Twenty

Select companies in Twenty and fill in the contact details they publish on their own website: emails, phone numbers, social profiles, the contact page, and the owner or founder's name and title.

Built for lists of small and local businesses, where data vendors have little: dentists, roofers, agencies, shops, studios. The app reads each company's own site, so it works for any business with a website.

## What it does

- **Enrich with Scavio**: select companies in any Company view, open the command menu and run **Enrich with Scavio**. Each company is enriched in the background and its record updates as soon as it is done.
- **Workflow action**: add **Enrich companies with Scavio** to a workflow, for example to enrich every new company when it is created.
- **Enriched (Scavio)** view: a Company view with the new columns side by side.

Fields added to Company:

| Field | What it holds |
|---|---|
| Website Emails | Emails published on the site, on the company's own domain or a common mailbox provider (Gmail, Outlook, ...) |
| Website Phones | Phone numbers published on the site, validated and deduplicated |
| Social Profiles | LinkedIn, Facebook, Instagram, X, YouTube, TikTok and Pinterest profiles linked from the site |
| Contact Page | The site's contact page |
| Owner Name, Owner Title | The owner or founder named on the site or a linked profile |
| Owner Email | The owner's email, only when the site publishes it |
| Scavio Status, Scavio Note, Scavio Enriched At | The outcome of the last run and why |

The standard **Linkedin** field is filled only when it is empty. The app never overwrites your own data in standard fields, and it does not create People records.

## Setup

1. Create a Scavio account at https://scavio.dev/?via=twenty. New accounts get 50 free credits; no card is needed.
2. Copy your API key from the Scavio dashboard.
3. In Twenty, open **Settings > Applications > Scavio Company Enrichment** and paste the key into **Scavio API key**.
4. Optional: raise **Companies enriched at the same time** (default 1) if your Scavio plan allows more parallel requests.

The app's settings page shows a banner if the key is missing, rejected, or out of credits.

## Pricing

The app is free. Enrichment runs on your Scavio account:

- 10 Scavio credits per company enriched from its website.
- A website that cannot be reached is not charged.
- Companies without a website are skipped and not charged.
- Plans and credit prices: https://scavio.dev/pricing

On Twenty Cloud, the app's background runs also use a small amount of Twenty credits for logic function time, as described in Twenty's billing docs.

## How long it takes

Each company takes about 10 to 30 seconds, because the app reads several pages of the site. With the default setting, 100 companies finish in roughly 30 minutes. Statuses update as each company finishes.

## Stopping a run

Change the **Scavio Status** of the companies still marked **Queued** to anything else (or clear it). The app only enriches a company while its status is **Queued**, so those companies are skipped and not charged. A company already being read when you change it still finishes.

## Statuses

| Status | Meaning |
|---|---|
| Queued | Waiting for its turn |
| Enriched | At least one contact detail was found and written |
| No contacts found | The site was read but publishes no contact details |
| No website | The company has no website in its Domains field |
| Website unreachable | The site did not load; no credits were charged |
| Out of Scavio credits | The run stopped; add credits and run it again |
| Failed | See the note on the record |

## Privacy

- **What leaves your workspace:** only the company's website domain, sent to the Scavio API (https://api.scavio.dev) to look it up. No other record data, and nothing about your users, is sent.
- **What Scavio does with it:** reads the public pages of that website and returns what they publish.
- **Retention:** Scavio keeps API request logs, including the domain, for up to 90 days, then deletes them automatically. See https://scavio.dev/privacy.
- **Deleting data:** uninstalling the app removes its fields and their values from your workspace. To have Scavio delete your account data, write to hello@scavio.dev.

## Support

- Email: hello@scavio.dev
- Issues: https://github.com/scavio-ai/twenty-scavio/issues
- Scavio API docs for this endpoint: https://scavio.dev/docs/company-enrich

## Compatibility

Twenty 2.58 or later.

The app is built and maintained by Scavio. It is not affiliated with Twenty.
