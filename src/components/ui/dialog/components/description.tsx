import { type ReactNode } from 'react';

type DescriptionProps = {
  children: string | ReactNode;
};

export function Description({ children }: DescriptionProps) {
  return typeof children === 'string' ? <p>{children}</p> : children;
}
