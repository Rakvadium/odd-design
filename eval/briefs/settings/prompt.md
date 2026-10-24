Build the settings screen for our team workspace app. Use odd-design for the UI. It's already installed.

The backend is the mock server in this project. Start it with `bun run api`. `API.md` describes it. The screen loads the current settings from the server and saves changes back to it.

People can:
- change their display name and email
- turn email notifications and push notifications on and off
- send themselves a test notification
- sign out of all their other devices

Saving only makes sense once something has changed. The server is sometimes slow and sometimes fails, and people should always know what's going on. When you're done, `bun run dev` should start the app.
