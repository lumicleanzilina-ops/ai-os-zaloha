// Direct Node entry; Claude uses the ancestor-resolving exec bootstrap.
process.argv[2] = "learnings-index";
await import("./entry.mjs");
