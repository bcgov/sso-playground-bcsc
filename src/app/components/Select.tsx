"use client";
import { Select as MuiSelect, SelectProps } from "@mui/material";

const MenuProps: SelectProps["MenuProps"] = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  marginThreshold: 0,
};

export const Select = (props: SelectProps) => {
  return <MuiSelect variant="filled" MenuProps={MenuProps} {...props} />;
};
