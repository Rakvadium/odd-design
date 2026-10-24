# Settings API

The server listens on port 8787.

## GET /settings

Returns the saved settings.

```json
{
  "displayName": "Ada Lovelace",
  "email": "ada@example.com",
  "emailNotifications": true,
  "pushNotifications": false
}
```

## PUT /settings

Send that same object. The response is the object that was saved.

## POST /notifications/test

Sends a notification to this person. A success returns `{ "ok": true }`. For 60 seconds after a success, this route answers 429 with `{ "retryAfterSeconds": 60 }` and a `Retry-After` header. The number is the seconds left.

## POST /sessions/sign-out-others

Ends the other sessions for this person. A success returns `{ "ok": true }`.
