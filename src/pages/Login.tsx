import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log("[Login] Component rendering");

  useEffect(() => {
    console.log("[Login] Component mounted");
    return () => {
      console.log("[Login] Component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("[Login] Username changed:", username);
  }, [username]);

  useEffect(() => {
    console.log("[Login] Password changed:", password ? "***" : "");
  }, [password]);

  useEffect(() => {
    console.log("[Login] Error state changed:", error);
  }, [error]);

  useEffect(() => {
    console.log("[Login] Loading state changed:", loading);
  }, [loading]);

  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] Form submitted");
    setError(null);
    setLoading(true);

    try {
      console.log("[Login] Attempting login for user:", username);
      await onLogin(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("[Login] Login error:", err);
      setError(err.message || "Invalid username or password");
    } finally {
      console.log("[Login] Setting loading to false");
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[Login] Username input changed");
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[Login] Password input changed");
    setPassword(e.target.value);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Admin Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={handleUsernameChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
