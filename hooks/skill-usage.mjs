// Direct Node entry; Claude uses the ancestor-resolving exec bootstrap.
process.argv[2] = "skill-usage";
await import("./entry.mjs");
