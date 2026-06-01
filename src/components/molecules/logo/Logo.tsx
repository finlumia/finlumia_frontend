"use client";

import type { LogoProps } from "./Logo.types";
import styles from "./Logo.module.css";
import { Text } from "../../atoms/text";
import { Icon } from "../../atoms/icon";
import { useTheme } from "../../../shared/styles/theme.context";

export function Logo({
    text,
    icon,
    onClick,
    styleLogo,
}: LogoProps) {
    const { theme, toggleTheme } = useTheme();
    const handleIconClick = () => {
        toggleTheme();
        icon?.onClick?.();
    };

    return (
        <div className={styles.logo} onClick={onClick} style={styleLogo}>
            <Icon
                {...icon}
                theme={theme}
                lampEffect
                isOn={theme === "light"}
                onClick={handleIconClick}
            />
            {text && <Text {...text} theme={text.theme ?? theme} />}
        </div>
    )
}