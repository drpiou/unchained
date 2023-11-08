import { ConfigEnv, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default (configEnv: ConfigEnv) => {
  process.env = {
    ...process.env,
    ...loadEnv(configEnv.mode, process.cwd(), ''),
  };

  return defineConfig({
    base: process.env.VITE_APP_BASE_URL,
    plugins: [react()],
  })
}
