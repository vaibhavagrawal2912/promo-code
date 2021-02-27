module.exports = () => {
    const POSSIBILITY = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let api = {};
    api.generateCode = () => {
        var text = "";
        for (var i = 0; i < 6; i++) {
            text += POSSIBILITY.charAt(Math.floor(Math.random() * POSSIBILITY.length));
        }
        return text;
    }
    return api;
}