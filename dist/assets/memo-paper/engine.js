/*! Paper Crumple by ITEM Inc. (MIT), adapted for Shiyu. See LICENSE and THIRD_PARTY_NOTICES.txt. */
var Fd=0,Lc=1,Ud=2;var xu=1,Dl=2,$n=3,xi=0,pn=1,Nn=2;var je=0,xs=1,Nc=2,Dc=3,Fc=4,Fl=5,On=100,Bd=101,Od=102,Uc=103,Bc=104,ko=200,zd=201,kd=202,Vd=203,Qa=204,tl=205,Ul=206,Hd=207,Bl=208,Gd=209,Wd=210,Xd=211,qd=212,Yd=213,Zd=214,jd=0,$d=1,Kd=2,so=3,Jd=4,Qd=5,tf=6,ef=7,Vo=0,nf=1,sf=2,vi=0,Ol=1,zl=2,kl=3,Vl=4,rf=5,Hl=6,Oc="attached",of="detached",_u=300,Ms=301,Ss=302,nr=303,el=304,Ho=306,ei=1e3,rn=1001,nl=1002,ke=1003,zc=1004;var xa=1005;var Ye=1006,af=1007;var bs=1008;var yi=1009,lf=1010,cf=1011,Gl=1012,wu=1013,gi=1014,Je=1015,cn=1016,Mu=1017,Su=1018,ti=1020,hf=1021,dn=1023,Wl=1024,uf=1025,Gi=1026,_i=1027,gr=1028,bu=1029,df=1030,Eu=1031,Au=1033,_a=33776,wa=33777,Ma=33778,Sa=33779,kc=35840,Vc=35841,Hc=35842,Gc=35843,Tu=36196,Wc=37492,Xc=37496,qc=37808,Yc=37809,Zc=37810,jc=37811,$c=37812,Kc=37813,Jc=37814,Qc=37815,th=37816,eh=37817,nh=37818,ih=37819,sh=37820,rh=37821,ba=36492,oh=36494,ah=36495,ff=36283,lh=36284,ch=36285,hh=36286;var ro=2300,oo=2301,Ea=2302,uh=2400,dh=2401,fh=2402,pf=2500;var Cu=3e3,Wi=3001,mf=3200,gf=3201,vr=0,vf=1,fn="",Ce="srgb",bn="srgb-linear",Xl="display-p3",Go="display-p3-linear",ao="linear",Te="srgb",lo="rec709",co="p3";var Ji=7680;var ph=519,yf=512,xf=513,_f=514,Ru=515,wf=516,Mf=517,Sf=518,bf=519,mh=35044,ql=35048;var gh="300 es",il=1035,Jn=2e3,ho=2001,wi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let i=this._listeners[t];if(i!==void 0){let s=i.indexOf(e);s!==-1&&i.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,t);t.target=null}}},nn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],vh=1234567,Js=Math.PI/180,Es=180/Math.PI;function Ri(){let r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(nn[r&255]+nn[r>>8&255]+nn[r>>16&255]+nn[r>>24&255]+"-"+nn[t&255]+nn[t>>8&255]+"-"+nn[t>>16&15|64]+nn[t>>24&255]+"-"+nn[e&63|128]+nn[e>>8&255]+"-"+nn[e>>16&255]+nn[e>>24&255]+nn[n&255]+nn[n>>8&255]+nn[n>>16&255]+nn[n>>24&255]).toLowerCase()}function Ze(r,t,e){return Math.max(t,Math.min(e,r))}function Yl(r,t){return(r%t+t)%t}function Ef(r,t,e,n,i){return n+(r-t)*(i-n)/(e-t)}function Af(r,t,e){return r!==t?(e-r)/(t-r):0}function Qs(r,t,e){return(1-e)*r+e*t}function Tf(r,t,e,n){return Qs(r,t,1-Math.exp(-e*n))}function Cf(r,t=1){return t-Math.abs(Yl(r,t*2)-t)}function Rf(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*(3-2*r))}function Pf(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*r*(r*(r*6-15)+10))}function If(r,t){return r+Math.floor(Math.random()*(t-r+1))}function Lf(r,t){return r+Math.random()*(t-r)}function Nf(r){return r*(.5-Math.random())}function Df(r){r!==void 0&&(vh=r);let t=vh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Ff(r){return r*Js}function Uf(r){return r*Es}function sl(r){return(r&r-1)===0&&r!==0}function Bf(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function uo(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function Of(r,t,e,n,i){let s=Math.cos,o=Math.sin,a=s(e/2),l=o(e/2),c=s((t+n)/2),h=o((t+n)/2),d=s((t-n)/2),u=o((t-n)/2),f=s((n-t)/2),g=o((n-t)/2);switch(i){case"XYX":r.set(a*h,l*d,l*u,a*c);break;case"YZY":r.set(l*u,a*h,l*d,a*c);break;case"ZXZ":r.set(l*d,l*u,a*h,a*c);break;case"XZX":r.set(a*h,l*g,l*f,a*c);break;case"YXY":r.set(l*f,a*h,l*g,a*c);break;case"ZYZ":r.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function ps(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function an(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}var De={DEG2RAD:Js,RAD2DEG:Es,generateUUID:Ri,clamp:Ze,euclideanModulo:Yl,mapLinear:Ef,inverseLerp:Af,lerp:Qs,damp:Tf,pingpong:Cf,smoothstep:Rf,smootherstep:Pf,randInt:If,randFloat:Lf,randFloatSpread:Nf,seededRandom:Df,degToRad:Ff,radToDeg:Uf,isPowerOfTwo:sl,ceilPowerOfTwo:Bf,floorPowerOfTwo:uo,setQuaternionFromProperEuler:Of,normalize:an,denormalize:ps},re=class r{constructor(t=0,e=0){r.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ze(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*n-o*i+t.x,this.y=s*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},de=class r{constructor(t,e,n,i,s,o,a,l,c){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c)}set(t,e,n,i,s,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],v=i[0],p=i[3],m=i[6],x=i[1],y=i[4],M=i[7],I=i[2],A=i[5],P=i[8];return s[0]=o*v+a*x+l*I,s[3]=o*p+a*y+l*A,s[6]=o*m+a*M+l*P,s[1]=c*v+h*x+d*I,s[4]=c*p+h*y+d*A,s[7]=c*m+h*M+d*P,s[2]=u*v+f*x+g*I,s[5]=u*p+f*y+g*A,s[8]=u*m+f*M+g*P,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*s*h+n*a*l+i*s*c-i*o*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,u=a*l-h*s,f=c*s-o*l,g=e*d+n*u+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=d*v,t[1]=(i*c-h*n)*v,t[2]=(a*n-i*o)*v,t[3]=u*v,t[4]=(h*e-i*l)*v,t[5]=(i*s-a*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*s)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Aa.makeScale(t,e)),this}rotate(t){return this.premultiply(Aa.makeRotation(-t)),this}translate(t,e){return this.premultiply(Aa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Aa=new de;function Pu(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function ir(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function zf(){let r=ir("canvas");return r.style.display="block",r}var yh={};function tr(r){r in yh||(yh[r]=!0,console.warn(r))}var xh=new de().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),_h=new de().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ir={[bn]:{transfer:ao,primaries:lo,toReference:r=>r,fromReference:r=>r},[Ce]:{transfer:Te,primaries:lo,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[Go]:{transfer:ao,primaries:co,toReference:r=>r.applyMatrix3(_h),fromReference:r=>r.applyMatrix3(xh)},[Xl]:{transfer:Te,primaries:co,toReference:r=>r.convertSRGBToLinear().applyMatrix3(_h),fromReference:r=>r.applyMatrix3(xh).convertLinearToSRGB()}},kf=new Set([bn,Go]),be={enabled:!0,_workingColorSpace:bn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!kf.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,t,e){if(this.enabled===!1||t===e||!t||!e)return r;let n=Ir[t].toReference,i=Ir[e].fromReference;return i(n(r))},fromWorkingColorSpace:function(r,t){return this.convert(r,this._workingColorSpace,t)},toWorkingColorSpace:function(r,t){return this.convert(r,t,this._workingColorSpace)},getPrimaries:function(r){return Ir[r].primaries},getTransfer:function(r){return r===fn?ao:Ir[r].transfer}};function _s(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Ta(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var Qi,fo=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Qi===void 0&&(Qi=ir("canvas")),Qi.width=t.width,Qi.height=t.height;let n=Qi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Qi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=ir("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=_s(s[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(_s(e[n]/255)*255):e[n]=_s(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Vf=0,po=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vf++}),this.uuid=Ri(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(Ca(i[o].image)):s.push(Ca(i[o]))}else s=Ca(i);n.url=s}return e||(t.images[this.uuid]=n),n}};function Ca(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?fo.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Hf=0,$e=class r extends wi{constructor(t=r.DEFAULT_IMAGE,e=r.DEFAULT_MAPPING,n=rn,i=rn,s=Ye,o=bs,a=dn,l=yi,c=r.DEFAULT_ANISOTROPY,h=fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Hf++}),this.uuid=Ri(),this.name="",this.source=new po(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new re(0,0),this.repeat=new re(1,1),this.center=new re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new de,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(tr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===Wi?Ce:fn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==_u)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ei:t.x=t.x-Math.floor(t.x);break;case rn:t.x=t.x<0?0:1;break;case nl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ei:t.y=t.y-Math.floor(t.y);break;case rn:t.y=t.y<0?0:1;break;case nl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return tr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Ce?Wi:Cu}set encoding(t){tr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=t===Wi?Ce:fn}};$e.DEFAULT_IMAGE=null;$e.DEFAULT_MAPPING=_u;$e.DEFAULT_ANISOTROPY=1;var ve=class r{constructor(t=0,e=0,n=0,i=1){r.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*s,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,s,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],v=l[2],p=l[6],m=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let y=(c+1)/2,M=(f+1)/2,I=(m+1)/2,A=(h+u)/4,P=(d+v)/4,W=(g+p)/4;return y>M&&y>I?y<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(y),i=A/n,s=P/n):M>I?M<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(M),n=A/i,s=W/i):I<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(I),n=P/s,i=W/s),this.set(n,i,s,e),this}let x=Math.sqrt((p-g)*(p-g)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(d-v)/x,this.z=(u-h)/x,this.w=Math.acos((c+f+m-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},rl=class extends wi{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ve(0,0,t,e),this.scissorTest=!1,this.viewport=new ve(0,0,t,e);let i={width:t,height:e,depth:1};n.encoding!==void 0&&(tr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Wi?Ce:fn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ye,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new $e(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(t,e,n=1){(this.width!==t||this.height!==e||this.depth!==n)&&(this.width=t,this.height=e,this.depth=n,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new po(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},mn=class extends rl{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},mo=class extends $e{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ke,this.minFilter=ke,this.wrapR=rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ol=class extends $e{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ke,this.minFilter=ke,this.wrapR=rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ve=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],d=n[i+3],u=s[o+0],f=s[o+1],g=s[o+2],v=s[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d;return}if(a===1){t[e+0]=u,t[e+1]=f,t[e+2]=g,t[e+3]=v;return}if(d!==v||l!==u||c!==f||h!==g){let p=1-a,m=l*u+c*f+h*g+d*v,x=m>=0?1:-1,y=1-m*m;if(y>Number.EPSILON){let I=Math.sqrt(y),A=Math.atan2(I,m*x);p=Math.sin(p*A)/I,a=Math.sin(a*A)/I}let M=a*x;if(l=l*p+u*M,c=c*p+f*M,h=h*p+g*M,d=d*p+v*M,p===1-a){let I=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=I,c*=I,h*=I,d*=I}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,i,s,o){let a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],d=s[o],u=s[o+1],f=s[o+2],g=s[o+3];return t[e]=a*g+h*d+l*f-c*u,t[e+1]=l*g+h*u+c*d-a*f,t[e+2]=c*g+h*f+a*u-l*d,t[e+3]=h*g-a*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),d=a(s/2),u=l(n/2),f=l(i/2),g=l(s/2);switch(o){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+a+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-i)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(s+c)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(s-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-i)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ze(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-s*l,this._y=i*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-s*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,i=this._y,s=this._z,o=this._w,a=o*t._w+n*t._x+i*t._y+s*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*i+e*this._y,this._z=f*s+e*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),d=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=o*d+this._w*u,this._x=n*d+this._x*u,this._y=i*d+this._y*u,this._z=s*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=Math.random(),e=Math.sqrt(1-t),n=Math.sqrt(t),i=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(e*Math.cos(i),n*Math.sin(s),n*Math.cos(s),e*Math.sin(i))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},G=class r{constructor(t=0,e=0,n=0){r.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(wh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(wh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=t.elements,o=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-s*i),d=2*(s*n-o*e);return this.x=e+l*c+o*d-a*h,this.y=n+l*h+a*c-s*d,this.z=i+l*d+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-s*a,this.y=s*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ra.copy(this).projectOnVector(t),this.sub(Ra)}reflect(t){return this.sub(Ra.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ze(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,n=Math.sqrt(1-t**2);return this.x=n*Math.cos(e),this.y=n*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ra=new G,wh=new Ve,Mi=class{constructor(t=new G(1/0,1/0,1/0),e=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Pn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Pn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Pn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Pn):Pn.fromBufferAttribute(s,o),Pn.applyMatrix4(t.matrixWorld),this.expandByPoint(Pn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Lr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Lr.copy(n.boundingBox)),Lr.applyMatrix4(t.matrixWorld),this.union(Lr)}let i=t.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,Pn),Pn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ys),Nr.subVectors(this.max,Ys),ts.subVectors(t.a,Ys),es.subVectors(t.b,Ys),ns.subVectors(t.c,Ys),ui.subVectors(es,ts),di.subVectors(ns,es),Bi.subVectors(ts,ns);let e=[0,-ui.z,ui.y,0,-di.z,di.y,0,-Bi.z,Bi.y,ui.z,0,-ui.x,di.z,0,-di.x,Bi.z,0,-Bi.x,-ui.y,ui.x,0,-di.y,di.x,0,-Bi.y,Bi.x,0];return!Pa(e,ts,es,ns,Nr)||(e=[1,0,0,0,1,0,0,0,1],!Pa(e,ts,es,ns,Nr))?!1:(Dr.crossVectors(ui,di),e=[Dr.x,Dr.y,Dr.z],Pa(e,ts,es,ns,Nr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Pn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Pn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Wn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Wn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Wn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Wn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Wn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Wn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Wn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Wn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Wn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Wn=[new G,new G,new G,new G,new G,new G,new G,new G],Pn=new G,Lr=new Mi,ts=new G,es=new G,ns=new G,ui=new G,di=new G,Bi=new G,Ys=new G,Nr=new G,Dr=new G,Oi=new G;function Pa(r,t,e,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){Oi.fromArray(r,s);let a=i.x*Math.abs(Oi.x)+i.y*Math.abs(Oi.y)+i.z*Math.abs(Oi.z),l=t.dot(Oi),c=e.dot(Oi),h=n.dot(Oi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Gf=new Mi,Zs=new G,Ia=new G,Si=class{constructor(t=new G,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Gf.setFromPoints(t).getCenter(n);let i=0;for(let s=0,o=t.length;s<o;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Zs.subVectors(t,this.center);let e=Zs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Zs,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ia.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Zs.copy(t.center).add(Ia)),this.expandByPoint(Zs.copy(t.center).sub(Ia))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},Xn=new G,La=new G,Fr=new G,fi=new G,Na=new G,Ur=new G,Da=new G,As=class{constructor(t=new G,e=new G(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Xn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Xn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Xn.copy(this.origin).addScaledVector(this.direction,e),Xn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){La.copy(t).add(e).multiplyScalar(.5),Fr.copy(e).sub(t).normalize(),fi.copy(this.origin).sub(La);let s=t.distanceTo(e)*.5,o=-this.direction.dot(Fr),a=fi.dot(this.direction),l=-fi.dot(Fr),c=fi.lengthSq(),h=Math.abs(1-o*o),d,u,f,g;if(h>0)if(d=o*l-a,u=o*a-l,g=s*h,d>=0)if(u>=-g)if(u<=g){let v=1/h;d*=v,u*=v,f=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u=-s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*s+a)),u=d>0?-s:Math.min(Math.max(-s,-l),s),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-s,-l),s),f=u*(u+2*l)+c):(d=Math.max(0,-(o*s+a)),u=d>0?s:Math.min(Math.max(-s,-l),s),f=-d*d+u*(u+2*l)+c);else u=o>0?-s:s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(La).addScaledVector(Fr,u),f}intersectSphere(t,e){Xn.subVectors(t.center,this.origin);let n=Xn.dot(this.direction),i=Xn.dot(Xn)-n*n,s=t.radius*t.radius;if(i>s)return null;let o=Math.sqrt(s-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,i=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,i=(t.min.x-u.x)*c),h>=0?(s=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(s=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),d>=0?(a=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Xn)!==null}intersectTriangle(t,e,n,i,s){Na.subVectors(e,t),Ur.subVectors(n,t),Da.crossVectors(Na,Ur);let o=this.direction.dot(Da),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;fi.subVectors(this.origin,t);let l=a*this.direction.dot(Ur.crossVectors(fi,Ur));if(l<0)return null;let c=a*this.direction.dot(Na.cross(fi));if(c<0||l+c>o)return null;let h=-a*fi.dot(Da);return h<0?null:this.at(h/o,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},qt=class r{constructor(t,e,n,i,s,o,a,l,c,h,d,u,f,g,v,p){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c,h,d,u,f,g,v,p)}set(t,e,n,i,s,o,a,l,c,h,d,u,f,g,v,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=g,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,i=1/is.setFromMatrixColumn(t,0).length(),s=1/is.setFromMatrixColumn(t,1).length(),o=1/is.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,s=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),d=Math.sin(s);if(t.order==="XYZ"){let u=o*h,f=o*d,g=a*h,v=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+g*c,e[5]=u-v*c,e[9]=-a*l,e[2]=v-u*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,g=c*h,v=c*d;e[0]=u+v*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=v+u*a,e[10]=o*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,g=c*h,v=c*d;e[0]=u-v*a,e[4]=-o*d,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=v-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let u=o*h,f=o*d,g=a*h,v=a*d;e[0]=l*h,e[4]=g*c-f,e[8]=u*c+v,e[1]=l*d,e[5]=v*c+u,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let u=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=v-u*d,e[8]=g*d+f,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*d+g,e[10]=u-v*d}else if(t.order==="XZY"){let u=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+v,e[5]=o*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=a*h,e[10]=v*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Wf,t,Xf)}lookAt(t,e,n){let i=this.elements;return vn.subVectors(t,e),vn.lengthSq()===0&&(vn.z=1),vn.normalize(),pi.crossVectors(n,vn),pi.lengthSq()===0&&(Math.abs(n.z)===1?vn.x+=1e-4:vn.z+=1e-4,vn.normalize(),pi.crossVectors(n,vn)),pi.normalize(),Br.crossVectors(vn,pi),i[0]=pi.x,i[4]=Br.x,i[8]=vn.x,i[1]=pi.y,i[5]=Br.y,i[9]=vn.y,i[2]=pi.z,i[6]=Br.z,i[10]=vn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],v=n[6],p=n[10],m=n[14],x=n[3],y=n[7],M=n[11],I=n[15],A=i[0],P=i[4],W=i[8],S=i[12],b=i[1],V=i[5],Y=i[9],X=i[13],L=i[2],U=i[6],O=i[10],it=i[14],$=i[3],Z=i[7],rt=i[11],lt=i[15];return s[0]=o*A+a*b+l*L+c*$,s[4]=o*P+a*V+l*U+c*Z,s[8]=o*W+a*Y+l*O+c*rt,s[12]=o*S+a*X+l*it+c*lt,s[1]=h*A+d*b+u*L+f*$,s[5]=h*P+d*V+u*U+f*Z,s[9]=h*W+d*Y+u*O+f*rt,s[13]=h*S+d*X+u*it+f*lt,s[2]=g*A+v*b+p*L+m*$,s[6]=g*P+v*V+p*U+m*Z,s[10]=g*W+v*Y+p*O+m*rt,s[14]=g*S+v*X+p*it+m*lt,s[3]=x*A+y*b+M*L+I*$,s[7]=x*P+y*V+M*U+I*Z,s[11]=x*W+y*Y+M*O+I*rt,s[15]=x*S+y*X+M*it+I*lt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],v=t[7],p=t[11],m=t[15];return g*(+s*l*d-i*c*d-s*a*u+n*c*u+i*a*f-n*l*f)+v*(+e*l*f-e*c*u+s*o*u-i*o*f+i*c*h-s*l*h)+p*(+e*c*d-e*a*f-s*o*d+n*o*f+s*a*h-n*c*h)+m*(-i*a*h-e*l*d+e*a*u+i*o*d-n*o*u+n*l*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],v=t[13],p=t[14],m=t[15],x=d*p*c-v*u*c+v*l*f-a*p*f-d*l*m+a*u*m,y=g*u*c-h*p*c-g*l*f+o*p*f+h*l*m-o*u*m,M=h*v*c-g*d*c+g*a*f-o*v*f-h*a*m+o*d*m,I=g*d*l-h*v*l-g*a*u+o*v*u+h*a*p-o*d*p,A=e*x+n*y+i*M+s*I;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let P=1/A;return t[0]=x*P,t[1]=(v*u*s-d*p*s-v*i*f+n*p*f+d*i*m-n*u*m)*P,t[2]=(a*p*s-v*l*s+v*i*c-n*p*c-a*i*m+n*l*m)*P,t[3]=(d*l*s-a*u*s-d*i*c+n*u*c+a*i*f-n*l*f)*P,t[4]=y*P,t[5]=(h*p*s-g*u*s+g*i*f-e*p*f-h*i*m+e*u*m)*P,t[6]=(g*l*s-o*p*s-g*i*c+e*p*c+o*i*m-e*l*m)*P,t[7]=(o*u*s-h*l*s+h*i*c-e*u*c-o*i*f+e*l*f)*P,t[8]=M*P,t[9]=(g*d*s-h*v*s-g*n*f+e*v*f+h*n*m-e*d*m)*P,t[10]=(o*v*s-g*a*s+g*n*c-e*v*c-o*n*m+e*a*m)*P,t[11]=(h*a*s-o*d*s-h*n*c+e*d*c+o*n*f-e*a*f)*P,t[12]=I*P,t[13]=(h*v*i-g*d*i+g*n*u-e*v*u-h*n*p+e*d*p)*P,t[14]=(g*a*i-o*v*i-g*n*l+e*v*l+o*n*p-e*a*p)*P,t[15]=(o*d*i-h*a*i+h*n*l-e*d*l-o*n*u+e*a*u)*P,this}scale(t){let e=this.elements,n=t.x,i=t.y,s=t.z;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),s=1-n,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,s*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,o){return this.set(1,n,s,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,d=a+a,u=s*c,f=s*h,g=s*d,v=o*h,p=o*d,m=a*d,x=l*c,y=l*h,M=l*d,I=n.x,A=n.y,P=n.z;return i[0]=(1-(v+m))*I,i[1]=(f+M)*I,i[2]=(g-y)*I,i[3]=0,i[4]=(f-M)*A,i[5]=(1-(u+m))*A,i[6]=(p+x)*A,i[7]=0,i[8]=(g+y)*P,i[9]=(p-x)*P,i[10]=(1-(u+v))*P,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements,s=is.set(i[0],i[1],i[2]).length(),o=is.set(i[4],i[5],i[6]).length(),a=is.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),t.x=i[12],t.y=i[13],t.z=i[14],In.copy(this);let c=1/s,h=1/o,d=1/a;return In.elements[0]*=c,In.elements[1]*=c,In.elements[2]*=c,In.elements[4]*=h,In.elements[5]*=h,In.elements[6]*=h,In.elements[8]*=d,In.elements[9]*=d,In.elements[10]*=d,e.setFromRotationMatrix(In),n.x=s,n.y=o,n.z=a,this}makePerspective(t,e,n,i,s,o,a=Jn){let l=this.elements,c=2*s/(e-t),h=2*s/(n-i),d=(e+t)/(e-t),u=(n+i)/(n-i),f,g;if(a===Jn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===ho)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,s,o,a=Jn){let l=this.elements,c=1/(e-t),h=1/(n-i),d=1/(o-s),u=(e+t)*c,f=(n+i)*h,g,v;if(a===Jn)g=(o+s)*d,v=-2*d;else if(a===ho)g=s*d,v=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},is=new G,In=new qt,Wf=new G(0,0,0),Xf=new G(1,1,1),pi=new G,Br=new G,vn=new G,Mh=new qt,Sh=new Ve,hn=class r{constructor(t=0,e=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,s=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],d=i[2],u=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(Ze(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ze(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ze(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ze(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ze(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ze(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Mh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Mh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Sh.setFromEuler(this),this.setFromQuaternion(Sh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};hn.DEFAULT_ORDER="XYZ";var sr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},qf=0,bh=new G,ss=new Ve,qn=new qt,Or=new G,js=new G,Yf=new G,Zf=new Ve,Eh=new G(1,0,0),Ah=new G(0,1,0),Th=new G(0,0,1),jf={type:"added"},$f={type:"removed"},Ne=class r extends wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Ri(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let t=new G,e=new hn,n=new Ve,i=new G(1,1,1);function s(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new qt},normalMatrix:{value:new de}}),this.matrix=new qt,this.matrixWorld=new qt,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new sr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.multiply(ss),this}rotateOnWorldAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.premultiply(ss),this}rotateX(t){return this.rotateOnAxis(Eh,t)}rotateY(t){return this.rotateOnAxis(Ah,t)}rotateZ(t){return this.rotateOnAxis(Th,t)}translateOnAxis(t,e){return bh.copy(t).applyQuaternion(this.quaternion),this.position.add(bh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Eh,t)}translateY(t){return this.translateOnAxis(Ah,t)}translateZ(t){return this.translateOnAxis(Th,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(qn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Or.copy(t):Or.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?qn.lookAt(js,Or,this.up):qn.lookAt(Or,js,this.up),this.quaternion.setFromRotationMatrix(qn),i&&(qn.extractRotation(i.matrixWorld),ss.setFromRotationMatrix(qn),this.quaternion.premultiply(ss.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(jf)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent($f)),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),qn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),qn.multiply(t.parent.matrixWorld)),t.applyMatrix4(qn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(js,t,Yf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(js,Zf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++){let s=e[n];(s.matrixWorldAutoUpdate===!0||t===!0)&&s.updateMatrixWorld(t)}}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){let i=this.children;for(let s=0,o=i.length;s<o;s++){let a=i[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxGeometryCount=this._maxGeometryCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];s(t.shapes,d)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));i.material=a}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(s(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}};Ne.DEFAULT_UP=new G(0,1,0);Ne.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ne.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ln=new G,Yn=new G,Fa=new G,Zn=new G,rs=new G,os=new G,Ch=new G,Ua=new G,Ba=new G,Oa=new G,zr=!1,ms=class r{constructor(t=new G,e=new G,n=new G){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Ln.subVectors(t,e),i.cross(Ln);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(t,e,n,i,s){Ln.subVectors(i,e),Yn.subVectors(n,e),Fa.subVectors(t,e);let o=Ln.dot(Ln),a=Ln.dot(Yn),l=Ln.dot(Fa),c=Yn.dot(Yn),h=Yn.dot(Fa),d=o*c-a*a;if(d===0)return s.set(0,0,0),null;let u=1/d,f=(c*l-a*h)*u,g=(o*h-a*l)*u;return s.set(1-f-g,g,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Zn)===null?!1:Zn.x>=0&&Zn.y>=0&&Zn.x+Zn.y<=1}static getUV(t,e,n,i,s,o,a,l){return zr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),zr=!0),this.getInterpolation(t,e,n,i,s,o,a,l)}static getInterpolation(t,e,n,i,s,o,a,l){return this.getBarycoord(t,e,n,i,Zn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Zn.x),l.addScaledVector(o,Zn.y),l.addScaledVector(a,Zn.z),l)}static isFrontFacing(t,e,n,i){return Ln.subVectors(n,e),Yn.subVectors(t,e),Ln.cross(Yn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ln.subVectors(this.c,this.b),Yn.subVectors(this.a,this.b),Ln.cross(Yn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return r.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return r.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,n,i,s){return zr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),zr=!0),r.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}getInterpolation(t,e,n,i,s){return r.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return r.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return r.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,s=this.c,o,a;rs.subVectors(i,n),os.subVectors(s,n),Ua.subVectors(t,n);let l=rs.dot(Ua),c=os.dot(Ua);if(l<=0&&c<=0)return e.copy(n);Ba.subVectors(t,i);let h=rs.dot(Ba),d=os.dot(Ba);if(h>=0&&d<=h)return e.copy(i);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(rs,o);Oa.subVectors(t,s);let f=rs.dot(Oa),g=os.dot(Oa);if(g>=0&&f<=g)return e.copy(s);let v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(os,a);let p=h*g-f*d;if(p<=0&&d-h>=0&&f-g>=0)return Ch.subVectors(s,i),a=(d-h)/(d-h+(f-g)),e.copy(i).addScaledVector(Ch,a);let m=1/(p+v+u);return o=v*m,a=u*m,e.copy(n).addScaledVector(rs,o).addScaledVector(os,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Iu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mi={h:0,s:0,l:0},kr={h:0,s:0,l:0};function za(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}var $t=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ce){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,be.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=be.workingColorSpace){return this.r=t,this.g=e,this.b=n,be.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=be.workingColorSpace){if(t=Yl(t,1),e=Ze(e,0,1),n=Ze(n,0,1),e===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+e):n+e-n*e,o=2*n-s;this.r=za(o,s,t+1/3),this.g=za(o,s,t),this.b=za(o,s,t-1/3)}return be.toWorkingColorSpace(this,i),this}setStyle(t,e=Ce){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ce){let n=Iu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=_s(t.r),this.g=_s(t.g),this.b=_s(t.b),this}copyLinearToSRGB(t){return this.r=Ta(t.r),this.g=Ta(t.g),this.b=Ta(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ce){return be.fromWorkingColorSpace(sn.copy(this),t),Math.round(Ze(sn.r*255,0,255))*65536+Math.round(Ze(sn.g*255,0,255))*256+Math.round(Ze(sn.b*255,0,255))}getHexString(t=Ce){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=be.workingColorSpace){be.fromWorkingColorSpace(sn.copy(this),e);let n=sn.r,i=sn.g,s=sn.b,o=Math.max(n,i,s),a=Math.min(n,i,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(i-s)/d+(i<s?6:0);break;case i:l=(s-n)/d+2;break;case s:l=(n-i)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=be.workingColorSpace){return be.fromWorkingColorSpace(sn.copy(this),e),t.r=sn.r,t.g=sn.g,t.b=sn.b,t}getStyle(t=Ce){be.fromWorkingColorSpace(sn.copy(this),t);let e=sn.r,n=sn.g,i=sn.b;return t!==Ce?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(mi),this.setHSL(mi.h+t,mi.s+e,mi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(mi),t.getHSL(kr);let n=Qs(mi.h,kr.h,e),i=Qs(mi.s,kr.s,e),s=Qs(mi.l,kr.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},sn=new $t;$t.NAMES=Iu;var Kf=0,En=class extends wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kf++}),this.uuid=Ri(),this.name="",this.type="Material",this.blending=xs,this.side=xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Qa,this.blendDst=tl,this.blendEquation=On,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $t(0,0,0),this.blendAlpha=0,this.depthFunc=so,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ph,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ji,this.stencilZFail=Ji,this.stencilZPass=Ji,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==xs&&(n.blending=this.blending),this.side!==xi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Qa&&(n.blendSrc=this.blendSrc),this.blendDst!==tl&&(n.blendDst=this.blendDst),this.blendEquation!==On&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==so&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ph&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ji&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ji&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ji&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(e){let s=i(t.textures),o=i(t.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Ts=class extends En{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Kn=Jf();function Jf(){let r=new ArrayBuffer(4),t=new Float32Array(r),e=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[l|256]=32768,i[l]=24,i[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,i[l]=-c-1,i[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,i[l]=13,i[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,i[l]=24,i[l|256]=24):(n[l]=31744,n[l|256]=64512,i[l]=13,i[l|256]=13)}let s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:t,uint32View:e,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:o,offsetTable:a}}function Qf(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=Ze(r,-65504,65504),Kn.floatView[0]=r;let t=Kn.uint32View[0],e=t>>23&511;return Kn.baseTable[e]+((t&8388607)>>Kn.shiftTable[e])}function tp(r){let t=r>>10;return Kn.uint32View[0]=Kn.mantissaTable[Kn.offsetTable[t]+(r&1023)]+Kn.exponentTable[t],Kn.floatView[0]}var Zl={toHalfFloat:Qf,fromHalfFloat:tp},ze=new G,Vr=new re,Qe=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=mh,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Je,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Vr.fromBufferAttribute(this,e),Vr.applyMatrix3(t),this.setXY(e,Vr.x,Vr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix3(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix4(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyNormalMatrix(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.transformDirection(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ps(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=an(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ps(e,this.array)),e}setX(t,e){return this.normalized&&(e=an(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ps(e,this.array)),e}setY(t,e){return this.normalized&&(e=an(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ps(e,this.array)),e}setZ(t,e){return this.normalized&&(e=an(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ps(e,this.array)),e}setW(t,e){return this.normalized&&(e=an(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=an(e,this.array),n=an(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=an(e,this.array),n=an(n,this.array),i=an(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){return t*=this.itemSize,this.normalized&&(e=an(e,this.array),n=an(n,this.array),i=an(i,this.array),s=an(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==mh&&(t.usage=this.usage),t}};var Cs=class extends Qe{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var go=class extends Qe{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Le=class extends Qe{constructor(t,e,n){super(new Float32Array(t),e,n)}};var ep=0,Mn=new qt,ka=new Ne,as=new G,yn=new Mi,$s=new Mi,qe=new G,tn=class r extends wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ep++}),this.uuid=Ri(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Pu(t)?go:Cs)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new de().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Mn.makeRotationFromQuaternion(t),this.applyMatrix4(Mn),this}rotateX(t){return Mn.makeRotationX(t),this.applyMatrix4(Mn),this}rotateY(t){return Mn.makeRotationY(t),this.applyMatrix4(Mn),this}rotateZ(t){return Mn.makeRotationZ(t),this.applyMatrix4(Mn),this}translate(t,e,n){return Mn.makeTranslation(t,e,n),this.applyMatrix4(Mn),this}scale(t,e,n){return Mn.makeScale(t,e,n),this.applyMatrix4(Mn),this}lookAt(t){return ka.lookAt(t),ka.updateMatrix(),this.applyMatrix4(ka.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(as).negate(),this.translate(as.x,as.y,as.z),this}setFromPoints(t){let e=[];for(let n=0,i=t.length;n<i;n++){let s=t[n];e.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Le(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Mi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let s=e[n];yn.setFromBufferAttribute(s),this.morphTargetsRelative?(qe.addVectors(this.boundingBox.min,yn.min),this.boundingBox.expandByPoint(qe),qe.addVectors(this.boundingBox.max,yn.max),this.boundingBox.expandByPoint(qe)):(this.boundingBox.expandByPoint(yn.min),this.boundingBox.expandByPoint(yn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Si);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new G,1/0);return}if(t){let n=this.boundingSphere.center;if(yn.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){let a=e[s];$s.setFromBufferAttribute(a),this.morphTargetsRelative?(qe.addVectors(yn.min,$s.min),yn.expandByPoint(qe),qe.addVectors(yn.max,$s.max),yn.expandByPoint(qe)):(yn.expandByPoint($s.min),yn.expandByPoint($s.max))}yn.getCenter(n);let i=0;for(let s=0,o=t.count;s<o;s++)qe.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(qe));if(e)for(let s=0,o=e.length;s<o;s++){let a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)qe.fromBufferAttribute(a,c),l&&(as.fromBufferAttribute(t,c),qe.add(as)),i=Math.max(i,n.distanceToSquared(qe))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.array,i=e.position.array,s=e.normal.array,o=e.uv.array,a=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Qe(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],h=[];for(let b=0;b<a;b++)c[b]=new G,h[b]=new G;let d=new G,u=new G,f=new G,g=new re,v=new re,p=new re,m=new G,x=new G;function y(b,V,Y){d.fromArray(i,b*3),u.fromArray(i,V*3),f.fromArray(i,Y*3),g.fromArray(o,b*2),v.fromArray(o,V*2),p.fromArray(o,Y*2),u.sub(d),f.sub(d),v.sub(g),p.sub(g);let X=1/(v.x*p.y-p.x*v.y);isFinite(X)&&(m.copy(u).multiplyScalar(p.y).addScaledVector(f,-v.y).multiplyScalar(X),x.copy(f).multiplyScalar(v.x).addScaledVector(u,-p.x).multiplyScalar(X),c[b].add(m),c[V].add(m),c[Y].add(m),h[b].add(x),h[V].add(x),h[Y].add(x))}let M=this.groups;M.length===0&&(M=[{start:0,count:n.length}]);for(let b=0,V=M.length;b<V;++b){let Y=M[b],X=Y.start,L=Y.count;for(let U=X,O=X+L;U<O;U+=3)y(n[U+0],n[U+1],n[U+2])}let I=new G,A=new G,P=new G,W=new G;function S(b){P.fromArray(s,b*3),W.copy(P);let V=c[b];I.copy(V),I.sub(P.multiplyScalar(P.dot(V))).normalize(),A.crossVectors(W,V);let X=A.dot(h[b])<0?-1:1;l[b*4]=I.x,l[b*4+1]=I.y,l[b*4+2]=I.z,l[b*4+3]=X}for(let b=0,V=M.length;b<V;++b){let Y=M[b],X=Y.start,L=Y.count;for(let U=X,O=X+L;U<O;U+=3)S(n[U+0]),S(n[U+1]),S(n[U+2])}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Qe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let i=new G,s=new G,o=new G,a=new G,l=new G,c=new G,h=new G,d=new G;if(t)for(let u=0,f=t.count;u<f;u+=3){let g=t.getX(u+0),v=t.getX(u+1),p=t.getX(u+2);i.fromBufferAttribute(e,g),s.fromBufferAttribute(e,v),o.fromBufferAttribute(e,p),h.subVectors(o,s),d.subVectors(i,s),h.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)i.fromBufferAttribute(e,u+0),s.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,s),d.subVectors(i,s),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)qe.fromBufferAttribute(t,e),qe.normalize(),t.setXYZ(e,qe.x,qe.y,qe.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h),f=0,g=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let m=0;m<h;m++)u[g++]=c[f++]}return new Qe(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new r,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=t(l,n);e.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,s=!0)}s&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let i=t.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(e))}let s=t.morphAttributes;for(let c in s){let h=[],d=s[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Rh=new qt,zi=new As,Hr=new Si,Ph=new G,ls=new G,cs=new G,hs=new G,Va=new G,Gr=new G,Wr=new re,Xr=new re,qr=new re,Ih=new G,Lh=new G,Nh=new G,Yr=new G,Zr=new G,Fe=class extends Ne{constructor(t=new tn,e=new Ts){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let a=this.morphTargetInfluences;if(s&&a){Gr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],d=s[l];h!==0&&(Va.fromBufferAttribute(d,t),o?Gr.addScaledVector(Va,h):Gr.addScaledVector(Va.sub(e),h))}e.add(Gr)}return e}raycast(t,e){let n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Hr.copy(n.boundingSphere),Hr.applyMatrix4(s),zi.copy(t.ray).recast(t.near),!(Hr.containsPoint(zi.origin)===!1&&(zi.intersectSphere(Hr,Ph)===null||zi.origin.distanceToSquared(Ph)>(t.far-t.near)**2))&&(Rh.copy(s).invert(),zi.copy(t.ray).applyMatrix4(Rh),!(n.boundingBox!==null&&zi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,zi)))}_computeIntersections(t,e,n){let i,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){let p=u[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),y=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,I=y;M<I;M+=3){let A=a.getX(M),P=a.getX(M+1),W=a.getX(M+2);i=jr(this,m,t,n,c,h,d,A,P,W),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){let x=a.getX(p),y=a.getX(p+1),M=a.getX(p+2);i=jr(this,o,t,n,c,h,d,x,y,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){let p=u[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),y=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,I=y;M<I;M+=3){let A=M,P=M+1,W=M+2;i=jr(this,m,t,n,c,h,d,A,P,W),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){let x=p,y=p+1,M=p+2;i=jr(this,o,t,n,c,h,d,x,y,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}};function np(r,t,e,n,i,s,o,a){let l;if(t.side===pn?l=n.intersectTriangle(o,s,i,!0,a):l=n.intersectTriangle(i,s,o,t.side===xi,a),l===null)return null;Zr.copy(a),Zr.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(Zr);return c<e.near||c>e.far?null:{distance:c,point:Zr.clone(),object:r}}function jr(r,t,e,n,i,s,o,a,l,c){r.getVertexPosition(a,ls),r.getVertexPosition(l,cs),r.getVertexPosition(c,hs);let h=np(r,t,e,n,ls,cs,hs,Yr);if(h){i&&(Wr.fromBufferAttribute(i,a),Xr.fromBufferAttribute(i,l),qr.fromBufferAttribute(i,c),h.uv=ms.getInterpolation(Yr,ls,cs,hs,Wr,Xr,qr,new re)),s&&(Wr.fromBufferAttribute(s,a),Xr.fromBufferAttribute(s,l),qr.fromBufferAttribute(s,c),h.uv1=ms.getInterpolation(Yr,ls,cs,hs,Wr,Xr,qr,new re),h.uv2=h.uv1),o&&(Ih.fromBufferAttribute(o,a),Lh.fromBufferAttribute(o,l),Nh.fromBufferAttribute(o,c),h.normal=ms.getInterpolation(Yr,ls,cs,hs,Ih,Lh,Nh,new G),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new G,materialIndex:0};ms.getNormal(ls,cs,hs,d.normal),h.face=d}return h}var rr=class r extends tn{constructor(t=1,e=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};let a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,n,e,t,o,s,0),g("z","y","x",1,-1,n,e,-t,o,s,1),g("x","z","y",1,1,t,n,e,i,o,2),g("x","z","y",1,-1,t,n,-e,i,o,3),g("x","y","z",1,-1,t,e,n,i,s,4),g("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Le(c,3)),this.setAttribute("normal",new Le(h,3)),this.setAttribute("uv",new Le(d,2));function g(v,p,m,x,y,M,I,A,P,W,S){let b=M/P,V=I/W,Y=M/2,X=I/2,L=A/2,U=P+1,O=W+1,it=0,$=0,Z=new G;for(let rt=0;rt<O;rt++){let lt=rt*V-X;for(let st=0;st<U;st++){let tt=st*b-Y;Z[v]=tt*x,Z[p]=lt*y,Z[m]=L,c.push(Z.x,Z.y,Z.z),Z[v]=0,Z[p]=0,Z[m]=A>0?1:-1,h.push(Z.x,Z.y,Z.z),d.push(st/P),d.push(1-rt/W),it+=1}}for(let rt=0;rt<W;rt++)for(let lt=0;lt<P;lt++){let st=u+lt+U*rt,tt=u+lt+U*(rt+1),ct=u+(lt+1)+U*(rt+1),_t=u+(lt+1)+U*rt;l.push(st,tt,_t),l.push(tt,ct,_t),$+=6}a.addGroup(f,$,S),f+=$,u+=it}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Rs(r){let t={};for(let e in r){t[e]={};for(let n in r[e]){let i=r[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function ln(r){let t={};for(let e=0;e<r.length;e++){let n=Rs(r[e]);for(let i in n)t[i]=n[i]}return t}function ip(r){let t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function Lu(r){return r.getRenderTarget()===null?r.outputColorSpace:be.workingColorSpace}var kn={clone:Rs,merge:ln},sp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ke=class extends En{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sp,this.fragmentShader=rp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Rs(t.uniforms),this.uniformsGroups=ip(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},vo=class extends Ne{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new qt,this.projectionMatrix=new qt,this.projectionMatrixInverse=new qt,this.coordinateSystem=Jn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},He=class extends vo{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Es*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Js*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Es*2*Math.atan(Math.tan(Js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,n,i,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Js*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},us=-90,ds=1,al=class extends Ne{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new He(us,ds,t,e);i.layers=this.layers,this.add(i);let s=new He(us,ds,t,e);s.layers=this.layers,this.add(s);let o=new He(us,ds,t,e);o.layers=this.layers,this.add(o);let a=new He(us,ds,t,e);a.layers=this.layers,this.add(a);let l=new He(us,ds,t,e);l.layers=this.layers,this.add(l);let c=new He(us,ds,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,s,o,a,l]=e;for(let c of e)this.remove(c);if(t===Jn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ho)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,s),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},yo=class extends $e{constructor(t,e,n,i,s,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ms,super(t,e,n,i,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},ll=class extends mn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];e.encoding!==void 0&&(tr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===Wi?Ce:fn),this.texture=new yo(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Ye}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new rr(5,5,5),s=new Ke({name:"CubemapFromEquirect",uniforms:Rs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:pn,blending:je});s.uniforms.tEquirect.value=e;let o=new Fe(i,s),a=e.minFilter;return e.minFilter===bs&&(e.minFilter=Ye),new al(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){let s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(s)}},Ha=new G,op=new G,ap=new de,Sn=class{constructor(t=new G(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=Ha.subVectors(n,e).cross(op.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Ha),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let s=-(t.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:e.copy(t.start).addScaledVector(n,s)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||ap.getNormalMatrix(t),i=this.coplanarPoint(Ha).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ki=new Si,$r=new G,or=class{constructor(t=new Sn,e=new Sn,n=new Sn,i=new Sn,s=new Sn,o=new Sn){this.planes=[t,e,n,i,s,o]}set(t,e,n,i,s,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Jn){let n=this.planes,i=t.elements,s=i[0],o=i[1],a=i[2],l=i[3],c=i[4],h=i[5],d=i[6],u=i[7],f=i[8],g=i[9],v=i[10],p=i[11],m=i[12],x=i[13],y=i[14],M=i[15];if(n[0].setComponents(l-s,u-c,p-f,M-m).normalize(),n[1].setComponents(l+s,u+c,p+f,M+m).normalize(),n[2].setComponents(l+o,u+h,p+g,M+x).normalize(),n[3].setComponents(l-o,u-h,p-g,M-x).normalize(),n[4].setComponents(l-a,u-d,p-v,M-y).normalize(),e===Jn)n[5].setComponents(l+a,u+d,p+v,M+y).normalize();else if(e===ho)n[5].setComponents(a,d,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(t){return ki.center.set(0,0,0),ki.radius=.7071067811865476,ki.applyMatrix4(t.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if($r.x=i.normal.x>0?t.max.x:t.min.x,$r.y=i.normal.y>0?t.max.y:t.min.y,$r.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint($r)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Nu(){let r=null,t=!1,e=null,n=null;function i(s,o){e(s,o),n=r.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=r.requestAnimationFrame(i),t=!0)},stop:function(){r.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function lp(r,t){let e=t.isWebGL2,n=new WeakMap;function i(c,h){let d=c.array,u=c.usage,f=d.byteLength,g=r.createBuffer();r.bindBuffer(h,g),r.bufferData(h,d,u),c.onUploadCallback();let v;if(d instanceof Float32Array)v=r.FLOAT;else if(d instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(e)v=r.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else v=r.UNSIGNED_SHORT;else if(d instanceof Int16Array)v=r.SHORT;else if(d instanceof Uint32Array)v=r.UNSIGNED_INT;else if(d instanceof Int32Array)v=r.INT;else if(d instanceof Int8Array)v=r.BYTE;else if(d instanceof Uint8Array)v=r.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)v=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:g,type:v,bytesPerElement:d.BYTES_PER_ELEMENT,version:c.version,size:f}}function s(c,h,d){let u=h.array,f=h._updateRange,g=h.updateRanges;if(r.bindBuffer(d,c),f.count===-1&&g.length===0&&r.bufferSubData(d,0,u),g.length!==0){for(let v=0,p=g.length;v<p;v++){let m=g[v];e?r.bufferSubData(d,m.start*u.BYTES_PER_ELEMENT,u,m.start,m.count):r.bufferSubData(d,m.start*u.BYTES_PER_ELEMENT,u.subarray(m.start,m.start+m.count))}h.clearUpdateRanges()}f.count!==-1&&(e?r.bufferSubData(d,f.offset*u.BYTES_PER_ELEMENT,u,f.offset,f.count):r.bufferSubData(d,f.offset*u.BYTES_PER_ELEMENT,u.subarray(f.offset,f.offset+f.count)),f.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);h&&(r.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){let u=n.get(c);(!u||u.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let d=n.get(c);if(d===void 0)n.set(c,i(c,h));else if(d.version<c.version){if(d.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(d.buffer,c,h),d.version=c.version}}return{get:o,remove:a,update:l}}var Ps=class r extends tn{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let s=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,d=t/a,u=e/l,f=[],g=[],v=[],p=[];for(let m=0;m<h;m++){let x=m*u-o;for(let y=0;y<c;y++){let M=y*d-s;g.push(M,-x,0),v.push(0,0,1),p.push(y/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<a;x++){let y=x+c*m,M=x+c*(m+1),I=x+1+c*(m+1),A=x+1+c*m;f.push(y,M,A),f.push(M,I,A)}this.setIndex(f),this.setAttribute("position",new Le(g,3)),this.setAttribute("normal",new Le(v,3)),this.setAttribute("uv",new Le(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.widthSegments,t.heightSegments)}},cp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,up=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,dp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fp=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,pp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,mp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,gp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,vp=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,yp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,xp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_p=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Mp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,bp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Ep=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ap=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Cp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Pp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Ip=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Lp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Np=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Dp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Fp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Up=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Op=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,zp="gl_FragColor = linearToOutputTexel( gl_FragColor );",kp=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,Vp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Hp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Gp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Wp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Xp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,qp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Yp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Zp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,jp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$p=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Kp=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Jp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Qp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,tm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,em=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,nm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,im=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,sm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,om=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,am=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,cm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,hm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,um=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,dm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,mm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,gm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ym=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,xm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_m=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Mm=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Sm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,bm=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Em=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Am=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Tm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Cm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Im=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Lm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Nm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Dm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Fm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Um=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Om=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,km=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Vm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Gm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,Xm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,qm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Ym=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Zm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$m=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Km=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Jm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Qm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,eg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ng=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ig=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,og=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ag=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,lg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ug=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,gg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,vg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,yg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,xg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_g=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Sg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Eg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ag=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Tg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Pg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ig=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ng=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ug=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Bg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Og=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ue={alphahash_fragment:cp,alphahash_pars_fragment:hp,alphamap_fragment:up,alphamap_pars_fragment:dp,alphatest_fragment:fp,alphatest_pars_fragment:pp,aomap_fragment:mp,aomap_pars_fragment:gp,batching_pars_vertex:vp,batching_vertex:yp,begin_vertex:xp,beginnormal_vertex:_p,bsdfs:wp,iridescence_fragment:Mp,bumpmap_pars_fragment:Sp,clipping_planes_fragment:bp,clipping_planes_pars_fragment:Ep,clipping_planes_pars_vertex:Ap,clipping_planes_vertex:Tp,color_fragment:Cp,color_pars_fragment:Rp,color_pars_vertex:Pp,color_vertex:Ip,common:Lp,cube_uv_reflection_fragment:Np,defaultnormal_vertex:Dp,displacementmap_pars_vertex:Fp,displacementmap_vertex:Up,emissivemap_fragment:Bp,emissivemap_pars_fragment:Op,colorspace_fragment:zp,colorspace_pars_fragment:kp,envmap_fragment:Vp,envmap_common_pars_fragment:Hp,envmap_pars_fragment:Gp,envmap_pars_vertex:Wp,envmap_physical_pars_fragment:nm,envmap_vertex:Xp,fog_vertex:qp,fog_pars_vertex:Yp,fog_fragment:Zp,fog_pars_fragment:jp,gradientmap_pars_fragment:$p,lightmap_fragment:Kp,lightmap_pars_fragment:Jp,lights_lambert_fragment:Qp,lights_lambert_pars_fragment:tm,lights_pars_begin:em,lights_toon_fragment:im,lights_toon_pars_fragment:sm,lights_phong_fragment:rm,lights_phong_pars_fragment:om,lights_physical_fragment:am,lights_physical_pars_fragment:lm,lights_fragment_begin:cm,lights_fragment_maps:hm,lights_fragment_end:um,logdepthbuf_fragment:dm,logdepthbuf_pars_fragment:fm,logdepthbuf_pars_vertex:pm,logdepthbuf_vertex:mm,map_fragment:gm,map_pars_fragment:vm,map_particle_fragment:ym,map_particle_pars_fragment:xm,metalnessmap_fragment:_m,metalnessmap_pars_fragment:wm,morphcolor_vertex:Mm,morphnormal_vertex:Sm,morphtarget_pars_vertex:bm,morphtarget_vertex:Em,normal_fragment_begin:Am,normal_fragment_maps:Tm,normal_pars_fragment:Cm,normal_pars_vertex:Rm,normal_vertex:Pm,normalmap_pars_fragment:Im,clearcoat_normal_fragment_begin:Lm,clearcoat_normal_fragment_maps:Nm,clearcoat_pars_fragment:Dm,iridescence_pars_fragment:Fm,opaque_fragment:Um,packing:Bm,premultiplied_alpha_fragment:Om,project_vertex:zm,dithering_fragment:km,dithering_pars_fragment:Vm,roughnessmap_fragment:Hm,roughnessmap_pars_fragment:Gm,shadowmap_pars_fragment:Wm,shadowmap_pars_vertex:Xm,shadowmap_vertex:qm,shadowmask_pars_fragment:Ym,skinbase_vertex:Zm,skinning_pars_vertex:jm,skinning_vertex:$m,skinnormal_vertex:Km,specularmap_fragment:Jm,specularmap_pars_fragment:Qm,tonemapping_fragment:tg,tonemapping_pars_fragment:eg,transmission_fragment:ng,transmission_pars_fragment:ig,uv_pars_fragment:sg,uv_pars_vertex:rg,uv_vertex:og,worldpos_vertex:ag,background_vert:lg,background_frag:cg,backgroundCube_vert:hg,backgroundCube_frag:ug,cube_vert:dg,cube_frag:fg,depth_vert:pg,depth_frag:mg,distanceRGBA_vert:gg,distanceRGBA_frag:vg,equirect_vert:yg,equirect_frag:xg,linedashed_vert:_g,linedashed_frag:wg,meshbasic_vert:Mg,meshbasic_frag:Sg,meshlambert_vert:bg,meshlambert_frag:Eg,meshmatcap_vert:Ag,meshmatcap_frag:Tg,meshnormal_vert:Cg,meshnormal_frag:Rg,meshphong_vert:Pg,meshphong_frag:Ig,meshphysical_vert:Lg,meshphysical_frag:Ng,meshtoon_vert:Dg,meshtoon_frag:Fg,points_vert:Ug,points_frag:Bg,shadow_vert:Og,shadow_frag:zg,sprite_vert:kg,sprite_frag:Vg},Rt={common:{diffuse:{value:new $t(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new de},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new de}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new de}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new de}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new de},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new de},normalScale:{value:new re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new de},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new de}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new de}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new de}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new $t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0},uvTransform:{value:new de}},sprite:{diffuse:{value:new $t(16777215)},opacity:{value:1},center:{value:new re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new de},alphaMap:{value:null},alphaMapTransform:{value:new de},alphaTest:{value:0}}},Bn={basic:{uniforms:ln([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.fog]),vertexShader:ue.meshbasic_vert,fragmentShader:ue.meshbasic_frag},lambert:{uniforms:ln([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,Rt.lights,{emissive:{value:new $t(0)}}]),vertexShader:ue.meshlambert_vert,fragmentShader:ue.meshlambert_frag},phong:{uniforms:ln([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,Rt.lights,{emissive:{value:new $t(0)},specular:{value:new $t(1118481)},shininess:{value:30}}]),vertexShader:ue.meshphong_vert,fragmentShader:ue.meshphong_frag},standard:{uniforms:ln([Rt.common,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.roughnessmap,Rt.metalnessmap,Rt.fog,Rt.lights,{emissive:{value:new $t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag},toon:{uniforms:ln([Rt.common,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.gradientmap,Rt.fog,Rt.lights,{emissive:{value:new $t(0)}}]),vertexShader:ue.meshtoon_vert,fragmentShader:ue.meshtoon_frag},matcap:{uniforms:ln([Rt.common,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,{matcap:{value:null}}]),vertexShader:ue.meshmatcap_vert,fragmentShader:ue.meshmatcap_frag},points:{uniforms:ln([Rt.points,Rt.fog]),vertexShader:ue.points_vert,fragmentShader:ue.points_frag},dashed:{uniforms:ln([Rt.common,Rt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ue.linedashed_vert,fragmentShader:ue.linedashed_frag},depth:{uniforms:ln([Rt.common,Rt.displacementmap]),vertexShader:ue.depth_vert,fragmentShader:ue.depth_frag},normal:{uniforms:ln([Rt.common,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,{opacity:{value:1}}]),vertexShader:ue.meshnormal_vert,fragmentShader:ue.meshnormal_frag},sprite:{uniforms:ln([Rt.sprite,Rt.fog]),vertexShader:ue.sprite_vert,fragmentShader:ue.sprite_frag},background:{uniforms:{uvTransform:{value:new de},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ue.background_vert,fragmentShader:ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:ue.backgroundCube_vert,fragmentShader:ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ue.cube_vert,fragmentShader:ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ue.equirect_vert,fragmentShader:ue.equirect_frag},distanceRGBA:{uniforms:ln([Rt.common,Rt.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ue.distanceRGBA_vert,fragmentShader:ue.distanceRGBA_frag},shadow:{uniforms:ln([Rt.lights,Rt.fog,{color:{value:new $t(0)},opacity:{value:1}}]),vertexShader:ue.shadow_vert,fragmentShader:ue.shadow_frag}};Bn.physical={uniforms:ln([Bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new de},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new de},clearcoatNormalScale:{value:new re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new de},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new de},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new de},sheen:{value:0},sheenColor:{value:new $t(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new de},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new de},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new de},transmissionSamplerSize:{value:new re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new de},attenuationDistance:{value:0},attenuationColor:{value:new $t(0)},specularColor:{value:new $t(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new de},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new de},anisotropyVector:{value:new re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new de}}]),vertexShader:ue.meshphysical_vert,fragmentShader:ue.meshphysical_frag};var Kr={r:0,b:0,g:0};function Hg(r,t,e,n,i,s,o){let a=new $t(0),l=s===!0?0:1,c,h,d=null,u=0,f=null;function g(p,m){let x=!1,y=m.isScene===!0?m.background:null;y&&y.isTexture&&(y=(m.backgroundBlurriness>0?e:t).get(y)),y===null?v(a,l):y&&y.isColor&&(v(y,1),x=!0);let M=r.xr.getEnvironmentBlendMode();M==="additive"?n.buffers.color.setClear(0,0,0,1,o):M==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||x)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),y&&(y.isCubeTexture||y.mapping===Ho)?(h===void 0&&(h=new Fe(new rr(1,1,1),new Ke({name:"BackgroundCubeMaterial",uniforms:Rs(Bn.backgroundCube.uniforms),vertexShader:Bn.backgroundCube.vertexShader,fragmentShader:Bn.backgroundCube.fragmentShader,side:pn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,A,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,h.material.toneMapped=be.getTransfer(y.colorSpace)!==Te,(d!==y||u!==y.version||f!==r.toneMapping)&&(h.material.needsUpdate=!0,d=y,u=y.version,f=r.toneMapping),h.layers.enableAll(),p.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Fe(new Ps(2,2),new Ke({name:"BackgroundMaterial",uniforms:Rs(Bn.background.uniforms),vertexShader:Bn.background.vertexShader,fragmentShader:Bn.background.fragmentShader,side:xi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=be.getTransfer(y.colorSpace)!==Te,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(d!==y||u!==y.version||f!==r.toneMapping)&&(c.material.needsUpdate=!0,d=y,u=y.version,f=r.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function v(p,m){p.getRGB(Kr,Lu(r)),n.buffers.color.setClear(Kr.r,Kr.g,Kr.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,v(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,v(a,l)},render:g}}function Gg(r,t,e,n){let i=r.getParameter(r.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:t.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=p(null),c=l,h=!1;function d(L,U,O,it,$){let Z=!1;if(o){let rt=v(it,O,U);c!==rt&&(c=rt,f(c.object)),Z=m(L,it,O,$),Z&&x(L,it,O,$)}else{let rt=U.wireframe===!0;(c.geometry!==it.id||c.program!==O.id||c.wireframe!==rt)&&(c.geometry=it.id,c.program=O.id,c.wireframe=rt,Z=!0)}$!==null&&e.update($,r.ELEMENT_ARRAY_BUFFER),(Z||h)&&(h=!1,W(L,U,O,it),$!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get($).buffer))}function u(){return n.isWebGL2?r.createVertexArray():s.createVertexArrayOES()}function f(L){return n.isWebGL2?r.bindVertexArray(L):s.bindVertexArrayOES(L)}function g(L){return n.isWebGL2?r.deleteVertexArray(L):s.deleteVertexArrayOES(L)}function v(L,U,O){let it=O.wireframe===!0,$=a[L.id];$===void 0&&($={},a[L.id]=$);let Z=$[U.id];Z===void 0&&(Z={},$[U.id]=Z);let rt=Z[it];return rt===void 0&&(rt=p(u()),Z[it]=rt),rt}function p(L){let U=[],O=[],it=[];for(let $=0;$<i;$++)U[$]=0,O[$]=0,it[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:O,attributeDivisors:it,object:L,attributes:{},index:null}}function m(L,U,O,it){let $=c.attributes,Z=U.attributes,rt=0,lt=O.getAttributes();for(let st in lt)if(lt[st].location>=0){let ct=$[st],_t=Z[st];if(_t===void 0&&(st==="instanceMatrix"&&L.instanceMatrix&&(_t=L.instanceMatrix),st==="instanceColor"&&L.instanceColor&&(_t=L.instanceColor)),ct===void 0||ct.attribute!==_t||_t&&ct.data!==_t.data)return!0;rt++}return c.attributesNum!==rt||c.index!==it}function x(L,U,O,it){let $={},Z=U.attributes,rt=0,lt=O.getAttributes();for(let st in lt)if(lt[st].location>=0){let ct=Z[st];ct===void 0&&(st==="instanceMatrix"&&L.instanceMatrix&&(ct=L.instanceMatrix),st==="instanceColor"&&L.instanceColor&&(ct=L.instanceColor));let _t={};_t.attribute=ct,ct&&ct.data&&(_t.data=ct.data),$[st]=_t,rt++}c.attributes=$,c.attributesNum=rt,c.index=it}function y(){let L=c.newAttributes;for(let U=0,O=L.length;U<O;U++)L[U]=0}function M(L){I(L,0)}function I(L,U){let O=c.newAttributes,it=c.enabledAttributes,$=c.attributeDivisors;O[L]=1,it[L]===0&&(r.enableVertexAttribArray(L),it[L]=1),$[L]!==U&&((n.isWebGL2?r:t.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,U),$[L]=U)}function A(){let L=c.newAttributes,U=c.enabledAttributes;for(let O=0,it=U.length;O<it;O++)U[O]!==L[O]&&(r.disableVertexAttribArray(O),U[O]=0)}function P(L,U,O,it,$,Z,rt){rt===!0?r.vertexAttribIPointer(L,U,O,$,Z):r.vertexAttribPointer(L,U,O,it,$,Z)}function W(L,U,O,it){if(n.isWebGL2===!1&&(L.isInstancedMesh||it.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;y();let $=it.attributes,Z=O.getAttributes(),rt=U.defaultAttributeValues;for(let lt in Z){let st=Z[lt];if(st.location>=0){let tt=$[lt];if(tt===void 0&&(lt==="instanceMatrix"&&L.instanceMatrix&&(tt=L.instanceMatrix),lt==="instanceColor"&&L.instanceColor&&(tt=L.instanceColor)),tt!==void 0){let ct=tt.normalized,_t=tt.itemSize,yt=e.get(tt);if(yt===void 0)continue;let wt=yt.buffer,Tt=yt.type,at=yt.bytesPerElement,ft=n.isWebGL2===!0&&(Tt===r.INT||Tt===r.UNSIGNED_INT||tt.gpuType===wu);if(tt.isInterleavedBufferAttribute){let At=tt.data,q=At.stride,Ht=tt.offset;if(At.isInstancedInterleavedBuffer){for(let Ct=0;Ct<st.locationSize;Ct++)I(st.location+Ct,At.meshPerAttribute);L.isInstancedMesh!==!0&&it._maxInstanceCount===void 0&&(it._maxInstanceCount=At.meshPerAttribute*At.count)}else for(let Ct=0;Ct<st.locationSize;Ct++)M(st.location+Ct);r.bindBuffer(r.ARRAY_BUFFER,wt);for(let Ct=0;Ct<st.locationSize;Ct++)P(st.location+Ct,_t/st.locationSize,Tt,ct,q*at,(Ht+_t/st.locationSize*Ct)*at,ft)}else{if(tt.isInstancedBufferAttribute){for(let At=0;At<st.locationSize;At++)I(st.location+At,tt.meshPerAttribute);L.isInstancedMesh!==!0&&it._maxInstanceCount===void 0&&(it._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let At=0;At<st.locationSize;At++)M(st.location+At);r.bindBuffer(r.ARRAY_BUFFER,wt);for(let At=0;At<st.locationSize;At++)P(st.location+At,_t/st.locationSize,Tt,ct,_t*at,_t/st.locationSize*At*at,ft)}}else if(rt!==void 0){let ct=rt[lt];if(ct!==void 0)switch(ct.length){case 2:r.vertexAttrib2fv(st.location,ct);break;case 3:r.vertexAttrib3fv(st.location,ct);break;case 4:r.vertexAttrib4fv(st.location,ct);break;default:r.vertexAttrib1fv(st.location,ct)}}}}A()}function S(){Y();for(let L in a){let U=a[L];for(let O in U){let it=U[O];for(let $ in it)g(it[$].object),delete it[$];delete U[O]}delete a[L]}}function b(L){if(a[L.id]===void 0)return;let U=a[L.id];for(let O in U){let it=U[O];for(let $ in it)g(it[$].object),delete it[$];delete U[O]}delete a[L.id]}function V(L){for(let U in a){let O=a[U];if(O[L.id]===void 0)continue;let it=O[L.id];for(let $ in it)g(it[$].object),delete it[$];delete O[L.id]}}function Y(){X(),h=!0,c!==l&&(c=l,f(c.object))}function X(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:Y,resetDefaultState:X,dispose:S,releaseStatesOfGeometry:b,releaseStatesOfProgram:V,initAttributes:y,enableAttribute:M,disableUnusedAttributes:A}}function Wg(r,t,e,n){let i=n.isWebGL2,s;function o(h){s=h}function a(h,d){r.drawArrays(s,h,d),e.update(d,s,1)}function l(h,d,u){if(u===0)return;let f,g;if(i)f=r,g="drawArraysInstanced";else if(f=t.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[g](s,h,d,u),e.update(d,s,u)}function c(h,d,u){if(u===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<u;g++)this.render(h[g],d[g]);else{f.multiDrawArraysWEBGL(s,h,0,d,0,u);let g=0;for(let v=0;v<u;v++)g+=d[v];e.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Xg(r,t,e){let n;function i(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");n=r.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(P){if(P==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext",a=e.precision!==void 0?e.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||t.has("WEBGL_draw_buffers"),h=e.logarithmicDepthBuffer===!0,d=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),u=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),v=r.getParameter(r.MAX_VERTEX_ATTRIBS),p=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),m=r.getParameter(r.MAX_VARYING_VECTORS),x=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),y=u>0,M=o||t.has("OES_texture_float"),I=y&&M,A=o?r.getParameter(r.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:i,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:u,maxTextureSize:f,maxCubemapSize:g,maxAttributes:v,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:x,vertexTextures:y,floatFragmentTextures:M,floatVertexTextures:I,maxSamples:A}}function qg(r){let t=this,e=null,n=0,i=!1,s=!1,o=new Sn,a=new de,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||n!==0||i;return i=u,n=d.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,v=d.clipIntersection,p=d.clipShadows,m=r.get(d);if(!i||g===null||g.length===0||s&&!p)s?h(null):c();else{let x=s?0:n,y=x*4,M=m.clippingState||null;l.value=M,M=h(g,u,y,f);for(let I=0;I!==y;++I)M[I]=e[I];m.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,f,g){let v=d!==null?d.length:0,p=null;if(v!==0){if(p=l.value,g!==!0||p===null){let m=f+v*4,x=u.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<m)&&(p=new Float32Array(m));for(let y=0,M=f;y!==v;++y,M+=4)o.copy(d[y]).applyMatrix4(x,a),o.normal.toArray(p,M),p[M+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}function Yg(r){let t=new WeakMap;function e(o,a){return a===nr?o.mapping=Ms:a===el&&(o.mapping=Ss),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===nr||a===el)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new ll(l.height/2);return c.fromEquirectangularTexture(r,o),t.set(o,c),o.addEventListener("dispose",i),e(c.texture,o.mapping)}else return null}}return o}function i(o){let a=o.target;a.removeEventListener("dispose",i);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function s(){t=new WeakMap}return{get:n,dispose:s}}var bi=class extends vo{constructor(t=-1,e=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},gs=4,Dh=[.125,.215,.35,.446,.526,.582],Hi=20,Ga=new bi,Fh=new $t,Wa=null,Xa=0,qa=0,Vi=(1+Math.sqrt(5))/2,fs=1/Vi,Uh=[new G(1,1,1),new G(-1,1,1),new G(1,1,-1),new G(-1,1,-1),new G(0,Vi,fs),new G(0,Vi,-fs),new G(fs,0,Vi),new G(-fs,0,Vi),new G(Vi,fs,0),new G(-Vi,fs,0)],xo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){Wa=this._renderer.getRenderTarget(),Xa=this._renderer.getActiveCubeFace(),qa=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,n,i,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=zh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Oh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Wa,Xa,qa),t.scissorTest=!1,Jr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ms||t.mapping===Ss?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Wa=this._renderer.getRenderTarget(),Xa=this._renderer.getActiveCubeFace(),qa=this._renderer.getActiveMipmapLevel();let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ye,minFilter:Ye,generateMipmaps:!1,type:cn,format:dn,colorSpace:bn,depthBuffer:!1},i=Bh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bh(t,e,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zg(s)),this._blurMaterial=jg(s,t,e)}return i}_compileMaterial(t){let e=new Fe(this._lodPlanes[0],t);this._renderer.compile(e,Ga)}_sceneToCubeUV(t,e,n,i){let a=new He(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,u=h.toneMapping;h.getClearColor(Fh),h.toneMapping=vi,h.autoClear=!1;let f=new Ts({name:"PMREM.Background",side:pn,depthWrite:!1,depthTest:!1}),g=new Fe(new rr,f),v=!1,p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,v=!0):(f.color.copy(Fh),v=!0);for(let m=0;m<6;m++){let x=m%3;x===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):x===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let y=this._cubeSize;Jr(i,x*y,m>2?y:0,y,y),h.setRenderTarget(i),v&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=u,h.autoClear=d,t.background=p}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===Ms||t.mapping===Ss;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=zh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Oh());let s=i?this._cubemapMaterial:this._equirectMaterial,o=new Fe(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=t;let l=this._cubeSize;Jr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Ga)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){let s=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),o=Uh[(i-1)%Uh.length];this._blur(t,i-1,i,s,o)}e.autoClear=n}_blur(t,e,n,i,s){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",s),this._halfBlur(o,t,n,n,i,"longitudinal",s)}_halfBlur(t,e,n,i,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,d=new Fe(this._lodPlanes[i],c),u=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Hi-1),v=s/g,p=isFinite(s)?1+Math.floor(h*v):Hi;p>Hi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Hi}`);let m=[],x=0;for(let P=0;P<Hi;++P){let W=P/v,S=Math.exp(-W*W/2);m.push(S),P===0?x+=S:P<p&&(x+=2*S)}for(let P=0;P<m.length;P++)m[P]=m[P]/x;u.envMap.value=t.texture,u.samples.value=p,u.weights.value=m,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);let{_lodMax:y}=this;u.dTheta.value=g,u.mipInt.value=y-n;let M=this._sizeLods[i],I=3*M*(i>y-gs?i-y+gs:0),A=4*(this._cubeSize-M);Jr(e,I,A,3*M,2*M),l.setRenderTarget(e),l.render(d,Ga)}};function Zg(r){let t=[],e=[],n=[],i=r,s=r-gs+1+Dh.length;for(let o=0;o<s;o++){let a=Math.pow(2,i);e.push(a);let l=1/a;o>r-gs?l=Dh[o-r+gs-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,v=3,p=2,m=1,x=new Float32Array(v*g*f),y=new Float32Array(p*g*f),M=new Float32Array(m*g*f);for(let A=0;A<f;A++){let P=A%3*2/3-1,W=A>2?0:-1,S=[P,W,0,P+2/3,W,0,P+2/3,W+1,0,P,W,0,P+2/3,W+1,0,P,W+1,0];x.set(S,v*g*A),y.set(u,p*g*A);let b=[A,A,A,A,A,A];M.set(b,m*g*A)}let I=new tn;I.setAttribute("position",new Qe(x,v)),I.setAttribute("uv",new Qe(y,p)),I.setAttribute("faceIndex",new Qe(M,m)),t.push(I),i>gs&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Bh(r,t,e){let n=new mn(r,t,e);return n.texture.mapping=Ho,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Jr(r,t,e,n,i){r.viewport.set(t,e,n,i),r.scissor.set(t,e,n,i)}function jg(r,t,e){let n=new Float32Array(Hi),i=new G(0,1,0);return new Ke({name:"SphericalGaussianBlur",defines:{n:Hi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:jl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:je,depthTest:!1,depthWrite:!1})}function Oh(){return new Ke({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:jl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:je,depthTest:!1,depthWrite:!1})}function zh(){return new Ke({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:je,depthTest:!1,depthWrite:!1})}function jl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function $g(r){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===nr||l===el,h=l===Ms||l===Ss;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let d=t.get(a);return e===null&&(e=new xo(r)),d=c?e.fromEquirectangular(a,d):e.fromCubemap(a,d),t.set(a,d),d.texture}else{if(t.has(a))return t.get(a).texture;{let d=a.image;if(c&&d&&d.height>0||h&&d&&i(d)){e===null&&(e=new xo(r));let u=c?e.fromEquirectangular(a):e.fromCubemap(a);return t.set(a,u),a.addEventListener("dispose",s),u.texture}else return null}}}return a}function i(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Kg(r){let t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(n){n.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(n){let i=e(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Jg(r,t,e,n){let i={},s=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);for(let g in u.morphAttributes){let v=u.morphAttributes[g];for(let p=0,m=v.length;p<m;p++)t.remove(v[p])}u.removeEventListener("dispose",o),delete i[u.id];let f=s.get(u);f&&(t.remove(f),s.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return i[u.id]===!0||(u.addEventListener("dispose",o),i[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let g in u)t.update(u[g],r.ARRAY_BUFFER);let f=d.morphAttributes;for(let g in f){let v=f[g];for(let p=0,m=v.length;p<m;p++)t.update(v[p],r.ARRAY_BUFFER)}}function c(d){let u=[],f=d.index,g=d.attributes.position,v=0;if(f!==null){let x=f.array;v=f.version;for(let y=0,M=x.length;y<M;y+=3){let I=x[y+0],A=x[y+1],P=x[y+2];u.push(I,A,A,P,P,I)}}else if(g!==void 0){let x=g.array;v=g.version;for(let y=0,M=x.length/3-1;y<M;y+=3){let I=y+0,A=y+1,P=y+2;u.push(I,A,A,P,P,I)}}else return;let p=new(Pu(u)?go:Cs)(u,1);p.version=v;let m=s.get(d);m&&t.remove(m),s.set(d,p)}function h(d){let u=s.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return s.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function Qg(r,t,e,n){let i=n.isWebGL2,s;function o(f){s=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function h(f,g){r.drawElements(s,g,a,f*l),e.update(g,s,1)}function d(f,g,v){if(v===0)return;let p,m;if(i)p=r,m="drawElementsInstanced";else if(p=t.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,f*l,v),e.update(g,s,v)}function u(f,g,v){if(v===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<v;m++)this.render(f[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,f,0,v);let m=0;for(let x=0;x<v;x++)m+=g[x];e.update(m,s,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=d,this.renderMultiDraw=u}function t0(r){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function e0(r,t){return r[0]-t[0]}function n0(r,t){return Math.abs(t[1])-Math.abs(r[1])}function i0(r,t,e){let n={},i=new Float32Array(8),s=new WeakMap,o=new ve,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,d){let u=c.morphTargetInfluences;if(t.isWebGL2===!0){let f=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=f!==void 0?f.length:0,v=s.get(h);if(v===void 0||v.count!==g){let L=function(){Y.dispose(),s.delete(h),h.removeEventListener("dispose",L)};v!==void 0&&v.texture.dispose();let x=h.morphAttributes.position!==void 0,y=h.morphAttributes.normal!==void 0,M=h.morphAttributes.color!==void 0,I=h.morphAttributes.position||[],A=h.morphAttributes.normal||[],P=h.morphAttributes.color||[],W=0;x===!0&&(W=1),y===!0&&(W=2),M===!0&&(W=3);let S=h.attributes.position.count*W,b=1;S>t.maxTextureSize&&(b=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let V=new Float32Array(S*b*4*g),Y=new mo(V,S,b,g);Y.type=Je,Y.needsUpdate=!0;let X=W*4;for(let U=0;U<g;U++){let O=I[U],it=A[U],$=P[U],Z=S*b*4*U;for(let rt=0;rt<O.count;rt++){let lt=rt*X;x===!0&&(o.fromBufferAttribute(O,rt),V[Z+lt+0]=o.x,V[Z+lt+1]=o.y,V[Z+lt+2]=o.z,V[Z+lt+3]=0),y===!0&&(o.fromBufferAttribute(it,rt),V[Z+lt+4]=o.x,V[Z+lt+5]=o.y,V[Z+lt+6]=o.z,V[Z+lt+7]=0),M===!0&&(o.fromBufferAttribute($,rt),V[Z+lt+8]=o.x,V[Z+lt+9]=o.y,V[Z+lt+10]=o.z,V[Z+lt+11]=$.itemSize===4?o.w:1)}}v={count:g,texture:Y,size:new re(S,b)},s.set(h,v),h.addEventListener("dispose",L)}let p=0;for(let x=0;x<u.length;x++)p+=u[x];let m=h.morphTargetsRelative?1:1-p;d.getUniforms().setValue(r,"morphTargetBaseInfluence",m),d.getUniforms().setValue(r,"morphTargetInfluences",u),d.getUniforms().setValue(r,"morphTargetsTexture",v.texture,e),d.getUniforms().setValue(r,"morphTargetsTextureSize",v.size)}else{let f=u===void 0?0:u.length,g=n[h.id];if(g===void 0||g.length!==f){g=[];for(let y=0;y<f;y++)g[y]=[y,0];n[h.id]=g}for(let y=0;y<f;y++){let M=g[y];M[0]=y,M[1]=u[y]}g.sort(n0);for(let y=0;y<8;y++)y<f&&g[y][1]?(a[y][0]=g[y][0],a[y][1]=g[y][1]):(a[y][0]=Number.MAX_SAFE_INTEGER,a[y][1]=0);a.sort(e0);let v=h.morphAttributes.position,p=h.morphAttributes.normal,m=0;for(let y=0;y<8;y++){let M=a[y],I=M[0],A=M[1];I!==Number.MAX_SAFE_INTEGER&&A?(v&&h.getAttribute("morphTarget"+y)!==v[I]&&h.setAttribute("morphTarget"+y,v[I]),p&&h.getAttribute("morphNormal"+y)!==p[I]&&h.setAttribute("morphNormal"+y,p[I]),i[y]=A,m+=A):(v&&h.hasAttribute("morphTarget"+y)===!0&&h.deleteAttribute("morphTarget"+y),p&&h.hasAttribute("morphNormal"+y)===!0&&h.deleteAttribute("morphNormal"+y),i[y]=0)}let x=h.morphTargetsRelative?1:1-m;d.getUniforms().setValue(r,"morphTargetBaseInfluence",x),d.getUniforms().setValue(r,"morphTargetInfluences",i)}}return{update:l}}function s0(r,t,e,n){let i=new WeakMap;function s(l){let c=n.render.frame,h=l.geometry,d=t.get(l,h);if(i.get(d)!==c&&(t.update(d),i.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(e.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){let u=l.skeleton;i.get(u)!==c&&(u.update(),i.set(u,c))}return d}function o(){i=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:s,dispose:o}}var Is=class extends $e{constructor(t,e,n,i,s,o,a,l,c,h){if(h=h!==void 0?h:Gi,h!==Gi&&h!==_i)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Gi&&(n=gi),n===void 0&&h===_i&&(n=ti),super(null,i,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:ke,this.minFilter=l!==void 0?l:ke,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Du=new $e,Fu=new Is(1,1);Fu.compareFunction=Ru;var Uu=new mo,Bu=new ol,Ou=new yo,kh=[],Vh=[],Hh=new Float32Array(16),Gh=new Float32Array(9),Wh=new Float32Array(4);function zs(r,t,e){let n=r[0];if(n<=0||n>0)return r;let i=t*e,s=kh[i];if(s===void 0&&(s=new Float32Array(i),kh[i]=s),t!==0){n.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function Ge(r,t){if(r.length!==t.length)return!1;for(let e=0,n=r.length;e<n;e++)if(r[e]!==t[e])return!1;return!0}function We(r,t){for(let e=0,n=t.length;e<n;e++)r[e]=t[e]}function Wo(r,t){let e=Vh[t];e===void 0&&(e=new Int32Array(t),Vh[t]=e);for(let n=0;n!==t;++n)e[n]=r.allocateTextureUnit();return e}function r0(r,t){let e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function o0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;r.uniform2fv(this.addr,t),We(e,t)}}function a0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ge(e,t))return;r.uniform3fv(this.addr,t),We(e,t)}}function l0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;r.uniform4fv(this.addr,t),We(e,t)}}function c0(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),We(e,t)}else{if(Ge(e,n))return;Wh.set(n),r.uniformMatrix2fv(this.addr,!1,Wh),We(e,n)}}function h0(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),We(e,t)}else{if(Ge(e,n))return;Gh.set(n),r.uniformMatrix3fv(this.addr,!1,Gh),We(e,n)}}function u0(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),We(e,t)}else{if(Ge(e,n))return;Hh.set(n),r.uniformMatrix4fv(this.addr,!1,Hh),We(e,n)}}function d0(r,t){let e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function f0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;r.uniform2iv(this.addr,t),We(e,t)}}function p0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;r.uniform3iv(this.addr,t),We(e,t)}}function m0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;r.uniform4iv(this.addr,t),We(e,t)}}function g0(r,t){let e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function v0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;r.uniform2uiv(this.addr,t),We(e,t)}}function y0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;r.uniform3uiv(this.addr,t),We(e,t)}}function x0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;r.uniform4uiv(this.addr,t),We(e,t)}}function _0(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s=this.type===r.SAMPLER_2D_SHADOW?Fu:Du;e.setTexture2D(t||s,i)}function w0(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Bu,i)}function M0(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Ou,i)}function S0(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Uu,i)}function b0(r){switch(r){case 5126:return r0;case 35664:return o0;case 35665:return a0;case 35666:return l0;case 35674:return c0;case 35675:return h0;case 35676:return u0;case 5124:case 35670:return d0;case 35667:case 35671:return f0;case 35668:case 35672:return p0;case 35669:case 35673:return m0;case 5125:return g0;case 36294:return v0;case 36295:return y0;case 36296:return x0;case 35678:case 36198:case 36298:case 36306:case 35682:return _0;case 35679:case 36299:case 36307:return w0;case 35680:case 36300:case 36308:case 36293:return M0;case 36289:case 36303:case 36311:case 36292:return S0}}function E0(r,t){r.uniform1fv(this.addr,t)}function A0(r,t){let e=zs(t,this.size,2);r.uniform2fv(this.addr,e)}function T0(r,t){let e=zs(t,this.size,3);r.uniform3fv(this.addr,e)}function C0(r,t){let e=zs(t,this.size,4);r.uniform4fv(this.addr,e)}function R0(r,t){let e=zs(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function P0(r,t){let e=zs(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function I0(r,t){let e=zs(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function L0(r,t){r.uniform1iv(this.addr,t)}function N0(r,t){r.uniform2iv(this.addr,t)}function D0(r,t){r.uniform3iv(this.addr,t)}function F0(r,t){r.uniform4iv(this.addr,t)}function U0(r,t){r.uniform1uiv(this.addr,t)}function B0(r,t){r.uniform2uiv(this.addr,t)}function O0(r,t){r.uniform3uiv(this.addr,t)}function z0(r,t){r.uniform4uiv(this.addr,t)}function k0(r,t,e){let n=this.cache,i=t.length,s=Wo(e,i);Ge(n,s)||(r.uniform1iv(this.addr,s),We(n,s));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||Du,s[o])}function V0(r,t,e){let n=this.cache,i=t.length,s=Wo(e,i);Ge(n,s)||(r.uniform1iv(this.addr,s),We(n,s));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||Bu,s[o])}function H0(r,t,e){let n=this.cache,i=t.length,s=Wo(e,i);Ge(n,s)||(r.uniform1iv(this.addr,s),We(n,s));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Ou,s[o])}function G0(r,t,e){let n=this.cache,i=t.length,s=Wo(e,i);Ge(n,s)||(r.uniform1iv(this.addr,s),We(n,s));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Uu,s[o])}function W0(r){switch(r){case 5126:return E0;case 35664:return A0;case 35665:return T0;case 35666:return C0;case 35674:return R0;case 35675:return P0;case 35676:return I0;case 5124:case 35670:return L0;case 35667:case 35671:return N0;case 35668:case 35672:return D0;case 35669:case 35673:return F0;case 5125:return U0;case 36294:return B0;case 36295:return O0;case 36296:return z0;case 35678:case 36198:case 36298:case 36306:case 35682:return k0;case 35679:case 36299:case 36307:return V0;case 35680:case 36300:case 36308:case 36293:return H0;case 36289:case 36303:case 36311:case 36292:return G0}}var cl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=b0(e.type)}},hl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=W0(e.type)}},ul=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let s=0,o=i.length;s!==o;++s){let a=i[s];a.setValue(t,e[a.id],n)}}},Ya=/(\w+)(\])?(\[|\.)?/g;function Xh(r,t){r.seq.push(t),r.map[t.id]=t}function X0(r,t,e){let n=r.name,i=n.length;for(Ya.lastIndex=0;;){let s=Ya.exec(n),o=Ya.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Xh(e,c===void 0?new cl(a,r,t):new hl(a,r,t));break}else{let d=e.map[a];d===void 0&&(d=new ul(a),Xh(e,d)),e=d}}}var ws=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=t.getActiveUniform(e,i),o=t.getUniformLocation(e,s.name);X0(s,o,this)}}setValue(t,e,n,i){let s=this.map[e];s!==void 0&&s.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,o=e.length;s!==o;++s){let a=e[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,s=t.length;i!==s;++i){let o=t[i];o.id in e&&n.push(o)}return n}};function qh(r,t,e){let n=r.createShader(t);return r.shaderSource(n,e),r.compileShader(n),n}var q0=37297,Y0=0;function Z0(r,t){let e=r.split(`
`),n=[],i=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=i;o<s;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function j0(r){let t=be.getPrimaries(be.workingColorSpace),e=be.getPrimaries(r),n;switch(t===e?n="":t===co&&e===lo?n="LinearDisplayP3ToLinearSRGB":t===lo&&e===co&&(n="LinearSRGBToLinearDisplayP3"),r){case bn:case Go:return[n,"LinearTransferOETF"];case Ce:case Xl:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[n,"LinearTransferOETF"]}}function Yh(r,t,e){let n=r.getShaderParameter(t,r.COMPILE_STATUS),i=r.getShaderInfoLog(t).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let o=parseInt(s[1]);return e.toUpperCase()+`

`+i+`

`+Z0(r.getShaderSource(t),o)}else return i}function $0(r,t){let e=j0(t);return`vec4 ${r}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function K0(r,t){let e;switch(t){case Ol:e="Linear";break;case zl:e="Reinhard";break;case kl:e="OptimizedCineon";break;case Vl:e="ACESFilmic";break;case Hl:e="AgX";break;case rf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function J0(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.normalMapTangentSpace||r.clearcoatNormalMap||r.flatShading||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(vs).join(`
`)}function Q0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(vs).join(`
`)}function tv(r){let t=[];for(let e in r){let n=r[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function ev(r,t){let e={},n=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let s=r.getActiveAttrib(t,i),o=s.name,a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function vs(r){return r!==""}function Zh(r,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jh(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var nv=/^[ \t]*#include +<([\w\d./]+)>/gm;function dl(r){return r.replace(nv,sv)}var iv=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function sv(r,t){let e=ue[t];if(e===void 0){let n=iv.get(t);if(n!==void 0)e=ue[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return dl(e)}var rv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $h(r){return r.replace(rv,ov)}function ov(r,t,e,n){let i="";for(let s=parseInt(t);s<parseInt(e);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Kh(r){let t="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function av(r){let t="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===xu?t="SHADOWMAP_TYPE_PCF":r.shadowMapType===Dl?t="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===$n&&(t="SHADOWMAP_TYPE_VSM"),t}function lv(r){let t="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Ms:case Ss:t="ENVMAP_TYPE_CUBE";break;case Ho:t="ENVMAP_TYPE_CUBE_UV";break}return t}function cv(r){let t="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Ss:t="ENVMAP_MODE_REFRACTION";break}return t}function hv(r){let t="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case Vo:t="ENVMAP_BLENDING_MULTIPLY";break;case nf:t="ENVMAP_BLENDING_MIX";break;case sf:t="ENVMAP_BLENDING_ADD";break}return t}function uv(r){let t=r.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function dv(r,t,e,n){let i=r.getContext(),s=e.defines,o=e.vertexShader,a=e.fragmentShader,l=av(e),c=lv(e),h=cv(e),d=hv(e),u=uv(e),f=e.isWebGL2?"":J0(e),g=Q0(e),v=tv(s),p=i.createProgram(),m,x,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v].filter(vs).join(`
`),m.length>0&&(m+=`
`),x=[f,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v].filter(vs).join(`
`),x.length>0&&(x+=`
`)):(m=[Kh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vs).join(`
`),x=[f,Kh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==vi?"#define TONE_MAPPING":"",e.toneMapping!==vi?ue.tonemapping_pars_fragment:"",e.toneMapping!==vi?K0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ue.colorspace_pars_fragment,$0("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(vs).join(`
`)),o=dl(o),o=Zh(o,e),o=jh(o,e),a=dl(a),a=Zh(a,e),a=jh(a,e),o=$h(o),a=$h(a),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,x=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===gh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===gh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+x);let M=y+m+o,I=y+x+a,A=qh(i,i.VERTEX_SHADER,M),P=qh(i,i.FRAGMENT_SHADER,I);i.attachShader(p,A),i.attachShader(p,P),e.index0AttributeName!==void 0?i.bindAttribLocation(p,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(p,0,"position"),i.linkProgram(p);function W(Y){if(r.debug.checkShaderErrors){let X=i.getProgramInfoLog(p).trim(),L=i.getShaderInfoLog(A).trim(),U=i.getShaderInfoLog(P).trim(),O=!0,it=!0;if(i.getProgramParameter(p,i.LINK_STATUS)===!1)if(O=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,p,A,P);else{let $=Yh(i,A,"vertex"),Z=Yh(i,P,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(p,i.VALIDATE_STATUS)+`

Program Info Log: `+X+`
`+$+`
`+Z)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):(L===""||U==="")&&(it=!1);it&&(Y.diagnostics={runnable:O,programLog:X,vertexShader:{log:L,prefix:m},fragmentShader:{log:U,prefix:x}})}i.deleteShader(A),i.deleteShader(P),S=new ws(i,p),b=ev(i,p)}let S;this.getUniforms=function(){return S===void 0&&W(this),S};let b;this.getAttributes=function(){return b===void 0&&W(this),b};let V=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return V===!1&&(V=i.getProgramParameter(p,q0)),V},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Y0++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=A,this.fragmentShader=P,this}var fv=0,fl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new pl(t),e.set(t,n)),n}},pl=class{constructor(t){this.id=fv++,this.code=t,this.usedTimes=0}};function pv(r,t,e,n,i,s,o){let a=new sr,l=new fl,c=[],h=i.isWebGL2,d=i.logarithmicDepthBuffer,u=i.vertexTextures,f=i.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return S===0?"uv":`uv${S}`}function p(S,b,V,Y,X){let L=Y.fog,U=X.geometry,O=S.isMeshStandardMaterial?Y.environment:null,it=(S.isMeshStandardMaterial?e:t).get(S.envMap||O),$=it&&it.mapping===Ho?it.image.height:null,Z=g[S.type];S.precision!==null&&(f=i.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));let rt=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,lt=rt!==void 0?rt.length:0,st=0;U.morphAttributes.position!==void 0&&(st=1),U.morphAttributes.normal!==void 0&&(st=2),U.morphAttributes.color!==void 0&&(st=3);let tt,ct,_t,yt;if(Z){let Be=Bn[Z];tt=Be.vertexShader,ct=Be.fragmentShader}else tt=S.vertexShader,ct=S.fragmentShader,l.update(S),_t=l.getVertexShaderID(S),yt=l.getFragmentShaderID(S);let wt=r.getRenderTarget(),Tt=X.isInstancedMesh===!0,at=X.isBatchedMesh===!0,ft=!!S.map,At=!!S.matcap,q=!!it,Ht=!!S.aoMap,Ct=!!S.lightMap,kt=!!S.bumpMap,Mt=!!S.normalMap,ce=!!S.displacementMap,Zt=!!S.emissiveMap,N=!!S.metalnessMap,T=!!S.roughnessMap,Q=S.anisotropy>0,gt=S.clearcoat>0,ut=S.iridescence>0,mt=S.sheen>0,It=S.transmission>0,St=Q&&!!S.anisotropyMap,Pt=gt&&!!S.clearcoatMap,Ot=gt&&!!S.clearcoatNormalMap,Gt=gt&&!!S.clearcoatRoughnessMap,vt=ut&&!!S.iridescenceMap,fe=ut&&!!S.iridescenceThicknessMap,ae=mt&&!!S.sheenColorMap,Kt=mt&&!!S.sheenRoughnessMap,Ut=!!S.specularMap,Dt=!!S.specularColorMap,Vt=!!S.specularIntensityMap,Qt=It&&!!S.transmissionMap,ne=It&&!!S.thicknessMap,te=!!S.gradientMap,K=!!S.alphaMap,H=S.alphaTest>0,Lt=!!S.alphaHash,Nt=!!S.extensions,ee=!!U.attributes.uv1,Jt=!!U.attributes.uv2,xe=!!U.attributes.uv3,ye=vi;return S.toneMapped&&(wt===null||wt.isXRRenderTarget===!0)&&(ye=r.toneMapping),{isWebGL2:h,shaderID:Z,shaderType:S.type,shaderName:S.name,vertexShader:tt,fragmentShader:ct,defines:S.defines,customVertexShaderID:_t,customFragmentShaderID:yt,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:at,instancing:Tt,instancingColor:Tt&&X.instanceColor!==null,supportsVertexTextures:u,outputColorSpace:wt===null?r.outputColorSpace:wt.isXRRenderTarget===!0?wt.texture.colorSpace:bn,map:ft,matcap:At,envMap:q,envMapMode:q&&it.mapping,envMapCubeUVHeight:$,aoMap:Ht,lightMap:Ct,bumpMap:kt,normalMap:Mt,displacementMap:u&&ce,emissiveMap:Zt,normalMapObjectSpace:Mt&&S.normalMapType===vf,normalMapTangentSpace:Mt&&S.normalMapType===vr,metalnessMap:N,roughnessMap:T,anisotropy:Q,anisotropyMap:St,clearcoat:gt,clearcoatMap:Pt,clearcoatNormalMap:Ot,clearcoatRoughnessMap:Gt,iridescence:ut,iridescenceMap:vt,iridescenceThicknessMap:fe,sheen:mt,sheenColorMap:ae,sheenRoughnessMap:Kt,specularMap:Ut,specularColorMap:Dt,specularIntensityMap:Vt,transmission:It,transmissionMap:Qt,thicknessMap:ne,gradientMap:te,opaque:S.transparent===!1&&S.blending===xs,alphaMap:K,alphaTest:H,alphaHash:Lt,combine:S.combine,mapUv:ft&&v(S.map.channel),aoMapUv:Ht&&v(S.aoMap.channel),lightMapUv:Ct&&v(S.lightMap.channel),bumpMapUv:kt&&v(S.bumpMap.channel),normalMapUv:Mt&&v(S.normalMap.channel),displacementMapUv:ce&&v(S.displacementMap.channel),emissiveMapUv:Zt&&v(S.emissiveMap.channel),metalnessMapUv:N&&v(S.metalnessMap.channel),roughnessMapUv:T&&v(S.roughnessMap.channel),anisotropyMapUv:St&&v(S.anisotropyMap.channel),clearcoatMapUv:Pt&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:Ot&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Gt&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:vt&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:fe&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:Kt&&v(S.sheenRoughnessMap.channel),specularMapUv:Ut&&v(S.specularMap.channel),specularColorMapUv:Dt&&v(S.specularColorMap.channel),specularIntensityMapUv:Vt&&v(S.specularIntensityMap.channel),transmissionMapUv:Qt&&v(S.transmissionMap.channel),thicknessMapUv:ne&&v(S.thicknessMap.channel),alphaMapUv:K&&v(S.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(Mt||Q),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,vertexUv1s:ee,vertexUv2s:Jt,vertexUv3s:xe,pointsUvs:X.isPoints===!0&&!!U.attributes.uv&&(ft||K),fog:!!L,useFog:S.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:X.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:lt,morphTextureStride:st,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:r.shadowMap.enabled&&V.length>0,shadowMapType:r.shadowMap.type,toneMapping:ye,useLegacyLights:r._useLegacyLights,decodeVideoTexture:ft&&S.map.isVideoTexture===!0&&be.getTransfer(S.map.colorSpace)===Te,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Nn,flipSided:S.side===pn,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionDerivatives:Nt&&S.extensions.derivatives===!0,extensionFragDepth:Nt&&S.extensions.fragDepth===!0,extensionDrawBuffers:Nt&&S.extensions.drawBuffers===!0,extensionShaderTextureLOD:Nt&&S.extensions.shaderTextureLOD===!0,extensionClipCullDistance:Nt&&S.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()}}function m(S){let b=[];if(S.shaderID?b.push(S.shaderID):(b.push(S.customVertexShaderID),b.push(S.customFragmentShaderID)),S.defines!==void 0)for(let V in S.defines)b.push(V),b.push(S.defines[V]);return S.isRawShaderMaterial===!1&&(x(b,S),y(b,S),b.push(r.outputColorSpace)),b.push(S.customProgramCacheKey),b.join()}function x(S,b){S.push(b.precision),S.push(b.outputColorSpace),S.push(b.envMapMode),S.push(b.envMapCubeUVHeight),S.push(b.mapUv),S.push(b.alphaMapUv),S.push(b.lightMapUv),S.push(b.aoMapUv),S.push(b.bumpMapUv),S.push(b.normalMapUv),S.push(b.displacementMapUv),S.push(b.emissiveMapUv),S.push(b.metalnessMapUv),S.push(b.roughnessMapUv),S.push(b.anisotropyMapUv),S.push(b.clearcoatMapUv),S.push(b.clearcoatNormalMapUv),S.push(b.clearcoatRoughnessMapUv),S.push(b.iridescenceMapUv),S.push(b.iridescenceThicknessMapUv),S.push(b.sheenColorMapUv),S.push(b.sheenRoughnessMapUv),S.push(b.specularMapUv),S.push(b.specularColorMapUv),S.push(b.specularIntensityMapUv),S.push(b.transmissionMapUv),S.push(b.thicknessMapUv),S.push(b.combine),S.push(b.fogExp2),S.push(b.sizeAttenuation),S.push(b.morphTargetsCount),S.push(b.morphAttributeCount),S.push(b.numDirLights),S.push(b.numPointLights),S.push(b.numSpotLights),S.push(b.numSpotLightMaps),S.push(b.numHemiLights),S.push(b.numRectAreaLights),S.push(b.numDirLightShadows),S.push(b.numPointLightShadows),S.push(b.numSpotLightShadows),S.push(b.numSpotLightShadowsWithMaps),S.push(b.numLightProbes),S.push(b.shadowMapType),S.push(b.toneMapping),S.push(b.numClippingPlanes),S.push(b.numClipIntersection),S.push(b.depthPacking)}function y(S,b){a.disableAll(),b.isWebGL2&&a.enable(0),b.supportsVertexTextures&&a.enable(1),b.instancing&&a.enable(2),b.instancingColor&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),S.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.skinning&&a.enable(4),b.morphTargets&&a.enable(5),b.morphNormals&&a.enable(6),b.morphColors&&a.enable(7),b.premultipliedAlpha&&a.enable(8),b.shadowMapEnabled&&a.enable(9),b.useLegacyLights&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),S.push(a.mask)}function M(S){let b=g[S.type],V;if(b){let Y=Bn[b];V=kn.clone(Y.uniforms)}else V=S.uniforms;return V}function I(S,b){let V;for(let Y=0,X=c.length;Y<X;Y++){let L=c[Y];if(L.cacheKey===b){V=L,++V.usedTimes;break}}return V===void 0&&(V=new dv(r,b,S,s),c.push(V)),V}function A(S){if(--S.usedTimes===0){let b=c.indexOf(S);c[b]=c[c.length-1],c.pop(),S.destroy()}}function P(S){l.remove(S)}function W(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:M,acquireProgram:I,releaseProgram:A,releaseShaderCache:P,programs:c,dispose:W}}function mv(){let r=new WeakMap;function t(s){let o=r.get(s);return o===void 0&&(o={},r.set(s,o)),o}function e(s){r.delete(s)}function n(s,o,a){r.get(s)[o]=a}function i(){r=new WeakMap}return{get:t,remove:e,update:n,dispose:i}}function gv(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.z!==t.z?r.z-t.z:r.id-t.id}function Jh(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function Qh(){let r=[],t=0,e=[],n=[],i=[];function s(){t=0,e.length=0,n.length=0,i.length=0}function o(d,u,f,g,v,p){let m=r[t];return m===void 0?(m={id:d.id,object:d,geometry:u,material:f,groupOrder:g,renderOrder:d.renderOrder,z:v,group:p},r[t]=m):(m.id=d.id,m.object=d,m.geometry=u,m.material=f,m.groupOrder=g,m.renderOrder=d.renderOrder,m.z=v,m.group=p),t++,m}function a(d,u,f,g,v,p){let m=o(d,u,f,g,v,p);f.transmission>0?n.push(m):f.transparent===!0?i.push(m):e.push(m)}function l(d,u,f,g,v,p){let m=o(d,u,f,g,v,p);f.transmission>0?n.unshift(m):f.transparent===!0?i.unshift(m):e.unshift(m)}function c(d,u){e.length>1&&e.sort(d||gv),n.length>1&&n.sort(u||Jh),i.length>1&&i.sort(u||Jh)}function h(){for(let d=t,u=r.length;d<u;d++){let f=r[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:i,init:s,push:a,unshift:l,finish:h,sort:c}}function vv(){let r=new WeakMap;function t(n,i){let s=r.get(n),o;return s===void 0?(o=new Qh,r.set(n,[o])):i>=s.length?(o=new Qh,s.push(o)):o=s[i],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function yv(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new G,color:new $t};break;case"SpotLight":e={position:new G,direction:new G,color:new $t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new G,color:new $t,distance:0,decay:0};break;case"HemisphereLight":e={direction:new G,skyColor:new $t,groundColor:new $t};break;case"RectAreaLight":e={color:new $t,position:new G,halfWidth:new G,halfHeight:new G};break}return r[t.id]=e,e}}}function xv(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}var _v=0;function wv(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function Mv(r,t){let e=new yv,n=xv(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)i.probe.push(new G);let s=new G,o=new qt,a=new qt;function l(h,d){let u=0,f=0,g=0;for(let Y=0;Y<9;Y++)i.probe[Y].set(0,0,0);let v=0,p=0,m=0,x=0,y=0,M=0,I=0,A=0,P=0,W=0,S=0;h.sort(wv);let b=d===!0?Math.PI:1;for(let Y=0,X=h.length;Y<X;Y++){let L=h[Y],U=L.color,O=L.intensity,it=L.distance,$=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=U.r*O*b,f+=U.g*O*b,g+=U.b*O*b;else if(L.isLightProbe){for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(L.sh.coefficients[Z],O);S++}else if(L.isDirectionalLight){let Z=e.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity*b),L.castShadow){let rt=L.shadow,lt=n.get(L);lt.shadowBias=rt.bias,lt.shadowNormalBias=rt.normalBias,lt.shadowRadius=rt.radius,lt.shadowMapSize=rt.mapSize,i.directionalShadow[v]=lt,i.directionalShadowMap[v]=$,i.directionalShadowMatrix[v]=L.shadow.matrix,M++}i.directional[v]=Z,v++}else if(L.isSpotLight){let Z=e.get(L);Z.position.setFromMatrixPosition(L.matrixWorld),Z.color.copy(U).multiplyScalar(O*b),Z.distance=it,Z.coneCos=Math.cos(L.angle),Z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Z.decay=L.decay,i.spot[m]=Z;let rt=L.shadow;if(L.map&&(i.spotLightMap[P]=L.map,P++,rt.updateMatrices(L),L.castShadow&&W++),i.spotLightMatrix[m]=rt.matrix,L.castShadow){let lt=n.get(L);lt.shadowBias=rt.bias,lt.shadowNormalBias=rt.normalBias,lt.shadowRadius=rt.radius,lt.shadowMapSize=rt.mapSize,i.spotShadow[m]=lt,i.spotShadowMap[m]=$,A++}m++}else if(L.isRectAreaLight){let Z=e.get(L);Z.color.copy(U).multiplyScalar(O),Z.halfWidth.set(L.width*.5,0,0),Z.halfHeight.set(0,L.height*.5,0),i.rectArea[x]=Z,x++}else if(L.isPointLight){let Z=e.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity*b),Z.distance=L.distance,Z.decay=L.decay,L.castShadow){let rt=L.shadow,lt=n.get(L);lt.shadowBias=rt.bias,lt.shadowNormalBias=rt.normalBias,lt.shadowRadius=rt.radius,lt.shadowMapSize=rt.mapSize,lt.shadowCameraNear=rt.camera.near,lt.shadowCameraFar=rt.camera.far,i.pointShadow[p]=lt,i.pointShadowMap[p]=$,i.pointShadowMatrix[p]=L.shadow.matrix,I++}i.point[p]=Z,p++}else if(L.isHemisphereLight){let Z=e.get(L);Z.skyColor.copy(L.color).multiplyScalar(O*b),Z.groundColor.copy(L.groundColor).multiplyScalar(O*b),i.hemi[y]=Z,y++}}x>0&&(t.isWebGL2?r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Rt.LTC_FLOAT_1,i.rectAreaLTC2=Rt.LTC_FLOAT_2):(i.rectAreaLTC1=Rt.LTC_HALF_1,i.rectAreaLTC2=Rt.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Rt.LTC_FLOAT_1,i.rectAreaLTC2=Rt.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=Rt.LTC_HALF_1,i.rectAreaLTC2=Rt.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=g;let V=i.hash;(V.directionalLength!==v||V.pointLength!==p||V.spotLength!==m||V.rectAreaLength!==x||V.hemiLength!==y||V.numDirectionalShadows!==M||V.numPointShadows!==I||V.numSpotShadows!==A||V.numSpotMaps!==P||V.numLightProbes!==S)&&(i.directional.length=v,i.spot.length=m,i.rectArea.length=x,i.point.length=p,i.hemi.length=y,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=I,i.pointShadowMap.length=I,i.spotShadow.length=A,i.spotShadowMap.length=A,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=I,i.spotLightMatrix.length=A+P-W,i.spotLightMap.length=P,i.numSpotLightShadowsWithMaps=W,i.numLightProbes=S,V.directionalLength=v,V.pointLength=p,V.spotLength=m,V.rectAreaLength=x,V.hemiLength=y,V.numDirectionalShadows=M,V.numPointShadows=I,V.numSpotShadows=A,V.numSpotMaps=P,V.numLightProbes=S,i.version=_v++)}function c(h,d){let u=0,f=0,g=0,v=0,p=0,m=d.matrixWorldInverse;for(let x=0,y=h.length;x<y;x++){let M=h[x];if(M.isDirectionalLight){let I=i.directional[u];I.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(m),u++}else if(M.isSpotLight){let I=i.spot[g];I.position.setFromMatrixPosition(M.matrixWorld),I.position.applyMatrix4(m),I.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(m),g++}else if(M.isRectAreaLight){let I=i.rectArea[v];I.position.setFromMatrixPosition(M.matrixWorld),I.position.applyMatrix4(m),a.identity(),o.copy(M.matrixWorld),o.premultiply(m),a.extractRotation(o),I.halfWidth.set(M.width*.5,0,0),I.halfHeight.set(0,M.height*.5,0),I.halfWidth.applyMatrix4(a),I.halfHeight.applyMatrix4(a),v++}else if(M.isPointLight){let I=i.point[f];I.position.setFromMatrixPosition(M.matrixWorld),I.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){let I=i.hemi[p];I.direction.setFromMatrixPosition(M.matrixWorld),I.direction.transformDirection(m),p++}}}return{setup:l,setupView:c,state:i}}function tu(r,t){let e=new Mv(r,t),n=[],i=[];function s(){n.length=0,i.length=0}function o(d){n.push(d)}function a(d){i.push(d)}function l(d){e.setup(n,d)}function c(d){e.setupView(n,d)}return{init:s,state:{lightsArray:n,shadowsArray:i,lights:e},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Sv(r,t){let e=new WeakMap;function n(s,o=0){let a=e.get(s),l;return a===void 0?(l=new tu(r,t),e.set(s,[l])):o>=a.length?(l=new tu(r,t),a.push(l)):l=a[o],l}function i(){e=new WeakMap}return{get:n,dispose:i}}var ml=class extends En{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=mf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},gl=class extends En{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},bv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ev=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Av(r,t,e){let n=new or,i=new re,s=new re,o=new ve,a=new ml({depthPacking:gf}),l=new gl,c={},h=e.maxTextureSize,d={[xi]:pn,[pn]:xi,[Nn]:Nn},u=new Ke({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new re},radius:{value:4}},vertexShader:bv,fragmentShader:Ev}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new tn;g.setAttribute("position",new Qe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Fe(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=xu;let m=this.type;this.render=function(A,P,W){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||A.length===0)return;let S=r.getRenderTarget(),b=r.getActiveCubeFace(),V=r.getActiveMipmapLevel(),Y=r.state;Y.setBlending(je),Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);let X=m!==$n&&this.type===$n,L=m===$n&&this.type!==$n;for(let U=0,O=A.length;U<O;U++){let it=A[U],$=it.shadow;if($===void 0){console.warn("THREE.WebGLShadowMap:",it,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;i.copy($.mapSize);let Z=$.getFrameExtents();if(i.multiply(Z),s.copy($.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/Z.x),i.x=s.x*Z.x,$.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/Z.y),i.y=s.y*Z.y,$.mapSize.y=s.y)),$.map===null||X===!0||L===!0){let lt=this.type!==$n?{minFilter:ke,magFilter:ke}:{};$.map!==null&&$.map.dispose(),$.map=new mn(i.x,i.y,lt),$.map.texture.name=it.name+".shadowMap",$.camera.updateProjectionMatrix()}r.setRenderTarget($.map),r.clear();let rt=$.getViewportCount();for(let lt=0;lt<rt;lt++){let st=$.getViewport(lt);o.set(s.x*st.x,s.y*st.y,s.x*st.z,s.y*st.w),Y.viewport(o),$.updateMatrices(it,lt),n=$.getFrustum(),M(P,W,$.camera,it,this.type)}$.isPointLightShadow!==!0&&this.type===$n&&x($,W),$.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(S,b,V)};function x(A,P){let W=t.update(v);u.defines.VSM_SAMPLES!==A.blurSamples&&(u.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new mn(i.x,i.y)),u.uniforms.shadow_pass.value=A.map.texture,u.uniforms.resolution.value=A.mapSize,u.uniforms.radius.value=A.radius,r.setRenderTarget(A.mapPass),r.clear(),r.renderBufferDirect(P,null,W,u,v,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,r.setRenderTarget(A.map),r.clear(),r.renderBufferDirect(P,null,W,f,v,null)}function y(A,P,W,S){let b=null,V=W.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(V!==void 0)b=V;else if(b=W.isPointLight===!0?l:a,r.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0){let Y=b.uuid,X=P.uuid,L=c[Y];L===void 0&&(L={},c[Y]=L);let U=L[X];U===void 0&&(U=b.clone(),L[X]=U,P.addEventListener("dispose",I)),b=U}if(b.visible=P.visible,b.wireframe=P.wireframe,S===$n?b.side=P.shadowSide!==null?P.shadowSide:P.side:b.side=P.shadowSide!==null?P.shadowSide:d[P.side],b.alphaMap=P.alphaMap,b.alphaTest=P.alphaTest,b.map=P.map,b.clipShadows=P.clipShadows,b.clippingPlanes=P.clippingPlanes,b.clipIntersection=P.clipIntersection,b.displacementMap=P.displacementMap,b.displacementScale=P.displacementScale,b.displacementBias=P.displacementBias,b.wireframeLinewidth=P.wireframeLinewidth,b.linewidth=P.linewidth,W.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let Y=r.properties.get(b);Y.light=W}return b}function M(A,P,W,S,b){if(A.visible===!1)return;if(A.layers.test(P.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===$n)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,A.matrixWorld);let X=t.update(A),L=A.material;if(Array.isArray(L)){let U=X.groups;for(let O=0,it=U.length;O<it;O++){let $=U[O],Z=L[$.materialIndex];if(Z&&Z.visible){let rt=y(A,Z,S,b);A.onBeforeShadow(r,A,P,W,X,rt,$),r.renderBufferDirect(W,null,X,rt,A,$),A.onAfterShadow(r,A,P,W,X,rt,$)}}}else if(L.visible){let U=y(A,L,S,b);A.onBeforeShadow(r,A,P,W,X,U,null),r.renderBufferDirect(W,null,X,U,A,null),A.onAfterShadow(r,A,P,W,X,U,null)}}let Y=A.children;for(let X=0,L=Y.length;X<L;X++)M(Y[X],P,W,S,b)}function I(A){A.target.removeEventListener("dispose",I);for(let W in c){let S=c[W],b=A.target.uuid;b in S&&(S[b].dispose(),delete S[b])}}}function Tv(r,t,e){let n=e.isWebGL2;function i(){let H=!1,Lt=new ve,Nt=null,ee=new ve(0,0,0,0);return{setMask:function(Jt){Nt!==Jt&&!H&&(r.colorMask(Jt,Jt,Jt,Jt),Nt=Jt)},setLocked:function(Jt){H=Jt},setClear:function(Jt,xe,ye,Re,Be){Be===!0&&(Jt*=Re,xe*=Re,ye*=Re),Lt.set(Jt,xe,ye,Re),ee.equals(Lt)===!1&&(r.clearColor(Jt,xe,ye,Re),ee.copy(Lt))},reset:function(){H=!1,Nt=null,ee.set(-1,0,0,0)}}}function s(){let H=!1,Lt=null,Nt=null,ee=null;return{setTest:function(Jt){Jt?at(r.DEPTH_TEST):ft(r.DEPTH_TEST)},setMask:function(Jt){Lt!==Jt&&!H&&(r.depthMask(Jt),Lt=Jt)},setFunc:function(Jt){if(Nt!==Jt){switch(Jt){case jd:r.depthFunc(r.NEVER);break;case $d:r.depthFunc(r.ALWAYS);break;case Kd:r.depthFunc(r.LESS);break;case so:r.depthFunc(r.LEQUAL);break;case Jd:r.depthFunc(r.EQUAL);break;case Qd:r.depthFunc(r.GEQUAL);break;case tf:r.depthFunc(r.GREATER);break;case ef:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Nt=Jt}},setLocked:function(Jt){H=Jt},setClear:function(Jt){ee!==Jt&&(r.clearDepth(Jt),ee=Jt)},reset:function(){H=!1,Lt=null,Nt=null,ee=null}}}function o(){let H=!1,Lt=null,Nt=null,ee=null,Jt=null,xe=null,ye=null,Re=null,Be=null;return{setTest:function(_e){H||(_e?at(r.STENCIL_TEST):ft(r.STENCIL_TEST))},setMask:function(_e){Lt!==_e&&!H&&(r.stencilMask(_e),Lt=_e)},setFunc:function(_e,ie,on){(Nt!==_e||ee!==ie||Jt!==on)&&(r.stencilFunc(_e,ie,on),Nt=_e,ee=ie,Jt=on)},setOp:function(_e,ie,on){(xe!==_e||ye!==ie||Re!==on)&&(r.stencilOp(_e,ie,on),xe=_e,ye=ie,Re=on)},setLocked:function(_e){H=_e},setClear:function(_e){Be!==_e&&(r.clearStencil(_e),Be=_e)},reset:function(){H=!1,Lt=null,Nt=null,ee=null,Jt=null,xe=null,ye=null,Re=null,Be=null}}}let a=new i,l=new s,c=new o,h=new WeakMap,d=new WeakMap,u={},f={},g=new WeakMap,v=[],p=null,m=!1,x=null,y=null,M=null,I=null,A=null,P=null,W=null,S=new $t(0,0,0),b=0,V=!1,Y=null,X=null,L=null,U=null,O=null,it=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,Z=0,rt=r.getParameter(r.VERSION);rt.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(rt)[1]),$=Z>=1):rt.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),$=Z>=2);let lt=null,st={},tt=r.getParameter(r.SCISSOR_BOX),ct=r.getParameter(r.VIEWPORT),_t=new ve().fromArray(tt),yt=new ve().fromArray(ct);function wt(H,Lt,Nt,ee){let Jt=new Uint8Array(4),xe=r.createTexture();r.bindTexture(H,xe),r.texParameteri(H,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(H,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ye=0;ye<Nt;ye++)n&&(H===r.TEXTURE_3D||H===r.TEXTURE_2D_ARRAY)?r.texImage3D(Lt,0,r.RGBA,1,1,ee,0,r.RGBA,r.UNSIGNED_BYTE,Jt):r.texImage2D(Lt+ye,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Jt);return xe}let Tt={};Tt[r.TEXTURE_2D]=wt(r.TEXTURE_2D,r.TEXTURE_2D,1),Tt[r.TEXTURE_CUBE_MAP]=wt(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Tt[r.TEXTURE_2D_ARRAY]=wt(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Tt[r.TEXTURE_3D]=wt(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),at(r.DEPTH_TEST),l.setFunc(so),Zt(!1),N(Lc),at(r.CULL_FACE),Mt(je);function at(H){u[H]!==!0&&(r.enable(H),u[H]=!0)}function ft(H){u[H]!==!1&&(r.disable(H),u[H]=!1)}function At(H,Lt){return f[H]!==Lt?(r.bindFramebuffer(H,Lt),f[H]=Lt,n&&(H===r.DRAW_FRAMEBUFFER&&(f[r.FRAMEBUFFER]=Lt),H===r.FRAMEBUFFER&&(f[r.DRAW_FRAMEBUFFER]=Lt)),!0):!1}function q(H,Lt){let Nt=v,ee=!1;if(H)if(Nt=g.get(Lt),Nt===void 0&&(Nt=[],g.set(Lt,Nt)),H.isWebGLMultipleRenderTargets){let Jt=H.texture;if(Nt.length!==Jt.length||Nt[0]!==r.COLOR_ATTACHMENT0){for(let xe=0,ye=Jt.length;xe<ye;xe++)Nt[xe]=r.COLOR_ATTACHMENT0+xe;Nt.length=Jt.length,ee=!0}}else Nt[0]!==r.COLOR_ATTACHMENT0&&(Nt[0]=r.COLOR_ATTACHMENT0,ee=!0);else Nt[0]!==r.BACK&&(Nt[0]=r.BACK,ee=!0);ee&&(e.isWebGL2?r.drawBuffers(Nt):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(Nt))}function Ht(H){return p!==H?(r.useProgram(H),p=H,!0):!1}let Ct={[On]:r.FUNC_ADD,[Bd]:r.FUNC_SUBTRACT,[Od]:r.FUNC_REVERSE_SUBTRACT};if(n)Ct[Uc]=r.MIN,Ct[Bc]=r.MAX;else{let H=t.get("EXT_blend_minmax");H!==null&&(Ct[Uc]=H.MIN_EXT,Ct[Bc]=H.MAX_EXT)}let kt={[ko]:r.ZERO,[zd]:r.ONE,[kd]:r.SRC_COLOR,[Qa]:r.SRC_ALPHA,[Wd]:r.SRC_ALPHA_SATURATE,[Bl]:r.DST_COLOR,[Ul]:r.DST_ALPHA,[Vd]:r.ONE_MINUS_SRC_COLOR,[tl]:r.ONE_MINUS_SRC_ALPHA,[Gd]:r.ONE_MINUS_DST_COLOR,[Hd]:r.ONE_MINUS_DST_ALPHA,[Xd]:r.CONSTANT_COLOR,[qd]:r.ONE_MINUS_CONSTANT_COLOR,[Yd]:r.CONSTANT_ALPHA,[Zd]:r.ONE_MINUS_CONSTANT_ALPHA};function Mt(H,Lt,Nt,ee,Jt,xe,ye,Re,Be,_e){if(H===je){m===!0&&(ft(r.BLEND),m=!1);return}if(m===!1&&(at(r.BLEND),m=!0),H!==Fl){if(H!==x||_e!==V){if((y!==On||A!==On)&&(r.blendEquation(r.FUNC_ADD),y=On,A=On),_e)switch(H){case xs:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Nc:r.blendFunc(r.ONE,r.ONE);break;case Dc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Fc:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",H);break}else switch(H){case xs:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Nc:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Dc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Fc:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",H);break}M=null,I=null,P=null,W=null,S.set(0,0,0),b=0,x=H,V=_e}return}Jt=Jt||Lt,xe=xe||Nt,ye=ye||ee,(Lt!==y||Jt!==A)&&(r.blendEquationSeparate(Ct[Lt],Ct[Jt]),y=Lt,A=Jt),(Nt!==M||ee!==I||xe!==P||ye!==W)&&(r.blendFuncSeparate(kt[Nt],kt[ee],kt[xe],kt[ye]),M=Nt,I=ee,P=xe,W=ye),(Re.equals(S)===!1||Be!==b)&&(r.blendColor(Re.r,Re.g,Re.b,Be),S.copy(Re),b=Be),x=H,V=!1}function ce(H,Lt){H.side===Nn?ft(r.CULL_FACE):at(r.CULL_FACE);let Nt=H.side===pn;Lt&&(Nt=!Nt),Zt(Nt),H.blending===xs&&H.transparent===!1?Mt(je):Mt(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),l.setFunc(H.depthFunc),l.setTest(H.depthTest),l.setMask(H.depthWrite),a.setMask(H.colorWrite);let ee=H.stencilWrite;c.setTest(ee),ee&&(c.setMask(H.stencilWriteMask),c.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),c.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass)),Q(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?at(r.SAMPLE_ALPHA_TO_COVERAGE):ft(r.SAMPLE_ALPHA_TO_COVERAGE)}function Zt(H){Y!==H&&(H?r.frontFace(r.CW):r.frontFace(r.CCW),Y=H)}function N(H){H!==Fd?(at(r.CULL_FACE),H!==X&&(H===Lc?r.cullFace(r.BACK):H===Ud?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ft(r.CULL_FACE),X=H}function T(H){H!==L&&($&&r.lineWidth(H),L=H)}function Q(H,Lt,Nt){H?(at(r.POLYGON_OFFSET_FILL),(U!==Lt||O!==Nt)&&(r.polygonOffset(Lt,Nt),U=Lt,O=Nt)):ft(r.POLYGON_OFFSET_FILL)}function gt(H){H?at(r.SCISSOR_TEST):ft(r.SCISSOR_TEST)}function ut(H){H===void 0&&(H=r.TEXTURE0+it-1),lt!==H&&(r.activeTexture(H),lt=H)}function mt(H,Lt,Nt){Nt===void 0&&(lt===null?Nt=r.TEXTURE0+it-1:Nt=lt);let ee=st[Nt];ee===void 0&&(ee={type:void 0,texture:void 0},st[Nt]=ee),(ee.type!==H||ee.texture!==Lt)&&(lt!==Nt&&(r.activeTexture(Nt),lt=Nt),r.bindTexture(H,Lt||Tt[H]),ee.type=H,ee.texture=Lt)}function It(){let H=st[lt];H!==void 0&&H.type!==void 0&&(r.bindTexture(H.type,null),H.type=void 0,H.texture=void 0)}function St(){try{r.compressedTexImage2D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Pt(){try{r.compressedTexImage3D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Ot(){try{r.texSubImage2D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Gt(){try{r.texSubImage3D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function vt(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function fe(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function ae(){try{r.texStorage2D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Kt(){try{r.texStorage3D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Ut(){try{r.texImage2D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Dt(){try{r.texImage3D.apply(r,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Vt(H){_t.equals(H)===!1&&(r.scissor(H.x,H.y,H.z,H.w),_t.copy(H))}function Qt(H){yt.equals(H)===!1&&(r.viewport(H.x,H.y,H.z,H.w),yt.copy(H))}function ne(H,Lt){let Nt=d.get(Lt);Nt===void 0&&(Nt=new WeakMap,d.set(Lt,Nt));let ee=Nt.get(H);ee===void 0&&(ee=r.getUniformBlockIndex(Lt,H.name),Nt.set(H,ee))}function te(H,Lt){let ee=d.get(Lt).get(H);h.get(Lt)!==ee&&(r.uniformBlockBinding(Lt,ee,H.__bindingPointIndex),h.set(Lt,ee))}function K(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),n===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),u={},lt=null,st={},f={},g=new WeakMap,v=[],p=null,m=!1,x=null,y=null,M=null,I=null,A=null,P=null,W=null,S=new $t(0,0,0),b=0,V=!1,Y=null,X=null,L=null,U=null,O=null,_t.set(0,0,r.canvas.width,r.canvas.height),yt.set(0,0,r.canvas.width,r.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:at,disable:ft,bindFramebuffer:At,drawBuffers:q,useProgram:Ht,setBlending:Mt,setMaterial:ce,setFlipSided:Zt,setCullFace:N,setLineWidth:T,setPolygonOffset:Q,setScissorTest:gt,activeTexture:ut,bindTexture:mt,unbindTexture:It,compressedTexImage2D:St,compressedTexImage3D:Pt,texImage2D:Ut,texImage3D:Dt,updateUBOMapping:ne,uniformBlockBinding:te,texStorage2D:ae,texStorage3D:Kt,texSubImage2D:Ot,texSubImage3D:Gt,compressedTexSubImage2D:vt,compressedTexSubImage3D:fe,scissor:Vt,viewport:Qt,reset:K}}function Cv(r,t,e,n,i,s,o){let a=i.isWebGL2,l=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap,d,u=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(N,T){return f?new OffscreenCanvas(N,T):ir("canvas")}function v(N,T,Q,gt){let ut=1;if((N.width>gt||N.height>gt)&&(ut=gt/Math.max(N.width,N.height)),ut<1||T===!0)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap){let mt=T?uo:Math.floor,It=mt(ut*N.width),St=mt(ut*N.height);d===void 0&&(d=g(It,St));let Pt=Q?g(It,St):d;return Pt.width=It,Pt.height=St,Pt.getContext("2d").drawImage(N,0,0,It,St),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+N.width+"x"+N.height+") to ("+It+"x"+St+")."),Pt}else return"data"in N&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+N.width+"x"+N.height+")."),N;return N}function p(N){return sl(N.width)&&sl(N.height)}function m(N){return a?!1:N.wrapS!==rn||N.wrapT!==rn||N.minFilter!==ke&&N.minFilter!==Ye}function x(N,T){return N.generateMipmaps&&T&&N.minFilter!==ke&&N.minFilter!==Ye}function y(N){r.generateMipmap(N)}function M(N,T,Q,gt,ut=!1){if(a===!1)return T;if(N!==null){if(r[N]!==void 0)return r[N];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let mt=T;if(T===r.RED&&(Q===r.FLOAT&&(mt=r.R32F),Q===r.HALF_FLOAT&&(mt=r.R16F),Q===r.UNSIGNED_BYTE&&(mt=r.R8)),T===r.RED_INTEGER&&(Q===r.UNSIGNED_BYTE&&(mt=r.R8UI),Q===r.UNSIGNED_SHORT&&(mt=r.R16UI),Q===r.UNSIGNED_INT&&(mt=r.R32UI),Q===r.BYTE&&(mt=r.R8I),Q===r.SHORT&&(mt=r.R16I),Q===r.INT&&(mt=r.R32I)),T===r.RG&&(Q===r.FLOAT&&(mt=r.RG32F),Q===r.HALF_FLOAT&&(mt=r.RG16F),Q===r.UNSIGNED_BYTE&&(mt=r.RG8)),T===r.RGBA){let It=ut?ao:be.getTransfer(gt);Q===r.FLOAT&&(mt=r.RGBA32F),Q===r.HALF_FLOAT&&(mt=r.RGBA16F),Q===r.UNSIGNED_BYTE&&(mt=It===Te?r.SRGB8_ALPHA8:r.RGBA8),Q===r.UNSIGNED_SHORT_4_4_4_4&&(mt=r.RGBA4),Q===r.UNSIGNED_SHORT_5_5_5_1&&(mt=r.RGB5_A1)}return(mt===r.R16F||mt===r.R32F||mt===r.RG16F||mt===r.RG32F||mt===r.RGBA16F||mt===r.RGBA32F)&&t.get("EXT_color_buffer_float"),mt}function I(N,T,Q){return x(N,Q)===!0||N.isFramebufferTexture&&N.minFilter!==ke&&N.minFilter!==Ye?Math.log2(Math.max(T.width,T.height))+1:N.mipmaps!==void 0&&N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?T.mipmaps.length:1}function A(N){return N===ke||N===zc||N===xa?r.NEAREST:r.LINEAR}function P(N){let T=N.target;T.removeEventListener("dispose",P),S(T),T.isVideoTexture&&h.delete(T)}function W(N){let T=N.target;T.removeEventListener("dispose",W),V(T)}function S(N){let T=n.get(N);if(T.__webglInit===void 0)return;let Q=N.source,gt=u.get(Q);if(gt){let ut=gt[T.__cacheKey];ut.usedTimes--,ut.usedTimes===0&&b(N),Object.keys(gt).length===0&&u.delete(Q)}n.remove(N)}function b(N){let T=n.get(N);r.deleteTexture(T.__webglTexture);let Q=N.source,gt=u.get(Q);delete gt[T.__cacheKey],o.memory.textures--}function V(N){let T=N.texture,Q=n.get(N),gt=n.get(T);if(gt.__webglTexture!==void 0&&(r.deleteTexture(gt.__webglTexture),o.memory.textures--),N.depthTexture&&N.depthTexture.dispose(),N.isWebGLCubeRenderTarget)for(let ut=0;ut<6;ut++){if(Array.isArray(Q.__webglFramebuffer[ut]))for(let mt=0;mt<Q.__webglFramebuffer[ut].length;mt++)r.deleteFramebuffer(Q.__webglFramebuffer[ut][mt]);else r.deleteFramebuffer(Q.__webglFramebuffer[ut]);Q.__webglDepthbuffer&&r.deleteRenderbuffer(Q.__webglDepthbuffer[ut])}else{if(Array.isArray(Q.__webglFramebuffer))for(let ut=0;ut<Q.__webglFramebuffer.length;ut++)r.deleteFramebuffer(Q.__webglFramebuffer[ut]);else r.deleteFramebuffer(Q.__webglFramebuffer);if(Q.__webglDepthbuffer&&r.deleteRenderbuffer(Q.__webglDepthbuffer),Q.__webglMultisampledFramebuffer&&r.deleteFramebuffer(Q.__webglMultisampledFramebuffer),Q.__webglColorRenderbuffer)for(let ut=0;ut<Q.__webglColorRenderbuffer.length;ut++)Q.__webglColorRenderbuffer[ut]&&r.deleteRenderbuffer(Q.__webglColorRenderbuffer[ut]);Q.__webglDepthRenderbuffer&&r.deleteRenderbuffer(Q.__webglDepthRenderbuffer)}if(N.isWebGLMultipleRenderTargets)for(let ut=0,mt=T.length;ut<mt;ut++){let It=n.get(T[ut]);It.__webglTexture&&(r.deleteTexture(It.__webglTexture),o.memory.textures--),n.remove(T[ut])}n.remove(T),n.remove(N)}let Y=0;function X(){Y=0}function L(){let N=Y;return N>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+N+" texture units while this GPU supports only "+i.maxTextures),Y+=1,N}function U(N){let T=[];return T.push(N.wrapS),T.push(N.wrapT),T.push(N.wrapR||0),T.push(N.magFilter),T.push(N.minFilter),T.push(N.anisotropy),T.push(N.internalFormat),T.push(N.format),T.push(N.type),T.push(N.generateMipmaps),T.push(N.premultiplyAlpha),T.push(N.flipY),T.push(N.unpackAlignment),T.push(N.colorSpace),T.join()}function O(N,T){let Q=n.get(N);if(N.isVideoTexture&&ce(N),N.isRenderTargetTexture===!1&&N.version>0&&Q.__version!==N.version){let gt=N.image;if(gt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(gt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{_t(Q,N,T);return}}e.bindTexture(r.TEXTURE_2D,Q.__webglTexture,r.TEXTURE0+T)}function it(N,T){let Q=n.get(N);if(N.version>0&&Q.__version!==N.version){_t(Q,N,T);return}e.bindTexture(r.TEXTURE_2D_ARRAY,Q.__webglTexture,r.TEXTURE0+T)}function $(N,T){let Q=n.get(N);if(N.version>0&&Q.__version!==N.version){_t(Q,N,T);return}e.bindTexture(r.TEXTURE_3D,Q.__webglTexture,r.TEXTURE0+T)}function Z(N,T){let Q=n.get(N);if(N.version>0&&Q.__version!==N.version){yt(Q,N,T);return}e.bindTexture(r.TEXTURE_CUBE_MAP,Q.__webglTexture,r.TEXTURE0+T)}let rt={[ei]:r.REPEAT,[rn]:r.CLAMP_TO_EDGE,[nl]:r.MIRRORED_REPEAT},lt={[ke]:r.NEAREST,[zc]:r.NEAREST_MIPMAP_NEAREST,[xa]:r.NEAREST_MIPMAP_LINEAR,[Ye]:r.LINEAR,[af]:r.LINEAR_MIPMAP_NEAREST,[bs]:r.LINEAR_MIPMAP_LINEAR},st={[yf]:r.NEVER,[bf]:r.ALWAYS,[xf]:r.LESS,[Ru]:r.LEQUAL,[_f]:r.EQUAL,[Sf]:r.GEQUAL,[wf]:r.GREATER,[Mf]:r.NOTEQUAL};function tt(N,T,Q){if(Q?(r.texParameteri(N,r.TEXTURE_WRAP_S,rt[T.wrapS]),r.texParameteri(N,r.TEXTURE_WRAP_T,rt[T.wrapT]),(N===r.TEXTURE_3D||N===r.TEXTURE_2D_ARRAY)&&r.texParameteri(N,r.TEXTURE_WRAP_R,rt[T.wrapR]),r.texParameteri(N,r.TEXTURE_MAG_FILTER,lt[T.magFilter]),r.texParameteri(N,r.TEXTURE_MIN_FILTER,lt[T.minFilter])):(r.texParameteri(N,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(N,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),(N===r.TEXTURE_3D||N===r.TEXTURE_2D_ARRAY)&&r.texParameteri(N,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),(T.wrapS!==rn||T.wrapT!==rn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(N,r.TEXTURE_MAG_FILTER,A(T.magFilter)),r.texParameteri(N,r.TEXTURE_MIN_FILTER,A(T.minFilter)),T.minFilter!==ke&&T.minFilter!==Ye&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),T.compareFunction&&(r.texParameteri(N,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(N,r.TEXTURE_COMPARE_FUNC,st[T.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){let gt=t.get("EXT_texture_filter_anisotropic");if(T.magFilter===ke||T.minFilter!==xa&&T.minFilter!==bs||T.type===Je&&t.has("OES_texture_float_linear")===!1||a===!1&&T.type===cn&&t.has("OES_texture_half_float_linear")===!1)return;(T.anisotropy>1||n.get(T).__currentAnisotropy)&&(r.texParameterf(N,gt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,i.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy)}}function ct(N,T){let Q=!1;N.__webglInit===void 0&&(N.__webglInit=!0,T.addEventListener("dispose",P));let gt=T.source,ut=u.get(gt);ut===void 0&&(ut={},u.set(gt,ut));let mt=U(T);if(mt!==N.__cacheKey){ut[mt]===void 0&&(ut[mt]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,Q=!0),ut[mt].usedTimes++;let It=ut[N.__cacheKey];It!==void 0&&(ut[N.__cacheKey].usedTimes--,It.usedTimes===0&&b(T)),N.__cacheKey=mt,N.__webglTexture=ut[mt].texture}return Q}function _t(N,T,Q){let gt=r.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(gt=r.TEXTURE_2D_ARRAY),T.isData3DTexture&&(gt=r.TEXTURE_3D);let ut=ct(N,T),mt=T.source;e.bindTexture(gt,N.__webglTexture,r.TEXTURE0+Q);let It=n.get(mt);if(mt.version!==It.__version||ut===!0){e.activeTexture(r.TEXTURE0+Q);let St=be.getPrimaries(be.workingColorSpace),Pt=T.colorSpace===fn?null:be.getPrimaries(T.colorSpace),Ot=T.colorSpace===fn||St===Pt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,T.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,T.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ot);let Gt=m(T)&&p(T.image)===!1,vt=v(T.image,Gt,!1,i.maxTextureSize);vt=Zt(T,vt);let fe=p(vt)||a,ae=s.convert(T.format,T.colorSpace),Kt=s.convert(T.type),Ut=M(T.internalFormat,ae,Kt,T.colorSpace,T.isVideoTexture);tt(gt,T,fe);let Dt,Vt=T.mipmaps,Qt=a&&T.isVideoTexture!==!0&&Ut!==Tu,ne=It.__version===void 0||ut===!0,te=I(T,vt,fe);if(T.isDepthTexture)Ut=r.DEPTH_COMPONENT,a?T.type===Je?Ut=r.DEPTH_COMPONENT32F:T.type===gi?Ut=r.DEPTH_COMPONENT24:T.type===ti?Ut=r.DEPTH24_STENCIL8:Ut=r.DEPTH_COMPONENT16:T.type===Je&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),T.format===Gi&&Ut===r.DEPTH_COMPONENT&&T.type!==Gl&&T.type!==gi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),T.type=gi,Kt=s.convert(T.type)),T.format===_i&&Ut===r.DEPTH_COMPONENT&&(Ut=r.DEPTH_STENCIL,T.type!==ti&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),T.type=ti,Kt=s.convert(T.type))),ne&&(Qt?e.texStorage2D(r.TEXTURE_2D,1,Ut,vt.width,vt.height):e.texImage2D(r.TEXTURE_2D,0,Ut,vt.width,vt.height,0,ae,Kt,null));else if(T.isDataTexture)if(Vt.length>0&&fe){Qt&&ne&&e.texStorage2D(r.TEXTURE_2D,te,Ut,Vt[0].width,Vt[0].height);for(let K=0,H=Vt.length;K<H;K++)Dt=Vt[K],Qt?e.texSubImage2D(r.TEXTURE_2D,K,0,0,Dt.width,Dt.height,ae,Kt,Dt.data):e.texImage2D(r.TEXTURE_2D,K,Ut,Dt.width,Dt.height,0,ae,Kt,Dt.data);T.generateMipmaps=!1}else Qt?(ne&&e.texStorage2D(r.TEXTURE_2D,te,Ut,vt.width,vt.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,vt.width,vt.height,ae,Kt,vt.data)):e.texImage2D(r.TEXTURE_2D,0,Ut,vt.width,vt.height,0,ae,Kt,vt.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){Qt&&ne&&e.texStorage3D(r.TEXTURE_2D_ARRAY,te,Ut,Vt[0].width,Vt[0].height,vt.depth);for(let K=0,H=Vt.length;K<H;K++)Dt=Vt[K],T.format!==dn?ae!==null?Qt?e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,K,0,0,0,Dt.width,Dt.height,vt.depth,ae,Dt.data,0,0):e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,K,Ut,Dt.width,Dt.height,vt.depth,0,Dt.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Qt?e.texSubImage3D(r.TEXTURE_2D_ARRAY,K,0,0,0,Dt.width,Dt.height,vt.depth,ae,Kt,Dt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,K,Ut,Dt.width,Dt.height,vt.depth,0,ae,Kt,Dt.data)}else{Qt&&ne&&e.texStorage2D(r.TEXTURE_2D,te,Ut,Vt[0].width,Vt[0].height);for(let K=0,H=Vt.length;K<H;K++)Dt=Vt[K],T.format!==dn?ae!==null?Qt?e.compressedTexSubImage2D(r.TEXTURE_2D,K,0,0,Dt.width,Dt.height,ae,Dt.data):e.compressedTexImage2D(r.TEXTURE_2D,K,Ut,Dt.width,Dt.height,0,Dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Qt?e.texSubImage2D(r.TEXTURE_2D,K,0,0,Dt.width,Dt.height,ae,Kt,Dt.data):e.texImage2D(r.TEXTURE_2D,K,Ut,Dt.width,Dt.height,0,ae,Kt,Dt.data)}else if(T.isDataArrayTexture)Qt?(ne&&e.texStorage3D(r.TEXTURE_2D_ARRAY,te,Ut,vt.width,vt.height,vt.depth),e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,vt.width,vt.height,vt.depth,ae,Kt,vt.data)):e.texImage3D(r.TEXTURE_2D_ARRAY,0,Ut,vt.width,vt.height,vt.depth,0,ae,Kt,vt.data);else if(T.isData3DTexture)Qt?(ne&&e.texStorage3D(r.TEXTURE_3D,te,Ut,vt.width,vt.height,vt.depth),e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,vt.width,vt.height,vt.depth,ae,Kt,vt.data)):e.texImage3D(r.TEXTURE_3D,0,Ut,vt.width,vt.height,vt.depth,0,ae,Kt,vt.data);else if(T.isFramebufferTexture){if(ne)if(Qt)e.texStorage2D(r.TEXTURE_2D,te,Ut,vt.width,vt.height);else{let K=vt.width,H=vt.height;for(let Lt=0;Lt<te;Lt++)e.texImage2D(r.TEXTURE_2D,Lt,Ut,K,H,0,ae,Kt,null),K>>=1,H>>=1}}else if(Vt.length>0&&fe){Qt&&ne&&e.texStorage2D(r.TEXTURE_2D,te,Ut,Vt[0].width,Vt[0].height);for(let K=0,H=Vt.length;K<H;K++)Dt=Vt[K],Qt?e.texSubImage2D(r.TEXTURE_2D,K,0,0,ae,Kt,Dt):e.texImage2D(r.TEXTURE_2D,K,Ut,ae,Kt,Dt);T.generateMipmaps=!1}else Qt?(ne&&e.texStorage2D(r.TEXTURE_2D,te,Ut,vt.width,vt.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,ae,Kt,vt)):e.texImage2D(r.TEXTURE_2D,0,Ut,ae,Kt,vt);x(T,fe)&&y(gt),It.__version=mt.version,T.onUpdate&&T.onUpdate(T)}N.__version=T.version}function yt(N,T,Q){if(T.image.length!==6)return;let gt=ct(N,T),ut=T.source;e.bindTexture(r.TEXTURE_CUBE_MAP,N.__webglTexture,r.TEXTURE0+Q);let mt=n.get(ut);if(ut.version!==mt.__version||gt===!0){e.activeTexture(r.TEXTURE0+Q);let It=be.getPrimaries(be.workingColorSpace),St=T.colorSpace===fn?null:be.getPrimaries(T.colorSpace),Pt=T.colorSpace===fn||It===St?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,T.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,T.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pt);let Ot=T.isCompressedTexture||T.image[0].isCompressedTexture,Gt=T.image[0]&&T.image[0].isDataTexture,vt=[];for(let K=0;K<6;K++)!Ot&&!Gt?vt[K]=v(T.image[K],!1,!0,i.maxCubemapSize):vt[K]=Gt?T.image[K].image:T.image[K],vt[K]=Zt(T,vt[K]);let fe=vt[0],ae=p(fe)||a,Kt=s.convert(T.format,T.colorSpace),Ut=s.convert(T.type),Dt=M(T.internalFormat,Kt,Ut,T.colorSpace),Vt=a&&T.isVideoTexture!==!0,Qt=mt.__version===void 0||gt===!0,ne=I(T,fe,ae);tt(r.TEXTURE_CUBE_MAP,T,ae);let te;if(Ot){Vt&&Qt&&e.texStorage2D(r.TEXTURE_CUBE_MAP,ne,Dt,fe.width,fe.height);for(let K=0;K<6;K++){te=vt[K].mipmaps;for(let H=0;H<te.length;H++){let Lt=te[H];T.format!==dn?Kt!==null?Vt?e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H,0,0,Lt.width,Lt.height,Kt,Lt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H,Dt,Lt.width,Lt.height,0,Lt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Vt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H,0,0,Lt.width,Lt.height,Kt,Ut,Lt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H,Dt,Lt.width,Lt.height,0,Kt,Ut,Lt.data)}}}else{te=T.mipmaps,Vt&&Qt&&(te.length>0&&ne++,e.texStorage2D(r.TEXTURE_CUBE_MAP,ne,Dt,vt[0].width,vt[0].height));for(let K=0;K<6;K++)if(Gt){Vt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,vt[K].width,vt[K].height,Kt,Ut,vt[K].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Dt,vt[K].width,vt[K].height,0,Kt,Ut,vt[K].data);for(let H=0;H<te.length;H++){let Nt=te[H].image[K].image;Vt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H+1,0,0,Nt.width,Nt.height,Kt,Ut,Nt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H+1,Dt,Nt.width,Nt.height,0,Kt,Ut,Nt.data)}}else{Vt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Kt,Ut,vt[K]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Dt,Kt,Ut,vt[K]);for(let H=0;H<te.length;H++){let Lt=te[H];Vt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H+1,0,0,Kt,Ut,Lt.image[K]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+K,H+1,Dt,Kt,Ut,Lt.image[K])}}}x(T,ae)&&y(r.TEXTURE_CUBE_MAP),mt.__version=ut.version,T.onUpdate&&T.onUpdate(T)}N.__version=T.version}function wt(N,T,Q,gt,ut,mt){let It=s.convert(Q.format,Q.colorSpace),St=s.convert(Q.type),Pt=M(Q.internalFormat,It,St,Q.colorSpace);if(!n.get(T).__hasExternalTextures){let Gt=Math.max(1,T.width>>mt),vt=Math.max(1,T.height>>mt);ut===r.TEXTURE_3D||ut===r.TEXTURE_2D_ARRAY?e.texImage3D(ut,mt,Pt,Gt,vt,T.depth,0,It,St,null):e.texImage2D(ut,mt,Pt,Gt,vt,0,It,St,null)}e.bindFramebuffer(r.FRAMEBUFFER,N),Mt(T)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,gt,ut,n.get(Q).__webglTexture,0,kt(T)):(ut===r.TEXTURE_2D||ut>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ut<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,gt,ut,n.get(Q).__webglTexture,mt),e.bindFramebuffer(r.FRAMEBUFFER,null)}function Tt(N,T,Q){if(r.bindRenderbuffer(r.RENDERBUFFER,N),T.depthBuffer&&!T.stencilBuffer){let gt=a===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(Q||Mt(T)){let ut=T.depthTexture;ut&&ut.isDepthTexture&&(ut.type===Je?gt=r.DEPTH_COMPONENT32F:ut.type===gi&&(gt=r.DEPTH_COMPONENT24));let mt=kt(T);Mt(T)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,mt,gt,T.width,T.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,mt,gt,T.width,T.height)}else r.renderbufferStorage(r.RENDERBUFFER,gt,T.width,T.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,N)}else if(T.depthBuffer&&T.stencilBuffer){let gt=kt(T);Q&&Mt(T)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,gt,r.DEPTH24_STENCIL8,T.width,T.height):Mt(T)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,gt,r.DEPTH24_STENCIL8,T.width,T.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,T.width,T.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,N)}else{let gt=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let ut=0;ut<gt.length;ut++){let mt=gt[ut],It=s.convert(mt.format,mt.colorSpace),St=s.convert(mt.type),Pt=M(mt.internalFormat,It,St,mt.colorSpace),Ot=kt(T);Q&&Mt(T)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot,Pt,T.width,T.height):Mt(T)?l.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot,Pt,T.width,T.height):r.renderbufferStorage(r.RENDERBUFFER,Pt,T.width,T.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function at(N,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(r.FRAMEBUFFER,N),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(T.depthTexture).__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),O(T.depthTexture,0);let gt=n.get(T.depthTexture).__webglTexture,ut=kt(T);if(T.depthTexture.format===Gi)Mt(T)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,gt,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,gt,0);else if(T.depthTexture.format===_i)Mt(T)?l.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,gt,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,gt,0);else throw new Error("Unknown depthTexture format")}function ft(N){let T=n.get(N),Q=N.isWebGLCubeRenderTarget===!0;if(N.depthTexture&&!T.__autoAllocateDepthBuffer){if(Q)throw new Error("target.depthTexture not supported in Cube render targets");at(T.__webglFramebuffer,N)}else if(Q){T.__webglDepthbuffer=[];for(let gt=0;gt<6;gt++)e.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer[gt]),T.__webglDepthbuffer[gt]=r.createRenderbuffer(),Tt(T.__webglDepthbuffer[gt],N,!1)}else e.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer=r.createRenderbuffer(),Tt(T.__webglDepthbuffer,N,!1);e.bindFramebuffer(r.FRAMEBUFFER,null)}function At(N,T,Q){let gt=n.get(N);T!==void 0&&wt(gt.__webglFramebuffer,N,N.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),Q!==void 0&&ft(N)}function q(N){let T=N.texture,Q=n.get(N),gt=n.get(T);N.addEventListener("dispose",W),N.isWebGLMultipleRenderTargets!==!0&&(gt.__webglTexture===void 0&&(gt.__webglTexture=r.createTexture()),gt.__version=T.version,o.memory.textures++);let ut=N.isWebGLCubeRenderTarget===!0,mt=N.isWebGLMultipleRenderTargets===!0,It=p(N)||a;if(ut){Q.__webglFramebuffer=[];for(let St=0;St<6;St++)if(a&&T.mipmaps&&T.mipmaps.length>0){Q.__webglFramebuffer[St]=[];for(let Pt=0;Pt<T.mipmaps.length;Pt++)Q.__webglFramebuffer[St][Pt]=r.createFramebuffer()}else Q.__webglFramebuffer[St]=r.createFramebuffer()}else{if(a&&T.mipmaps&&T.mipmaps.length>0){Q.__webglFramebuffer=[];for(let St=0;St<T.mipmaps.length;St++)Q.__webglFramebuffer[St]=r.createFramebuffer()}else Q.__webglFramebuffer=r.createFramebuffer();if(mt)if(i.drawBuffers){let St=N.texture;for(let Pt=0,Ot=St.length;Pt<Ot;Pt++){let Gt=n.get(St[Pt]);Gt.__webglTexture===void 0&&(Gt.__webglTexture=r.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&N.samples>0&&Mt(N)===!1){let St=mt?T:[T];Q.__webglMultisampledFramebuffer=r.createFramebuffer(),Q.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,Q.__webglMultisampledFramebuffer);for(let Pt=0;Pt<St.length;Pt++){let Ot=St[Pt];Q.__webglColorRenderbuffer[Pt]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,Q.__webglColorRenderbuffer[Pt]);let Gt=s.convert(Ot.format,Ot.colorSpace),vt=s.convert(Ot.type),fe=M(Ot.internalFormat,Gt,vt,Ot.colorSpace,N.isXRRenderTarget===!0),ae=kt(N);r.renderbufferStorageMultisample(r.RENDERBUFFER,ae,fe,N.width,N.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Pt,r.RENDERBUFFER,Q.__webglColorRenderbuffer[Pt])}r.bindRenderbuffer(r.RENDERBUFFER,null),N.depthBuffer&&(Q.__webglDepthRenderbuffer=r.createRenderbuffer(),Tt(Q.__webglDepthRenderbuffer,N,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ut){e.bindTexture(r.TEXTURE_CUBE_MAP,gt.__webglTexture),tt(r.TEXTURE_CUBE_MAP,T,It);for(let St=0;St<6;St++)if(a&&T.mipmaps&&T.mipmaps.length>0)for(let Pt=0;Pt<T.mipmaps.length;Pt++)wt(Q.__webglFramebuffer[St][Pt],N,T,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+St,Pt);else wt(Q.__webglFramebuffer[St],N,T,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+St,0);x(T,It)&&y(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(mt){let St=N.texture;for(let Pt=0,Ot=St.length;Pt<Ot;Pt++){let Gt=St[Pt],vt=n.get(Gt);e.bindTexture(r.TEXTURE_2D,vt.__webglTexture),tt(r.TEXTURE_2D,Gt,It),wt(Q.__webglFramebuffer,N,Gt,r.COLOR_ATTACHMENT0+Pt,r.TEXTURE_2D,0),x(Gt,It)&&y(r.TEXTURE_2D)}e.unbindTexture()}else{let St=r.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(a?St=N.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(St,gt.__webglTexture),tt(St,T,It),a&&T.mipmaps&&T.mipmaps.length>0)for(let Pt=0;Pt<T.mipmaps.length;Pt++)wt(Q.__webglFramebuffer[Pt],N,T,r.COLOR_ATTACHMENT0,St,Pt);else wt(Q.__webglFramebuffer,N,T,r.COLOR_ATTACHMENT0,St,0);x(T,It)&&y(St),e.unbindTexture()}N.depthBuffer&&ft(N)}function Ht(N){let T=p(N)||a,Q=N.isWebGLMultipleRenderTargets===!0?N.texture:[N.texture];for(let gt=0,ut=Q.length;gt<ut;gt++){let mt=Q[gt];if(x(mt,T)){let It=N.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,St=n.get(mt).__webglTexture;e.bindTexture(It,St),y(It),e.unbindTexture()}}}function Ct(N){if(a&&N.samples>0&&Mt(N)===!1){let T=N.isWebGLMultipleRenderTargets?N.texture:[N.texture],Q=N.width,gt=N.height,ut=r.COLOR_BUFFER_BIT,mt=[],It=N.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,St=n.get(N),Pt=N.isWebGLMultipleRenderTargets===!0;if(Pt)for(let Ot=0;Ot<T.length;Ot++)e.bindFramebuffer(r.FRAMEBUFFER,St.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,St.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,St.__webglMultisampledFramebuffer),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let Ot=0;Ot<T.length;Ot++){mt.push(r.COLOR_ATTACHMENT0+Ot),N.depthBuffer&&mt.push(It);let Gt=St.__ignoreDepthValues!==void 0?St.__ignoreDepthValues:!1;if(Gt===!1&&(N.depthBuffer&&(ut|=r.DEPTH_BUFFER_BIT),N.stencilBuffer&&(ut|=r.STENCIL_BUFFER_BIT)),Pt&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,St.__webglColorRenderbuffer[Ot]),Gt===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[It]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[It])),Pt){let vt=n.get(T[Ot]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,vt,0)}r.blitFramebuffer(0,0,Q,gt,0,0,Q,gt,ut,r.NEAREST),c&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,mt)}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Pt)for(let Ot=0;Ot<T.length;Ot++){e.bindFramebuffer(r.FRAMEBUFFER,St.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.RENDERBUFFER,St.__webglColorRenderbuffer[Ot]);let Gt=n.get(T[Ot]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,St.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.TEXTURE_2D,Gt,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,St.__webglMultisampledFramebuffer)}}function kt(N){return Math.min(i.maxSamples,N.samples)}function Mt(N){let T=n.get(N);return a&&N.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function ce(N){let T=o.render.frame;h.get(N)!==T&&(h.set(N,T),N.update())}function Zt(N,T){let Q=N.colorSpace,gt=N.format,ut=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||N.format===il||Q!==bn&&Q!==fn&&(be.getTransfer(Q)===Te?a===!1?t.has("EXT_sRGB")===!0&&gt===dn?(N.format=il,N.minFilter=Ye,N.generateMipmaps=!1):T=fo.sRGBToLinear(T):(gt!==dn||ut!==yi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Q)),T}this.allocateTextureUnit=L,this.resetTextureUnits=X,this.setTexture2D=O,this.setTexture2DArray=it,this.setTexture3D=$,this.setTextureCube=Z,this.rebindTextures=At,this.setupRenderTarget=q,this.updateRenderTargetMipmap=Ht,this.updateMultisampleRenderTarget=Ct,this.setupDepthRenderbuffer=ft,this.setupFrameBufferTexture=wt,this.useMultisampledRTT=Mt}function Rv(r,t,e){let n=e.isWebGL2;function i(s,o=fn){let a,l=be.getTransfer(o);if(s===yi)return r.UNSIGNED_BYTE;if(s===Mu)return r.UNSIGNED_SHORT_4_4_4_4;if(s===Su)return r.UNSIGNED_SHORT_5_5_5_1;if(s===lf)return r.BYTE;if(s===cf)return r.SHORT;if(s===Gl)return r.UNSIGNED_SHORT;if(s===wu)return r.INT;if(s===gi)return r.UNSIGNED_INT;if(s===Je)return r.FLOAT;if(s===cn)return n?r.HALF_FLOAT:(a=t.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===hf)return r.ALPHA;if(s===dn)return r.RGBA;if(s===Wl)return r.LUMINANCE;if(s===uf)return r.LUMINANCE_ALPHA;if(s===Gi)return r.DEPTH_COMPONENT;if(s===_i)return r.DEPTH_STENCIL;if(s===il)return a=t.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===gr)return r.RED;if(s===bu)return r.RED_INTEGER;if(s===df)return r.RG;if(s===Eu)return r.RG_INTEGER;if(s===Au)return r.RGBA_INTEGER;if(s===_a||s===wa||s===Ma||s===Sa)if(l===Te)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===_a)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===wa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Ma)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Sa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===_a)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===wa)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Ma)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Sa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===kc||s===Vc||s===Hc||s===Gc)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===kc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Vc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Hc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Gc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===Tu)return a=t.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Wc||s===Xc)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Wc)return l===Te?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===Xc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===qc||s===Yc||s===Zc||s===jc||s===$c||s===Kc||s===Jc||s===Qc||s===th||s===eh||s===nh||s===ih||s===sh||s===rh)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(s===qc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Yc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Zc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===jc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===$c)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Kc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Jc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Qc)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===th)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===eh)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===nh)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===ih)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===sh)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===rh)return l===Te?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===ba||s===oh||s===ah)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(s===ba)return l===Te?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===oh)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===ah)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===ff||s===lh||s===ch||s===hh)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(s===ba)return a.COMPRESSED_RED_RGTC1_EXT;if(s===lh)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===ch)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===hh)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===ti?n?r.UNSIGNED_INT_24_8:(a=t.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):r[s]!==void 0?r[s]:null}return{convert:i}}var vl=class extends He{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Qn=class extends Ne{constructor(){super(),this.isGroup=!0,this.type="Group"}},Pv={type:"move"},er=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,n),m=this._getHandJoint(c,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Pv)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Qn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},yl=class extends wi{constructor(t,e){super();let n=this,i=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null,v=e.getContextAttributes(),p=null,m=null,x=[],y=[],M=new re,I=null,A=new He;A.layers.enable(1),A.viewport=new ve;let P=new He;P.layers.enable(2),P.viewport=new ve;let W=[A,P],S=new vl;S.layers.enable(1),S.layers.enable(2);let b=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(tt){let ct=x[tt];return ct===void 0&&(ct=new er,x[tt]=ct),ct.getTargetRaySpace()},this.getControllerGrip=function(tt){let ct=x[tt];return ct===void 0&&(ct=new er,x[tt]=ct),ct.getGripSpace()},this.getHand=function(tt){let ct=x[tt];return ct===void 0&&(ct=new er,x[tt]=ct),ct.getHandSpace()};function Y(tt){let ct=y.indexOf(tt.inputSource);if(ct===-1)return;let _t=x[ct];_t!==void 0&&(_t.update(tt.inputSource,tt.frame,c||o),_t.dispatchEvent({type:tt.type,data:tt.inputSource}))}function X(){i.removeEventListener("select",Y),i.removeEventListener("selectstart",Y),i.removeEventListener("selectend",Y),i.removeEventListener("squeeze",Y),i.removeEventListener("squeezestart",Y),i.removeEventListener("squeezeend",Y),i.removeEventListener("end",X),i.removeEventListener("inputsourceschange",L);for(let tt=0;tt<x.length;tt++){let ct=y[tt];ct!==null&&(y[tt]=null,x[tt].disconnect(ct))}b=null,V=null,t.setRenderTarget(p),f=null,u=null,d=null,i=null,m=null,st.stop(),n.isPresenting=!1,t.setPixelRatio(I),t.setSize(M.width,M.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(tt){s=tt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(tt){a=tt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(tt){c=tt},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(tt){if(i=tt,i!==null){if(p=t.getRenderTarget(),i.addEventListener("select",Y),i.addEventListener("selectstart",Y),i.addEventListener("selectend",Y),i.addEventListener("squeeze",Y),i.addEventListener("squeezestart",Y),i.addEventListener("squeezeend",Y),i.addEventListener("end",X),i.addEventListener("inputsourceschange",L),v.xrCompatible!==!0&&await e.makeXRCompatible(),I=t.getPixelRatio(),t.getSize(M),i.renderState.layers===void 0||t.capabilities.isWebGL2===!1){let ct={antialias:i.renderState.layers===void 0?v.antialias:!0,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,e,ct),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),m=new mn(f.framebufferWidth,f.framebufferHeight,{format:dn,type:yi,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil})}else{let ct=null,_t=null,yt=null;v.depth&&(yt=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ct=v.stencil?_i:Gi,_t=v.stencil?ti:gi);let wt={colorFormat:e.RGBA8,depthFormat:yt,scaleFactor:s};d=new XRWebGLBinding(i,e),u=d.createProjectionLayer(wt),i.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),m=new mn(u.textureWidth,u.textureHeight,{format:dn,type:yi,depthTexture:new Is(u.textureWidth,u.textureHeight,_t,void 0,void 0,void 0,void 0,void 0,void 0,ct),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0});let Tt=t.properties.get(m);Tt.__ignoreDepthValues=u.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),st.setContext(i),st.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode};function L(tt){for(let ct=0;ct<tt.removed.length;ct++){let _t=tt.removed[ct],yt=y.indexOf(_t);yt>=0&&(y[yt]=null,x[yt].disconnect(_t))}for(let ct=0;ct<tt.added.length;ct++){let _t=tt.added[ct],yt=y.indexOf(_t);if(yt===-1){for(let Tt=0;Tt<x.length;Tt++)if(Tt>=y.length){y.push(_t),yt=Tt;break}else if(y[Tt]===null){y[Tt]=_t,yt=Tt;break}if(yt===-1)break}let wt=x[yt];wt&&wt.connect(_t)}}let U=new G,O=new G;function it(tt,ct,_t){U.setFromMatrixPosition(ct.matrixWorld),O.setFromMatrixPosition(_t.matrixWorld);let yt=U.distanceTo(O),wt=ct.projectionMatrix.elements,Tt=_t.projectionMatrix.elements,at=wt[14]/(wt[10]-1),ft=wt[14]/(wt[10]+1),At=(wt[9]+1)/wt[5],q=(wt[9]-1)/wt[5],Ht=(wt[8]-1)/wt[0],Ct=(Tt[8]+1)/Tt[0],kt=at*Ht,Mt=at*Ct,ce=yt/(-Ht+Ct),Zt=ce*-Ht;ct.matrixWorld.decompose(tt.position,tt.quaternion,tt.scale),tt.translateX(Zt),tt.translateZ(ce),tt.matrixWorld.compose(tt.position,tt.quaternion,tt.scale),tt.matrixWorldInverse.copy(tt.matrixWorld).invert();let N=at+ce,T=ft+ce,Q=kt-Zt,gt=Mt+(yt-Zt),ut=At*ft/T*N,mt=q*ft/T*N;tt.projectionMatrix.makePerspective(Q,gt,ut,mt,N,T),tt.projectionMatrixInverse.copy(tt.projectionMatrix).invert()}function $(tt,ct){ct===null?tt.matrixWorld.copy(tt.matrix):tt.matrixWorld.multiplyMatrices(ct.matrixWorld,tt.matrix),tt.matrixWorldInverse.copy(tt.matrixWorld).invert()}this.updateCamera=function(tt){if(i===null)return;S.near=P.near=A.near=tt.near,S.far=P.far=A.far=tt.far,(b!==S.near||V!==S.far)&&(i.updateRenderState({depthNear:S.near,depthFar:S.far}),b=S.near,V=S.far);let ct=tt.parent,_t=S.cameras;$(S,ct);for(let yt=0;yt<_t.length;yt++)$(_t[yt],ct);_t.length===2?it(S,A,P):S.projectionMatrix.copy(A.projectionMatrix),Z(tt,S,ct)};function Z(tt,ct,_t){_t===null?tt.matrix.copy(ct.matrixWorld):(tt.matrix.copy(_t.matrixWorld),tt.matrix.invert(),tt.matrix.multiply(ct.matrixWorld)),tt.matrix.decompose(tt.position,tt.quaternion,tt.scale),tt.updateMatrixWorld(!0),tt.projectionMatrix.copy(ct.projectionMatrix),tt.projectionMatrixInverse.copy(ct.projectionMatrixInverse),tt.isPerspectiveCamera&&(tt.fov=Es*2*Math.atan(1/tt.projectionMatrix.elements[5]),tt.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(tt){l=tt,u!==null&&(u.fixedFoveation=tt),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=tt)};let rt=null;function lt(tt,ct){if(h=ct.getViewerPose(c||o),g=ct,h!==null){let _t=h.views;f!==null&&(t.setRenderTargetFramebuffer(m,f.framebuffer),t.setRenderTarget(m));let yt=!1;_t.length!==S.cameras.length&&(S.cameras.length=0,yt=!0);for(let wt=0;wt<_t.length;wt++){let Tt=_t[wt],at=null;if(f!==null)at=f.getViewport(Tt);else{let At=d.getViewSubImage(u,Tt);at=At.viewport,wt===0&&(t.setRenderTargetTextures(m,At.colorTexture,u.ignoreDepthValues?void 0:At.depthStencilTexture),t.setRenderTarget(m))}let ft=W[wt];ft===void 0&&(ft=new He,ft.layers.enable(wt),ft.viewport=new ve,W[wt]=ft),ft.matrix.fromArray(Tt.transform.matrix),ft.matrix.decompose(ft.position,ft.quaternion,ft.scale),ft.projectionMatrix.fromArray(Tt.projectionMatrix),ft.projectionMatrixInverse.copy(ft.projectionMatrix).invert(),ft.viewport.set(at.x,at.y,at.width,at.height),wt===0&&(S.matrix.copy(ft.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),yt===!0&&S.cameras.push(ft)}}for(let _t=0;_t<x.length;_t++){let yt=y[_t],wt=x[_t];yt!==null&&wt!==void 0&&wt.update(yt,ct,c||o)}rt&&rt(tt,ct),ct.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ct}),g=null}let st=new Nu;st.setAnimationLoop(lt),this.setAnimationLoop=function(tt){rt=tt},this.dispose=function(){}}};function Iv(r,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Lu(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,x,y,M){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),d(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m)):m.isMeshStandardMaterial?(s(p,m),u(p,m),m.isMeshPhysicalMaterial&&f(p,m,M)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),v(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,x,y):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===pn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===pn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let x=t.get(m).envMap;if(x&&(p.envMap.value=x,p.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;let y=r._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*y,e(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,x,y){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*x,p.scale.value=y*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),t.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,x){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===pn&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){let x=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Lv(r,t,e,n){let i={},s={},o=[],a=e.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(x,y){let M=y.program;n.uniformBlockBinding(x,M)}function c(x,y){let M=i[x.id];M===void 0&&(g(x),M=h(x),i[x.id]=M,x.addEventListener("dispose",p));let I=y.program;n.updateUBOMapping(x,I);let A=t.render.frame;s[x.id]!==A&&(u(x),s[x.id]=A)}function h(x){let y=d();x.__bindingPointIndex=y;let M=r.createBuffer(),I=x.__size,A=x.usage;return r.bindBuffer(r.UNIFORM_BUFFER,M),r.bufferData(r.UNIFORM_BUFFER,I,A),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,y,M),M}function d(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){let y=i[x.id],M=x.uniforms,I=x.__cache;r.bindBuffer(r.UNIFORM_BUFFER,y);for(let A=0,P=M.length;A<P;A++){let W=Array.isArray(M[A])?M[A]:[M[A]];for(let S=0,b=W.length;S<b;S++){let V=W[S];if(f(V,A,S,I)===!0){let Y=V.__offset,X=Array.isArray(V.value)?V.value:[V.value],L=0;for(let U=0;U<X.length;U++){let O=X[U],it=v(O);typeof O=="number"||typeof O=="boolean"?(V.__data[0]=O,r.bufferSubData(r.UNIFORM_BUFFER,Y+L,V.__data)):O.isMatrix3?(V.__data[0]=O.elements[0],V.__data[1]=O.elements[1],V.__data[2]=O.elements[2],V.__data[3]=0,V.__data[4]=O.elements[3],V.__data[5]=O.elements[4],V.__data[6]=O.elements[5],V.__data[7]=0,V.__data[8]=O.elements[6],V.__data[9]=O.elements[7],V.__data[10]=O.elements[8],V.__data[11]=0):(O.toArray(V.__data,L),L+=it.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,Y,V.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(x,y,M,I){let A=x.value,P=y+"_"+M;if(I[P]===void 0)return typeof A=="number"||typeof A=="boolean"?I[P]=A:I[P]=A.clone(),!0;{let W=I[P];if(typeof A=="number"||typeof A=="boolean"){if(W!==A)return I[P]=A,!0}else if(W.equals(A)===!1)return W.copy(A),!0}return!1}function g(x){let y=x.uniforms,M=0,I=16;for(let P=0,W=y.length;P<W;P++){let S=Array.isArray(y[P])?y[P]:[y[P]];for(let b=0,V=S.length;b<V;b++){let Y=S[b],X=Array.isArray(Y.value)?Y.value:[Y.value];for(let L=0,U=X.length;L<U;L++){let O=X[L],it=v(O),$=M%I;$!==0&&I-$<it.boundary&&(M+=I-$),Y.__data=new Float32Array(it.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=M,M+=it.storage}}}let A=M%I;return A>0&&(M+=I-A),x.__size=M,x.__cache={},this}function v(x){let y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=48,y.storage=48):x.isMatrix4?(y.boundary=64,y.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),y}function p(x){let y=x.target;y.removeEventListener("dispose",p);let M=o.indexOf(y.__bindingPointIndex);o.splice(M,1),r.deleteBuffer(i[y.id]),delete i[y.id],delete s[y.id]}function m(){for(let x in i)r.deleteBuffer(i[x]);o=[],i={},s={}}return{bind:l,update:c,dispose:m}}var ar=class{constructor(t={}){let{canvas:e=zf(),context:n=null,depth:i=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1}=t;this.isWebGLRenderer=!0;let u;n!==null?u=n.getContextAttributes().alpha:u=o;let f=new Uint32Array(4),g=new Int32Array(4),v=null,p=null,m=[],x=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ce,this._useLegacyLights=!1,this.toneMapping=vi,this.toneMappingExposure=1;let y=this,M=!1,I=0,A=0,P=null,W=-1,S=null,b=new ve,V=new ve,Y=null,X=new $t(0),L=0,U=e.width,O=e.height,it=1,$=null,Z=null,rt=new ve(0,0,U,O),lt=new ve(0,0,U,O),st=!1,tt=new or,ct=!1,_t=!1,yt=null,wt=new qt,Tt=new re,at=new G,ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function At(){return P===null?it:1}let q=n;function Ht(_,D){for(let F=0;F<_.length;F++){let B=_[F],k=e.getContext(B,D);if(k!==null)return k}return null}try{let _={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r160"),e.addEventListener("webglcontextlost",K,!1),e.addEventListener("webglcontextrestored",H,!1),e.addEventListener("webglcontextcreationerror",Lt,!1),q===null){let D=["webgl2","webgl","experimental-webgl"];if(y.isWebGL1Renderer===!0&&D.shift(),q=Ht(D,_),q===null)throw Ht(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&q instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),q.getShaderPrecisionFormat===void 0&&(q.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(_){throw console.error("THREE.WebGLRenderer: "+_.message),_}let Ct,kt,Mt,ce,Zt,N,T,Q,gt,ut,mt,It,St,Pt,Ot,Gt,vt,fe,ae,Kt,Ut,Dt,Vt,Qt;function ne(){Ct=new Kg(q),kt=new Xg(q,Ct,t),Ct.init(kt),Dt=new Rv(q,Ct,kt),Mt=new Tv(q,Ct,kt),ce=new t0(q),Zt=new mv,N=new Cv(q,Ct,Mt,Zt,kt,Dt,ce),T=new Yg(y),Q=new $g(y),gt=new lp(q,kt),Vt=new Gg(q,Ct,gt,kt),ut=new Jg(q,gt,ce,Vt),mt=new s0(q,ut,gt,ce),ae=new i0(q,kt,N),Gt=new qg(Zt),It=new pv(y,T,Q,Ct,kt,Vt,Gt),St=new Iv(y,Zt),Pt=new vv,Ot=new Sv(Ct,kt),fe=new Hg(y,T,Q,Mt,mt,u,l),vt=new Av(y,mt,kt),Qt=new Lv(q,ce,kt,Mt),Kt=new Wg(q,Ct,ce,kt),Ut=new Qg(q,Ct,ce,kt),ce.programs=It.programs,y.capabilities=kt,y.extensions=Ct,y.properties=Zt,y.renderLists=Pt,y.shadowMap=vt,y.state=Mt,y.info=ce}ne();let te=new yl(y,q);this.xr=te,this.getContext=function(){return q},this.getContextAttributes=function(){return q.getContextAttributes()},this.forceContextLoss=function(){let _=Ct.get("WEBGL_lose_context");_&&_.loseContext()},this.forceContextRestore=function(){let _=Ct.get("WEBGL_lose_context");_&&_.restoreContext()},this.getPixelRatio=function(){return it},this.setPixelRatio=function(_){_!==void 0&&(it=_,this.setSize(U,O,!1))},this.getSize=function(_){return _.set(U,O)},this.setSize=function(_,D,F=!0){if(te.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=_,O=D,e.width=Math.floor(_*it),e.height=Math.floor(D*it),F===!0&&(e.style.width=_+"px",e.style.height=D+"px"),this.setViewport(0,0,_,D)},this.getDrawingBufferSize=function(_){return _.set(U*it,O*it).floor()},this.setDrawingBufferSize=function(_,D,F){U=_,O=D,it=F,e.width=Math.floor(_*F),e.height=Math.floor(D*F),this.setViewport(0,0,_,D)},this.getCurrentViewport=function(_){return _.copy(b)},this.getViewport=function(_){return _.copy(rt)},this.setViewport=function(_,D,F,B){_.isVector4?rt.set(_.x,_.y,_.z,_.w):rt.set(_,D,F,B),Mt.viewport(b.copy(rt).multiplyScalar(it).floor())},this.getScissor=function(_){return _.copy(lt)},this.setScissor=function(_,D,F,B){_.isVector4?lt.set(_.x,_.y,_.z,_.w):lt.set(_,D,F,B),Mt.scissor(V.copy(lt).multiplyScalar(it).floor())},this.getScissorTest=function(){return st},this.setScissorTest=function(_){Mt.setScissorTest(st=_)},this.setOpaqueSort=function(_){$=_},this.setTransparentSort=function(_){Z=_},this.getClearColor=function(_){return _.copy(fe.getClearColor())},this.setClearColor=function(){fe.setClearColor.apply(fe,arguments)},this.getClearAlpha=function(){return fe.getClearAlpha()},this.setClearAlpha=function(){fe.setClearAlpha.apply(fe,arguments)},this.clear=function(_=!0,D=!0,F=!0){let B=0;if(_){let k=!1;if(P!==null){let et=P.texture.format;k=et===Au||et===Eu||et===bu}if(k){let et=P.texture.type,J=et===yi||et===gi||et===Gl||et===ti||et===Mu||et===Su,ot=fe.getClearColor(),dt=fe.getClearAlpha(),pt=ot.r,xt=ot.g,bt=ot.b;J?(f[0]=pt,f[1]=xt,f[2]=bt,f[3]=dt,q.clearBufferuiv(q.COLOR,0,f)):(g[0]=pt,g[1]=xt,g[2]=bt,g[3]=dt,q.clearBufferiv(q.COLOR,0,g))}else B|=q.COLOR_BUFFER_BIT}D&&(B|=q.DEPTH_BUFFER_BIT),F&&(B|=q.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",K,!1),e.removeEventListener("webglcontextrestored",H,!1),e.removeEventListener("webglcontextcreationerror",Lt,!1),Pt.dispose(),Ot.dispose(),Zt.dispose(),T.dispose(),Q.dispose(),mt.dispose(),Vt.dispose(),Qt.dispose(),It.dispose(),te.dispose(),te.removeEventListener("sessionstart",Be),te.removeEventListener("sessionend",_e),yt&&(yt.dispose(),yt=null),ie.stop()};function K(_){_.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function H(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let _=ce.autoReset,D=vt.enabled,F=vt.autoUpdate,B=vt.needsUpdate,k=vt.type;ne(),ce.autoReset=_,vt.enabled=D,vt.autoUpdate=F,vt.needsUpdate=B,vt.type=k}function Lt(_){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",_.statusMessage)}function Nt(_){let D=_.target;D.removeEventListener("dispose",Nt),ee(D)}function ee(_){Jt(_),Zt.remove(_)}function Jt(_){let D=Zt.get(_).programs;D!==void 0&&(D.forEach(function(F){It.releaseProgram(F)}),_.isShaderMaterial&&It.releaseShaderCache(_))}this.renderBufferDirect=function(_,D,F,B,k,et){D===null&&(D=ft);let J=k.isMesh&&k.matrixWorld.determinant()<0,ot=w(_,D,F,B,k);Mt.setMaterial(B,J);let dt=F.index,pt=1;if(B.wireframe===!0){if(dt=ut.getWireframeAttribute(F),dt===void 0)return;pt=2}let xt=F.drawRange,bt=F.attributes.position,Et=xt.start*pt,Ft=(xt.start+xt.count)*pt;et!==null&&(Et=Math.max(Et,et.start*pt),Ft=Math.min(Ft,(et.start+et.count)*pt)),dt!==null?(Et=Math.max(Et,0),Ft=Math.min(Ft,dt.count)):bt!=null&&(Et=Math.max(Et,0),Ft=Math.min(Ft,bt.count));let Xt=Ft-Et;if(Xt<0||Xt===1/0)return;Vt.setup(k,B,ot,F,dt);let ge,se=Kt;if(dt!==null&&(ge=gt.get(dt),se=Ut,se.setIndex(ge)),k.isMesh)B.wireframe===!0?(Mt.setLineWidth(B.wireframeLinewidth*At()),se.setMode(q.LINES)):se.setMode(q.TRIANGLES);else if(k.isLine){let jt=B.linewidth;jt===void 0&&(jt=1),Mt.setLineWidth(jt*At()),k.isLineSegments?se.setMode(q.LINES):k.isLineLoop?se.setMode(q.LINE_LOOP):se.setMode(q.LINE_STRIP)}else k.isPoints?se.setMode(q.POINTS):k.isSprite&&se.setMode(q.TRIANGLES);if(k.isBatchedMesh)se.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else if(k.isInstancedMesh)se.renderInstances(Et,Xt,k.count);else if(F.isInstancedBufferGeometry){let jt=F._maxInstanceCount!==void 0?F._maxInstanceCount:1/0,we=Math.min(F.instanceCount,jt);se.renderInstances(Et,Xt,we)}else se.render(Et,Xt)};function xe(_,D,F){_.transparent===!0&&_.side===Nn&&_.forceSinglePass===!1?(_.side=pn,_.needsUpdate=!0,he(_,D,F),_.side=xi,_.needsUpdate=!0,he(_,D,F),_.side=Nn):he(_,D,F)}this.compile=function(_,D,F=null){F===null&&(F=_),p=Ot.get(F),p.init(),x.push(p),F.traverseVisible(function(k){k.isLight&&k.layers.test(D.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),_!==F&&_.traverseVisible(function(k){k.isLight&&k.layers.test(D.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights(y._useLegacyLights);let B=new Set;return _.traverse(function(k){let et=k.material;if(et)if(Array.isArray(et))for(let J=0;J<et.length;J++){let ot=et[J];xe(ot,F,k),B.add(ot)}else xe(et,F,k),B.add(et)}),x.pop(),p=null,B},this.compileAsync=function(_,D,F=null){let B=this.compile(_,D,F);return new Promise(k=>{function et(){if(B.forEach(function(J){Zt.get(J).currentProgram.isReady()&&B.delete(J)}),B.size===0){k(_);return}setTimeout(et,10)}Ct.get("KHR_parallel_shader_compile")!==null?et():setTimeout(et,10)})};let ye=null;function Re(_){ye&&ye(_)}function Be(){ie.stop()}function _e(){ie.start()}let ie=new Nu;ie.setAnimationLoop(Re),typeof self<"u"&&ie.setContext(self),this.setAnimationLoop=function(_){ye=_,te.setAnimationLoop(_),_===null?ie.stop():ie.start()},te.addEventListener("sessionstart",Be),te.addEventListener("sessionend",_e),this.render=function(_,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(D),D=te.getCamera()),_.isScene===!0&&_.onBeforeRender(y,_,D,P),p=Ot.get(_,x.length),p.init(),x.push(p),wt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),tt.setFromProjectionMatrix(wt),_t=this.localClippingEnabled,ct=Gt.init(this.clippingPlanes,_t),v=Pt.get(_,m.length),v.init(),m.push(v),on(_,D,0,y.sortObjects),v.finish(),y.sortObjects===!0&&v.sort($,Z),this.info.render.frame++,ct===!0&&Gt.beginShadows();let F=p.state.shadowsArray;if(vt.render(F,_,D),ct===!0&&Gt.endShadows(),this.info.autoReset===!0&&this.info.reset(),fe.render(v,_),p.setupLights(y._useLegacyLights),D.isArrayCamera){let B=D.cameras;for(let k=0,et=B.length;k<et;k++){let J=B[k];wn(v,_,J,J.viewport)}}else wn(v,_,D);P!==null&&(N.updateMultisampleRenderTarget(P),N.updateRenderTargetMipmap(P)),_.isScene===!0&&_.onAfterRender(y,_,D),Vt.resetDefaultState(),W=-1,S=null,x.pop(),x.length>0?p=x[x.length-1]:p=null,m.pop(),m.length>0?v=m[m.length-1]:v=null};function on(_,D,F,B){if(_.visible===!1)return;if(_.layers.test(D.layers)){if(_.isGroup)F=_.renderOrder;else if(_.isLOD)_.autoUpdate===!0&&_.update(D);else if(_.isLight)p.pushLight(_),_.castShadow&&p.pushShadow(_);else if(_.isSprite){if(!_.frustumCulled||tt.intersectsSprite(_)){B&&at.setFromMatrixPosition(_.matrixWorld).applyMatrix4(wt);let J=mt.update(_),ot=_.material;ot.visible&&v.push(_,J,ot,F,at.z,null)}}else if((_.isMesh||_.isLine||_.isPoints)&&(!_.frustumCulled||tt.intersectsObject(_))){let J=mt.update(_),ot=_.material;if(B&&(_.boundingSphere!==void 0?(_.boundingSphere===null&&_.computeBoundingSphere(),at.copy(_.boundingSphere.center)):(J.boundingSphere===null&&J.computeBoundingSphere(),at.copy(J.boundingSphere.center)),at.applyMatrix4(_.matrixWorld).applyMatrix4(wt)),Array.isArray(ot)){let dt=J.groups;for(let pt=0,xt=dt.length;pt<xt;pt++){let bt=dt[pt],Et=ot[bt.materialIndex];Et&&Et.visible&&v.push(_,J,Et,F,at.z,bt)}}else ot.visible&&v.push(_,J,ot,F,at.z,null)}}let et=_.children;for(let J=0,ot=et.length;J<ot;J++)on(et[J],D,F,B)}function wn(_,D,F,B){let k=_.opaque,et=_.transmissive,J=_.transparent;p.setupLightsView(F),ct===!0&&Gt.setGlobalState(y.clippingPlanes,F),et.length>0&&ci(k,et,D,F),B&&Mt.viewport(b.copy(B)),k.length>0&&Oe(k,D,F),et.length>0&&Oe(et,D,F),J.length>0&&Oe(J,D,F),Mt.buffers.depth.setTest(!0),Mt.buffers.depth.setMask(!0),Mt.buffers.color.setMask(!0),Mt.setPolygonOffset(!1)}function ci(_,D,F,B){if((F.isScene===!0?F.overrideMaterial:null)!==null)return;let et=kt.isWebGL2;yt===null&&(yt=new mn(1,1,{generateMipmaps:!0,type:Ct.has("EXT_color_buffer_half_float")?cn:yi,minFilter:bs,samples:et?4:0})),y.getDrawingBufferSize(Tt),et?yt.setSize(Tt.x,Tt.y):yt.setSize(uo(Tt.x),uo(Tt.y));let J=y.getRenderTarget();y.setRenderTarget(yt),y.getClearColor(X),L=y.getClearAlpha(),L<1&&y.setClearColor(16777215,.5),y.clear();let ot=y.toneMapping;y.toneMapping=vi,Oe(_,F,B),N.updateMultisampleRenderTarget(yt),N.updateRenderTargetMipmap(yt);let dt=!1;for(let pt=0,xt=D.length;pt<xt;pt++){let bt=D[pt],Et=bt.object,Ft=bt.geometry,Xt=bt.material,ge=bt.group;if(Xt.side===Nn&&Et.layers.test(B.layers)){let se=Xt.side;Xt.side=pn,Xt.needsUpdate=!0,Rn(Et,F,B,Ft,Xt,ge),Xt.side=se,Xt.needsUpdate=!0,dt=!0}}dt===!0&&(N.updateMultisampleRenderTarget(yt),N.updateRenderTargetMipmap(yt)),y.setRenderTarget(J),y.setClearColor(X,L),y.toneMapping=ot}function Oe(_,D,F){let B=D.isScene===!0?D.overrideMaterial:null;for(let k=0,et=_.length;k<et;k++){let J=_[k],ot=J.object,dt=J.geometry,pt=B===null?J.material:B,xt=J.group;ot.layers.test(F.layers)&&Rn(ot,D,F,dt,pt,xt)}}function Rn(_,D,F,B,k,et){_.onBeforeRender(y,D,F,B,k,et),_.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,_.matrixWorld),_.normalMatrix.getNormalMatrix(_.modelViewMatrix),k.onBeforeRender(y,D,F,B,_,et),k.transparent===!0&&k.side===Nn&&k.forceSinglePass===!1?(k.side=pn,k.needsUpdate=!0,y.renderBufferDirect(F,D,B,k,_,et),k.side=xi,k.needsUpdate=!0,y.renderBufferDirect(F,D,B,k,_,et),k.side=Nn):y.renderBufferDirect(F,D,B,k,_,et),_.onAfterRender(y,D,F,B,k,et)}function he(_,D,F){D.isScene!==!0&&(D=ft);let B=Zt.get(_),k=p.state.lights,et=p.state.shadowsArray,J=k.state.version,ot=It.getParameters(_,k.state,et,D,F),dt=It.getProgramCacheKey(ot),pt=B.programs;B.environment=_.isMeshStandardMaterial?D.environment:null,B.fog=D.fog,B.envMap=(_.isMeshStandardMaterial?Q:T).get(_.envMap||B.environment),pt===void 0&&(_.addEventListener("dispose",Nt),pt=new Map,B.programs=pt);let xt=pt.get(dt);if(xt!==void 0){if(B.currentProgram===xt&&B.lightsStateVersion===J)return Fi(_,ot),xt}else ot.uniforms=It.getUniforms(_),_.onBuild(F,ot,y),_.onBeforeCompile(ot,y),xt=It.acquireProgram(ot,dt),pt.set(dt,xt),B.uniforms=ot.uniforms;let bt=B.uniforms;return(!_.isShaderMaterial&&!_.isRawShaderMaterial||_.clipping===!0)&&(bt.clippingPlanes=Gt.uniform),Fi(_,ot),B.needsLights=z(_),B.lightsStateVersion=J,B.needsLights&&(bt.ambientLightColor.value=k.state.ambient,bt.lightProbe.value=k.state.probe,bt.directionalLights.value=k.state.directional,bt.directionalLightShadows.value=k.state.directionalShadow,bt.spotLights.value=k.state.spot,bt.spotLightShadows.value=k.state.spotShadow,bt.rectAreaLights.value=k.state.rectArea,bt.ltc_1.value=k.state.rectAreaLTC1,bt.ltc_2.value=k.state.rectAreaLTC2,bt.pointLights.value=k.state.point,bt.pointLightShadows.value=k.state.pointShadow,bt.hemisphereLights.value=k.state.hemi,bt.directionalShadowMap.value=k.state.directionalShadowMap,bt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,bt.spotShadowMap.value=k.state.spotShadowMap,bt.spotLightMatrix.value=k.state.spotLightMatrix,bt.spotLightMap.value=k.state.spotLightMap,bt.pointShadowMap.value=k.state.pointShadowMap,bt.pointShadowMatrix.value=k.state.pointShadowMatrix),B.currentProgram=xt,B.uniformsList=null,xt}function Di(_){if(_.uniformsList===null){let D=_.currentProgram.getUniforms();_.uniformsList=ws.seqWithValue(D.seq,_.uniforms)}return _.uniformsList}function Fi(_,D){let F=Zt.get(_);F.outputColorSpace=D.outputColorSpace,F.batching=D.batching,F.instancing=D.instancing,F.instancingColor=D.instancingColor,F.skinning=D.skinning,F.morphTargets=D.morphTargets,F.morphNormals=D.morphNormals,F.morphColors=D.morphColors,F.morphTargetsCount=D.morphTargetsCount,F.numClippingPlanes=D.numClippingPlanes,F.numIntersection=D.numClipIntersection,F.vertexAlphas=D.vertexAlphas,F.vertexTangents=D.vertexTangents,F.toneMapping=D.toneMapping}function w(_,D,F,B,k){D.isScene!==!0&&(D=ft),N.resetTextureUnits();let et=D.fog,J=B.isMeshStandardMaterial?D.environment:null,ot=P===null?y.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:bn,dt=(B.isMeshStandardMaterial?Q:T).get(B.envMap||J),pt=B.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,xt=!!F.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),bt=!!F.morphAttributes.position,Et=!!F.morphAttributes.normal,Ft=!!F.morphAttributes.color,Xt=vi;B.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Xt=y.toneMapping);let ge=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,se=ge!==void 0?ge.length:0,jt=Zt.get(B),we=p.state.lights;if(ct===!0&&(_t===!0||_!==S)){let Yt=_===S&&B.id===W;Gt.setState(B,_,Yt)}let Wt=!1;B.version===jt.__version?(jt.needsLights&&jt.lightsStateVersion!==we.state.version||jt.outputColorSpace!==ot||k.isBatchedMesh&&jt.batching===!1||!k.isBatchedMesh&&jt.batching===!0||k.isInstancedMesh&&jt.instancing===!1||!k.isInstancedMesh&&jt.instancing===!0||k.isSkinnedMesh&&jt.skinning===!1||!k.isSkinnedMesh&&jt.skinning===!0||k.isInstancedMesh&&jt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&jt.instancingColor===!1&&k.instanceColor!==null||jt.envMap!==dt||B.fog===!0&&jt.fog!==et||jt.numClippingPlanes!==void 0&&(jt.numClippingPlanes!==Gt.numPlanes||jt.numIntersection!==Gt.numIntersection)||jt.vertexAlphas!==pt||jt.vertexTangents!==xt||jt.morphTargets!==bt||jt.morphNormals!==Et||jt.morphColors!==Ft||jt.toneMapping!==Xt||kt.isWebGL2===!0&&jt.morphTargetsCount!==se)&&(Wt=!0):(Wt=!0,jt.__version=B.version);let Me=jt.currentProgram;Wt===!0&&(Me=he(B,D,k));let C=!1,j=!1,nt=!1,ht=Me.getUniforms(),Bt=jt.uniforms;if(Mt.useProgram(Me.program)&&(C=!0,j=!0,nt=!0),B.id!==W&&(W=B.id,j=!0),C||S!==_){ht.setValue(q,"projectionMatrix",_.projectionMatrix),ht.setValue(q,"viewMatrix",_.matrixWorldInverse);let Yt=ht.map.cameraPosition;Yt!==void 0&&Yt.setValue(q,at.setFromMatrixPosition(_.matrixWorld)),kt.logarithmicDepthBuffer&&ht.setValue(q,"logDepthBufFC",2/(Math.log(_.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&ht.setValue(q,"isOrthographic",_.isOrthographicCamera===!0),S!==_&&(S=_,j=!0,nt=!0)}if(k.isSkinnedMesh){ht.setOptional(q,k,"bindMatrix"),ht.setOptional(q,k,"bindMatrixInverse");let Yt=k.skeleton;Yt&&(kt.floatVertexTextures?(Yt.boneTexture===null&&Yt.computeBoneTexture(),ht.setValue(q,"boneTexture",Yt.boneTexture,N)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}k.isBatchedMesh&&(ht.setOptional(q,k,"batchingTexture"),ht.setValue(q,"batchingTexture",k._matricesTexture,N));let pe=F.morphAttributes;if((pe.position!==void 0||pe.normal!==void 0||pe.color!==void 0&&kt.isWebGL2===!0)&&ae.update(k,F,Me),(j||jt.receiveShadow!==k.receiveShadow)&&(jt.receiveShadow=k.receiveShadow,ht.setValue(q,"receiveShadow",k.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Bt.envMap.value=dt,Bt.flipEnvMap.value=dt.isCubeTexture&&dt.isRenderTargetTexture===!1?-1:1),j&&(ht.setValue(q,"toneMappingExposure",y.toneMappingExposure),jt.needsLights&&R(Bt,nt),et&&B.fog===!0&&St.refreshFogUniforms(Bt,et),St.refreshMaterialUniforms(Bt,B,it,O,yt),ws.upload(q,Di(jt),Bt,N)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(ws.upload(q,Di(jt),Bt,N),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&ht.setValue(q,"center",k.center),ht.setValue(q,"modelViewMatrix",k.modelViewMatrix),ht.setValue(q,"normalMatrix",k.normalMatrix),ht.setValue(q,"modelMatrix",k.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){let Yt=B.uniformsGroups;for(let oe=0,hi=Yt.length;oe<hi;oe++)if(kt.isWebGL2){let Ui=Yt[oe];Qt.update(Ui,Me),Qt.bind(Ui,Me)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Me}function R(_,D){_.ambientLightColor.needsUpdate=D,_.lightProbe.needsUpdate=D,_.directionalLights.needsUpdate=D,_.directionalLightShadows.needsUpdate=D,_.pointLights.needsUpdate=D,_.pointLightShadows.needsUpdate=D,_.spotLights.needsUpdate=D,_.spotLightShadows.needsUpdate=D,_.rectAreaLights.needsUpdate=D,_.hemisphereLights.needsUpdate=D}function z(_){return _.isMeshLambertMaterial||_.isMeshToonMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isShadowMaterial||_.isShaderMaterial&&_.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(_,D,F){Zt.get(_.texture).__webglTexture=D,Zt.get(_.depthTexture).__webglTexture=F;let B=Zt.get(_);B.__hasExternalTextures=!0,B.__hasExternalTextures&&(B.__autoAllocateDepthBuffer=F===void 0,B.__autoAllocateDepthBuffer||Ct.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(_,D){let F=Zt.get(_);F.__webglFramebuffer=D,F.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(_,D=0,F=0){P=_,I=D,A=F;let B=!0,k=null,et=!1,J=!1;if(_){let dt=Zt.get(_);dt.__useDefaultFramebuffer!==void 0?(Mt.bindFramebuffer(q.FRAMEBUFFER,null),B=!1):dt.__webglFramebuffer===void 0?N.setupRenderTarget(_):dt.__hasExternalTextures&&N.rebindTextures(_,Zt.get(_.texture).__webglTexture,Zt.get(_.depthTexture).__webglTexture);let pt=_.texture;(pt.isData3DTexture||pt.isDataArrayTexture||pt.isCompressedArrayTexture)&&(J=!0);let xt=Zt.get(_).__webglFramebuffer;_.isWebGLCubeRenderTarget?(Array.isArray(xt[D])?k=xt[D][F]:k=xt[D],et=!0):kt.isWebGL2&&_.samples>0&&N.useMultisampledRTT(_)===!1?k=Zt.get(_).__webglMultisampledFramebuffer:Array.isArray(xt)?k=xt[F]:k=xt,b.copy(_.viewport),V.copy(_.scissor),Y=_.scissorTest}else b.copy(rt).multiplyScalar(it).floor(),V.copy(lt).multiplyScalar(it).floor(),Y=st;if(Mt.bindFramebuffer(q.FRAMEBUFFER,k)&&kt.drawBuffers&&B&&Mt.drawBuffers(_,k),Mt.viewport(b),Mt.scissor(V),Mt.setScissorTest(Y),et){let dt=Zt.get(_.texture);q.framebufferTexture2D(q.FRAMEBUFFER,q.COLOR_ATTACHMENT0,q.TEXTURE_CUBE_MAP_POSITIVE_X+D,dt.__webglTexture,F)}else if(J){let dt=Zt.get(_.texture),pt=D||0;q.framebufferTextureLayer(q.FRAMEBUFFER,q.COLOR_ATTACHMENT0,dt.__webglTexture,F||0,pt)}W=-1},this.readRenderTargetPixels=function(_,D,F,B,k,et,J){if(!(_&&_.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ot=Zt.get(_).__webglFramebuffer;if(_.isWebGLCubeRenderTarget&&J!==void 0&&(ot=ot[J]),ot){Mt.bindFramebuffer(q.FRAMEBUFFER,ot);try{let dt=_.texture,pt=dt.format,xt=dt.type;if(pt!==dn&&Dt.convert(pt)!==q.getParameter(q.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let bt=xt===cn&&(Ct.has("EXT_color_buffer_half_float")||kt.isWebGL2&&Ct.has("EXT_color_buffer_float"));if(xt!==yi&&Dt.convert(xt)!==q.getParameter(q.IMPLEMENTATION_COLOR_READ_TYPE)&&!(xt===Je&&(kt.isWebGL2||Ct.has("OES_texture_float")||Ct.has("WEBGL_color_buffer_float")))&&!bt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=_.width-B&&F>=0&&F<=_.height-k&&q.readPixels(D,F,B,k,Dt.convert(pt),Dt.convert(xt),et)}finally{let dt=P!==null?Zt.get(P).__webglFramebuffer:null;Mt.bindFramebuffer(q.FRAMEBUFFER,dt)}}},this.copyFramebufferToTexture=function(_,D,F=0){let B=Math.pow(2,-F),k=Math.floor(D.image.width*B),et=Math.floor(D.image.height*B);N.setTexture2D(D,0),q.copyTexSubImage2D(q.TEXTURE_2D,F,0,0,_.x,_.y,k,et),Mt.unbindTexture()},this.copyTextureToTexture=function(_,D,F,B=0){let k=D.image.width,et=D.image.height,J=Dt.convert(F.format),ot=Dt.convert(F.type);N.setTexture2D(F,0),q.pixelStorei(q.UNPACK_FLIP_Y_WEBGL,F.flipY),q.pixelStorei(q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),q.pixelStorei(q.UNPACK_ALIGNMENT,F.unpackAlignment),D.isDataTexture?q.texSubImage2D(q.TEXTURE_2D,B,_.x,_.y,k,et,J,ot,D.image.data):D.isCompressedTexture?q.compressedTexSubImage2D(q.TEXTURE_2D,B,_.x,_.y,D.mipmaps[0].width,D.mipmaps[0].height,J,D.mipmaps[0].data):q.texSubImage2D(q.TEXTURE_2D,B,_.x,_.y,J,ot,D.image),B===0&&F.generateMipmaps&&q.generateMipmap(q.TEXTURE_2D),Mt.unbindTexture()},this.copyTextureToTexture3D=function(_,D,F,B,k=0){if(y.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let et=_.max.x-_.min.x+1,J=_.max.y-_.min.y+1,ot=_.max.z-_.min.z+1,dt=Dt.convert(B.format),pt=Dt.convert(B.type),xt;if(B.isData3DTexture)N.setTexture3D(B,0),xt=q.TEXTURE_3D;else if(B.isDataArrayTexture||B.isCompressedArrayTexture)N.setTexture2DArray(B,0),xt=q.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}q.pixelStorei(q.UNPACK_FLIP_Y_WEBGL,B.flipY),q.pixelStorei(q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),q.pixelStorei(q.UNPACK_ALIGNMENT,B.unpackAlignment);let bt=q.getParameter(q.UNPACK_ROW_LENGTH),Et=q.getParameter(q.UNPACK_IMAGE_HEIGHT),Ft=q.getParameter(q.UNPACK_SKIP_PIXELS),Xt=q.getParameter(q.UNPACK_SKIP_ROWS),ge=q.getParameter(q.UNPACK_SKIP_IMAGES),se=F.isCompressedTexture?F.mipmaps[k]:F.image;q.pixelStorei(q.UNPACK_ROW_LENGTH,se.width),q.pixelStorei(q.UNPACK_IMAGE_HEIGHT,se.height),q.pixelStorei(q.UNPACK_SKIP_PIXELS,_.min.x),q.pixelStorei(q.UNPACK_SKIP_ROWS,_.min.y),q.pixelStorei(q.UNPACK_SKIP_IMAGES,_.min.z),F.isDataTexture||F.isData3DTexture?q.texSubImage3D(xt,k,D.x,D.y,D.z,et,J,ot,dt,pt,se.data):F.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),q.compressedTexSubImage3D(xt,k,D.x,D.y,D.z,et,J,ot,dt,se.data)):q.texSubImage3D(xt,k,D.x,D.y,D.z,et,J,ot,dt,pt,se),q.pixelStorei(q.UNPACK_ROW_LENGTH,bt),q.pixelStorei(q.UNPACK_IMAGE_HEIGHT,Et),q.pixelStorei(q.UNPACK_SKIP_PIXELS,Ft),q.pixelStorei(q.UNPACK_SKIP_ROWS,Xt),q.pixelStorei(q.UNPACK_SKIP_IMAGES,ge),k===0&&B.generateMipmaps&&q.generateMipmap(xt),Mt.unbindTexture()},this.initTexture=function(_){_.isCubeTexture?N.setTextureCube(_,0):_.isData3DTexture?N.setTexture3D(_,0):_.isDataArrayTexture||_.isCompressedArrayTexture?N.setTexture2DArray(_,0):N.setTexture2D(_,0),Mt.unbindTexture()},this.resetState=function(){I=0,A=0,P=null,Mt.reset(),Vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===Xl?"display-p3":"srgb",e.unpackColorSpace=be.workingColorSpace===Go?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Ce?Wi:Cu}set outputEncoding(t){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=t===Wi?Ce:bn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}},xl=class extends ar{};xl.prototype.isWebGL1Renderer=!0;var _o=class extends Ne{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}};var eu=new G,nu=new ve,iu=new ve,Nv=new G,su=new qt,Qr=new G,Za=new Si,ru=new qt,ja=new As,wo=class extends Fe{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Oc,this.bindMatrix=new qt,this.bindMatrixInverse=new qt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new Mi),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Qr),this.boundingBox.expandByPoint(Qr)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Si),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Qr),this.boundingSphere.expandByPoint(Qr)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Za.copy(this.boundingSphere),Za.applyMatrix4(i),t.ray.intersectsSphere(Za)!==!1&&(ru.copy(i).invert(),ja.copy(t.ray).applyMatrix4(ru),!(this.boundingBox!==null&&ja.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,ja)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new ve,e=this.geometry.attributes.skinWeight;for(let n=0,i=e.count;n<i;n++){t.fromBufferAttribute(e,n);let s=1/t.manhattanLength();s!==1/0?t.multiplyScalar(s):t.set(1,0,0,0),e.setXYZW(n,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===Oc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===of?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let n=this.skeleton,i=this.geometry;nu.fromBufferAttribute(i.attributes.skinIndex,t),iu.fromBufferAttribute(i.attributes.skinWeight,t),eu.copy(e).applyMatrix4(this.bindMatrix),e.set(0,0,0);for(let s=0;s<4;s++){let o=iu.getComponent(s);if(o!==0){let a=nu.getComponent(s);su.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),e.addScaledVector(Nv.copy(eu).applyMatrix4(su),o)}}return e.applyMatrix4(this.bindMatrixInverse)}boneTransform(t,e){return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."),this.applyBoneTransform(t,e)}},Ls=class extends Ne{constructor(){super(),this.isBone=!0,this.type="Bone"}},Ns=class extends $e{constructor(t=null,e=1,n=1,i,s,o,a,l,c=ke,h=ke,d,u){super(null,o,a,l,c,h,i,s,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ou=new qt,Dv=new qt,Mo=class r{constructor(t=[],e=[]){this.uuid=Ri(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new qt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let n=new qt;this.bones[t]&&n.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];n&&n.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let t=this.bones,e=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,o=t.length;s<o;s++){let a=t[s]?t[s].matrixWorld:Dv;ou.multiplyMatrices(a,e[s]),ou.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new r(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let n=new Ns(e,t,t,dn,Je);return n.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=n,this}getBoneByName(t){for(let e=0,n=this.bones.length;e<n;e++){let i=this.bones[e];if(i.name===t)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let n=0,i=t.bones.length;n<i;n++){let s=t.bones[n],o=e[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new Ls),this.bones.push(o),this.boneInverses.push(new qt().fromArray(t.boneInverses[n]))}return this.init(),this}toJSON(){let t={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,n=this.boneInverses;for(let i=0,s=e.length;i<s;i++){let o=e[i];t.bones.push(o.uuid);let a=n[i];t.boneInverses.push(a.toArray())}return t}};var lr=class extends En{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new $t(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},au=new G,lu=new G,cu=new qt,$a=new As,to=new Si,So=class extends Ne{constructor(t=new tn,e=new lr){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let i=1,s=e.count;i<s;i++)au.fromBufferAttribute(e,i-1),lu.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=au.distanceTo(lu);t.setAttribute("lineDistance",new Le(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let n=this.geometry,i=this.matrixWorld,s=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),to.copy(n.boundingSphere),to.applyMatrix4(i),to.radius+=s,t.ray.intersectsSphere(to)===!1)return;cu.copy(i).invert(),$a.copy(t.ray).applyMatrix4(cu);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new G,h=new G,d=new G,u=new G,f=this.isLineSegments?2:1,g=n.index,p=n.attributes.position;if(g!==null){let m=Math.max(0,o.start),x=Math.min(g.count,o.start+o.count);for(let y=m,M=x-1;y<M;y+=f){let I=g.getX(y),A=g.getX(y+1);if(c.fromBufferAttribute(p,I),h.fromBufferAttribute(p,A),$a.distanceSqToSegment(c,h,u,d)>l)continue;u.applyMatrix4(this.matrixWorld);let W=t.ray.origin.distanceTo(u);W<t.near||W>t.far||e.push({distance:W,point:d.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}else{let m=Math.max(0,o.start),x=Math.min(p.count,o.start+o.count);for(let y=m,M=x-1;y<M;y+=f){if(c.fromBufferAttribute(p,y),h.fromBufferAttribute(p,y+1),$a.distanceSqToSegment(c,h,u,d)>l)continue;u.applyMatrix4(this.matrixWorld);let A=t.ray.origin.distanceTo(u);A<t.near||A>t.far||e.push({distance:A,point:d.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};var bo=class extends $e{constructor(t,e,n,i,s,o,a,l,c){super(t,e,n,i,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Eo=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,i=this.getPoint(0),s=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),s+=n.distanceTo(i),e.push(s),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),i=0,s=n.length,o;e?o=e:o=t*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(s-1);let h=n[i],u=n[i+1]-h,f=(o-h)/u;return(i+f)/(s-1)}getTangent(t,e){let i=t-1e-4,s=t+1e-4;i<0&&(i=0),s>1&&(s=1);let o=this.getPoint(i),a=this.getPoint(s),l=e||(o.isVector2?new re:new G);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new G,i=[],s=[],o=[],a=new G,l=new qt;for(let f=0;f<=t;f++){let g=f/t;i[f]=this.getTangentAt(g,new G)}s[0]=new G,o[0]=new G;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),d=Math.abs(i[0].y),u=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],a),o[0].crossVectors(i[0],s[0]);for(let f=1;f<=t;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Ze(i[f-1].dot(i[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(i[f],s[f])}if(e===!0){let f=Math.acos(Ze(s[0].dot(s[t]),-1,1));f/=t,i[0].dot(a.crossVectors(s[0],s[t]))>0&&(f=-f);for(let g=1;g<=t;g++)s[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],s[g])}return{tangents:i,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}};var Fv={triangulate:function(r,t,e=2){let n=t&&t.length,i=n?t[0]*e:r.length,s=zu(r,0,i,e,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,d,u,f;if(n&&(s=kv(r,t,s,e)),r.length>80*e){a=c=r[0],l=h=r[1];for(let g=e;g<i;g+=e)d=r[g],u=r[g+1],d<a&&(a=d),u<l&&(l=u),d>c&&(c=d),u>h&&(h=u);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return cr(s,o,e,a,l,f,0),o}};function zu(r,t,e,n,i){let s,o;if(i===Kv(r,t,e,n)>0)for(s=t;s<e;s+=n)o=hu(s,r[s],r[s+1],o);else for(s=e-n;s>=t;s-=n)o=hu(s,r[s],r[s+1],o);return o&&Xo(o,o.next)&&(ur(o),o=o.next),o}function Xi(r,t){if(!r)return r;t||(t=r);let e=r,n;do if(n=!1,!e.steiner&&(Xo(e,e.next)||Ie(e.prev,e,e.next)===0)){if(ur(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function cr(r,t,e,n,i,s,o){if(!r)return;!o&&s&&Xv(r,n,i,s);let a=r,l,c;for(;r.prev!==r.next;){if(l=r.prev,c=r.next,s?Bv(r,n,i,s):Uv(r)){t.push(l.i/e|0),t.push(r.i/e|0),t.push(c.i/e|0),ur(r),r=c.next,a=c.next;continue}if(r=c,r===a){o?o===1?(r=Ov(Xi(r),t,e),cr(r,t,e,n,i,s,2)):o===2&&zv(r,t,e,n,i,s):cr(Xi(r),t,e,n,i,s,1);break}}}function Uv(r){let t=r.prev,e=r,n=r.next;if(Ie(t,e,n)>=0)return!1;let i=t.x,s=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=i<s?i<o?i:o:s<o?s:o,d=a<l?a<c?a:c:l<c?l:c,u=i>s?i>o?i:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&ys(i,a,s,l,o,c,g.x,g.y)&&Ie(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Bv(r,t,e,n){let i=r.prev,s=r,o=r.next;if(Ie(i,s,o)>=0)return!1;let a=i.x,l=s.x,c=o.x,h=i.y,d=s.y,u=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<d?h<u?h:u:d<u?d:u,v=a>l?a>c?a:c:l>c?l:c,p=h>d?h>u?h:u:d>u?d:u,m=_l(f,g,t,e,n),x=_l(v,p,t,e,n),y=r.prevZ,M=r.nextZ;for(;y&&y.z>=m&&M&&M.z<=x;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=p&&y!==i&&y!==o&&ys(a,h,l,d,c,u,y.x,y.y)&&Ie(y.prev,y,y.next)>=0||(y=y.prevZ,M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&ys(a,h,l,d,c,u,M.x,M.y)&&Ie(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;y&&y.z>=m;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=p&&y!==i&&y!==o&&ys(a,h,l,d,c,u,y.x,y.y)&&Ie(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;M&&M.z<=x;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&ys(a,h,l,d,c,u,M.x,M.y)&&Ie(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Ov(r,t,e){let n=r;do{let i=n.prev,s=n.next.next;!Xo(i,s)&&ku(i,n,n.next,s)&&hr(i,s)&&hr(s,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(s.i/e|0),ur(n),ur(n.next),n=r=s),n=n.next}while(n!==r);return Xi(n)}function zv(r,t,e,n,i,s){let o=r;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Zv(o,a)){let l=Vu(o,a);o=Xi(o,o.next),l=Xi(l,l.next),cr(o,t,e,n,i,s,0),cr(l,t,e,n,i,s,0);return}a=a.next}o=o.next}while(o!==r)}function kv(r,t,e,n){let i=[],s,o,a,l,c;for(s=0,o=t.length;s<o;s++)a=t[s]*n,l=s<o-1?t[s+1]*n:r.length,c=zu(r,a,l,n,!1),c===c.next&&(c.steiner=!0),i.push(Yv(c));for(i.sort(Vv),s=0;s<i.length;s++)e=Hv(i[s],e);return e}function Vv(r,t){return r.x-t.x}function Hv(r,t){let e=Gv(r,t);if(!e)return t;let n=Vu(e,r);return Xi(n,n.next),Xi(e,e.next)}function Gv(r,t){let e=t,n=-1/0,i,s=r.x,o=r.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){let u=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=s&&u>n&&(n=u,i=e.x<e.next.x?e:e.next,u===s))return i}e=e.next}while(e!==t);if(!i)return null;let a=i,l=i.x,c=i.y,h=1/0,d;e=i;do s>=e.x&&e.x>=l&&s!==e.x&&ys(o<c?s:n,o,l,c,o<c?n:s,o,e.x,e.y)&&(d=Math.abs(o-e.y)/(s-e.x),hr(e,r)&&(d<h||d===h&&(e.x>i.x||e.x===i.x&&Wv(i,e)))&&(i=e,h=d)),e=e.next;while(e!==a);return i}function Wv(r,t){return Ie(r.prev,r,t.prev)<0&&Ie(t.next,r,r.next)<0}function Xv(r,t,e,n){let i=r;do i.z===0&&(i.z=_l(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==r);i.prevZ.nextZ=null,i.prevZ=null,qv(i)}function qv(r){let t,e,n,i,s,o,a,l,c=1;do{for(e=r,r=null,s=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,a--):(i=n,n=n.nextZ,l--),s?s.nextZ=i:r=i,i.prevZ=s,s=i;e=n}s.nextZ=null,c*=2}while(o>1);return r}function _l(r,t,e,n,i){return r=(r-e)*i|0,t=(t-n)*i|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,r|t<<1}function Yv(r){let t=r,e=r;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==r);return e}function ys(r,t,e,n,i,s,o,a){return(i-o)*(t-a)>=(r-o)*(s-a)&&(r-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(s-a)>=(i-o)*(n-a)}function Zv(r,t){return r.next.i!==t.i&&r.prev.i!==t.i&&!jv(r,t)&&(hr(r,t)&&hr(t,r)&&$v(r,t)&&(Ie(r.prev,r,t.prev)||Ie(r,t.prev,t))||Xo(r,t)&&Ie(r.prev,r,r.next)>0&&Ie(t.prev,t,t.next)>0)}function Ie(r,t,e){return(t.y-r.y)*(e.x-t.x)-(t.x-r.x)*(e.y-t.y)}function Xo(r,t){return r.x===t.x&&r.y===t.y}function ku(r,t,e,n){let i=no(Ie(r,t,e)),s=no(Ie(r,t,n)),o=no(Ie(e,n,r)),a=no(Ie(e,n,t));return!!(i!==s&&o!==a||i===0&&eo(r,e,t)||s===0&&eo(r,n,t)||o===0&&eo(e,r,n)||a===0&&eo(e,t,n))}function eo(r,t,e){return t.x<=Math.max(r.x,e.x)&&t.x>=Math.min(r.x,e.x)&&t.y<=Math.max(r.y,e.y)&&t.y>=Math.min(r.y,e.y)}function no(r){return r>0?1:r<0?-1:0}function jv(r,t){let e=r;do{if(e.i!==r.i&&e.next.i!==r.i&&e.i!==t.i&&e.next.i!==t.i&&ku(e,e.next,r,t))return!0;e=e.next}while(e!==r);return!1}function hr(r,t){return Ie(r.prev,r,r.next)<0?Ie(r,t,r.next)>=0&&Ie(r,r.prev,t)>=0:Ie(r,t,r.prev)<0||Ie(r,r.next,t)<0}function $v(r,t){let e=r,n=!1,i=(r.x+t.x)/2,s=(r.y+t.y)/2;do e.y>s!=e.next.y>s&&e.next.y!==e.y&&i<(e.next.x-e.x)*(s-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==r);return n}function Vu(r,t){let e=new wl(r.i,r.x,r.y),n=new wl(t.i,t.x,t.y),i=r.next,s=t.prev;return r.next=t,t.prev=r,e.next=i,i.prev=e,n.next=e,e.prev=n,s.next=n,n.prev=s,n}function hu(r,t,e,n){let i=new wl(r,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function ur(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function wl(r,t,e){this.i=r,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Kv(r,t,e,n){let i=0;for(let s=t,o=e-n;s<e;s+=n)i+=(r[o]-r[s])*(r[s+1]+r[o+1]),o=s;return i}var Ao=class r{static area(t){let e=t.length,n=0;for(let i=e-1,s=0;s<e;i=s++)n+=t[i].x*t[s].y-t[s].x*t[i].y;return n*.5}static isClockWise(t){return r.area(t)<0}static triangulateShape(t,e){let n=[],i=[],s=[];uu(t),du(n,t);let o=t.length;e.forEach(uu);for(let l=0;l<e.length;l++)i.push(o),o+=e[l].length,du(n,e[l]);let a=Fv.triangulate(n,i);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function uu(r){let t=r.length;t>2&&r[t-1].equals(r[0])&&r.pop()}function du(r,t){for(let e=0;e<t.length;e++)r.push(t[e].x),r.push(t[e].y)}var To=class r extends tn{constructor(t=1,e=32,n=16,i=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],d=new G,u=new G,f=[],g=[],v=[],p=[];for(let m=0;m<=n;m++){let x=[],y=m/n,M=0;m===0&&o===0?M=.5/e:m===n&&l===Math.PI&&(M=-.5/e);for(let I=0;I<=e;I++){let A=I/e;d.x=-t*Math.cos(i+A*s)*Math.sin(o+y*a),d.y=t*Math.cos(o+y*a),d.z=t*Math.sin(i+A*s)*Math.sin(o+y*a),g.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),p.push(A+M,1-y),x.push(c++)}h.push(x)}for(let m=0;m<n;m++)for(let x=0;x<e;x++){let y=h[m][x+1],M=h[m][x],I=h[m+1][x],A=h[m+1][x+1];(m!==0||o>0)&&f.push(y,M,A),(m!==n-1||l<Math.PI)&&f.push(M,I,A)}this.setIndex(f),this.setAttribute("position",new Le(g,3)),this.setAttribute("normal",new Le(v,3)),this.setAttribute("uv",new Le(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Co=class extends En{constructor(t){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new $t(0),this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.fog=t.fog,this}},Ro=class extends Ke{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ds=class extends En{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new $t(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vr,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Fs=class extends En{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new $t(16777215),this.specular=new $t(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vr,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Po=class extends En{constructor(t){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vr,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(t)}copy(t){return super.copy(t),this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this}},Io=class extends En{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vr,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};function io(r,t,e){return!r||!e&&r.constructor===t?r:typeof t.BYTES_PER_ELEMENT=="number"?new t(r):Array.prototype.slice.call(r)}function Jv(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Qv(r){function t(i,s){return r[i]-r[s]}let e=r.length,n=new Array(e);for(let i=0;i!==e;++i)n[i]=i;return n.sort(t),n}function fu(r,t,e){let n=r.length,i=new r.constructor(n);for(let s=0,o=0;o!==n;++s){let a=e[s]*t;for(let l=0;l!==t;++l)i[o++]=r[a+l]}return i}function Hu(r,t,e,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(t.push(s.time),e.push.apply(e,o)),s=r[i++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(t.push(s.time),o.toArray(e,e.length)),s=r[i++];while(s!==void 0);else do o=s[n],o!==void 0&&(t.push(s.time),e.push(o)),s=r[i++];while(s!==void 0)}var Us=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],s=e[n-1];n:{t:{let o;e:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<s)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=e[++n],t<i)break t}o=e.length;break e}if(!(t>=s)){let a=e[1];t<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=e[--n-1],t>=s)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],s=e[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=t*i;for(let o=0;o!==i;++o)e[o]=n[s+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ml=class extends Us{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:uh,endingEnd:uh}}intervalChanged_(t,e,n){let i=this.parameterPositions,s=t-2,o=t+1,a=i[s],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case dh:s=t,a=2*e-n;break;case fh:s=i.length-2,a=e+i[s]-i[s+1];break;default:s=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case dh:o=t,l=2*n-e;break;case fh:o=1,l=n+i[1]-i[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(n-e)/(i-e),v=g*g,p=v*g,m=-u*p+2*u*v-u*g,x=(1+u)*p+(-1.5-2*u)*v+(-.5+u)*g+1,y=(-1-f)*p+(1.5+f)*v+.5*g,M=f*p-f*v;for(let I=0;I!==a;++I)s[I]=m*o[h+I]+x*o[c+I]+y*o[l+I]+M*o[d+I];return s}},Sl=class extends Us{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(i-e),d=1-h;for(let u=0;u!==a;++u)s[u]=o[c+u]*d+o[l+u]*h;return s}},bl=class extends Us{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},An=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=io(e,this.TimeBufferType),this.values=io(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:io(t.times,Array),values:io(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new bl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Sl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ml(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case ro:e=this.InterpolantFactoryMethodDiscrete;break;case oo:e=this.InterpolantFactoryMethodLinear;break;case Ea:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ro;case this.InterpolantFactoryMethodLinear:return oo;case this.InterpolantFactoryMethodSmooth:return Ea}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t}return this}trim(t,e){let n=this.times,i=n.length,s=0,o=i-1;for(;s!==i&&n[s]<t;)++s;for(;o!==-1&&n[o]>e;)--o;if(++o,s!==0||o!==i){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(i!==void 0&&Jv(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Ea,s=t.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(i)l=!0;else{let d=a*n,u=d-n,f=d+n;for(let g=0;g!==n;++g){let v=e[d+g];if(v!==e[u+g]||v!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let d=a*n,u=o*n;for(let f=0;f!==n;++f)e[u+f]=e[d+f]}++o}}if(s>0){t[o]=t[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,i}};An.prototype.TimeBufferType=Float32Array;An.prototype.ValueBufferType=Float32Array;An.prototype.DefaultInterpolation=oo;var Ei=class extends An{};Ei.prototype.ValueTypeName="bool";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=ro;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Lo=class extends An{};Lo.prototype.ValueTypeName="color";var Ai=class extends An{};Ai.prototype.ValueTypeName="number";var El=class extends Us{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(i-e),c=t*a;for(let h=c+a;c!==h;c+=4)Ve.slerpFlat(s,0,o,c-a,o,c,l);return s}},zn=class extends An{InterpolantFactoryMethodLinear(t){return new El(this.times,this.values,this.getValueSize(),t)}};zn.prototype.ValueTypeName="quaternion";zn.prototype.DefaultInterpolation=oo;zn.prototype.InterpolantFactoryMethodSmooth=void 0;var Ti=class extends An{};Ti.prototype.ValueTypeName="string";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=ro;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;var Ci=class extends An{};Ci.prototype.ValueTypeName="vector";var No=class{constructor(t,e=-1,n,i=pf){this.name=t,this.tracks=n,this.duration=e,this.blendMode=i,this.uuid=Ri(),this.duration<0&&this.resetDuration()}static parse(t){let e=[],n=t.tracks,i=1/(t.fps||1);for(let o=0,a=n.length;o!==a;++o)e.push(ey(n[o]).scale(i));let s=new this(t.name,t.duration,e,t.blendMode);return s.uuid=t.uuid,s}static toJSON(t){let e=[],n=t.tracks,i={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode};for(let s=0,o=n.length;s!==o;++s)e.push(An.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(t,e,n,i){let s=e.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);let h=Qv(l);l=fu(l,1,h),c=fu(c,1,h),!i&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Ai(".morphTargetInfluences["+e[a].name+"]",l,c).scale(1/n))}return new this(t,-1,o)}static findByName(t,e){let n=t;if(!Array.isArray(t)){let i=t;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===e)return n[i];return null}static CreateClipsFromMorphTargetSequences(t,e,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=t.length;a<l;a++){let c=t[a],h=c.name.match(s);if(h&&h.length>1){let d=h[1],u=i[d];u||(i[d]=u=[]),u.push(c)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],e,n));return o}static parseAnimation(t,e){if(!t)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(d,u,f,g,v){if(f.length!==0){let p=[],m=[];Hu(f,p,m,g),p.length!==0&&v.push(new d(u,p,m))}},i=[],s=t.name||"default",o=t.fps||30,a=t.blendMode,l=t.length||-1,c=t.hierarchy||[];for(let d=0;d<c.length;d++){let u=c[d].keys;if(!(!u||u.length===0))if(u[0].morphTargets){let f={},g;for(g=0;g<u.length;g++)if(u[g].morphTargets)for(let v=0;v<u[g].morphTargets.length;v++)f[u[g].morphTargets[v]]=-1;for(let v in f){let p=[],m=[];for(let x=0;x!==u[g].morphTargets.length;++x){let y=u[g];p.push(y.time),m.push(y.morphTarget===v?1:0)}i.push(new Ai(".morphTargetInfluence["+v+"]",p,m))}l=f.length*o}else{let f=".bones["+e[d].name+"]";n(Ci,f+".position",u,"pos",i),n(zn,f+".quaternion",u,"rot",i),n(Ci,f+".scale",u,"scl",i)}}return i.length===0?null:new this(s,l,i,a)}resetDuration(){let t=this.tracks,e=0;for(let n=0,i=t.length;n!==i;++n){let s=this.tracks[n];e=Math.max(e,s.times[s.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let e=0;e<this.tracks.length;e++)t.push(this.tracks[e].clone());return new this.constructor(this.name,this.duration,t,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function ty(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ai;case"vector":case"vector2":case"vector3":case"vector4":return Ci;case"color":return Lo;case"quaternion":return zn;case"bool":case"boolean":return Ei;case"string":return Ti}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function ey(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=ty(r.type);if(r.times===void 0){let e=[],n=[];Hu(r.keys,e,n,"value"),r.times=e,r.values=n}return t.parse!==void 0?t.parse(r):new t(r.name,r.times,r.values,r.interpolation)}var Do={enabled:!1,files:{},add:function(r,t){this.enabled!==!1&&(this.files[r]=t)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}},Al=class{constructor(t,e,n){let i=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){a++,s===!1&&i.onStart!==void 0&&i.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}},ny=new Al,Dn=class{constructor(t){this.manager=t!==void 0?t:ny,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,s){n.load(t,i,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Dn.DEFAULT_MATERIAL_NAME="__DEFAULT";var jn={},Tl=class extends Error{constructor(t,e){super(t),this.response=e}},dr=class extends Dn{constructor(t){super(t)}load(t,e,n,i){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let s=Do.get(t);if(s!==void 0)return this.manager.itemStart(t),setTimeout(()=>{e&&e(s),this.manager.itemEnd(t)},0),s;if(jn[t]!==void 0){jn[t].push({onLoad:e,onProgress:n,onError:i});return}jn[t]=[],jn[t].push({onLoad:e,onProgress:n,onError:i});let o=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=jn[t],d=c.body.getReader(),u=c.headers.get("Content-Length")||c.headers.get("X-File-Size"),f=u?parseInt(u):0,g=f!==0,v=0,p=new ReadableStream({start(m){x();function x(){d.read().then(({done:y,value:M})=>{if(y)m.close();else{v+=M.byteLength;let I=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let A=0,P=h.length;A<P;A++){let W=h[A];W.onProgress&&W.onProgress(I)}m.enqueue(M),x()}})}}});return new Response(p)}else throw new Tl(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{let d=/charset="?([^;"\s]*)"?/i.exec(a),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Do.add(t,c);let h=jn[t];delete jn[t];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{let h=jn[t];if(h===void 0)throw this.manager.itemError(t),c;delete jn[t];for(let d=0,u=h.length;d<u;d++){let f=h[d];f.onError&&f.onError(c)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}};var Cl=class extends Dn{constructor(t){super(t)}load(t,e,n,i){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let s=this,o=Do.get(t);if(o!==void 0)return s.manager.itemStart(t),setTimeout(function(){e&&e(o),s.manager.itemEnd(t)},0),o;let a=ir("img");function l(){h(),Do.add(t,this),e&&e(this),s.manager.itemEnd(t)}function c(d){h(),i&&i(d),s.manager.itemError(t),s.manager.itemEnd(t)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(t),a.src=t,a}};var Fo=class extends Dn{constructor(t){super(t)}load(t,e,n,i){let s=this,o=new Ns,a=new dr(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(t,function(l){let c;try{c=s.parse(l)}catch(h){if(i!==void 0)i(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:rn,o.wrapT=c.wrapT!==void 0?c.wrapT:rn,o.magFilter=c.magFilter!==void 0?c.magFilter:Ye,o.minFilter=c.minFilter!==void 0?c.minFilter:Ye,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0?o.colorSpace=c.colorSpace:c.encoding!==void 0&&(o.encoding=c.encoding),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=bs),c.mipmapCount===1&&(o.minFilter=Ye),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,e&&e(o,c)},n,i),o}},Uo=class extends Dn{constructor(t){super(t)}load(t,e,n,i){let s=new $e,o=new Cl(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(t,function(a){s.image=a,s.needsUpdate=!0,e!==void 0&&e(s)},n,i),s}},Bs=class extends Ne{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new $t(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}};var Ka=new qt,pu=new G,mu=new G,fr=class{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new re(512,512),this.map=null,this.mapPass=null,this.matrix=new qt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new or,this._frameExtents=new re(1,1),this._viewportCount=1,this._viewports=[new ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;pu.setFromMatrixPosition(t.matrixWorld),e.position.copy(pu),mu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(mu),e.updateMatrixWorld(),Ka.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ka),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ka)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Rl=class extends fr{constructor(){super(new He(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(t){let e=this.camera,n=Es*2*t.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=t.distance||e.far;(n!==e.fov||i!==e.aspect||s!==e.far)&&(e.fov=n,e.aspect=i,e.far=s,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this}},Bo=class extends Bs{constructor(t,e,n=0,i=Math.PI/3,s=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.target=new Ne,this.distance=n,this.angle=i,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Rl}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},gu=new qt,Ks=new G,Ja=new G,Pl=class extends fr{constructor(){super(new He(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new re(4,2),this._viewportCount=6,this._viewports=[new ve(2,1,1,1),new ve(0,1,1,1),new ve(3,1,1,1),new ve(1,1,1,1),new ve(3,0,1,1),new ve(1,0,1,1)],this._cubeDirections=[new G(1,0,0),new G(-1,0,0),new G(0,0,1),new G(0,0,-1),new G(0,1,0),new G(0,-1,0)],this._cubeUps=[new G(0,1,0),new G(0,1,0),new G(0,1,0),new G(0,1,0),new G(0,0,1),new G(0,0,-1)]}updateMatrices(t,e=0){let n=this.camera,i=this.matrix,s=t.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Ks.setFromMatrixPosition(t.matrixWorld),n.position.copy(Ks),Ja.copy(n.position),Ja.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Ja),n.updateMatrixWorld(),i.makeTranslation(-Ks.x,-Ks.y,-Ks.z),gu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(gu)}},pr=class extends Bs{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Pl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},Il=class extends fr{constructor(){super(new bi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},qi=class extends Bs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.target=new Ne,this.shadow=new Il}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},Os=class extends Bs{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var Oo=class{static decodeText(t){if(typeof TextDecoder<"u")return new TextDecoder().decode(t);let e="";for(let n=0,i=t.length;n<i;n++)e+=String.fromCharCode(t[n]);try{return decodeURIComponent(escape(e))}catch{return e}}static extractUrlBase(t){let e=t.lastIndexOf("/");return e===-1?"./":t.slice(0,e+1)}static resolveURL(t,e){return typeof t!="string"||t===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(t)&&(e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(t)||/^data:.*,.*$/i.test(t)||/^blob:.*$/i.test(t)?t:e+t)}};var zo=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=vu(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=vu();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function vu(){return(typeof performance>"u"?Date:performance).now()}var $l="\\[\\]\\.:\\/",iy=new RegExp("["+$l+"]","g"),Kl="[^"+$l+"]",sy="[^"+$l.replace("\\.","")+"]",ry=/((?:WC+[\/:])*)/.source.replace("WC",Kl),oy=/(WCOD+)?/.source.replace("WCOD",sy),ay=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Kl),ly=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Kl),cy=new RegExp("^"+ry+oy+ay+ly+"$"),hy=["material","materials","bones","map"],Ll=class{constructor(t,e,n){let i=n||Ae.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Ae=class r{constructor(t,e,n){this.path=e,this.parsedPath=n||r.parseTrackName(e),this.node=r.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new r.Composite(t,e,n):new r(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(iy,"")}static parseTrackName(t){let e=cy.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);hy.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,s=e.propertyIndex;if(t||(t=r.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[i];if(o===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ae.Composite=Ll;Ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ae.prototype.GetterByBindingType=[Ae.prototype._getValue_direct,Ae.prototype._getValue_array,Ae.prototype._getValue_arrayElement,Ae.prototype._getValue_toArray];Ae.prototype.SetterByBindingTypeAndVersioning=[[Ae.prototype._setValue_direct,Ae.prototype._setValue_direct_setNeedsUpdate,Ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_array,Ae.prototype._setValue_array_setNeedsUpdate,Ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_arrayElement,Ae.prototype._setValue_arrayElement_setNeedsUpdate,Ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_fromArray,Ae.prototype._setValue_fromArray_setNeedsUpdate,Ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var aw=new Float32Array(1);var mr=class{constructor(t,e,n=0,i=1/0){this.ray=new As(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new sr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}intersectObject(t,e=!0,n=[]){return Nl(t,this,n,e),n.sort(yu),n}intersectObjects(t,e=!0,n=[]){for(let i=0,s=t.length;i<s;i++)Nl(t[i],this,n,e);return n.sort(yu),n}};function yu(r,t){return r.distance-t.distance}function Nl(r,t,e,n){if(r.layers.test(t.layers)&&r.raycast(t,e),n===!0){let i=r.children;for(let s=0,o=i.length;s<o;s++)Nl(i[s],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var Ii=class r{constructor(t){t===void 0&&(t=[0,0,0,0,0,0,0,0,0]),this.elements=t}identity(){let t=this.elements;t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1}setZero(){let t=this.elements;t[0]=0,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t[8]=0}setTrace(t){let e=this.elements;e[0]=t.x,e[4]=t.y,e[8]=t.z}getTrace(t){t===void 0&&(t=new E);let e=this.elements;return t.x=e[0],t.y=e[4],t.z=e[8],t}vmult(t,e){e===void 0&&(e=new E);let n=this.elements,i=t.x,s=t.y,o=t.z;return e.x=n[0]*i+n[1]*s+n[2]*o,e.y=n[3]*i+n[4]*s+n[5]*o,e.z=n[6]*i+n[7]*s+n[8]*o,e}smult(t){for(let e=0;e<this.elements.length;e++)this.elements[e]*=t}mmult(t,e){e===void 0&&(e=new r);let n=this.elements,i=t.elements,s=e.elements,o=n[0],a=n[1],l=n[2],c=n[3],h=n[4],d=n[5],u=n[6],f=n[7],g=n[8],v=i[0],p=i[1],m=i[2],x=i[3],y=i[4],M=i[5],I=i[6],A=i[7],P=i[8];return s[0]=o*v+a*x+l*I,s[1]=o*p+a*y+l*A,s[2]=o*m+a*M+l*P,s[3]=c*v+h*x+d*I,s[4]=c*p+h*y+d*A,s[5]=c*m+h*M+d*P,s[6]=u*v+f*x+g*I,s[7]=u*p+f*y+g*A,s[8]=u*m+f*M+g*P,e}scale(t,e){e===void 0&&(e=new r);let n=this.elements,i=e.elements;for(let s=0;s!==3;s++)i[3*s+0]=t.x*n[3*s+0],i[3*s+1]=t.y*n[3*s+1],i[3*s+2]=t.z*n[3*s+2];return e}solve(t,e){e===void 0&&(e=new E);let n=3,i=4,s=[],o,a;for(o=0;o<n*i;o++)s.push(0);for(o=0;o<3;o++)for(a=0;a<3;a++)s[o+i*a]=this.elements[o+3*a];s[3]=t.x,s[7]=t.y,s[11]=t.z;let l=3,c=l,h,d=4,u;do{if(o=c-l,s[o+i*o]===0){for(a=o+1;a<c;a++)if(s[o+i*a]!==0){h=d;do u=d-h,s[u+i*o]+=s[u+i*a];while(--h);break}}if(s[o+i*o]!==0)for(a=o+1;a<c;a++){let f=s[o+i*a]/s[o+i*o];h=d;do u=d-h,s[u+i*a]=u<=o?0:s[u+i*a]-s[u+i*o]*f;while(--h)}}while(--l);if(e.z=s[2*i+3]/s[2*i+2],e.y=(s[1*i+3]-s[1*i+2]*e.z)/s[1*i+1],e.x=(s[0*i+3]-s[0*i+2]*e.z-s[0*i+1]*e.y)/s[0*i+0],isNaN(e.x)||isNaN(e.y)||isNaN(e.z)||e.x===1/0||e.y===1/0||e.z===1/0)throw`Could not solve equation! Got x=[${e.toString()}], b=[${t.toString()}], A=[${this.toString()}]`;return e}e(t,e,n){if(n===void 0)return this.elements[e+3*t];this.elements[e+3*t]=n}copy(t){for(let e=0;e<t.elements.length;e++)this.elements[e]=t.elements[e];return this}toString(){let t="";for(let n=0;n<9;n++)t+=this.elements[n]+",";return t}reverse(t){t===void 0&&(t=new r);let e=3,n=6,i=uy,s,o;for(s=0;s<3;s++)for(o=0;o<3;o++)i[s+n*o]=this.elements[s+3*o];i[3]=1,i[9]=0,i[15]=0,i[4]=0,i[10]=1,i[16]=0,i[5]=0,i[11]=0,i[17]=1;let a=3,l=a,c,h=n,d;do{if(s=l-a,i[s+n*s]===0){for(o=s+1;o<l;o++)if(i[s+n*o]!==0){c=h;do d=h-c,i[d+n*s]+=i[d+n*o];while(--c);break}}if(i[s+n*s]!==0)for(o=s+1;o<l;o++){let u=i[s+n*o]/i[s+n*s];c=h;do d=h-c,i[d+n*o]=d<=s?0:i[d+n*o]-i[d+n*s]*u;while(--c)}}while(--a);s=2;do{o=s-1;do{let u=i[s+n*o]/i[s+n*s];c=n;do d=n-c,i[d+n*o]=i[d+n*o]-i[d+n*s]*u;while(--c)}while(o--)}while(--s);s=2;do{let u=1/i[s+n*s];c=n;do d=n-c,i[d+n*s]=i[d+n*s]*u;while(--c)}while(s--);s=2;do{o=2;do{if(d=i[e+o+n*s],isNaN(d)||d===1/0)throw`Could not reverse! A=[${this.toString()}]`;t.e(s,o,d)}while(o--)}while(s--);return t}setRotationFromQuaternion(t){let e=t.x,n=t.y,i=t.z,s=t.w,o=e+e,a=n+n,l=i+i,c=e*o,h=e*a,d=e*l,u=n*a,f=n*l,g=i*l,v=s*o,p=s*a,m=s*l,x=this.elements;return x[0]=1-(u+g),x[1]=h-m,x[2]=d+p,x[3]=h+m,x[4]=1-(c+g),x[5]=f-v,x[6]=d-p,x[7]=f+v,x[8]=1-(c+u),this}transpose(t){t===void 0&&(t=new r);let e=this.elements,n=t.elements,i;return n[0]=e[0],n[4]=e[4],n[8]=e[8],i=e[1],n[1]=e[3],n[3]=i,i=e[2],n[2]=e[6],n[6]=i,i=e[5],n[5]=e[7],n[7]=i,t}},uy=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],E=class r{constructor(t,e,n){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),this.x=t,this.y=e,this.z=n}cross(t,e){e===void 0&&(e=new r);let n=t.x,i=t.y,s=t.z,o=this.x,a=this.y,l=this.z;return e.x=a*s-l*i,e.y=l*n-o*s,e.z=o*i-a*n,e}set(t,e,n){return this.x=t,this.y=e,this.z=n,this}setZero(){this.x=this.y=this.z=0}vadd(t,e){if(e)e.x=t.x+this.x,e.y=t.y+this.y,e.z=t.z+this.z;else return new r(this.x+t.x,this.y+t.y,this.z+t.z)}vsub(t,e){if(e)e.x=this.x-t.x,e.y=this.y-t.y,e.z=this.z-t.z;else return new r(this.x-t.x,this.y-t.y,this.z-t.z)}crossmat(){return new Ii([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){let t=this.x,e=this.y,n=this.z,i=Math.sqrt(t*t+e*e+n*n);if(i>0){let s=1/i;this.x*=s,this.y*=s,this.z*=s}else this.x=0,this.y=0,this.z=0;return i}unit(t){t===void 0&&(t=new r);let e=this.x,n=this.y,i=this.z,s=Math.sqrt(e*e+n*n+i*i);return s>0?(s=1/s,t.x=e*s,t.y=n*s,t.z=i*s):(t.x=1,t.y=0,t.z=0),t}length(){let t=this.x,e=this.y,n=this.z;return Math.sqrt(t*t+e*e+n*n)}lengthSquared(){return this.dot(this)}distanceTo(t){let e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z;return Math.sqrt((s-e)*(s-e)+(o-n)*(o-n)+(a-i)*(a-i))}distanceSquared(t){let e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z;return(s-e)*(s-e)+(o-n)*(o-n)+(a-i)*(a-i)}scale(t,e){e===void 0&&(e=new r);let n=this.x,i=this.y,s=this.z;return e.x=t*n,e.y=t*i,e.z=t*s,e}vmul(t,e){return e===void 0&&(e=new r),e.x=t.x*this.x,e.y=t.y*this.y,e.z=t.z*this.z,e}addScaledVector(t,e,n){return n===void 0&&(n=new r),n.x=this.x+t*e.x,n.y=this.y+t*e.y,n.z=this.z+t*e.z,n}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(t){return t===void 0&&(t=new r),t.x=-this.x,t.y=-this.y,t.z=-this.z,t}tangents(t,e){let n=this.length();if(n>0){let i=dy,s=1/n;i.set(this.x*s,this.y*s,this.z*s);let o=fy;Math.abs(i.x)<.9?(o.set(1,0,0),i.cross(o,t)):(o.set(0,1,0),i.cross(o,t)),i.cross(t,e)}else t.set(1,0,0),e.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}lerp(t,e,n){let i=this.x,s=this.y,o=this.z;n.x=i+(t.x-i)*e,n.y=s+(t.y-s)*e,n.z=o+(t.z-o)*e}almostEquals(t,e){return e===void 0&&(e=1e-6),!(Math.abs(this.x-t.x)>e||Math.abs(this.y-t.y)>e||Math.abs(this.z-t.z)>e)}almostZero(t){return t===void 0&&(t=1e-6),!(Math.abs(this.x)>t||Math.abs(this.y)>t||Math.abs(this.z)>t)}isAntiparallelTo(t,e){return this.negate(Gu),Gu.almostEquals(t,e)}clone(){return new r(this.x,this.y,this.z)}};E.ZERO=new E(0,0,0);E.UNIT_X=new E(1,0,0);E.UNIT_Y=new E(0,1,0);E.UNIT_Z=new E(0,0,1);var dy=new E,fy=new E,Gu=new E,xn=class r{constructor(t){t===void 0&&(t={}),this.lowerBound=new E,this.upperBound=new E,t.lowerBound&&this.lowerBound.copy(t.lowerBound),t.upperBound&&this.upperBound.copy(t.upperBound)}setFromPoints(t,e,n,i){let s=this.lowerBound,o=this.upperBound,a=n;s.copy(t[0]),a&&a.vmult(s,s),o.copy(s);for(let l=1;l<t.length;l++){let c=t[l];a&&(a.vmult(c,Wu),c=Wu),c.x>o.x&&(o.x=c.x),c.x<s.x&&(s.x=c.x),c.y>o.y&&(o.y=c.y),c.y<s.y&&(s.y=c.y),c.z>o.z&&(o.z=c.z),c.z<s.z&&(s.z=c.z)}return e&&(e.vadd(s,s),e.vadd(o,o)),i&&(s.x-=i,s.y-=i,s.z-=i,o.x+=i,o.y+=i,o.z+=i),this}copy(t){return this.lowerBound.copy(t.lowerBound),this.upperBound.copy(t.upperBound),this}clone(){return new r().copy(this)}extend(t){this.lowerBound.x=Math.min(this.lowerBound.x,t.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,t.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,t.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,t.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,t.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,t.upperBound.z)}overlaps(t){let e=this.lowerBound,n=this.upperBound,i=t.lowerBound,s=t.upperBound,o=i.x<=n.x&&n.x<=s.x||e.x<=s.x&&s.x<=n.x,a=i.y<=n.y&&n.y<=s.y||e.y<=s.y&&s.y<=n.y,l=i.z<=n.z&&n.z<=s.z||e.z<=s.z&&s.z<=n.z;return o&&a&&l}volume(){let t=this.lowerBound,e=this.upperBound;return(e.x-t.x)*(e.y-t.y)*(e.z-t.z)}contains(t){let e=this.lowerBound,n=this.upperBound,i=t.lowerBound,s=t.upperBound;return e.x<=i.x&&n.x>=s.x&&e.y<=i.y&&n.y>=s.y&&e.z<=i.z&&n.z>=s.z}getCorners(t,e,n,i,s,o,a,l){let c=this.lowerBound,h=this.upperBound;t.copy(c),e.set(h.x,c.y,c.z),n.set(h.x,h.y,c.z),i.set(c.x,h.y,h.z),s.set(h.x,c.y,h.z),o.set(c.x,h.y,c.z),a.set(c.x,c.y,h.z),l.copy(h)}toLocalFrame(t,e){let n=Xu,i=n[0],s=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],d=n[7];this.getCorners(i,s,o,a,l,c,h,d);for(let u=0;u!==8;u++){let f=n[u];t.pointToLocal(f,f)}return e.setFromPoints(n)}toWorldFrame(t,e){let n=Xu,i=n[0],s=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],d=n[7];this.getCorners(i,s,o,a,l,c,h,d);for(let u=0;u!==8;u++){let f=n[u];t.pointToWorld(f,f)}return e.setFromPoints(n)}overlapsRay(t){let{direction:e,from:n}=t,i=1/e.x,s=1/e.y,o=1/e.z,a=(this.lowerBound.x-n.x)*i,l=(this.upperBound.x-n.x)*i,c=(this.lowerBound.y-n.y)*s,h=(this.upperBound.y-n.y)*s,d=(this.lowerBound.z-n.z)*o,u=(this.upperBound.z-n.z)*o,f=Math.max(Math.max(Math.min(a,l),Math.min(c,h)),Math.min(d,u)),g=Math.min(Math.min(Math.max(a,l),Math.max(c,h)),Math.max(d,u));return!(g<0||f>g)}},Wu=new E,Xu=[new E,new E,new E,new E,new E,new E,new E,new E],Ko=class{constructor(){this.matrix=[]}get(t,e){let{index:n}=t,{index:i}=e;if(i>n){let s=i;i=n,n=s}return this.matrix[(n*(n+1)>>1)+i-1]}set(t,e,n){let{index:i}=t,{index:s}=e;if(s>i){let o=s;s=i,i=o}this.matrix[(i*(i+1)>>1)+s-1]=n?1:0}reset(){for(let t=0,e=this.matrix.length;t!==e;t++)this.matrix[t]=0}setNumObjects(t){this.matrix.length=t*(t-1)>>1}},Jo=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;return n[t]===void 0&&(n[t]=[]),n[t].includes(e)||n[t].push(e),this}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return!!(n[t]!==void 0&&n[t].includes(e))}hasAnyEventListener(t){return this._listeners===void 0?!1:this._listeners[t]!==void 0}removeEventListener(t,e){if(this._listeners===void 0)return this;let n=this._listeners;if(n[t]===void 0)return this;let i=n[t].indexOf(e);return i!==-1&&n[t].splice(i,1),this}dispatchEvent(t){if(this._listeners===void 0)return this;let n=this._listeners[t.type];if(n!==void 0){t.target=this;for(let i=0,s=n.length;i<s;i++)n[i].call(this,t)}return this}},en=class r{constructor(t,e,n,i){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),i===void 0&&(i=1),this.x=t,this.y=e,this.z=n,this.w=i}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(t,e){let n=Math.sin(e*.5);return this.x=t.x*n,this.y=t.y*n,this.z=t.z*n,this.w=Math.cos(e*.5),this}toAxisAngle(t){t===void 0&&(t=new E),this.normalize();let e=2*Math.acos(this.w),n=Math.sqrt(1-this.w*this.w);return n<.001?(t.x=this.x,t.y=this.y,t.z=this.z):(t.x=this.x/n,t.y=this.y/n,t.z=this.z/n),[t,e]}setFromVectors(t,e){if(t.isAntiparallelTo(e)){let n=py,i=my;t.tangents(n,i),this.setFromAxisAngle(n,Math.PI)}else{let n=t.cross(e);this.x=n.x,this.y=n.y,this.z=n.z,this.w=Math.sqrt(t.length()**2*e.length()**2)+t.dot(e),this.normalize()}return this}mult(t,e){e===void 0&&(e=new r);let n=this.x,i=this.y,s=this.z,o=this.w,a=t.x,l=t.y,c=t.z,h=t.w;return e.x=n*h+o*a+i*c-s*l,e.y=i*h+o*l+s*a-n*c,e.z=s*h+o*c+n*l-i*a,e.w=o*h-n*a-i*l-s*c,e}inverse(t){t===void 0&&(t=new r);let e=this.x,n=this.y,i=this.z,s=this.w;this.conjugate(t);let o=1/(e*e+n*n+i*i+s*s);return t.x*=o,t.y*=o,t.z*=o,t.w*=o,t}conjugate(t){return t===void 0&&(t=new r),t.x=-this.x,t.y=-this.y,t.z=-this.z,t.w=this.w,t}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(t=1/t,this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}normalizeFast(){let t=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}vmult(t,e){e===void 0&&(e=new E);let n=t.x,i=t.y,s=t.z,o=this.x,a=this.y,l=this.z,c=this.w,h=c*n+a*s-l*i,d=c*i+l*n-o*s,u=c*s+o*i-a*n,f=-o*n-a*i-l*s;return e.x=h*c+f*-o+d*-l-u*-a,e.y=d*c+f*-a+u*-o-h*-l,e.z=u*c+f*-l+h*-a-d*-o,e}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}toEuler(t,e){e===void 0&&(e="YZX");let n,i,s,o=this.x,a=this.y,l=this.z,c=this.w;switch(e){case"YZX":let h=o*a+l*c;if(h>.499&&(n=2*Math.atan2(o,c),i=Math.PI/2,s=0),h<-.499&&(n=-2*Math.atan2(o,c),i=-Math.PI/2,s=0),n===void 0){let d=o*o,u=a*a,f=l*l;n=Math.atan2(2*a*c-2*o*l,1-2*u-2*f),i=Math.asin(2*h),s=Math.atan2(2*o*c-2*a*l,1-2*d-2*f)}break;default:throw new Error(`Euler order ${e} not supported yet.`)}t.y=n,t.z=i,t.x=s}setFromEuler(t,e,n,i){i===void 0&&(i="XYZ");let s=Math.cos(t/2),o=Math.cos(e/2),a=Math.cos(n/2),l=Math.sin(t/2),c=Math.sin(e/2),h=Math.sin(n/2);return i==="XYZ"?(this.x=l*o*a+s*c*h,this.y=s*c*a-l*o*h,this.z=s*o*h+l*c*a,this.w=s*o*a-l*c*h):i==="YXZ"?(this.x=l*o*a+s*c*h,this.y=s*c*a-l*o*h,this.z=s*o*h-l*c*a,this.w=s*o*a+l*c*h):i==="ZXY"?(this.x=l*o*a-s*c*h,this.y=s*c*a+l*o*h,this.z=s*o*h+l*c*a,this.w=s*o*a-l*c*h):i==="ZYX"?(this.x=l*o*a-s*c*h,this.y=s*c*a+l*o*h,this.z=s*o*h-l*c*a,this.w=s*o*a+l*c*h):i==="YZX"?(this.x=l*o*a+s*c*h,this.y=s*c*a+l*o*h,this.z=s*o*h-l*c*a,this.w=s*o*a-l*c*h):i==="XZY"&&(this.x=l*o*a-s*c*h,this.y=s*c*a-l*o*h,this.z=s*o*h+l*c*a,this.w=s*o*a+l*c*h),this}clone(){return new r(this.x,this.y,this.z,this.w)}slerp(t,e,n){n===void 0&&(n=new r);let i=this.x,s=this.y,o=this.z,a=this.w,l=t.x,c=t.y,h=t.z,d=t.w,u,f,g,v,p;return f=i*l+s*c+o*h+a*d,f<0&&(f=-f,l=-l,c=-c,h=-h,d=-d),1-f>1e-6?(u=Math.acos(f),g=Math.sin(u),v=Math.sin((1-e)*u)/g,p=Math.sin(e*u)/g):(v=1-e,p=e),n.x=v*i+p*l,n.y=v*s+p*c,n.z=v*o+p*h,n.w=v*a+p*d,n}integrate(t,e,n,i){i===void 0&&(i=new r);let s=t.x*n.x,o=t.y*n.y,a=t.z*n.z,l=this.x,c=this.y,h=this.z,d=this.w,u=e*.5;return i.x+=u*(s*d+o*h-a*c),i.y+=u*(o*d+a*l-s*h),i.z+=u*(a*d+s*c-o*l),i.w+=u*(-s*l-o*c-a*h),i}},py=new E,my=new E,gy={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256},zt=class r{constructor(t){t===void 0&&(t={}),this.id=r.idCounter++,this.type=t.type||0,this.boundingSphereRadius=0,this.collisionResponse=t.collisionResponse?t.collisionResponse:!0,this.collisionFilterGroup=t.collisionFilterGroup!==void 0?t.collisionFilterGroup:1,this.collisionFilterMask=t.collisionFilterMask!==void 0?t.collisionFilterMask:-1,this.material=t.material?t.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(t,e){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(t,e,n,i){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}};zt.idCounter=0;zt.types=gy;var Ee=class r{constructor(t){t===void 0&&(t={}),this.position=new E,this.quaternion=new en,t.position&&this.position.copy(t.position),t.quaternion&&this.quaternion.copy(t.quaternion)}pointToLocal(t,e){return r.pointToLocalFrame(this.position,this.quaternion,t,e)}pointToWorld(t,e){return r.pointToWorldFrame(this.position,this.quaternion,t,e)}vectorToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e}static pointToLocalFrame(t,e,n,i){return i===void 0&&(i=new E),n.vsub(t,i),e.conjugate(qu),qu.vmult(i,i),i}static pointToWorldFrame(t,e,n,i){return i===void 0&&(i=new E),e.vmult(n,i),i.vadd(t,i),i}static vectorToWorldFrame(t,e,n){return n===void 0&&(n=new E),t.vmult(e,n),n}static vectorToLocalFrame(t,e,n,i){return i===void 0&&(i=new E),e.w*=-1,e.vmult(n,i),e.w*=-1,i}},qu=new en,rc=class r extends zt{constructor(t){t===void 0&&(t={});let{vertices:e=[],faces:n=[],normals:i=[],axes:s,boundingSphereRadius:o}=t;super({type:zt.types.CONVEXPOLYHEDRON}),this.vertices=e,this.faces=n,this.faceNormals=i,this.faceNormals.length===0&&this.computeNormals(),o?this.boundingSphereRadius=o:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=s?s.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){let t=this.faces,e=this.vertices,n=this.uniqueEdges;n.length=0;let i=new E;for(let s=0;s!==t.length;s++){let o=t[s],a=o.length;for(let l=0;l!==a;l++){let c=(l+1)%a;e[o[l]].vsub(e[o[c]],i),i.normalize();let h=!1;for(let d=0;d!==n.length;d++)if(n[d].almostEquals(i)||n[d].almostEquals(i)){h=!0;break}h||n.push(i.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let t=0;t<this.faces.length;t++){for(let i=0;i<this.faces[t].length;i++)if(!this.vertices[this.faces[t][i]])throw new Error(`Vertex ${this.faces[t][i]} not found!`);let e=this.faceNormals[t]||new E;this.getFaceNormal(t,e),e.negate(e),this.faceNormals[t]=e;let n=this.vertices[this.faces[t][0]];if(e.dot(n)<0){console.error(`.faceNormals[${t}] = Vec3(${e.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let i=0;i<this.faces[t].length;i++)console.warn(`.vertices[${this.faces[t][i]}] = Vec3(${this.vertices[this.faces[t][i]].toString()})`)}}}getFaceNormal(t,e){let n=this.faces[t],i=this.vertices[n[0]],s=this.vertices[n[1]],o=this.vertices[n[2]];r.computeNormal(i,s,o,e)}static computeNormal(t,e,n,i){let s=new E,o=new E;e.vsub(t,o),n.vsub(e,s),s.cross(o,i),i.isZero()||i.normalize()}clipAgainstHull(t,e,n,i,s,o,a,l,c){let h=new E,d=-1,u=-Number.MAX_VALUE;for(let g=0;g<n.faces.length;g++){h.copy(n.faceNormals[g]),s.vmult(h,h);let v=h.dot(o);v>u&&(u=v,d=g)}let f=[];for(let g=0;g<n.faces[d].length;g++){let v=n.vertices[n.faces[d][g]],p=new E;p.copy(v),s.vmult(p,p),i.vadd(p,p),f.push(p)}d>=0&&this.clipFaceAgainstHull(o,t,e,f,a,l,c)}findSeparatingAxis(t,e,n,i,s,o,a,l){let c=new E,h=new E,d=new E,u=new E,f=new E,g=new E,v=Number.MAX_VALUE,p=this;if(p.uniqueAxes)for(let m=0;m!==p.uniqueAxes.length;m++){n.vmult(p.uniqueAxes[m],c);let x=p.testSepAxis(c,t,e,n,i,s);if(x===!1)return!1;x<v&&(v=x,o.copy(c))}else{let m=a?a.length:p.faces.length;for(let x=0;x<m;x++){let y=a?a[x]:x;c.copy(p.faceNormals[y]),n.vmult(c,c);let M=p.testSepAxis(c,t,e,n,i,s);if(M===!1)return!1;M<v&&(v=M,o.copy(c))}}if(t.uniqueAxes)for(let m=0;m!==t.uniqueAxes.length;m++){s.vmult(t.uniqueAxes[m],h);let x=p.testSepAxis(h,t,e,n,i,s);if(x===!1)return!1;x<v&&(v=x,o.copy(h))}else{let m=l?l.length:t.faces.length;for(let x=0;x<m;x++){let y=l?l[x]:x;h.copy(t.faceNormals[y]),s.vmult(h,h);let M=p.testSepAxis(h,t,e,n,i,s);if(M===!1)return!1;M<v&&(v=M,o.copy(h))}}for(let m=0;m!==p.uniqueEdges.length;m++){n.vmult(p.uniqueEdges[m],u);for(let x=0;x!==t.uniqueEdges.length;x++)if(s.vmult(t.uniqueEdges[x],f),u.cross(f,g),!g.almostZero()){g.normalize();let y=p.testSepAxis(g,t,e,n,i,s);if(y===!1)return!1;y<v&&(v=y,o.copy(g))}}return i.vsub(e,d),d.dot(o)>0&&o.negate(o),!0}testSepAxis(t,e,n,i,s,o){let a=this;r.project(a,t,n,i,Ql),r.project(e,t,s,o,tc);let l=Ql[0],c=Ql[1],h=tc[0],d=tc[1];if(l<d||h<c)return!1;let u=l-d,f=h-c;return u<f?u:f}calculateLocalInertia(t,e){let n=new E,i=new E;this.computeLocalAABB(i,n);let s=n.x-i.x,o=n.y-i.y,a=n.z-i.z;e.x=1/12*t*(2*o*2*o+2*a*2*a),e.y=1/12*t*(2*s*2*s+2*a*2*a),e.z=1/12*t*(2*o*2*o+2*s*2*s)}getPlaneConstantOfFace(t){let e=this.faces[t],n=this.faceNormals[t],i=this.vertices[e[0]];return-n.dot(i)}clipFaceAgainstHull(t,e,n,i,s,o,a){let l=new E,c=new E,h=new E,d=new E,u=new E,f=new E,g=new E,v=new E,p=this,m=[],x=i,y=m,M=-1,I=Number.MAX_VALUE;for(let b=0;b<p.faces.length;b++){l.copy(p.faceNormals[b]),n.vmult(l,l);let V=l.dot(t);V<I&&(I=V,M=b)}if(M<0)return;let A=p.faces[M];A.connectedFaces=[];for(let b=0;b<p.faces.length;b++)for(let V=0;V<p.faces[b].length;V++)A.indexOf(p.faces[b][V])!==-1&&b!==M&&A.connectedFaces.indexOf(b)===-1&&A.connectedFaces.push(b);let P=A.length;for(let b=0;b<P;b++){let V=p.vertices[A[b]],Y=p.vertices[A[(b+1)%P]];V.vsub(Y,c),h.copy(c),n.vmult(h,h),e.vadd(h,h),d.copy(this.faceNormals[M]),n.vmult(d,d),e.vadd(d,d),h.cross(d,u),u.negate(u),f.copy(V),n.vmult(f,f),e.vadd(f,f);let X=A.connectedFaces[b];g.copy(this.faceNormals[X]);let L=this.getPlaneConstantOfFace(X);v.copy(g),n.vmult(v,v);let U=L-v.dot(e);for(this.clipFaceAgainstPlane(x,y,v,U);x.length;)x.shift();for(;y.length;)x.push(y.shift())}g.copy(this.faceNormals[M]);let W=this.getPlaneConstantOfFace(M);v.copy(g),n.vmult(v,v);let S=W-v.dot(e);for(let b=0;b<x.length;b++){let V=v.dot(x[b])+S;if(V<=s&&(console.log(`clamped: depth=${V} to minDist=${s}`),V=s),V<=o){let Y=x[b];if(V<=1e-6){let X={point:Y,normal:v,depth:V};a.push(X)}}}}clipFaceAgainstPlane(t,e,n,i){let s,o,a=t.length;if(a<2)return e;let l=t[t.length-1],c=t[0];s=n.dot(l)+i;for(let h=0;h<a;h++){if(c=t[h],o=n.dot(c)+i,s<0)if(o<0){let d=new E;d.copy(c),e.push(d)}else{let d=new E;l.lerp(c,s/(s-o),d),e.push(d)}else if(o<0){let d=new E;l.lerp(c,s/(s-o),d),e.push(d),e.push(c)}l=c,s=o}return e}computeWorldVertices(t,e){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new E);let n=this.vertices,i=this.worldVertices;for(let s=0;s!==this.vertices.length;s++)e.vmult(n[s],i[s]),t.vadd(i[s],i[s]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(t,e){let n=this.vertices;t.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),e.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let i=0;i<this.vertices.length;i++){let s=n[i];s.x<t.x?t.x=s.x:s.x>e.x&&(e.x=s.x),s.y<t.y?t.y=s.y:s.y>e.y&&(e.y=s.y),s.z<t.z?t.z=s.z:s.z>e.z&&(e.z=s.z)}}computeWorldFaceNormals(t){let e=this.faceNormals.length;for(;this.worldFaceNormals.length<e;)this.worldFaceNormals.push(new E);let n=this.faceNormals,i=this.worldFaceNormals;for(let s=0;s!==e;s++)t.vmult(n[s],i[s]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let t=0,e=this.vertices;for(let n=0;n!==e.length;n++){let i=e[n].lengthSquared();i>t&&(t=i)}this.boundingSphereRadius=Math.sqrt(t)}calculateWorldAABB(t,e,n,i){let s=this.vertices,o,a,l,c,h,d,u=new E;for(let f=0;f<s.length;f++){u.copy(s[f]),e.vmult(u,u),t.vadd(u,u);let g=u;(o===void 0||g.x<o)&&(o=g.x),(c===void 0||g.x>c)&&(c=g.x),(a===void 0||g.y<a)&&(a=g.y),(h===void 0||g.y>h)&&(h=g.y),(l===void 0||g.z<l)&&(l=g.z),(d===void 0||g.z>d)&&(d=g.z)}n.set(o,a,l),i.set(c,h,d)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(t){t===void 0&&(t=new E);let e=this.vertices;for(let n=0;n<e.length;n++)t.vadd(e[n],t);return t.scale(1/e.length,t),t}transformAllPoints(t,e){let n=this.vertices.length,i=this.vertices;if(e){for(let s=0;s<n;s++){let o=i[s];e.vmult(o,o)}for(let s=0;s<this.faceNormals.length;s++){let o=this.faceNormals[s];e.vmult(o,o)}}if(t)for(let s=0;s<n;s++){let o=i[s];o.vadd(t,o)}}pointIsInside(t){let e=this.vertices,n=this.faces,i=this.faceNormals,s=null,o=new E;this.getAveragePointLocal(o);for(let a=0;a<this.faces.length;a++){let l=i[a],c=e[n[a][0]],h=new E;t.vsub(c,h);let d=l.dot(h),u=new E;o.vsub(c,u);let f=l.dot(u);if(d<0&&f>0||d>0&&f<0)return!1}return s?1:-1}static project(t,e,n,i,s){let o=t.vertices.length,a=yy,l=0,c=0,h=xy,d=t.vertices;h.setZero(),Ee.vectorToLocalFrame(n,i,e,a),Ee.pointToLocalFrame(n,i,h,h);let u=h.dot(a);c=l=d[0].dot(a);for(let f=1;f<o;f++){let g=d[f].dot(a);g>l&&(l=g),g<c&&(c=g)}if(c-=u,l-=u,c>l){let f=c;c=l,l=f}s[0]=l,s[1]=c}},Ql=[],tc=[],vy=new E,yy=new E,xy=new E,oc=class r extends zt{constructor(t){super({type:zt.types.BOX}),this.halfExtents=t,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){let t=this.halfExtents.x,e=this.halfExtents.y,n=this.halfExtents.z,i=E,s=[new i(-t,-e,-n),new i(t,-e,-n),new i(t,e,-n),new i(-t,e,-n),new i(-t,-e,n),new i(t,-e,n),new i(t,e,n),new i(-t,e,n)],o=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],a=[new i(0,0,1),new i(0,1,0),new i(1,0,0)],l=new rc({vertices:s,faces:o,axes:a});this.convexPolyhedronRepresentation=l,l.material=this.material}calculateLocalInertia(t,e){return e===void 0&&(e=new E),r.calculateInertia(this.halfExtents,t,e),e}static calculateInertia(t,e,n){let i=t;n.x=1/12*e*(2*i.y*2*i.y+2*i.z*2*i.z),n.y=1/12*e*(2*i.x*2*i.x+2*i.z*2*i.z),n.z=1/12*e*(2*i.y*2*i.y+2*i.x*2*i.x)}getSideNormals(t,e){let n=t,i=this.halfExtents;if(n[0].set(i.x,0,0),n[1].set(0,i.y,0),n[2].set(0,0,i.z),n[3].set(-i.x,0,0),n[4].set(0,-i.y,0),n[5].set(0,0,-i.z),e!==void 0)for(let s=0;s!==n.length;s++)e.vmult(n[s],n[s]);return n}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(t,e,n){let i=this.halfExtents,s=[[i.x,i.y,i.z],[-i.x,i.y,i.z],[-i.x,-i.y,i.z],[-i.x,-i.y,-i.z],[i.x,-i.y,-i.z],[i.x,i.y,-i.z],[-i.x,i.y,-i.z],[i.x,-i.y,i.z]];for(let o=0;o<s.length;o++)Pi.set(s[o][0],s[o][1],s[o][2]),e.vmult(Pi,Pi),t.vadd(Pi,Pi),n(Pi.x,Pi.y,Pi.z)}calculateWorldAABB(t,e,n,i){let s=this.halfExtents;Vn[0].set(s.x,s.y,s.z),Vn[1].set(-s.x,s.y,s.z),Vn[2].set(-s.x,-s.y,s.z),Vn[3].set(-s.x,-s.y,-s.z),Vn[4].set(s.x,-s.y,-s.z),Vn[5].set(s.x,s.y,-s.z),Vn[6].set(-s.x,s.y,-s.z),Vn[7].set(s.x,-s.y,s.z);let o=Vn[0];e.vmult(o,o),t.vadd(o,o),i.copy(o),n.copy(o);for(let a=1;a<8;a++){let l=Vn[a];e.vmult(l,l),t.vadd(l,l);let c=l.x,h=l.y,d=l.z;c>i.x&&(i.x=c),h>i.y&&(i.y=h),d>i.z&&(i.z=d),c<n.x&&(n.x=c),h<n.y&&(n.y=h),d<n.z&&(n.z=d)}}},Pi=new E,Vn=[new E,new E,new E,new E,new E,new E,new E,new E],vc={DYNAMIC:1,STATIC:2,KINEMATIC:4},yc={AWAKE:0,SLEEPY:1,SLEEPING:2},le=class r extends Jo{constructor(t){t===void 0&&(t={}),super(),this.id=r.idCounter++,this.index=-1,this.world=null,this.vlambda=new E,this.collisionFilterGroup=typeof t.collisionFilterGroup=="number"?t.collisionFilterGroup:1,this.collisionFilterMask=typeof t.collisionFilterMask=="number"?t.collisionFilterMask:-1,this.collisionResponse=typeof t.collisionResponse=="boolean"?t.collisionResponse:!0,this.position=new E,this.previousPosition=new E,this.interpolatedPosition=new E,this.initPosition=new E,t.position&&(this.position.copy(t.position),this.previousPosition.copy(t.position),this.interpolatedPosition.copy(t.position),this.initPosition.copy(t.position)),this.velocity=new E,t.velocity&&this.velocity.copy(t.velocity),this.initVelocity=new E,this.force=new E;let e=typeof t.mass=="number"?t.mass:0;this.mass=e,this.invMass=e>0?1/e:0,this.material=t.material||null,this.linearDamping=typeof t.linearDamping=="number"?t.linearDamping:.01,this.type=e<=0?r.STATIC:r.DYNAMIC,typeof t.type==typeof r.STATIC&&(this.type=t.type),this.allowSleep=typeof t.allowSleep<"u"?t.allowSleep:!0,this.sleepState=r.AWAKE,this.sleepSpeedLimit=typeof t.sleepSpeedLimit<"u"?t.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof t.sleepTimeLimit<"u"?t.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new E,this.quaternion=new en,this.initQuaternion=new en,this.previousQuaternion=new en,this.interpolatedQuaternion=new en,t.quaternion&&(this.quaternion.copy(t.quaternion),this.initQuaternion.copy(t.quaternion),this.previousQuaternion.copy(t.quaternion),this.interpolatedQuaternion.copy(t.quaternion)),this.angularVelocity=new E,t.angularVelocity&&this.angularVelocity.copy(t.angularVelocity),this.initAngularVelocity=new E,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new E,this.invInertia=new E,this.invInertiaWorld=new Ii,this.invMassSolve=0,this.invInertiaSolve=new E,this.invInertiaWorldSolve=new Ii,this.fixedRotation=typeof t.fixedRotation<"u"?t.fixedRotation:!1,this.angularDamping=typeof t.angularDamping<"u"?t.angularDamping:.01,this.linearFactor=new E(1,1,1),t.linearFactor&&this.linearFactor.copy(t.linearFactor),this.angularFactor=new E(1,1,1),t.angularFactor&&this.angularFactor.copy(t.angularFactor),this.aabb=new xn,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new E,this.isTrigger=!!t.isTrigger,t.shape&&this.addShape(t.shape),this.updateMassProperties()}wakeUp(){let t=this.sleepState;this.sleepState=r.AWAKE,this.wakeUpAfterNarrowphase=!1,t===r.SLEEPING&&this.dispatchEvent(r.wakeupEvent)}sleep(){this.sleepState=r.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(t){if(this.allowSleep){let e=this.sleepState,n=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),i=this.sleepSpeedLimit**2;e===r.AWAKE&&n<i?(this.sleepState=r.SLEEPY,this.timeLastSleepy=t,this.dispatchEvent(r.sleepyEvent)):e===r.SLEEPY&&n>i?this.wakeUp():e===r.SLEEPY&&t-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(r.sleepEvent))}}updateSolveMassProperties(){this.sleepState===r.SLEEPING||this.type===r.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(t,e){return e===void 0&&(e=new E),t.vsub(this.position,e),this.quaternion.conjugate().vmult(e,e),e}vectorToLocalFrame(t,e){return e===void 0&&(e=new E),this.quaternion.conjugate().vmult(t,e),e}pointToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e.vadd(this.position,e),e}vectorToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e}addShape(t,e,n){let i=new E,s=new en;return e&&i.copy(e),n&&s.copy(n),this.shapes.push(t),this.shapeOffsets.push(i),this.shapeOrientations.push(s),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=this,this}removeShape(t){let e=this.shapes.indexOf(t);return e===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(e,1),this.shapeOffsets.splice(e,1),this.shapeOrientations.splice(e,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=null,this)}updateBoundingRadius(){let t=this.shapes,e=this.shapeOffsets,n=t.length,i=0;for(let s=0;s!==n;s++){let o=t[s];o.updateBoundingSphereRadius();let a=e[s].length(),l=o.boundingSphereRadius;a+l>i&&(i=a+l)}this.boundingRadius=i}updateAABB(){let t=this.shapes,e=this.shapeOffsets,n=this.shapeOrientations,i=t.length,s=_y,o=wy,a=this.quaternion,l=this.aabb,c=My;for(let h=0;h!==i;h++){let d=t[h];a.vmult(e[h],s),s.vadd(this.position,s),a.mult(n[h],o),d.calculateWorldAABB(s,o,c.lowerBound,c.upperBound),h===0?l.copy(c):l.extend(c)}this.aabbNeedsUpdate=!1}updateInertiaWorld(t){let e=this.invInertia;if(!(e.x===e.y&&e.y===e.z&&!t)){let n=Sy,i=by;n.setRotationFromQuaternion(this.quaternion),n.transpose(i),n.scale(e,n),n.mmult(i,this.invInertiaWorld)}}applyForce(t,e){if(e===void 0&&(e=new E),this.type!==r.DYNAMIC)return;this.sleepState===r.SLEEPING&&this.wakeUp();let n=Ay;e.cross(t,n),this.force.vadd(t,this.force),this.torque.vadd(n,this.torque)}applyLocalForce(t,e){if(e===void 0&&(e=new E),this.type!==r.DYNAMIC)return;let n=Ty,i=Cy;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyForce(n,i)}applyTorque(t){this.type===r.DYNAMIC&&(this.sleepState===r.SLEEPING&&this.wakeUp(),this.torque.vadd(t,this.torque))}applyImpulse(t,e){if(e===void 0&&(e=new E),this.type!==r.DYNAMIC)return;this.sleepState===r.SLEEPING&&this.wakeUp();let n=e,i=Ry;i.copy(t),i.scale(this.invMass,i),this.velocity.vadd(i,this.velocity);let s=Py;n.cross(t,s),this.invInertiaWorld.vmult(s,s),this.angularVelocity.vadd(s,this.angularVelocity)}applyLocalImpulse(t,e){if(e===void 0&&(e=new E),this.type!==r.DYNAMIC)return;let n=Iy,i=Ly;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyImpulse(n,i)}updateMassProperties(){let t=Ny;this.invMass=this.mass>0?1/this.mass:0;let e=this.inertia,n=this.fixedRotation;this.updateAABB(),t.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),oc.calculateInertia(t,this.mass,e),this.invInertia.set(e.x>0&&!n?1/e.x:0,e.y>0&&!n?1/e.y:0,e.z>0&&!n?1/e.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(t,e){let n=new E;return t.vsub(this.position,n),this.angularVelocity.cross(n,e),this.velocity.vadd(e,e),e}integrate(t,e,n){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===r.DYNAMIC||this.type===r.KINEMATIC)||this.sleepState===r.SLEEPING)return;let i=this.velocity,s=this.angularVelocity,o=this.position,a=this.force,l=this.torque,c=this.quaternion,h=this.invMass,d=this.invInertiaWorld,u=this.linearFactor,f=h*t;i.x+=a.x*f*u.x,i.y+=a.y*f*u.y,i.z+=a.z*f*u.z;let g=d.elements,v=this.angularFactor,p=l.x*v.x,m=l.y*v.y,x=l.z*v.z;s.x+=t*(g[0]*p+g[1]*m+g[2]*x),s.y+=t*(g[3]*p+g[4]*m+g[5]*x),s.z+=t*(g[6]*p+g[7]*m+g[8]*x),o.x+=i.x*t,o.y+=i.y*t,o.z+=i.z*t,c.integrate(this.angularVelocity,t,this.angularFactor,c),e&&(n?c.normalizeFast():c.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}};le.idCounter=0;le.COLLIDE_EVENT_NAME="collide";le.DYNAMIC=vc.DYNAMIC;le.STATIC=vc.STATIC;le.KINEMATIC=vc.KINEMATIC;le.AWAKE=yc.AWAKE;le.SLEEPY=yc.SLEEPY;le.SLEEPING=yc.SLEEPING;le.wakeupEvent={type:"wakeup"};le.sleepyEvent={type:"sleepy"};le.sleepEvent={type:"sleep"};var _y=new E,wy=new en,My=new xn,Sy=new Ii,by=new Ii,Ey=new Ii,Ay=new E,Ty=new E,Cy=new E,Ry=new E,Py=new E,Iy=new E,Ly=new E,Ny=new E,ac=class{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(t,e,n){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(t,e){return!((t.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&t.collisionFilterMask)===0||((t.type&le.STATIC)!==0||t.sleepState===le.SLEEPING)&&((e.type&le.STATIC)!==0||e.sleepState===le.SLEEPING))}intersectionTest(t,e,n,i){this.useBoundingBoxes?this.doBoundingBoxBroadphase(t,e,n,i):this.doBoundingSphereBroadphase(t,e,n,i)}doBoundingSphereBroadphase(t,e,n,i){let s=Dy;e.position.vsub(t.position,s);let o=(t.boundingRadius+e.boundingRadius)**2;s.lengthSquared()<o&&(n.push(t),i.push(e))}doBoundingBoxBroadphase(t,e,n,i){t.aabbNeedsUpdate&&t.updateAABB(),e.aabbNeedsUpdate&&e.updateAABB(),t.aabb.overlaps(e.aabb)&&(n.push(t),i.push(e))}makePairsUnique(t,e){let n=Fy,i=Uy,s=By,o=t.length;for(let a=0;a!==o;a++)i[a]=t[a],s[a]=e[a];t.length=0,e.length=0;for(let a=0;a!==o;a++){let l=i[a].id,c=s[a].id,h=l<c?`${l},${c}`:`${c},${l}`;n[h]=a,n.keys.push(h)}for(let a=0;a!==n.keys.length;a++){let l=n.keys.pop(),c=n[l];t.push(i[c]),e.push(s[c]),delete n[l]}}setWorld(t){}static boundingSphereCheck(t,e){let n=new E;t.position.vsub(e.position,n);let i=t.shapes[0],s=e.shapes[0];return Math.pow(i.boundingSphereRadius+s.boundingSphereRadius,2)>n.lengthSquared()}aabbQuery(t,e,n){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}},Dy=new E;new E;new en;new E;var Fy={keys:[]},Uy=[],By=[];new E;var lw=new E;new E;var lc=class extends ac{constructor(){super()}collisionPairs(t,e,n){let i=t.bodies,s=i.length,o,a;for(let l=0;l!==s;l++)for(let c=0;c!==l;c++)o=i[l],a=i[c],this.needBroadphaseCollision(o,a)&&this.intersectionTest(o,a,e,n)}aabbQuery(t,e,n){n===void 0&&(n=[]);for(let i=0;i<t.bodies.length;i++){let s=t.bodies[i];s.aabbNeedsUpdate&&s.updateAABB(),s.aabb.overlaps(e)&&n.push(s)}return n}},Hs=class{constructor(){this.rayFromWorld=new E,this.rayToWorld=new E,this.hitNormalWorld=new E,this.hitPointWorld=new E,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(t,e,n,i,s,o,a){this.rayFromWorld.copy(t),this.rayToWorld.copy(e),this.hitNormalWorld.copy(n),this.hitPointWorld.copy(i),this.shape=s,this.body=o,this.distance=a}},sd,rd,od,ad,ld,cd,hd,xc={CLOSEST:1,ANY:2,ALL:4};sd=zt.types.SPHERE;rd=zt.types.PLANE;od=zt.types.BOX;ad=zt.types.CYLINDER;ld=zt.types.CONVEXPOLYHEDRON;cd=zt.types.HEIGHTFIELD;hd=zt.types.TRIMESH;var Tn=class r{get[sd](){return this._intersectSphere}get[rd](){return this._intersectPlane}get[od](){return this._intersectBox}get[ad](){return this._intersectConvex}get[ld](){return this._intersectConvex}get[cd](){return this._intersectHeightfield}get[hd](){return this._intersectTrimesh}constructor(t,e){t===void 0&&(t=new E),e===void 0&&(e=new E),this.from=t.clone(),this.to=e.clone(),this.direction=new E,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=r.ANY,this.result=new Hs,this.hasHit=!1,this.callback=n=>{}}intersectWorld(t,e){return this.mode=e.mode||r.ANY,this.result=e.result||new Hs,this.skipBackfaces=!!e.skipBackfaces,this.collisionFilterMask=typeof e.collisionFilterMask<"u"?e.collisionFilterMask:-1,this.collisionFilterGroup=typeof e.collisionFilterGroup<"u"?e.collisionFilterGroup:-1,this.checkCollisionResponse=typeof e.checkCollisionResponse<"u"?e.checkCollisionResponse:!0,e.from&&this.from.copy(e.from),e.to&&this.to.copy(e.to),this.callback=e.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(Yu),ec.length=0,t.broadphase.aabbQuery(t,Yu,ec),this.intersectBodies(ec),this.hasHit}intersectBody(t,e){e&&(this.result=e,this.updateDirection());let n=this.checkCollisionResponse;if(n&&!t.collisionResponse||(this.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&this.collisionFilterMask)===0)return;let i=Oy,s=zy;for(let o=0,a=t.shapes.length;o<a;o++){let l=t.shapes[o];if(!(n&&!l.collisionResponse)&&(t.quaternion.mult(t.shapeOrientations[o],s),t.quaternion.vmult(t.shapeOffsets[o],i),i.vadd(t.position,i),this.intersectShape(l,s,i,t),this.result.shouldStop))break}}intersectBodies(t,e){e&&(this.result=e,this.updateDirection());for(let n=0,i=t.length;!this.result.shouldStop&&n<i;n++)this.intersectBody(t[n])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(t,e,n,i){let s=this.from;if(ex(s,this.direction,n)>t.boundingSphereRadius)return;let a=this[t.type];a&&a.call(this,t,e,n,i,t)}_intersectBox(t,e,n,i,s){return this._intersectConvex(t.convexPolyhedronRepresentation,e,n,i,s)}_intersectPlane(t,e,n,i,s){let o=this.from,a=this.to,l=this.direction,c=new E(0,0,1);e.vmult(c,c);let h=new E;o.vsub(n,h);let d=h.dot(c);a.vsub(n,h);let u=h.dot(c);if(d*u>0||o.distanceTo(a)<d)return;let f=c.dot(l);if(Math.abs(f)<this.precision)return;let g=new E,v=new E,p=new E;o.vsub(n,g);let m=-c.dot(g)/f;l.scale(m,v),o.vadd(v,p),this.reportIntersection(c,p,s,i,-1)}getAABB(t){let{lowerBound:e,upperBound:n}=t,i=this.to,s=this.from;e.x=Math.min(i.x,s.x),e.y=Math.min(i.y,s.y),e.z=Math.min(i.z,s.z),n.x=Math.max(i.x,s.x),n.y=Math.max(i.y,s.y),n.z=Math.max(i.z,s.z)}_intersectHeightfield(t,e,n,i,s){t.data,t.elementSize;let o=ky;o.from.copy(this.from),o.to.copy(this.to),Ee.pointToLocalFrame(n,e,o.from,o.from),Ee.pointToLocalFrame(n,e,o.to,o.to),o.updateDirection();let a=Vy,l,c,h,d;l=c=0,h=d=t.data.length-1;let u=new xn;o.getAABB(u),t.getIndexOfPosition(u.lowerBound.x,u.lowerBound.y,a,!0),l=Math.max(l,a[0]),c=Math.max(c,a[1]),t.getIndexOfPosition(u.upperBound.x,u.upperBound.y,a,!0),h=Math.min(h,a[0]+1),d=Math.min(d,a[1]+1);for(let f=l;f<h;f++)for(let g=c;g<d;g++){if(this.result.shouldStop)return;if(t.getAabbAtIndex(f,g,u),!!u.overlapsRay(o)){if(t.getConvexTrianglePillar(f,g,!1),Ee.pointToWorldFrame(n,e,t.pillarOffset,qo),this._intersectConvex(t.pillarConvex,e,qo,i,s,Zu),this.result.shouldStop)return;t.getConvexTrianglePillar(f,g,!0),Ee.pointToWorldFrame(n,e,t.pillarOffset,qo),this._intersectConvex(t.pillarConvex,e,qo,i,s,Zu)}}}_intersectSphere(t,e,n,i,s){let o=this.from,a=this.to,l=t.radius,c=(a.x-o.x)**2+(a.y-o.y)**2+(a.z-o.z)**2,h=2*((a.x-o.x)*(o.x-n.x)+(a.y-o.y)*(o.y-n.y)+(a.z-o.z)*(o.z-n.z)),d=(o.x-n.x)**2+(o.y-n.y)**2+(o.z-n.z)**2-l**2,u=h**2-4*c*d,f=Hy,g=Gy;if(!(u<0))if(u===0)o.lerp(a,u,f),f.vsub(n,g),g.normalize(),this.reportIntersection(g,f,s,i,-1);else{let v=(-h-Math.sqrt(u))/(2*c),p=(-h+Math.sqrt(u))/(2*c);if(v>=0&&v<=1&&(o.lerp(a,v,f),f.vsub(n,g),g.normalize(),this.reportIntersection(g,f,s,i,-1)),this.result.shouldStop)return;p>=0&&p<=1&&(o.lerp(a,p,f),f.vsub(n,g),g.normalize(),this.reportIntersection(g,f,s,i,-1))}}_intersectConvex(t,e,n,i,s,o){let a=Wy,l=ju,c=o&&o.faceList||null,h=t.faces,d=t.vertices,u=t.faceNormals,f=this.direction,g=this.from,v=this.to,p=g.distanceTo(v),m=c?c.length:h.length,x=this.result;for(let y=0;!x.shouldStop&&y<m;y++){let M=c?c[y]:y,I=h[M],A=u[M],P=e,W=n;l.copy(d[I[0]]),P.vmult(l,l),l.vadd(W,l),l.vsub(g,l),P.vmult(A,a);let S=f.dot(a);if(Math.abs(S)<this.precision)continue;let b=a.dot(l)/S;if(!(b<0)){f.scale(b,gn),gn.vadd(g,gn),Fn.copy(d[I[0]]),P.vmult(Fn,Fn),W.vadd(Fn,Fn);for(let V=1;!x.shouldStop&&V<I.length-1;V++){Hn.copy(d[I[V]]),Gn.copy(d[I[V+1]]),P.vmult(Hn,Hn),P.vmult(Gn,Gn),W.vadd(Hn,Hn),W.vadd(Gn,Gn);let Y=gn.distanceTo(g);!(r.pointInTriangle(gn,Fn,Hn,Gn)||r.pointInTriangle(gn,Hn,Fn,Gn))||Y>p||this.reportIntersection(a,gn,s,i,M)}}}}_intersectTrimesh(t,e,n,i,s,o){let a=Yy,l=Qy,c=tx,h=ju,d=Zy,u=jy,f=$y,g=Jy,v=Ky,p=t.indices;t.vertices;let m=this.from,x=this.to,y=this.direction;c.position.copy(n),c.quaternion.copy(e),Ee.vectorToLocalFrame(n,e,y,d),Ee.pointToLocalFrame(n,e,m,u),Ee.pointToLocalFrame(n,e,x,f),f.x*=t.scale.x,f.y*=t.scale.y,f.z*=t.scale.z,u.x*=t.scale.x,u.y*=t.scale.y,u.z*=t.scale.z,f.vsub(u,d),d.normalize();let M=u.distanceSquared(f);t.tree.rayQuery(this,c,l);for(let I=0,A=l.length;!this.result.shouldStop&&I!==A;I++){let P=l[I];t.getNormal(P,a),t.getVertex(p[P*3],Fn),Fn.vsub(u,h);let W=d.dot(a),S=a.dot(h)/W;if(S<0)continue;d.scale(S,gn),gn.vadd(u,gn),t.getVertex(p[P*3+1],Hn),t.getVertex(p[P*3+2],Gn);let b=gn.distanceSquared(u);!(r.pointInTriangle(gn,Hn,Fn,Gn)||r.pointInTriangle(gn,Fn,Hn,Gn))||b>M||(Ee.vectorToWorldFrame(e,a,v),Ee.pointToWorldFrame(n,e,gn,g),this.reportIntersection(v,g,s,i,P))}l.length=0}reportIntersection(t,e,n,i,s){let o=this.from,a=this.to,l=o.distanceTo(e),c=this.result;if(!(this.skipBackfaces&&t.dot(this.direction)>0))switch(c.hitFaceIndex=typeof s<"u"?s:-1,this.mode){case r.ALL:this.hasHit=!0,c.set(o,a,t,e,n,i,l),c.hasHit=!0,this.callback(c);break;case r.CLOSEST:(l<c.distance||!c.hasHit)&&(this.hasHit=!0,c.hasHit=!0,c.set(o,a,t,e,n,i,l));break;case r.ANY:this.hasHit=!0,c.hasHit=!0,c.set(o,a,t,e,n,i,l),c.shouldStop=!0;break}}static pointInTriangle(t,e,n,i){i.vsub(e,Zi),n.vsub(e,yr),t.vsub(e,nc);let s=Zi.dot(Zi),o=Zi.dot(yr),a=Zi.dot(nc),l=yr.dot(yr),c=yr.dot(nc),h,d;return(h=l*a-o*c)>=0&&(d=s*c-o*a)>=0&&h+d<s*l-o*o}};Tn.CLOSEST=xc.CLOSEST;Tn.ANY=xc.ANY;Tn.ALL=xc.ALL;var Yu=new xn,ec=[],yr=new E,nc=new E,Oy=new E,zy=new en,gn=new E,Fn=new E,Hn=new E,Gn=new E;new E;new Hs;var Zu={faceList:[0]},qo=new E,ky=new Tn,Vy=[],Hy=new E,Gy=new E,Wy=new E,Xy=new E,qy=new E,ju=new E,Yy=new E,Zy=new E,jy=new E,$y=new E,Ky=new E,Jy=new E;new xn;var Qy=[],tx=new Ee,Zi=new E,Yo=new E;function ex(r,t,e){e.vsub(r,Zi);let n=Zi.dot(t);return t.scale(n,Yo),Yo.vadd(r,Yo),e.distanceTo(Yo)}var Qo=class{static defaults(t,e){t===void 0&&(t={});for(let n in e)n in t||(t[n]=e[n]);return t}},cc=class r{constructor(t,e,n){n===void 0&&(n={}),n=Qo.defaults(n,{collideConnected:!0,wakeUpBodies:!0}),this.equations=[],this.bodyA=t,this.bodyB=e,this.id=r.idCounter++,this.collideConnected=n.collideConnected,n.wakeUpBodies&&(t&&t.wakeUp(),e&&e.wakeUp())}update(){throw new Error("method update() not implmemented in this Constraint subclass!")}enable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!0}disable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!1}};cc.idCounter=0;var ta=class{constructor(){this.spatial=new E,this.rotational=new E}multiplyElement(t){return t.spatial.dot(this.spatial)+t.rotational.dot(this.rotational)}multiplyVectors(t,e){return t.dot(this.spatial)+e.dot(this.rotational)}},Mr=class r{constructor(t,e,n,i){n===void 0&&(n=-1e6),i===void 0&&(i=1e6),this.id=r.idCounter++,this.minForce=n,this.maxForce=i,this.bi=t,this.bj=e,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new ta,this.jacobianElementB=new ta,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(t,e,n){let i=e,s=t,o=n;this.a=4/(o*(1+4*i)),this.b=4*i/(1+4*i),this.eps=4/(o*o*s*(1+4*i))}computeB(t,e,n){let i=this.computeGW(),s=this.computeGq(),o=this.computeGiMf();return-s*t-i*e-o*n}computeGq(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,s=n.position,o=i.position;return t.spatial.dot(s)+e.spatial.dot(o)}computeGW(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,s=n.velocity,o=i.velocity,a=n.angularVelocity,l=i.angularVelocity;return t.multiplyVectors(s,a)+e.multiplyVectors(o,l)}computeGWlambda(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,s=n.vlambda,o=i.vlambda,a=n.wlambda,l=i.wlambda;return t.multiplyVectors(s,a)+e.multiplyVectors(o,l)}computeGiMf(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,s=n.force,o=n.torque,a=i.force,l=i.torque,c=n.invMassSolve,h=i.invMassSolve;return s.scale(c,$u),a.scale(h,Ku),n.invInertiaWorldSolve.vmult(o,Ju),i.invInertiaWorldSolve.vmult(l,Qu),t.multiplyVectors($u,Ju)+e.multiplyVectors(Ku,Qu)}computeGiMGt(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,s=n.invMassSolve,o=i.invMassSolve,a=n.invInertiaWorldSolve,l=i.invInertiaWorldSolve,c=s+o;return a.vmult(t.rotational,Zo),c+=Zo.dot(t.rotational),l.vmult(e.rotational,Zo),c+=Zo.dot(e.rotational),c}addToWlambda(t){let e=this.jacobianElementA,n=this.jacobianElementB,i=this.bi,s=this.bj,o=nx;i.vlambda.addScaledVector(i.invMassSolve*t,e.spatial,i.vlambda),s.vlambda.addScaledVector(s.invMassSolve*t,n.spatial,s.vlambda),i.invInertiaWorldSolve.vmult(e.rotational,o),i.wlambda.addScaledVector(t,o,i.wlambda),s.invInertiaWorldSolve.vmult(n.rotational,o),s.wlambda.addScaledVector(t,o,s.wlambda)}computeC(){return this.computeGiMGt()+this.eps}};Mr.idCounter=0;var $u=new E,Ku=new E,Ju=new E,Qu=new E,Zo=new E,nx=new E,hc=class extends Mr{constructor(t,e,n){n===void 0&&(n=1e6),super(t,e,0,n),this.restitution=0,this.ri=new E,this.rj=new E,this.ni=new E}computeB(t){let e=this.a,n=this.b,i=this.bi,s=this.bj,o=this.ri,a=this.rj,l=ix,c=sx,h=i.velocity,d=i.angularVelocity;i.force,i.torque;let u=s.velocity,f=s.angularVelocity;s.force,s.torque;let g=rx,v=this.jacobianElementA,p=this.jacobianElementB,m=this.ni;o.cross(m,l),a.cross(m,c),m.negate(v.spatial),l.negate(v.rotational),p.spatial.copy(m),p.rotational.copy(c),g.copy(s.position),g.vadd(a,g),g.vsub(i.position,g),g.vsub(o,g);let x=m.dot(g),y=this.restitution+1,M=y*u.dot(m)-y*h.dot(m)+f.dot(c)-d.dot(l),I=this.computeGiMf();return-x*e-M*n-t*I}getImpactVelocityAlongNormal(){let t=ox,e=ax,n=lx,i=cx,s=hx;return this.bi.position.vadd(this.ri,n),this.bj.position.vadd(this.rj,i),this.bi.getVelocityAtWorldPoint(n,t),this.bj.getVelocityAtWorldPoint(i,e),t.vsub(e,s),this.ni.dot(s)}},ix=new E,sx=new E,rx=new E,ox=new E,ax=new E,lx=new E,cx=new E,hx=new E;var cw=new E,hw=new E;var uw=new E,dw=new E;new E;new E;var fw=new E,pw=new E;var mw=new E,gw=new E,ea=class extends Mr{constructor(t,e,n){super(t,e,-n,n),this.ri=new E,this.rj=new E,this.t=new E}computeB(t){this.a;let e=this.b;this.bi,this.bj;let n=this.ri,i=this.rj,s=ux,o=dx,a=this.t;n.cross(a,s),i.cross(a,o);let l=this.jacobianElementA,c=this.jacobianElementB;a.negate(l.spatial),s.negate(l.rotational),c.spatial.copy(a),c.rotational.copy(o);let h=this.computeGW(),d=this.computeGiMf();return-h*e-t*d}},ux=new E,dx=new E,ji=class r{constructor(t,e,n){n=Qo.defaults(n,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=r.idCounter++,this.materials=[t,e],this.friction=n.friction,this.restitution=n.restitution,this.contactEquationStiffness=n.contactEquationStiffness,this.contactEquationRelaxation=n.contactEquationRelaxation,this.frictionEquationStiffness=n.frictionEquationStiffness,this.frictionEquationRelaxation=n.frictionEquationRelaxation}};ji.idCounter=0;var $i=class r{constructor(t){t===void 0&&(t={});let e="";typeof t=="string"&&(e=t,t={}),this.name=e,this.id=r.idCounter++,this.friction=typeof t.friction<"u"?t.friction:-1,this.restitution=typeof t.restitution<"u"?t.restitution:-1}};$i.idCounter=0;var vw=new E,yw=new E,xw=new E,_w=new E,ww=new E,Mw=new E,Sw=new E,bw=new E,Ew=new E,Aw=new E,Tw=new E;var Cw=new E,Rw=new E;new E;new E;new E;var Pw=new E,Iw=new E,Lw=new E;new Tn;new E;var Nw=new E,Dw=new E,Fw=[new E(1,0,0),new E(0,1,0),new E(0,0,1)],Uw=new E;var Bw=new E,Ow=new E,zw=new E;var kw=new E,Vw=new E,Hw=new E,Gw=new E;var Ww=new E,Xw=new E,qw=new E;var na=class extends zt{constructor(t){if(super({type:zt.types.SPHERE}),this.radius=t!==void 0?t:1,this.radius<0)throw new Error("The sphere radius cannot be negative.");this.updateBoundingSphereRadius()}calculateLocalInertia(t,e){e===void 0&&(e=new E);let n=2*t*this.radius*this.radius/5;return e.x=n,e.y=n,e.z=n,e}volume(){return 4*Math.PI*Math.pow(this.radius,3)/3}updateBoundingSphereRadius(){this.boundingSphereRadius=this.radius}calculateWorldAABB(t,e,n,i){let s=this.radius,o=["x","y","z"];for(let a=0;a<o.length;a++){let l=o[a];n[l]=t[l]-s,i[l]=t[l]+s}}};var Yw=new E,Zw=new E;var jw=new E,$w=new E,Kw=new E,Jw=new E,Qw=new E,tM=new E,eM=new E;var ia=class extends zt{constructor(){super({type:zt.types.PLANE}),this.worldNormal=new E,this.worldNormalNeedsUpdate=!0,this.boundingSphereRadius=Number.MAX_VALUE}computeWorldNormal(t){let e=this.worldNormal;e.set(0,0,1),t.vmult(e,e),this.worldNormalNeedsUpdate=!1}calculateLocalInertia(t,e){return e===void 0&&(e=new E),e}volume(){return Number.MAX_VALUE}calculateWorldAABB(t,e,n,i){ni.set(0,0,1),e.vmult(ni,ni);let s=Number.MAX_VALUE;n.set(-s,-s,-s),i.set(s,s,s),ni.x===1?i.x=t.x:ni.x===-1&&(n.x=t.x),ni.y===1?i.y=t.y:ni.y===-1&&(n.y=t.y),ni.z===1?i.z=t.z:ni.z===-1&&(n.z=t.z)}updateBoundingSphereRadius(){this.boundingSphereRadius=Number.MAX_VALUE}},ni=new E;var nM=new E,iM=new E,sM=new E,rM=new E,oM=new E,aM=new E,lM=new E,cM=new E,hM=new E;var uM=new E,dM=new xn;var fM=new E,pM=new xn,mM=new E,gM=new E,vM=new E,yM=new E,xM=new E,_M=new E,wM=new E,MM=new xn,SM=new E,bM=new Ee,EM=new xn,uc=class{constructor(){this.equations=[]}solve(t,e){return 0}addEquation(t){t.enabled&&!t.bi.isTrigger&&!t.bj.isTrigger&&this.equations.push(t)}removeEquation(t){let e=this.equations,n=e.indexOf(t);n!==-1&&e.splice(n,1)}removeAllEquations(){this.equations.length=0}},dc=class extends uc{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(t,e){let n=0,i=this.iterations,s=this.tolerance*this.tolerance,o=this.equations,a=o.length,l=e.bodies,c=l.length,h=t,d,u,f,g,v,p;if(a!==0)for(let M=0;M!==c;M++)l[M].updateSolveMassProperties();let m=px,x=mx,y=fx;m.length=a,x.length=a,y.length=a;for(let M=0;M!==a;M++){let I=o[M];y[M]=0,x[M]=I.computeB(h),m[M]=1/I.computeC()}if(a!==0){for(let A=0;A!==c;A++){let P=l[A],W=P.vlambda,S=P.wlambda;W.set(0,0,0),S.set(0,0,0)}for(n=0;n!==i;n++){g=0;for(let A=0;A!==a;A++){let P=o[A];d=x[A],u=m[A],p=y[A],v=P.computeGWlambda(),f=u*(d-v-P.eps*p),p+f<P.minForce?f=P.minForce-p:p+f>P.maxForce&&(f=P.maxForce-p),y[A]+=f,g+=f>0?f:-f,P.addToWlambda(f)}if(g*g<s)break}for(let A=0;A!==c;A++){let P=l[A],W=P.velocity,S=P.angularVelocity;P.vlambda.vmul(P.linearFactor,P.vlambda),W.vadd(P.vlambda,W),P.wlambda.vmul(P.angularFactor,P.wlambda),S.vadd(P.wlambda,S)}let M=o.length,I=1/h;for(;M--;)o[M].multiplier=y[M]*I}return n}},fx=[],px=[],mx=[];var AM=le.STATIC;var fc=class{constructor(){this.objects=[],this.type=Object}release(){let t=arguments.length;for(let e=0;e!==t;e++)this.objects.push(e<0||arguments.length<=e?void 0:arguments[e]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(t){let e=this.objects;for(;e.length>t;)e.pop();for(;e.length<t;)e.push(this.constructObject());return this}},pc=class extends fc{constructor(){super(...arguments),this.type=E}constructObject(){return new E}},Pe={sphereSphere:zt.types.SPHERE,spherePlane:zt.types.SPHERE|zt.types.PLANE,boxBox:zt.types.BOX|zt.types.BOX,sphereBox:zt.types.SPHERE|zt.types.BOX,planeBox:zt.types.PLANE|zt.types.BOX,convexConvex:zt.types.CONVEXPOLYHEDRON,sphereConvex:zt.types.SPHERE|zt.types.CONVEXPOLYHEDRON,planeConvex:zt.types.PLANE|zt.types.CONVEXPOLYHEDRON,boxConvex:zt.types.BOX|zt.types.CONVEXPOLYHEDRON,sphereHeightfield:zt.types.SPHERE|zt.types.HEIGHTFIELD,boxHeightfield:zt.types.BOX|zt.types.HEIGHTFIELD,convexHeightfield:zt.types.CONVEXPOLYHEDRON|zt.types.HEIGHTFIELD,sphereParticle:zt.types.PARTICLE|zt.types.SPHERE,planeParticle:zt.types.PLANE|zt.types.PARTICLE,boxParticle:zt.types.BOX|zt.types.PARTICLE,convexParticle:zt.types.PARTICLE|zt.types.CONVEXPOLYHEDRON,cylinderCylinder:zt.types.CYLINDER,sphereCylinder:zt.types.SPHERE|zt.types.CYLINDER,planeCylinder:zt.types.PLANE|zt.types.CYLINDER,boxCylinder:zt.types.BOX|zt.types.CYLINDER,convexCylinder:zt.types.CONVEXPOLYHEDRON|zt.types.CYLINDER,heightfieldCylinder:zt.types.HEIGHTFIELD|zt.types.CYLINDER,particleCylinder:zt.types.PARTICLE|zt.types.CYLINDER,sphereTrimesh:zt.types.SPHERE|zt.types.TRIMESH,planeTrimesh:zt.types.PLANE|zt.types.TRIMESH},mc=class{get[Pe.sphereSphere](){return this.sphereSphere}get[Pe.spherePlane](){return this.spherePlane}get[Pe.boxBox](){return this.boxBox}get[Pe.sphereBox](){return this.sphereBox}get[Pe.planeBox](){return this.planeBox}get[Pe.convexConvex](){return this.convexConvex}get[Pe.sphereConvex](){return this.sphereConvex}get[Pe.planeConvex](){return this.planeConvex}get[Pe.boxConvex](){return this.boxConvex}get[Pe.sphereHeightfield](){return this.sphereHeightfield}get[Pe.boxHeightfield](){return this.boxHeightfield}get[Pe.convexHeightfield](){return this.convexHeightfield}get[Pe.sphereParticle](){return this.sphereParticle}get[Pe.planeParticle](){return this.planeParticle}get[Pe.boxParticle](){return this.boxParticle}get[Pe.convexParticle](){return this.convexParticle}get[Pe.cylinderCylinder](){return this.convexConvex}get[Pe.sphereCylinder](){return this.sphereConvex}get[Pe.planeCylinder](){return this.planeConvex}get[Pe.boxCylinder](){return this.boxConvex}get[Pe.convexCylinder](){return this.convexConvex}get[Pe.heightfieldCylinder](){return this.heightfieldCylinder}get[Pe.particleCylinder](){return this.particleCylinder}get[Pe.sphereTrimesh](){return this.sphereTrimesh}get[Pe.planeTrimesh](){return this.planeTrimesh}constructor(t){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new pc,this.world=t,this.currentContactMaterial=t.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(t,e,n,i,s,o){let a;this.contactPointPool.length?(a=this.contactPointPool.pop(),a.bi=t,a.bj=e):a=new hc(t,e),a.enabled=t.collisionResponse&&e.collisionResponse&&n.collisionResponse&&i.collisionResponse;let l=this.currentContactMaterial;a.restitution=l.restitution,a.setSpookParams(l.contactEquationStiffness,l.contactEquationRelaxation,this.world.dt);let c=n.material||t.material,h=i.material||e.material;return c&&h&&c.restitution>=0&&h.restitution>=0&&(a.restitution=c.restitution*h.restitution),a.si=s||n,a.sj=o||i,a}createFrictionEquationsFromContact(t,e){let n=t.bi,i=t.bj,s=t.si,o=t.sj,a=this.world,l=this.currentContactMaterial,c=l.friction,h=s.material||n.material,d=o.material||i.material;if(h&&d&&h.friction>=0&&d.friction>=0&&(c=h.friction*d.friction),c>0){let u=c*(a.frictionGravity||a.gravity).length(),f=n.invMass+i.invMass;f>0&&(f=1/f);let g=this.frictionEquationPool,v=g.length?g.pop():new ea(n,i,u*f),p=g.length?g.pop():new ea(n,i,u*f);return v.bi=p.bi=n,v.bj=p.bj=i,v.minForce=p.minForce=-u*f,v.maxForce=p.maxForce=u*f,v.ri.copy(t.ri),v.rj.copy(t.rj),p.ri.copy(t.ri),p.rj.copy(t.rj),t.ni.tangents(v.t,p.t),v.setSpookParams(l.frictionEquationStiffness,l.frictionEquationRelaxation,a.dt),p.setSpookParams(l.frictionEquationStiffness,l.frictionEquationRelaxation,a.dt),v.enabled=p.enabled=t.enabled,e.push(v,p),!0}return!1}createFrictionFromAverage(t){let e=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(e,this.frictionResult)||t===1)return;let n=this.frictionResult[this.frictionResult.length-2],i=this.frictionResult[this.frictionResult.length-1];Yi.setZero(),ks.setZero(),Vs.setZero();let s=e.bi;e.bj;for(let a=0;a!==t;a++)e=this.result[this.result.length-1-a],e.bi!==s?(Yi.vadd(e.ni,Yi),ks.vadd(e.ri,ks),Vs.vadd(e.rj,Vs)):(Yi.vsub(e.ni,Yi),ks.vadd(e.rj,ks),Vs.vadd(e.ri,Vs));let o=1/t;ks.scale(o,n.ri),Vs.scale(o,n.rj),i.ri.copy(n.ri),i.rj.copy(n.rj),Yi.normalize(),Yi.tangents(n.t,i.t)}getContacts(t,e,n,i,s,o,a){this.contactPointPool=s,this.frictionEquationPool=a,this.result=i,this.frictionResult=o;let l=yx,c=xx,h=gx,d=vx;for(let u=0,f=t.length;u!==f;u++){let g=t[u],v=e[u],p=null;g.material&&v.material&&(p=n.getContactMaterial(g.material,v.material)||null);let m=g.type&le.KINEMATIC&&v.type&le.STATIC||g.type&le.STATIC&&v.type&le.KINEMATIC||g.type&le.KINEMATIC&&v.type&le.KINEMATIC;for(let x=0;x<g.shapes.length;x++){g.quaternion.mult(g.shapeOrientations[x],l),g.quaternion.vmult(g.shapeOffsets[x],h),h.vadd(g.position,h);let y=g.shapes[x];for(let M=0;M<v.shapes.length;M++){v.quaternion.mult(v.shapeOrientations[M],c),v.quaternion.vmult(v.shapeOffsets[M],d),d.vadd(v.position,d);let I=v.shapes[M];if(!(y.collisionFilterMask&I.collisionFilterGroup&&I.collisionFilterMask&y.collisionFilterGroup)||h.distanceTo(d)>y.boundingSphereRadius+I.boundingSphereRadius)continue;let A=null;y.material&&I.material&&(A=n.getContactMaterial(y.material,I.material)||null),this.currentContactMaterial=A||p||n.defaultContactMaterial;let P=y.type|I.type,W=this[P];if(W){let S=!1;y.type<I.type?S=W.call(this,y,I,h,d,l,c,g,v,y,I,m):S=W.call(this,I,y,d,h,c,l,v,g,y,I,m),S&&m&&(n.shapeOverlapKeeper.set(y.id,I.id),n.bodyOverlapKeeper.set(g.id,v.id))}}}}}sphereSphere(t,e,n,i,s,o,a,l,c,h,d){if(d)return n.distanceSquared(i)<(t.radius+e.radius)**2;let u=this.createContactEquation(a,l,t,e,c,h);i.vsub(n,u.ni),u.ni.normalize(),u.ri.copy(u.ni),u.rj.copy(u.ni),u.ri.scale(t.radius,u.ri),u.rj.scale(-e.radius,u.rj),u.ri.vadd(n,u.ri),u.ri.vsub(a.position,u.ri),u.rj.vadd(i,u.rj),u.rj.vsub(l.position,u.rj),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}spherePlane(t,e,n,i,s,o,a,l,c,h,d){let u=this.createContactEquation(a,l,t,e,c,h);if(u.ni.set(0,0,1),o.vmult(u.ni,u.ni),u.ni.negate(u.ni),u.ni.normalize(),u.ni.scale(t.radius,u.ri),n.vsub(i,jo),u.ni.scale(u.ni.dot(jo),td),jo.vsub(td,u.rj),-jo.dot(u.ni)<=t.radius){if(d)return!0;let f=u.ri,g=u.rj;f.vadd(n,f),f.vsub(a.position,f),g.vadd(i,g),g.vsub(l.position,g),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}}boxBox(t,e,n,i,s,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e.convexPolyhedronRepresentation,n,i,s,o,a,l,t,e,d)}sphereBox(t,e,n,i,s,o,a,l,c,h,d){let u=this.v3pool,f=Xx;n.vsub(i,$o),e.getSideNormals(f,o);let g=t.radius,v=!1,p=Yx,m=Zx,x=jx,y=null,M=0,I=0,A=0,P=null;for(let O=0,it=f.length;O!==it&&v===!1;O++){let $=Hx;$.copy(f[O]);let Z=$.length();$.normalize();let rt=$o.dot($);if(rt<Z+g&&rt>0){let lt=Gx,st=Wx;lt.copy(f[(O+1)%3]),st.copy(f[(O+2)%3]);let tt=lt.length(),ct=st.length();lt.normalize(),st.normalize();let _t=$o.dot(lt),yt=$o.dot(st);if(_t<tt&&_t>-tt&&yt<ct&&yt>-ct){let wt=Math.abs(rt-Z-g);if((P===null||wt<P)&&(P=wt,I=_t,A=yt,y=Z,p.copy($),m.copy(lt),x.copy(st),M++,d))return!0}}}if(M){v=!0;let O=this.createContactEquation(a,l,t,e,c,h);p.scale(-g,O.ri),O.ni.copy(p),O.ni.negate(O.ni),p.scale(y,p),m.scale(I,m),p.vadd(m,p),x.scale(A,x),p.vadd(x,O.rj),O.ri.vadd(n,O.ri),O.ri.vsub(a.position,O.ri),O.rj.vadd(i,O.rj),O.rj.vsub(l.position,O.rj),this.result.push(O),this.createFrictionEquationsFromContact(O,this.frictionResult)}let W=u.get(),S=qx;for(let O=0;O!==2&&!v;O++)for(let it=0;it!==2&&!v;it++)for(let $=0;$!==2&&!v;$++)if(W.set(0,0,0),O?W.vadd(f[0],W):W.vsub(f[0],W),it?W.vadd(f[1],W):W.vsub(f[1],W),$?W.vadd(f[2],W):W.vsub(f[2],W),i.vadd(W,S),S.vsub(n,S),S.lengthSquared()<g*g){if(d)return!0;v=!0;let Z=this.createContactEquation(a,l,t,e,c,h);Z.ri.copy(S),Z.ri.normalize(),Z.ni.copy(Z.ri),Z.ri.scale(g,Z.ri),Z.rj.copy(W),Z.ri.vadd(n,Z.ri),Z.ri.vsub(a.position,Z.ri),Z.rj.vadd(i,Z.rj),Z.rj.vsub(l.position,Z.rj),this.result.push(Z),this.createFrictionEquationsFromContact(Z,this.frictionResult)}u.release(W),W=null;let b=u.get(),V=u.get(),Y=u.get(),X=u.get(),L=u.get(),U=f.length;for(let O=0;O!==U&&!v;O++)for(let it=0;it!==U&&!v;it++)if(O%3!==it%3){f[it].cross(f[O],b),b.normalize(),f[O].vadd(f[it],V),Y.copy(n),Y.vsub(V,Y),Y.vsub(i,Y);let $=Y.dot(b);b.scale($,X);let Z=0;for(;Z===O%3||Z===it%3;)Z++;L.copy(n),L.vsub(X,L),L.vsub(V,L),L.vsub(i,L);let rt=Math.abs($),lt=L.length();if(rt<f[Z].length()&&lt<g){if(d)return!0;v=!0;let st=this.createContactEquation(a,l,t,e,c,h);V.vadd(X,st.rj),st.rj.copy(st.rj),L.negate(st.ni),st.ni.normalize(),st.ri.copy(st.rj),st.ri.vadd(i,st.ri),st.ri.vsub(n,st.ri),st.ri.normalize(),st.ri.scale(g,st.ri),st.ri.vadd(n,st.ri),st.ri.vsub(a.position,st.ri),st.rj.vadd(i,st.rj),st.rj.vsub(l.position,st.rj),this.result.push(st),this.createFrictionEquationsFromContact(st,this.frictionResult)}}u.release(b,V,Y,X,L)}planeBox(t,e,n,i,s,o,a,l,c,h,d){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,e.convexPolyhedronRepresentation.id=e.id,this.planeConvex(t,e.convexPolyhedronRepresentation,n,i,s,o,a,l,t,e,d)}convexConvex(t,e,n,i,s,o,a,l,c,h,d,u,f){let g=h_;if(!(n.distanceTo(i)>t.boundingSphereRadius+e.boundingSphereRadius)&&t.findSeparatingAxis(e,n,s,i,o,g,u,f)){let v=[],p=u_;t.clipAgainstHull(n,s,e,i,o,g,-100,100,v);let m=0;for(let x=0;x!==v.length;x++){if(d)return!0;let y=this.createContactEquation(a,l,t,e,c,h),M=y.ri,I=y.rj;g.negate(y.ni),v[x].normal.negate(p),p.scale(v[x].depth,p),v[x].point.vadd(p,M),I.copy(v[x].point),M.vsub(n,M),I.vsub(i,I),M.vadd(n,M),M.vsub(a.position,M),I.vadd(i,I),I.vsub(l.position,I),this.result.push(y),m++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(y,this.frictionResult)}this.enableFrictionReduction&&m&&this.createFrictionFromAverage(m)}}sphereConvex(t,e,n,i,s,o,a,l,c,h,d){let u=this.v3pool;n.vsub(i,$x);let f=e.faceNormals,g=e.faces,v=e.vertices,p=t.radius,m=!1;for(let x=0;x!==v.length;x++){let y=v[x],M=t_;o.vmult(y,M),i.vadd(M,M);let I=Qx;if(M.vsub(n,I),I.lengthSquared()<p*p){if(d)return!0;m=!0;let A=this.createContactEquation(a,l,t,e,c,h);A.ri.copy(I),A.ri.normalize(),A.ni.copy(A.ri),A.ri.scale(p,A.ri),M.vsub(i,A.rj),A.ri.vadd(n,A.ri),A.ri.vsub(a.position,A.ri),A.rj.vadd(i,A.rj),A.rj.vsub(l.position,A.rj),this.result.push(A),this.createFrictionEquationsFromContact(A,this.frictionResult);return}}for(let x=0,y=g.length;x!==y&&m===!1;x++){let M=f[x],I=g[x],A=e_;o.vmult(M,A);let P=n_;o.vmult(v[I[0]],P),P.vadd(i,P);let W=i_;A.scale(-p,W),n.vadd(W,W);let S=s_;W.vsub(P,S);let b=S.dot(A),V=r_;if(n.vsub(P,V),b<0&&V.dot(A)>0){let Y=[];for(let X=0,L=I.length;X!==L;X++){let U=u.get();o.vmult(v[I[X]],U),i.vadd(U,U),Y.push(U)}if(Vx(Y,A,n)){if(d)return!0;m=!0;let X=this.createContactEquation(a,l,t,e,c,h);A.scale(-p,X.ri),A.negate(X.ni);let L=u.get();A.scale(-b,L);let U=u.get();A.scale(-p,U),n.vsub(i,X.rj),X.rj.vadd(U,X.rj),X.rj.vadd(L,X.rj),X.rj.vadd(i,X.rj),X.rj.vsub(l.position,X.rj),X.ri.vadd(n,X.ri),X.ri.vsub(a.position,X.ri),u.release(L),u.release(U),this.result.push(X),this.createFrictionEquationsFromContact(X,this.frictionResult);for(let O=0,it=Y.length;O!==it;O++)u.release(Y[O]);return}else for(let X=0;X!==I.length;X++){let L=u.get(),U=u.get();o.vmult(v[I[(X+1)%I.length]],L),o.vmult(v[I[(X+2)%I.length]],U),i.vadd(L,L),i.vadd(U,U);let O=Kx;U.vsub(L,O);let it=Jx;O.unit(it);let $=u.get(),Z=u.get();n.vsub(L,Z);let rt=Z.dot(it);it.scale(rt,$),$.vadd(L,$);let lt=u.get();if($.vsub(n,lt),rt>0&&rt*rt<O.lengthSquared()&&lt.lengthSquared()<p*p){if(d)return!0;let st=this.createContactEquation(a,l,t,e,c,h);$.vsub(i,st.rj),$.vsub(n,st.ni),st.ni.normalize(),st.ni.scale(p,st.ri),st.rj.vadd(i,st.rj),st.rj.vsub(l.position,st.rj),st.ri.vadd(n,st.ri),st.ri.vsub(a.position,st.ri),this.result.push(st),this.createFrictionEquationsFromContact(st,this.frictionResult);for(let tt=0,ct=Y.length;tt!==ct;tt++)u.release(Y[tt]);u.release(L),u.release(U),u.release($),u.release(lt),u.release(Z);return}u.release(L),u.release(U),u.release($),u.release(lt),u.release(Z)}for(let X=0,L=Y.length;X!==L;X++)u.release(Y[X])}}}planeConvex(t,e,n,i,s,o,a,l,c,h,d){let u=o_,f=a_;f.set(0,0,1),s.vmult(f,f);let g=0,v=l_;for(let p=0;p!==e.vertices.length;p++)if(u.copy(e.vertices[p]),o.vmult(u,u),i.vadd(u,u),u.vsub(n,v),f.dot(v)<=0){if(d)return!0;let x=this.createContactEquation(a,l,t,e,c,h),y=c_;f.scale(f.dot(v),y),u.vsub(y,y),y.vsub(n,x.ri),x.ni.copy(f),u.vsub(i,x.rj),x.ri.vadd(n,x.ri),x.ri.vsub(a.position,x.ri),x.rj.vadd(i,x.rj),x.rj.vsub(l.position,x.rj),this.result.push(x),g++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(x,this.frictionResult)}this.enableFrictionReduction&&g&&this.createFrictionFromAverage(g)}boxConvex(t,e,n,i,s,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e,n,i,s,o,a,l,t,e,d)}sphereHeightfield(t,e,n,i,s,o,a,l,c,h,d){let u=e.data,f=t.radius,g=e.elementSize,v=S_,p=M_;Ee.pointToLocalFrame(i,o,n,p);let m=Math.floor((p.x-f)/g)-1,x=Math.ceil((p.x+f)/g)+1,y=Math.floor((p.y-f)/g)-1,M=Math.ceil((p.y+f)/g)+1;if(x<0||M<0||m>u.length||y>u[0].length)return;m<0&&(m=0),x<0&&(x=0),y<0&&(y=0),M<0&&(M=0),m>=u.length&&(m=u.length-1),x>=u.length&&(x=u.length-1),M>=u[0].length&&(M=u[0].length-1),y>=u[0].length&&(y=u[0].length-1);let I=[];e.getRectMinMax(m,y,x,M,I);let A=I[0],P=I[1];if(p.z-f>P||p.z+f<A)return;let W=this.result;for(let S=m;S<x;S++)for(let b=y;b<M;b++){let V=W.length,Y=!1;if(e.getConvexTrianglePillar(S,b,!1),Ee.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(Y=this.sphereConvex(t,e.pillarConvex,n,v,s,o,a,l,t,e,d)),d&&Y||(e.getConvexTrianglePillar(S,b,!0),Ee.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(Y=this.sphereConvex(t,e.pillarConvex,n,v,s,o,a,l,t,e,d)),d&&Y))return!0;if(W.length-V>2)return}}boxHeightfield(t,e,n,i,s,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexHeightfield(t.convexPolyhedronRepresentation,e,n,i,s,o,a,l,t,e,d)}convexHeightfield(t,e,n,i,s,o,a,l,c,h,d){let u=e.data,f=e.elementSize,g=t.boundingSphereRadius,v=__,p=w_,m=x_;Ee.pointToLocalFrame(i,o,n,m);let x=Math.floor((m.x-g)/f)-1,y=Math.ceil((m.x+g)/f)+1,M=Math.floor((m.y-g)/f)-1,I=Math.ceil((m.y+g)/f)+1;if(y<0||I<0||x>u.length||M>u[0].length)return;x<0&&(x=0),y<0&&(y=0),M<0&&(M=0),I<0&&(I=0),x>=u.length&&(x=u.length-1),y>=u.length&&(y=u.length-1),I>=u[0].length&&(I=u[0].length-1),M>=u[0].length&&(M=u[0].length-1);let A=[];e.getRectMinMax(x,M,y,I,A);let P=A[0],W=A[1];if(!(m.z-g>W||m.z+g<P))for(let S=x;S<y;S++)for(let b=M;b<I;b++){let V=!1;if(e.getConvexTrianglePillar(S,b,!1),Ee.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(V=this.convexConvex(t,e.pillarConvex,n,v,s,o,a,l,null,null,d,p,null)),d&&V||(e.getConvexTrianglePillar(S,b,!0),Ee.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(V=this.convexConvex(t,e.pillarConvex,n,v,s,o,a,l,null,null,d,p,null)),d&&V))return!0}}sphereParticle(t,e,n,i,s,o,a,l,c,h,d){let u=m_;if(u.set(0,0,1),i.vsub(n,u),u.lengthSquared()<=t.radius*t.radius){if(d)return!0;let g=this.createContactEquation(l,a,e,t,c,h);u.normalize(),g.rj.copy(u),g.rj.scale(t.radius,g.rj),g.ni.copy(u),g.ni.negate(g.ni),g.ri.set(0,0,0),this.result.push(g),this.createFrictionEquationsFromContact(g,this.frictionResult)}}planeParticle(t,e,n,i,s,o,a,l,c,h,d){let u=d_;u.set(0,0,1),a.quaternion.vmult(u,u);let f=f_;if(i.vsub(a.position,f),u.dot(f)<=0){if(d)return!0;let v=this.createContactEquation(l,a,e,t,c,h);v.ni.copy(u),v.ni.negate(v.ni),v.ri.set(0,0,0);let p=p_;u.scale(u.dot(i),p),i.vsub(p,p),v.rj.copy(p),this.result.push(v),this.createFrictionEquationsFromContact(v,this.frictionResult)}}boxParticle(t,e,n,i,s,o,a,l,c,h,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexParticle(t.convexPolyhedronRepresentation,e,n,i,s,o,a,l,t,e,d)}convexParticle(t,e,n,i,s,o,a,l,c,h,d){let u=-1,f=v_,g=y_,v=null,p=g_;if(p.copy(i),p.vsub(n,p),s.conjugate(ed),ed.vmult(p,p),t.pointIsInside(p)){t.worldVerticesNeedsUpdate&&t.computeWorldVertices(n,s),t.worldFaceNormalsNeedsUpdate&&t.computeWorldFaceNormals(s);for(let m=0,x=t.faces.length;m!==x;m++){let y=[t.worldVertices[t.faces[m][0]]],M=t.worldFaceNormals[m];i.vsub(y[0],nd);let I=-M.dot(nd);if(v===null||Math.abs(I)<Math.abs(v)){if(d)return!0;v=I,u=m,f.copy(M)}}if(u!==-1){let m=this.createContactEquation(l,a,e,t,c,h);f.scale(v,g),g.vadd(i,g),g.vsub(n,g),m.rj.copy(g),f.negate(m.ni),m.ri.set(0,0,0);let x=m.ri,y=m.rj;x.vadd(i,x),x.vsub(l.position,x),y.vadd(n,y),y.vsub(a.position,y),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(t,e,n,i,s,o,a,l,c,h,d){return this.convexHeightfield(e,t,i,n,o,s,l,a,c,h,d)}particleCylinder(t,e,n,i,s,o,a,l,c,h,d){return this.convexParticle(e,t,i,n,o,s,l,a,c,h,d)}sphereTrimesh(t,e,n,i,s,o,a,l,c,h,d){let u=Tx,f=Cx,g=Rx,v=Px,p=Ix,m=Lx,x=Ux,y=Ax,M=bx,I=Bx;Ee.pointToLocalFrame(i,o,n,p);let A=t.radius;x.lowerBound.set(p.x-A,p.y-A,p.z-A),x.upperBound.set(p.x+A,p.y+A,p.z+A),e.getTrianglesInAABB(x,I);let P=Ex,W=t.radius*t.radius;for(let X=0;X<I.length;X++)for(let L=0;L<3;L++)if(e.getVertex(e.indices[I[X]*3+L],P),P.vsub(p,M),M.lengthSquared()<=W){if(y.copy(P),Ee.pointToWorldFrame(i,o,y,P),P.vsub(n,M),d)return!0;let U=this.createContactEquation(a,l,t,e,c,h);U.ni.copy(M),U.ni.normalize(),U.ri.copy(U.ni),U.ri.scale(t.radius,U.ri),U.ri.vadd(n,U.ri),U.ri.vsub(a.position,U.ri),U.rj.copy(P),U.rj.vsub(l.position,U.rj),this.result.push(U),this.createFrictionEquationsFromContact(U,this.frictionResult)}for(let X=0;X<I.length;X++)for(let L=0;L<3;L++){e.getVertex(e.indices[I[X]*3+L],u),e.getVertex(e.indices[I[X]*3+(L+1)%3],f),f.vsub(u,g),p.vsub(f,m);let U=m.dot(g);p.vsub(u,m);let O=m.dot(g);if(O>0&&U<0&&(p.vsub(u,m),v.copy(g),v.normalize(),O=m.dot(v),v.scale(O,m),m.vadd(u,m),m.distanceTo(p)<t.radius)){if(d)return!0;let $=this.createContactEquation(a,l,t,e,c,h);m.vsub(p,$.ni),$.ni.normalize(),$.ni.scale(t.radius,$.ri),$.ri.vadd(n,$.ri),$.ri.vsub(a.position,$.ri),Ee.pointToWorldFrame(i,o,m,m),m.vsub(l.position,$.rj),Ee.vectorToWorldFrame(o,$.ni,$.ni),Ee.vectorToWorldFrame(o,$.ri,$.ri),this.result.push($),this.createFrictionEquationsFromContact($,this.frictionResult)}}let S=Nx,b=Dx,V=Fx,Y=Sx;for(let X=0,L=I.length;X!==L;X++){e.getTriangleVertices(I[X],S,b,V),e.getNormal(I[X],Y),p.vsub(S,m);let U=m.dot(Y);if(Y.scale(U,m),p.vsub(m,m),U=m.distanceTo(p),Tn.pointInTriangle(m,S,b,V)&&U<t.radius){if(d)return!0;let O=this.createContactEquation(a,l,t,e,c,h);m.vsub(p,O.ni),O.ni.normalize(),O.ni.scale(t.radius,O.ri),O.ri.vadd(n,O.ri),O.ri.vsub(a.position,O.ri),Ee.pointToWorldFrame(i,o,m,m),m.vsub(l.position,O.rj),Ee.vectorToWorldFrame(o,O.ni,O.ni),Ee.vectorToWorldFrame(o,O.ri,O.ri),this.result.push(O),this.createFrictionEquationsFromContact(O,this.frictionResult)}}I.length=0}planeTrimesh(t,e,n,i,s,o,a,l,c,h,d){let u=new E,f=_x;f.set(0,0,1),s.vmult(f,f);for(let g=0;g<e.vertices.length/3;g++){e.getVertex(g,u);let v=new E;v.copy(u),Ee.pointToWorldFrame(i,o,v,u);let p=wx;if(u.vsub(n,p),f.dot(p)<=0){if(d)return!0;let x=this.createContactEquation(a,l,t,e,c,h);x.ni.copy(f);let y=Mx;f.scale(p.dot(f),y),u.vsub(y,y),x.ri.copy(y),x.ri.vsub(a.position,x.ri),x.rj.copy(u),x.rj.vsub(l.position,x.rj),this.result.push(x),this.createFrictionEquationsFromContact(x,this.frictionResult)}}}},Yi=new E,ks=new E,Vs=new E,gx=new E,vx=new E,yx=new en,xx=new en,_x=new E,wx=new E,Mx=new E,Sx=new E,bx=new E;new E;var Ex=new E,Ax=new E,Tx=new E,Cx=new E,Rx=new E,Px=new E,Ix=new E,Lx=new E,Nx=new E,Dx=new E,Fx=new E,Ux=new xn,Bx=[],jo=new E,td=new E,Ox=new E,zx=new E,kx=new E;function Vx(r,t,e){let n=null,i=r.length;for(let s=0;s!==i;s++){let o=r[s],a=Ox;r[(s+1)%i].vsub(o,a);let l=zx;a.cross(t,l);let c=kx;e.vsub(o,c);let h=l.dot(c);if(n===null||h>0&&n===!0||h<=0&&n===!1){n===null&&(n=h>0);continue}else return!1}return!0}var $o=new E,Hx=new E,Gx=new E,Wx=new E,Xx=[new E,new E,new E,new E,new E,new E],qx=new E,Yx=new E,Zx=new E,jx=new E,$x=new E,Kx=new E,Jx=new E,Qx=new E,t_=new E,e_=new E,n_=new E,i_=new E,s_=new E,r_=new E;new E;new E;var o_=new E,a_=new E,l_=new E,c_=new E,h_=new E,u_=new E,d_=new E,f_=new E,p_=new E,m_=new E,ed=new en,g_=new E;new E;var v_=new E,nd=new E,y_=new E,x_=new E,__=new E,w_=[0],M_=new E,S_=new E,sa=class{constructor(){this.current=[],this.previous=[]}getKey(t,e){if(e<t){let n=e;e=t,t=n}return t<<16|e}set(t,e){let n=this.getKey(t,e),i=this.current,s=0;for(;n>i[s];)s++;if(n!==i[s]){for(let o=i.length-1;o>=s;o--)i[o+1]=i[o];i[s]=n}}tick(){let t=this.current;this.current=this.previous,this.previous=t,this.current.length=0}getDiff(t,e){let n=this.current,i=this.previous,s=n.length,o=i.length,a=0;for(let l=0;l<s;l++){let c=!1,h=n[l];for(;h>i[a];)a++;c=h===i[a],c||id(t,h)}a=0;for(let l=0;l<o;l++){let c=!1,h=i[l];for(;h>n[a];)a++;c=n[a]===h,c||id(e,h)}}};function id(r,t){r.push((t&4294901760)>>16,t&65535)}var ic=(r,t)=>r<t?`${r}-${t}`:`${t}-${r}`,gc=class{constructor(){this.data={keys:[]}}get(t,e){let n=ic(t,e);return this.data[n]}set(t,e,n){let i=ic(t,e);this.get(t,e)||this.data.keys.push(i),this.data[i]=n}delete(t,e){let n=ic(t,e),i=this.data.keys.indexOf(n);i!==-1&&this.data.keys.splice(i,1),delete this.data[n]}reset(){let t=this.data,e=t.keys;for(;e.length>0;){let n=e.pop();delete t[n]}}},ra=class extends Jo{constructor(t){t===void 0&&(t={}),super(),this.dt=-1,this.allowSleep=!!t.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=t.quatNormalizeSkip!==void 0?t.quatNormalizeSkip:0,this.quatNormalizeFast=t.quatNormalizeFast!==void 0?t.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new E,t.gravity&&this.gravity.copy(t.gravity),t.frictionGravity&&(this.frictionGravity=new E,this.frictionGravity.copy(t.frictionGravity)),this.broadphase=t.broadphase!==void 0?t.broadphase:new lc,this.bodies=[],this.hasActiveBodies=!1,this.solver=t.solver!==void 0?t.solver:new dc,this.constraints=[],this.narrowphase=new mc(this),this.collisionMatrix=new Ko,this.collisionMatrixPrevious=new Ko,this.bodyOverlapKeeper=new sa,this.shapeOverlapKeeper=new sa,this.contactmaterials=[],this.contactMaterialTable=new gc,this.defaultMaterial=new $i("default"),this.defaultContactMaterial=new ji(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(t,e){return this.contactMaterialTable.get(t.id,e.id)}collisionMatrixTick(){let t=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=t,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(t){this.constraints.push(t)}removeConstraint(t){let e=this.constraints.indexOf(t);e!==-1&&this.constraints.splice(e,1)}rayTest(t,e,n){n instanceof Hs?this.raycastClosest(t,e,{skipBackfaces:!0},n):this.raycastAll(t,e,{skipBackfaces:!0},n)}raycastAll(t,e,n,i){return n===void 0&&(n={}),n.mode=Tn.ALL,n.from=t,n.to=e,n.callback=i,sc.intersectWorld(this,n)}raycastAny(t,e,n,i){return n===void 0&&(n={}),n.mode=Tn.ANY,n.from=t,n.to=e,n.result=i,sc.intersectWorld(this,n)}raycastClosest(t,e,n,i){return n===void 0&&(n={}),n.mode=Tn.CLOSEST,n.from=t,n.to=e,n.result=i,sc.intersectWorld(this,n)}addBody(t){this.bodies.includes(t)||(t.index=this.bodies.length,this.bodies.push(t),t.world=this,t.initPosition.copy(t.position),t.initVelocity.copy(t.velocity),t.timeLastSleepy=this.time,t instanceof le&&(t.initAngularVelocity.copy(t.angularVelocity),t.initQuaternion.copy(t.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=t,this.idToBodyMap[t.id]=t,this.dispatchEvent(this.addBodyEvent))}removeBody(t){t.world=null;let e=this.bodies.length-1,n=this.bodies,i=n.indexOf(t);if(i!==-1){n.splice(i,1);for(let s=0;s!==n.length;s++)n[s].index=s;this.collisionMatrix.setNumObjects(e),this.removeBodyEvent.body=t,delete this.idToBodyMap[t.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(t){return this.idToBodyMap[t]}getShapeById(t){let e=this.bodies;for(let n=0;n<e.length;n++){let i=e[n].shapes;for(let s=0;s<i.length;s++){let o=i[s];if(o.id===t)return o}}return null}addContactMaterial(t){this.contactmaterials.push(t),this.contactMaterialTable.set(t.materials[0].id,t.materials[1].id,t)}removeContactMaterial(t){let e=this.contactmaterials.indexOf(t);e!==-1&&(this.contactmaterials.splice(e,1),this.contactMaterialTable.delete(t.materials[0].id,t.materials[1].id))}fixedStep(t,e){t===void 0&&(t=1/60),e===void 0&&(e=10);let n=Xe.now()/1e3;if(!this.lastCallTime)this.step(t,void 0,e);else{let i=n-this.lastCallTime;this.step(t,i,e)}this.lastCallTime=n}step(t,e,n){if(n===void 0&&(n=10),e===void 0)this.internalStep(t),this.time+=t;else{this.accumulator+=e;let i=Xe.now(),s=0;for(;this.accumulator>=t&&s<n&&(this.internalStep(t),this.accumulator-=t,s++,!(Xe.now()-i>t*1e3)););this.accumulator=this.accumulator%t;let o=this.accumulator/t;for(let a=0;a!==this.bodies.length;a++){let l=this.bodies[a];l.previousPosition.lerp(l.position,o,l.interpolatedPosition),l.previousQuaternion.slerp(l.quaternion,o,l.interpolatedQuaternion),l.previousQuaternion.normalize()}this.time+=e}}internalStep(t){this.dt=t;let e=this.contacts,n=C_,i=R_,s=this.bodies.length,o=this.bodies,a=this.solver,l=this.gravity,c=this.doProfiling,h=this.profile,d=le.DYNAMIC,u=-1/0,f=this.constraints,g=T_;l.length();let v=l.x,p=l.y,m=l.z,x=0;for(c&&(u=Xe.now()),x=0;x!==s;x++){let X=o[x];if(X.type===d){let L=X.force,U=X.mass;L.x+=U*v,L.y+=U*p,L.z+=U*m}}for(let X=0,L=this.subsystems.length;X!==L;X++)this.subsystems[X].update();c&&(u=Xe.now()),n.length=0,i.length=0,this.broadphase.collisionPairs(this,n,i),c&&(h.broadphase=Xe.now()-u);let y=f.length;for(x=0;x!==y;x++){let X=f[x];if(!X.collideConnected)for(let L=n.length-1;L>=0;L-=1)(X.bodyA===n[L]&&X.bodyB===i[L]||X.bodyB===n[L]&&X.bodyA===i[L])&&(n.splice(L,1),i.splice(L,1))}this.collisionMatrixTick(),c&&(u=Xe.now());let M=A_,I=e.length;for(x=0;x!==I;x++)M.push(e[x]);e.length=0;let A=this.frictionEquations.length;for(x=0;x!==A;x++)g.push(this.frictionEquations[x]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(n,i,this,e,M,this.frictionEquations,g),c&&(h.narrowphase=Xe.now()-u),c&&(u=Xe.now()),x=0;x<this.frictionEquations.length;x++)a.addEquation(this.frictionEquations[x]);let P=e.length;for(let X=0;X!==P;X++){let L=e[X],U=L.bi,O=L.bj,it=L.si,$=L.sj,Z;if(U.material&&O.material?Z=this.getContactMaterial(U.material,O.material)||this.defaultContactMaterial:Z=this.defaultContactMaterial,Z.friction,U.material&&O.material&&(U.material.friction>=0&&O.material.friction>=0&&U.material.friction*O.material.friction,U.material.restitution>=0&&O.material.restitution>=0&&(L.restitution=U.material.restitution*O.material.restitution)),a.addEquation(L),U.allowSleep&&U.type===le.DYNAMIC&&U.sleepState===le.SLEEPING&&O.sleepState===le.AWAKE&&O.type!==le.STATIC){let rt=O.velocity.lengthSquared()+O.angularVelocity.lengthSquared(),lt=O.sleepSpeedLimit**2;rt>=lt*2&&(U.wakeUpAfterNarrowphase=!0)}if(O.allowSleep&&O.type===le.DYNAMIC&&O.sleepState===le.SLEEPING&&U.sleepState===le.AWAKE&&U.type!==le.STATIC){let rt=U.velocity.lengthSquared()+U.angularVelocity.lengthSquared(),lt=U.sleepSpeedLimit**2;rt>=lt*2&&(O.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(U,O,!0),this.collisionMatrixPrevious.get(U,O)||(xr.body=O,xr.contact=L,U.dispatchEvent(xr),xr.body=U,O.dispatchEvent(xr)),this.bodyOverlapKeeper.set(U.id,O.id),this.shapeOverlapKeeper.set(it.id,$.id)}for(this.emitContactEvents(),c&&(h.makeContactConstraints=Xe.now()-u,u=Xe.now()),x=0;x!==s;x++){let X=o[x];X.wakeUpAfterNarrowphase&&(X.wakeUp(),X.wakeUpAfterNarrowphase=!1)}for(y=f.length,x=0;x!==y;x++){let X=f[x];X.update();for(let L=0,U=X.equations.length;L!==U;L++){let O=X.equations[L];a.addEquation(O)}}a.solve(t,this),c&&(h.solve=Xe.now()-u),a.removeAllEquations();let W=Math.pow;for(x=0;x!==s;x++){let X=o[x];if(X.type&d){let L=W(1-X.linearDamping,t),U=X.velocity;U.scale(L,U);let O=X.angularVelocity;if(O){let it=W(1-X.angularDamping,t);O.scale(it,O)}}}this.dispatchEvent(E_),c&&(u=Xe.now());let b=this.stepnumber%(this.quatNormalizeSkip+1)===0,V=this.quatNormalizeFast;for(x=0;x!==s;x++)o[x].integrate(t,b,V);this.clearForces(),this.broadphase.dirty=!0,c&&(h.integrate=Xe.now()-u),this.stepnumber+=1,this.dispatchEvent(b_);let Y=!0;if(this.allowSleep)for(Y=!1,x=0;x!==s;x++){let X=o[x];X.sleepTick(this.time),X.sleepState!==le.SLEEPING&&(Y=!0)}this.hasActiveBodies=Y}emitContactEvents(){let t=this.hasAnyEventListener("beginContact"),e=this.hasAnyEventListener("endContact");if((t||e)&&this.bodyOverlapKeeper.getDiff(ii,si),t){for(let s=0,o=ii.length;s<o;s+=2)_r.bodyA=this.getBodyById(ii[s]),_r.bodyB=this.getBodyById(ii[s+1]),this.dispatchEvent(_r);_r.bodyA=_r.bodyB=null}if(e){for(let s=0,o=si.length;s<o;s+=2)wr.bodyA=this.getBodyById(si[s]),wr.bodyB=this.getBodyById(si[s+1]),this.dispatchEvent(wr);wr.bodyA=wr.bodyB=null}ii.length=si.length=0;let n=this.hasAnyEventListener("beginShapeContact"),i=this.hasAnyEventListener("endShapeContact");if((n||i)&&this.shapeOverlapKeeper.getDiff(ii,si),n){for(let s=0,o=ii.length;s<o;s+=2){let a=this.getShapeById(ii[s]),l=this.getShapeById(ii[s+1]);ri.shapeA=a,ri.shapeB=l,a&&(ri.bodyA=a.body),l&&(ri.bodyB=l.body),this.dispatchEvent(ri)}ri.bodyA=ri.bodyB=ri.shapeA=ri.shapeB=null}if(i){for(let s=0,o=si.length;s<o;s+=2){let a=this.getShapeById(si[s]),l=this.getShapeById(si[s+1]);oi.shapeA=a,oi.shapeB=l,a&&(oi.bodyA=a.body),l&&(oi.bodyB=l.body),this.dispatchEvent(oi)}oi.bodyA=oi.bodyB=oi.shapeA=oi.shapeB=null}}clearForces(){let t=this.bodies,e=t.length;for(let n=0;n!==e;n++){let i=t[n];i.force,i.torque,i.force.set(0,0,0),i.torque.set(0,0,0)}}};new xn;var sc=new Tn,Xe=globalThis.performance||{};if(!Xe.now){let r=Date.now();Xe.timing&&Xe.timing.navigationStart&&(r=Xe.timing.navigationStart),Xe.now=()=>Date.now()-r}new E;var b_={type:"postStep"},E_={type:"preStep"},xr={type:le.COLLIDE_EVENT_NAME,body:null,contact:null},A_=[],T_=[],C_=[],R_=[],ii=[],si=[],_r={type:"beginContact",bodyA:null,bodyB:null},wr={type:"endContact",bodyA:null,bodyB:null},ri={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},oi={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null};var Gs={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var _n=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},I_=new bi(-1,1,1,-1,0,1),_c=class extends tn{constructor(){super(),this.setAttribute("position",new Le([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Le([0,2,0,0,2,0],2))}},L_=new _c,Li=class{constructor(t){this._mesh=new Fe(L_,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,I_)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var oa=class extends _n{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof Ke?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=kn.clone(t.uniforms),this.material=new Ke({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Li(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Sr=class extends _n{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let i=t.getContext(),s=t.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,o,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}},aa=class extends _n{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var la=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new re);this._width=n.width,this._height=n.height,e=new mn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:cn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new oa(Gs),this.copyPass.material.blending=je,this.clock=new zo}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let i=0,s=this.passes.length;i<s;i++){let o=this.passes[i];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Sr!==void 0&&(o instanceof Sr?n=!0:o instanceof aa&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new re);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var ca=class extends _n{constructor(t,e,n=null,i=null,s=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new $t}render(t,e,n){let i=t.autoClear;t.autoClear=!1;let s,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor)),this.clearAlpha!==null&&(s=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=i}};var ha=class{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(t,e,n){return t[0]*e+t[1]*n}dot3(t,e,n,i){return t[0]*e+t[1]*n+t[2]*i}dot4(t,e,n,i,s){return t[0]*e+t[1]*n+t[2]*i+t[3]*s}noise(t,e){let n,i,s,o=.5*(Math.sqrt(3)-1),a=(t+e)*o,l=Math.floor(t+a),c=Math.floor(e+a),h=(3-Math.sqrt(3))/6,d=(l+c)*h,u=l-d,f=c-d,g=t-u,v=e-f,p,m;g>v?(p=1,m=0):(p=0,m=1);let x=g-p+h,y=v-m+h,M=g-1+2*h,I=v-1+2*h,A=l&255,P=c&255,W=this.perm[A+this.perm[P]]%12,S=this.perm[A+p+this.perm[P+m]]%12,b=this.perm[A+1+this.perm[P+1]]%12,V=.5-g*g-v*v;V<0?n=0:(V*=V,n=V*V*this.dot(this.grad3[W],g,v));let Y=.5-x*x-y*y;Y<0?i=0:(Y*=Y,i=Y*Y*this.dot(this.grad3[S],x,y));let X=.5-M*M-I*I;return X<0?s=0:(X*=X,s=X*X*this.dot(this.grad3[b],M,I)),70*(n+i+s)}noise3d(t,e,n){let i,s,o,a,c=(t+e+n)*.3333333333333333,h=Math.floor(t+c),d=Math.floor(e+c),u=Math.floor(n+c),f=1/6,g=(h+d+u)*f,v=h-g,p=d-g,m=u-g,x=t-v,y=e-p,M=n-m,I,A,P,W,S,b;x>=y?y>=M?(I=1,A=0,P=0,W=1,S=1,b=0):x>=M?(I=1,A=0,P=0,W=1,S=0,b=1):(I=0,A=0,P=1,W=1,S=0,b=1):y<M?(I=0,A=0,P=1,W=0,S=1,b=1):x<M?(I=0,A=1,P=0,W=0,S=1,b=1):(I=0,A=1,P=0,W=1,S=1,b=0);let V=x-I+f,Y=y-A+f,X=M-P+f,L=x-W+2*f,U=y-S+2*f,O=M-b+2*f,it=x-1+3*f,$=y-1+3*f,Z=M-1+3*f,rt=h&255,lt=d&255,st=u&255,tt=this.perm[rt+this.perm[lt+this.perm[st]]]%12,ct=this.perm[rt+I+this.perm[lt+A+this.perm[st+P]]]%12,_t=this.perm[rt+W+this.perm[lt+S+this.perm[st+b]]]%12,yt=this.perm[rt+1+this.perm[lt+1+this.perm[st+1]]]%12,wt=.6-x*x-y*y-M*M;wt<0?i=0:(wt*=wt,i=wt*wt*this.dot3(this.grad3[tt],x,y,M));let Tt=.6-V*V-Y*Y-X*X;Tt<0?s=0:(Tt*=Tt,s=Tt*Tt*this.dot3(this.grad3[ct],V,Y,X));let at=.6-L*L-U*U-O*O;at<0?o=0:(at*=at,o=at*at*this.dot3(this.grad3[_t],L,U,O));let ft=.6-it*it-$*$-Z*Z;return ft<0?a=0:(ft*=ft,a=ft*ft*this.dot3(this.grad3[yt],it,$,Z)),32*(i+s+o+a)}noise4d(t,e,n,i){let s=this.grad4,o=this.simplex,a=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,h,d,u,f,g,v=(t+e+n+i)*l,p=Math.floor(t+v),m=Math.floor(e+v),x=Math.floor(n+v),y=Math.floor(i+v),M=(p+m+x+y)*c,I=p-M,A=m-M,P=x-M,W=y-M,S=t-I,b=e-A,V=n-P,Y=i-W,X=S>b?32:0,L=S>V?16:0,U=b>V?8:0,O=S>Y?4:0,it=b>Y?2:0,$=V>Y?1:0,Z=X+L+U+O+it+$,rt=o[Z][0]>=3?1:0,lt=o[Z][1]>=3?1:0,st=o[Z][2]>=3?1:0,tt=o[Z][3]>=3?1:0,ct=o[Z][0]>=2?1:0,_t=o[Z][1]>=2?1:0,yt=o[Z][2]>=2?1:0,wt=o[Z][3]>=2?1:0,Tt=o[Z][0]>=1?1:0,at=o[Z][1]>=1?1:0,ft=o[Z][2]>=1?1:0,At=o[Z][3]>=1?1:0,q=S-rt+c,Ht=b-lt+c,Ct=V-st+c,kt=Y-tt+c,Mt=S-ct+2*c,ce=b-_t+2*c,Zt=V-yt+2*c,N=Y-wt+2*c,T=S-Tt+3*c,Q=b-at+3*c,gt=V-ft+3*c,ut=Y-At+3*c,mt=S-1+4*c,It=b-1+4*c,St=V-1+4*c,Pt=Y-1+4*c,Ot=p&255,Gt=m&255,vt=x&255,fe=y&255,ae=a[Ot+a[Gt+a[vt+a[fe]]]]%32,Kt=a[Ot+rt+a[Gt+lt+a[vt+st+a[fe+tt]]]]%32,Ut=a[Ot+ct+a[Gt+_t+a[vt+yt+a[fe+wt]]]]%32,Dt=a[Ot+Tt+a[Gt+at+a[vt+ft+a[fe+At]]]]%32,Vt=a[Ot+1+a[Gt+1+a[vt+1+a[fe+1]]]]%32,Qt=.6-S*S-b*b-V*V-Y*Y;Qt<0?h=0:(Qt*=Qt,h=Qt*Qt*this.dot4(s[ae],S,b,V,Y));let ne=.6-q*q-Ht*Ht-Ct*Ct-kt*kt;ne<0?d=0:(ne*=ne,d=ne*ne*this.dot4(s[Kt],q,Ht,Ct,kt));let te=.6-Mt*Mt-ce*ce-Zt*Zt-N*N;te<0?u=0:(te*=te,u=te*te*this.dot4(s[Ut],Mt,ce,Zt,N));let K=.6-T*T-Q*Q-gt*gt-ut*ut;K<0?f=0:(K*=K,f=K*K*this.dot4(s[Dt],T,Q,gt,ut));let H=.6-mt*mt-It*It-St*St-Pt*Pt;return H<0?g=0:(H*=H,g=H*H*this.dot4(s[Vt],mt,It,St,Pt)),27*(h+d+u+f+g)}};var br={name:"SSAOShader",defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new re},cameraProjectionMatrix:{value:new qt},cameraInverseProjectionMatrix:{value:new qt},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;

		uniform vec3 kernel[ KERNEL_SIZE ];

		uniform vec2 resolution;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float kernelRadius;
		uniform float minDistance; // avoid artifacts caused by neighbour fragments with minimal depth difference
		uniform float maxDistance; // avoid the influence of fragments which are too far away

		varying vec2 vUv;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {

			return texture2D( tDepth, screenPosition ).x;

		}

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		float getViewZ( const in float depth ) {

			#if PERSPECTIVE_CAMERA == 1

				return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

			#else

				return orthographicDepthToViewZ( depth, cameraNear, cameraFar );

			#endif

		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {

			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];

			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );

			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;

		}

		vec3 getViewNormal( const in vec2 screenPosition ) {

			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );

		}

		void main() {

			float depth = getDepth( vUv );

			if ( depth == 1.0 ) {

				gl_FragColor = vec4( 1.0 ); // don't influence background
				
			} else {

				float viewZ = getViewZ( depth );

				vec3 viewPosition = getViewPosition( vUv, depth, viewZ );
				vec3 viewNormal = getViewNormal( vUv );

				vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );
				vec3 random = vec3( texture2D( tNoise, vUv * noiseScale ).r );

				// compute matrix used to reorient a kernel vector

				vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );
				vec3 bitangent = cross( viewNormal, tangent );
				mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );

				float occlusion = 0.0;

				for ( int i = 0; i < KERNEL_SIZE; i ++ ) {

					vec3 sampleVector = kernelMatrix * kernel[ i ]; // reorient sample vector in view space
					vec3 samplePoint = viewPosition + ( sampleVector * kernelRadius ); // calculate sample point

					vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 ); // project point and calculate NDC
					samplePointNDC /= samplePointNDC.w;

					vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5; // compute uv coordinates

					float realDepth = getLinearDepth( samplePointUv ); // get linear depth from depth texture
					float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar ); // compute linear depth of the sample view Z value
					float delta = sampleDepth - realDepth;

					if ( delta > minDistance && delta < maxDistance ) { // if fragment is before sample point, increase occlusion

						occlusion += 1.0;

					}

				}

				occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );

				gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );

			}

		}`},Er={name:"SSAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Ar={name:"SSAOBlurShader",uniforms:{tDiffuse:{value:null},resolution:{value:new re}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		void main() {

			vec2 texelSize = ( 1.0 / resolution );
			float result = 0.0;

			for ( int i = - 2; i <= 2; i ++ ) {

				for ( int j = - 2; j <= 2; j ++ ) {

					vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;
					result += texture2D( tDiffuse, vUv + offset ).r;

				}

			}

			gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );

		}`};var Tr=class r extends _n{constructor(t,e,n,i,s=32){super(),this.width=n!==void 0?n:512,this.height=i!==void 0?i:512,this.clear=!0,this.camera=e,this.scene=t,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=new Map,this.generateSampleKernel(s),this.generateRandomKernelRotations();let o=new Is;o.format=_i,o.type=ti,this.normalRenderTarget=new mn(this.width,this.height,{minFilter:ke,magFilter:ke,type:cn,depthTexture:o}),this.ssaoRenderTarget=new mn(this.width,this.height,{type:cn}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new Ke({defines:Object.assign({},br.defines),uniforms:kn.clone(br.uniforms),vertexShader:br.vertexShader,fragmentShader:br.fragmentShader,blending:je}),this.ssaoMaterial.defines.KERNEL_SIZE=s,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new Po,this.normalMaterial.blending=je,this.blurMaterial=new Ke({defines:Object.assign({},Ar.defines),uniforms:kn.clone(Ar.uniforms),vertexShader:Ar.vertexShader,fragmentShader:Ar.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new Ke({defines:Object.assign({},Er.defines),uniforms:kn.clone(Er.uniforms),vertexShader:Er.vertexShader,fragmentShader:Er.fragmentShader,blending:je}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Ke({uniforms:kn.clone(Gs.uniforms),vertexShader:Gs.vertexShader,fragmentShader:Gs.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Bl,blendDst:ko,blendEquation:On,blendSrcAlpha:Ul,blendDstAlpha:ko,blendEquationAlpha:On}),this.fsQuad=new Li(null),this.originalClearColor=new $t}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}render(t,e,n){switch(t.capabilities.isWebGL2===!1&&(this.noiseTexture.format=Wl),this.overrideVisibility(),this.renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this.renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this.renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case r.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=je,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=je,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Depth:this.renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=je,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=je,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=Fl,this.renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.SSAOPass: Unknown output type.")}}renderPass(t,e,n,i,s){t.getClearColor(this.originalClearColor);let o=t.getClearAlpha(),a=t.autoClear;t.setRenderTarget(n),t.autoClear=!1,i!=null&&(t.setClearColor(i),t.setClearAlpha(s||0),t.clear()),this.fsQuad.material=e,this.fsQuad.render(t),t.autoClear=a,t.setClearColor(this.originalClearColor),t.setClearAlpha(o)}renderOverride(t,e,n,i,s){t.getClearColor(this.originalClearColor);let o=t.getClearAlpha(),a=t.autoClear;t.setRenderTarget(n),t.autoClear=!1,i=e.clearColor||i,s=e.clearAlpha||s,i!=null&&(t.setClearColor(i),t.setClearAlpha(s||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=a,t.setClearColor(this.originalClearColor),t.setClearAlpha(o)}setSize(t,e){this.width=t,this.height=e,this.ssaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.blurRenderTarget.setSize(t,e),this.ssaoMaterial.uniforms.resolution.value.set(t,e),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(t,e)}generateSampleKernel(t){let e=this.kernel;for(let n=0;n<t;n++){let i=new G;i.x=Math.random()*2-1,i.y=Math.random()*2-1,i.z=Math.random(),i.normalize();let s=n/t;s=De.lerp(.1,1,s*s),i.multiplyScalar(s),e.push(i)}}generateRandomKernelRotations(){let n=new ha,i=16,s=new Float32Array(i);for(let o=0;o<i;o++){let a=Math.random()*2-1,l=Math.random()*2-1,c=0;s[o]=n.noise3d(a,l,c)}this.noiseTexture=new Ns(s,4,4,gr,Je),this.noiseTexture.wrapS=ei,this.noiseTexture.wrapT=ei,this.noiseTexture.needsUpdate=!0}overrideVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(n){e.set(n,n.visible),(n.isPoints||n.isLine)&&(n.visible=!1)})}restoreVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(n){let i=e.get(n);n.visible=i}),e.clear()}};Tr.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var ud={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var ua=class extends _n{constructor(){super();let t=ud;this.uniforms=kn.clone(t.uniforms),this.material=new Ro({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new Li(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},be.getTransfer(this._outputColorSpace)===Te&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ol?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===zl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===kl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Vl?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Hl&&(this.material.defines.AGX_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};function dd(r,t=0){let{vertexCount:e,indices:n,uvs:i,positions:s,normals:o}=r,a=new tn,l=new Float32Array(e*3);for(let v=0;v<e*3;v++)l[v]=s[v];let c=new Qe(l,3);c.setUsage(ql),a.setAttribute("position",c);let h=new Float32Array(e*3);for(let v=0;v<e*3;v++)h[v]=o[v];let d=new Qe(h,3);d.setUsage(ql),a.setAttribute("normal",d);let u=new Float32Array(i.length);for(let v=0;v<i.length;v++)u[v]=i[v];a.setAttribute("uv",new Qe(u,2));let f=new Uint16Array(n);return a.setIndex(new Qe(f,1)),{mesh:new Fe(a,new Ds({color:16776695,roughness:.9,metalness:0,side:Nn})),positionAttr:c,normalAttr:d}}function Ws(r,t,e=!0){let n=JSON.stringify([t.paperColor,t.title,t.number,e]);if(r.designSignature===n)return;r.designSignature=n;let i=document.createElement("canvas");i.width=512,i.height=768;let s=i.getContext("2d"),o=t.paperColor||"#8b9097";if(s.fillStyle="#fffdf7",s.fillRect(0,0,512,768),s.globalAlpha=e?.24:.14,s.fillStyle=o,s.fillRect(0,0,512,768),s.globalAlpha=1,e){s.fillStyle=o,s.fillRect(26,0,64,768),s.fillRect(0,566,512,86),s.fillStyle="#343930",s.font='500 62px "Microsoft YaHei", sans-serif',s.textBaseline="top";let l=Array.from(t.title||"\u65E0\u9898"),c=[];for(let h=0;h<l.length;h+=6)c.push(l.slice(h,h+6).join(""));for(let h=0;h<6;h++){let d=c[h%c.length],u=h%2?72:112;s.fillText(d,u,34+h*118,488-u),l.length<=3&&s.fillText(d,300,84+h*118,188)}s.save(),s.translate(455,700),s.rotate(Math.PI),s.font='500 40px "Microsoft YaHei", sans-serif',s.fillText(l.slice(0,8).join(""),0,0,370),s.restore(),s.globalAlpha=.65,s.font="36px Georgia, serif",s.fillText(String(t.number||"").padStart(2,"0"),100,464)}let a=new bo(i);a.colorSpace=Ce,r.mesh.material.map?.dispose(),r.mesh.material.map=a,r.mesh.material.color.set("#ffffff"),r.mesh.material.needsUpdate=!0}function ai(r,t,e){let{vertexCount:n,frameCount:i,positions:s,normals:o}=t,{positionAttr:a,normalAttr:l}=r,c=n*3,h=Math.floor(e),d=e-h,u=h*c,f=a.array,g=l.array;if(d<1e-6)for(let v=0;v<c;v++)f[v]=s[u+v],g[v]=o[u+v];else{let p=(h+1)%i*c,m=1-d;for(let x=0;x<c;x++)f[x]=s[u+x]*m+s[p+x]*d,g[x]=o[u+x]*m+o[p+x]*d}a.needsUpdate=!0,l.needsUpdate=!0,r.mesh.geometry.computeBoundingSphere(),r.mesh.geometry.computeBoundingBox()}var fd=function(r){return URL.createObjectURL(new Blob([r],{type:"text/javascript"}))},N_=function(r){return new Worker(r)};try{URL.revokeObjectURL(fd(""))}catch{fd=function(t){return"data:application/javascript;charset=UTF-8,"+encodeURI(t)},N_=function(t){return new Worker(t,{type:"module"})}}var Cn=Uint8Array,Ni=Uint16Array,Sc=Uint32Array,pd=new Cn([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),md=new Cn([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),D_=new Cn([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),gd=function(r,t){for(var e=new Ni(31),n=0;n<31;++n)e[n]=t+=1<<r[n-1];for(var i=new Sc(e[30]),n=1;n<30;++n)for(var s=e[n];s<e[n+1];++s)i[s]=s-e[n]<<5|n;return[e,i]},vd=gd(pd,2),yd=vd[0],F_=vd[1];yd[28]=258,F_[258]=28;var xd=gd(md,0),U_=xd[0],aS=xd[1],bc=new Ni(32768);for(Se=0;Se<32768;++Se)li=(Se&43690)>>>1|(Se&21845)<<1,li=(li&52428)>>>2|(li&13107)<<2,li=(li&61680)>>>4|(li&3855)<<4,bc[Se]=((li&65280)>>>8|(li&255)<<8)>>>1;var li,Se,Cr=(function(r,t,e){for(var n=r.length,i=0,s=new Ni(t);i<n;++i)++s[r[i]-1];var o=new Ni(t);for(i=0;i<t;++i)o[i]=o[i-1]+s[i-1]<<1;var a;if(e){a=new Ni(1<<t);var l=15-t;for(i=0;i<n;++i)if(r[i])for(var c=i<<4|r[i],h=t-r[i],d=o[r[i]-1]++<<h,u=d|(1<<h)-1;d<=u;++d)a[bc[d]>>>l]=c}else for(a=new Ni(n),i=0;i<n;++i)r[i]&&(a[i]=bc[o[r[i]-1]++]>>>15-r[i]);return a}),Rr=new Cn(288);for(Se=0;Se<144;++Se)Rr[Se]=8;var Se;for(Se=144;Se<256;++Se)Rr[Se]=9;var Se;for(Se=256;Se<280;++Se)Rr[Se]=7;var Se;for(Se=280;Se<288;++Se)Rr[Se]=8;var Se,_d=new Cn(32);for(Se=0;Se<32;++Se)_d[Se]=5;var Se;var B_=Cr(Rr,9,1);var O_=Cr(_d,5,1),wc=function(r){for(var t=r[0],e=1;e<r.length;++e)r[e]>t&&(t=r[e]);return t},Un=function(r,t,e){var n=t/8|0;return(r[n]|r[n+1]<<8)>>(t&7)&e},Mc=function(r,t){var e=t/8|0;return(r[e]|r[e+1]<<8|r[e+2]<<16)>>(t&7)},z_=function(r){return(r/8|0)+(r&7&&1)},k_=function(r,t,e){(t==null||t<0)&&(t=0),(e==null||e>r.length)&&(e=r.length);var n=new(r instanceof Ni?Ni:r instanceof Sc?Sc:Cn)(e-t);return n.set(r.subarray(t,e)),n},V_=function(r,t,e){var n=r.length;if(!n||e&&!e.l&&n<5)return t||new Cn(0);var i=!t||e,s=!e||e.i;e||(e={}),t||(t=new Cn(n*3));var o=function(yt){var wt=t.length;if(yt>wt){var Tt=new Cn(Math.max(wt*2,yt));Tt.set(t),t=Tt}},a=e.f||0,l=e.p||0,c=e.b||0,h=e.l,d=e.d,u=e.m,f=e.n,g=n*8;do{if(!h){e.f=a=Un(r,l,1);var v=Un(r,l+1,3);if(l+=3,v)if(v==1)h=B_,d=O_,u=9,f=5;else if(v==2){var y=Un(r,l,31)+257,M=Un(r,l+10,15)+4,I=y+Un(r,l+5,31)+1;l+=14;for(var A=new Cn(I),P=new Cn(19),W=0;W<M;++W)P[D_[W]]=Un(r,l+W*3,7);l+=M*3;for(var S=wc(P),b=(1<<S)-1,V=Cr(P,S,1),W=0;W<I;){var Y=V[Un(r,l,b)];l+=Y&15;var p=Y>>>4;if(p<16)A[W++]=p;else{var X=0,L=0;for(p==16?(L=3+Un(r,l,3),l+=2,X=A[W-1]):p==17?(L=3+Un(r,l,7),l+=3):p==18&&(L=11+Un(r,l,127),l+=7);L--;)A[W++]=X}}var U=A.subarray(0,y),O=A.subarray(y);u=wc(U),f=wc(O),h=Cr(U,u,1),d=Cr(O,f,1)}else throw"invalid block type";else{var p=z_(l)+4,m=r[p-4]|r[p-3]<<8,x=p+m;if(x>n){if(s)throw"unexpected EOF";break}i&&o(c+m),t.set(r.subarray(p,x),c),e.b=c+=m,e.p=l=x*8;continue}if(l>g){if(s)throw"unexpected EOF";break}}i&&o(c+131072);for(var it=(1<<u)-1,$=(1<<f)-1,Z=l;;Z=l){var X=h[Mc(r,l)&it],rt=X>>>4;if(l+=X&15,l>g){if(s)throw"unexpected EOF";break}if(!X)throw"invalid length/literal";if(rt<256)t[c++]=rt;else if(rt==256){Z=l,h=null;break}else{var lt=rt-254;if(rt>264){var W=rt-257,st=pd[W];lt=Un(r,l,(1<<st)-1)+yd[W],l+=st}var tt=d[Mc(r,l)&$],ct=tt>>>4;if(!tt)throw"invalid distance";l+=tt&15;var O=U_[ct];if(ct>3){var st=md[ct];O+=Mc(r,l)&(1<<st)-1,l+=st}if(l>g){if(s)throw"unexpected EOF";break}i&&o(c+131072);for(var _t=c+lt;c<_t;c+=4)t[c]=t[c-O],t[c+1]=t[c+1-O],t[c+2]=t[c+2-O],t[c+3]=t[c+3-O];c=_t}}e.l=h,e.p=Z,e.b=c,h&&(a=1,e.m=u,e.d=d,e.n=f)}while(!a);return c==t.length?t:k_(t,0,c)};var H_=new Cn(0);var G_=function(r){if((r[0]&15)!=8||r[0]>>>4>7||(r[0]<<8|r[1])%31)throw"invalid zlib data";if(r[1]&32)throw"invalid zlib data: preset dictionaries not supported"};function Ki(r,t){return V_((G_(r),r.subarray(2,-4)),t)}var W_=typeof TextDecoder<"u"&&new TextDecoder,X_=0;try{W_.decode(H_,{stream:!0}),X_=1}catch{}function Md(r,t,e){let n=e.length-r-1;if(t>=e[n])return n-1;if(t<=e[r])return r;let i=r,s=n,o=Math.floor((i+s)/2);for(;t<e[o]||t>=e[o+1];)t<e[o]?s=o:i=o,o=Math.floor((i+s)/2);return o}function q_(r,t,e,n){let i=[],s=[],o=[];i[0]=1;for(let a=1;a<=e;++a){s[a]=t-n[r+1-a],o[a]=n[r+a]-t;let l=0;for(let c=0;c<a;++c){let h=o[c+1],d=s[a-c],u=i[c]/(h+d);i[c]=l+h*u,l=d*u}i[a]=l}return i}function Sd(r,t,e,n){let i=Md(r,n,t),s=q_(i,n,r,t),o=new ve(0,0,0,0);for(let a=0;a<=r;++a){let l=e[i-r+a],c=s[a],h=l.w*c;o.x+=l.x*h,o.y+=l.y*h,o.z+=l.z*h,o.w+=l.w*c}return o}function Y_(r,t,e,n,i){let s=[];for(let d=0;d<=e;++d)s[d]=0;let o=[];for(let d=0;d<=n;++d)o[d]=s.slice(0);let a=[];for(let d=0;d<=e;++d)a[d]=s.slice(0);a[0][0]=1;let l=s.slice(0),c=s.slice(0);for(let d=1;d<=e;++d){l[d]=t-i[r+1-d],c[d]=i[r+d]-t;let u=0;for(let f=0;f<d;++f){let g=c[f+1],v=l[d-f];a[d][f]=g+v;let p=a[f][d-1]/a[d][f];a[f][d]=u+g*p,u=v*p}a[d][d]=u}for(let d=0;d<=e;++d)o[0][d]=a[d][e];for(let d=0;d<=e;++d){let u=0,f=1,g=[];for(let v=0;v<=e;++v)g[v]=s.slice(0);g[0][0]=1;for(let v=1;v<=n;++v){let p=0,m=d-v,x=e-v;d>=v&&(g[f][0]=g[u][0]/a[x+1][m],p=g[f][0]*a[m][x]);let y=m>=-1?1:-m,M=d-1<=x?v-1:e-d;for(let A=y;A<=M;++A)g[f][A]=(g[u][A]-g[u][A-1])/a[x+1][m+A],p+=g[f][A]*a[m+A][x];d<=x&&(g[f][v]=-g[u][v-1]/a[x+1][d],p+=g[f][v]*a[d][x]),o[v][d]=p;let I=u;u=f,f=I}}let h=e;for(let d=1;d<=n;++d){for(let u=0;u<=e;++u)o[d][u]*=h;h*=e-d}return o}function Z_(r,t,e,n,i){let s=i<r?i:r,o=[],a=Md(r,n,t),l=Y_(a,n,r,s,t),c=[];for(let h=0;h<e.length;++h){let d=e[h].clone(),u=d.w;d.x*=u,d.y*=u,d.z*=u,c[h]=d}for(let h=0;h<=s;++h){let d=c[a-r].clone().multiplyScalar(l[h][0]);for(let u=1;u<=r;++u)d.add(c[a-r+u].clone().multiplyScalar(l[h][u]));o[h]=d}for(let h=s+1;h<=i+1;++h)o[h]=new ve(0,0,0);return o}function j_(r,t){let e=1;for(let i=2;i<=r;++i)e*=i;let n=1;for(let i=2;i<=t;++i)n*=i;for(let i=2;i<=r-t;++i)n*=i;return e/n}function $_(r){let t=r.length,e=[],n=[];for(let s=0;s<t;++s){let o=r[s];e[s]=new G(o.x,o.y,o.z),n[s]=o.w}let i=[];for(let s=0;s<t;++s){let o=e[s].clone();for(let a=1;a<=s;++a)o.sub(i[s-a].clone().multiplyScalar(j_(s,a)*n[a]));i[s]=o.divideScalar(n[0])}return i}function bd(r,t,e,n,i){let s=Z_(r,t,e,n,i);return $_(s)}var da=class extends Eo{constructor(t,e,n,i,s){super(),this.degree=t,this.knots=e,this.controlPoints=[],this.startKnot=i||0,this.endKnot=s||this.knots.length-1;for(let o=0;o<n.length;++o){let a=n[o];this.controlPoints[o]=new ve(a.x,a.y,a.z,a.w)}}getPoint(t,e=new G){let n=e,i=this.knots[this.startKnot]+t*(this.knots[this.endKnot]-this.knots[this.startKnot]),s=Sd(this.degree,this.knots,this.controlPoints,i);return s.w!==1&&s.divideScalar(s.w),n.set(s.x,s.y,s.z)}getTangent(t,e=new G){let n=e,i=this.knots[0]+t*(this.knots[this.knots.length-1]-this.knots[0]),s=bd(this.degree,this.knots,this.controlPoints,i,1);return n.copy(s[1]).normalize(),n}};var me,Ue,un,pa=class extends Dn{constructor(t){super(t)}load(t,e,n,i){let s=this,o=s.path===""?Oo.extractUrlBase(t):s.path,a=new dr(this.manager);a.setPath(s.path),a.setResponseType("arraybuffer"),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(t,function(l){try{e(s.parse(l,o))}catch(c){i?i(c):console.error(c),s.manager.itemError(t)}},n,i)}parse(t,e){if(J_(t))me=new Ic().parse(t);else{let i=Cd(t);if(!Q_(i))throw new Error("THREE.FBXLoader: Unknown format.");if(Ed(i)<7e3)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+Ed(i));me=new Pc().parse(i)}let n=new Uo(this.manager).setPath(this.resourcePath||e).setCrossOrigin(this.crossOrigin);return new Tc(n,this.manager).parse(me)}},Tc=class{constructor(t,e){this.textureLoader=t,this.manager=e}parse(){Ue=this.parseConnections();let t=this.parseImages(),e=this.parseTextures(t),n=this.parseMaterials(e),i=this.parseDeformers(),s=new Cc().parse(i);return this.parseScene(i,s,n),un}parseConnections(){let t=new Map;return"Connections"in me&&me.Connections.connections.forEach(function(n){let i=n[0],s=n[1],o=n[2];t.has(i)||t.set(i,{parents:[],children:[]});let a={ID:s,relationship:o};t.get(i).parents.push(a),t.has(s)||t.set(s,{parents:[],children:[]});let l={ID:i,relationship:o};t.get(s).children.push(l)}),t}parseImages(){let t={},e={};if("Video"in me.Objects){let n=me.Objects.Video;for(let i in n){let s=n[i],o=parseInt(i);if(t[o]=s.RelativeFilename||s.Filename,"Content"in s){let a=s.Content instanceof ArrayBuffer&&s.Content.byteLength>0,l=typeof s.Content=="string"&&s.Content!=="";if(a||l){let c=this.parseImage(n[i]);e[s.RelativeFilename||s.Filename]=c}}}}for(let n in t){let i=t[n];e[i]!==void 0?t[n]=e[i]:t[n]=t[n].split("\\").pop()}return t}parseImage(t){let e=t.Content,n=t.RelativeFilename||t.Filename,i=n.slice(n.lastIndexOf(".")+1).toLowerCase(),s;switch(i){case"bmp":s="image/bmp";break;case"jpg":case"jpeg":s="image/jpeg";break;case"png":s="image/png";break;case"tif":s="image/tiff";break;case"tga":this.manager.getHandler(".tga")===null&&console.warn("FBXLoader: TGA loader not found, skipping ",n),s="image/tga";break;default:console.warn('FBXLoader: Image type "'+i+'" is not supported.');return}if(typeof e=="string")return"data:"+s+";base64,"+e;{let o=new Uint8Array(e);return window.URL.createObjectURL(new Blob([o],{type:s}))}}parseTextures(t){let e=new Map;if("Texture"in me.Objects){let n=me.Objects.Texture;for(let i in n){let s=this.parseTexture(n[i],t);e.set(parseInt(i),s)}}return e}parseTexture(t,e){let n=this.loadTexture(t,e);n.ID=t.id,n.name=t.attrName;let i=t.WrapModeU,s=t.WrapModeV,o=i!==void 0?i.value:0,a=s!==void 0?s.value:0;if(n.wrapS=o===0?ei:rn,n.wrapT=a===0?ei:rn,"Scaling"in t){let l=t.Scaling.value;n.repeat.x=l[0],n.repeat.y=l[1]}if("Translation"in t){let l=t.Translation.value;n.offset.x=l[0],n.offset.y=l[1]}return n}loadTexture(t,e){let n,i=this.textureLoader.path,s=Ue.get(t.id).children;s!==void 0&&s.length>0&&e[s[0].ID]!==void 0&&(n=e[s[0].ID],(n.indexOf("blob:")===0||n.indexOf("data:")===0)&&this.textureLoader.setPath(void 0));let o,a=t.FileName.slice(-3).toLowerCase();if(a==="tga"){let l=this.manager.getHandler(".tga");l===null?(console.warn("FBXLoader: TGA loader not found, creating placeholder texture for",t.RelativeFilename),o=new $e):(l.setPath(this.textureLoader.path),o=l.load(n))}else if(a==="dds"){let l=this.manager.getHandler(".dds");l===null?(console.warn("FBXLoader: DDS loader not found, creating placeholder texture for",t.RelativeFilename),o=new $e):(l.setPath(this.textureLoader.path),o=l.load(n))}else a==="psd"?(console.warn("FBXLoader: PSD textures are not supported, creating placeholder texture for",t.RelativeFilename),o=new $e):o=this.textureLoader.load(n);return this.textureLoader.setPath(i),o}parseMaterials(t){let e=new Map;if("Material"in me.Objects){let n=me.Objects.Material;for(let i in n){let s=this.parseMaterial(n[i],t);s!==null&&e.set(parseInt(i),s)}}return e}parseMaterial(t,e){let n=t.id,i=t.attrName,s=t.ShadingModel;if(typeof s=="object"&&(s=s.value),!Ue.has(n))return null;let o=this.parseParameters(t,e,n),a;switch(s.toLowerCase()){case"phong":a=new Fs;break;case"lambert":a=new Io;break;default:console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.',s),a=new Fs;break}return a.setValues(o),a.name=i,a}parseParameters(t,e,n){let i={};t.BumpFactor&&(i.bumpScale=t.BumpFactor.value),t.Diffuse?i.color=new $t().fromArray(t.Diffuse.value).convertSRGBToLinear():t.DiffuseColor&&(t.DiffuseColor.type==="Color"||t.DiffuseColor.type==="ColorRGB")&&(i.color=new $t().fromArray(t.DiffuseColor.value).convertSRGBToLinear()),t.DisplacementFactor&&(i.displacementScale=t.DisplacementFactor.value),t.Emissive?i.emissive=new $t().fromArray(t.Emissive.value).convertSRGBToLinear():t.EmissiveColor&&(t.EmissiveColor.type==="Color"||t.EmissiveColor.type==="ColorRGB")&&(i.emissive=new $t().fromArray(t.EmissiveColor.value).convertSRGBToLinear()),t.EmissiveFactor&&(i.emissiveIntensity=parseFloat(t.EmissiveFactor.value)),t.Opacity&&(i.opacity=parseFloat(t.Opacity.value)),i.opacity<1&&(i.transparent=!0),t.ReflectionFactor&&(i.reflectivity=t.ReflectionFactor.value),t.Shininess&&(i.shininess=t.Shininess.value),t.Specular?i.specular=new $t().fromArray(t.Specular.value).convertSRGBToLinear():t.SpecularColor&&t.SpecularColor.type==="Color"&&(i.specular=new $t().fromArray(t.SpecularColor.value).convertSRGBToLinear());let s=this;return Ue.get(n).children.forEach(function(o){let a=o.relationship;switch(a){case"Bump":i.bumpMap=s.getTexture(e,o.ID);break;case"Maya|TEX_ao_map":i.aoMap=s.getTexture(e,o.ID);break;case"DiffuseColor":case"Maya|TEX_color_map":i.map=s.getTexture(e,o.ID),i.map!==void 0&&(i.map.colorSpace=Ce);break;case"DisplacementColor":i.displacementMap=s.getTexture(e,o.ID);break;case"EmissiveColor":i.emissiveMap=s.getTexture(e,o.ID),i.emissiveMap!==void 0&&(i.emissiveMap.colorSpace=Ce);break;case"NormalMap":case"Maya|TEX_normal_map":i.normalMap=s.getTexture(e,o.ID);break;case"ReflectionColor":i.envMap=s.getTexture(e,o.ID),i.envMap!==void 0&&(i.envMap.mapping=nr,i.envMap.colorSpace=Ce);break;case"SpecularColor":i.specularMap=s.getTexture(e,o.ID),i.specularMap!==void 0&&(i.specularMap.colorSpace=Ce);break;case"TransparentColor":case"TransparencyFactor":i.alphaMap=s.getTexture(e,o.ID),i.transparent=!0;break;case"AmbientColor":case"ShininessExponent":case"SpecularFactor":case"VectorDisplacementColor":default:console.warn("THREE.FBXLoader: %s map is not supported in three.js, skipping texture.",a);break}}),i}getTexture(t,e){return"LayeredTexture"in me.Objects&&e in me.Objects.LayeredTexture&&(console.warn("THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer."),e=Ue.get(e).children[0].ID),t.get(e)}parseDeformers(){let t={},e={};if("Deformer"in me.Objects){let n=me.Objects.Deformer;for(let i in n){let s=n[i],o=Ue.get(parseInt(i));if(s.attrType==="Skin"){let a=this.parseSkeleton(o,n);a.ID=i,o.parents.length>1&&console.warn("THREE.FBXLoader: skeleton attached to more than one geometry is not supported."),a.geometryID=o.parents[0].ID,t[i]=a}else if(s.attrType==="BlendShape"){let a={id:i};a.rawTargets=this.parseMorphTargets(o,n),a.id=i,o.parents.length>1&&console.warn("THREE.FBXLoader: morph target attached to more than one geometry is not supported."),e[i]=a}}}return{skeletons:t,morphTargets:e}}parseSkeleton(t,e){let n=[];return t.children.forEach(function(i){let s=e[i.ID];if(s.attrType!=="Cluster")return;let o={ID:i.ID,indices:[],weights:[],transformLink:new qt().fromArray(s.TransformLink.a)};"Indexes"in s&&(o.indices=s.Indexes.a,o.weights=s.Weights.a),n.push(o)}),{rawBones:n,bones:[]}}parseMorphTargets(t,e){let n=[];for(let i=0;i<t.children.length;i++){let s=t.children[i],o=e[s.ID],a={name:o.attrName,initialWeight:o.DeformPercent,id:o.id,fullWeights:o.FullWeights.a};if(o.attrType!=="BlendShapeChannel")return;a.geoID=Ue.get(parseInt(s.ID)).children.filter(function(l){return l.relationship===void 0})[0].ID,n.push(a)}return n}parseScene(t,e,n){un=new Qn;let i=this.parseModels(t.skeletons,e,n),s=me.Objects.Model,o=this;i.forEach(function(l){let c=s[l.ID];o.setLookAtProperties(l,c),Ue.get(l.ID).parents.forEach(function(d){let u=i.get(d.ID);u!==void 0&&u.add(l)}),l.parent===null&&un.add(l)}),this.bindSkeleton(t.skeletons,e,i),this.addGlobalSceneSettings(),un.traverse(function(l){if(l.userData.transformData){l.parent&&(l.userData.transformData.parentMatrix=l.parent.matrix,l.userData.transformData.parentMatrixWorld=l.parent.matrixWorld);let c=Ad(l.userData.transformData);l.applyMatrix4(c),l.updateWorldMatrix()}});let a=new Rc().parse();un.children.length===1&&un.children[0].isGroup&&(un.children[0].animations=a,un=un.children[0]),un.animations=a}parseModels(t,e,n){let i=new Map,s=me.Objects.Model;for(let o in s){let a=parseInt(o),l=s[o],c=Ue.get(a),h=this.buildSkeleton(c,t,a,l.attrName);if(!h){switch(l.attrType){case"Camera":h=this.createCamera(c);break;case"Light":h=this.createLight(c);break;case"Mesh":h=this.createMesh(c,e,n);break;case"NurbsCurve":h=this.createCurve(c,e);break;case"LimbNode":case"Root":h=new Ls;break;case"Null":default:h=new Qn;break}h.name=l.attrName?Ae.sanitizeNodeName(l.attrName):"",h.userData.originalName=l.attrName,h.ID=a}this.getTransformData(h,l),i.set(a,h)}return i}buildSkeleton(t,e,n,i){let s=null;return t.parents.forEach(function(o){for(let a in e){let l=e[a];l.rawBones.forEach(function(c,h){if(c.ID===o.ID){let d=s;s=new Ls,s.matrixWorld.copy(c.transformLink),s.name=i?Ae.sanitizeNodeName(i):"",s.userData.originalName=i,s.ID=n,l.bones[h]=s,d!==null&&s.add(d)}})}}),s}createCamera(t){let e,n;if(t.children.forEach(function(i){let s=me.Objects.NodeAttribute[i.ID];s!==void 0&&(n=s)}),n===void 0)e=new Ne;else{let i=0;n.CameraProjectionType!==void 0&&n.CameraProjectionType.value===1&&(i=1);let s=1;n.NearPlane!==void 0&&(s=n.NearPlane.value/1e3);let o=1e3;n.FarPlane!==void 0&&(o=n.FarPlane.value/1e3);let a=window.innerWidth,l=window.innerHeight;n.AspectWidth!==void 0&&n.AspectHeight!==void 0&&(a=n.AspectWidth.value,l=n.AspectHeight.value);let c=a/l,h=45;n.FieldOfView!==void 0&&(h=n.FieldOfView.value);let d=n.FocalLength?n.FocalLength.value:null;switch(i){case 0:e=new He(h,c,s,o),d!==null&&e.setFocalLength(d);break;case 1:e=new bi(-a/2,a/2,l/2,-l/2,s,o);break;default:console.warn("THREE.FBXLoader: Unknown camera type "+i+"."),e=new Ne;break}}return e}createLight(t){let e,n;if(t.children.forEach(function(i){let s=me.Objects.NodeAttribute[i.ID];s!==void 0&&(n=s)}),n===void 0)e=new Ne;else{let i;n.LightType===void 0?i=0:i=n.LightType.value;let s=16777215;n.Color!==void 0&&(s=new $t().fromArray(n.Color.value).convertSRGBToLinear());let o=n.Intensity===void 0?1:n.Intensity.value/100;n.CastLightOnObject!==void 0&&n.CastLightOnObject.value===0&&(o=0);let a=0;n.FarAttenuationEnd!==void 0&&(n.EnableFarAttenuation!==void 0&&n.EnableFarAttenuation.value===0?a=0:a=n.FarAttenuationEnd.value);let l=1;switch(i){case 0:e=new pr(s,o,a,l);break;case 1:e=new qi(s,o);break;case 2:let c=Math.PI/3;n.InnerAngle!==void 0&&(c=De.degToRad(n.InnerAngle.value));let h=0;n.OuterAngle!==void 0&&(h=De.degToRad(n.OuterAngle.value),h=Math.max(h,1)),e=new Bo(s,o,a,c,h,l);break;default:console.warn("THREE.FBXLoader: Unknown light type "+n.LightType.value+", defaulting to a PointLight."),e=new pr(s,o);break}n.CastShadows!==void 0&&n.CastShadows.value===1&&(e.castShadow=!0)}return e}createMesh(t,e,n){let i,s=null,o=null,a=[];return t.children.forEach(function(l){e.has(l.ID)&&(s=e.get(l.ID)),n.has(l.ID)&&a.push(n.get(l.ID))}),a.length>1?o=a:a.length>0?o=a[0]:(o=new Fs({name:Dn.DEFAULT_MATERIAL_NAME,color:13421772}),a.push(o)),"color"in s.attributes&&a.forEach(function(l){l.vertexColors=!0}),s.FBX_Deformer?(i=new wo(s,o),i.normalizeSkinWeights()):i=new Fe(s,o),i}createCurve(t,e){let n=t.children.reduce(function(s,o){return e.has(o.ID)&&(s=e.get(o.ID)),s},null),i=new lr({name:Dn.DEFAULT_MATERIAL_NAME,color:3342591,linewidth:1});return new So(n,i)}getTransformData(t,e){let n={};"InheritType"in e&&(n.inheritType=parseInt(e.InheritType.value)),"RotationOrder"in e?n.eulerOrder=Td(e.RotationOrder.value):n.eulerOrder="ZYX","Lcl_Translation"in e&&(n.translation=e.Lcl_Translation.value),"PreRotation"in e&&(n.preRotation=e.PreRotation.value),"Lcl_Rotation"in e&&(n.rotation=e.Lcl_Rotation.value),"PostRotation"in e&&(n.postRotation=e.PostRotation.value),"Lcl_Scaling"in e&&(n.scale=e.Lcl_Scaling.value),"ScalingOffset"in e&&(n.scalingOffset=e.ScalingOffset.value),"ScalingPivot"in e&&(n.scalingPivot=e.ScalingPivot.value),"RotationOffset"in e&&(n.rotationOffset=e.RotationOffset.value),"RotationPivot"in e&&(n.rotationPivot=e.RotationPivot.value),t.userData.transformData=n}setLookAtProperties(t,e){"LookAtProperty"in e&&Ue.get(t.ID).children.forEach(function(i){if(i.relationship==="LookAtProperty"){let s=me.Objects.Model[i.ID];if("Lcl_Translation"in s){let o=s.Lcl_Translation.value;t.target!==void 0?(t.target.position.fromArray(o),un.add(t.target)):t.lookAt(new G().fromArray(o))}}})}bindSkeleton(t,e,n){let i=this.parsePoseNodes();for(let s in t){let o=t[s];Ue.get(parseInt(o.ID)).parents.forEach(function(l){if(e.has(l.ID)){let c=l.ID;Ue.get(c).parents.forEach(function(d){n.has(d.ID)&&n.get(d.ID).bind(new Mo(o.bones),i[d.ID])})}})}}parsePoseNodes(){let t={};if("Pose"in me.Objects){let e=me.Objects.Pose;for(let n in e)if(e[n].attrType==="BindPose"&&e[n].NbPoseNodes>0){let i=e[n].PoseNode;Array.isArray(i)?i.forEach(function(s){t[s.Node]=new qt().fromArray(s.Matrix.a)}):t[i.Node]=new qt().fromArray(i.Matrix.a)}}return t}addGlobalSceneSettings(){if("GlobalSettings"in me){if("AmbientColor"in me.GlobalSettings){let t=me.GlobalSettings.AmbientColor.value,e=t[0],n=t[1],i=t[2];if(e!==0||n!==0||i!==0){let s=new $t(e,n,i).convertSRGBToLinear();un.add(new Os(s,1))}}"UnitScaleFactor"in me.GlobalSettings&&(un.userData.unitScaleFactor=me.GlobalSettings.UnitScaleFactor.value)}}},Cc=class{constructor(){this.negativeMaterialIndices=!1}parse(t){let e=new Map;if("Geometry"in me.Objects){let n=me.Objects.Geometry;for(let i in n){let s=Ue.get(parseInt(i)),o=this.parseGeometry(s,n[i],t);e.set(parseInt(i),o)}}return this.negativeMaterialIndices===!0&&console.warn("THREE.FBXLoader: The FBX file contains invalid (negative) material indices. The asset might not render as expected."),e}parseGeometry(t,e,n){switch(e.attrType){case"Mesh":return this.parseMeshGeometry(t,e,n);case"NurbsCurve":return this.parseNurbsGeometry(e)}}parseMeshGeometry(t,e,n){let i=n.skeletons,s=[],o=t.parents.map(function(d){return me.Objects.Model[d.ID]});if(o.length===0)return;let a=t.children.reduce(function(d,u){return i[u.ID]!==void 0&&(d=i[u.ID]),d},null);t.children.forEach(function(d){n.morphTargets[d.ID]!==void 0&&s.push(n.morphTargets[d.ID])});let l=o[0],c={};"RotationOrder"in l&&(c.eulerOrder=Td(l.RotationOrder.value)),"InheritType"in l&&(c.inheritType=parseInt(l.InheritType.value)),"GeometricTranslation"in l&&(c.translation=l.GeometricTranslation.value),"GeometricRotation"in l&&(c.rotation=l.GeometricRotation.value),"GeometricScaling"in l&&(c.scale=l.GeometricScaling.value);let h=Ad(c);return this.genGeometry(e,a,s,h)}genGeometry(t,e,n,i){let s=new tn;t.attrName&&(s.name=t.attrName);let o=this.parseGeoNode(t,e),a=this.genBuffers(o),l=new Le(a.vertex,3);if(l.applyMatrix4(i),s.setAttribute("position",l),a.colors.length>0&&s.setAttribute("color",new Le(a.colors,3)),e&&(s.setAttribute("skinIndex",new Cs(a.weightsIndices,4)),s.setAttribute("skinWeight",new Le(a.vertexWeights,4)),s.FBX_Deformer=e),a.normal.length>0){let c=new de().getNormalMatrix(i),h=new Le(a.normal,3);h.applyNormalMatrix(c),s.setAttribute("normal",h)}if(a.uvs.forEach(function(c,h){let d=h===0?"uv":`uv${h}`;s.setAttribute(d,new Le(a.uvs[h],2))}),o.material&&o.material.mappingType!=="AllSame"){let c=a.materialIndex[0],h=0;if(a.materialIndex.forEach(function(d,u){d!==c&&(s.addGroup(h,u-h,c),c=d,h=u)}),s.groups.length>0){let d=s.groups[s.groups.length-1],u=d.start+d.count;u!==a.materialIndex.length&&s.addGroup(u,a.materialIndex.length-u,c)}s.groups.length===0&&s.addGroup(0,a.materialIndex.length,a.materialIndex[0])}return this.addMorphTargets(s,t,n,i),s}parseGeoNode(t,e){let n={};if(n.vertexPositions=t.Vertices!==void 0?t.Vertices.a:[],n.vertexIndices=t.PolygonVertexIndex!==void 0?t.PolygonVertexIndex.a:[],t.LayerElementColor&&(n.color=this.parseVertexColors(t.LayerElementColor[0])),t.LayerElementMaterial&&(n.material=this.parseMaterialIndices(t.LayerElementMaterial[0])),t.LayerElementNormal&&(n.normal=this.parseNormals(t.LayerElementNormal[0])),t.LayerElementUV){n.uv=[];let i=0;for(;t.LayerElementUV[i];)t.LayerElementUV[i].UV&&n.uv.push(this.parseUVs(t.LayerElementUV[i])),i++}return n.weightTable={},e!==null&&(n.skeleton=e,e.rawBones.forEach(function(i,s){i.indices.forEach(function(o,a){n.weightTable[o]===void 0&&(n.weightTable[o]=[]),n.weightTable[o].push({id:s,weight:i.weights[a]})})})),n}genBuffers(t){let e={vertex:[],normal:[],colors:[],uvs:[],materialIndex:[],vertexWeights:[],weightsIndices:[]},n=0,i=0,s=!1,o=[],a=[],l=[],c=[],h=[],d=[],u=this;return t.vertexIndices.forEach(function(f,g){let v,p=!1;f<0&&(f=f^-1,p=!0);let m=[],x=[];if(o.push(f*3,f*3+1,f*3+2),t.color){let y=fa(g,n,f,t.color);l.push(y[0],y[1],y[2])}if(t.skeleton){if(t.weightTable[f]!==void 0&&t.weightTable[f].forEach(function(y){x.push(y.weight),m.push(y.id)}),x.length>4){s||(console.warn("THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights."),s=!0);let y=[0,0,0,0],M=[0,0,0,0];x.forEach(function(I,A){let P=I,W=m[A];M.forEach(function(S,b,V){if(P>S){V[b]=P,P=S;let Y=y[b];y[b]=W,W=Y}})}),m=y,x=M}for(;x.length<4;)x.push(0),m.push(0);for(let y=0;y<4;++y)h.push(x[y]),d.push(m[y])}if(t.normal){let y=fa(g,n,f,t.normal);a.push(y[0],y[1],y[2])}t.material&&t.material.mappingType!=="AllSame"&&(v=fa(g,n,f,t.material)[0],v<0&&(u.negativeMaterialIndices=!0,v=0)),t.uv&&t.uv.forEach(function(y,M){let I=fa(g,n,f,y);c[M]===void 0&&(c[M]=[]),c[M].push(I[0]),c[M].push(I[1])}),i++,p&&(u.genFace(e,t,o,v,a,l,c,h,d,i),n++,i=0,o=[],a=[],l=[],c=[],h=[],d=[])}),e}getNormalNewell(t){let e=new G(0,0,0);for(let n=0;n<t.length;n++){let i=t[n],s=t[(n+1)%t.length];e.x+=(i.y-s.y)*(i.z+s.z),e.y+=(i.z-s.z)*(i.x+s.x),e.z+=(i.x-s.x)*(i.y+s.y)}return e.normalize(),e}getNormalTangentAndBitangent(t){let e=this.getNormalNewell(t),i=(Math.abs(e.z)>.5?new G(0,1,0):new G(0,0,1)).cross(e).normalize(),s=e.clone().cross(i).normalize();return{normal:e,tangent:i,bitangent:s}}flattenVertex(t,e,n){return new re(t.dot(e),t.dot(n))}genFace(t,e,n,i,s,o,a,l,c,h){let d;if(h>3){let u=[];for(let p=0;p<n.length;p+=3)u.push(new G(e.vertexPositions[n[p]],e.vertexPositions[n[p+1]],e.vertexPositions[n[p+2]]));let{tangent:f,bitangent:g}=this.getNormalTangentAndBitangent(u),v=[];for(let p of u)v.push(this.flattenVertex(p,f,g));d=Ao.triangulateShape(v,[])}else d=[[0,1,2]];for(let[u,f,g]of d)t.vertex.push(e.vertexPositions[n[u*3]]),t.vertex.push(e.vertexPositions[n[u*3+1]]),t.vertex.push(e.vertexPositions[n[u*3+2]]),t.vertex.push(e.vertexPositions[n[f*3]]),t.vertex.push(e.vertexPositions[n[f*3+1]]),t.vertex.push(e.vertexPositions[n[f*3+2]]),t.vertex.push(e.vertexPositions[n[g*3]]),t.vertex.push(e.vertexPositions[n[g*3+1]]),t.vertex.push(e.vertexPositions[n[g*3+2]]),e.skeleton&&(t.vertexWeights.push(l[u*4]),t.vertexWeights.push(l[u*4+1]),t.vertexWeights.push(l[u*4+2]),t.vertexWeights.push(l[u*4+3]),t.vertexWeights.push(l[f*4]),t.vertexWeights.push(l[f*4+1]),t.vertexWeights.push(l[f*4+2]),t.vertexWeights.push(l[f*4+3]),t.vertexWeights.push(l[g*4]),t.vertexWeights.push(l[g*4+1]),t.vertexWeights.push(l[g*4+2]),t.vertexWeights.push(l[g*4+3]),t.weightsIndices.push(c[u*4]),t.weightsIndices.push(c[u*4+1]),t.weightsIndices.push(c[u*4+2]),t.weightsIndices.push(c[u*4+3]),t.weightsIndices.push(c[f*4]),t.weightsIndices.push(c[f*4+1]),t.weightsIndices.push(c[f*4+2]),t.weightsIndices.push(c[f*4+3]),t.weightsIndices.push(c[g*4]),t.weightsIndices.push(c[g*4+1]),t.weightsIndices.push(c[g*4+2]),t.weightsIndices.push(c[g*4+3])),e.color&&(t.colors.push(o[u*3]),t.colors.push(o[u*3+1]),t.colors.push(o[u*3+2]),t.colors.push(o[f*3]),t.colors.push(o[f*3+1]),t.colors.push(o[f*3+2]),t.colors.push(o[g*3]),t.colors.push(o[g*3+1]),t.colors.push(o[g*3+2])),e.material&&e.material.mappingType!=="AllSame"&&(t.materialIndex.push(i),t.materialIndex.push(i),t.materialIndex.push(i)),e.normal&&(t.normal.push(s[u*3]),t.normal.push(s[u*3+1]),t.normal.push(s[u*3+2]),t.normal.push(s[f*3]),t.normal.push(s[f*3+1]),t.normal.push(s[f*3+2]),t.normal.push(s[g*3]),t.normal.push(s[g*3+1]),t.normal.push(s[g*3+2])),e.uv&&e.uv.forEach(function(v,p){t.uvs[p]===void 0&&(t.uvs[p]=[]),t.uvs[p].push(a[p][u*2]),t.uvs[p].push(a[p][u*2+1]),t.uvs[p].push(a[p][f*2]),t.uvs[p].push(a[p][f*2+1]),t.uvs[p].push(a[p][g*2]),t.uvs[p].push(a[p][g*2+1])})}addMorphTargets(t,e,n,i){if(n.length===0)return;t.morphTargetsRelative=!0,t.morphAttributes.position=[];let s=this;n.forEach(function(o){o.rawTargets.forEach(function(a){let l=me.Objects.Geometry[a.geoID];l!==void 0&&s.genMorphGeometry(t,e,l,i,a.name)})})}genMorphGeometry(t,e,n,i,s){let o=e.PolygonVertexIndex!==void 0?e.PolygonVertexIndex.a:[],a=n.Vertices!==void 0?n.Vertices.a:[],l=n.Indexes!==void 0?n.Indexes.a:[],c=t.attributes.position.count*3,h=new Float32Array(c);for(let g=0;g<l.length;g++){let v=l[g]*3;h[v]=a[g*3],h[v+1]=a[g*3+1],h[v+2]=a[g*3+2]}let d={vertexIndices:o,vertexPositions:h},u=this.genBuffers(d),f=new Le(u.vertex,3);f.name=s||n.attrName,f.applyMatrix4(i),t.morphAttributes.position.push(f)}parseNormals(t){let e=t.MappingInformationType,n=t.ReferenceInformationType,i=t.Normals.a,s=[];return n==="IndexToDirect"&&("NormalIndex"in t?s=t.NormalIndex.a:"NormalsIndex"in t&&(s=t.NormalsIndex.a)),{dataSize:3,buffer:i,indices:s,mappingType:e,referenceType:n}}parseUVs(t){let e=t.MappingInformationType,n=t.ReferenceInformationType,i=t.UV.a,s=[];return n==="IndexToDirect"&&(s=t.UVIndex.a),{dataSize:2,buffer:i,indices:s,mappingType:e,referenceType:n}}parseVertexColors(t){let e=t.MappingInformationType,n=t.ReferenceInformationType,i=t.Colors.a,s=[];n==="IndexToDirect"&&(s=t.ColorIndex.a);for(let o=0,a=new $t;o<i.length;o+=4)a.fromArray(i,o).convertSRGBToLinear().toArray(i,o);return{dataSize:4,buffer:i,indices:s,mappingType:e,referenceType:n}}parseMaterialIndices(t){let e=t.MappingInformationType,n=t.ReferenceInformationType;if(e==="NoMappingInformation")return{dataSize:1,buffer:[0],indices:[0],mappingType:"AllSame",referenceType:n};let i=t.Materials.a,s=[];for(let o=0;o<i.length;++o)s.push(o);return{dataSize:1,buffer:i,indices:s,mappingType:e,referenceType:n}}parseNurbsGeometry(t){let e=parseInt(t.Order);if(isNaN(e))return console.error("THREE.FBXLoader: Invalid Order %s given for geometry ID: %s",t.Order,t.id),new tn;let n=e-1,i=t.KnotVector.a,s=[],o=t.Points.a;for(let d=0,u=o.length;d<u;d+=4)s.push(new ve().fromArray(o,d));let a,l;if(t.Form==="Closed")s.push(s[0]);else if(t.Form==="Periodic"){a=n,l=i.length-1-a;for(let d=0;d<n;++d)s.push(s[d])}let h=new da(n,i,s,a,l).getPoints(s.length*12);return new tn().setFromPoints(h)}},Rc=class{parse(){let t=[],e=this.parseClips();if(e!==void 0)for(let n in e){let i=e[n],s=this.addClip(i);t.push(s)}return t}parseClips(){if(me.Objects.AnimationCurve===void 0)return;let t=this.parseAnimationCurveNodes();this.parseAnimationCurves(t);let e=this.parseAnimationLayers(t);return this.parseAnimStacks(e)}parseAnimationCurveNodes(){let t=me.Objects.AnimationCurveNode,e=new Map;for(let n in t){let i=t[n];if(i.attrName.match(/S|R|T|DeformPercent/)!==null){let s={id:i.id,attr:i.attrName,curves:{}};e.set(s.id,s)}}return e}parseAnimationCurves(t){let e=me.Objects.AnimationCurve;for(let n in e){let i={id:e[n].id,times:e[n].KeyTime.a.map(tw),values:e[n].KeyValueFloat.a},s=Ue.get(i.id);if(s!==void 0){let o=s.parents[0].ID,a=s.parents[0].relationship;a.match(/X/)?t.get(o).curves.x=i:a.match(/Y/)?t.get(o).curves.y=i:a.match(/Z/)?t.get(o).curves.z=i:a.match(/DeformPercent/)&&t.has(o)&&(t.get(o).curves.morph=i)}}}parseAnimationLayers(t){let e=me.Objects.AnimationLayer,n=new Map;for(let i in e){let s=[],o=Ue.get(parseInt(i));o!==void 0&&(o.children.forEach(function(l,c){if(t.has(l.ID)){let h=t.get(l.ID);if(h.curves.x!==void 0||h.curves.y!==void 0||h.curves.z!==void 0){if(s[c]===void 0){let d=Ue.get(l.ID).parents.filter(function(u){return u.relationship!==void 0})[0].ID;if(d!==void 0){let u=me.Objects.Model[d.toString()];if(u===void 0){console.warn("THREE.FBXLoader: Encountered a unused curve.",l);return}let f={modelName:u.attrName?Ae.sanitizeNodeName(u.attrName):"",ID:u.id,initialPosition:[0,0,0],initialRotation:[0,0,0],initialScale:[1,1,1]};un.traverse(function(g){g.ID===u.id&&(f.transform=g.matrix,g.userData.transformData&&(f.eulerOrder=g.userData.transformData.eulerOrder))}),f.transform||(f.transform=new qt),"PreRotation"in u&&(f.preRotation=u.PreRotation.value),"PostRotation"in u&&(f.postRotation=u.PostRotation.value),s[c]=f}}s[c]&&(s[c][h.attr]=h)}else if(h.curves.morph!==void 0){if(s[c]===void 0){let d=Ue.get(l.ID).parents.filter(function(m){return m.relationship!==void 0})[0].ID,u=Ue.get(d).parents[0].ID,f=Ue.get(u).parents[0].ID,g=Ue.get(f).parents[0].ID,v=me.Objects.Model[g],p={modelName:v.attrName?Ae.sanitizeNodeName(v.attrName):"",morphName:me.Objects.Deformer[d].attrName};s[c]=p}s[c][h.attr]=h}}}),n.set(parseInt(i),s))}return n}parseAnimStacks(t){let e=me.Objects.AnimationStack,n={};for(let i in e){let s=Ue.get(parseInt(i)).children;s.length>1&&console.warn("THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.");let o=t.get(s[0].ID);n[i]={name:e[i].attrName,layer:o}}return n}addClip(t){let e=[],n=this;return t.layer.forEach(function(i){e=e.concat(n.generateTracks(i))}),new No(t.name,-1,e)}generateTracks(t){let e=[],n=new G,i=new G;if(t.transform&&t.transform.decompose(n,new Ve,i),n=n.toArray(),i=i.toArray(),t.T!==void 0&&Object.keys(t.T.curves).length>0){let s=this.generateVectorTrack(t.modelName,t.T.curves,n,"position");s!==void 0&&e.push(s)}if(t.R!==void 0&&Object.keys(t.R.curves).length>0){let s=this.generateRotationTrack(t.modelName,t.R.curves,t.preRotation,t.postRotation,t.eulerOrder);s!==void 0&&e.push(s)}if(t.S!==void 0&&Object.keys(t.S.curves).length>0){let s=this.generateVectorTrack(t.modelName,t.S.curves,i,"scale");s!==void 0&&e.push(s)}if(t.DeformPercent!==void 0){let s=this.generateMorphTrack(t);s!==void 0&&e.push(s)}return e}generateVectorTrack(t,e,n,i){let s=this.getTimesForAllAxes(e),o=this.getKeyframeTrackValues(s,e,n);return new Ci(t+"."+i,s,o)}generateRotationTrack(t,e,n,i,s){let o,a;if(e.x!==void 0&&e.y!==void 0&&e.z!==void 0){let d=this.interpolateRotations(e.x,e.y,e.z,s);o=d[0],a=d[1]}n!==void 0&&(n=n.map(De.degToRad),n.push(s),n=new hn().fromArray(n),n=new Ve().setFromEuler(n)),i!==void 0&&(i=i.map(De.degToRad),i.push(s),i=new hn().fromArray(i),i=new Ve().setFromEuler(i).invert());let l=new Ve,c=new hn,h=[];if(!a||!o)return new zn(t+".quaternion",[],[]);for(let d=0;d<a.length;d+=3)c.set(a[d],a[d+1],a[d+2],s),l.setFromEuler(c),n!==void 0&&l.premultiply(n),i!==void 0&&l.multiply(i),d>2&&new Ve().fromArray(h,(d-3)/3*4).dot(l)<0&&l.set(-l.x,-l.y,-l.z,-l.w),l.toArray(h,d/3*4);return new zn(t+".quaternion",o,h)}generateMorphTrack(t){let e=t.DeformPercent.curves.morph,n=e.values.map(function(s){return s/100}),i=un.getObjectByName(t.modelName).morphTargetDictionary[t.morphName];return new Ai(t.modelName+".morphTargetInfluences["+i+"]",e.times,n)}getTimesForAllAxes(t){let e=[];if(t.x!==void 0&&(e=e.concat(t.x.times)),t.y!==void 0&&(e=e.concat(t.y.times)),t.z!==void 0&&(e=e.concat(t.z.times)),e=e.sort(function(n,i){return n-i}),e.length>1){let n=1,i=e[0];for(let s=1;s<e.length;s++){let o=e[s];o!==i&&(e[n]=o,i=o,n++)}e=e.slice(0,n)}return e}getKeyframeTrackValues(t,e,n){let i=n,s=[],o=-1,a=-1,l=-1;return t.forEach(function(c){if(e.x&&(o=e.x.times.indexOf(c)),e.y&&(a=e.y.times.indexOf(c)),e.z&&(l=e.z.times.indexOf(c)),o!==-1){let h=e.x.values[o];s.push(h),i[0]=h}else s.push(i[0]);if(a!==-1){let h=e.y.values[a];s.push(h),i[1]=h}else s.push(i[1]);if(l!==-1){let h=e.z.values[l];s.push(h),i[2]=h}else s.push(i[2])}),s}interpolateRotations(t,e,n,i){let s=[],o=[];s.push(t.times[0]),o.push(De.degToRad(t.values[0])),o.push(De.degToRad(e.values[0])),o.push(De.degToRad(n.values[0]));for(let a=1;a<t.values.length;a++){let l=[t.values[a-1],e.values[a-1],n.values[a-1]];if(isNaN(l[0])||isNaN(l[1])||isNaN(l[2]))continue;let c=l.map(De.degToRad),h=[t.values[a],e.values[a],n.values[a]];if(isNaN(h[0])||isNaN(h[1])||isNaN(h[2]))continue;let d=h.map(De.degToRad),u=[h[0]-l[0],h[1]-l[1],h[2]-l[2]],f=[Math.abs(u[0]),Math.abs(u[1]),Math.abs(u[2])];if(f[0]>=180||f[1]>=180||f[2]>=180){let v=Math.max(...f)/180,p=new hn(...c,i),m=new hn(...d,i),x=new Ve().setFromEuler(p),y=new Ve().setFromEuler(m);x.dot(y)&&y.set(-y.x,-y.y,-y.z,-y.w);let M=t.times[a-1],I=t.times[a]-M,A=new Ve,P=new hn;for(let W=0;W<1;W+=1/v)A.copy(x.clone().slerp(y.clone(),W)),s.push(M+W*I),P.setFromQuaternion(A,i),o.push(P.x),o.push(P.y),o.push(P.z)}else s.push(t.times[a]),o.push(De.degToRad(t.values[a])),o.push(De.degToRad(e.values[a])),o.push(De.degToRad(n.values[a]))}return[s,o]}},Pc=class{getPrevNode(){return this.nodeStack[this.currentIndent-2]}getCurrentNode(){return this.nodeStack[this.currentIndent-1]}getCurrentProp(){return this.currentProp}pushStack(t){this.nodeStack.push(t),this.currentIndent+=1}popStack(){this.nodeStack.pop(),this.currentIndent-=1}setCurrentProp(t,e){this.currentProp=t,this.currentPropName=e}parse(t){this.currentIndent=0,this.allNodes=new ga,this.nodeStack=[],this.currentProp=[],this.currentPropName="";let e=this,n=t.split(/[\r\n]+/);return n.forEach(function(i,s){let o=i.match(/^[\s\t]*;/),a=i.match(/^[\s\t]*$/);if(o||a)return;let l=i.match("^\\t{"+e.currentIndent+"}(\\w+):(.*){",""),c=i.match("^\\t{"+e.currentIndent+"}(\\w+):[\\s\\t\\r\\n](.*)"),h=i.match("^\\t{"+(e.currentIndent-1)+"}}");l?e.parseNodeBegin(i,l):c?e.parseNodeProperty(i,c,n[++s]):h?e.popStack():i.match(/^[^\s\t}]/)&&e.parseNodePropertyContinued(i)}),this.allNodes}parseNodeBegin(t,e){let n=e[1].trim().replace(/^"/,"").replace(/"$/,""),i=e[2].split(",").map(function(l){return l.trim().replace(/^"/,"").replace(/"$/,"")}),s={name:n},o=this.parseNodeAttr(i),a=this.getCurrentNode();this.currentIndent===0?this.allNodes.add(n,s):n in a?(n==="PoseNode"?a.PoseNode.push(s):a[n].id!==void 0&&(a[n]={},a[n][a[n].id]=a[n]),o.id!==""&&(a[n][o.id]=s)):typeof o.id=="number"?(a[n]={},a[n][o.id]=s):n!=="Properties70"&&(n==="PoseNode"?a[n]=[s]:a[n]=s),typeof o.id=="number"&&(s.id=o.id),o.name!==""&&(s.attrName=o.name),o.type!==""&&(s.attrType=o.type),this.pushStack(s)}parseNodeAttr(t){let e=t[0];t[0]!==""&&(e=parseInt(t[0]),isNaN(e)&&(e=t[0]));let n="",i="";return t.length>1&&(n=t[1].replace(/^(\w+)::/,""),i=t[2]),{id:e,name:n,type:i}}parseNodeProperty(t,e,n){let i=e[1].replace(/^"/,"").replace(/"$/,"").trim(),s=e[2].replace(/^"/,"").replace(/"$/,"").trim();i==="Content"&&s===","&&(s=n.replace(/"/g,"").replace(/,$/,"").trim());let o=this.getCurrentNode();if(o.name==="Properties70"){this.parseNodeSpecialProperty(t,i,s);return}if(i==="C"){let l=s.split(",").slice(1),c=parseInt(l[0]),h=parseInt(l[1]),d=s.split(",").slice(3);d=d.map(function(u){return u.trim().replace(/^"/,"")}),i="connections",s=[c,h],nw(s,d),o[i]===void 0&&(o[i]=[])}i==="Node"&&(o.id=s),i in o&&Array.isArray(o[i])?o[i].push(s):i!=="a"?o[i]=s:o.a=s,this.setCurrentProp(o,i),i==="a"&&s.slice(-1)!==","&&(o.a=Ac(s))}parseNodePropertyContinued(t){let e=this.getCurrentNode();e.a+=t,t.slice(-1)!==","&&(e.a=Ac(e.a))}parseNodeSpecialProperty(t,e,n){let i=n.split('",').map(function(h){return h.trim().replace(/^\"/,"").replace(/\s/,"_")}),s=i[0],o=i[1],a=i[2],l=i[3],c=i[4];switch(o){case"int":case"enum":case"bool":case"ULongLong":case"double":case"Number":case"FieldOfView":c=parseFloat(c);break;case"Color":case"ColorRGB":case"Vector3D":case"Lcl_Translation":case"Lcl_Rotation":case"Lcl_Scaling":c=Ac(c);break}this.getPrevNode()[s]={type:o,type2:a,flag:l,value:c},this.setCurrentProp(this.getPrevNode(),s)}},Ic=class{parse(t){let e=new ma(t);e.skip(23);let n=e.getUint32();if(n<6400)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+n);let i=new ga;for(;!this.endOfContent(e);){let s=this.parseNode(e,n);s!==null&&i.add(s.name,s)}return i}endOfContent(t){return t.size()%16===0?(t.getOffset()+160+16&-16)>=t.size():t.getOffset()+160+16>=t.size()}parseNode(t,e){let n={},i=e>=7500?t.getUint64():t.getUint32(),s=e>=7500?t.getUint64():t.getUint32();e>=7500?t.getUint64():t.getUint32();let o=t.getUint8(),a=t.getString(o);if(i===0)return null;let l=[];for(let u=0;u<s;u++)l.push(this.parseProperty(t));let c=l.length>0?l[0]:"",h=l.length>1?l[1]:"",d=l.length>2?l[2]:"";for(n.singleProperty=s===1&&t.getOffset()===i;i>t.getOffset();){let u=this.parseNode(t,e);u!==null&&this.parseSubNode(a,n,u)}return n.propertyList=l,typeof c=="number"&&(n.id=c),h!==""&&(n.attrName=h),d!==""&&(n.attrType=d),a!==""&&(n.name=a),n}parseSubNode(t,e,n){if(n.singleProperty===!0){let i=n.propertyList[0];Array.isArray(i)?(e[n.name]=n,n.a=i):e[n.name]=i}else if(t==="Connections"&&n.name==="C"){let i=[];n.propertyList.forEach(function(s,o){o!==0&&i.push(s)}),e.connections===void 0&&(e.connections=[]),e.connections.push(i)}else if(n.name==="Properties70")Object.keys(n).forEach(function(s){e[s]=n[s]});else if(t==="Properties70"&&n.name==="P"){let i=n.propertyList[0],s=n.propertyList[1],o=n.propertyList[2],a=n.propertyList[3],l;i.indexOf("Lcl ")===0&&(i=i.replace("Lcl ","Lcl_")),s.indexOf("Lcl ")===0&&(s=s.replace("Lcl ","Lcl_")),s==="Color"||s==="ColorRGB"||s==="Vector"||s==="Vector3D"||s.indexOf("Lcl_")===0?l=[n.propertyList[4],n.propertyList[5],n.propertyList[6]]:l=n.propertyList[4],e[i]={type:s,type2:o,flag:a,value:l}}else e[n.name]===void 0?typeof n.id=="number"?(e[n.name]={},e[n.name][n.id]=n):e[n.name]=n:n.name==="PoseNode"?(Array.isArray(e[n.name])||(e[n.name]=[e[n.name]]),e[n.name].push(n)):e[n.name][n.id]===void 0&&(e[n.name][n.id]=n)}parseProperty(t){let e=t.getString(1),n;switch(e){case"C":return t.getBoolean();case"D":return t.getFloat64();case"F":return t.getFloat32();case"I":return t.getInt32();case"L":return t.getInt64();case"R":return n=t.getUint32(),t.getArrayBuffer(n);case"S":return n=t.getUint32(),t.getString(n);case"Y":return t.getInt16();case"b":case"c":case"d":case"f":case"i":case"l":let i=t.getUint32(),s=t.getUint32(),o=t.getUint32();if(s===0)switch(e){case"b":case"c":return t.getBooleanArray(i);case"d":return t.getFloat64Array(i);case"f":return t.getFloat32Array(i);case"i":return t.getInt32Array(i);case"l":return t.getInt64Array(i)}let a=Ki(new Uint8Array(t.getArrayBuffer(o))),l=new ma(a.buffer);switch(e){case"b":case"c":return l.getBooleanArray(i);case"d":return l.getFloat64Array(i);case"f":return l.getFloat32Array(i);case"i":return l.getInt32Array(i);case"l":return l.getInt64Array(i)}break;default:throw new Error("THREE.FBXLoader: Unknown property type "+e)}}},ma=class{constructor(t,e){this.dv=new DataView(t),this.offset=0,this.littleEndian=e!==void 0?e:!0,this._textDecoder=new TextDecoder}getOffset(){return this.offset}size(){return this.dv.buffer.byteLength}skip(t){this.offset+=t}getBoolean(){return(this.getUint8()&1)===1}getBooleanArray(t){let e=[];for(let n=0;n<t;n++)e.push(this.getBoolean());return e}getUint8(){let t=this.dv.getUint8(this.offset);return this.offset+=1,t}getInt16(){let t=this.dv.getInt16(this.offset,this.littleEndian);return this.offset+=2,t}getInt32(){let t=this.dv.getInt32(this.offset,this.littleEndian);return this.offset+=4,t}getInt32Array(t){let e=[];for(let n=0;n<t;n++)e.push(this.getInt32());return e}getUint32(){let t=this.dv.getUint32(this.offset,this.littleEndian);return this.offset+=4,t}getInt64(){let t,e;return this.littleEndian?(t=this.getUint32(),e=this.getUint32()):(e=this.getUint32(),t=this.getUint32()),e&2147483648?(e=~e&4294967295,t=~t&4294967295,t===4294967295&&(e=e+1&4294967295),t=t+1&4294967295,-(e*4294967296+t)):e*4294967296+t}getInt64Array(t){let e=[];for(let n=0;n<t;n++)e.push(this.getInt64());return e}getUint64(){let t,e;return this.littleEndian?(t=this.getUint32(),e=this.getUint32()):(e=this.getUint32(),t=this.getUint32()),e*4294967296+t}getFloat32(){let t=this.dv.getFloat32(this.offset,this.littleEndian);return this.offset+=4,t}getFloat32Array(t){let e=[];for(let n=0;n<t;n++)e.push(this.getFloat32());return e}getFloat64(){let t=this.dv.getFloat64(this.offset,this.littleEndian);return this.offset+=8,t}getFloat64Array(t){let e=[];for(let n=0;n<t;n++)e.push(this.getFloat64());return e}getArrayBuffer(t){let e=this.dv.buffer.slice(this.offset,this.offset+t);return this.offset+=t,e}getString(t){let e=this.offset,n=new Uint8Array(this.dv.buffer,e,t);this.skip(t);let i=n.indexOf(0);return i>=0&&(n=new Uint8Array(this.dv.buffer,e,i)),this._textDecoder.decode(n)}},ga=class{add(t,e){this[t]=e}};function J_(r){let t="Kaydara FBX Binary  \0";return r.byteLength>=t.length&&t===Cd(r,0,t.length)}function Q_(r){let t=["K","a","y","d","a","r","a","\\","F","B","X","\\","B","i","n","a","r","y","\\","\\"],e=0;function n(i){let s=r[i-1];return r=r.slice(e+i),e++,s}for(let i=0;i<t.length;++i)if(n(1)===t[i])return!1;return!0}function Ed(r){let t=/FBXVersion: (\d+)/,e=r.match(t);if(e)return parseInt(e[1]);throw new Error("THREE.FBXLoader: Cannot find the version number for the file given.")}function tw(r){return r/46186158e3}var ew=[];function fa(r,t,e,n){let i;switch(n.mappingType){case"ByPolygonVertex":i=r;break;case"ByPolygon":i=t;break;case"ByVertice":i=e;break;case"AllSame":i=n.indices[0];break;default:console.warn("THREE.FBXLoader: unknown attribute mapping type "+n.mappingType)}n.referenceType==="IndexToDirect"&&(i=n.indices[i]);let s=i*n.dataSize,o=s+n.dataSize;return iw(ew,n.buffer,s,o)}var Ec=new hn,Xs=new G;function Ad(r){let t=new qt,e=new qt,n=new qt,i=new qt,s=new qt,o=new qt,a=new qt,l=new qt,c=new qt,h=new qt,d=new qt,u=new qt,f=r.inheritType?r.inheritType:0;if(r.translation&&t.setPosition(Xs.fromArray(r.translation)),r.preRotation){let b=r.preRotation.map(De.degToRad);b.push(r.eulerOrder||hn.DEFAULT_ORDER),e.makeRotationFromEuler(Ec.fromArray(b))}if(r.rotation){let b=r.rotation.map(De.degToRad);b.push(r.eulerOrder||hn.DEFAULT_ORDER),n.makeRotationFromEuler(Ec.fromArray(b))}if(r.postRotation){let b=r.postRotation.map(De.degToRad);b.push(r.eulerOrder||hn.DEFAULT_ORDER),i.makeRotationFromEuler(Ec.fromArray(b)),i.invert()}r.scale&&s.scale(Xs.fromArray(r.scale)),r.scalingOffset&&a.setPosition(Xs.fromArray(r.scalingOffset)),r.scalingPivot&&o.setPosition(Xs.fromArray(r.scalingPivot)),r.rotationOffset&&l.setPosition(Xs.fromArray(r.rotationOffset)),r.rotationPivot&&c.setPosition(Xs.fromArray(r.rotationPivot)),r.parentMatrixWorld&&(d.copy(r.parentMatrix),h.copy(r.parentMatrixWorld));let g=e.clone().multiply(n).multiply(i),v=new qt;v.extractRotation(h);let p=new qt;p.copyPosition(h);let m=p.clone().invert().multiply(h),x=v.clone().invert().multiply(m),y=s,M=new qt;if(f===0)M.copy(v).multiply(g).multiply(x).multiply(y);else if(f===1)M.copy(v).multiply(x).multiply(g).multiply(y);else{let V=new qt().scale(new G().setFromMatrixScale(d)).clone().invert(),Y=x.clone().multiply(V);M.copy(v).multiply(g).multiply(Y).multiply(y)}let I=c.clone().invert(),A=o.clone().invert(),P=t.clone().multiply(l).multiply(c).multiply(e).multiply(n).multiply(i).multiply(I).multiply(a).multiply(o).multiply(s).multiply(A),W=new qt().copyPosition(P),S=h.clone().multiply(W);return u.copyPosition(S),P=u.clone().multiply(M),P.premultiply(h.invert()),P}function Td(r){r=r||0;let t=["ZYX","YZX","XZY","ZXY","YXZ","XYZ"];return r===6?(console.warn("THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect."),t[0]):t[r]}function Ac(r){return r.split(",").map(function(e){return parseFloat(e)})}function Cd(r,t,e){return t===void 0&&(t=0),e===void 0&&(e=r.byteLength),new TextDecoder().decode(new Uint8Array(r,t,e))}function nw(r,t){for(let e=0,n=r.length,i=t.length;e<i;e++,n++)r[n]=t[e]}function iw(r,t,e,n){for(let i=e,s=0;i<n;i++,s++)r[s]=t[i];return r}var va=class extends Fo{constructor(t){super(t),this.type=cn}parse(t){let S=Math.pow(2.7182818,2.2);function b(w,R){let z=0;for(let D=0;D<65536;++D)(D==0||w[D>>3]&1<<(D&7))&&(R[z++]=D);let _=z-1;for(;z<65536;)R[z++]=0;return _}function V(w){for(let R=0;R<16384;R++)w[R]={},w[R].len=0,w[R].lit=0,w[R].p=null}let Y={l:0,c:0,lc:0};function X(w,R,z,_,D){for(;z<w;)R=R<<8|Dt(_,D),z+=8;z-=w,Y.l=R>>z&(1<<w)-1,Y.c=R,Y.lc=z}let L=new Array(59);function U(w){for(let z=0;z<=58;++z)L[z]=0;for(let z=0;z<65537;++z)L[w[z]]+=1;let R=0;for(let z=58;z>0;--z){let _=R+L[z]>>1;L[z]=R,R=_}for(let z=0;z<65537;++z){let _=w[z];_>0&&(w[z]=_|L[_]++<<6)}}function O(w,R,z,_,D,F){let B=R,k=0,et=0;for(;_<=D;_++){if(B.value-R.value>z)return!1;X(6,k,et,w,B);let J=Y.l;if(k=Y.c,et=Y.lc,F[_]=J,J==63){if(B.value-R.value>z)throw new Error("Something wrong with hufUnpackEncTable");X(8,k,et,w,B);let ot=Y.l+6;if(k=Y.c,et=Y.lc,_+ot>D+1)throw new Error("Something wrong with hufUnpackEncTable");for(;ot--;)F[_++]=0;_--}else if(J>=59){let ot=J-59+2;if(_+ot>D+1)throw new Error("Something wrong with hufUnpackEncTable");for(;ot--;)F[_++]=0;_--}}U(F)}function it(w){return w&63}function $(w){return w>>6}function Z(w,R,z,_){for(;R<=z;R++){let D=$(w[R]),F=it(w[R]);if(D>>F)throw new Error("Invalid table entry");if(F>14){let B=_[D>>F-14];if(B.len)throw new Error("Invalid table entry");if(B.lit++,B.p){let k=B.p;B.p=new Array(B.lit);for(let et=0;et<B.lit-1;++et)B.p[et]=k[et]}else B.p=new Array(1);B.p[B.lit-1]=R}else if(F){let B=0;for(let k=1<<14-F;k>0;k--){let et=_[(D<<14-F)+B];if(et.len||et.p)throw new Error("Invalid table entry");et.len=F,et.lit=R,B++}}}return!0}let rt={c:0,lc:0};function lt(w,R,z,_){w=w<<8|Dt(z,_),R+=8,rt.c=w,rt.lc=R}let st={c:0,lc:0};function tt(w,R,z,_,D,F,B,k,et){if(w==R){_<8&&(lt(z,_,D,F),z=rt.c,_=rt.lc),_-=8;let J=z>>_;if(J=new Uint8Array([J])[0],k.value+J>et)return!1;let ot=B[k.value-1];for(;J-- >0;)B[k.value++]=ot}else if(k.value<et)B[k.value++]=w;else return!1;st.c=z,st.lc=_}function ct(w){return w&65535}function _t(w){let R=ct(w);return R>32767?R-65536:R}let yt={a:0,b:0};function wt(w,R){let z=_t(w),D=_t(R),F=z+(D&1)+(D>>1),B=F,k=F-D;yt.a=B,yt.b=k}function Tt(w,R){let z=ct(w),_=ct(R),D=z-(_>>1)&65535,F=_+D-32768&65535;yt.a=F,yt.b=D}function at(w,R,z,_,D,F,B){let k=B<16384,et=z>D?D:z,J=1,ot,dt;for(;J<=et;)J<<=1;for(J>>=1,ot=J,J>>=1;J>=1;){dt=0;let pt=dt+F*(D-ot),xt=F*J,bt=F*ot,Et=_*J,Ft=_*ot,Xt,ge,se,jt;for(;dt<=pt;dt+=bt){let we=dt,Wt=dt+_*(z-ot);for(;we<=Wt;we+=Ft){let Me=we+Et,C=we+xt,j=C+Et;k?(wt(w[we+R],w[C+R]),Xt=yt.a,se=yt.b,wt(w[Me+R],w[j+R]),ge=yt.a,jt=yt.b,wt(Xt,ge),w[we+R]=yt.a,w[Me+R]=yt.b,wt(se,jt),w[C+R]=yt.a,w[j+R]=yt.b):(Tt(w[we+R],w[C+R]),Xt=yt.a,se=yt.b,Tt(w[Me+R],w[j+R]),ge=yt.a,jt=yt.b,Tt(Xt,ge),w[we+R]=yt.a,w[Me+R]=yt.b,Tt(se,jt),w[C+R]=yt.a,w[j+R]=yt.b)}if(z&J){let Me=we+xt;k?wt(w[we+R],w[Me+R]):Tt(w[we+R],w[Me+R]),Xt=yt.a,w[Me+R]=yt.b,w[we+R]=Xt}}if(D&J){let we=dt,Wt=dt+_*(z-ot);for(;we<=Wt;we+=Ft){let Me=we+Et;k?wt(w[we+R],w[Me+R]):Tt(w[we+R],w[Me+R]),Xt=yt.a,w[Me+R]=yt.b,w[we+R]=Xt}}ot=J,J>>=1}return dt}function ft(w,R,z,_,D,F,B,k,et){let J=0,ot=0,dt=B,pt=Math.trunc(_.value+(D+7)/8);for(;_.value<pt;)for(lt(J,ot,z,_),J=rt.c,ot=rt.lc;ot>=14;){let bt=J>>ot-14&16383,Et=R[bt];if(Et.len)ot-=Et.len,tt(Et.lit,F,J,ot,z,_,k,et,dt),J=st.c,ot=st.lc;else{if(!Et.p)throw new Error("hufDecode issues");let Ft;for(Ft=0;Ft<Et.lit;Ft++){let Xt=it(w[Et.p[Ft]]);for(;ot<Xt&&_.value<pt;)lt(J,ot,z,_),J=rt.c,ot=rt.lc;if(ot>=Xt&&$(w[Et.p[Ft]])==(J>>ot-Xt&(1<<Xt)-1)){ot-=Xt,tt(Et.p[Ft],F,J,ot,z,_,k,et,dt),J=st.c,ot=st.lc;break}}if(Ft==Et.lit)throw new Error("hufDecode issues")}}let xt=8-D&7;for(J>>=xt,ot-=xt;ot>0;){let bt=R[J<<14-ot&16383];if(bt.len)ot-=bt.len,tt(bt.lit,F,J,ot,z,_,k,et,dt),J=st.c,ot=st.lc;else throw new Error("hufDecode issues")}return!0}function At(w,R,z,_,D,F){let B={value:0},k=z.value,et=Ut(R,z),J=Ut(R,z);z.value+=4;let ot=Ut(R,z);if(z.value+=4,et<0||et>=65537||J<0||J>=65537)throw new Error("Something wrong with HUF_ENCSIZE");let dt=new Array(65537),pt=new Array(16384);V(pt);let xt=_-(z.value-k);if(O(w,z,xt,et,J,dt),ot>8*(_-(z.value-k)))throw new Error("Something wrong with hufUncompress");Z(dt,et,J,pt),ft(dt,pt,w,z,ot,J,F,D,B)}function q(w,R,z){for(let _=0;_<z;++_)R[_]=w[R[_]]}function Ht(w){for(let R=1;R<w.length;R++){let z=w[R-1]+w[R]-128;w[R]=z}}function Ct(w,R){let z=0,_=Math.floor((w.length+1)/2),D=0,F=w.length-1;for(;!(D>F||(R[D++]=w[z++],D>F));)R[D++]=w[_++]}function kt(w){let R=w.byteLength,z=new Array,_=0,D=new DataView(w);for(;R>0;){let F=D.getInt8(_++);if(F<0){let B=-F;R-=B+1;for(let k=0;k<B;k++)z.push(D.getUint8(_++))}else{let B=F;R-=2;let k=D.getUint8(_++);for(let et=0;et<B+1;et++)z.push(k)}}return z}function Mt(w,R,z,_,D,F){let B=new DataView(F.buffer),k=z[w.idx[0]].width,et=z[w.idx[0]].height,J=3,ot=Math.floor(k/8),dt=Math.ceil(k/8),pt=Math.ceil(et/8),xt=k-(dt-1)*8,bt=et-(pt-1)*8,Et={value:0},Ft=new Array(J),Xt=new Array(J),ge=new Array(J),se=new Array(J),jt=new Array(J);for(let Wt=0;Wt<J;++Wt)jt[Wt]=R[w.idx[Wt]],Ft[Wt]=Wt<1?0:Ft[Wt-1]+dt*pt,Xt[Wt]=new Float32Array(64),ge[Wt]=new Uint16Array(64),se[Wt]=new Uint16Array(dt*64);for(let Wt=0;Wt<pt;++Wt){let Me=8;Wt==pt-1&&(Me=bt);let C=8;for(let nt=0;nt<dt;++nt){nt==dt-1&&(C=xt);for(let ht=0;ht<J;++ht)ge[ht].fill(0),ge[ht][0]=D[Ft[ht]++],ce(Et,_,ge[ht]),Zt(ge[ht],Xt[ht]),N(Xt[ht]);J==3&&T(Xt);for(let ht=0;ht<J;++ht)Q(Xt[ht],se[ht],nt*64)}let j=0;for(let nt=0;nt<J;++nt){let ht=z[w.idx[nt]].type;for(let Bt=8*Wt;Bt<8*Wt+Me;++Bt){j=jt[nt][Bt];for(let pe=0;pe<ot;++pe){let Yt=pe*64+(Bt&7)*8;B.setUint16(j+0*ht,se[nt][Yt+0],!0),B.setUint16(j+2*ht,se[nt][Yt+1],!0),B.setUint16(j+4*ht,se[nt][Yt+2],!0),B.setUint16(j+6*ht,se[nt][Yt+3],!0),B.setUint16(j+8*ht,se[nt][Yt+4],!0),B.setUint16(j+10*ht,se[nt][Yt+5],!0),B.setUint16(j+12*ht,se[nt][Yt+6],!0),B.setUint16(j+14*ht,se[nt][Yt+7],!0),j+=16*ht}}if(ot!=dt)for(let Bt=8*Wt;Bt<8*Wt+Me;++Bt){let pe=jt[nt][Bt]+8*ot*2*ht,Yt=ot*64+(Bt&7)*8;for(let oe=0;oe<C;++oe)B.setUint16(pe+oe*2*ht,se[nt][Yt+oe],!0)}}}let we=new Uint16Array(k);B=new DataView(F.buffer);for(let Wt=0;Wt<J;++Wt){z[w.idx[Wt]].decoded=!0;let Me=z[w.idx[Wt]].type;if(z[Wt].type==2)for(let C=0;C<et;++C){let j=jt[Wt][C];for(let nt=0;nt<k;++nt)we[nt]=B.getUint16(j+nt*2*Me,!0);for(let nt=0;nt<k;++nt)B.setFloat32(j+nt*2*Me,K(we[nt]),!0)}}}function ce(w,R,z){let _,D=1;for(;D<64;)_=R[w.value],_==65280?D=64:_>>8==255?D+=_&255:(z[D]=_,D++),w.value++}function Zt(w,R){R[0]=K(w[0]),R[1]=K(w[1]),R[2]=K(w[5]),R[3]=K(w[6]),R[4]=K(w[14]),R[5]=K(w[15]),R[6]=K(w[27]),R[7]=K(w[28]),R[8]=K(w[2]),R[9]=K(w[4]),R[10]=K(w[7]),R[11]=K(w[13]),R[12]=K(w[16]),R[13]=K(w[26]),R[14]=K(w[29]),R[15]=K(w[42]),R[16]=K(w[3]),R[17]=K(w[8]),R[18]=K(w[12]),R[19]=K(w[17]),R[20]=K(w[25]),R[21]=K(w[30]),R[22]=K(w[41]),R[23]=K(w[43]),R[24]=K(w[9]),R[25]=K(w[11]),R[26]=K(w[18]),R[27]=K(w[24]),R[28]=K(w[31]),R[29]=K(w[40]),R[30]=K(w[44]),R[31]=K(w[53]),R[32]=K(w[10]),R[33]=K(w[19]),R[34]=K(w[23]),R[35]=K(w[32]),R[36]=K(w[39]),R[37]=K(w[45]),R[38]=K(w[52]),R[39]=K(w[54]),R[40]=K(w[20]),R[41]=K(w[22]),R[42]=K(w[33]),R[43]=K(w[38]),R[44]=K(w[46]),R[45]=K(w[51]),R[46]=K(w[55]),R[47]=K(w[60]),R[48]=K(w[21]),R[49]=K(w[34]),R[50]=K(w[37]),R[51]=K(w[47]),R[52]=K(w[50]),R[53]=K(w[56]),R[54]=K(w[59]),R[55]=K(w[61]),R[56]=K(w[35]),R[57]=K(w[36]),R[58]=K(w[48]),R[59]=K(w[49]),R[60]=K(w[57]),R[61]=K(w[58]),R[62]=K(w[62]),R[63]=K(w[63])}function N(w){let R=.5*Math.cos(.7853975),z=.5*Math.cos(3.14159/16),_=.5*Math.cos(3.14159/8),D=.5*Math.cos(3*3.14159/16),F=.5*Math.cos(5*3.14159/16),B=.5*Math.cos(3*3.14159/8),k=.5*Math.cos(7*3.14159/16),et=new Array(4),J=new Array(4),ot=new Array(4),dt=new Array(4);for(let pt=0;pt<8;++pt){let xt=pt*8;et[0]=_*w[xt+2],et[1]=B*w[xt+2],et[2]=_*w[xt+6],et[3]=B*w[xt+6],J[0]=z*w[xt+1]+D*w[xt+3]+F*w[xt+5]+k*w[xt+7],J[1]=D*w[xt+1]-k*w[xt+3]-z*w[xt+5]-F*w[xt+7],J[2]=F*w[xt+1]-z*w[xt+3]+k*w[xt+5]+D*w[xt+7],J[3]=k*w[xt+1]-F*w[xt+3]+D*w[xt+5]-z*w[xt+7],ot[0]=R*(w[xt+0]+w[xt+4]),ot[3]=R*(w[xt+0]-w[xt+4]),ot[1]=et[0]+et[3],ot[2]=et[1]-et[2],dt[0]=ot[0]+ot[1],dt[1]=ot[3]+ot[2],dt[2]=ot[3]-ot[2],dt[3]=ot[0]-ot[1],w[xt+0]=dt[0]+J[0],w[xt+1]=dt[1]+J[1],w[xt+2]=dt[2]+J[2],w[xt+3]=dt[3]+J[3],w[xt+4]=dt[3]-J[3],w[xt+5]=dt[2]-J[2],w[xt+6]=dt[1]-J[1],w[xt+7]=dt[0]-J[0]}for(let pt=0;pt<8;++pt)et[0]=_*w[16+pt],et[1]=B*w[16+pt],et[2]=_*w[48+pt],et[3]=B*w[48+pt],J[0]=z*w[8+pt]+D*w[24+pt]+F*w[40+pt]+k*w[56+pt],J[1]=D*w[8+pt]-k*w[24+pt]-z*w[40+pt]-F*w[56+pt],J[2]=F*w[8+pt]-z*w[24+pt]+k*w[40+pt]+D*w[56+pt],J[3]=k*w[8+pt]-F*w[24+pt]+D*w[40+pt]-z*w[56+pt],ot[0]=R*(w[pt]+w[32+pt]),ot[3]=R*(w[pt]-w[32+pt]),ot[1]=et[0]+et[3],ot[2]=et[1]-et[2],dt[0]=ot[0]+ot[1],dt[1]=ot[3]+ot[2],dt[2]=ot[3]-ot[2],dt[3]=ot[0]-ot[1],w[0+pt]=dt[0]+J[0],w[8+pt]=dt[1]+J[1],w[16+pt]=dt[2]+J[2],w[24+pt]=dt[3]+J[3],w[32+pt]=dt[3]-J[3],w[40+pt]=dt[2]-J[2],w[48+pt]=dt[1]-J[1],w[56+pt]=dt[0]-J[0]}function T(w){for(let R=0;R<64;++R){let z=w[0][R],_=w[1][R],D=w[2][R];w[0][R]=z+1.5747*D,w[1][R]=z-.1873*_-.4682*D,w[2][R]=z+1.8556*_}}function Q(w,R,z){for(let _=0;_<64;++_)R[z+_]=Zl.toHalfFloat(gt(w[_]))}function gt(w){return w<=1?Math.sign(w)*Math.pow(Math.abs(w),2.2):Math.sign(w)*Math.pow(S,Math.abs(w)-1)}function ut(w){return new DataView(w.array.buffer,w.offset.value,w.size)}function mt(w){let R=w.viewer.buffer.slice(w.offset.value,w.offset.value+w.size),z=new Uint8Array(kt(R)),_=new Uint8Array(z.length);return Ht(z),Ct(z,_),new DataView(_.buffer)}function It(w){let R=w.array.slice(w.offset.value,w.offset.value+w.size),z=Ki(R),_=new Uint8Array(z.length);return Ht(z),Ct(z,_),new DataView(_.buffer)}function St(w){let R=w.viewer,z={value:w.offset.value},_=new Uint16Array(w.width*w.scanlineBlockSize*(w.channels*w.type)),D=new Uint8Array(8192),F=0,B=new Array(w.channels);for(let bt=0;bt<w.channels;bt++)B[bt]={},B[bt].start=F,B[bt].end=B[bt].start,B[bt].nx=w.width,B[bt].ny=w.lines,B[bt].size=w.type,F+=B[bt].nx*B[bt].ny*B[bt].size;let k=H(R,z),et=H(R,z);if(et>=8192)throw new Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(k<=et)for(let bt=0;bt<et-k+1;bt++)D[bt+k]=Vt(R,z);let J=new Uint16Array(65536),ot=b(D,J),dt=Ut(R,z);At(w.array,R,z,dt,_,F);for(let bt=0;bt<w.channels;++bt){let Et=B[bt];for(let Ft=0;Ft<B[bt].size;++Ft)at(_,Et.start+Ft,Et.nx,Et.size,Et.ny,Et.nx*Et.size,ot)}q(J,_,F);let pt=0,xt=new Uint8Array(_.buffer.byteLength);for(let bt=0;bt<w.lines;bt++)for(let Et=0;Et<w.channels;Et++){let Ft=B[Et],Xt=Ft.nx*Ft.size,ge=new Uint8Array(_.buffer,Ft.end*2,Xt*2);xt.set(ge,pt),pt+=Xt*2,Ft.end+=Xt}return new DataView(xt.buffer)}function Pt(w){let R=w.array.slice(w.offset.value,w.offset.value+w.size),z=Ki(R),_=w.lines*w.channels*w.width,D=w.type==1?new Uint16Array(_):new Uint32Array(_),F=0,B=0,k=new Array(4);for(let et=0;et<w.lines;et++)for(let J=0;J<w.channels;J++){let ot=0;switch(w.type){case 1:k[0]=F,k[1]=k[0]+w.width,F=k[1]+w.width;for(let dt=0;dt<w.width;++dt){let pt=z[k[0]++]<<8|z[k[1]++];ot+=pt,D[B]=ot,B++}break;case 2:k[0]=F,k[1]=k[0]+w.width,k[2]=k[1]+w.width,F=k[2]+w.width;for(let dt=0;dt<w.width;++dt){let pt=z[k[0]++]<<24|z[k[1]++]<<16|z[k[2]++]<<8;ot+=pt,D[B]=ot,B++}break}}return new DataView(D.buffer)}function Ot(w){let R=w.viewer,z={value:w.offset.value},_=new Uint8Array(w.width*w.lines*(w.channels*w.type*2)),D={version:Qt(R,z),unknownUncompressedSize:Qt(R,z),unknownCompressedSize:Qt(R,z),acCompressedSize:Qt(R,z),dcCompressedSize:Qt(R,z),rleCompressedSize:Qt(R,z),rleUncompressedSize:Qt(R,z),rleRawSize:Qt(R,z),totalAcUncompressedCount:Qt(R,z),totalDcUncompressedCount:Qt(R,z),acCompression:Qt(R,z)};if(D.version<2)throw new Error("EXRLoader.parse: "+Rn.compression+" version "+D.version+" is unsupported");let F=new Array,B=H(R,z)-2;for(;B>0;){let Et=Gt(R.buffer,z),Ft=Vt(R,z),Xt=Ft>>2&3,ge=(Ft>>4)-1,se=new Int8Array([ge])[0],jt=Vt(R,z);F.push({name:Et,index:se,type:jt,compression:Xt}),B-=Et.length+3}let k=Rn.channels,et=new Array(w.channels);for(let Et=0;Et<w.channels;++Et){let Ft=et[Et]={},Xt=k[Et];Ft.name=Xt.name,Ft.compression=0,Ft.decoded=!1,Ft.type=Xt.pixelType,Ft.pLinear=Xt.pLinear,Ft.width=w.width,Ft.height=w.lines}let J={idx:new Array(3)};for(let Et=0;Et<w.channels;++Et){let Ft=et[Et];for(let Xt=0;Xt<F.length;++Xt){let ge=F[Xt];Ft.name==ge.name&&(Ft.compression=ge.compression,ge.index>=0&&(J.idx[ge.index]=Et),Ft.offset=Et)}}let ot,dt,pt;if(D.acCompressedSize>0)switch(D.acCompression){case 0:ot=new Uint16Array(D.totalAcUncompressedCount),At(w.array,R,z,D.acCompressedSize,ot,D.totalAcUncompressedCount);break;case 1:let Et=w.array.slice(z.value,z.value+D.totalAcUncompressedCount),Ft=Ki(Et);ot=new Uint16Array(Ft.buffer),z.value+=D.totalAcUncompressedCount;break}if(D.dcCompressedSize>0){let Et={array:w.array,offset:z,size:D.dcCompressedSize};dt=new Uint16Array(It(Et).buffer),z.value+=D.dcCompressedSize}if(D.rleRawSize>0){let Et=w.array.slice(z.value,z.value+D.rleCompressedSize),Ft=Ki(Et);pt=kt(Ft.buffer),z.value+=D.rleCompressedSize}let xt=0,bt=new Array(et.length);for(let Et=0;Et<bt.length;++Et)bt[Et]=new Array;for(let Et=0;Et<w.lines;++Et)for(let Ft=0;Ft<et.length;++Ft)bt[Ft].push(xt),xt+=et[Ft].width*w.type*2;Mt(J,bt,et,ot,dt,_);for(let Et=0;Et<et.length;++Et){let Ft=et[Et];if(!Ft.decoded)switch(Ft.compression){case 2:let Xt=0,ge=0;for(let se=0;se<w.lines;++se){let jt=bt[Et][Xt];for(let we=0;we<Ft.width;++we){for(let Wt=0;Wt<2*Ft.type;++Wt)_[jt++]=pt[ge+Wt*Ft.width*Ft.height];ge++}Xt++}break;case 1:default:throw new Error("EXRLoader.parse: unsupported channel compression")}}return new DataView(_.buffer)}function Gt(w,R){let z=new Uint8Array(w),_=0;for(;z[R.value+_]!=0;)_+=1;let D=new TextDecoder().decode(z.slice(R.value,R.value+_));return R.value=R.value+_+1,D}function vt(w,R,z){let _=new TextDecoder().decode(new Uint8Array(w).slice(R.value,R.value+z));return R.value=R.value+z,_}function fe(w,R){let z=Kt(w,R),_=Ut(w,R);return[z,_]}function ae(w,R){let z=Ut(w,R),_=Ut(w,R);return[z,_]}function Kt(w,R){let z=w.getInt32(R.value,!0);return R.value=R.value+4,z}function Ut(w,R){let z=w.getUint32(R.value,!0);return R.value=R.value+4,z}function Dt(w,R){let z=w[R.value];return R.value=R.value+1,z}function Vt(w,R){let z=w.getUint8(R.value);return R.value=R.value+1,z}let Qt=function(w,R){let z;return"getBigInt64"in DataView.prototype?z=Number(w.getBigInt64(R.value,!0)):z=w.getUint32(R.value+4,!0)+Number(w.getUint32(R.value,!0)<<32),R.value+=8,z};function ne(w,R){let z=w.getFloat32(R.value,!0);return R.value+=4,z}function te(w,R){return Zl.toHalfFloat(ne(w,R))}function K(w){let R=(w&31744)>>10,z=w&1023;return(w>>15?-1:1)*(R?R===31?z?NaN:1/0:Math.pow(2,R-15)*(1+z/1024):6103515625e-14*(z/1024))}function H(w,R){let z=w.getUint16(R.value,!0);return R.value+=2,z}function Lt(w,R){return K(H(w,R))}function Nt(w,R,z,_){let D=z.value,F=[];for(;z.value<D+_-1;){let B=Gt(R,z),k=Kt(w,z),et=Vt(w,z);z.value+=3;let J=Kt(w,z),ot=Kt(w,z);F.push({name:B,pixelType:k,pLinear:et,xSampling:J,ySampling:ot})}return z.value+=1,F}function ee(w,R){let z=ne(w,R),_=ne(w,R),D=ne(w,R),F=ne(w,R),B=ne(w,R),k=ne(w,R),et=ne(w,R),J=ne(w,R);return{redX:z,redY:_,greenX:D,greenY:F,blueX:B,blueY:k,whiteX:et,whiteY:J}}function Jt(w,R){let z=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],_=Vt(w,R);return z[_]}function xe(w,R){let z=Ut(w,R),_=Ut(w,R),D=Ut(w,R),F=Ut(w,R);return{xMin:z,yMin:_,xMax:D,yMax:F}}function ye(w,R){let z=["INCREASING_Y"],_=Vt(w,R);return z[_]}function Re(w,R){let z=ne(w,R),_=ne(w,R);return[z,_]}function Be(w,R){let z=ne(w,R),_=ne(w,R),D=ne(w,R);return[z,_,D]}function _e(w,R,z,_,D){if(_==="string"||_==="stringvector"||_==="iccProfile")return vt(R,z,D);if(_==="chlist")return Nt(w,R,z,D);if(_==="chromaticities")return ee(w,z);if(_==="compression")return Jt(w,z);if(_==="box2i")return xe(w,z);if(_==="lineOrder")return ye(w,z);if(_==="float")return ne(w,z);if(_==="v2f")return Re(w,z);if(_==="v3f")return Be(w,z);if(_==="int")return Kt(w,z);if(_==="rational")return fe(w,z);if(_==="timecode")return ae(w,z);if(_==="preview")return z.value+=D,"skipped";z.value+=D}function ie(w,R,z){let _={};if(w.getUint32(0,!0)!=20000630)throw new Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");_.version=w.getUint8(4);let D=w.getUint8(5);_.spec={singleTile:!!(D&2),longName:!!(D&4),deepFormat:!!(D&8),multiPart:!!(D&16)},z.value=8;let F=!0;for(;F;){let B=Gt(R,z);if(B==0)F=!1;else{let k=Gt(R,z),et=Ut(w,z),J=_e(w,R,z,k,et);J===void 0?console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${k}'.`):_[B]=J}}if((D&-5)!=0)throw console.error("THREE.EXRHeader:",_),new Error("THREE.EXRLoader: Provided file is currently unsupported.");return _}function on(w,R,z,_,D){let F={size:0,viewer:R,array:z,offset:_,width:w.dataWindow.xMax-w.dataWindow.xMin+1,height:w.dataWindow.yMax-w.dataWindow.yMin+1,channels:w.channels.length,bytesPerLine:null,lines:null,inputSize:null,type:w.channels[0].pixelType,uncompress:null,getter:null,format:null,colorSpace:bn};switch(w.compression){case"NO_COMPRESSION":F.lines=1,F.uncompress=ut;break;case"RLE_COMPRESSION":F.lines=1,F.uncompress=mt;break;case"ZIPS_COMPRESSION":F.lines=1,F.uncompress=It;break;case"ZIP_COMPRESSION":F.lines=16,F.uncompress=It;break;case"PIZ_COMPRESSION":F.lines=32,F.uncompress=St;break;case"PXR24_COMPRESSION":F.lines=16,F.uncompress=Pt;break;case"DWAA_COMPRESSION":F.lines=32,F.uncompress=Ot;break;case"DWAB_COMPRESSION":F.lines=256,F.uncompress=Ot;break;default:throw new Error("EXRLoader.parse: "+w.compression+" is unsupported")}if(F.scanlineBlockSize=F.lines,F.type==1)switch(D){case Je:F.getter=Lt,F.inputSize=2;break;case cn:F.getter=H,F.inputSize=2;break}else if(F.type==2)switch(D){case Je:F.getter=ne,F.inputSize=4;break;case cn:F.getter=te,F.inputSize=4}else throw new Error("EXRLoader.parse: unsupported pixelType "+F.type+" for "+w.compression+".");F.blockCount=(w.dataWindow.yMax+1)/F.scanlineBlockSize;for(let k=0;k<F.blockCount;k++)Qt(R,_);F.outputChannels=F.channels==3?4:F.channels;let B=F.width*F.height*F.outputChannels;switch(D){case Je:F.byteArray=new Float32Array(B),F.channels<F.outputChannels&&F.byteArray.fill(1,0,B);break;case cn:F.byteArray=new Uint16Array(B),F.channels<F.outputChannels&&F.byteArray.fill(15360,0,B);break;default:console.error("THREE.EXRLoader: unsupported type: ",D);break}return F.bytesPerLine=F.width*F.inputSize*F.channels,F.outputChannels==4?(F.format=dn,F.colorSpace=bn):(F.format=gr,F.colorSpace=fn),F}let wn=new DataView(t),ci=new Uint8Array(t),Oe={value:0},Rn=ie(wn,t,Oe),he=on(Rn,wn,ci,Oe,this.type),Di={value:0},Fi={R:0,G:1,B:2,A:3,Y:0};for(let w=0;w<he.height/he.scanlineBlockSize;w++){let R=Ut(wn,Oe);he.size=Ut(wn,Oe),he.lines=R+he.scanlineBlockSize>he.height?he.height-R:he.scanlineBlockSize;let _=he.size<he.lines*he.bytesPerLine?he.uncompress(he):ut(he);Oe.value+=he.size;for(let D=0;D<he.scanlineBlockSize;D++){let F=D+w*he.scanlineBlockSize;if(F>=he.height)break;for(let B=0;B<he.channels;B++){let k=Fi[Rn.channels[B].name];for(let et=0;et<he.width;et++){Di.value=(D*(he.channels*he.width)+B*he.width+et)*he.inputSize;let J=(he.height-1-F)*(he.width*he.outputChannels)+et*he.outputChannels+k;he.byteArray[J]=he.getter(_,Di)}}}}return{header:Rn,width:he.width,height:he.height,data:he.byteArray,format:he.format,colorSpace:he.colorSpace,type:this.type}}setDataType(t){return this.type=t,this}load(t,e,n,i){function s(o,a){o.colorSpace=a.colorSpace,o.minFilter=Ye,o.magFilter=Ye,o.generateMipmaps=!1,o.flipY=!1,e&&e(o,a)}return super.load(t,s,n,i)}};var sw=50,Rd=new URLSearchParams(window.location.search),Pr=Rd.get("decode")||"correct",rw=Rd.get("normals")||"smooth";async function Pd(r){let t=new pa,e=new va;e.setDataType(Je),console.log("[VAT] loading FBX + EXR from:",r);let[n,i]=await Promise.all([t.loadAsync(r+"geo/vertex_animation_textures1_mesh.fbx"),e.loadAsync(r+"tex/vertex_animation_textures1_pos.exr")]);console.log("[VAT] FBX + EXR loaded");let s=null;if(n.traverse(at=>{at.isMesh&&!s&&(s=at)}),!s)throw new Error("FBX \u306B\u30E1\u30C3\u30B7\u30E5\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");let o=s.geometry,a=o.getAttribute("position"),l=o.getAttribute("uv"),c=o.getIndex(),h=a.count;console.log("posAttr.count:",a.count);let d=o.getAttribute("uv2")||o.getAttribute("uv1");console.log("[VAT] vertexCount:",h),console.log("[VAT] has index:",!!c,c?"count="+c.count:""),console.log("[VAT] has uv:",!!l,"has vatUv:",!!d),console.log("[VAT] geometry attributes:",Object.keys(o.attributes)),d&&(console.log("[VAT] vatUv sample v0:",d.getX(0),d.getY(0)),console.log("[VAT] vatUv sample v1:",d.getX(1),d.getY(1)));let u=[];if(c)for(let at=0;at<c.count;at++)u.push(c.getX(at));else for(let at=0;at<h;at+=3)d&&(d.getX(at)===0&&d.getY(at)===0||d.getX(at+1)===0&&d.getY(at+1)===0||d.getX(at+2)===0&&d.getY(at+2)===0)||u.push(at,at+1,at+2);let f=[];if(l)for(let at=0;at<l.count;at++)f.push(l.getX(at),l.getY(at));let g=i.image.data,v=i.image.width,p=i.image.height,m=g.length/(v*p);console.log("[VAT] pos texture:",v,"x",p,"channels:",m),console.log("[VAT] pos sample pixel[0]:",g[0],g[1],g[2]);let x=sw,y=h;if(d){y=0;for(let at=0;at<h;at++){if(d.getX(at)===0&&d.getY(at)===0)continue;let ft=Math.floor(d.getX(at)*v),At=Math.floor((1-d.getY(at))*p);y=Math.max(y,At*v+ft+1)}}let M=Math.ceil(y/v),I=new Int32Array(h);for(let at=0;at<h;at++){let ft;if(d)if(d.getX(at)===0&&d.getY(at)===0)ft=0;else{let At=Math.floor(d.getX(at)*v);ft=Math.floor((1-d.getY(at))*p)*v+At}else ft=at;I[at]=Math.max(0,Math.min(ft,y-1))}console.log("vertexPointIds:",I);let A=new Float32Array(h*3*x),P=x*M;for(let at=0;at<x;at++)for(let ft=0;ft<h;ft++){let At=I[ft],q=At%v,Ht=Math.floor(At/v),Ct;Pr==="naive"?Ct=at*M+Ht:Pr==="reversed"?Ct=at*M+(M-1-Ht):Pr==="noflip"?Ct=(x-1-at)*M+Ht:Ct=P-1-(at*M+Ht);let kt=(Ct*v+q)*m,Mt=(at*h+ft)*3,ce=Pr==="nomirror"?1:-1;A[Mt+0]=a.getX(ft)+ce*g[kt+0],A[Mt+1]=a.getY(ft)+g[kt+1],A[Mt+2]=a.getZ(ft)+g[kt+2]}let W=h*3,S=[];for(let at=0;at<x-1;at++){let ft=at*W,At=(at+1)*W,q=0;for(let Ht=0;Ht<W;Ht++){let Ct=Math.abs(A[ft+Ht]-A[At+Ht]);Ct>q&&(q=Ct)}S.push(q)}let b=1e-4,V=S.findIndex(at=>at>b),Y=S.length-1;for(;Y>=0&&S[Y]<=b;)Y--;let X=x,L=A;Pr==="correct"&&(V>0||Y<S.length-1)?(V===-1&&(V=0),X=Y+2-V,L=A.slice(V*W,(V+X)*W),console.log("[VAT] trimmed static frames:","keep",V,"-",Y+1,"(",x,"->",X,"frames )")):console.log("[VAT] no static frames to trim"),console.log("[VAT] frame deltas:",S.map(at=>+at.toFixed(5)));let U=[];for(let at=0;at<h;at++)d&&d.getX(at)===0&&d.getY(at)===0||U.push(at);let O=1/0,it=-1/0,$=1/0,Z=-1/0;for(let at of U){let ft=L[at*3+0],At=L[at*3+2];ft<O&&(O=ft),ft>it&&(it=ft),At<$&&($=At),At>Z&&(Z=At)}let rt={width:it-O,depth:Z-$};console.log("[VAT] flat size:",rt.width.toFixed(3),"x",rt.depth.toFixed(3));let lt=(X-1)*W,st=0,tt=0,ct=0;for(let at of U)st+=L[lt+at*3+0],tt+=L[lt+at*3+1],ct+=L[lt+at*3+2];st/=U.length,tt/=U.length,ct/=U.length;let _t=new Float32Array(U.length);for(let at=0;at<U.length;at++){let ft=U[at],At=L[lt+ft*3+0]-st,q=L[lt+ft*3+1]-tt,Ht=L[lt+ft*3+2]-ct;_t[at]=Math.sqrt(At*At+q*q+Ht*Ht)}_t.sort();let yt={center:[st,tt,ct],radius:_t[Math.floor(U.length*.9)]};console.log("[VAT] crumple center:",st.toFixed(3),tt.toFixed(3),ct.toFixed(3),"radius:",yt.radius.toFixed(3));let wt=new Float32Array(h*3*X),Tt=new Float32Array(y*3);for(let at=0;at<X;at++){let ft=at*h*3;if(rw==="flat"){for(let At=0;At<u.length;At+=3){let q=u[At]*3,Ht=u[At+1]*3,Ct=u[At+2]*3,kt=L[ft+q],Mt=L[ft+q+1],ce=L[ft+q+2],Zt=L[ft+Ht]-kt,N=L[ft+Ht+1]-Mt,T=L[ft+Ht+2]-ce,Q=L[ft+Ct]-kt,gt=L[ft+Ct+1]-Mt,ut=L[ft+Ct+2]-ce,mt=N*ut-T*gt,It=T*Q-Zt*ut,St=Zt*gt-N*Q,Pt=Math.hypot(mt,It,St)||1;mt/=Pt,It/=Pt,St/=Pt;for(let Ot=0;Ot<3;Ot++){let Gt=ft+u[At+Ot]*3;wt[Gt]=mt,wt[Gt+1]=It,wt[Gt+2]=St}}continue}Tt.fill(0);for(let At=0;At<u.length;At+=3){let q=u[At]*3,Ht=u[At+1]*3,Ct=u[At+2]*3,kt=L[ft+q],Mt=L[ft+q+1],ce=L[ft+q+2],Zt=L[ft+Ht]-kt,N=L[ft+Ht+1]-Mt,T=L[ft+Ht+2]-ce,Q=L[ft+Ct]-kt,gt=L[ft+Ct+1]-Mt,ut=L[ft+Ct+2]-ce,mt=N*ut-T*gt,It=T*Q-Zt*ut,St=Zt*gt-N*Q;for(let Pt=0;Pt<3;Pt++){let Ot=I[u[At+Pt]]*3;Tt[Ot]+=mt,Tt[Ot+1]+=It,Tt[Ot+2]+=St}}for(let At=0;At<y;At++){let q=At*3,Ht=Math.hypot(Tt[q],Tt[q+1],Tt[q+2]);Ht>1e-10?(Tt[q]/=Ht,Tt[q+1]/=Ht,Tt[q+2]/=Ht):(Tt[q]=0,Tt[q+1]=1,Tt[q+2]=0)}for(let At=0;At<h;At++){let q=I[At]*3,Ht=ft+At*3;wt[Ht]=Tt[q],wt[Ht+1]=Tt[q+1],wt[Ht+2]=Tt[q+2]}}return console.log("[VAT] decoded pos frame0 vertex0:",L[0],L[1],L[2]),console.log("[VAT] decoded nrm frame0 vertex0:",wt[0],wt[1],wt[2]),console.log("[VAT] animData ready:",{vertexCount:h,frameCount:X,indicesLen:u.length,uvsLen:f.length}),{vertexCount:h,frameCount:X,indices:u,uvs:f,positions:L,normals:wt,crumple:yt,flat:rt}}var Id;function ow(){return Id||=Pd(new URL("./vat/",import.meta.url).href).catch(r=>{throw Id=null,r})}async function ES(r,t={}){let e=!1,n=!1,i,s=0,o=t.reducedMotion,a=new _o,l={background:t.background||"#f5f4ee",floor:t.background||"#f5f4ee"};a.background=null;let c={x:0,y:2.2,z:3.6,targetY:.35},h=new He(40,r.clientWidth/r.clientHeight,.01,100);h.position.set(c.x,c.y,c.z),h.lookAt(0,c.targetY,0);function d(){h.position.set(c.x,c.y,c.z),h.lookAt(0,c.targetY,0),H()}let u=new ar({antialias:!0,alpha:!0});u.setClearColor(l.background,0),u.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),u.setSize(r.clientWidth,r.clientHeight),u.outputColorSpace=Ce,u.shadowMap.enabled=!0,u.shadowMap.type=Dl,r.appendChild(u.domElement);let f=-.1,g=-1.1,v=new Co({opacity:t.dark?.22:.1}),p=new Fe(new Ps(40,80),v);p.rotation.x=-Math.PI/2,p.position.set(0,f,1),p.receiveShadow=!0,a.add(p);let m=new Ds({color:l.background}),x=new Fe(new Ps(16,6),m);x.position.set(0,f+3,g),x.receiveShadow=!0,x.visible=!1,a.add(x);let y=new Os(16777215,1.25);a.add(y);let M=new qi(16777215,1.15);M.position.set(-2,2.6,1.4),M.castShadow=!0,M.shadow.mapSize.set(1024,1024),M.shadow.camera.left=-4,M.shadow.camera.right=4,M.shadow.camera.top=4,M.shadow.camera.bottom=-3,M.shadow.camera.near=.1,M.shadow.camera.far=12,M.shadow.bias=-.001,a.add(M);let I=new qi(16777215,0);I.position.set(-2,1,-1),a.add(I);let A=new la(u);A.addPass(new ca(a,h));let P=new Tr(a,h,r.clientWidth,r.clientHeight);P.kernelRadius=.01,P.minDistance=1e-4,P.maxDistance=.08,A.addPass(P),A.addPass(new ua);let W={speed:o?100:1.5,openFrame:0},S=!1,b=[],V=null,Y=null,X=[[-1.25,.02,-.1],[0,.02,.12],[1.25,.02,-.06]],L=.88,U=1.5,O=1.15,it={width:1,depth:1.4},$={minX:-2.4,maxX:2.4,minZ:g,maxZ:1.7},Z=1.15,rt=1.25,lt=2.6,st=4.5,tt=.018,ct=1/60,_t=.16,yt=.5,wt=14,Tt=4.5,at=3.2,ft=6,At=220,q=.25,Ht=f+.25,Ct=.02,kt=new G(0,.2,0),Mt=new ra({gravity:new E(0,-7,0)});Mt.allowSleep=!1,Mt.defaultContactMaterial.friction=.8,Mt.defaultContactMaterial.restitution=.15;let ce=new $i("paper"),Zt=new $i("floor");Mt.addContactMaterial(new ji(ce,Zt,{friction:1,restitution:.12})),Mt.addContactMaterial(new ji(ce,ce,{friction:.6,restitution:.3}));let N=new le({mass:0,material:Zt,shape:new ia,position:new E(0,f,0),quaternion:new en().setFromEuler(-Math.PI/2,0,0)});Mt.addBody(N);let T=new G;function Q(C,j){return T.copy(kt).multiplyScalar(C).applyQuaternion(j)}function gt(C){let j=Q(O,C.mesh.quaternion),nt=new le({mass:_t,material:ce,shape:new na(q),linearDamping:.15,angularDamping:.35,position:new E(C.mesh.position.x+j.x,C.mesh.position.y+j.y,C.mesh.position.z+j.z)});return nt.quaternion.set(C.mesh.quaternion.x,C.mesh.quaternion.y,C.mesh.quaternion.z,C.mesh.quaternion.w),Mt.addBody(nt),nt}function ut(C,j){let nt=C.body;nt.type=j?le.DYNAMIC:le.KINEMATIC,nt.mass=j?_t:0,nt.collisionFilterGroup=j?1:0,nt.collisionFilterMask=j?1:0,j||(nt.velocity.set(0,0,0),nt.angularVelocity.set(0,0,0),nt.force.set(0,0,0),nt.torque.set(0,0,0)),nt.updateMassProperties(),nt.wakeUp()}function mt(C){let j=Q(C.mesh.scale.x,C.mesh.quaternion);C.body.position.set(C.mesh.position.x+j.x,C.mesh.position.y+j.y,C.mesh.position.z+j.z),C.body.quaternion.set(C.mesh.quaternion.x,C.mesh.quaternion.y,C.mesh.quaternion.z,C.mesh.quaternion.w)}function It(C,j=O){C.mesh.quaternion.set(C.body.quaternion.x,C.body.quaternion.y,C.body.quaternion.z,C.body.quaternion.w);let nt=Q(j,C.mesh.quaternion);C.mesh.position.set(C.body.position.x-nt.x,C.body.position.y-nt.y,C.body.position.z-nt.z),C.mesh.scale.setScalar(j)}function St(C){return C.position.y<=Ht+.05}function Pt(C,j){let nt=Math.exp(-lt*j),ht=Math.exp(-st*j);C.velocity.x*=nt,C.velocity.z*=nt,C.angularVelocity.x*=ht,C.angularVelocity.y*=ht,C.angularVelocity.z*=ht}function Ot(C,j){C.state="closed",C.time=0,C.homePosition.copy(C.mesh.position),C.homeRotation.copy(C.mesh.rotation),C.frameIdx=j,ai(C,V,C.frameIdx),mt(C),It(C)}let Gt=3;function vt(C){let j=ne(),nt=j.minX+q,ht=j.maxX-q,Bt=j.minZ+q,pe=j.maxZ-q;for(let Yt of b){if(!Yt.body||Yt.body.type!==le.DYNAMIC)continue;let oe=Yt.body;oe.position.x<nt?(oe.velocity.x<0&&(oe.velocity.x=Math.abs(oe.velocity.x)*.42),oe.velocity.x+=Gt*C):oe.position.x>ht&&(oe.velocity.x>0&&(oe.velocity.x=-Math.abs(oe.velocity.x)*.42),oe.velocity.x-=Gt*C),oe.position.z<Bt?(oe.velocity.z<0&&(oe.velocity.z=Math.abs(oe.velocity.z)*.42),oe.velocity.z+=Gt*C):oe.position.z>pe&&(oe.velocity.z>0&&(oe.velocity.z=-Math.abs(oe.velocity.z)*.42),oe.velocity.z-=Gt*C)}}function fe(C){return Math.min(Math.max(C,0),1)}function ae(C){return 1-Math.pow(1-C,3)}function Kt(C){return C*C*C}function Ut(C){return C<.5?4*C*C*C:1-Math.pow(-2*C+2,3)/2}function Dt(C,j,nt){return C+(j-C)*nt}function Vt(C,j){return C+Math.random()*(j-C)}function Qt(C){return{position:C.mesh.position.clone(),quaternion:C.mesh.quaternion.clone(),scale:C.mesh.scale.x,frameIdx:C.frameIdx}}function ne(){let C=Math.min(2.4,Math.max(.42,h.aspect*1.32)),j=u.domElement.getBoundingClientRect(),nt=t.landingTop?.()??j.top+j.height*.18,ht=new mr;ht.setFromCamera(new re(0,1-2*(nt-j.top)/j.height),h);let Bt=ht.ray.intersectPlane(new Sn(new G(0,1,0),-Ht),new G);return{...$,minZ:Bt?Math.min(g,Bt.z-q):g,minX:-C,maxX:C}}let te=new G;function K(){h.getWorldDirection(te);let C=h.position.clone().addScaledVector(te,U),j=te.clone().negate(),nt=new G(0,1,0).applyQuaternion(h.quaternion),ht=new G().crossVectors(j,nt),Bt=new Ve().setFromRotationMatrix(new qt().makeBasis(ht,j,nt)),pe=2*Math.tan(De.degToRad(h.fov*.5))*U,Yt=pe*h.aspect,oe=Math.min(pe*L/it.depth,Yt*L/it.width);return{position:C,quaternion:Bt,scale:oe}}function H(){if(Y){if(Y.state==="opening"&&Y.target){let C=K();Y.target.position.copy(C.position),Y.target.quaternion.copy(C.quaternion),Y.target.scale=C.scale}else if(Y.state==="open"){let C=K();Y.mesh.position.copy(C.position),Y.mesh.quaternion.copy(C.quaternion),Y.mesh.scale.setScalar(C.scale),t.onResize?.(dt())}}}async function Lt(){let C=import.meta.url.replace(/[^/]*$/,"");V=await ow(),!e&&(it.width=V.flat.width,it.depth=V.flat.depth,kt.fromArray(V.crumple.center),q=V.crumple.radius*O,Ht=f+q*1.08,Ct=Ht-kt.y*O,N.position.y=Ht-q,console.log("[VAT] physics: collisionRadius =",q.toFixed(3),"restCenterY =",Ht.toFixed(3)))}function Nt(C){return C<X.length?new G(X[C][0],Ct,X[C][2]):ee()}function ee(){let C=ne(),j=q*1.3,nt=new G(0,Ct,0);for(let ht=0;ht<40&&!b.every(pe=>{let Yt=pe.body.position.x-nt.x,oe=pe.body.position.z-nt.z;return Yt*Yt+oe*oe>(q*2.4)**2});ht++);return nt}let Jt=0;function xe(C,j,nt=Vt(.8,1.2)){let ht=V.frameCount-1,Bt=dd(V);Bt.mesh.castShadow=!0,Bt.mesh.rotation.set(0,Vt(-Math.PI,Math.PI),Vt(-.18,.18)),Bt.mesh.position.copy(C),Bt.mesh.scale.setScalar(O),a.add(Bt.mesh);let pe=gt(Bt),Yt={...Bt,body:pe,frameIdx:ht,state:"closed",time:0,homePosition:Bt.mesh.position.clone(),homeRotation:Bt.mesh.rotation.clone(),start:null,target:null,throw:null};if(ai(Yt,V,ht),b.push(Yt),S){let oe=new Fe(new To(q,16,12),new Ts({color:46438,wireframe:!0}));a.add(oe),Yt.debugSphere=oe}return j&&(Yt.state="rolling",Yt.throw={settleTimer:0},pe.position.y+=nt,pe.angularVelocity.set(Vt(-1.5,1.5),Vt(-.5,.5),Vt(-1.5,1.5)),It(Yt)),Yt}let ye=new mr,Re=new re,Be=new Sn,_e=new G,ie=null;u.domElement.style.touchAction="none";function on(C){let j=u.domElement.getBoundingClientRect();Re.x=(C.clientX-j.left)/j.width*2-1,Re.y=-((C.clientY-j.top)/j.height)*2+1}function wn(C){on(C),ye.setFromCamera(Re,h);let j=ye.intersectObjects(b.map(nt=>nt.mesh));return j.length===0?null:b.find(nt=>nt.mesh===j[0].object)||null}function ci(C){return C.state==="closed"||C.state==="rolling"}u.domElement.addEventListener("pointerdown",C=>{if(!V||ie||n||C.button!==0)return;let j=wn(C);ie={paper:j,pointerId:C.pointerId,startX:C.clientX,startY:C.clientY,grabbing:!1};try{u.domElement.setPointerCapture(C.pointerId)}catch{}if(j&&j.state==="rolling"&&t.canGrab?.()!==!1)Di(j,C)}),u.domElement.addEventListener("pointermove",C=>{if(!ie){Rn(C);return}if(C.pointerId===ie.pointerId){if(C.pointerType==="mouse"&&!(C.buttons&1)){Oe(),Rn(C);return}if(!ie.grabbing){let j=ie.paper,nt=Math.hypot(C.clientX-ie.startX,C.clientY-ie.startY);j&&ci(j)&&nt>ft&&t.canGrab?.()!==!1&&Di(j,C)}ie.grabbing&&Fi(ie.paper,C)}}),u.domElement.addEventListener("pointerup",C=>{if(!(!ie||C.pointerId!==ie.pointerId)){if(ie.grabbing){let j=ie.paper;w(j,!0),ie=null,t.onDrop?.(j.noteId,C.clientX,C.clientY),t.onDragEnd?.()}else he(C);ie=null}});function Oe(C){!ie||C?.pointerId!==void 0&&C.pointerId!==ie.pointerId||(ie.grabbing&&w(ie.paper,!1),ie=null,t.onDragEnd?.())}u.domElement.addEventListener("pointercancel",Oe),u.domElement.addEventListener("lostpointercapture",Oe),window.addEventListener("blur",Oe);function Rn(C){if(!V)return;let j=wn(C);u.domElement.style.cursor=j?ci(j)?"grab":"pointer":""}function he(C){let j=wn(C);if(!j||t.onPick?.(j.noteId,C.clientX,C.clientY)===!1)return;let nt=Y;nt&&(z(nt),Y=null),!(nt===j||!ci(j))&&(R(j),Y=j)}function Di(C,j){ie.grabbing=!0,C.state="grabbed",C.time=0;let nt=C.body;nt.type=le.KINEMATIC,nt.mass=0,nt.updateMassProperties(),nt.velocity.set(0,0,0),nt.angularVelocity.set(0,0,0),nt.collisionFilterGroup=1,nt.collisionFilterMask=1,nt.wakeUp(),C.grab={depth:Math.max(2.4,new G(nt.position.x,nt.position.y,nt.position.z).sub(h.position).dot(h.getWorldDirection(new G))),target:new G(nt.position.x,Ht+yt,nt.position.z)},Fi(C,j),u.domElement.style.cursor="grabbing"}function Fi(C,j){let nt=u.domElement.getBoundingClientRect(),ht=Math.min(24,nt.width*.06),Bt=nt.top+ht;on({clientX:Math.max(nt.left+ht,Math.min(nt.right-ht,j.clientX)),clientY:Math.max(Bt,Math.min(nt.bottom-ht,j.clientY))}),ye.setFromCamera(Re,h),h.getWorldDirection(te),Be.setFromNormalAndCoplanarPoint(te,h.position.clone().addScaledVector(te,C.grab.depth)),ye.ray.intersectPlane(Be,_e)&&C.grab.target.copy(_e)}function w(C,j){let nt=C.body,ht=j?nt.velocity.x:0,Bt=j?nt.velocity.z:0,pe=Math.hypot(ht,Bt);if(pe>at){let Yt=at/pe;ht*=Yt,Bt*=Yt}nt.type=le.DYNAMIC,nt.mass=_t,nt.updateMassProperties(),nt.velocity.set(ht,0,Bt),nt.angularVelocity.set(Bt/q*.6,0,-ht/q*.6),nt.wakeUp(),C.state="rolling",C.time=0,C.throw={settleTimer:0},u.domElement.style.cursor="grab"}function R(C){Oe(),C.note&&Ws(C,C.note,!1),t.onOpening?.(C.noteId),ut(C,!1),It(C),C.state="opening",C.time=0,C.start=Qt(C);let j=K();C.target={position:j.position,quaternion:j.quaternion,scale:j.scale,frameIdx:W.openFrame}}function z(C){if(C.note&&Ws(C,C.note,!0),t.onClose?.(),C.state==="discarding"||C.state==="rolling")return;let j=new G(Vt(-1,1),0,Vt(-1.3,-.45));j.normalize(),C.state="discarding",C.time=0,C.start=Qt(C),ut(C,!0),mt(C),C.body.velocity.set(j.x*Vt(1.4,2),Vt(.5,.9),j.z*Vt(1.4,2)),C.body.angularVelocity.set(Vt(-2.4,2.4),Vt(-.8,.8),Vt(-2.4,2.4)),C.throw={settleTimer:0}}let D=1/24,F=null;function B(){F=performance.now()/1e3,u.setAnimationLoop(k)}function k(){let C=performance.now()/1e3,j=Math.min(C-F,.05);if(F=C,!!V){Mt.step(ct,Math.min(j,.05),3),n||vt(j);for(let nt of b)et(nt,j);if(S)for(let nt of b)nt.debugSphere&&nt.debugSphere.position.set(nt.body.position.x,nt.body.position.y,nt.body.position.z);if(n){s+=j,h.rotation.z=Math.min(.28,s*.22);for(let nt of b)nt.mesh.material.opacity=Math.max(0,1-Math.max(0,s-.5)/.8);s>=1.3&&jt()}A.render()}}function et(C,j){let nt=V.frameCount-1;if(C.state==="opening"){C.time+=j*W.speed;let ht=fe(C.time/Z),Bt=ae(ht),pe=Kt(ht);C.mesh.position.lerpVectors(C.start.position,C.target.position,Bt),C.mesh.quaternion.slerpQuaternions(C.start.quaternion,C.target.quaternion,Bt),C.mesh.scale.setScalar(Dt(C.start.scale,C.target.scale,Bt)),C.frameIdx=Dt(C.start.frameIdx,C.target.frameIdx,pe),ai(C,V,C.frameIdx),ht>=1&&(C.state="open",t.onOpen?.(C.noteId,dt()),C.frameIdx=C.target.frameIdx,C.mesh.position.copy(C.target.position),C.mesh.quaternion.copy(C.target.quaternion),C.mesh.scale.setScalar(C.target.scale),mt(C),ai(C,V,C.frameIdx));return}if(C.state==="discarding"){C.time+=j*W.speed;let ht=fe(C.time/rt),Bt=ae(ht),pe=Dt(C.start.scale,O,Bt);C.frameIdx=Dt(C.start.frameIdx,nt,Bt),It(C,pe),ai(C,V,C.frameIdx),ht>=1&&(C.state="rolling",C.time=0,C.frameIdx=nt,ai(C,V,C.frameIdx));return}if(C.state==="grabbed"){let ht=C.body,Bt=C.grab.target,pe=(Bt.x-ht.position.x)*wt,Yt=(Bt.y-ht.position.y)*wt,oe=(Bt.z-ht.position.z)*wt,hi=Math.hypot(pe,Yt,oe),Ui=Tt*Math.max(1,h.position.distanceTo(Bt)/4);if(hi>Ui){let qs=Ui/hi;pe*=qs,Yt*=qs,oe*=qs}ht.velocity.set(pe,Yt,oe),It(C);return}if(C.state==="rolling"){C.time+=j;let ht=St(C.body);ht&&Pt(C.body,j),It(C);let Bt=C.body.velocity.lengthSquared()+C.body.angularVelocity.lengthSquared()*.02;C.throw.settleTimer=ht&&Bt<tt?C.throw.settleTimer+j:0,C.throw.settleTimer>.35&&Ot(C,nt);return}C.state==="closed"&&(St(C.body)&&Pt(C.body,j),It(C))}function J(){e||!r.clientWidth||!r.clientHeight||(h.aspect=r.clientWidth/r.clientHeight,h.updateProjectionMatrix(),u.setSize(r.clientWidth,r.clientHeight),A.setSize(r.clientWidth,r.clientHeight),H())}let ot=new ResizeObserver(J);ot.observe(r);function dt(){let C=K(),j=2*Math.tan(De.degToRad(h.fov*.5))*U,nt=it.depth*C.scale/j*r.clientHeight,ht=nt*it.width/it.depth;return{left:(r.clientWidth-ht)/2,top:(r.clientHeight-nt)/2,width:ht,height:nt}}function pt(){Oe(),Y=null;for(let C of b)a.remove(C.mesh),C.mesh.geometry.dispose(),C.mesh.material.map?.dispose(),C.mesh.material.dispose(),Mt.removeBody(C.body);b.length=0}function xt(C){if(e)return;pt(),t.onClose?.();let j=ne(),nt=j.maxX-j.minX-q*2.8,ht=Math.max(1,Math.min(C.length,Math.floor(nt/(q*2.7))+1));C.forEach((Bt,pe)=>{let Yt=0;for(let Dd of String(Bt.id))Yt=Yt*31+Dd.charCodeAt(0)>>>0;let oe=Math.floor(pe/ht),hi=Math.min(ht,C.length-oe*ht),Ui=ht>1?nt/(ht-1):0,qs=C.length>1?(Yt%97/96-.5)*q*.6:0,Ld=(pe%ht-(hi-1)/2)*Ui+qs,Nd=(C.length<=ht?.2:-.35+oe*q*2.4)+(C.length>1?((Yt>>>7)%83/82-.5)*q*1.7:0),ya=xe(new G(Ld,Ct,Math.min(1.25,Nd)),!1);ya.noteId=Bt.id,ya.note=Bt,Ws(ya,Bt)}),u.domElement.dataset.paperCount=String(b.length)}function bt(C,j,nt=0){if(e||n||!V)return;let ht=xe(new G(0,Ct,0),!1);ht.noteId=C.id,ht.note=C,Ws(ht,C);let Bt=u.domElement.getBoundingClientRect(),pe=2*Math.tan(De.degToRad(h.fov*.5))*U,Yt=K(),oe=((j.left+j.width/2-Bt.left)/Bt.width-.5)*pe*h.aspect,hi=(.5-(j.top+j.height/2-Bt.top)/Bt.height)*pe;ht.mesh.position.copy(Yt.position).add(new G(oe,hi,0).applyQuaternion(h.quaternion)),ht.mesh.quaternion.copy(Yt.quaternion).multiply(new Ve().setFromAxisAngle(new G(0,1,0),-nt)),ht.mesh.scale.setScalar(j.height/Bt.height*pe/it.depth),ht.frameIdx=0,ht.state="open",ai(ht,V,0),z(ht),u.domElement.dataset.paperCount=String(b.length)}function Et(C){let j=b.find(Bt=>Bt.noteId===C);if(!j)return null;let nt=j.mesh.position.clone().add(kt.clone().multiplyScalar(j.mesh.scale.x).applyQuaternion(j.mesh.quaternion)).project(h),ht=u.domElement.getBoundingClientRect();return{x:ht.left+(nt.x+1)/2*ht.width,y:ht.top+(1-nt.y)/2*ht.height}}function Ft(C){for(let j of b){let nt=C.find(ht=>ht.id===j.noteId);nt&&(j.note=nt,Ws(j,nt,j.state!=="open"&&j.state!=="opening"))}}function Xt(C){let j=b.findIndex(ht=>ht.noteId===C);if(j<0)return;let[nt]=b.splice(j,1);a.remove(nt.mesh),Mt.removeBody(nt.body),nt.mesh.geometry.dispose(),nt.mesh.material.map?.dispose(),nt.mesh.material.dispose(),u.domElement.dataset.paperCount=String(b.length)}function ge(C){if(n)return;let j=b.find(nt=>nt.noteId===C);j&&Y!==j&&(Y&&z(Y),R(j),Y=j)}function se(){Y&&z(Y),Y=null}function jt(){pt(),n=!1,h.rotation.z=0,Mt.gravity.set(0,-7,0),Mt.addBody(N);let C=i;i=null,C?.(!0)}function we(){return e?Promise.resolve(!1):(Oe(),o?(pt(),Promise.resolve(!0)):new Promise(C=>{i=C,n=!0,s=0,Y=null,ie=null,t.onClose?.(),Mt.removeBody(N),Mt.gravity.set(7,-8,0);for(let j of b)ut(j,!0),j.state="rolling",j.throw={settleTimer:0},j.mesh.material.transparent=!0,j.body.velocity.set(2+Math.random(),1,0),j.body.angularVelocity.set(1,0,-4),ai(j,V,V.frameCount-1)}))}function Wt(){if(e)return;e=!0,ot.disconnect(),u.setAnimationLoop(null),window.removeEventListener("blur",Oe);let C=i;i=null,C?.(!1),pt(),a.traverse(j=>{j.geometry?.dispose(),j.material&&j.material.dispose()}),M.shadow.dispose();for(let j of A.passes)j.dispose?.();A.dispose(),u.dispose(),u.forceContextLoss(),u.domElement.remove()}function Me(){e||(u.setAnimationLoop(document.hidden?null:k),F=performance.now()/1e3)}document.addEventListener("visibilitychange",Me);try{await Lt(),J(),B()}catch(C){throw document.removeEventListener("visibilitychange",Me),Wt(),C}return{setNotes:xt,updateNotes:Ft,removeNote:Xt,cancelDrag:Oe,tossNote:bt,paperPosition:Et,openNote:ge,closeNote:se,pour:we,editorRect:dt,setBackground(C){u.setClearColor(C,0)},dispose(){document.removeEventListener("visibilitychange",Me),Wt()}}}export{ES as createPaperScene};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/examples/jsm/libs/fflate.module.js:
  (*!
  fflate - fast JavaScript compression/decompression
  <https://101arrowz.github.io/fflate>
  Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
  version 0.6.9
  *)
*/
