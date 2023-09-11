import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, useState } from "react";
import { decodeJwt } from "jose";

export type User = {
  email: string;
  sub: string;
};

export type AuthContext = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const useAuthContext = () => useContext(AuthContext)!;

export const useAuth = (): AuthContext => {
  const {
    isLoading: isLoadingAuth0,
    loginWithRedirect,
    logout: logoutAuth0,
    getAccessTokenSilently,
    user: auth0User,
  } = useAuth0();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>();

  const authorizationParams = {
    tenant_id: "8941322c-37f5-4a3f-b49a-f9e06a226122", // Hardcoded Aster tenant id
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
  };

  const login = () => loginWithRedirect({ authorizationParams });

  const logout = async () => {
    await logoutAuth0();
    setIsAuthenticated(false);
    setUser(undefined);
  };

  const getToken = async () => {
    try {
      // Try to get a token from the cache. The sdk may return the
      // cached token even if it is expired.
      const cachedTokens = await getAccessTokenSilently({
        detailedResponse: true,
        authorizationParams,
        cacheMode: "on",
      });

      // Verify the token isn't expired
      const payload = decodeJwt(cachedTokens.id_token);
      const epochSecondsNow = Math.floor(Date.now() / 1000);
      if (payload.exp! > epochSecondsNow) {
        setIsAuthenticated(true);
        if (auth0User) {
          setUser({
            email: auth0User.email!,
            sub: auth0User.sub!,
          });
        }
        return cachedTokens.id_token;
      }

      // If the token is expired, make a request to Auth0 to get
      // a new identity token using the stored refresh token.
      const freshTokens = await getAccessTokenSilently({
        detailedResponse: true,
        authorizationParams,
        cacheMode: "off",
      });
      setIsAuthenticated(true);
      if (auth0User) {
        setUser({
          email: auth0User.email!,
          sub: auth0User.sub!,
        });
      }
      return freshTokens.id_token;
    } catch (ex) {
      const err = ex as Error;
      console.log(`Failed to retrieve a valid identity token: ${err?.message}`);
      setIsAuthenticated(false);
      setUser(undefined);
      return undefined;
    }
  };

  useEffect(() => {
    if (isLoadingAuth0) {
      setIsLoading(true);
      return;
    }
    const effect = async () => {
      await getToken();
      setIsLoading(false);
    };
    effect();
  }, [isLoadingAuth0]);

  return {
    login,
    logout,
    getToken,
    user,
    isAuthenticated,
    isLoading,
  };
};
