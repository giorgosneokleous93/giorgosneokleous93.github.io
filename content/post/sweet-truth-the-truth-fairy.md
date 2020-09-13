---
title: "Sweet Truth, the Truth fairy 🦷"
description: "Exploring Google's Truth Assertion Library"
date: "2019-09-18"
aliases:
  - "/2019/09/18/sweet-truth-the-truth-fairy/"
author: "Giorgos Neokleous"
images: 
    - /posts/sweet-truth-the-truth-fairy-banner.png
---

Writing tests is an important part of software development and dare to say not an easy task. There are many practices, libraries, books, podcasts, web courses dedicated to testing. Without testing we can ship a software with “1 to N” number of bugs.

Personally, I am a fan of the following technique which helps developers write tests and provides a template guide on how-to form your tests.

### Arrange Act Assert (AAA)
> a pattern for arranging and formatting code in [UnitTest](a pattern for arranging and formatting code in UnitTest methods
) methods

It states that each unit test needs the following three things:

1. Arrange: prepare the inputs, preconditions, mocks, etc.
2. Act: Perform operation on the function or object which is under test.
3. Assert: Make sure that the output matches the expected output.

**Example**
```kotlin
@Test
fun `example of AAA`() {
    // Arrange
    val input = 2
    // Act
    val output = toThePowerOfTwo(number = input)
    // Assert
    Assert.assertEquals(4, output)
}
```

On this blog post we are going to focused on the **Assertions** part.

## JUnit Assertions
JUnit comes with a set of pretty basic assertions which can be used during testing.

The whole set can be found at their [JavaDoc](https://junit.org/junit4/javadoc/latest/org/junit/Assert.html).

JUnit also comes with the [Hamcrest](http://hamcrest.org/JavaHamcrest/index) assertions which are very nice!

**Hamcrest Example**
```kotlin
@Test
fun `example of Hamcrest`(){
    val input = 2

    val output = toThePowerOfTwo(input)

    Assert.assertThat(output, CoreMatchers.`is`(4))
}
```

In my opinion matchers are a much readable form of unit tests as it can be easily expressed, also the unit tests failures are much more readable.

Let’s go one step beyond now and introduce the main star of the post, [Truth](https://truth.dev/).

## Truth
Truth is an assertion library, that comes with assertions and nice failure messages and as a result of that much more readable unit tests ♥️.

> Truth is owned and maintained by the [Guava](https://github.com/google/guava) team. It is used in the majority of the tests in Google’s own codebase.

Truth’s API enables chained method calls, this is a huge win for me as it’s easier to read.

**Example 1**
```kotlin
@Test
fun `example one of Truth`() {
    Truth.assertThat(getUsers()).containsEntry("User 1", "John Doe")
}
```

The above example can be easily read as: “Assert that getAllUsers() returns a map with an entry with key: User 1 and value John Doe. Truth can also be imported statically so you can no always add Truth.*.

A failure message of the above would look like:

```
value of: map.get(User 2)
expected: John Doe
but was : John Wick
map was : {User 1=John Doe, User 2=John Wick, User 3=Steve Rogers}
Expected :John Doe
Actual   :John Wick
```
Much much easier to understand what went wrong! 👏🎉

Full JavaDoc for Truth can be found at: https://truth.dev/api/1.0/

**Example 2**
Check that a list contains the items you expect and in the correct order.

```kotlin
Test
fun `example two of Truth`() {
    Truth.assertThat(getAllUsernames())
        .containsExactly("User 1", "User 2", "User 3")
        .inOrder()
}
```

A failure message of the above would look like:

```
contents match, but order was wrong
expected: [User 2, User 1, User 3]
but was : [User 1, User 2, User 3]
```

**Example 3**
Assertions on String objects.

```kotlin
@Test
fun `example three of Truth`() {
    val user = getRandomUser()

    Truth.assertThat(user.name).contains("John")
    Truth.assertThat(user.username).startsWith("User")
}

```

A failure message of the above would look like:
```
expected to contain: Steve
but was            : John Doe
```

**Example 4**
With Kotlin’s extension functions we can power up Truth 🆙💪

With the following extension we can chain multiple assertions, Truth allows one at time, except if the method allows it, like _Example 2_.

The only downside is that failures will be invoked on the first call and not the subsequent ones.

```kotlin 
/**
 * Invoke multiple calls on [T] objects.
 */
fun <T : Subject> T.toTruthSerum(vararg calls: T.() -> Unit) {
    calls.forEach { it.invoke(this@toTruthSerum) }
}

// how to use
@Test
fun `example four of Truth - with kotlin extensions`() {
    val user = getJohnWick()

    Truth.assertThat(user.name).toTruthSerum(
        { startsWith("John") },
        { endsWith("Wick") }
    )
} 
```

A failure message of the above would look like:

```
expected to start with: Wick
but was               : John Wick
```

### Conclusion

I really like Truth! It can make testing really really fun 🥳 and easier to debug. Refactoring tests or failing tests can be an easy-peasy task now!

I wish it had better support for Kotlin to enable some of the language features, e.g. named parameters which will make our tests even more readable. At example #1, it would nice to have instead of:

`#containsEntry("User 1", "John Doe")`

to have:

`#containsEntry(key = "User 1", value = "John Doe")`

To finish off, do and use whatever suits you. Especially for testing, adding new dependencies doesn’t increase app size, nor method count for your shipped product. On the contrary it will help you write better (hopefully 🤞) tests (and don’t overdo it with the dependencies just because you can).

Feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

Till next time! 👋