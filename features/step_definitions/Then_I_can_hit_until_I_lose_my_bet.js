module.exports = function() {
    this.Then(/^I can hit until I lose my bet$/, function () {
        browser.waitForExist("button#btnHit")
        browser.click("button#btnHit")
        browser.pause(1000)
    });
};
