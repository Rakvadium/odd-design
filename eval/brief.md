Hey, can you build out the reading list app in this folder? Right now it's just the scaffolding plus a fake backend in `src/api.ts`. The real server is flaky and sometimes slow, and the fake one behaves the same way, so the app needs to cope with that.

What I want:

- My saved articles, newest first, with the title, the site, and when I saved it.
- Tabs for All, Unread, and Read. Switching tabs should change the URL so I can link straight to one.
- A form to add an article by URL and title.
- On each article, a way to mark it read or unread, and a small trash icon to delete it. Ask me before deleting.
- If the list fails to load, let me try again.
- A "Load more" at the bottom when there are more articles.

It should look like our other apps, so use odd-design. It's already installed. `bun run dev` starts it.
