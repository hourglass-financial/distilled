const repoCommands = {
  check: "cd packages/erebor && bun run check",
  test: "cd packages/erebor && bunx vitest run test",
};

export default {
  repoCommands,
  backend: "sqlite" as const,
};
