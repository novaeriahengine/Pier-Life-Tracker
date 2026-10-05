# Pier Life JSON

Pier can merge a private JSON file into the signed-in user's Firebase account from **Settings → Life JSON → Firebase**.

The JSON file stays local in the browser until Pier writes the records directly to Firestore. Do **not** commit private setup files or API tokens to this public repository.

## Basic shape

```json
{
  "version": 3,
  "profile": {
    "licenseStatus": "active"
  },
  "collections": {
    "tasks": [
      {
        "importKey": "task-example",
        "title": "Example task",
        "priority": 4,
        "estimateMin": 30,
        "must": false,
        "plannerEnabled": true,
        "status": "open"
      }
    ],
    "goals": [
      {
        "importKey": "goal-example",
        "name": "Example goal",
        "priority": 3,
        "nextAction": "Do the next physical step",
        "nextActionMinutes": 45,
        "plannerEnabled": true,
        "status": "open"
      }
    ]
  }
}
```

## Merge behavior

- `importKey` is the stable identity for a private record.
- Re-importing the same `importKey` updates that Firestore record instead of creating a duplicate.
- Missing `importKey` values receive a deterministic fallback key.
- Supported collections include tasks, goals, bills, accounts, transactions, jobs, shifts, routines, appointments, household, relationshipPlans, devices/assets, legal obligations, time blocks, session logs, market watch/cache, learning progress, daily GOAP drafts, and GOAP feedback.
- References can use `jobImportKey`, `assetImportKey`, `personImportKey`, or `accountImportKey`; Pier converts them to Firestore document IDs during import.

## Daily GOAP

After an import, Pier regenerates the current day's Firebase planning draft.

Each suggested block can be:
- **Approved**
- **Corrected & approved**
- **Rejected**

Those decisions are stored in `goapFeedback`. Future drafts use the accepted start time/duration as a learned preference and penalize repeatedly rejected actions.

The daily draft is only a proposal until approved, so Pier can plan automatically without silently taking over the user's calendar.
