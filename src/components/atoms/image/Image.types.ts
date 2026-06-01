export type ImageObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";
export type ImageLoading = "eager" | "lazy";

export type ImageStyleConfig = {
    backgroundColor?: string;
    backgroudColor?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    padding?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
    objectFit?: ImageObjectFit;
    objectPosition?: string;
    display?: "inline" | "block" | "inline-block" | "flex" | "inline-flex";
};

export type ImageProps = {
    src: string;
    alt: string;
    width?: string;
    height?: string;
    className?: string;
    loading?: ImageLoading;
    decode?: "sync" | "async" | "auto";
    isSvg?: boolean;
    onClick?: () => void;
    styleConfig?: ImageStyleConfig;
};
