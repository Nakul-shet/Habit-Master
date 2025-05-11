import { cn } from "@/lib/utils"

type BadgeRank =
  | "bronze3"
  | "bronze2"
  | "bronze1"
  | "silver3"
  | "silver2"
  | "silver1"
  | "gold3"
  | "gold2"
  | "gold1"
  | "diamond"
  | "platinum"
  | "ruby"

interface BadgeIconProps {
  rank: BadgeRank
  size?: number
  className?: string
}

export function BadgeIcon({ rank, size = 40, className }: BadgeIconProps) {
  const colors = {
    bronze3: { primary: "#CD7F32", secondary: "#A05A2C" },
    bronze2: { primary: "#CD7F32", secondary: "#A05A2C" },
    bronze1: { primary: "#CD7F32", secondary: "#A05A2C" },
    silver3: { primary: "#C0C0C0", secondary: "#A8A8A8" },
    silver2: { primary: "#C0C0C0", secondary: "#A8A8A8" },
    silver1: { primary: "#C0C0C0", secondary: "#A8A8A8" },
    gold3: { primary: "#FFD700", secondary: "#DAA520" },
    gold2: { primary: "#FFD700", secondary: "#DAA520" },
    gold1: { primary: "#FFD700", secondary: "#DAA520" },
    diamond: { primary: "#B9F2FF", secondary: "#89CFF0" },
    platinum: { primary: "#E5E4E2", secondary: "#C0C0C0" },
    ruby: { primary: "#E0115F", secondary: "#B0022E" },
  }

  const { primary, secondary } = colors[rank]

  const renderNumber = () => {
    if (rank.includes("3")) return "3"
    if (rank.includes("2")) return "2"
    if (rank.includes("1")) return "1"
    return ""
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      {/* Base Badge Shape */}
      <path d="M50 5L87.5 25V75L50 95L12.5 75V25L50 5Z" fill={primary} stroke={secondary} strokeWidth="2" />

      {/* Inner Accent */}
      <path d="M50 15L77.5 30V70L50 85L22.5 70V30L50 15Z" fill={secondary} stroke={primary} strokeWidth="1" />

      {/* Center Circle */}
      <circle cx="50" cy="50" r="20" fill={primary} stroke={secondary} strokeWidth="2" />

      {/* Badge Type Icon */}
      {rank.startsWith("bronze") && <path d="M40 40H60V60H40V40Z" fill={secondary} stroke={primary} strokeWidth="1" />}

      {rank.startsWith("silver") && <circle cx="50" cy="50" r="10" fill={secondary} stroke={primary} strokeWidth="1" />}

      {rank.startsWith("gold") && (
        <path
          d="M50 40L55 50L65 52L58 60L60 70L50 65L40 70L42 60L35 52L45 50L50 40Z"
          fill={secondary}
          stroke={primary}
          strokeWidth="1"
        />
      )}

      {rank === "diamond" && (
        <path d="M50 35L65 50L50 65L35 50L50 35Z" fill={secondary} stroke={primary} strokeWidth="1" />
      )}

      {rank === "platinum" && (
        <path d="M35 40H65V60H35V40Z M40 45V55H60V45H40Z" fill={secondary} stroke={primary} strokeWidth="1" />
      )}

      {rank === "ruby" && (
        <path
          d="M50 35L60 45H40L50 35Z M40 45V55L50 65L60 55V45H40Z"
          fill={secondary}
          stroke={primary}
          strokeWidth="1"
        />
      )}

      {/* Rank Number (for bronze/silver/gold) */}
      {renderNumber() && (
        <text
          x="50"
          y="75"
          textAnchor="middle"
          fill={primary}
          fontWeight="bold"
          fontSize="20"
          stroke={secondary}
          strokeWidth="0.5"
        >
          {renderNumber()}
        </text>
      )}
    </svg>
  )
}
