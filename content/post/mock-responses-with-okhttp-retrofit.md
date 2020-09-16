---
title: "Mock Responses with OkHttp & Retrofit"
description: "Mock Testing with Okhttp and Retrofit"
date: "2019-11-25"
aliases:
  - "/2019/11/25/mock-responses-with-okhttp-retrofit/"
author: "Giorgos Neokleous"
---

> This blog post does not explore Retrofit nor OkHttp and all their glory. Instead, we are looking into OkHttp's testing API and how to use that to provide confidence into our codebase.

Testing is often daunting but crucial for software development. I am going to keep this post short and sweet. We will explore together the [OkHttp‘s](https://square.github.io/okhttp/) “MockWebServer” and how to integrate with Retrofit.

**Target Audience:** Retrofit Users

### The Why?

We need our tests non-flaky, and reliable! What that means is:

1. Our tests should run in isolation
2. Our tests should not be affected by external factors
3. Our tests conditions are controllable

A nice explanation of a flaky test from the "[Flaky Tests - A War that Never Ends](https://hackernoon.com/flaky-tests-a-war-that-never-ends-9aa32fdef359)"
> A flaky test is a test which could fail or pass for the same configuration

All the above points are needed so that we can control and test different scenarios. For example, if the tests are making a real network call, then they could fail when the network connectivity is lost.

### Setup 🔨

You need to add the following dependency in `build.gradle`.

```groovy
testImplementation("com.squareup.okhttp3:mockwebserver:see.latest.version")
```

Explore more about MockWebServer dependency at the [Github Repository](https://github.com/square/okhttp/tree/master/mockwebserver).

### Explore 🛫

The *MockWebServer* is really powerful and provides us with some incredible APIs to ease the pain when testing such features.

**Some of the highlights are:**
- Mocking Responses
- Throttling for bodies
- Throttling for headers
- Many many more

From the Readme of [MockWebServer](https://github.com/square/okhttp/tree/master/mockwebserver):
> This library makes it easy to test that your app Does The Right Thing when it makes HTTP and HTTPS calls. It lets you specify which responses to return and then verify that requests were made as expected.

#### Create the mock web server 🏗
```kotlin
val mockWebServer = MockWebServer()
```

When you are ready to start your tests, make sure you “Start” the mock server like:

```kotlin 
mockWebServer.start()
```

#### Mocking a response
```kotlin
MockResponse()
   .setResponseCode(HttpURLConnection.HTTP_OK)
   .setBody(""{\"status\":\"error\",\"code\":\"responseCode\"}"
")     
```

To instruct the server to return the mocked response, you need to [enqueue](https://square.github.io/okhttp/4.x/mockwebserver/okhttp3.mockwebserver/-mock-web-server/enqueue/) the mock response such as:
```kotlin 
mockWebServer.enqueue(mockResponse)
```

For further studying, head to MockWebServer’s Javadoc [here](https://square.github.io/okhttp/4.x/mockwebserver/okhttp3.mockwebserver/-mock-web-server/).


### Basic Setup for unit tests

The following setup will make sure that you start your mock server and shut it down between tests.

```kotlin
class YourTest {
 lateinit var mockWebServer: MockWebServer

    @Before
    fun setUp() {
        mockWebServer = MockWebServer()
        mockWebServer.start()
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
    }
}
```

### MockWebServer with Retrofit
Now, let’s explore, how to use Retrofit with all the above.

Basic setup for Retrofit looks like:
```kotlin
Retrofit retrofit = new Retrofit.Builder()
    .baseUrl("https://ourapi.com/")
    .build()
```

We are used to passing a String to the method `.baseUrl(string)`. However, there is an overload which takes an [HttpUrl](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-http-url/) object. The HttpUrl object is what the mock web server exposes and we could use to integrate it into tests.

If we actually check the [source code](https://github.com/square/retrofit/blob/master/retrofit/src/main/java/retrofit2/Retrofit.java#L490) the `.baseUrl(string)` internally looks like:

```java
public Builder baseUrl(String baseUrl) {
    checkNotNull(baseUrl, "baseUrl == null");
    return baseUrl(HttpUrl.get(baseUrl));
}
```

What we then pass for the base URL:
- **Production**: `HttpUrl.get("https://ourapi.com/")`
- **Tests**: `mockWebServer.url("/")`

#### The Transformation
First, pass the above to your Retrofit builder and then start receiving the mock responses and leveraging the test environment for your benefit.

As you can see from the examples below, we should now inject the HttpUrl to allow the MockWebServer to do its magic.

**Before**
```kotlin
class OurApi(
    private val baseUrl: String = "https://ourapi.com/"
) {
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
}
```

**After**
```kotlin
class OurApi(
    private val baseUrl: HttpUrl = HttpUrl.get("https://ourapi.com/")
) {
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
}
```

That’s it really, thanks for reading the post! 

Happy coding and testing!

Feel free to ping me on [twitter](https://twitter.com/neokleoys2005).

Till next time! 👋

(👇 check out the bonus section below 👇)

### Bonus
You can place different responses in your Test Resources which you can instruct the MockWebServer instance to return.

**Steps:**

1. Create a folder under the following path:`~/${MODULE}/src/test/resources`
2. Place there the responses as JSON files such as: `error.json`
3. From your unit test read the file as a String and pass to the mock web server instance

**Read json files as Strings**
```kotlin
object FileUtils {
    fun readTestResourceFile(fileName: String): String {
        val fileInputStream = javaClass.classLoader?.getResourceAsStream(fileName)
        return fileInputStream?.bufferedReader()?.readText() ?: ""
    }
}

// pass to mock web server
 val response = MockResponse()
response.setResponseCode(HttpURLConnection.HTTP_OK)
response.setBody(FileUtils.readTestResourceFile("error.json"))
```