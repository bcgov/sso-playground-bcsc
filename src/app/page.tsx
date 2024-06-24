"use client";
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import { MultiSelect } from "./components/MultiSelect";
import { TextField } from "./components/TextField";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthService from "./services/authorization";
import TokenData from "./components/TokenData";
import { AlertContext } from "./components/AlertProvider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { InputLabel } from "./components/InputLabel";
import { Select } from "./components/Select";
import { SelectMenuItem } from "./components/SelectMenuItem";

interface Tokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
}

interface FormValues {
  clientId: { value: string; error: boolean; errorMessage: string };
  clientSecret: { value: string; error: boolean; errorMessage: string };
  discoveryUrl: {
    value: string;
    error: boolean;
    errorMessage: string;
  };
  authorizationUrl: {
    value: string;
    error: boolean;
    errorMessage: string;
  };
  forwardQueryParams: { value: string; error: boolean; errorMessage: string };
  tokenUrl: { value: string; error: boolean; errorMessage: string };
  logoutUrl: { value: string; error: boolean; errorMessage: string };
  redirectUri: { value: string; error: boolean; errorMessage: string };
  scopes: { value: string[]; error: boolean; errorMessage: string };
  username: { value: string; error: boolean; errorMessage: string };
  password: { value: string; error: boolean; errorMessage: string };
}

const initialFormValues: FormValues = {
  clientId: {
    value: "",
    error: false,
    errorMessage: "Client ID is required",
  },
  clientSecret: {
    value: "",
    error: false,
    errorMessage: "",
  },
  discoveryUrl: {
    value: "",
    error: false,
    errorMessage: "",
  },
  authorizationUrl: {
    value: "",
    error: false,
    errorMessage: "Please enter a valid authorization URL",
  },
  forwardQueryParams: {
    value: "",
    error: false,
    errorMessage: "",
  },
  tokenUrl: {
    value: "",
    error: false,
    errorMessage: "Please enter a valid token URL",
  },
  logoutUrl: {
    value: "",
    error: false,
    errorMessage: "",
  },
  redirectUri: {
    value: "http://localhost:3000",
    error: false,
    errorMessage: "",
  },
  scopes: {
    value: ["openid"],
    error: false,
    errorMessage: "Please pass atleast one scope",
  },
  username: {
    value: "",
    error: false,
    errorMessage: "Username is required",
  },
  password: {
    value: "",
    error: false,
    errorMessage: "Password is required",
  },
};

export default function Form() {
  const [flowType, setFlowType] = useState("authorization-code");
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  const [authenticated, setAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<Tokens>({
    access_token: "",
    id_token: "",
    refresh_token: "",
  });
  const [validDiscoveryUrl, setValidDiscoveryUrl] = useState(false);
  let validatedFormFields = ["clientId"];

  if (flowType === "password") {
    validatedFormFields = ["clientId", "tokenUrl", "username", "password"];
  } else validatedFormFields = ["authorizationUrl", "clientId", "tokenUrl"];

  const { error, setError } = useContext<AlertContext>(AlertContext);
  const authService = useMemo(
    () =>
      new AuthService({
        authorizationEndpoint: formValues.authorizationUrl.value,
        tokenEndpoint: formValues.tokenUrl.value,
        logoutEndpoint: formValues.logoutUrl.value,
        clientId: formValues.clientId.value,
        clientSecret: formValues.clientSecret.value,
        redirectUri: formValues.redirectUri.value,
        scopes: formValues.scopes.value,
        username: formValues.username.value,
        password: formValues.password.value,
        forwardQueryParams: formValues.forwardQueryParams.value,
      }),
    [
      formValues.authorizationUrl.value,
      formValues.tokenUrl.value,
      formValues.logoutUrl.value,
      formValues.clientId.value,
      formValues.clientSecret.value,
      formValues.redirectUri.value,
      formValues.scopes.value,
      formValues.username.value,
      formValues.password.value,
      formValues.forwardQueryParams.value,
    ]
  );

  const handleAuthCallback = useCallback(async () => {
    await authService.handleCallback();
    setAuthenticated(authService.isAuthenticated());
    if (sessionStorage.getItem("tokens"))
      setTokens(JSON.parse(sessionStorage.getItem("tokens") || ""));
  }, [authService]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem("formValues")
    ) {
      setFormValues(
        JSON.parse(window.localStorage.getItem("formValues") || "")
      );
    }
  }, []);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  useEffect(() => {
    populateUrls(formValues.discoveryUrl.value);
  }, [formValues.discoveryUrl.value]);

  const handleLogin = async () => {
    try {
      await authService.login(flowType);
    } catch (err: any) {
      setError(err?.message || err);
      console.error("testoig", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const setScopes = (scopes: string[]) => {
    setFormValues({
      ...formValues,
      scopes: {
        value: scopes,
        error: false,
        errorMessage: "",
      },
    });
  };

  const populateUrls = async (discoveryUrl: string) => {
    if (discoveryUrl) {
      try {
        const url = new URL(discoveryUrl);
        setFormValues({
          ...formValues,
          discoveryUrl: {
            value: discoveryUrl,
            error: false,
            errorMessage: "",
          },
        });
        const res = await fetch(discoveryUrl);
        if (res.status === 200) {
          setValidDiscoveryUrl(true);
          const data = await res.json();
          if (data.authorization_endpoint)
            setFormValues({
              ...formValues,
              authorizationUrl: {
                ...formValues["authorizationUrl"],
                value: data.authorization_endpoint || "",
                error: false,
              },
              tokenUrl: {
                ...formValues["tokenUrl"],
                value: data.token_endpoint || "",
                error: false,
              },
              logoutUrl: {
                ...formValues["logoutUrl"],
                value: data.end_session_endpoint || "",
                error: false,
              },
            });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name as keyof FormValues],
        value,
        error: value.trim() === "" ? true : false,
      },
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let formErrors = false;
    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField as keyof FormValues].value;

      if (currentValue === "") {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...formValues[currentField as keyof FormValues],
            error: true,
          },
        };
        if (validatedFormFields.includes(currentField)) formErrors = true;
      }
    }

    setFormValues(newFormValues);
    localStorage.setItem("formValues", JSON.stringify(newFormValues));

    if (!formErrors) {
      handleLogin();
    }
  };

  return (
    <>
      <Grid container sx={{ flexGrow: 1, padding: 0.5 }} spacing={0.5}>
        <Grid item xs={12} md={authenticated ? 6 : 12}>
          <Typography variant="h5" sx={{ padding: 2, color: "primary.main" }}>
            OpenID-Connect
          </Typography>
          <form noValidate onSubmit={handleSubmit}>
            <div style={{ padding: 5 }}>
              <FormControl fullWidth>
                <InputLabel>Flow Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={flowType}
                  label="Flow Type"
                  onChange={(e: any) => setFlowType(e.target.value)}
                  name="flowType"
                  required
                >
                  <SelectMenuItem value={"authorization-code"}>
                    Authorization Code
                  </SelectMenuItem>
                  <SelectMenuItem value={"service-account"}>
                    Service Account
                  </SelectMenuItem>
                  <SelectMenuItem value={"password"}>Password</SelectMenuItem>
                </Select>
              </FormControl>
            </div>

            <Box
              sx={{
                textAlign: "center",
                height: "100vh",
              }}
            >
              <TextField
                name="discoveryUrl"
                label="Discovery URL"
                onChange={(e) => handleChange(e)}
                value={formValues.discoveryUrl.value}
                InputProps={{
                  endAdornment: validDiscoveryUrl && (
                    <CheckCircleIcon color="success" />
                  ),
                }}
              />

              {flowType === "authorization-code" && (
                <>
                  <TextField
                    name="authorizationUrl"
                    label="Authorization URL"
                    onChange={(e) => handleChange(e)}
                    value={formValues.authorizationUrl.value}
                    required
                    error={formValues.authorizationUrl.error}
                    helperText={
                      formValues.authorizationUrl.error &&
                      formValues.authorizationUrl.errorMessage
                    }
                  />
                  <TextField
                    name="forwardQueryParams"
                    label="Forward Query Params"
                    onChange={(e) => handleChange(e)}
                    value={formValues.forwardQueryParams.value}
                  />
                </>
              )}

              <TextField
                name="tokenUrl"
                label="Token URL"
                onChange={(e) => handleChange(e)}
                value={formValues.tokenUrl.value}
                error={formValues.tokenUrl.error}
                helperText={
                  formValues.tokenUrl.error && formValues.tokenUrl.errorMessage
                }
                required
              />

              {flowType === "authorization-code" && (
                <TextField
                  name="logoutUrl"
                  label="Logout URL"
                  onChange={(e) => handleChange(e)}
                  value={formValues.logoutUrl.value}
                />
              )}
              <TextField
                name="clientId"
                label="Client ID"
                onChange={(e) => handleChange(e)}
                value={formValues.clientId.value}
                required
                error={formValues.clientId.error}
                helperText={
                  formValues.clientId.error && formValues.clientId.errorMessage
                }
              />
              <TextField
                name="clientSecret"
                label="Client Secret"
                onChange={(e) => handleChange(e)}
                value={formValues.clientSecret.value}
              />
              {flowType === "password" && (
                <>
                  <TextField
                    name="username"
                    label="Username"
                    onChange={(e) => handleChange(e)}
                    value={formValues.username.value}
                    error={formValues.username.error}
                    helperText={
                      formValues.username.error &&
                      formValues.username.errorMessage
                    }
                  />

                  <TextField
                    name="password"
                    label="Password"
                    onChange={(e) => handleChange(e)}
                    value={formValues.password.value}
                    error={formValues.password.error}
                    helperText={
                      formValues.password.error &&
                      formValues.password.errorMessage
                    }
                  />
                </>
              )}

              <MultiSelect
                onChange={setScopes}
                label="Scopes"
                defaultValue={["openid"]}
                fixedOptions={["openid"]}
              />
              {flowType === "authorization-code" && (
                <TextField
                  name="redirectUri"
                  label="Redirect URI"
                  onChange={(e) => handleChange(e)}
                  value={formValues.redirectUri.value}
                />
              )}
              {authenticated ? (
                <Button variant="contained" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="contained" type="submit">
                  Login
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => {
                  localStorage.removeItem("formValues");
                  window.location.reload();
                }}
                color="error"
                sx={{ marginLeft: 2 }}
              >
                Reset
              </Button>
            </Box>
          </form>
        </Grid>
        {authenticated && (
          <Grid item xs={12} md={6}>
            <TokenData tokens={tokens} />
          </Grid>
        )}
      </Grid>
    </>
  );
}
