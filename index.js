const express = require("express");
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("views"));

app.get("/", async (req, res) => {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({ auth: state });

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr } = update;
        if (qr) {
            const qrCodeUrl = await QRCode.toDataURL(qr);
            res.render("index", { qr: qrCodeUrl });
        }

        if (connection === "open") {
            await saveCreds();
            res.send("✅ Paired successfully. You can now download your session ID from Railway.");
        }
    });
});

app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});
