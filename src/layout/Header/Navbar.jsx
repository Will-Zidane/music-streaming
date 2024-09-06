import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <header className="w-full flex pl-2 items-center">
      <Link href="/public">
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

export default Navbar;
