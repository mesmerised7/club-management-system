function generateCode(length = 6) {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < length; i++) {

        const randomIndex =
            Math.floor(Math.random() * characters.length);

        code += characters[randomIndex];
    }

    return code;
}

module.exports = generateCode;