const iconBase = {
    size: {
      sm: { height: "3.2rem", width: "3.2rem" },
      md: { height: "4.0rem", width: "4.0rem" },
      lg: { height: "4.8rem", width: "4.8rem" },
    },
    state: {
      disabledOpacity: 0,
    },
  } as const;

  
export const iconTokens = {
    base: iconBase
  } as const;