const { Client, GatewayIntentBits } = require('discord.js');
const admin = require('firebase-admin');

// 🔥 FIREBASE KEY
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔥 BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  setInterval(checkCommands, 4000);
});

// 🔥 LEGGE COMANDI DA FIREBASE
async function checkCommands() {
  const snapshot = await db.collection("commands").get();

  snapshot.forEach(async (doc) => {
    const data = doc.data();

    try {
      const guild = client.guilds.cache.get(data.guildId);
      const member = await guild.members.fetch(data.userId);

      if (data.type === "ban") {
        await member.ban({ reason: "Ban dal sito" });
        console.log("🔨 Bannato:", member.user.tag);
      }

      if (data.type === "warn") {
        await member.send("⚠️ Hai ricevuto un warning dallo staff.");
        console.log("⚠️ Warn mandato");
      }

      // cancella comando
      await doc.ref.delete();

    } catch (err) {
      console.error("Errore:", err);
    }
  });
}

client.login("METTI_IL_TOKEN_DEL_BOT");
