import { Link } from "react-router-dom";

interface LogoProps {
  type?: boolean;
}

const Logo: React.FC<LogoProps> = ({ type }) => {
  return (
    <div>
      <Link
        to="/"
        className={`text-2xl font-semibold dark:text-white ${
          type ? "text-white text-4xl" : ""
        }`}
      >
        Blog
        <span
          className={`text-3xl text-rose-500 ${type ? "text-5xl font-bold" : ""}`}
        >
          Wave
        </span>
      </Link>
    </div>
  );
};

export default Logo;
