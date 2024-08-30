import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full flex items-center">
      <Link href="/">
          <Image
            src="/music-streaming-icon.webp"
            width={60}
            height={60}
            layout="intrinsic"
            priority
            quality={100}
          />
      </Link>
    </header>
  );
};

export default Header;
