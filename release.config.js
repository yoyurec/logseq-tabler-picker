module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/exec",
      {
        "verifyReleaseCmd": "echo 'export const packageVersion = \"'${nextRelease.version}'\";' > .version.ts && cat .version.ts"
      }
    ],
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
        verifyConditions: false,
      },
    ],
    "@semantic-release/git",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "zip -qq -r logseq-tabler-picker-${nextRelease.version}.zip dist README.md icon.png LICENSE package.json",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: "logseq-tabler-picker-*.zip",
      },
    ],
  ],
};
