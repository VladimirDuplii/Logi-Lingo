import{r as o,j as e,L as c,g as y,H as f}from"./app-CB6H9fcf.js";import{B as g}from"./button-2bCJMJSP.js";import{C as j,a as w}from"./card-Cn0cBMnd.js";import{m as n}from"./proxy-B5i_yUx8.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),d=(...a)=>a.filter((t,i,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===i).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var b={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=o.forwardRef(({color:a="currentColor",size:t=24,strokeWidth:i=2,absoluteStrokeWidth:r,className:l="",children:s,iconNode:m,...u},x)=>o.createElement("svg",{ref:x,...b,width:t,height:t,stroke:a,strokeWidth:r?Number(i)*24/Number(t):i,className:d("lucide",l),...u},[...m.map(([h,p])=>o.createElement(h,p)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(a,t)=>{const i=o.forwardRef(({className:r,...l},s)=>o.createElement(v,{ref:s,iconNode:t,className:d(`lucide-${N(a)}`,r),...l}));return i.displayName=`${a}`,i};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=k("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);function L(){return e.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white",children:e.jsx(j,{className:"w-full max-w-md shadow-xl rounded-2xl p-6",children:e.jsxs(w,{className:"flex flex-col items-center space-y-6",children:[e.jsx(n.div,{initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},transition:{duration:.5},className:"bg-indigo-100 p-4 rounded-full",children:e.jsx(C,{className:"w-10 h-10 text-indigo-600"})}),e.jsx(n.h1,{initial:{y:-20,opacity:0},animate:{y:0,opacity:1},transition:{delay:.2,duration:.5},className:"text-2xl font-bold text-gray-900 text-center",children:"Ласкаво просимо до LogicLingo"}),e.jsx(n.p,{initial:{y:-10,opacity:0},animate:{y:0,opacity:1},transition:{delay:.4,duration:.5},className:"text-gray-600 text-center",children:"Навчайтесь у своєму темпі. Дізнавайтесь, практикуйте та ростіть."}),e.jsx(n.div,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.6,duration:.5},className:"w-full h-40 bg-indigo-50 rounded-xl flex items-center justify-center",children:e.jsx("span",{className:"text-indigo-400",children:"[Ілюстрація / графіка]"})}),e.jsx(n.div,{initial:{y:20,opacity:0},animate:{y:0,opacity:1},transition:{delay:.8,duration:.5},className:"w-full",children:e.jsx(c,{href:"/courses",children:e.jsx(g,{className:"w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg py-6",children:"Почати навчання"})})}),e.jsxs(n.p,{initial:{opacity:0},animate:{opacity:1},transition:{delay:1,duration:.5},className:"text-gray-500 text-sm",children:["У мене вже є акаунт —",e.jsx(c,{href:"/login",className:"text-indigo-600 cursor-pointer hover:text-indigo-700 ml-1",children:"Увійти"})]})]})})})}function O({auth:a,laravelVersion:t,phpVersion:i}){const{props:r}=y();return o.useEffect(()=>{r?.auth?.user&&(window.location.href="/dashboard")},[r?.auth?.user]),e.jsxs(e.Fragment,{children:[e.jsx(f,{title:"Ласкаво просимо до LogicLingo"}),e.jsx(L,{})]})}export{O as default};
