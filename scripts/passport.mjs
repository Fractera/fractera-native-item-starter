// npm run passport — this element's passport as its own node sees it (OWN-SERVICE-PROPS/README.md).
//   npm run passport            — the whole passport
//   npm run passport -- me      — only who I am: identity, job, addresses, where it runs, this machine, ties (short)
//   npm run passport -- project — only the node around: every element in one line, the core, how to cooperate (short)
// The short modes exist because the whole answer is long (routes, descriptions): an agent cutting it with head missed the
// node's elements and went around the passport to the core's files (live run 2026-10-06).
// Asks the running element's door on this machine with the node key from .env.local, so the answer carries the node-only parts:
// `self` (port, local address, folder) and `project` (domain, core, every element of the node, how to cooperate — A2A).
// The key never leaves this machine and is never printed.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(join(process.cwd(), '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const port = env.PORT
if (!port) {
  console.error('PASSPORT_FAILED: no PORT in .env.local — the element is not installed on this node')
  process.exit(1)
}
try {
  const r = await fetch(`http://localhost:${port}/api/own-service-props`, { headers: { 'X-Node-Key': env.SETTINGS_SECRET ?? '' } })
  if (!r.ok) throw new Error(`the door answered ${r.status}`)
  const p = await r.json()
  const mode = process.argv[2]
  const out = mode === 'me'
    ? {
        id: p.id, name: p.name, shortDescription: p.shortDescription, accepts: p.accepts, returns: p.returns, designSkill: p.designSkill, isFracteraArchitecture: p.isFracteraArchitecture, framework: p.framework, skills: p.skills, tools: p.tools,
        visibility: p.visibility,
        addresses: { ...p.addresses, routes: `${p.addresses?.routes?.length ?? 0} public pages — npm run passport for the list` },
        host: p.host, machine: p.machine, version: p.version, commit: { hash: p.commit?.hash, count: p.commit?.count },
        github: p.github, calls: p.calls, calledBy: p.calledBy,
      }
    : mode === 'project'
      ? {
          domain: p.project?.domain, core: p.project?.core, cooperation: p.project?.cooperation, a2aRegistry: p.project?.a2aRegistry,
          elements: (p.project?.elements ?? []).map((e) => `${e.id} · ${e.name} · ${e.kind} · ${e.status} — ${String(e.description ?? '').slice(0, 110)}`),
        }
      : p
  console.log(JSON.stringify(out, null, 2))
} catch (e) {
  console.error(`PASSPORT_FAILED: ${e.message} — is the element running? (npm run passport asks http://localhost:${port})`)
  process.exit(1)
}
