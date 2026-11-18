// Legacy direct Node entry; registered hooks use hooks/entry.mjs.
process.argv[2] = "guard-root-writes";
await import("./entry.mjs");
