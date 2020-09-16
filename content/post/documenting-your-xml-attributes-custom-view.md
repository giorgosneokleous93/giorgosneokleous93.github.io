---
title: "Documenting your XML attributes – Custom View"
description: "Learn how to document your XML attributes for your Custom Views."
date: "2020-01-19"
aliases:
  - "/2020/01/19/documenting-your-xml-attributes-custom-view/"
author: "Giorgos Neokleous"
---

Today, I will walk you through on how to create a very basic Custom View, and we will do something that many libraries and developers often forget to do:

**Documenting XML Attributes, which offer customizations on custom views.**

### Why
Documentation sometimes is redundant if the method, class or property is self-describing. However, imagine any Android API without it. Android development will instantly turn into living hell. To figure out what’s going on we will have to step into source code and trial-and-error different options.

### Custom View

I will be using the following custom view, which draws a Circle. The customizations available will be: fill color and radius.

![Custom View Demonstration](/posts/documenting-your-xml-attributes-circle-custom-view.png)


### Implementation

#### Create custom attributes
Creating custom attributes allows specifying properties on the XML directly instead of programmatically. These attributes will be fetched at the construction of the View.

To declare the attributes:
- Create a Values resource file – usually called attrs.xml
- Open a declare-styleable tag
- Include the attributes within the view

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="CircleCustomView">
        <attr name="fillColor" format="color" />
        <attr name="radius" format="dimension" />
    </declare-styleable>
</resources>
```

The *“name”* should be your custom view’s class name to bind the enclosed attributes to it. In our case that would be *“CircleCustomView“*.

Now the enclosed attributes would be:
1. Fill Color of the format “color” resource
2. The radius of the format dimension

#### Fetch custom attributes
In the initialization of our custom view, we need to fetch and store those attributes in order to use them when drawing on the [Canvas](https://developer.android.com/reference/android/graphics/Canvas).

```kotlin
init {
    context.theme.obtainStyledAttributes(
        attrs,
        R.styleable.CircleCustomView,
        0,
        0
    ).apply {
        circleFillColor = getColor(
            R.styleable.CircleCustomView_fillColor,
            context.getColor(R.color.colorAccent)
        )
        circleRadius = getDimension(R.styleable.CircleCustomView_radius, 100f)
    }
}
```

#### Draw the circle

```kotlin
override fun onDraw(canvas: Canvas?) {
    super.onDraw(canvas)
    paint.color = circleFillColor
    canvas?.drawCircle(canvas.width / 2f, canvas.height / 2F, circleRadius, paint)
}
```

#### Full Class
```kotlin
class CircleCustomView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {
    @ColorInt
    private var circleFillColor: Int
    private var circleRadius: Float
    private val paint = Paint()
    init {
        context.theme.obtainStyledAttributes(
            attrs,
            R.styleable.CircleCustomView,
            0,
            0
        ).apply {
            circleFillColor = getColor(
                R.styleable.CircleCustomView_fillColor,
                context.getColor(R.color.colorAccent)
            )
            circleRadius = getDimension(R.styleable.CircleCustomView_radius, 100f)
        }
    }
    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        paint.color = circleFillColor
        canvas?.drawCircle(canvas.width / 2f, canvas.height / 2F, circleRadius, paint)
    }
    fun setFillColor(@ColorRes colorRes: Int) {
        this.circleFillColor = context.getColor(colorRes)
    }
    fun setRadius(@DimenRes radius: Int) {
        this.circleRadius = context.resources.getDimension(radius)
    }
}
```

### Document XML Attributes
Without documentation, if I try to check for it over the *fillColor*, I am getting the following.

![Fill Color IDE Popup](/posts/documenting-your-xml-attributes-circle-fillColor-doc-popup.png)

Using normal XML comments above the attributes will result in attaching the comments as documentation for them.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <declare-styleable name="CircleCustomView">
        <!-- Sets the fill color of the circle -->
        <attr name="fillColor" format="color" />
        <!-- Sets the radius of the circle -->
        <attr name="radius" format="dimension" />
    </declare-styleable>
</resources>
```

Now if I ask for documentation on the attribute, I am getting proper documentation as seen below:

![Demonstration of Docs Popup 1](/posts/documenting-your-xml-attributes-circle-fillColor-doc-popup-with-docs-1.png)
![Demonstration of Docs Popup 2](/posts/documenting-your-xml-attributes-circle-fillColor-doc-popup-with-docs-2.png)

### Conclusion
Documenting XML attributes for your custom views is as simple as attaching an XML comment using the `<!-- comment -->`.

In my opinion, documentation is not always needed. If something is self-describing then you can afford to skip it. On the other hand, if something will be used by many others or does something that is not specified or described from the class, property or method name then it needs documentation.

Feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

Till next time! 👋

Get started with custom views with the following links:

https://developer.android.com/training/custom-views/create-view
https://developer.android.com/training/custom-views/custom-drawing
https://developer.android.com/guide/topics/ui/custom-components
Codelab [Part A](https://codelabs.developers.google.com/codelabs/advanced-android-training-customize-view/index.html?index=..%2F..advanced-android-training#0) & [Part B](https://codelabs.developers.google.com/codelabs/advanced-android-training-custom-view-from-scratch/index.html?index=..%2F..advanced-android-training#0)