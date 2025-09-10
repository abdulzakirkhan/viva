// // components/OneSignalInit.js
// import { useEffect } from 'react';
// import OneSignal from '@onesignal/onesignal-react';

// const OneSignalInit = () => {
//   useEffect(() => {
//     // Initialize OneSignal
//     OneSignal.init({
//       appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
//       allowLocalhostAsSecureOrigin: true, // For development
//       serviceWorkerParam: { scope: '/onesignal/' },
//       serviceWorkerPath: 'onesignal/OneSignalSDKWorker.js',
//       promptOptions: {
//         /* Customize the prompt */
//         slidedown: {
//           enabled: true,
//           autoPrompt: true,
//           timeDelay: 5,
//           pageViews: 2,
//           actionMessage: "We'd like to show you notifications for the latest news and updates.",
//           acceptButtonText: "ALLOW",
//           cancelButtonText: "NO THANKS"
//         }
//       }
//     });

//     // Optional: Handle subscription changes
//     OneSignal.on('subscriptionChange', (isSubscribed) => {
//       console.log("User subscription state changed:", isSubscribed);
//     });

//     // Optional: Handle notification clicks
//     OneSignal.on('notificationDisplay', (event) => {
//       console.log('Notification displayed:', event);
//     });

//     return () => {
//       // Clean up
//       OneSignal.off('subscriptionChange');
//       OneSignal.off('notificationDisplay');
//     };
//   }, []);

//   return null;
// };

// export default OneSignalInit;