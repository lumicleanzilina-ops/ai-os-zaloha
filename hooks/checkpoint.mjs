// Direct Node entry; Claude uses the ancestor-resolving exec bootstrap.
process.argv[2] = "checkpoint";
await import("./entry.mjs");
