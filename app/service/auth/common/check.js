module.exports = {
    username: (string) => (/^[a-zA-Z]\w{5,15}$/).test(string),
    password: (string) => (/^\w{6,16}$/).test(string)
}
