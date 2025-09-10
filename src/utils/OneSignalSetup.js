


import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalSetup({ getToken, user, userId }) {
  useEffect(() => {
    if (!getToken?.result?.token || !user || !userId) {
      console.warn('Missing token, user, or userId. Skipping OneSignal setup.');
      return;
    }

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const handleNotificationClick = (notification) => {
      const data = notification.additionalData || {};
      console.log('Notification clicked with data:', data);

      if (data.url) window.location.href = data.url;
    };

    const setupEventListeners = () => {
      try {
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          console.log('📲 Foreground notification:', event.notification);
          // event.preventDefault(); // Uncomment if you want to suppress default UI
        });

        OneSignal.Notifications.addEventListener('click', (event) => {
          console.log('🖱️ Notification clicked');
          handleNotificationClick(event.notification);
        });

        OneSignal.Notifications.addEventListener('backgroundReceived', (event) => {
          console.log('🌙 Background notification:', event.notification);
        });

        OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
          console.log('🔐 Permission changed:', permission);
        });

        OneSignal.User.PushSubscription.addEventListener('change', async ({ current }) => {
          console.log('🔁 Subscription state changed:', current);

          if (current?.optedIn) {
            await updateUserData();
          } else {
            console.warn('User unsubscribed. Cleaning up tags.');
            await OneSignal.User.removeTag('userId');
          }
        });
      } catch (error) {
        console.error('Failed to set event listeners:', error);
      }
    };

    const updateUserData = async () => {
      try {
        await OneSignal.User.addTag('userId', String(userId));
        await OneSignal.login(String(userId));

        for (let i = 0; i < 5; i++) {
          await delay(1000);
          const externalId = OneSignal.User?.externalId;
          console.log(`🔍 Verifying external ID: ${externalId}`);
          if (externalId === String(userId)) {
            console.log('✅ External ID verified.');
            return;
          }
        }

        console.warn('⚠️ External ID not verified after retries.');
      } catch (err) {
        console.error('Failed to update user data:', err);
      }
    };

    const requestPermissionIfNeeded = async () => {
      const isSupported = await OneSignal.Notifications.isPushSupported();
      if (!isSupported) {
        console.warn('❌ Push not supported in this browser.');
        return;
      }

      await OneSignal.Notifications.requestPermission();
      const permission = Notification.permission;
      console.log('🔔 Notification permission:', permission);

      if (permission === 'granted') {
        await updateUserData();
      } else {
        console.warn('User denied notification permission.');
      }
    };

    const initOneSignal = async () => {
      try {
        if (!OneSignal.initialized) {
          console.log('🚀 Initializing OneSignal...');
          await OneSignal.init({
            appId: '6c683806-f29b-4d28-b469-b7c237265ae6',
            safari_web_id: 'web.onesignal.auto.639febc2-a356-4a97-8e69-81281557724a',
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            promptOptions: {
              slidedown: {
                enabled: true,
                autoPrompt: true,
                timeDelay: 5,
                pageViews: 1,
              },
            },
          });

          console.log('✅ OneSignal initialized');
          await delay(1000);
        }

        setupEventListeners();
        await requestPermissionIfNeeded();
      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    };

    initOneSignal();

    return () => {
      try {
        OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
        OneSignal.Notifications.removeEventListener('click');
        OneSignal.Notifications.removeEventListener('backgroundReceived');
        OneSignal.Notifications.removeEventListener('permissionChange');
        OneSignal.User?.PushSubscription?.removeEventListener('change');
      } catch (cleanupError) {
        console.warn('🧹 Cleanup error:', cleanupError);
      }
    };
  }, [getToken, user, userId]);

  return null;
}