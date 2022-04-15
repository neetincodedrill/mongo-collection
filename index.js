const http = require("http");
const MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const url =
  "mongodb+srv://LHSAdmin:Password1@lhsclustor.90zaq.mongodb.net/LHSdev?retryWrites=true&w=majority";
let array123 = [];

const requestHandler = (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("LHSdev");
    async function userSelection() {
      dbo
        .collection("userselections")
        .find({})
        .toArray((err, result) => {
          if (err) throw err;
          result.map(async (item, index) => {
            const event = item.selectedEvent;
            
            //events data
            const events = await Promise.all(
              event.map(async (d) => {
                return await dbo
                  .collection("events")
                  .findOne({ id: parseInt(d.eventId) })
                  .then((data) => {
                    const eventInfo = {};
                    eventInfo.eventId = d.eventId;
                    eventInfo.raceName = data.raceName;
                    eventInfo.horseName = d.selectedHorse.name;
                    eventInfo.jockeyName = d.selectedHorse.jockey;
                    return eventInfo;
                  });
              })
            );

            var user =await dbo
            .collection("users")
            .findOne({ _id: item.userId })
            .then((data) => {
              return data?.firstName + " " + data?.lastName;
            })

            var email = await dbo
            .collection("users")
            .findOne({ _id: item.userId })
            .then((data) => {
              return data?.email;
            })

            var tournament = await dbo
            .collection("tournaments")
            .findOne({ _id: item.tournamentId })
            .then((data) => {
              return data?.name;
            })

            var round = await dbo
            .collection("tournamentrounds")
            .findOne({ _id: ObjectId(item.roundId) })
            .then((data) => {
              return data?.name;
            })

            var userinfo = {};
            userinfo.user = user;
            userinfo.email = email;
            userinfo.tournament = tournament;
            userinfo.round = round;
            userinfo.events = events
           // console.log(userinfo)

            await array123.push(userinfo);
            await console.log(array123);
          });
        });
     // console.log(array123);
     return await array123;
    }

  

    (async () => {
        console.log(await userSelection())
      })()

  });
};

const server = http.createServer(requestHandler);

const port = 7000;
const host = "localhost";
server.listen(port, host);
console.log(`Server is running at localhost:${port}`);
