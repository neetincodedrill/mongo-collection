const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const url ="mongodb+srv://LHSAdmin:Password1@lhsclustor.90zaq.mongodb.net/LHSdev?retryWrites=true&w=majority";

const requestHandler = (req, res) => { 
    MongoClient.connect(url, async(err, db)=>{
      if (err) throw err;
      var dbo = db.db("LHSdev");
      let array = [];      
      let user = [];
      
      //get all the userselection details
      function userSelection(){
          return new Promise((resolve,reject) => {
            dbo
            .collection("userselections")
            .find({})
            .toArray(async (err, result) => {
              if (err){
                  reject(err)
              };
               result.map(async(item,index) => {
                 //push into global user array
                 user.push(item)
             })
               resolve(array)
            })
          })
      }
      
      //use the useselection data to get all the events and user data
      const eventdetails = async() => {
        const a = await userSelection() 
           user.map(async(item) => { 

            var userName = await dbo.collection("users").findOne({ _id: item.userId }).then((data) => {
              return data?.firstName + " " + data?.lastName;
            })

            var emailId =  await dbo.collection("users").findOne({ _id: item.userId }).then((data) => {
              return data?.email;
            })

            var tournament = await dbo.collection("tournaments").findOne({ _id: item.tournamentId }).then((data) => {
              return data?.name;
            })

            var round = await dbo.collection("tournamentrounds").findOne({ _id: ObjectId(item.roundId) }).then((data) => {
              return data?.name;
            })

            const events = await Promise.all(
              item.selectedEvent.map(async (d) => {
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

            let eventInfo = {}
            eventInfo.name = userName;
            eventInfo.email = emailId;
            eventInfo.tournament = tournament;
            eventInfo.round = round;
            eventInfo.events = events
            array.push(eventInfo)
            return eventInfo
           })
         console.log(array)
      }
     eventdetails()

    });
};

const server = http.createServer(requestHandler);

const port = 4000;
const host = "localhost";
server.listen(port, host);
console.log(`Server is running at localhost:${port}`);

