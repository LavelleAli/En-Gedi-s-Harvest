// A link that looks like a button: for going somewhere (a button is for doing something here).
//   <ButtonLink href="/shop/">Browse the shop</ButtonLink>
import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClass, type ButtonVariant } from "./buttonStyle";

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export default function ButtonLink({ variant, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, false, className)} {...rest} />;
}
