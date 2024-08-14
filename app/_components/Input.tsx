import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FormEvent,
  forwardRef,
} from "react";
import cn from "classnames";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  star?: boolean;
  outlined?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { star, label, outlined = false, onChange, ...props },
  ref
) {
  const onInvalid = (e: FormEvent<HTMLInputElement>) => {
    const label = e.currentTarget.labels![0];
    label.scrollIntoView();
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
  };

  return (
    <label className="flex flex-col-reverse text-gray-900">
      <input
        {...{ ...props, onInvalid, ref }}
        className={cn(
          {
            "px-3 mt-2 ring-1 rounded-md ring-gray-300 focus:ring-primary focus:ring-2":
              outlined,
            "border border-t-0 border-x-0 border-gray-300 focus:border-b-2 focus:border-primary":
              !outlined,
          },
          "py-1.5 box-border h-9 outline-none"
        )}
        onChange={handleChange}
      />
      <div className="text-sm font-medium leading-6 text-gray-900">
        {label} {star && <span className="text-primary">*</span>}
      </div>
    </label>
  );
});

export default Input;
