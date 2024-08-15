import Link from "next/link";
import React, {
  ComponentProps,
  ComponentPropsWithoutRef,
  forwardRef,
} from "react";
import cn from "classnames";
import Spinner from "./Spinner";

const NormalTheme = {
  primary: "hover:bg-primary-700 bg-primary text-white fill-white",
  secondary:
    "bg-white/10 text-gray-900 border border-gray-300 hover:bg-white/30 fill-gray-900",
  red: "hover:bg-red-700 bg-red-600 text-white fill-white",
};

const SoftTheme = {
  primary:
    "hover:bg-primary-100 bg-primary-50 text-primary-600 fill-primary-600",
  secondary: "hover:bg-black/20 bg-black/10 text-black fill-black",
  red: "hover:bg-red-200 bg-red-100 text-red-600 fill-red-600",
};

type Color = keyof typeof NormalTheme;

interface BaseProps {
  color?: Color;
  soft?: boolean;
  small?: boolean;
  rounded?: boolean;
  isLoading?: boolean;
  icon?: {
    Component: React.ComponentType<any>;
    type: "trail" | "lead";
  };
}

interface LinkProps
  extends Omit<ComponentProps<typeof Link>, "color">,
    BaseProps {}
export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "color">,
    BaseProps {}
type Href = LinkProps["href"];
type Props<T extends Href | undefined> = T extends Href
  ? LinkProps
  : ButtonProps;

const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  Props<Href | undefined>
>(
  (
    {
      icon,
      rounded,
      children,
      className,
      isLoading,
      soft = false,
      small = false,
      color = "primary",
      ...props
    },
    ref
  ) => {
    const classNames = cn(
      className,
      "inline-flex justify-center text-base items-center disabled:opacity-75 disabled:pointer-events-none font-bold space-x-2",
      {
        [SoftTheme[color]]: soft,
        [NormalTheme[color]]: !soft,
        "py-2.5": !small,
        "py-1 text-xs": small,
        "rounded-md": !rounded,
        "rounded-full": rounded,
        "px-3.5": !small && !rounded,
        "px-2.5": !small && rounded,
        "px-2": small && !rounded,
        "px-1": small && rounded,
      }
    );

    const childrenAndLoading = (
      <>
        {isLoading ? (
          <Spinner className="text-inherit mr-2 w-6 h-6" />
        ) : (
          icon?.type === "trail" && <icon.Component className="ml-2 w-6 h-6" />
        )}
        <span>{children}</span>
        {icon?.type === "lead" && !isLoading && (
          <icon.Component className="mr-2 w-6 h-6" />
        )}
      </>
    );

    if ("href" in props) {
      return (
        <Link
          className={classNames}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as LinkProps)}
        >
          {childrenAndLoading}
        </Link>
      );
    }

    return (
      <button
        className={classNames}
        disabled={isLoading}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(props as ButtonProps)}
      >
        {childrenAndLoading}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
