// Direct Node entry; Claude uses the ancestor-resolving exec bootstrap.
process.argv[2] = "self-review";
await import("./entry.mjs");
