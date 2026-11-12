import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import type {ReactNode} from 'react';
export default function FoodDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=overflow;dialog.close();};},[]);
 return <dialog className="food-dialog" ref={ref} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}><div className="section-head"><h2>{title}</h2><button className="icon-btn" aria-label="Закрыть окно" onClick={onClose}><X/></button></div>{children}</dialog>;
}
