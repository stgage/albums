import Image from "next/image";

type Props = {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
};

export function UserAvatar({ name, image, size = 32, className = "" }: Props) {
  const initial = name?.[0]?.toUpperCase() ?? "?";

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initial}
    </div>
  );
}
