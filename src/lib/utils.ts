import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOptimizedImageUrl(url: string, width: number = 400, height: number = 400) {
  if (!url || !url.includes("/upload/")) return url;

  const [base, ...rest] = url.split("/upload/");
  const path = rest.join("/upload/"); // In case there are multiple /upload/ for some reason, though unlikely for Cloudinary

  return `${base}/upload/c_fill,h_${height},w_${width},f_auto,q_auto/${path}`;
}
