// Direct Node entry; Claude uses the ancestor-resolving exec bootstrap.
process.argv[2] = "backup-on-stop";
await import("./entry.mjs");
