import type { HeaderItem, HeaderProps } from "./Header.type";
import React from "react";
import { Icon } from "../../atoms/icon";
import { Text } from "../../atoms/text";
import { Logo } from "../../molecules/logo";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { Button } from "../../atoms/button";

/**
 * Organism-level Header component.
 *
 * Render order priority:
 * 1) Sectioned API (`leftItems`, `centerItems`, `rightItems`)
 * 2) Flat API (`items`)
 * 3) Legacy API (`logo`, `text`, `icon`, `buttons`)
 *
 * This keeps backward compatibility while enabling a more predictable
 * 3-zone layout used by the final landing header.
 */
export function Header({
    items,
    leftItems,
    centerItems,
    rightItems,
    text,
    icon,
    logo,
    theme = "light",
    buttons,
    styleHeader,
}: HeaderProps) {
    const foundation = getFoundationByTheme(theme);
    // Converts semantic alignment used in props into flex align-items values.
    const resolveAlign = (value?: "left" | "center" | "right"): React.CSSProperties["alignItems"] => {
        if (value === "left") return "flex-start";
        if (value === "right") return "flex-end";
        return "center";
    };

    // Renders one HeaderItem based on its discriminated `type`.
    const renderItem = (item: HeaderItem, index: number) => {
        const elementKey = item.key ?? `${item.type}-${index}`;

        if (item.type === "logo") {
            return <Logo key={elementKey} {...item.props} />;
        }
        if (item.type === "text") {
            return <Text key={elementKey} {...item.props} />;
        }
        if (item.type === "button") {
            return <Button key={elementKey} {...item.props} />;
        }
        return <Icon key={elementKey} {...item.props} />;
    };

    const renderFromItems = items?.map((item, index) => renderItem(item, index));
    const renderLeftItems = leftItems?.map((item, index) => renderItem(item, index));
    const renderCenterItems = centerItems?.map((item, index) => renderItem(item, index));
    const renderRightItems = rightItems?.map((item, index) => renderItem(item, index));

    const hasSectionedItems = Boolean(
        (renderLeftItems && renderLeftItems.length > 0)
        || (renderCenterItems && renderCenterItems.length > 0)
        || (renderRightItems && renderRightItems.length > 0),
    );

    const renderFromLegacyProps = (
        <>
            {logo && <Logo {...logo} />}
            {text && <Text {...text} />}
            {icon && <Icon {...icon} />}
            {buttons && buttons.map((button, index) => <Button key={index} {...button} />)}
        </>
    );

    const headerStyle: React.CSSProperties = {
        backgroundColor: styleHeader?.backgroundColor ?? styleHeader?.backgroudColor ?? foundation.colors.bg.surface,
        width: "100%",
        visibility: styleHeader?.visibility ?? "visible",
    };

    const innerStyle: React.CSSProperties = {
        width: "min(100%, var(--app-max-width))",
        margin: "0 auto",
        display: styleHeader?.display ?? "flex",
        flexDirection: styleHeader?.flexDirection ?? "row",
        padding: styleHeader?.padding ?? "0 1.6rem",
        gap: styleHeader?.gap ?? "1.2rem",
        alignItems: resolveAlign(styleHeader?.align),
        justifyContent: styleHeader?.justifyContent ?? "space-between",
    };

    const groupStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: styleHeader?.gap ?? "1.2rem",
    };

    const centerGroupStyle: React.CSSProperties = {
        ...groupStyle,
        gap: styleHeader?.centerGap ?? "2.4rem",
        flexWrap: "wrap",
        justifyContent: "center",
    };

    const rightGroupStyle: React.CSSProperties = {
        ...groupStyle,
        gap: styleHeader?.rightGap ?? "1.2rem",
    };

    return (
        <header style={headerStyle}>
            <div style={innerStyle}>
                {hasSectionedItems ? (
                    <>
                        <div style={groupStyle}>{renderLeftItems}</div>
                        <div style={centerGroupStyle}>{renderCenterItems}</div>
                        <div style={rightGroupStyle}>{renderRightItems}</div>
                    </>
                ) : (renderFromItems && renderFromItems.length > 0 ? renderFromItems : renderFromLegacyProps)}
            </div>
        </header>
    )
}