import Image from "next/image";
import Link from "next/link";


const MyIcon = () => {
  return (
    <div className={`w-[60px] h-[60px]`}>
      <Link href={`/`}>
        <Image
          src="/music-streaming-icon.webp"
          alt="Music streaming icon"
          width={60}
          height={60}
          quality={100}
        />
      </Link>
    </div>
  );
};

export default MyIcon;
