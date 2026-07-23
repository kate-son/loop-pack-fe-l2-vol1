const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(commit) => /^Merge branch/.test(commit)],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "chore", "test"],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
  },
};

export default commitlintConfig;