const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb')
const fs = require('fs');
var ObjectId = require('mongodb').ObjectId;
const url = "mongodb+srv://LHSAdmin:Password1@lhsclustor.90zaq.mongodb.net/LHSdev?retryWrites=true&w=majority";
const requestHandler = (req,res) => {

    MongoClient.connect(url,function(err,db){
        let tournamentId = [] ;
        let userId = [] ; 
        let roundId = [] ;      
        if(err) throw err;
        var dbo = db.db('LHSdev');
        var userSelection =  dbo.collection('userselections')
        const newUser = userSelection.find({})
        newUser.toArray(function(err,result){
            if(err) throw err;
            result.forEach(element => {
               const tid = JSON.stringify(element.tournamentId);
               const uid = JSON.stringify(element.userId);
               tournamentId.append(JSON.parse(tid))
               userId.append(JSON.parse(uid))
               roundId.append(element.roundId)
              });
              var set1 = new Set(tournamentId);
              var set2 = new Set(userId)
              var set3 = new Set(roundId)
              
             //get tournament details from tournament collection
             let tournamentinfo = [];
             let tournamentdetails = {};   
              set1.forEach(element => {               
                var query = ObjectId(element)
                    var tournament = dbo.collection('tournaments')
                    tournament.findOne({_id : query},function(err,tournament){
                    if(err) throw err;
                    if(!tournament){
                        return 'Result of ', element , 'not found'
                    }else{                     
                        if(tournamentdetails.name === tournament.name){
                            return "Tournament name : ", tournament.name, " is already resgisterd";
                        }else{
                            tournamentdetails["name"] = tournament.name;
                            tournamentdetails["id"] = tournament._id;
                        }                   
                    //    console.log(tournamentdetails) 
                        
                    }  
                    tournamentinfo.push(tournamentdetails)                           
                })           
              })
              
             //get user details from user collection
             let userinfo = [];
             let userdetails = {} ;
            set2.forEach(element => {            
                var query = ObjectId(element)
                  var user = dbo.collection('users')
                  user.findOne({_id : query},function(err,user){
                    if(err) throw err;
                    if(!user){
                        return 'Result of ', element , 'not found'
                    }else{ 
                        const name = user.firstName +" " +  user.lastName;                    
                        if(userdetails.name === name){
                             return "User name : ", name, " is already resgisterd";
                        }else{
                            userdetails["id"] = user._id;
                            userdetails["name"] = name;   
                        } 
                        // console.log(userdetails)
                    }                 
                })
              })

            //get round details from round collection
            let roundinfo = [];          
            let rounddetails = {}; 
            set3.forEach(element => {              
                var query = ObjectId(element)
                var round = dbo.collection('tournamentrounds')

                round.findOne({_id : query},function(err,round){
                    if(err) throw err;
                    if(!round){
                        return "Result of ", element , ' not found'
                    }else{
                        if(rounddetails.id === round._id){
                            // Console.log("Round name : ", round.name," with tournament id: ", round.tournamentId ," is already resgisterd");
                            return
                        }else{
                            rounddetails["id"] = round._id;
                            rounddetails["name"] = round.name;
                            rounddetails["tournamentId"] = round.tournamentId
                        }                       
                    }
                    // console.log(rounddetails)
                }) 
            })
            res.writeHead(200,{'Content-Type':'application/json'})         
            return res.end(JSON.stringify(set1))
            
        })
    })
}

const server =  http.createServer(requestHandler)

const port = 5000;
const host = 'localhost';
server.listen(port,host)
console.log(`Server is running at localhost:${port}`) 
