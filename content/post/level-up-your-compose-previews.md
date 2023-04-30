---
title: "Level up your Compose Previews"
description: "Learn how to use @PreviewParameter to provide have re-usable preview data in your composables."
date: "2023-04-30"
aliases:
  - "/2023/04/30/level-up-your-compose-previews/"
author: "Giorgos Neokleous"
---

This should be a quick blog post about [@PreviewParameter](https://developer.android.com/reference/kotlin/androidx/compose/ui/tooling/preview/PreviewParameter) in Jetpack Compose. This annotation allows us to provide a class called [PreviewParameterProvider](https://developer.android.com/reference/kotlin/androidx/compose/ui/tooling/preview/PreviewParameterProvider). The `PreviewParameterProvider` is responsible for providing data to our previews in jetpack compose. 

**Setup**

We are going to use the basic hello world from the Android Studio Wizard. 

```kotlin
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
```

If we want to preview this so that we get instant feedback then we will do something like: 

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    ComposePreviewsTheme {
        Greeting("world")
    }
}
```

## Result
![Result of Setup](/posts/level-up-your-compose-previews-screenshot-1.png)

# PreviewParameter

## Create a PreviewParameterProvider

The `PreviewParameterProvider` returns a collection of `values`, each value will be its own Preview render.

### Provider
```kotlin
class GreetingPreviewParameter : PreviewParameterProvider<String> {
    override val values: Sequence<String>
        get() = sequenceOf("Android", "Giorgos")
}
```

### Composable
```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview(@PreviewParameter(GreetingPreviewParameter::class) name: String) {
    ComposePreviewsTheme {
        Greeting(name)
    }
}    
```

### Result 
![Result of PreviewParameter](/posts/level-up-your-compose-previews-screenshot-2.png)

# PreviewParameter with Custom Types

## Setup

Imagine that we have our own type called `ThemePark` with a name and a capacity. 

```kotlin
data class ThemePark(val name: String, val capacity: Int)
```

Our composable for showing the information about a ThemePark.

```kotlin
@Composable
fun ThemeParkDetails(themePark: ThemePark, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(text = "Name: ${themePark.name}")
        Text(text = "Capacity: ${themePark.capacity}")
    }
}
```

## Previews

Then our previews with a `PreviewParameterProvider` will look like:

```kotlin
class ThemeParkPreviewProvider : PreviewParameterProvider<ThemePark> {
    override val values: Sequence<ThemePark>
        get() = sequenceOf(
            ThemePark(name = "Fun Theme Park", capacity = 300),
            ThemePark(name = "Hollywood Theme Park", capacity = 20)
        )
}
```

Finally our preview composable will be: 

```kotlin
@Preview(showBackground = true)
@Composable
fun ThemeParkPreview(@PreviewParameter(ThemeParkPreviewProvider::class) themePark: ThemePark) {
    ComposePreviewsTheme {
        ThemeParkDetails(themePark)
    }
}
```

## Result

![Result of custom type](/posts/level-up-your-compose-previews-screenshot-3.png)


# Conclusion

I hope you enjoyed this short blog post about `PreviewParameter`. 

Feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

Till next time! 👋
