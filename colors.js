/* Color transformations only: no titles, account IDs or event data. */
var CalendarLookColors = (() => {
  'use strict';
  const palettes = [
    { hue: 0, light: '#d50000', dark: '#da5234' },
    { hue: 25, light: '#ef6c00', dark: '#f28b54' },
    { hue: 48, light: '#f6bf26', dark: '#f6c955' },
    { hue: 90, light: '#7cb342', dark: '#a4c96b' },
    { hue: 145, light: '#0b8043', dark: '#69b58c' },
    { hue: 175, light: '#009688', dark: '#5db6ac' },
    { hue: 202, light: '#039be5', dark: '#4b99d2' },
    { hue: 233, light: '#3f51b5', dark: '#8b9fea' },
    { hue: 275, light: '#8e24aa', dark: '#a75aba' },
    { hue: 325, light: '#d81b60', dark: '#e078a5' }
  ];
  function rgb(value) {
    if (!value) return null;
    const s = value.trim();
    if (/^#[\da-f]{6}$/i.test(s)) return [1,3,5].map(i => parseInt(s.slice(i,i+2),16));
    if (/^#[\da-f]{3}$/i.test(s)) return [...s.slice(1)].map(c => parseInt(c+c,16));
    const m = s.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);
    if (!m || m[4] !== undefined && Number(m[4]) < 0.95) return null;
    return m.slice(1,4).map(v => Math.max(0,Math.min(255,Number(v))));
  }
  function luminance(color) {
    const c = (Array.isArray(color) ? color : rgb(color)).map(v => {
      v /= 255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4;
    });
    return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;
  }
  function contrast(a,b) {
    const x=luminance(a), y=luminance(b);
    return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
  }
  function readableText(bg) {
    const best = ['#131314','#ffffff'].sort((a,b)=>contrast(b,bg)-contrast(a,bg))[0];
    return contrast(best,bg)>=4.5 ? best : '#000000';
  }
  function hue(color) {
    const [r,g,b]=color.map(c=>c/255), max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
    if(d<0.04)return null;
    const h=max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4;
    return (h*60+360)%360;
  }
  function palette(source,mode) {
    const color=rgb(source); if(!color)return null;
    const h=hue(color); if(h===null)return mode==='dark'?'#9aa0a6':'#616161';
    const distance=a=>Math.min(Math.abs(a-h),360-Math.abs(a-h));
    return palettes.reduce((a,b)=>distance(a.hue)<=distance(b.hue)?a:b)[mode];
  }
  function accessibleAccent(color,bg) {
    if(contrast(color,bg)>=4.5)return color;
    const from=rgb(color), toward=rgb(readableText(bg));
    for(let i=1;i<=20;i++) {
      const mixed=from.map((c,j)=>Math.round(c+(toward[j]-c)*i/20));
      if(contrast(mixed,bg)>=4.5)return `rgb(${mixed.join(', ')})`;
    }
    return readableText(bg);
  }
  function eventColors(background,foreground,border,mode) {
    const outlined=!rgb(background);
    const source=outlined?(rgb(border)?border:foreground):(rgb(foreground)?foreground:background);
    const fill=palette(source,mode); if(!fill)return null;
    const surface=mode==='dark'?'#131314':'#ffffff';
    return {background:outlined?surface:fill,
      foreground:outlined?accessibleAccent(fill,surface):readableText(fill),
      border:outlined?accessibleAccent(fill,surface):fill, outlined};
  }
  return {rgb,contrast,palette,eventColors,readableText,palettes};
})();
if(typeof module!=='undefined')module.exports=CalendarLookColors;
