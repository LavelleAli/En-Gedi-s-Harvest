// A button, in one of the site's looks (see buttonStyle.ts for the variants).
//   <Button onClick={save}>Save</Button>
//   <Button variant="primary" type="submit" wide>Sign in</Button>
import type { ButtonHTMLAttributes } from "react";
import { buttonClass, type ButtonVariant } from "./buttonStyle";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  wide?: boolean; // fill the width of its container
};

// type defaults to "button", so a button inside a form never submits it by accident.
export default function Button({ variant, wide, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, wide, className)} {...rest} />;
}
