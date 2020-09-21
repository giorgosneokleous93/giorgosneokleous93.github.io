---
title: "Kotlin's Coroutines Testing Tips"
description: "Learn how to use Coroutines Testing features including runBlockingTest, TestCoroutineScope and TestCoroutineExceptionHandler"
date: "2020-09-23"
author: "Giorgos Neokleous"
images: 
    - /posts/kotlins-coroutines-testing-tips.png
---

### Introduction

Do you love [Kotlin's Coroutines](https://kotlinlang.org/docs/reference/coroutines-overview.html)? So do I! Kotlin's Coroutines offer many benefits such as: 

- Readability: the following code can be read line by line and understand the order of execution without going into callbacks (at least on what the developers write).
```kotlin
suspend fun runTwoExpensiveOperations() {
      // Running First Operation 
      val resultOfFirstExpensiveOperation = withContext(Dispatchers.IO) {        
            runFirstExpensiveOperation()
      }

      // Running Second Operation
     val resultOfSecondExpensiveOperation = withContext(Dispatchers.IO) {
            runSecondExpensiveOperation(resultOfFirstExpensiveOperation)
      }

      return resultOfSecondExpensiveOperation
}
```
- Reactive capabilities: Flows, Channels, StateFlow come with a lot of operators which provide an API for hot and cold streams. 
- Supported as a language feature

I found unit testing with Kotlin's Coroutines easy, especially when testing things like `withContext` or `suspend` functions. 

### Time-master - runBlockingTest 
`runBlockingTest` ([link](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/run-blocking-test.html)) provides a scope which can be used to control time, such as advancing time, pausing and resuming dispatchers. 

Within the body of the `runBlockingTest` you can run suspending operations and manipulate time. You can forward time using the [TestCoroutineScope](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-test-coroutine-scope/index.html) which can be accessed directly from within the `runBlockingTest`. 

Let's see an example and then break it down.

```kotlin
@Test
fun `Advancing Time with TestCoroutineScope`() = runBlockingTest {
    val delay = 100.milliseconds
    val flow = operationForTimeController(delay = delay, rounds = 5)

    // observing flow and storing emissions
    val results = mutableListOf<Int>()
    launch { flow.collect { results.add(it) } }

    // assert that results is empty
    Assert.assertThat(results.isEmpty(), CoreMatchers.equalTo(true))

    // forward one emission with `delay
    advanceTimeBy(delay.toLongMilliseconds())

    // assert first item is correct
    Assert.assertThat(results.first(), CoreMatchers.equalTo(0))

    // advanced at the end of the flow
    advanceUntilIdle()

    // assert emissions
    Assert.assertThat(results, CoreMatchers.equalTo(mutableListOf(0, 1, 2, 3, 4)))
}
```

The unit test above observes a flow of integers. In order to assert the behaviour on flow, we are launching a coroutine which adds into `results` the emissions for inspection at a later stage.

Then we do the following to test emissions:
1. Assert that the list of results is empty
2. Forward time by `delay` (100ms) for one emission using [advancedTimeBy](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-delay-controller/advance-time-by.html)
3. Assert that the list's first item is `0`
4. Forward until idle (i.e. until there are no running jobs) using [advanceUntilIdle](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-delay-controller/advance-until-idle.html)
5. Assert list contains all items `0, 1, 2, 3, 4` 

All of the above are achieved without waiting 500ms for the delays to run!

`runBlockingTest` under the hood calls `cleanupTestCoroutines` to make sure that coroutines are properly cleaned up.

Let's see the implemenation of the function, emited logic for simplification ([source code](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-test/src/TestBuilders.kt#L45)): 
```kotlin
 val (safeContext, dispatcher) = context.checkArguments()
    ..
    val deferred = scope.async {
        scope.testBody()
    }
    ..
    scope.cleanupTestCoroutines()
    ..
```

The `cleanupTestCoroutines` will call the same method from the `UncaughtExceptionCaptor` and `DelayController`. What does that mean for us?
- The `UncaughtExceptionCaptor` throws the first uncaught exception + prints all exceptions' stacktraces.
- The `DelayController` tries to complete all pending tasks. 

### Exception Master - TestCoroutineExceptionHandler

`TestCoroutineExceptionHandler` ([link](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-test-coroutine-exception-handler/))is a special version of the [CoroutineExceptionHandler](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/index.html). You can use a CoroutineExceptionHandler to be able to handle exception from within coroutines. 

Personal favourite articles about Coroutine's exception handling: 
- ["Exceptions in coroutines" by Manuel Vivo](https://medium.com/androiddevelopers/exceptions-in-coroutines-ce8da1ec060c)
- ["Exceptional Exceptions for Coroutines made easy…?" by Anton Spaans](https://medium.com/the-kotlin-chronicle/coroutine-exceptions-3378f51a7d33)
- ["Why exception handling with Kotlin Coroutines is so hard and how to successfully master it!" by Lukas Lechner](https://www.lukaslechner.com/why-exception-handling-with-kotlin-coroutines-is-so-hard-and-how-to-successfully-master-it/)


Let's see how to leverage `TestCoroutineExceptionHandler` to test exceptions.

```kotlin
@Test
fun `Assert Exception with Coroutines`() = runBlockingTest {
    // handler will catch Exceptions
    val exceptionHandler = TestCoroutineExceptionHandler()

    launch(exceptionHandler) { operation().collect() }

    // asserting that first uncaught exception is CustomException
    Assert.assertThat(
        exceptionHandler.uncaughtExceptions.first(),
        CoreMatchers.instanceOf(CustomException::class.java)
    )
}
```

The unit test above observes a Flow and asserts the first exception. The `operation` flow throws a `CustomException::class.java` immediately.

As you can see I am passing to `launch` an `exceptionHandler` as extra context which will catch exceptions. The exceptions can be observed using the `.uncaughtExceptions` which returns all exceptions thrown from within the enclosed job.

### Today we explored how to:
1. Collect Flow's emissions, by storing the emissions into a collection.
2. Forward time by a fixed time using `advancedTimeBy` ([link](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-delay-controller/advance-time-by.html))
3. Forward time until idle using `advanceUntilIdle` ([link](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-delay-controller/advance-until-idle.html)) to execute all pending tasks.
4. Catch and inspect uncaught exceptions by using the [TestCoroutineExceptionHandler](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-test/kotlinx.coroutines.test/-test-coroutine-exception-handler/)

You can find the [repository](https://github.com/giorgosneokleous93/SampleCoroutinesTestBlogPost) with the examples at my personal github account.

Feel free to ping me on [Twitter](https://twitter.com/neokleoys2005).

Till next time! 👋