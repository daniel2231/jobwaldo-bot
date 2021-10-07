// Require the necessary discord.js classes
const { Client, Intents } = require("discord.js");
const request = require("request");
const { token } = require("./config.json");
const { MessageEmbed } = require("discord.js");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
let empData;
let newJobs = [];

function ProgrammersGet() {
  for (let i = 1; i < 7; i++) {
    console.log(i);
    request.get(
      {
        url: `https://programmers.co.kr/api/job_positions?page=${i}&order=recent`,
        json: true,
        headers: { "User-Agent": "request" },
      },
      (err, res, data) => {
        if (err) {
          console.log("Error:", err);
        } else if (res.statusCode !== 200) {
          console.log("Status:", res.statusCode);
        } else {
          // data is already parsed as JSON:
          console.log(
            `https://programmers.co.kr/api/job_positions?page=${i}&order=recent`
          );
          empData = data.jobPositions;
          let date_ob = new Date();
          for (let j = 0; j < empData.length; j++) {
            let createdDate = JSON.stringify(empData[j].createdAt);
            console.log(
              createdDate.slice(1, 11),
              date_ob.toISOString().slice(0, 10)
            );
            if (
              createdDate.slice(1, 11) == date_ob.toISOString().slice(0, 10)
            ) {
              console.log("Match");
              newJobs.push(empData[j]);
            }
          }
        }
      }
    );
  }
}

function sendMessage() {
  const channel = client.channels.cache.get("895184692821778465");
  for (let k = 0; k < newJobs.length; k++) {
    console.log("sending Image");
    let imageUrl = newJobs[k].company.logoUrl;
    console.log(imageUrl);
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(newJobs[k].title)
      .setURL(`https://programmers.co.kr${newJobs[k].url}`)
      .setAuthor(
        "프로그래머스",
        "https://programmers.co.kr/assets/bi-symbol-light-49a242793b7a8b540cfc3489b918e3bb2a6724f1641572c14c575265d7aeea38.png",
        `https://programmers.co.kr${newJobs[k].url}`
      )
      .setDescription(newJobs[k].company.name)
      .setThumbnail(imageUrl)
      .addFields(
        { name: "채용 기간", value: newJobs[k].period },
        { name: "경력", value: newJobs[k].career, inline: true },
        {
          name: "연봉",
          value: `${newJobs[k].maxSalary} ~ ${newJobs[k].minSalary}`,
          inline: true,
        },
        { name: "지역", value: newJobs[k].address, inline: true }
      );
    console.log("sending embed");
    channel.send({ embeds: [embed] });
  }
}

async function botFunction() {
  await ProgrammersGet();
  setTimeout(() => {
    sendMessage();
  }, 4000);

  console.log("done");
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");

  botFunction();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const channel = client.channels.cache.get(
    (channel) => channel.id === "895184692821778465"
  );

  if (commandName === "ping") {
    await interaction.reply(
      "안녕하신가! 힘세고 강한 아침, 만일 내게 물어본다면 나는 왈도"
    );
  } else if (commandName === "server") {
    await interaction.reply("도움!");
  }
});

// Login to Discord with your client's token
client.login(token);
