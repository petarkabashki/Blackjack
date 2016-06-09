module.exports = function() {
    this.Then(/^I can start a new game$/, function () {
        browser.waitForExist("button#btnNewGame")
        browser.click("button#btnNewGame")
        browser.pause(4000)
    });
};
