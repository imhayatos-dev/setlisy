type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({
  compact = false,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`brandLogo ${compact ? "brandLogoCompact" : ""} ${className}`}>
      <img
        className="brandLogoMark"
        src="/brand/setlisy-mark.svg"
        alt=""
        aria-hidden="true"
      />

      {!compact && (
        <div className="brandLogoText">
          <strong>Setlisy</strong>
          <span>ライブ準備を、もっと簡単に。</span>
        </div>
      )}
    </div>
  );
}
