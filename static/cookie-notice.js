const COOKIE_SAVED_KEY = "CookieSavedKey"
const COOKIE_SAVED_VALUE = "CookieSavedValue"

console.log(localStorage.getItem(COOKIE_SAVED_KEY))
if (localStorage.getItem(COOKIE_SAVED_KEY) != COOKIE_SAVED_VALUE) {
    getCookieBanner().fadeIn(1000);
} else  {
    getCookieBanner().hide()
}
$(".close-btn").click(function() {
    getCookieBanner().fadeOut(1000);
    savedCookieSeen()
})

function savedCookieSeen() {
    localStorage.setItem(COOKIE_SAVED_KEY, COOKIE_SAVED_VALUE)
}

function getCookieBanner() {
    return $(".cookie-banner")
}