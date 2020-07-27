//===========================
{/* 
  1. Install expo-notification and expo-permissions 
  2. In app.json file set following to get the notification:

  "android": {
      "useNextNotificationsApi": true
  }

  3. Sign Up on the Expo Developer Site.
  4. Sign In with same credentials in your project terminal

*/}  
//===========================

import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

// Showing the alerts when app is running
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    //Geeting the permission for notification
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== 'granted') {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== 'granted') {
          throw new Error('Permission not granted!');
        }
      })
      .then(() => {
        // Getting the notification token
        return Notifications.getExpoPushTokenAsync();
      })
      .then((response) => {
        const token = response.data;
        console.log("[PUSH Token]", token);
        // Set the token
        setPushToken(token);
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }, []);

  useEffect(() => {
    // What we want to do in the background 
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("[BACKGROUND]",response);
      }
    );
      // What we want to do in the forground when notification click
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[FORGROUND]",notification);
      }
    );

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

  const triggerNotificationHandler = () => {
    // Local notification
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first local notification',
        body: 'This is the first local notification we are sending!',
        data: { mySpecialData: 'Some text' },
      },
      trigger: {
        seconds: 2,
      },
    });
    // Using Expo server for PUSH Notification
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        data: { extraData: 'Some data' },
        title: 'Sent via the app',
        body: 'This push notification was sent via the app!',
      }),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger Notification"
        onPress={triggerNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
