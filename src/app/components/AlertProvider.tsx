"use client";
import { Box, Snackbar, SnackbarOrigin } from "@mui/material";
import { createContext, useState } from "react";

interface AlertProviderProps {
  children: React.ReactNode;
}

interface State extends SnackbarOrigin {
  open: boolean;
}

export interface AlertContext {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const AlertContext = createContext<AlertContext>({
  error: "",
  setError: () => {},
});

export const AlertProvider = (props: AlertProviderProps) => {
  const [error, setError] = useState("");
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;

  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({ ...newState, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
    setError("");
  };
  return (
    <AlertContext.Provider value={{ error, setError }}>
      {error && (
        <Box sx={{ width: 500 }}>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            message={error}
            autoHideDuration={5000}
          />
        </Box>
      )}

      {props.children}
    </AlertContext.Provider>
  );
};
