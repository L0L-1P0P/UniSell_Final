import Link from "next/link"

interface CategoryCardProps {
  name: string
  count?: number
  icon?: React.ReactNode
  shortName: string
  color: string
}

export function CategoryCard({ name, count, icon, shortName, color }: CategoryCardProps) {
  // High-Contrast Light / Neon Dark Color Map
  const colorStyles: Record<string, string> = {
    // Electronics (Blue)
    // Light: Deep Royal Blue | Dark: Neon Baby Blue
    blue: "text-[#005bb5] group-hover:border-[#005bb5] group-hover:shadow-[0_0_20px_#005bb5]/50 dark:text-[#A2D2FF] dark:group-hover:border-[#A2D2FF] dark:group-hover:shadow-[0_0_20px_#A2D2FF]/40 shadow-[0px_12px_10px_-10px_#005bb5]/50 dark:shadow-[0px_12px_10px_-10px_#A2D2FF]",
    
    // Fashion (Pink)
    // Light: Deep Rose | Dark: Pastel Pink
    pink: "text-[#d6336c] group-hover:border-[#d6336c] group-hover:shadow-[0_0_20px_#d6336c]/50 dark:text-[#FFB7B2] dark:group-hover:border-[#FFB7B2] dark:group-hover:shadow-[0_0_20px_#FFB7B2]/40 shadow-[0px_12px_10px_-10px_#d6336c]/50 dark:shadow-[0px_12px_10px_-10px_#FFB7B2]",
    
    // Furniture (Orange/Amber)
    // Light: Burnt Orange | Dark: Peach
    amber: "text-[#d97706] group-hover:border-[#d97706] group-hover:shadow-[0_0_20px_#d97706]/50 dark:text-[#FBC78F] dark:group-hover:border-[#FBC78F] dark:group-hover:shadow-[0_0_20px_#FBC78F]/40 shadow-[0px_12px_10px_-10px_#d97706]/50 dark:shadow-[0px_12px_10px_-10px_#FBC78F]",
    
    // Books (Green)
    // Light: Forest Green | Dark: Mint
    emerald: "text-[#059669] group-hover:border-[#059669] group-hover:shadow-[0_0_20px_#059669]/50 dark:text-[#B0F2C2] dark:group-hover:border-[#B0F2C2] dark:group-hover:shadow-[0_0_20px_#B0F2C2]/40 shadow-[0px_12px_10px_-10px_#059669]/50 dark:shadow-[0px_12px_10px_-10px_#B0F2C2]",
    
    // Room Rental (Purple)
    // Light: Deep Violet | Dark: Lavender
    violet: "text-[#703aed] group-hover:border-[#703aed] group-hover:shadow-[0_0_20px_#703aed]/50 dark:text-[#E0BBE4] dark:group-hover:border-[#E0BBE4] dark:group-hover:shadow-[0_0_20px_#E0BBE4]/40 shadow-[0px_12px_10px_-10px_#703aed]/50 dark:shadow-[0px_12px_10px_-10px_#E0BBE4]",
    
    // Vehicles (Yellow/Gold)
    // Light: Dark Gold (Readable) | Dark: Lemon Yellow
    red: "text-[#F6BE00] group-hover:border-[#F6BE00] group-hover:shadow-[0_0_20px_#F6BE00]/50 dark:text-[#FDFD96] dark:group-hover:border-[#FDFD96] dark:group-hover:shadow-[0_0_20px_#FDFD96]/40 shadow-[0px_12px_10px_-10px_#F6BE00]/50 dark:shadow-[0px_12px_10px_-10px_#FDFD96]",
    
    // Others (Teal)
    // Light: Deep Teal | Dark: Aqua
    zinc: "text-[#0d9488] group-hover:border-[#0d9488] group-hover:shadow-[0_0_20px_#0d9488]/50 dark:text-[#99E1D9] dark:group-hover:border-[#99E1D9] dark:group-hover:shadow-[0_0_20px_#99E1D9]/40 shadow-[0px_12px_10px_-10px_#0d9488]/50 dark:shadow-[0px_12px_10px_-10px_#99E1D9]",
  }

  const accentClass = colorStyles[color] || colorStyles.zinc

  return (
    <Link href={`/search?category=${encodeURIComponent(name)}`} className="block shrink-0 snap-start group">
      <div className={`
        /* STANDARD CARD BASE */
        glass-card
        aspect-square w-22 sm:w-36 md:w-48 shrink-0 
        flex flex-col items-center justify-center p-2 sm:p-4 text-center 
        border-2 border-transparent 
        transition-all duration-300 ease-out
        hover:-translate-y-1
        
        /* DYNAMIC ACCENTS */
        ${accentClass}
      `}>
        {/* Icon (Inherits text color from accentClass) */}
        <div className="mb-2 sm:mb-3 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 text-current">
          {icon}
        </div>

        {/* Text (Inherits text color) */}
        <span className="block sm:hidden text-[10px] font-[TitleFont] tracking-wide leading-tight w-full wrap-break-word">
          {shortName}
        </span>
        <span className="hidden sm:block text-xs md:text-sm font-[TitleFont] tracking-wide leading-tight w-full wrap-break-word">
          {name}
        </span>
       
        {/* Count (Restored) */}
        {count !== undefined && (
          <span className="hidden sm:block text-[10px] md:text-xs opacity-70 mt-1 font-[TitleFont] tracking-wide">
            {count} items
          </span>
        )}
      </div>
    </Link>
  )
}
