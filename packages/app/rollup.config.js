import dts from "rollup-plugin-dts";

export default {
  input: "src/index.tsx",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [dts()],
};
