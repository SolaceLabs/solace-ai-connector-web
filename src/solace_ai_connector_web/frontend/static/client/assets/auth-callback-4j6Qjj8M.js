import{r,j as e}from"./jsx-runtime-CNvHvvCs.js";import{u as k,g}from"./ConfigProvider-Du21v841.js";import{q as p}from"./index-BIEmdpFj.js";function y(){const[o]=p(),[l,h]=r.useState(null),[n,d]=r.useState(null),[m,x]=r.useState(!1),{configServerUrl:f}=k();r.useEffect(()=>{const i=document.documentElement.classList.contains("dark"),a=localStorage.getItem("darkMode")==="true",t=window.matchMedia("(prefers-color-scheme: dark)").matches,c=!localStorage.getItem("darkMode")&&t;x(i||a||c)},[]),r.useEffect(()=>{(async()=>{const a=o.get("temp_code");if(!a){d("No temporary code provided");return}try{const t=await g(),c=await fetch(`${f}/exchange-temp-code`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":t??""},body:JSON.stringify({temp_code:a})}),s=await c.json();if(!c.ok)throw new Error(s.error||"Failed to exchange code");localStorage.setItem("access_token",s.access_token),localStorage.setItem("refresh_token",s.refresh_token),h(s.access_token)}catch(t){d(t.message)}})()},[o]);const u=()=>n?e.jsxs("div",{className:"text-red-500",children:[e.jsx("h2",{className:"text-black dark:text-white",children:"Error"}),e.jsx("p",{className:"text-red-500 dark:text-red-400",children:n})]}):l?e.jsxs("div",{className:"space-y-4",children:[e.jsx("h2",{className:"text-2xl text-black dark:text-white",children:"Successfully Authenticated!"}),e.jsx("button",{onClick:()=>window.location.href="/",className:"bg-solace-green text-white px-6 py-2 rounded shadow hover:bg-solace-dark-green",children:"Go to Chat"})]}):e.jsx("div",{className:"text-black dark:text-white",children:"Processing authentication..."});return e.jsx("div",{className:`${m?"dark":""} min-h-screen flex items-center justify-center`,children:e.jsx("div",{className:"min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900",children:e.jsx("div",{className:"text-center p-8 max-w-lg",children:u()})})})}export{y as default};
