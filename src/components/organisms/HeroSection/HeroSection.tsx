import React from "react";
import styles from "./HeroSection.module.css";
import type { HeroSectionProps } from "./HeroSection.types";
import { Text } from "../../atoms/text";
import { Image } from "../../atoms/image";
import { Button } from "../../atoms/button";
import { getFoundationByTheme } from "../../../shared/styles/tokens";

export function HeroSection({
    theme = "dark",
    badgeText,
    title,
    highlightTitle,
    description,
    previewImage,
    primaryAction,
    secondaryAction,
    styles: stylesConfig,
    textStyles,
}: HeroSectionProps) {
    const foundation = getFoundationByTheme(theme);
    const defaultBackground = theme === "dark"
        ? "radial-gradient(circle at 10% 10%, rgba(27, 243, 214, 0.12) 0%, transparent 34%), linear-gradient(122deg, #020b21 0%, #03132f 48%, #0a1630 100%)"
        : "radial-gradient(circle at 12% 8%, rgba(18, 216, 181, 0.14) 0%, transparent 34%), linear-gradient(120deg, #f8fbff 0%, #eef5ff 52%, #e8f2ff 100%)";

    const containerStyle: React.CSSProperties = {
        background: stylesConfig?.containerBackground ?? defaultBackground,
    };

    const innerStyle: React.CSSProperties = {
        maxWidth: stylesConfig?.contentMaxWidth ?? "min(100%, var(--app-max-width))",
        padding: stylesConfig?.sectionPadding ?? "2.4rem 1.6rem 3.6rem",
        gap: stylesConfig?.contentGap ?? "2.4rem",
    };

    const contentStyle: React.CSSProperties = {
        gap: stylesConfig?.titleGap ?? "1.2rem",
    };

    const actionsStyle: React.CSSProperties = {
        gap: stylesConfig?.actionGap ?? "1.2rem",
    };

    return (
        <section className={styles.heroSection} style={containerStyle}>
            <div className={styles.heroInner} style={innerStyle}>
                <div className={styles.content} style={contentStyle}>
                    <Text
                        as="p"
                        label={badgeText}
                        theme={theme}
                        variant="goldBadge"
                        size="xs"
                        styleConfig={textStyles?.badge}
                    />
                    <div className={styles.titleBlock}>
                        <Text
                            as="h1"
                            label={title}
                            theme={theme}
                            variant="heroTitle"
                            size="hero"
                            styleConfig={{
                                maxWidth: "72rem",
                                textColor: foundation.colors.text.primary,
                                ...textStyles?.title,
                            }}
                        />
                        {highlightTitle && (
                            <Text
                                as="h2"
                                label={highlightTitle}
                                theme={theme}
                                variant="heroHighlight"
                                size="hero"
                                styleConfig={{
                                    maxWidth: "72rem",
                                    textColor: foundation.colors.brand.primary,
                                    ...textStyles?.titleHighlight,
                                }}
                            />
                        )}
                    </div>
                    <Text
                        as="p"
                        label={description}
                        theme={theme}
                        variant="heroDescription"
                        size="md"
                        styleConfig={{
                            maxWidth: "59rem",
                            lineHeight: "1.6",
                            textColor: foundation.colors.text.secondary,
                            ...textStyles?.description,
                        }}
                    />
                    {(primaryAction || secondaryAction) && (
                        <div className={styles.actions} style={actionsStyle}>
                            {primaryAction && <Button {...primaryAction} theme={primaryAction.theme ?? theme} />}
                            {secondaryAction && <Button {...secondaryAction} theme={secondaryAction.theme ?? theme} />}
                        </div>
                    )}
                </div>

                <div className={styles.imageWrap}>
                    <Image
                        {...previewImage}
                        styleConfig={{
                            width: "100%",
                            maxWidth: "74rem",
                            ...previewImage.styleConfig,
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
