declare global {
  interface Window {
    OneSignal: {
      init: (options: {
        appId: string;
        allowLocalhostAsSecureOrigin?: boolean;
        notifyButton?: {
          enable: boolean;
        };
      }) => Promise<void>;
      sendTag: (key: string, value: string) => Promise<void>;
      getTags: (callback: (tags: Record<string, string>) => void) => void;
      getUserId: (callback: (userId: string | null) => void) => void;
      isPushNotificationsEnabled: (callback: (enabled: boolean) => void) => void;
      registerForPushNotifications: () => Promise<void>;
    };
  }
}

export {};
