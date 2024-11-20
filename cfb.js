/*
Garrett Mastin
Last Edited: 11/19/2024
College Football Bowl Game Prediction Program

This Program is designed to gather data from a Google Form using the Google Sheets API
to then compare it to the data from the College Football API to see how many correct predictions
that the set of users in the Google From made. The program will then output the total points for each user 
and add the points for each user to a database. This Database will then be used on the front in to display the
total points for each user in a leaderboard format.
*/

/*-----------------Google Sheets API-----------------*/
// Import the Google API client library
const { google } = require("googleapis");

const service = google.sheets("v4");
const credentials = require("./credentials.json");

// Configure auth client
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);

(async function () {
    try {

        // Authorize the client
        const token = await authClient.authorize();

        // Set the client credentials
        authClient.setCredentials(token);

        // Get the rows
        const res = await service.spreadsheets.values.get({
            auth: authClient,
            //this is the id of the google form spreadsheet data (in the url of the spreadsheet)
            spreadsheetId: "your_spreadsheet_id",
            range: "A:M",//can adjust this to sepific rows EX: A:B, A:E, etc
        });

        // All of the answers
        const answers_json = [];

        // Set rows to equal the rows
        const rows = res.data.values;

        // Check if we have any data and if we do add it to our answers array
        if (rows.length) {

            // Remove the headers
            rows.shift()

            // For each row
            for (const row of rows) {
              // Separate user information into its own object
                const userInfo = {
                TimeStamp: row[0],
                FirstName: row[1],
                LastName: row[2]
                };
            
              // Separate result-related details into another object
                const gameDetails = {
                BowlGame1: row[4],
                BowlGame2: row[5],
                BowlGame3: row[6],
                BowlGame4: row[7],
                BowlGame5: row[8],
                BowlGame6: row[9],
                BowlGame7: row[10],
                BowlGame8: row[11],
                BowlGame9: row[12],
                BowlGame10: row[13]
                };
                
              // Push the combined data as an object with two sections
                answers_json.push({
                userInfo: userInfo,
                gameDetails: gameDetails
                });
            }
            

        } else {
            console.log("No data found.");  
        }

        // Saved the answers
        fs.writeFileSync("answers.json", JSON.stringify(answers_json), function (err, file) {
            if (err) throw err;
            console.log("Saved to answers.json");
        });

    } catch (error) {

        // Log the error
        console.log(error);

        // Exit the process with error
        process.exit(1);

    }

})();

/*-----------------College Football API-----------------*/
// Import the College Football API client library
const cfb = require('cfb.js');
const fs = require('fs');
const defaultClient = cfb.ApiClient.instance;

// Configure API key authorization: ApiKeyAuth
let ApiKeyAuth = defaultClient.authentications['ApiKeyAuth'];
ApiKeyAuth.apiKey = 'Bearer your_api_key';

var apiInstance = new cfb.GamesApi();

let year = 2024;

// Function to fetch games
async function fetchGames() {
  try {
    //this sets the year of the games that can be searched
    const games = await apiInstance.getGames(year);

    //this adjust the search criteria
    const opts = { 
      week: 13,
      seasonType: "regular",
      conference: "SEC"
    };

    //this gets the games with the search criteria
    const gamesWithOpts = await apiInstance.getGames(year, opts);

    // Write the games data to results.json
    fs.writeFile('results.json', JSON.stringify(gamesWithOpts, null, 2), (err) => {
      if (err) {
        console.error('Error writing to results.json:', err);
      } else{
        console.log('Games data saved to results.json');
      }
    });
    } catch (error) {
      console.error('Error calling API:', error);
    }
}

//calls the function to fetch the games
fetchGames();

// Read results.json
fs.readFile('results.json', 'utf-8', (err, resultsData) => {
  if (err) {
    console.error('Error reading results.json:', err);
    return;
  }
  // Parse the JSON data into result
  const result = JSON.parse(resultsData);

  // Read answers.json
  fs.readFile('answers.json', 'utf-8', (err, answersData) => {
    if (err) {
      console.error('Error reading answers.json:', err);
      return;
    }

    let answer = JSON.parse(answersData);

    //defines what data that the code below will look at 
    const bowlGames = ['BowlGame1', 'BowlGame2', 'BowlGame3', 'BowlGame4', 'BowlGame5', 'BowlGame6', 'BowlGame7', 'BowlGame8', 'BowlGame9', 'BowlGame10'];

    // Iterate through each user
    for (let current_user = 0; current_user < answer.length; current_user++){
      //restarts the total points for each user at the beginning of a new user
      let totalPointsToPlayer = 0;
      //restarts the winner at the beginning of a new user
      let winner;

      // Iterate through first 6 bowl games
      for (let current_user_choice = 0; current_user_choice < 9; current_user_choice++){
          let userPrediction = answer[current_user].gameDetails[bowlGames[current_user_choice]];
          let correctPrediction = false;

          // Check prediction against each game result
          for (let i = 0; i < result.length; i++){

            //finds winner of current game
            if(result[i].homePoints > result[i].awayPoints){
              winner = result[i].homeTeam;
            }else if(result[i].homePoints < result[i].awayPoints){
              winner = result[i].awayTeam;
            }

            //checks if user got the correct prediction
            if(winner === answer[current_user].gameDetails[bowlGames[current_user_choice]]){
                correctPrediction = true;
              break;
            }else{
              correctPrediction = false;
            }
          }

          // Award point if prediction was correct
          if (correctPrediction) {
              totalPointsToPlayer++;
              console.log(`Correct prediction: ${userPrediction}`);
          } else {
              console.log(`Incorrect prediction: ${userPrediction}`);
          }
      }
      //logs the total points for each user
      console.log(`Total points for ${answer[current_user].userInfo.FirstName}: ${totalPointsToPlayer}\n`);
    }
    
  });
});
