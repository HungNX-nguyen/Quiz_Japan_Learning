import { useEffect } from 'react';
import { normalizeSelection } from './lookup.mjs';
export function useSelectionLookup(blocked,onLookup){
 useEffect(()=>{
  if(blocked)return;
  let timer,pointerDown=false;
  function read(){
   if(pointerDown)return;
   const selection=window.getSelection();
   if(!selection || selection.isCollapsed || !selection.rangeCount)return;
   const range=selection.getRangeAt(0);
   const element=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentElement;
   if(!element?.closest('main') || element.closest('input,textarea,[contenteditable],.modal'))return;
   const text=normalizeSelection(selection.toString());
   if(text)onLookup(text);
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(read,500);}
  function down(){pointerDown=true;clearTimeout(timer);}
  function up(){pointerDown=false;schedule();}
  document.addEventListener('pointerdown',down);
  document.addEventListener('pointerup',up);
  document.addEventListener('selectionchange',schedule);
  document.addEventListener('keyup',schedule);
  return ()=>{clearTimeout(timer);document.removeEventListener('pointerdown',down);document.removeEventListener('pointerup',up);document.removeEventListener('selectionchange',schedule);document.removeEventListener('keyup',schedule);};
 },[blocked,onLookup]);
}
