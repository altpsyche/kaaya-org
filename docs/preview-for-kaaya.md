# Seeing the new site on your own computer

This page is for anyone at Kaaya who wants to look at the new website before it
goes live. You do not need to know anything technical, and you will not be asked
to type any commands yourself.

The preview runs **only on your own computer**. Nobody else can see it, nothing
you do in it is published, and closing it changes nothing.

## What you need once, before the first time

Someone technical needs to set two things up on your machine:

1. **Claude Code**, installed and signed in.
2. **A copy of the website folder**, called `kaaya-org`.

After that, everything below is yours to do on your own, as often as you like.

## Every time you want to look

Open Claude Code inside the `kaaya-org` folder, then copy the whole block below
and paste it in as your message.

```
Please get the latest version of the Kaaya website and show it to me in my browser.

Do all of this for me — I am not technical, so please don't ask me to run
commands myself:

1. Switch to the branch called sub-domain-refactor and pull the latest changes.
   If I have any unsaved work in the folder, stop and tell me instead of
   discarding it.
2. Install anything that needs installing.
3. Start the local preview server in the background.
4. Check that the site actually loads, then give me the link to click, plus a
   short list of the main pages worth looking at.
5. Remind me at the end that I should tell you "stop the site" when I'm done,
   and that the preview only runs on my own computer — nobody else can see it.

If something fails, explain what went wrong in plain language and what you
need from me.
```

You will get a link back, usually <http://localhost:4321>. Click it, and the
site opens in your browser.

## When you have finished looking

Type this into the same Claude Code window:

```
stop the site
```

The preview shuts down. If you forget, nothing breaks — it stops on its own when
you shut the computer down, and it was never visible to anyone but you.

## Two things that look wrong and are not

**The whole site sits under one address.** You will browse `localhost:4321/gallery`,
`localhost:4321/place/stay`, and so on. The real site splits across six
addresses — `gallery.kaaya.org`, `place.kaaya.org`, `community.kaaya.org`,
`events.kaaya.org`, `happenings.kaaya.org` and `kaaya.org` itself. That split is
built and tested, but it only switches on once the site is hosted. The preview
deliberately shows everything in one place so you can click straight through it.

**Some content is standing in for the real thing.** Every one of these is
waiting on Kaaya, not on the build:

- **Event dates.** All three events say *"Date to be announced"* rather than a
  date. The old Wix site's dates were placeholder rubbish — `1:41 am`, and an
  address in Tennessee — so nothing was carried over and nothing was invented. A
  date is the one thing on a website somebody acts on by turning up, so none is
  shown until it is real.
- **Email addresses.** `info@kaaya.org` does not exist yet and `art@kaaya.org`
  has not been confirmed. The enquiry forms are built and correct, but until
  those mailboxes exist a form submission has nowhere of its own to land.
- **The homepage photograph.** It shows the campus photo from the old site. The
  design asks for the current exhibition.
- **The short description of each section**, the one that appears in Google
  results and when a link is shared. Five short sentences are owed; interim ones
  are in place.
- **Artist residencies.** The Studios pages are built, but no artist is named as
  living there, because nobody has told us who does. We will not guess about a
  real person.

The site cannot be published while any of these is still a stand-in — that is
enforced automatically, not by anyone remembering. The full list of what is owed
lives in the blockers table at the end of
[`kaaya_website_implementation_tasks.md`](./kaaya_website_implementation_tasks.md).

## If something goes wrong

Tell Claude Code what you saw, in your own words — "the link doesn't open", "it
said something about a port". It can read the error and fix it. You do not need
to interpret anything yourself.
