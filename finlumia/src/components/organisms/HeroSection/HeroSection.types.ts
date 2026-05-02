import type { ThemeMode } from "../../../shared/styles/theme.types";
import type { ButtonProps } from "../../atoms/button";
import type { ImageProps } from "../../atoms/image";
import type { TextStyleConfig } from "../../atoms/text";

export type HeroSectionProps = {
    theme?: ThemeMode;
    badgeText: string;
    title: string;
    highlightTitle?: string;
    description: string;
    previewImage: ImageProps;
    primaryAction?: ButtonProps;
    secondaryAction?: ButtonProps;
    styles?: {
        containerBackground?: string;
        contentMaxWidth?: string;
        sectionPadding?: string;
        contentGap?: string;
        titleGap?: string;
        actionGap?: string;
    };
    textStyles?: {
        badge?: TextStyleConfig;
        title?: TextStyleConfig;
        titleHighlight?: TextStyleConfig;
        description?: TextStyleConfig;
    };
};
