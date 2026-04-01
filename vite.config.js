import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(() => {
  const isGitHubPagesBuild = process.env.DEPLOY_TARGET === 'github-pages'

  return {
    plugins: [react()],
    base: isGitHubPagesBuild ? '/gerber2png/' : '/',
  }
})
