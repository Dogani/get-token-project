const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const axios = require('axios');
require('dotenv').config()
const moment = require('moment');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    limit: "5MB"
}));

var apiRoutes = express.Router();
app.use("/api/v1/token", apiRoutes);

async function getToken() {
    const tokenRequest = {
        username: process.env.TOKEN_USERNAME,
        paraphrase: process.env.TOKEN_PASSPHRASE
    };

    const headers = {
        accept: 'application/json',
        'Content-Type': 'application/json'
    };

    try {
        const { data } = await axios.post(process.env.TOKEN_URL, tokenRequest, headers);

        console.log(data);

        if (data.Error === false) {
            return data;
        } else {
            throw new Error("Token Retrieval Failed: " + (data.Message || "Unknown Error"));
        }
    } catch (error) {
        console.error("Token Retrieval Error:", error.message || error);
        return null;
    }
}


apiRoutes.post('/send-with-token', async (req, res) => {
    var DateTrans = new Date();
    var RqDtTm = moment(DateTrans).format("YYYY-MM-DDTHH:mm:ss");
    console.log(`Request Date-Time: ${RqDtTm}`)

    const token = await getToken();

    if (!token) {
        return res.status(500).json({ error: "Failed To Retrieve Token" });
    }

    const payload = {
        name: req.body.name,
        mobile: req.body.mobile,
        designation: req.body.designation,
        mail: req.body.mail,
        token: token.Data.accessToken,
        mesage: token.Message
    };

    res.json(payload);

});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});
