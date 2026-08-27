export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-md bg-[#d94f82] text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-5 fill-none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V11" /><path d="M12 14c-3.8 0-6-2-6-5.5 3.8 0 6 2 6 5.5Z" /><path d="M12 11c0-3.8 2.2-6 6-6 0 3.8-2.2 6-6 6Z" /><path d="M7 20h10" />
        </svg>
      </div>
      <div>
        <p className="text-[17px] font-semibold tracking-[-0.05em] text-[#1f2f24]">BLOOM:IN</p>
        <p className="text-[9px] font-bold tracking-[0.13em] text-rose-700">CIRCULAR FLOWER FARM</p>
      </div>
    </div>
  )
}
