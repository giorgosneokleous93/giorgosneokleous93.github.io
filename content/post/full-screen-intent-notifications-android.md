---
title: "Full-Screen Intent Notifications – Android"
description: "Learn how to document your XML attributes for your Custom Views."
date: "2020-03-15"
aliases:
  - "/2020/03/15/full-screen-intent-notifications-android/"
author: "Giorgos Neokleous"
---

### What are Full-Screen Intents?
Full-Screen [Intents](https://developer.android.com/reference/android/content/Intent) are Intents that can launch in full-screen and can be used for showing a full-screen notification.

Well, I guess that needs a bit more explanation so keep on reading.

From the official [docs](https://developer.android.com/training/notify-user/build-notification#urgent-message): 
> Your app might need to display an urgent, time-sensitive message, such as an incoming phone call or a ringing alarm. In these situations, you can associate a full-screen intent with your notification.

### Why should Full-Screen Intents be used?

A restriction was added with Android Q where an app couldn’t start an activity if [not meeting criteria](https://developer.android.com/guide/components/activities/background-starts#exceptions). Although this breaks a lot of things, it doesn’t affect full-screen intents. (see [Restrictions on starting activities from the background](https://developer.android.com/guide/components/activities/background-starts#display-notification))

From [Ian Lake](https://stackoverflow.com/users/1676363/ianhanniballake) from the Android Toolkit team at [Stackoverflow](https://stackoverflow.com/questions/57964961/how-to-set-an-alarm-on-android-q): 
> Full screen intent has been the recommended best practice for alarms since it was introduced in API 9 and was even more important with the introduction of heads up notifications (where your alarm shows as a heads up notification if the user is actively using their device)

### When should Full-Screen Intents be used?
Full-screen intents were added to the framework since forever and it is the recommended way of launching an activity while the system is locked or busy.

**Examples:**
- **Incoming call**: When there is an incoming call, the system launches a full-screen activity if the phone is locked or shows a normal notification with high priority.
- **Alarm Clock**: An alarm clock can use full-screen intent to either show an activity or a notification with high priority.

Notifications with a Full-Screen Intent are less intrusive to the user and there is less chance to break in the future with any API changes.

---

### Show me the code

**Note**: On Android 10 and above to use a full-screen intent, a special [permission](https://developer.android.com/about/versions/10/behavior-changes-10#full-screen-intents) needs to be declared in the Manifest.

We are going to explore three different scenarios:
1. Notify while the app is on the foreground
2. Schedule Full-Screen Intent Notification
3. Full-Screen Intent on Lock Screen with a Keyguard

*Disclaimer*: Some logic will be emitted for demonstration purposes

### 1. Notify while the app on the foreground.

 ![Notify while the app on the foreground demo](/posts/full_screen_intent-notify-while-foreground.gif)

 In order to show a full-screen intent, we need to first build the notification and **set the full-screen intent to the notification**.

To build the intent we need a pending intent, which can be achieved using [PendingIntent](https://developer.android.com/reference/android/app/PendingIntent).

```kotlin
 val builder = NotificationCompat.Builder(this, channelId)
        .setSmallIcon(android.R.drawable.arrow_up_float)
        .setContentTitle(title)
        .setContentText(description)
        .setPriority(NotificationCompat.PRIORITY_HIGH)
// request code and flags not added for demo purposes
val pendingIntent = PendingIntent.getActivity(this, 0, intent, 0)
builder.setFullScreenIntent(pendingIntent) // THIS HERE is the full-screen intent
```

Don’t forget to add in your AndroidManifest.xml’s Activity the following as well:
```xml
<activity android:name=".LockScreenActivity"
    android:showOnLockScreen="true"/>
```

### 2. Schedule Full-Screen Intent Notification
Building the notification is identical to the previous example. The main difference is that the notification is not built by an Activity but by a [BroadcastReceiver](https://developer.android.com/reference/android/content/BroadcastReceiver) to enable scheduling in the future using [AlarmManager](https://developer.android.com/reference/android/app/AlarmManager).


![Schedule Full-Screen Intent Notification demo](/posts/full_screen_intent-schedule.gif)

**Scheduling**
AlarmManager needs a PendingIntent with a BroadcastReceiver.

```kotlin
fun Context.scheduleNotification(isLockScreen: Boolean) {
    val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val timeInMillis = System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(SCHEDULE_TIME)
    with(alarmManager) {
        setExact(AlarmManager.RTC_WAKEUP, timeInMillis, getReceiver(isLockScreen))
    }
}
private fun Context.getReceiver(isLockScreen: Boolean): PendingIntent {
    // for demo purposes no request code and no flags
    return PendingIntent.getBroadcast(
        this,
        0,
        NotificationReceiver.build(this, isLockScreen),
        0
    )
}

```

**Receiver**
The Receiver below is called in two cases:
- When the system is locked
- When the system is not locked

```kotlin
class NotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if(intent.getBooleanExtra(LOCK_SCREEN_KEY, true)) {
            context.showNotificationWithFullScreenIntent(true)
        } else {
            context.showNotificationWithFullScreenIntent()
        }
    }
    companion object {
        fun build(context: Context, isLockScreen: Boolean): Intent {
            return Intent(context, NotificationReceiver::class.java).also {
                it.putExtra(LOCK_SCREEN_KEY, isLockScreen)
            }
        }
    }
}
private const val LOCK_SCREEN_KEY = "lockScreenKey"
```

### 3. Full-Screen Intent on Lock Screen with a Keyguard

[Keyguard](https://developer.android.com/reference/android/app/KeyguardManager) could prevent the notification from being displayed.

Let’s see an example to visualize it.

![Full-Screen Intent on Lock Screen with a Keyguard demo blocker](/posts/full_screen_intent-keyguard-blocker.gif)

The framework provides some flags to dismiss keyguard.

Activity#[setShowWhenLocked](https://developer.android.com/reference/android/app/Activity#setShowWhenLocked(boolean))(true) method
Note: To be able to turn on the screen we need to also request it using the:

– Activity#[setTurnScreenOn](https://developer.android.com/reference/android/app/Activity#setTurnScreenOn(boolean))(true) method

Time for an extension function that sets both flags with backward compatibility 🚀

```kotlin
fun Activity.turnScreenOnAndKeyguardOff() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        setShowWhenLocked(true)
        setTurnScreenOn(true)
    } else {
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                    or WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        )
    }
    with(getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            requestDismissKeyguard(this@turnScreenOnAndKeyguardOff, null)
        }
    }
}
```

Demo 🎬
![Full-Screen Intent on Lock Screen with a Keyguard](/posts/full_screen_intent-keyguard-fixed.gif)

### Conclusion
Using Full-Screen Intents is easy and it’s the recommended way of launching an activity, especially for alarms.

The API should be used with care, and developers shouldn’t abuse it as it’s quite intrusive especially when the screen wakes up.

You can find a sample project [here](https://github.com/giorgosneokleous93/fullscreenintentexample/).

Feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

Till next time! 👋

#### Recommended Reading
- https://developer.android.com/guide/components/activities/background-starts#display-notification
- https://developer.android.com/training/notify-user/time-sensitive
- https://developer.android.com/about/versions/10/behavior-changes-10#full-screen-intents