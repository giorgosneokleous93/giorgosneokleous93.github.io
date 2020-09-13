---
title: "Let’s talk (Tts)Spans in Android Accessibility
"
description: "Learn how TTSSpans in Android can make your app more accessible."
date: "2020-04-29"
aliases:
  - "/2020/04/29/lets-talk-ttsspans-in-android-accessibility/"
author: "Giorgos Neokleous"
images: 
    - /posts/lets-talk-ttsspans-banner.png
---

A great talk from the Google IO 2019 called “[Demystifying Android Accessibility Development](https://www.youtube.com/watch?v=bTodlNvQGfY)” mentions that when designing apps, we often miss to account for the users with accessibility needs. Users with accessibility needs won’t interact with the app directly, but instead they will use tools such as the [Android Accessibility Suite](https://play.google.com/store/apps/details?id=com.google.android.marvin.talkback&hl=en_GB) (includes Talkback and Switch Access). The user will interact with the Accessibility service and then the service will interact with the app.

Accessibility services need information on what the screen has or shows to be able to provide the correct contextual information to the user or to be able to navigate through the app. An example of that information can be provided using [Content Descriptions](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element).

In this blog post we’ll talk about [Spans](https://developer.android.com/guide/topics/text/spans) in Android and how to enrich [Spannables](https://developer.android.com/reference/android/text/Spannable) to provide a better UX to users with accessibility needs.

From the official [docs](https://developer.android.com/guide/topics/text/spans): 
> Spans are powerful markup objects that you can use to style text at a character or paragraph level.

With Spans we can change the text color of a substring or have a link-clickable part within a string, or even different size substrings. Sky is the limit 🚀

In this post, we’ll specifically talk about [TtsSpan](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en).

### TtsSpan

A *TtsSpan* can provide metadata for a Spannable. The metadata will be supplied to [Text-To-Speech](https://developer.android.com/reference/android/speech/tts/TextToSpeech) Engines such as [Talkback](https://play.google.com/store/apps/details?id=com.google.android.marvin.talkback&hl=en_GB).

This span comes with several builders and each builder helps *building* metadata for a different type. The types supported by the builders are:

- [TYPE_CARDINAL](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_CARDINAL)
- [TYPE_DATE](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_DATE)
- [TYPE_DECIMAL](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_DECIMAL)
- [TYPE_DIGITS](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_DIGITS)
- [TYPE_ELECTRONIC](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_ELECTRONIC)
- [TYPE_FRACTION](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_FRACTION)
- [TYPE_MEASURE](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_MEASURE)
- [TYPE_MONEY](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_MONEY)
- [TYPE_ORDINAL](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_ORDINAL)
- [TYPE_TELEPHONE](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_TELEPHONE)
- [TYPE_TEXT](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_TEXT)
- [TYPE_TIME](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_TIME)
- [TYPE_VERBATIM](https://developer.android.com/reference/android/text/style/TtsSpan?hl=en#TYPE_VERBATIM)
  
To demonstrate their benefits, we’ll explore the following types:
- TtsSpan.TYPE_DATE
- TtsSpan.TYPE_MEASURE
- TtsSpan.TYPE_TIME
- TtsSpan.TYPE_ELECTRONIC

### Brief introduction to demo
The demo application has a list of items. Each item is duplicated, one without TtsSpan and one with TtsSpan to highlight the differences.

![Demo App Screenshot](/posts/lets-talk-spans-texttospeechexample-1.png)

When an item is clicked, we pass the Spannable (with or without TtsSpan) to the TextToSpeech service to output the metadata.

### Verification

To verify that the metadata are supplied to the TextToSpeech engines correctly, we could do the following:
1. Supply the spannables to the TextToSpeech.speak method which will output the data
2. Turn on Talkback and navigate the demo using the service.


The demo videos use the first point + [Live Caption](https://support.google.com/accessibility/android/answer/9350862?hl=en-GB) to verify and present you the output.

### Building the list

The list is built using RecyclerView with `TtsItem` classes. Each item has a title, a caption and a nullable type of TtsSpan (if null then no TtsSpan is built).

```kotlin
data class TtsItem(
    val title: String,
    val caption: String,
    private val ttsSpanType: String?
) {
  var id: Int = 0
  fun toSpannable(): SpannableString? { ... }
}
```

![TtsItem demo](/posts/lets-talk-spans-ttsitem.png)

To produce the different TtsItem, we have a data factory called DummyDataFactory .

```kotlin
object DummyDataFactory {
    fun getListOfTtsItem(): List<TtsItem> = listOf(
        TtsItem("18/04/2020", "Date without TTSSpan", null),
        TtsItem("18/04/2020", "Date with TtsSpan.DateBuilder", TtsSpan.TYPE_DATE),

        TtsItem("5 meter", "Measure without TTSSpan", null),
        TtsItem("5 meter", "Measure with TTSSpan", TtsSpan.TYPE_MEASURE),

        TtsItem("14:00", "Time without TTSSpan", null),
        TtsItem("14:00", "Time with TTSSpan", TtsSpan.TYPE_TIME),

        TtsItem("admin:123456789", "Password without TTSSpan", null),
        TtsItem("admin:123456789", "Password with TTSSpan", TtsSpan.TYPE_ELECTRONIC)
    ).also { list ->
        list.forEachIndexed { index, ttsItem -> ttsItem.id = index }
    }
}
```

### Explore toSpannable() from TtsItem

**Disclaimer**: Please note that some of the code shown below is for demonstration purposes only and mapping strings to TtsSpan most likely won’t work like that in real life projects.

**Note**: Have a look at the **captions** to see the difference with and without TtsSpan.



### TtsSpan.TYPE_DATE
```kotlin
val calendar = Calendar.getInstance()
calendar.time = simpleDataFormat.parse(title)
   ?: throw IllegalStateException("Not expected null Date")
TtsSpan.DateBuilder()
   .setWeekday(calendar.get(Calendar.DAY_OF_WEEK))
   .setDay(calendar.get(Calendar.DAY_OF_MONTH))
   .setMonth(calendar.get(Calendar.MONTH))
   .setYear(calendar.get(Calendar.YEAR))

```

The above code block will take a String date, parse it into a Date object which is then supplied to a Calendar. Then the Calendar object is used to extract different information that would be useful to [TtsSpan.DateBuilder()](https://developer.android.com/reference/android/text/style/TtsSpan.DateBuilder?hl=en).

<video controls src="/posts/lets-talk-spans-date-demo.mp4"></video>

- **Caption without TtsSpan:** “18 slash 04 slash 2020“
- **Caption with TtsSpan:** “Sunday the 18th of April 2020“

### TtsSpan.TYPE_MEASURE

```kotlin
val number = digitsPattern.find(title)?.value // extracts digits
val unit = stringPattern.find(title)?.value // extracts string
TtsSpan.MeasureBuilder()
   .setNumber(number)
   .setUnit(unit)
```
The above code block will extract the digits from the string which will be treated as the number and then extract the text from the string which will be treated as the Measurement unit. All the extracted data are supplied to the [TtsSpan.MeasureBuilder](https://developer.android.com/reference/android/text/style/TtsSpan.MeasureBuilder?hl=en).

<video controls src="/posts/lets-talk-spans-measure-demo.mp4"></video>

- **Caption without TtsSpan:** “5 metre“
- **Caption with TtsSpan:** “5 metres“

As you can see the metadata helps identify whether the measurement is singular or plural.

### TtsSpan.TYPE_TIME

```kotlin
val hours = title.split(":")[0]
val minutes = title.split(":")[1]
TtsSpan.TimeBuilder()
   .setHours(hours.toInt())
   .setMinutes(minutes.toInt())
```

The above code block builds metadata needed for time. It simply extracts hours and minutes from string and supplies them to the [TtsSpan.TimeBuilder()](https://developer.android.com/reference/android/text/style/TtsSpan.TimeBuilder?hl=en).

<video controls src="/posts/lets-talk-spans-time-demo.mp4"></video>

- **Caption without TtsSpan:** “14 colon zero zero“
- **Caption with TtsSpan:** “14 hundred“

### TtsSpan.TYPE_ELECTRONIC
This particular type can be used to build several “electronic” metadata. In our example we’ll build metadata for a username and password.

```kotlin
val username = title.split(":")[0]
val password = title.split(":")[1]
TtsSpan.ElectronicBuilder()
   .setPassword(password)
   .setUsername(username)
```

The above code block uses the [TtsSpan.ElectronicBuilder](https://developer.android.com/reference/android/text/style/TtsSpan.ElectronicBuilder?hl=en) to build the metadata. The first part of the string is treated as the username and the second part as the password.

<video controls src="/posts/lets-talk-spans-electronic-demo.mp4"></video>

- **Caption without TtsSpan:** “admin 123 million 456 thousands 7 hundred and 89“
- **Caption with TtsSpan:** “admin passoword 1 2 3 4 5 6 7 8 9“
The above example is my favourite as it demonstrates how powerful the Text-to-Speech engine can be with the correct metadata.

### Conclusion
Providing rich UX is important, and we need to make sure that our apps are accessible for all users. We have seen some examples on how to add some metadata in apps so that Text to Speech services provide contextual information.

➡ All the above examples can be found at the [sample project on Github](https://github.com/giorgosneokleous93/text-to-speech-span-example).

Feel free to ping me on [Twitter](https://twitter.com/neokleoys2005).

Till next time! 👋

#### Recommended Reading & Listening
- [Test your app’s accessibility](https://developer.android.com/guide/topics/ui/accessibility/testing)
- [TtsSpan documentation](https://developer.android.com/reference/android/text/style/TtsSpan)
- [Get started with Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [Episode 137 on Android Developer Backstage](http://androidbackstage.blogspot.com/2020/04/episode-137-accessibility.html)
- [Codelab – Basic Android Accessibility](https://codelabs.developers.google.com/codelabs/basic-android-accessibility/)
- [Accessibility Scanner](https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor&hl=en_GB)