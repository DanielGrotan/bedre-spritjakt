import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function changeDecimalSymbol(number: number) {
  return number.toString().replace(".", ",");
}
