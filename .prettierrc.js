module.exports = {
  semi: false,
  tabWidth: 2,
  trailingComma: "all",
  arrowParens: "always",
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      options: { parser: "typescript" },
    },
  ],
}
