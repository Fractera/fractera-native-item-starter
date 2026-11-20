// THE KEY OF A DOOR (node step 548-16; who calls — 818-7, the red team's H6). One check for every door that the other elements of the
// node call: the header `X-Node-Key`, compared in constant time. A native element opens it to two keys:
// - the node key (`SETTINGS_SECRET`) — the core and the other native elements → `{ kind: "node" }`;
// - a custom element's own key `<id>.<mac>` — what a custom element holds since 818-7c instead of the node key, checked offline with the
//   node's data key (`DATA_SECRET`, `lib/element-key.mjs`) → `{ kind: "element", id }`.
// A door made by `npm run door:add` imports it and hands `nodeCaller` to its work: an element's call is answered with that element's own
// data only — the id comes from the key, never from the body. `nodeOnly` — a door that changes this element itself (its settings, its
// agent) answers the node alone.
//
// 🔒 The gate of `proxy.ts` lets a call on the machine's loopback through (`lib/auth/owner-at-machine.ts`) — a neighbour calls
// http://127.0.0.1:<port>/api/<door>. From the internet the gate asks for a session first, so a node door stays inside the node.
import { NextResponse } from "next/server"
import { elementOf, sameKey } from "@/lib/element-key.mjs"

export const NO_STORE = { "Cache-Control": "no-store" }

export type NodeCaller = { kind: "node" } | { kind: "element"; id: string }

/** Who calls: the core or a native (the node key), a custom element (its own key), or nobody (null). */
export function nodeCaller(given: string | null): NodeCaller | null {
  if (!given) return null
  if (sameKey(given, process.env.SETTINGS_SECRET ?? "")) return { kind: "node" }
  const id = elementOf(given, process.env.DATA_SECRET ?? "")
  return id ? { kind: "element", id } : null
}

/** A caller of this node — the node key or a custom element's own key. */
export function nodeKeyOk(given: string | null): boolean {
  return nodeCaller(given) !== null
}

/** Only the node key — the core and the native elements. */
export function nodeOnly(given: string | null): boolean {
  return nodeCaller(given)?.kind === "node"
}

/** The answer to a call without a key of this node: the reason and the header the caller needs. */
export function needNodeKey() {
  return NextResponse.json(
    { error: "bad_key", reason: "send the node key or your element's own key in the X-Node-Key header" },
    { status: 401, headers: { ...NO_STORE, "WWW-Authenticate": 'ApiKey header="X-Node-Key"' } },
  )
}
