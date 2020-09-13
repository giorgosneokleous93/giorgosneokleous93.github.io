---
title: "Name your .apk & .aab files"
description: "Learn how to rename your artifacts(APK and AAB) to convey meaning."
date: "2019-12-01"
aliases:
  - "/2019/12/01/name-your-apk-aab-files/"
author: "Giorgos Neokleous"
---

This post will explore how to rename your artifacts, to convey meaning.

### Why?
**Use cases:**
1. When your application has multiple “flavours”, you need the outputs identifiable.
2. When you produce multiple versions at the same time, you need to tell which artifact is which.


To check your current artifact’s name simply run assembleDebug Gradle task. If you haven’t modified it yet, your output will be **app-debug.apk**.

What would be better to have is something that is identifiable and meaningful like the template below:

```
${applicationId}-v${versionName}(${versionCode})-${buildType}.apk
```

This template will produce something like:

```
com.example.sampleproject-v1.0.0(101)-release.apk
```

By using this template you know what the APK is about.

### Option 1

I personally do not recommend the following solution but you can find it in many StackOverflow answers.

When I tried it with app bundles, it was not working.

```groovy
applicationVariants.all { variant ->
    variant.outputs.all {
        outputFileName = "${applicationId}-v${versionName}(${versionCode})-${buildType}.apk"
    }
}
```

The DSL Version
```kotlin
applicationVariants.all {
    outputs.forEach { output ->
        if (output is com.android.build.gradle.internal.api.BaseVariantOutputImpl) {
            output.outputFileName = "${applicationId}-v${versionName}(${this.versionCode})-${name}.${output.outputFile.extension}"
        }
    }
}
```
The above works fine for APKs but not for app bundles.

**Output**

```
com.example.sampleproject-v1.0.0(101)_release.apk
```

### Option 2

The following implementation is easy and simple but as the property “archivesBaseName” implies, it will only set up the base name and not the full file’s name.

```groovy
android {
  ...
  defaultConfig {
    ...
    archivesBaseName = "${applicationId}-v${versionName}(${versionCode})"
  }
}
```

THE DSL Version
```kotlin
android {
  ...
  defaultConfig {
    ...
    setProperty("archivesBaseName", "${applicationId}-v${versionName}(${versionCode})")
  }
}
```

**Output**

```
com.example.sampleproject-v1.0.0(101)-release.apk
```

The “-release” part is added according to the build type automatically.

### Performance Comparison
In this section, Option 1 will be compared against Option 2.

The following metrics were taken on a 7-module project by running the following tasks:
- clean
- assembleDebug


Runs | Option 1 | Option 2
---|---|---
1	| 15.643|	16.519
2	| 16.539|	|14.515
3	| 14.39	| 16.592
4	| 16.536 |	14.506
5	| 16.9	| 15.391
**Average**|	16.0016|	15.5046

<br>

![Comparison of the two options](/posts/name-your-apk-aab-files-Property-vs-Variant-Manipulation.png)
As you can see from the graphs and metrics above, the two options have identical performance, with no clear winner. To be honest, I was expecting **Option 2** to be faster 🤷.

### Conclusion
Personally I prefer Option 2, it’s simple and it did not break when App Bundles were introduced.

Remember: When naming your artifacts make sure that you are giving them meaningful names.

If you have anything to add or want to share your experiences with me feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

If you enjoyed this blog post, feel free to share it around or hit the 👏below!

Till next time! 👋