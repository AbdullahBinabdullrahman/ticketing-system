(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89009,e=>{"use strict";var r=e.i(81884),t=e.i(65155),a=e.i(7584);let s=t.default.forwardRef(({shimmerColor:e="#ffffff",shimmerSize:t="0.05em",shimmerDuration:s="3s",borderRadius:i="100px",background:l="rgba(0, 0, 0, 1)",className:n,children:o,...d},c)=>(0,r.jsxs)("button",{style:{"--spread":"90deg","--shimmer-color":e,"--radius":i,"--speed":s,"--cut":t,"--bg":l},className:(0,a.cn)("group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]","transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",n),ref:c,...d,children:[(0,r.jsx)("div",{className:(0,a.cn)("-z-30 blur-[2px]","[container-type:size] absolute inset-0 overflow-visible"),children:(0,r.jsx)("div",{className:"animate-shimmer-slide absolute inset-0 [aspect-ratio:1] h-[100cqh] [border-radius:0] [mask:none]",children:(0,r.jsx)("div",{className:"animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]"})})}),o,(0,r.jsx)("div",{className:(0,a.cn)("absolute inset-0 size-full","rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]","transform-gpu transition-all duration-300 ease-in-out","group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]","group-active:shadow-[inset_0_-10px_10px_#ffffff3f]")}),(0,r.jsx)("div",{className:(0,a.cn)("absolute [inset:var(--cut)] -z-20 [border-radius:var(--radius)] [background:var(--bg)]")})]}));s.displayName="ShimmerButton",e.s(["ShimmerButton",0,s])},82065,e=>{"use strict";let r=(0,e.i(32452).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",()=>r],82065)},3770,e=>{"use strict";let r=(0,e.i(32452).default)("circle-check",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);e.s(["CheckCircle2",()=>r],3770)},7584,e=>{"use strict";var r=e.i(79245),t=e.i(41291);function a(...e){return(0,t.twMerge)((0,r.clsx)(e))}e.s(["cn",()=>a])},3518,e=>{"use strict";let r,t;var a,s=e.i(65155);let i={data:""},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,o=/\n+/g,d=(e,r)=>{let t="",a="",s="";for(let i in e){let l=e[i];"@"==i[0]?"i"==i[1]?t=i+" "+l+";":a+="f"==i[1]?d(l,i):i+"{"+d(l,"k"==i[1]?"":r)+"}":"object"==typeof l?a+=d(l,r?r.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,r=>/&/.test(r)?r.replace(/&/g,e):e?e+" "+r:r)):i):null!=l&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=d.p?d.p(i,l):i+":"+l+";")}return t+(r&&s?r+"{"+s+"}":s)+a},c={},m=e=>{if("object"==typeof e){let r="";for(let t in e)r+=t+m(e[t]);return r}return e};function p(e){let r,t,a=this||{},s=e.call?e(a.p):e;return((e,r,t,a,s)=>{var i;let p=m(e),u=c[p]||(c[p]=(e=>{let r=0,t=11;for(;r<e.length;)t=101*t+e.charCodeAt(r++)>>>0;return"go"+t})(p));if(!c[u]){let r=p!==e?e:(e=>{let r,t,a=[{}];for(;r=l.exec(e.replace(n,""));)r[4]?a.shift():r[3]?(t=r[3].replace(o," ").trim(),a.unshift(a[0][t]=a[0][t]||{})):a[0][r[1]]=r[2].replace(o," ").trim();return a[0]})(e);c[u]=d(s?{["@keyframes "+u]:r}:r,t?"":"."+u)}let x=t&&c.g?c.g:null;return t&&(c.g=c[u]),i=c[u],x?r.data=r.data.replace(x,i):-1===r.data.indexOf(i)&&(r.data=a?i+r.data:r.data+i),u})(s.unshift?s.raw?(r=[].slice.call(arguments,1),t=a.p,s.reduce((e,a,s)=>{let i=r[s];if(i&&i.call){let e=i(t),r=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=r?"."+r:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"")):s.reduce((e,r)=>Object.assign(e,r&&r.call?r(a.p):r),{}):s,(e=>{if("object"==typeof window){let r=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return r.nonce=window.__nonce__,r.parentNode||(e||document.head).appendChild(r),r.firstChild}return e||i})(a.target),a.g,a.o,a.k)}p.bind({g:1});let u,x,g,h=p.bind({k:1});function f(e,r){let t=this||{};return function(){let a=arguments;function s(i,l){let n=Object.assign({},i),o=n.className||s.className;t.p=Object.assign({theme:x&&x()},n),t.o=/ *go\d+/.test(o),n.className=p.apply(t,a)+(o?" "+o:""),r&&(n.ref=l);let d=e;return e[0]&&(d=n.as||e,delete n.as),g&&d[0]&&g(n),u(d,n)}return r?r(s):s}}var y=(e,r)=>"function"==typeof e?e(r):e,b=(r=0,()=>(++r).toString()),v=()=>{if(void 0===t&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t},j="default",k=(e,r)=>{let{toastLimit:t}=e.settings;switch(r.type){case 0:return{...e,toasts:[r.toast,...e.toasts].slice(0,t)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===r.toast.id?{...e,...r.toast}:e)};case 2:let{toast:a}=r;return k(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:s}=r;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===r.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==r.toastId)};case 5:return{...e,pausedAt:r.time};case 6:let i=r.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},w=[],N={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},P={},E=(e,r=j)=>{P[r]=k(P[r]||N,e),w.forEach(([e,t])=>{e===r&&t(P[r])})},C=e=>Object.keys(P).forEach(r=>E(e,r)),_=(e=j)=>r=>{E(r,e)},A={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},$=e=>(r,t)=>{let a,s=((e,r="blank",t)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...t,id:(null==t?void 0:t.id)||b()}))(r,e,t);return _(s.toasterId||(a=s.id,Object.keys(P).find(e=>P[e].toasts.some(e=>e.id===a))))({type:2,toast:s}),s.id},F=(e,r)=>$("blank")(e,r);F.error=$("error"),F.success=$("success"),F.loading=$("loading"),F.custom=$("custom"),F.dismiss=(e,r)=>{let t={type:3,toastId:e};r?_(r)(t):C(t)},F.dismissAll=e=>F.dismiss(void 0,e),F.remove=(e,r)=>{let t={type:4,toastId:e};r?_(r)(t):C(t)},F.removeAll=e=>F.remove(void 0,e),F.promise=(e,r,t)=>{let a=F.loading(r.loading,{...t,...null==t?void 0:t.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=r.success?y(r.success,e):void 0;return s?F.success(s,{id:a,...t,...null==t?void 0:t.success}):F.dismiss(a),e}).catch(e=>{let s=r.error?y(r.error,e):void 0;s?F.error(s,{id:a,...t,...null==t?void 0:t.error}):F.dismiss(a)}),e};var z=1e3,D=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,O=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,X=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,S=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${O} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${X} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,T=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,I=f("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${T} 1s linear infinite;
`,M=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,B=h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,L=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${B} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,U=f("div")`
  position: absolute;
`,R=f("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,H=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=f("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${H} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,W=({toast:e})=>{let{icon:r,type:t,iconTheme:a}=e;return void 0!==r?"string"==typeof r?s.createElement(q,null,r):r:"blank"===t?null:s.createElement(R,null,s.createElement(I,{...a}),"loading"!==t&&s.createElement(U,null,"error"===t?s.createElement(S,{...a}):s.createElement(L,{...a})))},V=f("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,K=f("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,G=s.memo(({toast:e,position:r,style:t,children:a})=>{let i=e.height?((e,r)=>{let t=e.includes("top")?1:-1,[a,s]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*t}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*t}%,-1px) scale(.6); opacity:0;}
`];return{animation:r?`${h(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||r||"top-center",e.visible):{opacity:0},l=s.createElement(W,{toast:e}),n=s.createElement(K,{...e.ariaProps},y(e.message,e));return s.createElement(V,{className:e.className,style:{...i,...t,...e.style}},"function"==typeof a?a({icon:l,message:n}):s.createElement(s.Fragment,null,l,n))});a=s.createElement,d.p=void 0,u=a,x=void 0,g=void 0;var J=({id:e,className:r,style:t,onHeightUpdate:a,children:i})=>{let l=s.useCallback(r=>{if(r){let t=()=>{a(e,r.getBoundingClientRect().height)};t(),new MutationObserver(t).observe(r,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return s.createElement("div",{ref:l,className:r,style:t},i)},Y=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Z=({reverseOrder:e,position:r="top-center",toastOptions:t,gutter:a,children:i,toasterId:l,containerStyle:n,containerClassName:o})=>{let{toasts:d,handlers:c}=((e,r="default")=>{let{toasts:t,pausedAt:a}=((e={},r=j)=>{let[t,a]=(0,s.useState)(P[r]||N),i=(0,s.useRef)(P[r]);(0,s.useEffect)(()=>(i.current!==P[r]&&a(P[r]),w.push([r,a]),()=>{let e=w.findIndex(([e])=>e===r);e>-1&&w.splice(e,1)}),[r]);let l=t.toasts.map(r=>{var t,a,s;return{...e,...e[r.type],...r,removeDelay:r.removeDelay||(null==(t=e[r.type])?void 0:t.removeDelay)||(null==e?void 0:e.removeDelay),duration:r.duration||(null==(a=e[r.type])?void 0:a.duration)||(null==e?void 0:e.duration)||A[r.type],style:{...e.style,...null==(s=e[r.type])?void 0:s.style,...r.style}}});return{...t,toasts:l}})(e,r),i=(0,s.useRef)(new Map).current,l=(0,s.useCallback)((e,r=z)=>{if(i.has(e))return;let t=setTimeout(()=>{i.delete(e),n({type:4,toastId:e})},r);i.set(e,t)},[]);(0,s.useEffect)(()=>{if(a)return;let e=Date.now(),s=t.map(t=>{if(t.duration===1/0)return;let a=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(a<0){t.visible&&F.dismiss(t.id);return}return setTimeout(()=>F.dismiss(t.id,r),a)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[t,a,r]);let n=(0,s.useCallback)(_(r),[r]),o=(0,s.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,s.useCallback)((e,r)=>{n({type:1,toast:{id:e,height:r}})},[n]),c=(0,s.useCallback)(()=>{a&&n({type:6,time:Date.now()})},[a,n]),m=(0,s.useCallback)((e,r)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=r||{},l=t.filter(r=>(r.position||i)===(e.position||i)&&r.height),n=l.findIndex(r=>r.id===e.id),o=l.filter((e,r)=>r<n&&e.visible).length;return l.filter(e=>e.visible).slice(...a?[o+1]:[0,o]).reduce((e,r)=>e+(r.height||0)+s,0)},[t]);return(0,s.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)l(e.id,e.removeDelay);else{let r=i.get(e.id);r&&(clearTimeout(r),i.delete(e.id))}})},[t,l]),{toasts:t,handlers:{updateHeight:d,startPause:o,endPause:c,calculateOffset:m}}})(t,l);return s.createElement("div",{"data-rht-toaster":l||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...n},className:o,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(t=>{let l,n,o=t.position||r,d=c.calculateOffset(t,{reverseOrder:e,gutter:a,defaultPosition:r}),m=(l=o.includes("top"),n=o.includes("center")?{justifyContent:"center"}:o.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:v()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${d*(l?1:-1)}px)`,...l?{top:0}:{bottom:0},...n});return s.createElement(J,{id:t.id,key:t.id,onHeightUpdate:c.updateHeight,className:t.visible?Y:"",style:m},"custom"===t.type?y(t.message,t):i?i(t):s.createElement(G,{toast:t,position:o}))}))};e.s(["Toaster",()=>Z,"default",()=>F,"toast",()=>F],3518)},98149,e=>{"use strict";let r=(0,e.i(32452).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",()=>r],98149)},90973,e=>{"use strict";let r=(0,e.i(32452).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",()=>r],90973)},14941,e=>{"use strict";let r=(0,e.i(32452).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);e.s(["Phone",()=>r],14941)},90634,e=>{"use strict";let r=(0,e.i(32452).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",()=>r],90634)},39993,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a={VALID_LOADERS:function(){return i},imageConfigDefault:function(){return l}};for(var s in a)Object.defineProperty(t,s,{enumerable:!0,get:a[s]});let i=["default","imgix","cloudinary","akamai","custom"],l={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[32,48,64,96,128,256,384],path:"/_next/image",loader:"default",loaderFile:"",domains:[],disableStaticImages:!1,minimumCacheTTL:14400,formats:["image/webp"],maximumRedirects:3,dangerouslyAllowLocalIP:!1,dangerouslyAllowSVG:!1,contentSecurityPolicy:"script-src 'none'; frame-src 'none'; sandbox;",contentDispositionType:"attachment",localPatterns:void 0,remotePatterns:[],qualities:[75],unoptimized:!1}},17179,(e,r,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ImageConfigContext",{enumerable:!0,get:function(){return i}});let a=e.r(18954)._(e.r(65155)),s=e.r(39993),i=a.default.createContext(s.imageConfigDefault)},99202,e=>{"use strict";var r=e.i(81884),t=e.i(65155);e.i(84966);var a=e.i(20780),s=e.i(22319),i=e.i(79277),l=e.i(37144),n=e.i(12966),o=e.i(89009),d=e.i(16497),c=e.i(90973),m=e.i(90634),p=e.i(14941),u=e.i(32452);let x=(0,u.default)("image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);var g=e.i(3770),h=e.i(82065),f=e.i(98149),y=e.i(4379);let b=(0,u.default)("key-round",[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]]);var v=e.i(3518),j=e.i(5707);function k(){let{t:e,i18n:u}=(0,a.useTranslation)("common"),k=(0,s.useRouter)(),[w,N]=(0,t.useState)(!1),{register:P,handleSubmit:E,formState:{errors:C},watch:_}=(0,i.useForm)({defaultValues:{status:"active",sendWelcomeEmail:!0}}),A=async t=>{try{N(!0);let a=await j.default.post("/admin/partners",t);a.data.success?v.default.success((0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"font-semibold",children:e("partners.userCreated")}),(0,r.jsxs)("p",{className:"text-xs mt-1",children:[e("users.email"),": ",a.data.data.contactEmail]})]}),{duration:1e4}):v.default.success(e("partners.userCreated"),{icon:(0,r.jsx)(g.CheckCircle2,{className:"h-5 w-5 text-green-500"})}),k.push(`/admin/partners/${a.data.data.id}`)}catch(a){console.error("Failed to create partner:",a);let t=a?.response?.data?.error?.message||e("errors.generic");v.default.error(t,{icon:(0,r.jsx)(h.AlertCircle,{className:"h-5 w-5 text-red-500"})})}finally{N(!1)}},$=_("status");return(0,r.jsx)(l.default,{children:(0,r.jsxs)("div",{dir:"ar"===u.language?"rtl":"ltr",children:[(0,r.jsx)(n.BlurFade,{delay:.1,children:(0,r.jsx)("div",{className:"flex items-center justify-between mb-6",children:(0,r.jsxs)("div",{className:"flex items-center gap-4",children:[(0,r.jsx)("button",{onClick:()=>k.back(),className:"p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",children:(0,r.jsx)(c.ArrowLeft,{className:"h-5 w-5 text-gray-600 dark:text-gray-400"})}),(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:"text-3xl font-bold text-gray-900 dark:text-white",children:e("partners.newPartner")}),(0,r.jsx)("p",{className:"text-sm text-gray-600 dark:text-gray-400 mt-1",children:e("partners.addPartnerDescription")})]})]})})}),(0,r.jsx)("form",{onSubmit:E(A),children:(0,r.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[(0,r.jsxs)("div",{className:"lg:col-span-2 space-y-6",children:[(0,r.jsx)(n.BlurFade,{delay:.2,children:(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,r.jsx)("div",{className:"p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg",children:(0,r.jsx)(d.Building2,{className:"h-5 w-5 text-primary-600 dark:text-primary-400"})}),(0,r.jsx)("h2",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:e("partners.basicInformation")})]}),(0,r.jsxs)("div",{className:"space-y-4",children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"name",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("partners.partnerName")," ",(0,r.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,r.jsx)("input",{id:"name",type:"text",...P("name"),className:`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.name?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:e("partners.enterPartnerName")}),C.name&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.name.message]})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"status",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("partners.status")," ",(0,r.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,r.jsxs)("select",{id:"status",...P("status"),className:"w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white",children:[(0,r.jsx)("option",{value:"active",children:e("partners.active")}),(0,r.jsx)("option",{value:"inactive",children:e("partners.inactive")}),(0,r.jsx)("option",{value:"suspended",children:e("partners.suspended")})]}),C.status&&(0,r.jsx)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400",children:C.status.message})]})]})]})}),(0,r.jsx)(n.BlurFade,{delay:.3,children:(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,r.jsx)("div",{className:"p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg",children:(0,r.jsx)(p.Phone,{className:"h-5 w-5 text-blue-600 dark:text-blue-400"})}),(0,r.jsx)("h2",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:e("common.contactInfo")})]}),(0,r.jsxs)("div",{className:"space-y-4",children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"contactEmail",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("partners.contactEmail")," ",(0,r.jsxs)("span",{className:"text-gray-400 text-xs",children:["(",e("common.optional"),")"]})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(m.Mail,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"contactEmail",type:"email",...P("contactEmail"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.contactEmail?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"partner@example.com"})]}),C.contactEmail&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.contactEmail.message]})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"contactPhone",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("partners.contactPhone")," ",(0,r.jsxs)("span",{className:"text-gray-400 text-xs",children:["(",e("common.optional"),")"]})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(p.Phone,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"contactPhone",type:"tel",...P("contactPhone"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.contactPhone?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"+966 XXX XXX XXX"})]}),C.contactPhone&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.contactPhone.message]})]})]})]})}),(0,r.jsx)(n.BlurFade,{delay:.4,children:(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,r.jsx)("div",{className:"p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg",children:(0,r.jsx)(x,{className:"h-5 w-5 text-purple-600 dark:text-purple-400"})}),(0,r.jsx)("h2",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:e("partners.logo")})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"logoUrl",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("partners.logoUrl")," ",(0,r.jsxs)("span",{className:"text-gray-400 text-xs",children:["(",e("common.optional"),")"]})]}),(0,r.jsx)("input",{id:"logoUrl",type:"url",...P("logoUrl"),className:`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.logoUrl?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"https://example.com/logo.png"}),C.logoUrl&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.logoUrl.message]}),(0,r.jsx)("p",{className:"mt-2 text-xs text-gray-500 dark:text-gray-400",children:e("partners.logoUrlHelper")})]})]})}),(0,r.jsx)(n.BlurFade,{delay:.5,children:(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3 mb-6",children:[(0,r.jsx)("div",{className:"p-2 bg-green-100 dark:bg-green-900/20 rounded-lg",children:(0,r.jsx)(y.User,{className:"h-5 w-5 text-green-600 dark:text-green-400"})}),(0,r.jsxs)("div",{className:"flex-1",children:[(0,r.jsx)("h2",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:e("partners.initialUser")}),(0,r.jsx)("p",{className:"text-xs text-gray-600 dark:text-gray-400 mt-1",children:e("partners.initialUserDescription")})]})]}),(0,r.jsxs)("div",{className:"space-y-4",children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"userName",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("users.name")," ",(0,r.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(y.User,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"userName",type:"text",...P("userName"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.userName?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"John Doe"})]}),C.userName&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.userName.message]})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"userEmail",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("users.email")," ",(0,r.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(m.Mail,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"userEmail",type:"email",...P("userEmail"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.userEmail?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"user@example.com"})]}),C.userEmail&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.userEmail.message]})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"userPhone",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("users.phone")," ",(0,r.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(p.Phone,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"userPhone",type:"tel",...P("userPhone"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.userPhone?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"+966 XXX XXX XXX"})]}),C.userPhone&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.userPhone.message]})]}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("label",{htmlFor:"userPassword",className:"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",children:[e("users.password")," ",(0,r.jsxs)("span",{className:"text-gray-400 text-xs",children:["(",e("common.optional"),")"]})]}),(0,r.jsxs)("div",{className:"relative",children:[(0,r.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,r.jsx)(b,{className:"h-5 w-5 text-gray-400"})}),(0,r.jsx)("input",{id:"userPassword",type:"password",...P("userPassword"),className:`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 dark:text-white ${C.userPassword?"border-red-500 dark:border-red-500":"border-gray-300 dark:border-gray-600"}`,placeholder:"••••••••"})]}),C.userPassword&&(0,r.jsxs)("p",{className:"mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1",children:[(0,r.jsx)(h.AlertCircle,{className:"h-3 w-3"}),C.userPassword.message]}),(0,r.jsx)("p",{className:"mt-2 text-xs text-gray-500 dark:text-gray-400",children:e("partners.passwordHelp")})]}),(0,r.jsxs)("div",{className:"flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800",children:[(0,r.jsx)("input",{id:"sendWelcomeEmail",type:"checkbox",...P("sendWelcomeEmail"),className:"h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"}),(0,r.jsx)("label",{htmlFor:"sendWelcomeEmail",className:"text-sm text-gray-700 dark:text-gray-300 cursor-pointer",children:e("partners.sendWelcomeEmail")})]})]})]})})]}),(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsx)(n.BlurFade,{delay:.2,children:(0,r.jsxs)("div",{className:" from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg shadow-sm border border-primary-200 dark:border-primary-700 p-6 sticky top-6",children:[(0,r.jsx)("h3",{className:"text-sm font-semibold text-primary-900 dark:text-primary-100 mb-4 uppercase tracking-wide",children:e("common.preview")}),(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg p-4 mb-4",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3 mb-3",children:[(0,r.jsx)("div",{className:"h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center",children:(0,r.jsx)(d.Building2,{className:"h-6 w-6 text-primary-600 dark:text-primary-400"})}),(0,r.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,r.jsx)("h4",{className:"text-base font-semibold text-gray-900 dark:text-white truncate",children:_("name")||e("partners.partnerName")}),(0,r.jsx)("span",{className:`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${"active"===$?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":"inactive"===$?"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,children:e(`partners.${$}`)})]})]}),_("contactEmail")&&(0,r.jsxs)("div",{className:"flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2",children:[(0,r.jsx)(m.Mail,{className:"h-4 w-4"}),(0,r.jsx)("span",{className:"truncate",children:_("contactEmail")})]}),_("contactPhone")&&(0,r.jsxs)("div",{className:"flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",children:[(0,r.jsx)(p.Phone,{className:"h-4 w-4"}),(0,r.jsx)("span",{children:_("contactPhone")})]})]}),(0,r.jsxs)("div",{className:"bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 text-xs text-primary-800 dark:text-primary-200",children:[(0,r.jsx)("p",{className:"font-medium mb-1",children:e("partners.nextSteps")}),(0,r.jsxs)("ul",{className:"list-disc list-inside space-y-1 text-primary-700 dark:text-primary-300",children:[(0,r.jsx)("li",{children:e("partners.addBranches")}),(0,r.jsx)("li",{children:e("partners.assignCategories")}),(0,r.jsx)("li",{children:e("partners.configureServices")})]})]})]})}),(0,r.jsx)(n.BlurFade,{delay:.3,children:(0,r.jsxs)("div",{className:"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",children:[(0,r.jsxs)("div",{className:"space-y-3",children:[(0,r.jsx)(o.ShimmerButton,{type:"submit",disabled:w,className:"w-full",children:w?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(f.Loader2,{className:"h-4 w-4 mr-2 animate-spin"}),e("common.creating")]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(g.CheckCircle2,{className:"h-4 w-4 mr-2"}),e("partners.createPartner")]})}),(0,r.jsx)("button",{type:"button",onClick:()=>k.back(),disabled:w,className:"w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:e("common.cancel")})]}),(0,r.jsxs)("p",{className:"mt-4 text-xs text-gray-500 dark:text-gray-400 text-center",children:[(0,r.jsx)("span",{className:"text-red-500",children:"*"})," ",e("common.requiredFields")]})]})})]})]})})]})})}e.s(["default",()=>k],99202)},40010,(e,r,t)=>{let a="/admin/partners/new";(window.__NEXT_P=window.__NEXT_P||[]).push([a,()=>e.r(99202)]),r.hot&&r.hot.dispose(function(){window.__NEXT_P.push([a])})},86834,e=>{e.v(r=>Promise.all(["static/chunks/aa5017e01d4a55fd.js"].map(r=>e.l(r))).then(()=>r(9043)))},23497,e=>{e.v(r=>Promise.all(["static/chunks/371b22bfd5d3268c.js"].map(r=>e.l(r))).then(()=>r(83705)))}]);