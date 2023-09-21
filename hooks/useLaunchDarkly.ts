// useLaunchDarkly.ts
import { useState, useEffect } from 'react';
import * as LaunchDarkly from 'launchdarkly-js-client-sdk';

let ldClient: LaunchDarkly.LDClient;

export const useLaunchDarkly = (user: { key: string, email: string } | null) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      const initialize = async () => {
        ldClient = LaunchDarkly.initialize(process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID!, user);
        await new Promise<void>(resolve => {
          ldClient.on('ready', () => {
            resolve();
          });
        });
        setInitialized(true);
      };
      initialize();
    }
  }, [initialized, user]);

  const getFlag = (key: string, defaultValue = false) => {
    if (!ldClient) {
      console.warn('LaunchDarkly client not initialized');
      return defaultValue;
    }
    return ldClient.variation(key, defaultValue);
  };

  return { getFlag, initialized };
};
