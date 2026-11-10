import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,'.','VITE_');
 const rawBase=env.VITE_BASE_PATH||'/';
 const base=rawBase.endsWith('/')?rawBase:rawBase+'/';
 return {
  base,
  plugins:[react(),VitePWA({
   registerType:'autoUpdate',
   scope:base,
   includeAssets:['icon.svg','icon-192.png','icon-512.png'],
   manifest:{
    id:base,name:'Ритм — дневник тренировок',short_name:'Ритм',
    description:'Твой прогресс начинается с одного подхода',lang:'ru',
    theme_color:'#2457dc',background_color:'#f1f5fa',display:'standalone',
    start_url:base,scope:base,
    icons:[{src:base+'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
           {src:base+'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]
   }
  })]
 };
});
