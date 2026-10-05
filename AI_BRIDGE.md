# Pier AI / GGUF Bridge

Pier does not require an LLM. Its GOAP planner remains deterministic. This bridge is a future optional layer for summarization, parsing messy input, proposing tasks/goals, and explaining plans.

## Data pipeline

Pier continuously builds a compact `pier.ai.context.v1` object from the signed-in user's Firebase state and stores a current snapshot in the user's `aiSnapshots` collection. It excludes provider secrets and the driver's license number.

The context includes:

- identity/life summary and current focus
- money, accounts, recent transactions and open bills
- open tasks, goals and routines
- daily GOAP draft and learned approve/correct/reject feedback
- upcoming calendar
- work/jobs/shifts
- family and relationship state
- legal/admin obligations
- devices/vehicles
- smoke-use reduction statistics
- selected cached market quotes and tracked symbols

## Adapter targets

The front end is prepared for:

- Hugging Face Space or inference-backed custom service
- generic Pier JSON backend
- OpenAI-compatible server/proxy
- llama.cpp server
- Ollama
- LM Studio
- Cloudflare Worker / Workers AI proxy
- browser-local WebGPU/WASM GGUF through `window.PierLocalAI.generate(request)`

This list describes protocol adapters, not pricing promises. Keep private provider keys on the backend or in provider/Space secrets, never in public GitHub JavaScript.

## Pier JSON request

```json
{
  "schema": "pier.ai.request.v1",
  "mode": "plan",
  "prompt": "Organize this note into proposed actions.",
  "model": "local-model",
  "context": { "...": "pier.ai.context.v1 payload" },
  "requestedAt": "ISO timestamp"
}
```

Recommended response:

```json
{
  "schema": "pier.ai.response.v1",
  "message": "Short explanation",
  "actions": [
    {
      "type": "create_task",
      "payload": {
        "title": "Call office",
        "priority": 4,
        "estimateMin": 15
      }
    }
  ]
}
```

Do not allow a model to write arbitrary Firestore paths. Validate action type and payload in Pier/backend before applying anything.

## Authentication

If enabled, Pier attaches the signed-in Firebase ID token as:

`Authorization: Bearer <firebase-id-token>`

A backend should verify that token with Firebase Admin before returning private user-specific results.

## Browser-local hook

A future local GGUF loader may expose:

```js
window.PierLocalAI = {
  async generate(request) {
    // run WebGPU/WASM/GGUF inference
    return { schema: "pier.ai.response.v1", message: "...", actions: [] };
  }
};
```

The rest of Pier does not need to change as long as the request/response contract stays compatible.
