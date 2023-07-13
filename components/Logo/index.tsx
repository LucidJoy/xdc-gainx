import Link from "next/link";
import Image from "../Image";
import cn from "classnames";
import styles from "./Logo.module.sass";

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => (
  <Link href='/'>
    <div className={cn(styles.logo, className)}>
      <div
        style={{
          position: "absolute",
          left: "25px",
          top: "9px",
        }}
      >
        <Image src='/images/triangles.svg' width='100' height='50' alt='logo' />
      </div>
      <Image
        src='/images/logo.svg'
        width='150'
        height='70'
        alt='logo'
        style={{ opacity: "0.5", marginTop: "30px" }}
      />
    </div>
  </Link>
);

export default Logo;
