import { forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";

const Input = forwardRef(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hintId = helperText ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="form-group">
        {label && <label htmlFor={inputId} className="form-label">{label}</label>}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={twMerge(
            "form-input",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500",
            className
          )}
          {...props}
        />
        {helperText && (
          <p id={hintId} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="form-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input; 