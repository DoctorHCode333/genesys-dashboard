 optimizeDeps: {
    include: [
      '@emotion/react', 
      '@emotion/styled', 
      '@mui/material/Tooltip'
    ],
  },
  plugins: [react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin'],
    },
  }),],
  server:{
    port:3006,
  },
  base: '/Acoustic_Chart_Dev',
  build: {
    outDir: path.resolve(__dirname, `Acoustic_Chart_Dev`), // Set the output directory based on the version
  },
