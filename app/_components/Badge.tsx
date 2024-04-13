import cn from "classnames";
import { ComponentPropsWithoutRef } from "react";

export type Colors =
  | "gray"
  | "purple"
  | "orange"
  | "green"
  | "red"
  | "blue"
  | "primary";

const Color = {
  gray: "text-gray-600 bg-gray-100",
  purple: "text-purple-600 bg-purple-100",
  orange: "text-yellow-600 bg-yellow-100",
  green: "text-green-600 bg-green-100",
  red: "text-red-600 bg-red-100",
  blue: "text-blue-600 bg-blue-100",
  primary: "text-primary-600 bg-primary-100",
};

interface Props extends ComponentPropsWithoutRef<"span"> {
  color?: Colors;
  rounded?: boolean;
  size?: "small" | "base";
  icon?: {
    Component: React.ComponentType<any>;
    type: "trail" | "lead";
  };
}

const Badge = ({
  children,
  className,
  color = "gray",
  rounded = false,
  size = "small",
  icon,
  ...props
}: Props) => (
  <span
    className={cn(
      "font-medium inline-flex items-center justify-center",
      Color[color],
      className,
      {
        "rounded-full p-3": rounded,
        "rounded-md py-1 px-2": !rounded,
        "text-xs": size === "small",
        "text-base": size === "base",
      }
    )}
    {...props}
  >
    {icon?.type === "trail" && <icon.Component className="ml-2" />}
    {children}
    {icon?.type === "lead" && <icon.Component className="mr-2" />}
  </span>
);

export default Badge;
